import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller.js';
import { DepartmentsService } from './departments.service.js';
import { Department } from './entities/department.entity.js';
import { User } from '../users/entities/user.entity'; // missing
import { StaffProfile } from '../staff-profiles/entities/staff-profile.entity.js'; 
import { Category } from '../categories/entities/category.entity'; // miss

@Module({
  // এই মডিউল ডেটাবেসের কোন কোন টেবিল ব্যবহার করবে
  imports: [TypeOrmModule.forFeature([Department, User, StaffProfile, Category])],
  // রুট সামলায় যে ক্লাস
  controllers: [DepartmentsController],
  // কাজ করে যে ক্লাস
  providers: [DepartmentsService],
  // অন্য মডিউল এগুলো ব্যবহার করতে পারবে
  exports: [DepartmentsService, TypeOrmModule],
})
export class DepartmentsModule {}