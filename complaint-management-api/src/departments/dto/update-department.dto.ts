import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { CreateDepartmentDto } from './create-department.dto.js';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 3,
    nullable: true,
    description: 'User id of the new head. Send null to clear the head.',
  })
  @IsOptional() // undefined আর null দুটোই validation বাদ দেয়, তাই null সার্ভিসে পৌঁছায়
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentHeadId?: number | null;
}