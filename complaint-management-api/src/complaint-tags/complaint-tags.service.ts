import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintTag } from './entities/complaint-tag.entity.js';
import { CreateComplaintTagDto } from './dto/create-complaint-tag.dto.js';

@Injectable()
export class ComplaintTagService {
  constructor(
    @InjectRepository(ComplaintTag)
    private readonly tagRepo: Repository<ComplaintTag>,
  ) {}

  async addTag(complaintId: number, dto: CreateComplaintTagDto): Promise<ComplaintTag> {
    const tag = this.tagRepo.create({
      complaintId,
      tagName: dto.tagName,
    });
    return await this.tagRepo.save(tag);
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