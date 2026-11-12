import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComplaintAssignmentsService } from './complaint-assignments.service.js';
import { CreateComplaintAssignmentDto } from './dto/create-complaint-assignment.dto.js';
import { UpdateComplaintAssignmentDto } from './dto/update-complaint-assignment.dto.js';

@Controller('complaint-assignments')
export class ComplaintAssignmentsController {
  constructor(private readonly complaintAssignmentsService: ComplaintAssignmentsService) {}

  @Post()
  create(@Body() createComplaintAssignmentDto: CreateComplaintAssignmentDto) {
    return this.complaintAssignmentsService.create(createComplaintAssignmentDto);
  }

  @Get()
  findAll() {
    return this.complaintAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComplaintAssignmentDto: UpdateComplaintAssignmentDto) {
    return this.complaintAssignmentsService.update(+id, updateComplaintAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintAssignmentsService.remove(+id);
  }
}
