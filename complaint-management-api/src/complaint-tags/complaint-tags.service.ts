import { Injectable } from '@nestjs/common';
import { CreateComplaintTagDto } from './dto/create-complaint-tag.dto.js';
import { UpdateComplaintTagDto } from './dto/update-complaint-tag.dto.js';

@Injectable()
export class ComplaintTagsService {
  create(createComplaintTagDto: CreateComplaintTagDto) {
    return 'This action adds a new complaintTag';
  }

  findAll() {
    return `This action returns all complaintTags`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaintTag`;
  }

  update(id: number, updateComplaintTagDto: UpdateComplaintTagDto) {
    return `This action updates a #${id} complaintTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaintTag`;
  }
}
