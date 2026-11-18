import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffProfile } from './entities/staff-profile.entity.js';
import { User } from '../users/entities/user.entity.js';
import { StaffProfilesController } from './staff-profile.controller.js';
import { StaffProfilesService } from './staff-profile.service.js';
import { Department } from '../department/entities/department.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([StaffProfile, User, Department])],
  controllers: [StaffProfilesController],
  providers: [StaffProfilesService],
  exports: [StaffProfilesService],
})
export class StaffProfilesModule {}
