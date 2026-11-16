import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Department } from './entities/department.entity.js';
import { User } from '../users/entities/user.entity'; // miss
import { UserRole } from '../users/enums/user-role.enum'; // miss
import { StaffProfile } from '../staff-profiles/entities/staff-profile.entity.js';
import { Category } from '../categories/entities/category.entity'; // miss
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class DepartmentsService {
  // ডেটাবেসের ৪টা টেবিল ব্যবহার করব, তাই ৪টা repository
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(StaffProfile)
    private staffRepo: Repository<StaffProfile>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  // ============ ১. নতুন ডিপার্টমেন্ট তৈরি ============
  async create(dto: CreateDepartmentDto) {
    // একই নামে আগে থেকে আছে কি না দেখি (বড়-ছোট হাতের অক্ষর ধরব না)
    const count = await this.departmentRepo
      .createQueryBuilder('d')
      .where('LOWER(d.name) = LOWER(:name)', { name: dto.name })
      .getCount();

    if (count > 0) {
      throw new ConflictException('A department with this name already exists');
    }

    // নতুন অবজেক্ট বানিয়ে ডেটাবেসে সেভ
    const department = this.departmentRepo.create(dto);
    await this.departmentRepo.save(department);

    return { message: 'Department created successfully', data: department };
  }

  // ============ ২. সব ডিপার্টমেন্টের লিস্ট ============
  async findAll(query: DepartmentQueryDto, actor: User) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const isAdmin = actor.role === UserRole.ADMIN;

    // d = departments টেবিল, head = head-এর ইউজার (শুধু id ও নাম আনব)
    const qb = this.departmentRepo
      .createQueryBuilder('d')
      .leftJoin('d.head', 'head')
      .addSelect(['head.userId', 'head.name']);

    // সার্চ দিলে নাম বা বর্ণনায় খুঁজি
    if (query.search) {
      qb.andWhere('(d.name ILIKE :s OR d.description ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    if (!isAdmin) {
      // সাধারণ ইউজার শুধু active ডিপার্টমেন্ট দেখবে
      qb.andWhere('d.isActive = :active', { active: true });
    } else if (query.isActive !== undefined) {
      // Admin চাইলে active/inactive ফিল্টার করতে পারবে
      qb.andWhere('d.isActive = :active', { active: query.isActive });
    }

    // নাম অনুযায়ী সাজাই, পেজ অনুযায়ী কেটে আনি
    const [items, total] = await qb
      .orderBy('d.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: 'Departments retrieved successfully',
      ...paginate(items, total, page, limit),
    };
  }

  // ============ ৩. একটা ডিপার্টমেন্ট দেখা ============
  async findOne(id: number, actor: User) {
    const department = await this.departmentRepo
      .createQueryBuilder('d')
      .leftJoin('d.head', 'head')
      .addSelect(['head.userId', 'head.name'])
      .where('d.departmentId = :id', { id })
      .getOne();

    // ডিপার্টমেন্ট নেই হলে 404
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // সাধারণ ইউজার inactive ডিপার্টমেন্ট দেখতে পাবে না, তাকেও 404 দিই
    const isAdmin = actor.role === UserRole.ADMIN;
    if (!isAdmin && !department.isActive) {
      throw new NotFoundException('Department not found');
    }

    return { message: 'Department retrieved successfully', data: department };
  }

  // ============ ৪. আপডেট ============
  async update(id: number, dto: UpdateDepartmentDto) {
    // ধাপ ১: ডিপার্টমেন্ট খুঁজি
    const department = await this.departmentRepo.findOne({
      where: { departmentId: id },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // ধাপ ২: নাম বদলালে অন্য ডিপার্টমেন্টের সাথে মিলছে কি না দেখি
    if (dto.name !== undefined && dto.name !== department.name) {
      const count = await this.departmentRepo
        .createQueryBuilder('d')
        .where('LOWER(d.name) = LOWER(:name)', { name: dto.name })
        .andWhere('d.departmentId != :id', { id }) // নিজেকে বাদ দিই
        .getCount();

      if (count > 0) {
        throw new ConflictException('A department with this name already exists');
      }
      department.name = dto.name;
    }

    // ধাপ ৩: head নিয়ে কাজ
    if (dto.departmentHeadId === null) {
      // null পাঠালে head সরিয়ে দিই
      department.departmentHeadId = null;
    } else if (dto.departmentHeadId !== undefined) {
      // সংখ্যা পাঠালে আগে যাচাই করি, তারপর বসাই
      await this.checkHead(dto.departmentHeadId, id);
      department.departmentHeadId = dto.departmentHeadId;
    }
    // undefined হলে (পাঠানোই হয়নি) head-এ হাত দিই না

    // ধাপ ৪: বাকি ফিল্ড, যেটা পাঠানো হয়েছে শুধু সেটাই বদলাই
    if (dto.description !== undefined) department.description = dto.description;
    if (dto.contactEmail !== undefined) department.contactEmail = dto.contactEmail;
    if (dto.isActive !== undefined) department.isActive = dto.isActive;

    await this.departmentRepo.save(department);
    return { message: 'Department updated successfully', data: department };
  }

  // ============ ৫. ডিলিট ============
  async remove(id: number) {
    const department = await this.departmentRepo.findOne({
      where: { departmentId: id },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // স্টাফ প্রোফাইল থাকলে মোছা যাবে না
    const staffCount = await this.staffRepo.count({
      where: { departmentId: id },
    });
    if (staffCount > 0) {
      throw new ConflictException('Department has staff profiles');
    }

    // ক্যাটাগরি থাকলে মোছা যাবে না
    const categoryCount = await this.categoryRepo.count({
      where: { departmentId: id },
    });
    if (categoryCount > 0) {
      throw new ConflictException('Department has categories');
    }

    await this.departmentRepo.delete(id);
    return { message: 'Department deleted successfully', data: null };
  }

  // ============ head যাচাই (update ব্যবহার করে) ============
  private async checkHead(userId: number, departmentId: number) {
    // ১. ইউজার আছে কি?
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ২. ইউজার active এবং STAFF কি?
    if (!user.isActive || user.role !== UserRole.STAFF) {
      throw new BadRequestException('The head must be an active staff member');
    }

    // ৩. ইউজারের স্টাফ প্রোফাইল এই ডিপার্টমেন্টেই কি?
    const profile = await this.staffRepo.findOne({
      where: { userId, departmentId },
    });
    if (!profile) {
      throw new BadRequestException('The head must belong to this department');
    }

    // ৪. ইউজার অন্য কোনো ডিপার্টমেন্টের head নয় তো?
    const otherDepartment = await this.departmentRepo.findOne({
      where: { departmentHeadId: userId, departmentId: Not(departmentId) },
    });
    if (otherDepartment) {
      throw new ConflictException('This user already heads another department');
    }
  }
}