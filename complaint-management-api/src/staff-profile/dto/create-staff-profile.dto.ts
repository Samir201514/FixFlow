import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateStaffProfileDto {
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId: number;

  @ApiProperty({ example: "EMP-003" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  employeeCode: string;

  @ApiProperty({ example: "Electrician" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  designation: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
