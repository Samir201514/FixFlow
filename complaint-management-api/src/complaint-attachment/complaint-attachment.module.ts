import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintAttachmentService } from './complaint-attachment.service.js';
import { ComplaintAttachment } from './entities/complaint-attachment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintAttachment])],
  providers: [ComplaintAttachmentService],
  exports: [ComplaintAttachmentService],
})
export class ComplaintAttachmentModule {}