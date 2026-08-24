import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
  ChatService,
  type ConversationListItem,
  type MessageListItem,
} from '../chat.service';

@ApiTags('Chat')
@Controller({
  path: 'chat',
  version: '1',
})
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List conversations for the current user' })
  listConversations(
    @CurrentUser() user: AuthUser,
  ): Promise<ConversationListItem[]> {
    return this.chatService.listConversations(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id/messages')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List messages for a conversation' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  listMessages(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) conversationId: number,
  ): Promise<MessageListItem[]> {
    return this.chatService.listMessages(user.userId, conversationId);
  }
}
