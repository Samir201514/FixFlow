import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service.js';
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { FeedbackQueryDto } from './dto/feedback-query.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuditEntity } from '../common/decorators/audit-entity.decorator.js';
import { Feedback } from './entities/feedback.entity.js';
import { UserRoles } from '../common/enums/user-roles.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('Feedback')
@ApiBearerAuth()
@AuditEntity(Feedback, { loadBefore: false })
@UseGuards(JwtAuthGuard)
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('complaints/:id/feedback')
  @UseGuards(RolesGuard)
  @Roles(UserRoles.ADMIN)
  create(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: any,
  ) {
    return this.feedbackService.create(id, dto, user);
  }

  @Get('complaints/:id/feedback')
  findByComplaint(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.feedbackService.findByComplaint(id, user);
  }

  @Get('feedback')
  @UseGuards(RolesGuard)
  @Roles(UserRoles.ADMIN)
  findAll(@Query() query: FeedbackQueryDto) {
    return this.feedbackService.findAll(query);
  }
}
