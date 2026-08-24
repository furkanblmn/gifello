import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './v1/chat.controller';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
