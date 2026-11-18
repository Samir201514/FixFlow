import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintTagService } from './complaint-tags.service.js';
import { ComplaintTag } from './entities/complaint-tag.entity.js';
import { ComplaintTagController } from './complaint-tags.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintTag])],
  controllers: [ComplaintTagController],
  providers: [ComplaintTagService],
  exports: [ComplaintTagService],
})
export class ComplaintTagModule {}