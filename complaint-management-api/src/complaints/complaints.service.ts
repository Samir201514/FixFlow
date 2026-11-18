import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity.js';
import { CreateComplaintDto } from './dto/create-complaint.dto.js';
import { UpdateComplaintDto } from './dto/update-complaint.dto.js';
import { ReviewComplaintDto } from './dto/review-complaint.dto.js';
import { ReopenComplaintDto } from './dto/reopen-complaint.dto.js';
import { ComplaintQueryDto } from './dto/complaint-query.dto.js';
import { ComplaintStatus } from './enums/complaint-status.enum.js';
import { assertTransition } from './utils/complaint-transition.js';
import {
  buildTemporaryTrackingCode,
  buildTrackingCode,
} from './utils/tracking-code.js';
import { Category } from '../categories/entities/category.entity.js';
import { ComplaintAssignment } from '../complaint-assignments/entities/complaint-assignment.entity.js';
import { AssignmentStatus } from '../complaint-assignments/enums/assignment-status.enum.js';
import { ComplaintTag } from '../complaint-tags/entities/complaint-tag.entity.js';
import { ComplaintTagService } from '../complaint-tags/complaint-tags.service.js';
import { ComplaintHistoryService } from '../complaint-history/complaint-history.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';
import { UserRoles as Role } from '../common/enums/user-roles.enum.js';
import type { AuthUser } from '../common/interfaces/auth-user.interface.js';
import { paginate } from '../common/helpers/paginate.helper.js';

