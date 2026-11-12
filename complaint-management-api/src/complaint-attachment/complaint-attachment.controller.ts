import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComplaintAttachmentService } from './complaint-attachment.service.js';
import { CreateComplaintAttachmentDto } from './dto/create-complaint-attachment.dto.js';
import { UpdateComplaintAttachmentDto } from './dto/update-complaint-attachment.dto.js';

@Controller('complaint-attachment')
export class ComplaintAttachmentController {
  constructor(private readonly complaintAttachmentService: ComplaintAttachmentService) {}

  @Post()
  create(@Body() createComplaintAttachmentDto: CreateComplaintAttachmentDto) {
    return this.complaintAttachmentService.create(createComplaintAttachmentDto);
  }

  @Get()
  findAll() {
    return this.complaintAttachmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintAttachmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComplaintAttachmentDto: UpdateComplaintAttachmentDto) {
    return this.complaintAttachmentService.update(+id, updateComplaintAttachmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintAttachmentService.remove(+id);
  }
}
