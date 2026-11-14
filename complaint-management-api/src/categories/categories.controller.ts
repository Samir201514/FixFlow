import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CategoryQueryDto } from './dto/category-query.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AuditEntity } from '../common/decorators/audit-entity.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Category } from './entities/category.entity.js';

@ApiTags('Categories')
@ApiBearerAuth()
@AuditEntity(Category)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(['ADMIN'])
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateCategoryDto) { return this.categoriesService.create(dto); }

  @Get()
  findAll(@Query() query: CategoryQueryDto, @CurrentUser() actor: any) {
    return this.categoriesService.findAll(query, actor);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: any) {
    return this.categoriesService.findOne(id, actor);
  }

  @Patch(':id')
  @Roles(['ADMIN'])
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) { return this.categoriesService.remove(id); }
}
