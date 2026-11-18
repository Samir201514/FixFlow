import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StaffProfilesService } from "./staff-profiles.service.js";
import { CreateStaffProfileDto } from "./dto/create-staff-profile.dto.js";
import { UpdateStaffProfileDto } from "./dto/update-staff-profile.dto.js";
import { StaffQueryDto } from "./dto/staff-query.dto.js";
import { StaffProfile } from "./entities/staff-profile.entity.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { AuditEntity } from "../common/decorators/audit-entity.decorator.js";
import { UserRole } from "../users/enums/user-role.enum.js";

@ApiTags("Staff Profiles")
@ApiBearerAuth()
@AuditEntity(StaffProfile)
@Controller("staff-profiles")
export class StaffProfilesController {
  constructor(private readonly service: StaffProfilesService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  findAll(@Query() query: StaffQueryDto) {
    return this.service.findAll(query);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(200)
  findOne(@Param("id", ParseIntPipe) id: number, @CurrentUser() actor: any) {
    return this.service.findOne(id, actor);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(201)
  create(@Body() dto: CreateStaffProfileDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStaffProfileDto,
  ) {
    return this.service.update(id, dto);
  }
}
