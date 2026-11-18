import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ComplaintAttachmentService } from './complaint-attachment.service.js';
import { CreateComplaintAttachmentDto } from './dto/create-complaint-attachment.dto.js';
import { UpdateComplaintAttachmentDto } from './dto/update-complaint-attachment.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/interfaces/auth-user.interface.js';

@UseGuards(JwtAuthGuard)
@Controller('complaint-attachment')
export class ComplaintAttachmentController {
    constructor(private readonly complaintAttachmentService: ComplaintAttachmentService) { }
    @Post()
    async create(
    @Body()
    dto: CreateComplaintAttachmentDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintAttachmentService.create(
            dto.complaintId,
            user.userId,
            dto,
        );
    }   

    @Patch(':id')
    async update(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    updateComplaintAttachmentDto: UpdateComplaintAttachmentDto) {
        return await this.complaintAttachmentService.update(id, updateComplaintAttachmentDto);
    }
    
    @Delete(':id')
    remove(
    @Param('id', ParseIntPipe)
    id: number) {
        return this.complaintAttachmentService.remove(id);
    }
}
