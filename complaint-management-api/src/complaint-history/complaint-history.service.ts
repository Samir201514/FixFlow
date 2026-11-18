import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ComplaintHistory } from './entities/complaint-history.entity.js';
import { ComplaintStatus } from '../complaints/enums/complaint-status.enum.js';
export interface HistoryData {
    complaintId: number;
    changedById: number;
    oldStatus: ComplaintStatus | null;
    newStatus: ComplaintStatus;
    remarks?: string;
}
@Injectable()
export class ComplaintHistoryService {
    constructor(
    @InjectRepository(ComplaintHistory)
    private readonly historyRepo: Repository<ComplaintHistory>) { }
    async record(manager: EntityManager, data: HistoryData) {
        const repo = manager.getRepository(ComplaintHistory);
        return await repo.save(repo.create(data));
    }
    async findByComplaint(complaintId: number) {
        const rows = await this.historyRepo
            .createQueryBuilder('h')
            .innerJoin('h.changedBy', 'u')
            .addSelect(['u.userId', 'u.name', 'u.role'])
            .where('h.complaintId = :complaintId', { complaintId })
            .orderBy('h.changedAt', 'ASC')
            .addOrderBy('h.historyId', 'ASC')
            .getMany();
        return rows.map((h) => ({
            historyId: h.historyId,
            oldStatus: h.oldStatus,
            newStatus: h.newStatus,
            remarks: h.remarks,
            changedAt: h.changedAt,
            changedBy: {
                userId: h.changedBy.userId,
                name: h.changedBy.name,
                role: h.changedBy.role,
            },
        }));
    }
}
