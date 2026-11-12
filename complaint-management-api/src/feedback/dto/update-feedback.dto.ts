import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackDto } from './create-feedback.dto.js';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {}
