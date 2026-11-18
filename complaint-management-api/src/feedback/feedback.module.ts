import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller.js';
import { FeedbackService } from './feedback.service.js';
import { Feedback } from './entities/feedback.entity.js';
import { Complaint } from '../complaints/entities/complaint.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Complaint])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
