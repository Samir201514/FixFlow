import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintDto } from './create-complaint.dto.js';

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {}
