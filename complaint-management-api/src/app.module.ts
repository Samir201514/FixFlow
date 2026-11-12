import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ComplaintTagsModule } from './complaint-tags/complaint-tags.module.js';
import { ComplaintAttachmentModule } from './complaint-attachment/complaint-attachment.module.js';
import { AuditModule } from './audit/audit.module.js';
import { DepartmentModule } from './department/department.module.js';
import { StaffProfileModule } from './staff-profile/staff-profile.module.js';
import { TagModule } from './tag/tag.module.js';
import { ComplaintHistoryModule } from './complaint-history/complaint-history.module.js';
import { ComplaintsModule } from './complaints/complaints.module.js';
import { ComplaintAssignmentsModule } from './complaint-assignments/complaint-assignments.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { FeedbackModule } from './feedback/feedback.module.js';

@Module({
  imports: [AuthModule, UsersModule, ComplaintTagsModule, ComplaintAttachmentModule, AuditModule, DepartmentModule, StaffProfileModule, TagModule, ComplaintHistoryModule, ComplaintsModule, ComplaintAssignmentsModule, CategoriesModule, NotificationsModule, FeedbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
