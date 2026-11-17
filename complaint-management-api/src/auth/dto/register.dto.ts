import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim().toUpperCase())
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(200)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;
}
