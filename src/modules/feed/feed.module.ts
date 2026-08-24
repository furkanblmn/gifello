import { Module } from '@nestjs/common';
import { FeedController } from './v1/feed.controller';
import { FeedService } from './feed.service';

@Module({
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
