import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateComplaintDto } from './create-complaint.dto.js';

// tags are changed through the tag routes, not here
export class UpdateComplaintDto extends PartialType(
  OmitType(CreateComplaintDto, ['tagIds'] as const),
) {}
