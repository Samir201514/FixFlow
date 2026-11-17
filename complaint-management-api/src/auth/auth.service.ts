import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  create(registerDto: RegisterDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
}
