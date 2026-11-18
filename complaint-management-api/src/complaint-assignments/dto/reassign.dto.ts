import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { AssignComplaintDto } from './assign-complaint.dto.js';

export class ReassignDto extends OmitType(AssignComplaintDto, [
    'complaintId',
] as const) {
    @ApiPropertyOptional({ example: 'Original technician is on leave' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    remarks?: string;
}
