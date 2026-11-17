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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Arafat Rahman Samir',
    description: 'Full name of the user',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim().toUpperCase())
  name: string;

  @ApiProperty({
    example: 'ars@gmail.com',
    description: 'Unique email address',
    maxLength: 100,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
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
  @MinLength(8)
  @MaxLength(200)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiPropertyOptional({
    example: '+8801234567891',
    description: 'Phone number',
  })
  @IsPhoneNumber()
  @IsOptional()
  @MaxLength(15)
  phone: string;

  @ApiProperty({
    enum: UserRoles,
    example: UserRoles.STAFF,
    description: 'Role assigned to the new user',
  })
  @IsNotEmpty()
  @IsEnum(UserRoles, { message: 'Role must be ADMIN, STAFF, or USER' })
  role: UserRoles;
}
