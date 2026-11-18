import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { AssignmentStatus } from '../enums/assignment-status.enum.js';

export class AssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AssignmentStatus })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  staffProfileId?: number;

  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  complaintId?: number;
}
