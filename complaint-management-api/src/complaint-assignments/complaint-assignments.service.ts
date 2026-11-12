import { Injectable } from '@nestjs/common';
import { CreateComplaintAssignmentDto } from './dto/create-complaint-assignment.dto.js';
import { UpdateComplaintAssignmentDto } from './dto/update-complaint-assignment.dto.js';

@Injectable()
export class ComplaintAssignmentsService {
  create(createComplaintAssignmentDto: CreateComplaintAssignmentDto) {
    return 'This action adds a new complaintAssignment';
  }

  findAll() {
    return `This action returns all complaintAssignments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaintAssignment`;
  }

  update(id: number, updateComplaintAssignmentDto: UpdateComplaintAssignmentDto) {
    return `This action updates a #${id} complaintAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaintAssignment`;
  }
}
