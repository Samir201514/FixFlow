import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintAttachment } from './entities/complaint-attachment.entity.js';

@Injectable()
export class ComplaintAttachmentService {
    constructor(
    @InjectRepository(ComplaintAttachment)
    private readonly attachmentRepo: Repository<ComplaintAttachment>) { }
    async create(complaintId: number, uploaderId: number, fileData: {
        fileName: string;
        fileUrl: string;
        fileType?: string;
    }): Promise<ComplaintAttachment> {
        const attachment = this.attachmentRepo.create({
            complaintId,
            uploaderId,
            ...fileData,
        });
        return await this.attachmentRepo.save(attachment);
    }
    async findAll(): Promise<ComplaintAttachment[]> {
        return await this.attachmentRepo.find({
            relations: { uploader: true, complaint: true },
            order: { uploadedAt: 'DESC' },
        });
    }
    async findOne(attachmentId: number): Promise<ComplaintAttachment> {
        const attachment = await this.attachmentRepo.findOne({
            where: { attachmentId },
            relations: { uploader: true, complaint: true },
        });
        if (!attachment) {
            throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
        }
        return attachment;
    }
    async findByComplaint(complaintId: number): Promise<ComplaintAttachment[]> {
        return await this.attachmentRepo.find({
            where: { complaintId },
            relations: { uploader: true },
            order: { uploadedAt: 'DESC' },
        });
    }
    async update(attachmentId: number, updateDto: any): Promise<ComplaintAttachment> {
        const attachment = await this.findOne(attachmentId);
        Object.assign(attachment, updateDto);
        return await this.attachmentRepo.save(attachment);
    }
    async remove(attachmentId: number): Promise<void> {
        const result = await this.attachmentRepo.delete(attachmentId);
        if (result.affected === 0) {
            throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
        }
    }
}
