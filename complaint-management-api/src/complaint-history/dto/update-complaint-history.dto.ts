import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintHistoryDto } from './create-complaint-history.dto.js';

export class UpdateComplaintHistoryDto extends PartialType(CreateComplaintHistoryDto) {}
