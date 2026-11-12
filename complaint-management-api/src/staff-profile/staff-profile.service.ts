import { Injectable } from '@nestjs/common';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto.js';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto.js';

@Injectable()
export class StaffProfileService {
  create(createStaffProfileDto: CreateStaffProfileDto) {
    return 'This action adds a new staffProfile';
  }

  findAll() {
    return `This action returns all staffProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} staffProfile`;
  }

  update(id: number, updateStaffProfileDto: UpdateStaffProfileDto) {
    return `This action updates a #${id} staffProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} staffProfile`;
  }
}
