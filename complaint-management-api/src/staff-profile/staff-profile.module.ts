import { Module } from '@nestjs/common';
import { StaffProfileService } from './staff-profile.service.js';
import { StaffProfileController } from './staff-profile.controller.js';

@Module({
  controllers: [StaffProfileController],
  providers: [StaffProfileService],
})
export class StaffProfileModule {}
