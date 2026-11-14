
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity.js';
import { Department } from '../department/entities/department.entity.js';
import { Complaint } from '../complaints/entities/complaint.entity.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CategoryQueryDto } from './dto/category-query.dto.js';

import { paginate } from '../common/helpers/paginate.helper.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
  ) {}

  // Create Category
  async create(dto: CreateCategoryDto) {
    const department = await this.departmentRepo.findOne({
      where: { departmentId: dto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.isActive) {
      throw new BadRequestException(
        'The department is not active',
      );
    }

    const duplicate = await this.categoryRepo
      .createQueryBuilder('c')
      .where('c.departmentId = :departmentId', {
        departmentId: dto.departmentId,
      })
      .andWhere('LOWER(c.name) = LOWER(:name)', {
        name: dto.name,
      })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'This department already has a category with this name',
      );
    }

    try {
      const category = this.categoryRepo.create(dto);
      const saved = await this.categoryRepo.save(category);

      return {
        message: 'Category created successfully',
        data: saved,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'This department already has a category with this name',
        );
      }

      throw error;
    }
  }

  // Get All Categories
  async findAll(query: CategoryQueryDto, actor: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const qb = this.categoryRepo
      .createQueryBuilder('c')
      .innerJoin('c.department', 'd')
      .addSelect(['d.departmentId', 'd.name']);

    if (actor?.role !== 'ADMIN') {
      qb.andWhere('c.isActive = :categoryActive', {
        categoryActive: true,
      });

      qb.andWhere('d.isActive = :departmentActive', {
        departmentActive: true,
      });
    } else if (query.isActive !== undefined) {
      qb.andWhere('c.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.departmentId) {
      qb.andWhere('c.departmentId = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(c.name ILIKE :search OR c.description ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    const [items, total] = await qb
      .orderBy('d.name', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: 'Categories retrieved successfully',
      ...paginate(items, total, page, limit),
    };
  }

  // Get Single Category
  async findOne(id: number, actor: any) {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: id },
      relations: { department: true },
    });

    if (
      !category ||
      (
        actor?.role !== 'ADMIN' &&
        (
          !category.isActive ||
          !category.department?.isActive
        )
      )
    ) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category retrieved successfully',
      data: {
        ...category,
        department: category.department
          ? {
              departmentId: category.department.departmentId,
              name: category.department.name,
            }
          : null,
      },
    };
  }

  // Update Category
  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const targetDepartmentId =
      dto.departmentId ?? category.departmentId;

    const targetName = dto.name ?? category.name;

    const departmentChanged =
      targetDepartmentId !== category.departmentId;

    const nameChanged =
      targetName.toLowerCase() !== category.name.toLowerCase();

    if (departmentChanged) {
      const department = await this.departmentRepo.findOne({
        where: { departmentId: targetDepartmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      if (!department.isActive) {
        throw new BadRequestException(
          'The department is not active',
        );
      }

      const complaintCount = await this.complaintRepo.count({
        where: { categoryId: id },
        withDeleted: true,
      });

      if (complaintCount > 0) {
        throw new ConflictException(
          'A category with complaints cannot move to another department',
        );
      }
    }

    if (departmentChanged || nameChanged) {
      const duplicate = await this.categoryRepo
        .createQueryBuilder('c')
        .where('c.departmentId = :departmentId', {
          departmentId: targetDepartmentId,
        })
        .andWhere('LOWER(c.name) = LOWER(:name)', {
          name: targetName,
        })
        .andWhere('c.categoryId != :id', { id })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          'This department already has a category with this name',
        );
      }
    }

    Object.assign(category, dto, {
      departmentId: targetDepartmentId,
      name: targetName,
    });

    try {
      const saved = await this.categoryRepo.save(category);

      return {
        message: 'Category updated successfully',
        data: saved,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'This department already has a category with this name',
        );
      }

      throw error;
    }
  }

  // Delete Category
  async remove(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const complaintCount = await this.complaintRepo.count({
      where: { categoryId: id },
      withDeleted: true,
    });

    if (complaintCount > 0) {
      throw new ConflictException(
        'The category is used by complaints. Deactivate it instead',
      );
    }

    await this.categoryRepo.delete(id);

    return {
      message: 'Category deleted successfully',
      data: null,
    };
  }
}
