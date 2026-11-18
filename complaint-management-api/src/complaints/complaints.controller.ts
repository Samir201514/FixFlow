import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service.js';
import { Complaint } from './entities/complaint.entity.js';
import { CreateComplaintDto } from './dto/create-complaint.dto.js';
import { UpdateComplaintDto } from './dto/update-complaint.dto.js';
import { ReviewComplaintDto } from './dto/review-complaint.dto.js';
import { ReopenComplaintDto } from './dto/reopen-complaint.dto.js';
import { ComplaintQueryDto } from './dto/complaint-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AuditEntity } from '../common/decorators/audit-entity.decorator.js';
import { UserRoles as Role } from '../common/enums/user-roles.enum.js';
import type { AuthUser } from '../common/interfaces/auth-user.interface.js';
@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@AuditEntity(Complaint)
@Controller('complaints')
export class ComplaintsController {
    constructor(private readonly complaintsService: ComplaintsService) { }
    @Post()
    @Roles(Role.USER)
    @ApiOperation({ summary: 'Submit a complaint' })
    create(
    @CurrentUser()
    user: AuthUser, 
    @Body()
    dto: CreateComplaintDto) {
        return this.complaintsService.create(user.userId, dto);
    }
    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'List all complaints (admin)' })
    findAll(
    @Query()
    query: ComplaintQueryDto) {
        return this.complaintsService.findAll(query);
    }
    @Get('my')
    @Roles(Role.USER)
    @ApiOperation({ summary: 'List the complaints I reported' })
    findMine(
    @CurrentUser()
    user: AuthUser, 
    @Query()
    query: ComplaintQueryDto) {
        return this.complaintsService.findMine(user.userId, query);
    }
    @Get('track/:trackingCode')
    @ApiOperation({ summary: 'Find a complaint by its tracking code' })
    findByTrackingCode(
    @Param('trackingCode')
    trackingCode: string, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.findByTrackingCode(trackingCode, user);
    }
    @Get(':id')
    @ApiOperation({ summary: 'Get one complaint' })
    findOne(
    @Param('id', ParseIntPipe)
    id: number, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.findOne(id, user);
    }
    @Get(':id/history')
    @ApiOperation({ summary: 'Status history of a complaint' })
    getHistory(
    @Param('id', ParseIntPipe)
    id: number, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.getHistory(id, user);
    }
    @Patch(':id')
    @Roles(Role.USER, Role.ADMIN)
    @ApiOperation({ summary: 'Edit a complaint' })
    update(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: UpdateComplaintDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.update(id, dto, user);
    }
    @Delete(':id')
    @Roles(Role.USER, Role.ADMIN)
    @ApiOperation({ summary: 'Soft delete a complaint' })
    remove(
    @Param('id', ParseIntPipe)
    id: number, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.remove(id, user);
    }
    @Patch(':id/review')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Review a complaint and set its priority' })
    review(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: ReviewComplaintDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.review(id, dto, user);
    }
    @Patch(':id/confirm')
    @Roles(Role.USER)
    @ApiOperation({ summary: 'Reporter confirms the resolution' })
    confirm(
    @Param('id', ParseIntPipe)
    id: number, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.confirm(id, user);
    }
    @Patch(':id/reopen')
    @Roles(Role.USER)
    @ApiOperation({ summary: 'Reporter reopens a resolved complaint' })
    reopen(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: ReopenComplaintDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.complaintsService.reopen(id, dto, user);
    }
}
