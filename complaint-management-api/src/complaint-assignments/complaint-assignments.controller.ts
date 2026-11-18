import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplaintAssignmentService } from './complaint-assignments.service.js';
import { ComplaintAssignment } from './entities/complaint-assignment.entity.js';
import { AssignComplaintDto } from './dto/assign-complaint.dto.js';
import { ReassignDto } from './dto/reassign.dto.js';
import { RejectAssignmentDto } from './dto/reject-assignment.dto.js';
import { ProgressDto } from './dto/progress.dto.js';
import { ResolveAssignmentDto } from './dto/resolve-assignment.dto.js';
import { AssignmentQueryDto } from './dto/assignment-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AuditEntity } from '../common/decorators/audit-entity.decorator.js';
import { UserRoles as Role } from '../common/enums/user-roles.enum.js';
import type { AuthUser } from '../common/interfaces/auth-user.interface.js';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@AuditEntity(ComplaintAssignment)
@Controller('assignments')
export class ComplaintAssignmentController {
    constructor(private readonly assignmentService: ComplaintAssignmentService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Assign a complaint to a staff member (transaction)' })
    assign(
    @Body()
    dto: AssignComplaintDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.assign(dto, user);
    }
    
    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'List all assignments' })
    findAll(
    @Query()
    query: AssignmentQueryDto) {
        return this.assignmentService.findAll(query);
    }

    @Get('my')
    @Roles(Role.STAFF)
    @ApiOperation({ summary: 'Assignments of the logged in staff member' })
    findMine(
    @CurrentUser()
    user: AuthUser, 
    @Query()
    query: AssignmentQueryDto) {
        return this.assignmentService.findMine(user.userId, query);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Get one assignment' })
    findOne(
    @Param('id', ParseIntPipe)
    id: number, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.findOne(id, user);
    }

    @Patch(':id/reassign')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Give the complaint to another staff member (transaction)' })
    reassign(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: ReassignDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.reassign(id, dto, user);
    }

    @Patch(':id/accept')
    @Roles(Role.STAFF)
    @ApiOperation({ summary: 'Accept the assignment' })
    accept(
    @Param('id', ParseIntPipe)
    id: number, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.accept(id, user);
    }

    @Patch(':id/reject')
    @Roles(Role.STAFF)
    @ApiOperation({ summary: 'Reject the assignment with a reason' })
    reject(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: RejectAssignmentDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.reject(id, dto, user);
    }

    @Patch(':id/progress')
    @Roles(Role.STAFF)
    @ApiOperation({ summary: 'Add a progress remark' })
    progress(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: ProgressDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.progress(id, dto, user);
    }
    
    @Patch(':id/resolve')
    @Roles(Role.STAFF)
    @ApiOperation({ summary: 'Mark the work as resolved' })
    resolve(
    @Param('id', ParseIntPipe)
    id: number, 
    @Body()
    dto: ResolveAssignmentDto, 
    @CurrentUser()
    user: AuthUser) {
        return this.assignmentService.resolve(id, dto, user);
    }
}
