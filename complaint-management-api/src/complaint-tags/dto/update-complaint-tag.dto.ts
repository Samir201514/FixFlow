import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintTagDto } from './create-complaint-tag.dto.js';

export class UpdateComplaintTagDto extends PartialType(CreateComplaintTagDto) {}
