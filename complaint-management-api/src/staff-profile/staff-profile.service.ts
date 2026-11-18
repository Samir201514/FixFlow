import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Not, Repository } from "typeorm";
import { StaffProfile } from "./entities/staff-profile.entity.js";
import { User } from "../users/entities/user.entity.js";
//import { Department } from "../departments/entities/department.entity.js";
//import { UserRole } from "../users/enums/user-role.enum.js";
//import { paginate } from "../common/utils/paginate.js";
import { CreateStaffProfileDto } from "./dto/create-staff-profile.dto.js";
import { UpdateStaffProfileDto } from "./dto/update-staff-profile.dto.js";
import { StaffQueryDto } from "./dto/staff-query.dto.js";
import { Department } from "../department/entities/department.entity.js";
import { UserRoles } from "../common/enums/user-roles.enum.js";
import { paginate } from "../common/helpers/paginate.helper.js";

@Injectable()
export class StaffProfilesService {
  constructor(
    @InjectRepository(StaffProfile)
    private readonly staffRepo: Repository<StaffProfile>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  private shape(p: StaffProfile) {
    return {
      staffProfileId: p.staffProfileId,
      employeeCode: p.employeeCode,
      designation: p.designation,
      isAvailable: p.isAvailable,
      createdAt: p.createdAt,
      user: p.user && {
        userId: p.user.userId,
        name: p.user.name,
        email: p.user.email,
      },
      department: p.department && {
        departmentId: p.department.departmentId,
        name: p.department.name,
      },
    };
  }

  private async load(id: number) {
    const profile = await this.staffRepo.findOne({
      where: { staffProfileId: id },
      relations: { user: true, department: true },
    });
    if (!profile) throw new NotFoundException("Staff profile not found");
    return profile;
  }

  async create(dto: CreateStaffProfileDto) {
    const user = await this.userRepo.findOne({ where: { userId: dto.userId } });
    if (!user) throw new NotFoundException("User not found");
    if (!user.isActive || user.role !== UserRoles.STAFF) {
      throw new BadRequestException("The user must be an active STAFF account");
    }

    const existing = await this.staffRepo.findOne({
      where: { userId: dto.userId },
    });
    if (existing)
      throw new ConflictException("This user already has a staff profile");

    const dept = await this.departmentRepo.findOne({
      where: { departmentId: dto.departmentId },
    });
    if (!dept) throw new NotFoundException("Department not found");
    if (!dept.isActive)
      throw new BadRequestException("The department is not active");

    const codeTaken = await this.staffRepo.findOne({
      where: { employeeCode: dto.employeeCode },
    });
    if (codeTaken)
      throw new ConflictException("Employee code is already in use");

    const saved = await this.staffRepo.save(this.staffRepo.create(dto));
    const profile = await this.load(saved.staffProfileId);
    return {
      message: "Staff profile created successfully",
      data: this.shape(profile),
    };
  }

  async findAll(query: StaffQueryDto) {
    const { page = 1, limit = 10, departmentId, isAvailable, search } = query;

    const qb = this.staffRepo
      .createQueryBuilder("sp")
      .leftJoin("sp.user", "u")
      .addSelect(["u.userId", "u.name", "u.email"])
      .leftJoin("sp.department", "d")
      .addSelect(["d.departmentId", "d.name"]);

    if (departmentId !== undefined)
      qb.andWhere("sp.departmentId = :departmentId", { departmentId });
    if (isAvailable !== undefined)
      qb.andWhere("sp.isAvailable = :isAvailable", { isAvailable });
    if (search) {
      qb.andWhere(
        new Brackets((b) =>
          b
            .where("sp.employeeCode ILIKE :s", { s: `%${search}%` })
            .orWhere("sp.designation ILIKE :s", { s: `%${search}%` })
            .orWhere("u.name ILIKE :s", { s: `%${search}%` }),
        ),
      );
    }

    const [items, total] = await qb
      .orderBy("sp.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: "Staff profiles retrieved successfully",
      ...paginate(items, total, page, limit),
    };
  }

  async findOne(id: number, actor: { userId: number; role: UserRoles }) {
    const profile = await this.load(id);
    if (actor.role === UserRoles.STAFF && profile.userId !== actor.userId) {
      throw new ForbiddenException("You can only view your own profile");
    }
    return {
      message: "Staff profile retrieved successfully",
      data: this.shape(profile),
    };
  }

  async update(id: number, dto: UpdateStaffProfileDto) {
    const profile = await this.load(id);

    if (dto.employeeCode && dto.employeeCode !== profile.employeeCode) {
      const dup = await this.staffRepo.findOne({
        where: { employeeCode: dto.employeeCode, staffProfileId: Not(id) },
      });
      if (dup) throw new ConflictException("Employee code is already in use");
    }

    if (
      dto.departmentId !== undefined &&
      dto.departmentId !== profile.departmentId
    ) {
      const dept = await this.departmentRepo.findOne({
        where: { departmentId: dto.departmentId },
      });
      if (!dept) throw new NotFoundException("Department not found");
      if (!dept.isActive)
        throw new BadRequestException("The department is not active");

      const headOf = await this.departmentRepo.findOne({
        where: { departmentHeadId: profile.userId },
      });
      if (headOf)
        throw new ConflictException(
          "Remove this user as department head first",
        );

      profile.departmentId = dto.departmentId;
      profile.department = dept;
    }

    if (dto.designation !== undefined) profile.designation = dto.designation;
    if (dto.isAvailable !== undefined) profile.isAvailable = dto.isAvailable;
    if (dto.employeeCode !== undefined) profile.employeeCode = dto.employeeCode;

    await this.staffRepo.save(profile);
    const fresh = await this.load(id);
    return {
      message: "Staff profile updated successfully",
      data: this.shape(fresh),
    };
  }
}
