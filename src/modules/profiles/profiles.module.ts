import { Module } from '@nestjs/common';
import { ProfilesController } from './v1/profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
