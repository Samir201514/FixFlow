import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';
import { UserRoles } from '../common/enums/user-roles.enum.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser({
      ...dto,
      role: UserRoles.USER,
    });

    if (!user) {
      throw new BadRequestException('Something is wrong.');
    }

    return {
      message: 'User Registertion Successful.',
      data: {
        userId: user.data.userId,
        name: user.data.name,
        email: user.data.email,
        phone: user.data.phone,
        role: user.data.role,
        createdAt: user.data.createdAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const pass = await bcrypt.compare(dto.password, user.password);

    if (!pass) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account is deactivated');
    }

    const access_token = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
      role: user.role,
    });

    const time = this.jwtService.decode(access_token) as {
      iat: number;
      exp: number;
    };

    return {
      message: 'Login Successful',
      data: {
        accessToken: access_token,
        expiresIn: `${(time.exp - time.iat)/60} min`,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async profile(id: number) {
    const user = await this.usersService.findById(id);

    return {
      message: `User with ID:${id} Profile Retrieved Successfully.`,
      data: user.data,
    };
  }
}
