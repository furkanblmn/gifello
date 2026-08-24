import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import {
  NotificationsService,
  type NotificationListItem,
} from '../notifications.service';

@ApiTags('Notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List notifications for the current user' })
  listForCurrentUser(
    @CurrentUser() user: AuthUser,
  ): Promise<NotificationListItem[]> {
    return this.notificationsService.listForUser(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  markAsRead(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationListItem> {
    return this.notificationsService.markAsRead(user.userId, id);
  }
}
