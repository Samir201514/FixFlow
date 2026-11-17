import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'ars@gmail.com',
    description: 'Unique email address of the user',
    maxLength: 150,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    example: 'Str0ngP@$$w0rd',
    description:
      'Must contain uppercase, lowercase, number and special character',
    minLength: 8,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
