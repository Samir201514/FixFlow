import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class TagQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'urg', description: 'Search in tag name' })
  @IsOptional()
  @IsString()
  search?: string;
}