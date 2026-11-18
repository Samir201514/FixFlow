import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ProgressDto {
  @ApiProperty({ example: 'Replacement cable ordered' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  remarks: string;
}