const ACTIVE_STATUSES = [AssignmentStatus.ACTIVE, AssignmentStatus.ACCEPTED];

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ComplaintAssignment)
    private readonly assignmentRepo: Repository<ComplaintAssignment>,
    private readonly dataSource: DataSource,
    private readonly tagsService: ComplaintTagService,
    private readonly historyService: ComplaintHistoryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------- access check, other modules (attachments, tags) can reuse it ----------

  async assertCanView(complaintId: number, user: AuthUser): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({ where: { complaintId } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    if (user.role === Role.ADMIN) return complaint;
    if (complaint.reporterId === user.userId) return complaint;

    if (user.role === Role.STAFF) {
      // any assignment counts, so staff can still read it after finishing the work
      const assigned = await this.assignmentRepo
        .createQueryBuilder('a')
        .innerJoin('a.staffProfile', 'sp')
        .where('a.complaintId = :complaintId', { complaintId })
        .andWhere('sp.userId = :userId', { userId: user.userId })
        .getExists();
      if (assigned) return complaint;
    }

    throw new ForbiddenException('You do not have access to this complaint');
  }

  // ---------- create ----------

  async create(reporterId: number, dto: CreateComplaintDto) {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: dto.categoryId },
    });
    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const complaint = await qr.manager.save(
        qr.manager.create(Complaint, {
          reporterId,
          categoryId: dto.categoryId,
          title: dto.title,
          description: dto.description,
          location: dto.location,
          priority: category.defaultPriority,
          status: ComplaintStatus.SUBMITTED,
          trackingCode: buildTemporaryTrackingCode(),
        }),
      );

      complaint.trackingCode = buildTrackingCode(
        complaint.complaintId,
        complaint.createdAt,
      );
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: reporterId,
        oldStatus: null,
        newStatus: ComplaintStatus.SUBMITTED,
        remarks: 'Complaint submitted',
      });

      if (dto.tagIds && dto.tagIds.length > 0) {
        // an unknown tag throws 404 here and the whole complaint is rolled back
        await this.tagsService.addTags(
          qr.manager,
          complaint.complaintId,
          dto.tagIds,
          reporterId,
        );
      }

      await qr.commitTransaction();
      return { message: 'Complaint created successfully', data: complaint };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------- lists ----------

  async findAll(query: ComplaintQueryDto) {
    return await this.buildListQuery(query);
  }

  async findMine(reporterId: number, query: ComplaintQueryDto) {
    // always filtered by the reporter, otherwise users would see each other's complaints
    return await this.buildListQuery(query, reporterId);
  }

  private async buildListQuery(query: ComplaintQueryDto, reporterId?: number) {
    const { page = 1, limit = 10 } = query;

    const qb = this.complaintRepo
      .createQueryBuilder('c')
      .innerJoin('c.category', 'cat')
      .addSelect(['cat.categoryId', 'cat.name'])
      .innerJoin('c.reporter', 'u')
      .addSelect(['u.userId', 'u.name']);

    if (reporterId !== undefined) {
      qb.andWhere('c.reporterId = :reporterId', { reporterId });
    }
    if (query.status) qb.andWhere('c.status = :status', { status: query.status });
    if (query.priority) {
      qb.andWhere('c.priority = :priority', { priority: query.priority });
    }
    if (query.categoryId) {
      qb.andWhere('c.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query.tagId) {
      // sub query: ids of complaints that carry the tag
      const withTag = qb
        .subQuery()
        .select('ct.complaintId')
        .from(ComplaintTag, 'ct')
        .where('ct.tagId = :tagId')
        .getQuery();
      qb.andWhere(`c.complaintId IN ${withTag}`).setParameter('tagId', query.tagId);
    }

    if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
      throw new BadRequestException('from must not be after to');
    }
    if (query.from) {
      qb.andWhere('c.createdAt >= :fromDate', { fromDate: new Date(query.from) });
    }
    if (query.to) {
      // "to" means the whole day, so compare with the start of the next day
      const toExclusive = new Date(query.to);
      toExclusive.setUTCHours(0, 0, 0, 0);
      toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);
      qb.andWhere('c.createdAt < :toExclusive', { toExclusive });
    }

    if (query.search) {
      const term = `%${query.search.replace(/[\\%_]/g, '\\$&')}%`;
      qb.andWhere('(c.title ILIKE :term OR c.trackingCode ILIKE :term)', { term });
    }

    const [rows, total] = await qb
      .orderBy('c.createdAt', 'DESC')
      .addOrderBy('c.complaintId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const items = rows.map((c) => ({
      complaintId: c.complaintId,
      trackingCode: c.trackingCode,
      title: c.title,
      location: c.location,
      priority: c.priority,
      status: c.status,
      createdAt: c.createdAt,
      category: { categoryId: c.category.categoryId, name: c.category.name },
      reporter: { userId: c.reporter.userId, name: c.reporter.name },
    }));

    return {
      message: 'Complaints retrieved successfully',
      ...paginate(items, total, page, limit),
    };
  }

  // ---------- single complaint ----------

  async findOne(id: number, user: AuthUser) {
    await this.assertCanView(id, user);
    const data = await this.loadDetail(id);
    return { message: 'Complaint retrieved successfully', data };
  }

  async findByTrackingCode(trackingCode: string, user: AuthUser) {
    const found = await this.complaintRepo.findOne({ where: { trackingCode } });
    if (!found) throw new NotFoundException('Complaint not found');
    return await this.findOne(found.complaintId, user);
  }

  private async loadDetail(id: number) {
    const complaint = await this.complaintRepo
      .createQueryBuilder('c')
      .innerJoin('c.category', 'cat')
      .addSelect(['cat.categoryId', 'cat.name'])
      .innerJoin('c.reporter', 'u')
      .addSelect(['u.userId', 'u.name'])
      .leftJoinAndSelect('c.complaintTags', 'ct')
      .leftJoinAndSelect('ct.tag', 't')
      .leftJoinAndSelect(
        'c.assignments',
        'a',
        'a.status IN (:...activeStatuses)',
        { activeStatuses: ACTIVE_STATUSES },
      )
      .leftJoin('a.staffProfile', 'sp')
      .addSelect(['sp.staffProfileId', 'sp.designation'])
      .leftJoin('sp.user', 'su')
      .addSelect(['su.userId', 'su.name'])
      .where('c.complaintId = :id', { id })
      .getOne();

    if (!complaint) throw new NotFoundException('Complaint not found');

    const { complaintTags, assignments, ...rest } = complaint;
    const current = assignments?.[0];

    return {
      ...rest,
      tags: (complaintTags ?? []).map((ct) => ({
        tagId: ct.tag.tagId,
        name: ct.tag.name,
      })),
      currentAssignment: current
        ? {
            assignmentId: current.assignmentId,
            status: current.status,
            assignedAt: current.assignedAt,
            staffProfile: {
              staffProfileId: current.staffProfile.staffProfileId,
              designation: current.staffProfile.designation,
              name: current.staffProfile.user.name,
            },
          }
        : null,
    };
  }

  async getHistory(id: number, user: AuthUser) {
    await this.assertCanView(id, user);
    const data = await this.historyService.findByComplaint(id);
    return { message: 'History retrieved successfully', data };
  }

  // ---------- update / delete ----------

  async update(id: number, dto: UpdateComplaintDto, user: AuthUser) {
    const complaint = await this.loadEditable(id, user);

    if (dto.categoryId !== undefined) {
      await this.assertActiveCategory(this.categoryRepo.manager, dto.categoryId);
    }

    // priority is not recalculated here, an admin changes it through review
    Object.assign(complaint, dto);
    await this.complaintRepo.save(complaint);

    return { message: 'Complaint updated successfully', data: complaint };
  }

  async remove(id: number, user: AuthUser) {
    const complaint = await this.loadEditable(id, user);

    const activeCount = await this.assignmentRepo.count({
      where: { complaintId: complaint.complaintId, status: In(ACTIVE_STATUSES) },
    });
    if (activeCount > 0) {
      throw new ConflictException('The complaint has an active assignment');
    }

    await this.complaintRepo.softDelete(complaint.complaintId);
    return { message: 'Complaint deleted successfully', data: null };
  }

  // shared by update and remove: 404, then 403, then the status rules (409)
  private async loadEditable(id: number, user: AuthUser): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({ where: { complaintId: id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    if (user.role !== Role.ADMIN && complaint.reporterId !== user.userId) {
      throw new ForbiddenException('You can only change your own complaints');
    }
    if (complaint.status === ComplaintStatus.CLOSED) {
      throw new ConflictException('A closed complaint cannot be changed');
    }
    if (user.role === Role.USER && complaint.status !== ComplaintStatus.SUBMITTED) {
      throw new ConflictException(
        'You can edit a complaint only while it is SUBMITTED',
      );
    }
    return complaint;
  }

  // ---------- status workflow ----------

  async review(id: number, dto: ReviewComplaintDto, admin: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const complaint = await this.lockComplaint(qr.manager, id);
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.UNDER_REVIEW, Role.ADMIN);

      if (dto.categoryId !== undefined) {
        await this.assertActiveCategory(qr.manager, dto.categoryId);
        complaint.categoryId = dto.categoryId;
      }
      if (dto.priority) complaint.priority = dto.priority;
      complaint.status = ComplaintStatus.UNDER_REVIEW;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: id,
        changedById: admin.userId,
        oldStatus,
        newStatus: ComplaintStatus.UNDER_REVIEW,
        remarks: dto.remarks ?? 'Complaint is under review',
      });

      await this.notificationsService.createMany(qr.manager, [
        {
          userId: complaint.reporterId,
          complaintId: id,
          type: NotificationType.STATUS_CHANGED,
          title: 'Complaint under review',
          message: `Your complaint ${complaint.trackingCode} is being reviewed.`,
        },
      ]);

      await qr.commitTransaction();
      return { message: 'Complaint reviewed successfully', data: complaint };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async confirm(id: number, user: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const complaint = await this.lockComplaint(qr.manager, id);
      if (complaint.reporterId !== user.userId) {
        throw new ForbiddenException('Only the reporter can confirm');
      }
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.CLOSED, Role.USER);

      complaint.status = ComplaintStatus.CLOSED;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: id,
        changedById: user.userId,
        oldStatus,
        newStatus: ComplaintStatus.CLOSED,
        remarks: 'Resolution confirmed by the reporter',
      });

      const lastAssignment = await this.findLatestAssignment(qr.manager, id);
      if (lastAssignment) {
        await this.notificationsService.createMany(qr.manager, [
          {
            userId: lastAssignment.assignedById,
            complaintId: id,
            type: NotificationType.STATUS_CHANGED,
            title: 'Complaint closed',
            message: `Complaint ${complaint.trackingCode} was closed by the reporter.`,
          },
        ]);
      }

      await qr.commitTransaction();
      return { message: 'Complaint closed successfully', data: complaint };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async reopen(id: number, dto: ReopenComplaintDto, user: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const complaint = await this.lockComplaint(qr.manager, id);
      if (complaint.reporterId !== user.userId) {
        throw new ForbiddenException('Only the reporter can reopen');
      }
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.REOPENED, Role.USER);

      complaint.status = ComplaintStatus.REOPENED;
      complaint.resolvedAt = null;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: id,
        changedById: user.userId,
        oldStatus,
        newStatus: ComplaintStatus.REOPENED,
        remarks: dto.reason,
      });

      const lastAssignment = await this.findLatestAssignment(qr.manager, id);
      if (lastAssignment) {
        await this.notificationsService.createMany(qr.manager, [
          {
            userId: lastAssignment.assignedById,
            complaintId: id,
            type: NotificationType.REOPENED,
            title: 'Complaint reopened',
            message: `Complaint ${complaint.trackingCode} was reopened: ${dto.reason}`,
          },
        ]);
      }

      await qr.commitTransaction();
      return { message: 'Complaint reopened successfully', data: complaint };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------- helpers ----------

  // no relations or joins here, FOR UPDATE does not work with outer joins
  private async lockComplaint(manager: EntityManager, id: number) {
    const complaint = await manager.findOne(Complaint, {
      where: { complaintId: id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  private async assertActiveCategory(manager: EntityManager, categoryId: number) {
    const category = await manager.findOne(Category, { where: { categoryId } });
    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async findLatestAssignment(manager: EntityManager, complaintId: number) {
    return await manager.findOne(ComplaintAssignment, {
      where: { complaintId },
      order: { assignedAt: 'DESC', assignmentId: 'DESC' },
    });
  }
}
