import { Injectable } from '@nestjs/common';
import { CreateComplaintAttachmentDto } from './dto/create-complaint-attachment.dto.js';
import { UpdateComplaintAttachmentDto } from './dto/update-complaint-attachment.dto.js';

@Injectable()
export class ComplaintAttachmentService {
  create(createComplaintAttachmentDto: CreateComplaintAttachmentDto) {
    return 'This action adds a new complaintAttachment';
  }

  findAll() {
    return `This action returns all complaintAttachment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaintAttachment`;
  }

  update(id: number, updateComplaintAttachmentDto: UpdateComplaintAttachmentDto) {
    return `This action updates a #${id} complaintAttachment`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaintAttachment`;
  }
}
