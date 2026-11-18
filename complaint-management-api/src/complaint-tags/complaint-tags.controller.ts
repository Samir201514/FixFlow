import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComplaintTagService } from './complaint-tags.service.js';
import { CreateComplaintTagDto } from './dto/create-complaint-tag.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRoles } from '../common/enums/user-roles.enum.js';
@ApiTags('Complaint Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')

export class ComplaintTagController {
    constructor(private readonly tagService: ComplaintTagService) { }
    @Post(':id/tags')
    @Roles(UserRoles.ADMIN, UserRoles.STAFF)
    @ApiOperation({ summary: 'Add a tag to a complaint (Admin/Staff)' })
    addTag(
    @Param('id')
    complaintId: string, 
    @Body()
    dto: CreateComplaintTagDto) {
        return this.tagService.addTag(+complaintId, dto);
    }

    @Get(':id/tags')
    @ApiOperation({ summary: 'Get all tags for a specific complaint' })
    getTagsForComplaint(
    @Param('id')
    complaintId: string) {
        return this.tagService.findByComplaint(+complaintId);
    }
    
    @Delete('tags/:tagId')
    @Roles(UserRoles.ADMIN, UserRoles.STAFF)
    @ApiOperation({ summary: 'Remove a tag by its ID (Admin/Staff)' })
    removeTag(
    @Param('tagId')
    tagId: string) {
        return this.tagService.removeTag(+tagId);
    }
}
