import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  Matches,
  IsPhoneNumber,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRoles } from '../../common/enums/user-roles.enum.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
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
  @IsEnum(UserRoles, { message: 'Role must be ADMIN, STAFF, or USER' })
  role: UserRoles;
}
