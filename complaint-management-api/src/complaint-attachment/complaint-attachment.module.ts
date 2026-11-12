import { Module } from '@nestjs/common';
import { ComplaintAttachmentService } from './complaint-attachment.service.js';
import { ComplaintAttachmentController } from './complaint-attachment.controller.js';

@Module({
  controllers: [ComplaintAttachmentController],
  providers: [ComplaintAttachmentService],
})
export class ComplaintAttachmentModule {}
