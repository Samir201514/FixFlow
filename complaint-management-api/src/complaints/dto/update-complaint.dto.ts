import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateComplaintDto } from './create-complaint.dto.js';

export class UpdateComplaintDto extends PartialType(OmitType(CreateComplaintDto, ['tagIds'] as const)) {
}
