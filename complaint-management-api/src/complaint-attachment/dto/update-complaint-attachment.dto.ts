import { PartialType } from '@nestjs/swagger';
import { CreateComplaintAttachmentDto } from './create-complaint-attachment.dto.js';

export class UpdateComplaintAttachmentDto extends PartialType(CreateComplaintAttachmentDto) {}