import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ComplaintHistory } from './entities/complaint-history.entity.js';

@Injectable()
export class ComplaintHistoryService {
  constructor(
    @InjectRepository(ComplaintHistory)
    private readonly complaintHistoryRepository: Repository<ComplaintHistory>,
  ) {}

  
  async record(manager: EntityManager, data: any) {
    const repository = manager.getRepository(ComplaintHistory);
    const historyRecord = repository.create(data);
    return await repository.save(historyRecord);
  }


  async findByComplaint(complaintId: number) {
    const historyRows = await this.complaintHistoryRepository
      .createQueryBuilder('history')
      .innerJoin('history.changedBy', 'user')
      .addSelect(['user.id', 'user.name', 'user.role'])
      .where('history.complaintId = :complaintId', { complaintId })
      .orderBy('history.changedAt', 'ASC')
      .getMany();

    return historyRows.map((row) => ({
      historyId: row.historyId,
      oldStatus: row.oldStatus,
      newStatus: row.newStatus,
      remarks: row.remarks,
      changedAt: row.changedAt,
      changedBy: row.changedBy,
    }));
  }
}