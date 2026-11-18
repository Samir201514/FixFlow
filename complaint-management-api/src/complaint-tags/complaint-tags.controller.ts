import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComplaintTagService } from './complaint-tags.service.js';
import { CreateComplaintTagDto } from './dto/create-complaint-tag.dto.js';

import { JwtGuards } from '../auth/jwtGuards.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@ApiTags('Complaint Tags')
@ApiBearerAuth()
@UseGuards(JwtGuards)
@Controller('complaints')
export class ComplaintTagController {
  constructor(private readonly tagService: ComplaintTagService) {}

  @Post(':id/tags')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Add a tag to a complaint (Admin/Staff)' })
  addTag(
    @Param('id') complaintId: string,
    @Body() dto: CreateComplaintTagDto,
  ) {
    return this.tagService.addTag(+complaintId, dto);
  }

  @Get(':id/tags')
  @ApiOperation({ summary: 'Get all tags for a specific complaint' })
  getTagsForComplaint(@Param('id') complaintId: string) {
    return this.tagService.findByComplaint(+complaintId);
  }

  @Delete('tags/:tagId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Remove a tag by its ID (Admin/Staff)' })
  removeTag(@Param('tagId') tagId: string) {
    return this.tagService.removeTag(+tagId);
  }
}