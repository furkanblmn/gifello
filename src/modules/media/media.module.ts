import { Module } from '@nestjs/common';
import { MediaController } from './v1/media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
