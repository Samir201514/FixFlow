import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ComplaintHistory } from './entities/complaint-history.entity.js';

@Injectable()
export class ComplaintHistoryService {
  constructor(
    @InjectRepository(ComplaintHistory)
    private readonly historyRepo: Repository<ComplaintHistory>,
  ) {}


  async createHistory(manager: EntityManager, data: any) {
    const repo = manager.getRepository(ComplaintHistory);
    const history = repo.create(data);
    return await repo.save(history);
  }

  async getHistoryByComplaintId(complaintId: number) {
    return await this.historyRepo.find({
      where: { complaintId: complaintId },
      relations: { changedBy: true },
      order: { changedAt: 'ASC' }, 
    });
  }
}