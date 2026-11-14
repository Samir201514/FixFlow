import { Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { NotificationQueryDto } from './dto/notification-query.dto.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@CurrentUser() user: any, @Query() query: NotificationQueryDto) {
    return this.notificationsService.findMine(user.userId, query);
  }

  // Keep this route before :id/read so "read-all" is not parsed as an id.
  @Patch('read-all')
  markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllRead(user.userId);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.notificationsService.markRead(id, user.userId);
  }
}
