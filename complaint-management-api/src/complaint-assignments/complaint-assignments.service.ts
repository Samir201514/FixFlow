import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ComplaintAssignment } from './entities/complaint-assignment.entity.js';
import { AssignmentStatus } from './enums/assignment-status.enum.js';
import { AssignComplaintDto } from './dto/assign-complaint.dto.js';
import { ReassignDto } from './dto/reassign.dto.js';
import { RejectAssignmentDto } from './dto/reject-assignment.dto.js';
import { ProgressDto } from './dto/progress.dto.js';
import { ResolveAssignmentDto } from './dto/resolve-assignment.dto.js';
import { AssignmentQueryDto } from './dto/assignment-query.dto.js';
import { Complaint } from '../complaints/entities/complaint.entity.js';
import { ComplaintStatus } from '../complaints/enums/complaint-status.enum.js';
import { assertTransition } from '../complaints/utils/complaint-transition.js';
import { Category } from '../categories/entities/category.entity.js';
import { StaffProfile } from '../staff-profile/entities/staff-profile.entity.js';
import { ComplaintHistoryService } from '../complaint-history/complaint-history.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';
import { UserRoles as Role } from '../common/enums/user-roles.enum.js';
import type { AuthUser } from '../common/interfaces/auth-user.interface.js';
import { paginate } from '../common/helpers/paginate.helper.js';

const ACTIVE_STATUSES = [AssignmentStatus.ACTIVE, AssignmentStatus.ACCEPTED];

@Injectable()
export class ComplaintAssignmentService {
  constructor(
    @InjectRepository(ComplaintAssignment)
    private readonly assignmentRepo: Repository<ComplaintAssignment>,
    @InjectRepository(StaffProfile)
    private readonly staffRepo: Repository<StaffProfile>,
    private readonly dataSource: DataSource,
    private readonly historyService: ComplaintHistoryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------- admin: assign / reassign ----------

  // touches 4 tables (assignments, complaints, history, notifications) in one transaction
  async assign(dto: AssignComplaintDto, admin: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const complaint = await this.lockComplaint(qr.manager, dto.complaintId);
      const oldStatus = complaint.status;

      // a first assignment is only possible from UNDER_REVIEW (reassign handles the rest)
      if (oldStatus !== ComplaintStatus.UNDER_REVIEW) {
        throw new ConflictException(
          `Cannot change status from ${oldStatus} to ${ComplaintStatus.ASSIGNED}`,
        );
      }

      const alreadyAssigned = await qr.manager.exists(ComplaintAssignment, {
        where: { complaintId: complaint.complaintId, status: In(ACTIVE_STATUSES) },
      });
      if (alreadyAssigned) {
        throw new ConflictException('The complaint already has an active assignment');
      }

      const profile = await this.checkStaffForComplaint(
        qr.manager,
        complaint,
        dto.staffProfileId,
      );

      // table 1: assignments
      const assignment = await qr.manager.save(
        qr.manager.create(ComplaintAssignment, {
          complaintId: complaint.complaintId,
          staffProfileId: profile.staffProfileId,
          assignedById: admin.userId,
          status: AssignmentStatus.ACTIVE,
          assignmentNote: dto.assignmentNote ?? null,
        }),
      );

      // table 2: complaints
      complaint.status = ComplaintStatus.ASSIGNED;
      await qr.manager.save(complaint);

      // table 3: complaint_history
      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: admin.userId,
        oldStatus,
        newStatus: ComplaintStatus.ASSIGNED,
        remarks: dto.assignmentNote ?? `Assigned to ${profile.user.name}`,
      });

      // table 4: notifications
      await this.notificationsService.createMany(qr.manager, [
        {
          userId: complaint.reporterId,
          complaintId: complaint.complaintId,
          type: NotificationType.ASSIGNED,
          title: 'Complaint assigned',
          message: `Your complaint ${complaint.trackingCode} was assigned to ${profile.user.name}.`,
        },
        {
          userId: profile.userId,
          complaintId: complaint.complaintId,
          type: NotificationType.ASSIGNED,
          title: 'New task',
          message: `You were assigned complaint ${complaint.trackingCode}.`,
        },
      ]);

