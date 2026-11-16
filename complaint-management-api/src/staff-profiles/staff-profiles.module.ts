import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffProfile } from './entities/staff-profile.entity';
import { User } from '../users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { StaffProfilesController } from './staff-profiles.controller';
import { StaffProfilesService } from './staff-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaffProfile, User, Department])],
  controllers: [StaffProfilesController],
  providers: [StaffProfilesService],
  exports: [StaffProfilesService, TypeOrmModule],
})
export class StaffProfilesModule {}