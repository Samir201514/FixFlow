import { Module } from '@nestjs/common';
import { ComplaintAssignmentsService } from './complaint-assignments.service.js';
import { ComplaintAssignmentsController } from './complaint-assignments.controller.js';

@Module({
  controllers: [ComplaintAssignmentsController],
  providers: [ComplaintAssignmentsService],
})
export class ComplaintAssignmentsModule {}
