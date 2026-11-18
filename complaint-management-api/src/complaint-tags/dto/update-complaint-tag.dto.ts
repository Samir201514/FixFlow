import { PartialType } from '@nestjs/swagger';
import { CreateComplaintTagDto } from './create-complaint-tag.dto.js';
export class UpdateComplaintTagDto extends PartialType(CreateComplaintTagDto) {
}
