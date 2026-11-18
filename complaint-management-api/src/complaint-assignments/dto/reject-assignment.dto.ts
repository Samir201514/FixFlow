import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RejectAssignmentDto {
  @ApiProperty({ example: 'This needs a plumber, not an electrician' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 500)
  reason: string;
}
