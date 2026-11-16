import { ConfigService } from '@nestjs/config';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from '../department/entities/department.entity.js';
import { ComplaintAssignment } from '../complaint-assignments/entities/complaint-assignment.entity.js';
import { FindUserDto } from './dto/find-user.dto.js';

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

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; data: User }> {
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
      data: user,
    };
  }

  async findAll(qurey: FindUserDto): Promise<{
    message: string;
    data: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const qb = await this.userRepo.createQueryBuilder('user');

    if (qurey.role) {
      qb.andWhere('user.role = :role', { role: qurey.role });
    }

    if (qurey.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: qurey.isActive });
    }

    if (qurey.search) {
      qb.andWhere(
        new Brackets((q) => {
          q.where('user.name ILIKE :name', {
            name: `%${qurey.search}%`,
          }).orWhere('user.email ILIKE :email', {
            email: `%${qurey.search}%`,
          });
        }),
      );
    }

    const [items, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((qurey.page - 1) * qurey.limit)
      .take(qurey.limit)
      .getManyAndCount();

    return {
      message: 'Users retrieved successfully',
      data: items,
      meta: {
        total: total,
        page: qurey.page,
        limit: qurey.limit,
        totalPages: Math.ceil(total / qurey.limit),
      },
    };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
