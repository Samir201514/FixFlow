import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Department } from '../department/entities/department.entity.js';
import { ComplaintAssignment } from '../complaint-assignments/entities/complaint-assignment.entity.js';
import { StaffProfile } from '../staff-profile/entities/staff-profile.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Department,
      ComplaintAssignment,
      StaffProfile,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
