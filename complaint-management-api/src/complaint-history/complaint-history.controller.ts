import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComplaintHistoryService } from './complaint-history.service.js';
import { CreateComplaintHistoryDto } from './dto/create-complaint-history.dto.js';
import { UpdateComplaintHistoryDto } from './dto/update-complaint-history.dto.js';

@Controller('complaint-history')
export class ComplaintHistoryController {
  constructor(private readonly complaintHistoryService: ComplaintHistoryService) {}

  @Post()
  create(@Body() createComplaintHistoryDto: CreateComplaintHistoryDto) {
    return this.complaintHistoryService.create(createComplaintHistoryDto);
  }

  @Get()
  findAll() {
    return this.complaintHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complaintHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComplaintHistoryDto: UpdateComplaintHistoryDto) {
    return this.complaintHistoryService.update(+id, updateComplaintHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.complaintHistoryService.remove(+id);
  }
}
