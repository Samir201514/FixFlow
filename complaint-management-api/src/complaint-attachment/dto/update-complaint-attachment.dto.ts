import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintAttachmentDto } from './create-complaint-attachment.dto.js';

export class UpdateComplaintAttachmentDto extends PartialType(CreateComplaintAttachmentDto) {}
