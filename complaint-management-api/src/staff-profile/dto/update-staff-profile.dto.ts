import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffProfileDto } from './create-staff-profile.dto.js';

export class UpdateStaffProfileDto extends PartialType(CreateStaffProfileDto) {}
