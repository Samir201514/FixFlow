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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto.js';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto.js';
import { StaffQueryDto } from './dto/staff-query.dto.js';
import { StaffProfile } from './entities/staff-profile.entity.js';
import { AuditEntity } from '../common/decorators/audit-entity.decorator.js';
import { StaffProfilesService } from './staff-profile.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRoles } from '../common/enums/user-roles.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@ApiTags('Staff Profiles')
@ApiBearerAuth()
@AuditEntity(StaffProfile)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff-profiles')
export class StaffProfilesController {
  constructor(private readonly service: StaffProfilesService) {}

  @Get()
  @Roles(UserRoles.ADMIN)
  @HttpCode(200)
  findAll(@Query() query: StaffQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @HttpCode(201)
  create(@Body() dto: CreateStaffProfileDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.STAFF)
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: any) {
    return this.service.findOne(id, actor);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN)
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffProfileDto,
  ) {
    return this.service.update(id, dto);
  }
}
