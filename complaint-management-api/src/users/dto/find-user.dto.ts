import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRoles } from '../../common/enums/user-roles.enum.js';

export class FindUserDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page: number = 1;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;

  @IsEnum(UserRoles)
  @IsOptional()
  role?: UserRoles;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  })
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
