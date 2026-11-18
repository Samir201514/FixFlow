import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComplaintTagDto {
  @ApiProperty({ description: 'The name of the tag (e.g., Network, Plumbing)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tagName: string;
}