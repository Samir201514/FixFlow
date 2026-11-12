import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComplaintTagsService } from './complaint-tags.service.js';
import { CreateComplaintTagDto } from './dto/create-complaint-tag.dto.js';
import { UpdateComplaintTagDto } from './dto/update-complaint-tag.dto.js';

@Controller('complaint-tags')
export class ComplaintTagsController {
  constructor(private readonly complaintTagsService: ComplaintTagsService) {}

  @Post()
  create(@Body() createComplaintTagDto: CreateComplaintTagDto) {
    return this.complaintTagsService.create(createComplaintTagDto);
  }

  @Get()
  findAll() {
    return this.complaintTagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintTagsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComplaintTagDto: UpdateComplaintTagDto) {
    return this.complaintTagsService.update(+id, updateComplaintTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintTagsService.remove(+id);
  }
}
