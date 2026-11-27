import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from '../department/entities/department.entity.js';
import { ComplaintAssignment } from '../complaint-assignments/entities/complaint-assignment.entity.js';
import { FindUserDto } from './dto/find-user.dto.js';
import { UserRoles } from '../common/enums/user-roles.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(ComplaintAssignment)
    private readonly complaintAssignmentRepo: Repository<ComplaintAssignment>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<{
    message: string;
    data: {
      userId: number;
      name: string;
      email: string;
      phone: string | null;
      role: UserRoles;
      createdAt: Date;
    };
  }> {
    createUserDto.email = createUserDto.email.trim().toLowerCase();

    const newUser = await this.userRepo.findOne({
      where: {
        email: createUserDto.email,
      },
      withDeleted: true,
    });

    if (newUser !== null) {
      throw new ConflictException('Email is already registered');
    }

    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      this.configService.getOrThrow<number>('BCRYPT_ROUNDS'),
    );

    const create = await this.userRepo.create({ ...createUserDto });
    const user = await this.userRepo.save(create);
    return {
      message: `User created successfully`,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async findAll(query: FindUserDto): Promise<{
    message: string;
    data: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.userId',
        'user.name',
        'user.email',
        'user.phone',
        'user.role',
        'user.isActive',
        'user.createdAt',
      ]);

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.search) {
      qb.andWhere(
        new Brackets((q) => {
          q.where('user.name ILIKE :search', {
            search: `%${query.search}%`,
          }).orWhere('user.email ILIKE :search', {
            search: `%${query.search}%`,
          });
        }),
      );
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      message: `${total} Users Retrieved Successfully`,
      data: users,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: number): Promise<{ message: string; data: User }> {
    const user = await this.userRepo.findOneBy({ userId: id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive');
    }

    return { message: 'User Found.', data: user };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async updateUser(
    id: number,
    dto: UpdateUserDto,
    actor: { userId: number; role: UserRoles },
  ): Promise<{ message: string; data: User }> {
    const user = await this.userRepo.findOne({
      where: { userId: id },
      relations: { staffProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (actor.role !== UserRoles.ADMIN && actor.userId !== id) {
      throw new ForbiddenException();
    }

    const changingRoleOrStatus =
      dto.role !== undefined || dto.isActive !== undefined;

    if (actor.role !== UserRoles.ADMIN && changingRoleOrStatus) {
      throw new ForbiddenException('Only an admin can change role or status');
    }

    if (
      actor.role === UserRoles.ADMIN &&
      actor.userId === id &&
      changingRoleOrStatus
    ) {
      throw new ConflictException('You cannot change your own role or status');
    }

    if (
      dto.role !== undefined &&
      dto.role !== UserRoles.STAFF &&
      user.staffProfile
    ) {
      throw new ConflictException('Remove the staff profile first');
    }

    Object.assign(user, dto);

    const updatedUser = await this.userRepo.save(user);

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async removeUser(
    id: number,
    actor: { userId: number; role: UserRoles },
  ): Promise<{ message: string; data: null }> {
    const user = await this.userRepo.findOne({
      where: { userId: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (actor.userId === id) {
      throw new ConflictException('You cannot delete your own account');
    }

    const assignment = await this.complaintAssignmentRepo
      .createQueryBuilder('assignment')
      .innerJoin('assignment.staffProfile', 'staffProfile')
      .where('staffProfile.userId = :id', { id })
      .andWhere('assignment.status IN (:...statuses)', {
        statuses: ['ACTIVE', 'ACCEPTED'],
      })
      .getOne();

    if (assignment) {
      throw new ConflictException('The user has active assignments');
    }

    await this.departmentRepo.update(
      { departmentHeadId: id },
      { departmentHeadId: null },
    );

    await this.userRepo.update(id, { isActive: false });

    await this.userRepo.softDelete(id);

    return {
      message: 'User deleted successfully',
      data: null,
    };
  }
}
