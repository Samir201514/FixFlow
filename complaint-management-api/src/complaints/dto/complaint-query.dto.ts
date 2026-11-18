import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ComplaintStatus } from '../enums/complaint-status.enum.js';
import { Priority } from '../enums/priority.enum.js';

export class ComplaintQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: ComplaintStatus })
    @IsOptional()
    @IsEnum(ComplaintStatus)
    status?: ComplaintStatus;
    @ApiPropertyOptional({ enum: Priority })
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number;
    @ApiPropertyOptional({ example: 1, description: 'Only complaints that carry this tag' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tagId?: number;
    @ApiPropertyOptional({ example: '2026-11-01', description: 'Created on or after this date' })
    @IsOptional()
    @IsDateString()
    from?: string;
    @ApiPropertyOptional({ example: '2026-11-30', description: 'Created up to the end of this date' })
    @IsOptional()
    @IsDateString()
    to?: string;
    @ApiPropertyOptional({ example: 'projector', description: 'Matches title or tracking code' })
    @IsOptional()
    @IsString()
    search?: string;
}
