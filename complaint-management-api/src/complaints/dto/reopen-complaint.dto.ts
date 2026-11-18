import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ReopenComplaintDto {
  @ApiProperty({ example: 'The projector still shows no signal after the fix.' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 500)
  reason: string;
}
