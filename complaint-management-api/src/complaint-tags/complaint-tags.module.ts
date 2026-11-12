import { Module } from '@nestjs/common';
import { ComplaintTagsService } from './complaint-tags.service.js';
import { ComplaintTagsController } from './complaint-tags.controller.js';

@Module({
  controllers: [ComplaintTagsController],
  providers: [ComplaintTagsService],
})
export class ComplaintTagsModule {}
