import { Module } from '@nestjs/common';
import { LikesController } from './v1/likes.controller';
import { LikesService } from './likes.service';

@Module({
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
