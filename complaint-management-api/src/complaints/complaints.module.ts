import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsController } from './complaints.controller.js';
import { ComplaintsService } from './complaints.service.js';
import { Complaint } from './entities/complaint.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { ComplaintAssignment } from '../complaint-assignments/entities/complaint-assignment.entity.js';
import { StaffProfile } from '../staff-profile/entities/staff-profile.entity.js';
import { ComplaintTagModule } from '../complaint-tags/complaint-tags.module.js';
import { ComplaintHistoryModule } from '../complaint-history/complaint-history.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Complaint, Category, ComplaintAssignment, StaffProfile]),
        ComplaintTagModule,
        ComplaintHistoryModule,
        NotificationsModule,
    ],
    controllers: [ComplaintsController],
    providers: [ComplaintsService],
    exports: [ComplaintsService, TypeOrmModule],
})
export class ComplaintsModule {
}
