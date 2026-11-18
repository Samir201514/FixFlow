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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuditEntity } from "../common/decorators/audit-entity.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { UserRole } from "../users/enums/user-role.enum.js";
import { CreateTagDto } from "./dto/create-tag.dto.js";
import { TagQueryDto } from "./dto/tag-query.dto.js";
import { UpdateTagDto } from "./dto/update-tag.dto.js";
import { Tag } from "./entities/tag.entity.js";
import { TagsService } from "./tags.service.js";

@ApiTags("Tags")
@ApiBearerAuth()
@AuditEntity(Tag)
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a tag" })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List tags" })
  findAll(@Query() query: TagQueryDto) {
    return this.tagsService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one tag" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Rename / update a tag" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete a tag together with its complaint links" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
