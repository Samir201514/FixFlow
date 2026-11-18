import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DepartmentsService } from "./departments.service.js";
import { Department } from "./entities/department.entity.js";
import { CreateDepartmentDto } from "./dto/create-department.dto.js";
import { UpdateDepartmentDto } from "./dto/update-department.dto.js";
import { DepartmentQueryDto } from "./dto/department-query.dto.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { AuditEntity } from "../common/decorators/audit-entity.decorator.js";
import { UserRole } from "../users/enums/user-role.enum.js";
import { User } from "../users/entities/user.entity.js";

@ApiTags("Departments")
@ApiBearerAuth()
@AuditEntity(Department)
@Controller("departments") 
export class DepartmentsController {
  
  constructor(private departmentsService: DepartmentsService) {}


  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  
  @Get()
  findAll(@Query() query: DepartmentQueryDto, @CurrentUser() actor: User) {
    return this.departmentsService.findAll(query, actor);
  }

  // GET /departments/5 : login kora user re khujbo 
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @CurrentUser() actor: User) {
    return this.departmentsService.findOne(id, actor);
  }

  // PATCH /departments/5 : update only admin
  @Patch(":id")
  @Roles(UserRole.ADMIN)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, dto);
  }

  // DELETE /departments/5 : dlt only admin
  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }
}
