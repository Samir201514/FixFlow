import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Department } from "./entities/department.entity.js";
import { User } from "../users/entities/user.entity.js"; // miss
import { UserRole } from "../users/enums/user-role.enum.js"; // miss
import { StaffProfile } from "../staff-profile/entities/staff-profile.entity.js";
import { Category } from "../categories/entities/category.entity.js"; // miss
import { CreateDepartmentDto } from "./dto/create-department.dto.js";
import { UpdateDepartmentDto } from "./dto/update-department.dto.js";
import { DepartmentQueryDto } from "./dto/department-query.dto.js";
import { paginate } from "../common/utils/paginate.js";

@Injectable()
export class DepartmentsService {
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

  async create(dto: CreateDepartmentDto) {
    const count = await this.departmentRepo
      .createQueryBuilder("d")
      .where("LOWER(d.name) = LOWER(:name)", { name: dto.name })
      .getCount();

    if (count > 0) {
      throw new ConflictException("A department with this name already exists");
    }

    const department = this.departmentRepo.create(dto);
    await this.departmentRepo.save(department);

    return { message: "Department created successfully", data: department };
  }

  async findAll(query: DepartmentQueryDto, actor: User) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const isAdmin = actor.role === UserRole.ADMIN;

    const qb = this.departmentRepo
      .createQueryBuilder("d")
      .leftJoin("d.head", "head")
      .addSelect(["head.userId", "head.name"]);

    if (query.search) {
      qb.andWhere("(d.name ILIKE :s OR d.description ILIKE :s)", {
        s: `%${query.search}%`,
      });
    }

    if (!isAdmin) {
      qb.andWhere("d.isActive = :active", { active: true });
    } else if (query.isActive !== undefined) {
      qb.andWhere("d.isActive = :active", { active: query.isActive });
    }

    const [items, total] = await qb
      .orderBy("d.name", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: "Departments retrieved successfully",
      ...paginate(items, total, page, limit),
    };
  }

  async findOne(id: number, actor: User) {
    const department = await this.departmentRepo
      .createQueryBuilder("d")
      .leftJoin("d.head", "head")
      .addSelect(["head.userId", "head.name"])
      .where("d.departmentId = :id", { id })
      .getOne();

    if (!department) {
      throw new NotFoundException("Department not found");
    }

    const isAdmin = actor.role === UserRole.ADMIN;
    if (!isAdmin && !department.isActive) {
      throw new NotFoundException("Department not found");
    }

    return { message: "Department retrieved successfully", data: department };
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const department = await this.departmentRepo.findOne({
      where: { departmentId: id },
    });
    if (!department) {
      throw new NotFoundException("Department not found");
    }

    if (dto.name !== undefined && dto.name !== department.name) {
      const count = await this.departmentRepo
        .createQueryBuilder("d")
        .where("LOWER(d.name) = LOWER(:name)", { name: dto.name })
        .andWhere("d.departmentId != :id", { id }) // নিজেকে বাদ দিই
        .getCount();

      if (count > 0) {
        throw new ConflictException(
          "A department with this name already exists",
        );
      }
      department.name = dto.name;
    }

    if (dto.departmentHeadId === null) {
      department.departmentHeadId = null;
    } else if (dto.departmentHeadId !== undefined) {
      await this.checkHead(dto.departmentHeadId, id);
      department.departmentHeadId = dto.departmentHeadId;
    }

    if (dto.description !== undefined) department.description = dto.description;
    if (dto.contactEmail !== undefined)
      department.contactEmail = dto.contactEmail;
    if (dto.isActive !== undefined) department.isActive = dto.isActive;

    await this.departmentRepo.save(department);
    return { message: "Department updated successfully", data: department };
  }

  async remove(id: number) {
    const department = await this.departmentRepo.findOne({
      where: { departmentId: id },
    });
    if (!department) {
      throw new NotFoundException("Department not found");
    }

    const staffCount = await this.staffRepo.count({
      where: { departmentId: id },
    });
    if (staffCount > 0) {
      throw new ConflictException("Department has staff profiles");
    }

    const categoryCount = await this.categoryRepo.count({
      where: { departmentId: id },
    });
    if (categoryCount > 0) {
      throw new ConflictException("Department has categories");
    }

    await this.departmentRepo.delete(id);
    return { message: "Department deleted successfully", data: null };
  }

  // head jachai
  private async checkHead(userId: number, departmentId: number) {
    // ১. ইউজার আছে কি?
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // ২. user active naki staff ?
    if (!user.isActive || user.role !== UserRole.STAFF) {
      throw new BadRequestException("The head must be an active staff member");
    }

    // ৩. user staff profile ei khane ?
    const profile = await this.staffRepo.findOne({
      where: { userId, departmentId },
    });
    if (!profile) {
      throw new BadRequestException("The head must belong to this department");
    }

    // ৪. user kon departmen , head noy ?
    const otherDepartment = await this.departmentRepo.findOne({
      where: { departmentHeadId: userId, departmentId: Not(departmentId) },
    });
    if (otherDepartment) {
      throw new ConflictException("This user already heads another department");
    }
  }
}
