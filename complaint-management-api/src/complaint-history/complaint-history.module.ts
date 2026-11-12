import { Module } from '@nestjs/common';
import { ComplaintHistoryService } from './complaint-history.service.js';
import { ComplaintHistoryController } from './complaint-history.controller.js';

@Module({
  controllers: [ComplaintHistoryController],
  providers: [ComplaintHistoryService],
})
export class ComplaintHistoryModule {}
