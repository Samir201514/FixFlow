import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintAssignmentDto } from './create-complaint-assignment.dto.js';

export class UpdateComplaintAssignmentDto extends PartialType(CreateComplaintAssignmentDto) {}
