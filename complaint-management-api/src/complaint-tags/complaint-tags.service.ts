import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ComplaintTag } from './entities/complaint-tag.entity.js';
import { CreateComplaintTagDto } from './dto/create-complaint-tag.dto.js';

@Injectable()
export class ComplaintTagService {
    constructor(
    @InjectRepository(ComplaintTag)
    private readonly tagRepo: Repository<ComplaintTag>) { }
    async addTag(complaintId: number, dto: CreateComplaintTagDto): Promise<ComplaintTag> {
        const tag = this.tagRepo.create({
            complaintId,
            tagName: dto.tagName,
        });
        return await this.tagRepo.save(tag);
    }
    async addTags(manager: EntityManager, complaintId: number, tagIds: number[], _addedBy?: number): Promise<ComplaintTag[]> {
        const entities = tagIds.map((id) => manager.create(ComplaintTag, {
            complaintId,
            tagName: String(id),
        }));
        return await manager.save(ComplaintTag, entities);
    }
    async findByComplaint(complaintId: number): Promise<ComplaintTag[]> {
        return await this.tagRepo.find({
            where: { complaintId },
        });
    }
    async removeTag(tagId: number): Promise<void> {
        const result = await this.tagRepo.delete(tagId);
        if (result.affected === 0) {
            throw new NotFoundException(`Tag with ID ${tagId} not found`);
        }
    }
}
