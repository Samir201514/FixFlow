import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintAssignmentDto {
  @ApiProperty({ description: 'ID of the staff member to assign' })
  @IsNumber()
  @IsNotEmpty()
  assigneeId: number;

  @ApiPropertyOptional({ description: 'Optional remarks or instructions for the assignment' })
  @IsString()
  @IsOptional()
  remarks?: string;
}