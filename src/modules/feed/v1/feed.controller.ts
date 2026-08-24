import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { FeedService, type FeedPostItem } from '../feed.service';

@ApiTags('Feed')
@Controller({
  path: 'feed',
  version: '1',
})
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get the authenticated user home feed' })
  getHomeFeed(@CurrentUser() user: AuthUser): Promise<FeedPostItem[]> {
    return this.feedService.getHomeFeed(user.userId);
  }
}