      await qr.commitTransaction();
      return {
        message: 'Complaint assigned successfully',
        data: { ...assignment, complaintStatus: complaint.status },
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async reassign(id: number, dto: ReassignDto, admin: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { assignment: oldRow, complaint } = await this.loadLocked(qr.manager, id);

      if (!ACTIVE_STATUSES.includes(oldRow.status)) {
        throw new ConflictException('Only an active assignment can be reassigned');
      }
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.ASSIGNED, Role.ADMIN);

      if (dto.staffProfileId === oldRow.staffProfileId) {
        throw new BadRequestException('Choose a different staff member');
      }
      const newProfile = await this.checkStaffForComplaint(
        qr.manager,
        complaint,
        dto.staffProfileId,
      );
      const oldProfile = await qr.manager.findOne(StaffProfile, {
        where: { staffProfileId: oldRow.staffProfileId },
      });

      // close the old row first, the partial unique index allows only one live row
      oldRow.status = AssignmentStatus.REASSIGNED;
      oldRow.unassignedAt = new Date();
      await qr.manager.save(oldRow);

      const newRow = await qr.manager.save(
        qr.manager.create(ComplaintAssignment, {
          complaintId: complaint.complaintId,
          staffProfileId: newProfile.staffProfileId,
          assignedById: admin.userId,
          status: AssignmentStatus.ACTIVE,
          assignmentNote: dto.assignmentNote ?? null,
        }),
      );

      complaint.status = ComplaintStatus.ASSIGNED;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: admin.userId,
        oldStatus,
        newStatus: ComplaintStatus.ASSIGNED,
        remarks: dto.remarks ?? `Reassigned to ${newProfile.user.name}`,
      });

      const notifications = [
        {
          userId: complaint.reporterId,
          complaintId: complaint.complaintId,
          type: NotificationType.ASSIGNED,
          title: 'Complaint reassigned',
          message: `Your complaint ${complaint.trackingCode} was reassigned to ${newProfile.user.name}.`,
        },
        {
          userId: newProfile.userId,
          complaintId: complaint.complaintId,
          type: NotificationType.ASSIGNED,
          title: 'New task',
          message: `You were assigned complaint ${complaint.trackingCode}.`,
        },
      ];
      if (oldProfile) {
        notifications.push({
          userId: oldProfile.userId,
          complaintId: complaint.complaintId,
          type: NotificationType.STATUS_CHANGED,
          title: 'Assignment withdrawn',
          message: `Complaint ${complaint.trackingCode} was given to another staff member.`,
        });
      }
      await this.notificationsService.createMany(qr.manager, notifications);

      await qr.commitTransaction();
      return { message: 'Complaint reassigned successfully', data: newRow };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------- staff: accept / reject / progress / resolve ----------

  async accept(id: number, user: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { assignment, complaint } = await this.loadOwned(qr.manager, id, user);

      if (assignment.status !== AssignmentStatus.ACTIVE) {
        throw new ConflictException('The assignment is not waiting for a response');
      }
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.IN_PROGRESS, Role.STAFF);

      assignment.status = AssignmentStatus.ACCEPTED;
      assignment.respondedAt = new Date();
      await qr.manager.save(assignment);

      complaint.status = ComplaintStatus.IN_PROGRESS;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: user.userId,
        oldStatus,
        newStatus: ComplaintStatus.IN_PROGRESS,
        remarks: 'Assignment accepted',
      });

      await this.notificationsService.createMany(qr.manager, [
        {
          userId: complaint.reporterId,
          complaintId: complaint.complaintId,
          type: NotificationType.STATUS_CHANGED,
          title: 'Work has started',
          message: `Work on your complaint ${complaint.trackingCode} has started.`,
        },
        {
          userId: assignment.assignedById,
          complaintId: complaint.complaintId,
          type: NotificationType.STATUS_CHANGED,
          title: 'Assignment accepted',
          message: `The assignment for complaint ${complaint.trackingCode} was accepted.`,
        },
      ]);

      await qr.commitTransaction();
      return { message: 'Assignment accepted', data: assignment };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async reject(id: number, dto: RejectAssignmentDto, user: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { assignment, complaint } = await this.loadOwned(qr.manager, id, user);

      if (assignment.status !== AssignmentStatus.ACTIVE) {
        throw new ConflictException('The assignment is not waiting for a response');
      }
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.UNDER_REVIEW, Role.STAFF);

      const now = new Date();
      assignment.status = AssignmentStatus.REJECTED;
      assignment.rejectionReason = dto.reason;
      assignment.respondedAt = now;
      assignment.unassignedAt = now;
      await qr.manager.save(assignment);

      complaint.status = ComplaintStatus.UNDER_REVIEW;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: user.userId,
        oldStatus,
        newStatus: ComplaintStatus.UNDER_REVIEW,
        remarks: `Rejected: ${dto.reason}`,
      });

      await this.notificationsService.createMany(qr.manager, [
        {
          userId: assignment.assignedById,
          complaintId: complaint.complaintId,
          type: NotificationType.STATUS_CHANGED,
          title: 'Assignment rejected',
          message: `The assignment for complaint ${complaint.trackingCode} was rejected: ${dto.reason}`,
        },
      ]);

      await qr.commitTransaction();
      return { message: 'Assignment rejected', data: assignment };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async progress(id: number, dto: ProgressDto, user: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { assignment, complaint } = await this.loadOwned(qr.manager, id, user);

      if (assignment.status !== AssignmentStatus.ACCEPTED) {
        throw new ConflictException('Accept the assignment before adding progress');
      }
      if (complaint.status !== ComplaintStatus.IN_PROGRESS) {
        throw new ConflictException('The complaint is not in progress');
      }

      // history only, the status stays the same
      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: user.userId,
        oldStatus: ComplaintStatus.IN_PROGRESS,
        newStatus: ComplaintStatus.IN_PROGRESS,
        remarks: dto.remarks,
      });

      await this.notificationsService.createMany(qr.manager, [
        {
          userId: complaint.reporterId,
          complaintId: complaint.complaintId,
          type: NotificationType.STATUS_CHANGED,
          title: 'Progress update',
          message: `Update on ${complaint.trackingCode}: ${dto.remarks}`,
        },
      ]);

      await qr.commitTransaction();
      return { message: 'Progress updated', data: null };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async resolve(id: number, dto: ResolveAssignmentDto, user: AuthUser) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { assignment, complaint } = await this.loadOwned(qr.manager, id, user);

      if (assignment.status !== AssignmentStatus.ACCEPTED) {
        throw new ConflictException('Accept the assignment before resolving it');
      }
      const oldStatus = complaint.status;
      assertTransition(oldStatus, ComplaintStatus.RESOLVED, Role.STAFF);

      const now = new Date();
      assignment.status = AssignmentStatus.COMPLETED;
      assignment.completedAt = now;
      assignment.resolutionNote = dto.resolutionNote;
      await qr.manager.save(assignment);

      complaint.status = ComplaintStatus.RESOLVED;
      complaint.resolvedAt = now;
      await qr.manager.save(complaint);

      await this.historyService.record(qr.manager, {
        complaintId: complaint.complaintId,
        changedById: user.userId,
        oldStatus,
        newStatus: ComplaintStatus.RESOLVED,
        remarks: `Resolved: ${dto.resolutionNote}`,
      });

      // staff can never close it, only the reporter's confirm does
      await this.notificationsService.createMany(qr.manager, [
        {
          userId: complaint.reporterId,
          complaintId: complaint.complaintId,
          type: NotificationType.RESOLVED,
          title: 'Complaint resolved',
          message: `Your complaint ${complaint.trackingCode} is resolved. Please confirm or reopen it.`,
        },
      ]);

      await qr.commitTransaction();
      return { message: 'Complaint resolved', data: assignment };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------- reads ----------

  async findAll(query: AssignmentQueryDto) {
    return await this.listAssignments(query);
  }

  async findMine(userId: number, query: AssignmentQueryDto) {
    const profile = await this.staffRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('No staff profile found for this account');
    }
    return await this.listAssignments(query, profile.staffProfileId);
  }

  async findOne(id: number, user: AuthUser) {
    const assignment = await this.assignmentRepo
      .createQueryBuilder('a')
      .innerJoin('a.complaint', 'c')
      .addSelect(['c.complaintId', 'c.trackingCode', 'c.title', 'c.status', 'c.priority', 'c.location'])
      .innerJoin('a.staffProfile', 'sp')
      .addSelect(['sp.staffProfileId', 'sp.userId', 'sp.designation'])
      .innerJoin('sp.user', 'u')
      .addSelect(['u.userId', 'u.name'])
      .where('a.assignmentId = :id', { id })
      .getOne();

    if (!assignment) throw new NotFoundException('Assignment not found');

    const isOwner = assignment.staffProfile.userId === user.userId;
    if (user.role !== Role.ADMIN && !(user.role === Role.STAFF && isOwner)) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    return { message: 'Assignment retrieved successfully', data: assignment };
  }

  private async listAssignments(query: AssignmentQueryDto, ownStaffProfileId?: number) {
    const { page = 1, limit = 10 } = query;

    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .innerJoin('a.complaint', 'c')
      .addSelect(['c.complaintId', 'c.trackingCode', 'c.title', 'c.status', 'c.priority', 'c.location'])
      .innerJoin('a.staffProfile', 'sp')
      .addSelect(['sp.staffProfileId', 'sp.designation'])
      .innerJoin('sp.user', 'u')
      .addSelect(['u.userId', 'u.name']);

    // /assignments/my always uses the caller's own profile, whatever the query says
    const staffProfileId = ownStaffProfileId ?? query.staffProfileId;
    if (staffProfileId !== undefined) {
      qb.andWhere('a.staffProfileId = :staffProfileId', { staffProfileId });
    }
    if (query.status) qb.andWhere('a.status = :status', { status: query.status });
    if (query.complaintId) {
      qb.andWhere('a.complaintId = :complaintId', { complaintId: query.complaintId });
    }

    const [items, total] = await qb
      .orderBy('a.assignedAt', 'DESC')
      .addOrderBy('a.assignmentId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: 'Assignments retrieved successfully',
      ...paginate(items, total, page, limit),
    };
  }

  // ---------- helpers ----------

  // no relations or joins here, FOR UPDATE does not work with outer joins
  private async lockComplaint(manager: EntityManager, complaintId: number) {
    const complaint = await manager.findOne(Complaint, {
      where: { complaintId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  // read the assignment to find its complaint, lock the complaint, then read the
  // assignment again so the status we check is the one after the lock
  private async loadLocked(manager: EntityManager, assignmentId: number) {
    const first = await manager.findOne(ComplaintAssignment, {
      where: { assignmentId },
    });
    if (!first) throw new NotFoundException('Assignment not found');

    const complaint = await this.lockComplaint(manager, first.complaintId);

    const assignment = await manager.findOne(ComplaintAssignment, {
      where: { assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    return { assignment, complaint };
  }

  // 404 first, then 403 for the wrong staff member, state checks (409) come after
  private async loadOwned(manager: EntityManager, assignmentId: number, user: AuthUser) {
    const { assignment, complaint } = await this.loadLocked(manager, assignmentId);

    const profile = await manager.findOne(StaffProfile, {
      where: { staffProfileId: assignment.staffProfileId },
    });
    if (!profile || profile.userId !== user.userId) {
      throw new ForbiddenException('This assignment belongs to another staff member');
    }
    return { assignment, complaint };
  }

  private async checkStaffForComplaint(
    manager: EntityManager,
    complaint: Complaint,
    staffProfileId: number,
  ) {
    const profile = await manager.findOne(StaffProfile, {
      where: { staffProfileId },
      relations: { user: true },
    });
    if (!profile) throw new NotFoundException('Staff profile not found');

    if (!profile.isAvailable) {
      throw new BadRequestException('The staff member is not available');
    }
    if (!profile.user.isActive || profile.user.role !== Role.STAFF) {
      throw new BadRequestException('The staff member is not an active STAFF account');
    }

    const category = await manager.findOne(Category, {
      where: { categoryId: complaint.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category.departmentId !== profile.departmentId) {
      throw new BadRequestException(
        "The staff member does not belong to the complaint's department",
      );
    }
    return profile;
  }
}
