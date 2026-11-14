import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsIn,
  Matches,
  IsPhoneNumber,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim().toUpperCase())
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
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

  @IsPhoneNumber()
  @IsOptional()
  @MaxLength(15)
  phone: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Role must be ADMIN, STAFF, or USER' })
  role: UserRole;
}
