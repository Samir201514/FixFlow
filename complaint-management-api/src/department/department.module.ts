import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './department.controller.js';
import { DepartmentsService } from './department.service.js';
import { Department } from './entities/department.entity.js';
import { User } from '../users/entities/user.entity.js';
import { StaffProfile } from '../staff-profile/entities/staff-profile.entity.js';
import { Category } from '../categories/entities/category.entity.js';
@Module({
  imports: [
    TypeOrmModule.forFeature([Department, User, StaffProfile, Category]),
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
