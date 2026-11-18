import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
    create(
    @Body()
    dto: CreateComplaintAttachmentDto, 
    @CurrentUser()
    user: AuthUser) {
        const data = dto as any;
        return this.complaintAttachmentService.create(data.complaintId ?? 0, user?.userId ?? 0, data);
    }

    @Get()
    findAll() {
        return this.complaintAttachmentService.findAll();
    }
    @Get(':id')
    findOne(
    @Param('id')
    id: string) {
        return this.complaintAttachmentService.findOne(+id);
    }

    @Patch(':id')
    update(
    @Param('id')
    id: string, 
    @Body()
    updateComplaintAttachmentDto: UpdateComplaintAttachmentDto) {
        return this.complaintAttachmentService.update(+id, updateComplaintAttachmentDto);
    }
    
    @Delete(':id')
    remove(
    @Param('id')
    id: string) {
        return this.complaintAttachmentService.remove(+id);
    }
}
