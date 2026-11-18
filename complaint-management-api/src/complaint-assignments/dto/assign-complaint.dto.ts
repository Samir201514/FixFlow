import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AssignComplaintDto {
  @ApiProperty({ example: 101 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  complaintId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  staffProfileId: number;

  @ApiPropertyOptional({ example: 'Senior electrician needed' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  assignmentNote?: string;
}
