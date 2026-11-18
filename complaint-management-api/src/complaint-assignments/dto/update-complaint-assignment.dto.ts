import { PartialType } from '@nestjs/swagger';
import { CreateComplaintAssignmentDto } from './create-complaint-assignment.dto.js';

export class UpdateComplaintAssignmentDto extends PartialType(CreateComplaintAssignmentDto) {}