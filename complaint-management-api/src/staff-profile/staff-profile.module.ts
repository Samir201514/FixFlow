import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StaffProfile } from "./entities/staff-profile.entity.js";
import { User } from "../users/entities/user.entity.js";
import { Department } from "../departments/entities/department.entity.js";
import { StaffProfilesController } from "./staff-profile.controller.js";
import { StaffProfilesService } from "./staff-profile.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([StaffProfile, User, Department])],
  controllers: [StaffProfilesController],
  providers: [StaffProfilesService],
  exports: [StaffProfilesService, TypeOrmModule],
})
export class StaffProfilesModule {}
