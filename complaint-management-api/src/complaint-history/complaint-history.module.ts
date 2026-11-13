import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintHistoryService } from './complaint-history.service.js';
import { ComplaintHistory } from './entities/complaint-history.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintHistory])],
  providers: [ComplaintHistoryService],
  exports: [ComplaintHistoryService],
})
export class ComplaintHistoryModule {}