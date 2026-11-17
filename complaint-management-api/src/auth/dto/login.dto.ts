import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
