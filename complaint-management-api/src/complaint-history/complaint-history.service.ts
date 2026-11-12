import { Injectable } from '@nestjs/common';
import { CreateComplaintHistoryDto } from './dto/create-complaint-history.dto.js';
import { UpdateComplaintHistoryDto } from './dto/update-complaint-history.dto.js';

@Injectable()
export class ComplaintHistoryService {
  create(createComplaintHistoryDto: CreateComplaintHistoryDto) {
    return 'This action adds a new complaintHistory';
  }

  findAll() {
    return `This action returns all complaintHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaintHistory`;
  }

  update(id: number, updateComplaintHistoryDto: UpdateComplaintHistoryDto) {
    return `This action updates a #${id} complaintHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaintHistory`;
  }
}
