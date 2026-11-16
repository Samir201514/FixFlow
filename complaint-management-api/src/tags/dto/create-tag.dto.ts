import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Urgent', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiPropertyOptional({ example: 'Needs same-day attention', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}