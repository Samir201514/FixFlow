import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintAssignmentController } from './complaint-assignments.controller.js';
import { ComplaintAssignmentService } from './complaint-assignments.service.js';
import { ComplaintAssignment } from './entities/complaint-assignment.entity.js';
import { Complaint } from '../complaints/entities/complaint.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { StaffProfile } from '../staff-profile/entities/staff-profile.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ComplaintHistoryModule } from '../complaint-history/complaint-history.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintAssignment, Complaint, StaffProfile, User, Category]),
    ComplaintHistoryModule,
    NotificationsModule,
  ],
  controllers: [ComplaintAssignmentController],
  providers: [ComplaintAssignmentService],
})
export class ComplaintAssignmentModule {}
