import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Electrical Maintenance' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @IsNotEmpty() @Length(2, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Wiring, lights, projectors' })
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'electrical@campus.edu' })
  @IsOptional() @IsEmail() @MaxLength(150)
  contactEmail?: string;
}