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
  FollowsService,
  type FollowFollowerListItem,
  type FollowFollowingListItem,
  type FollowRequestListItem,
} from '../follows.service';

@ApiTags('Follows')
@Controller({
  path: 'follows',
  version: '1',
})
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get(':userId/followers')
  @ApiOperation({ summary: 'List followers for a user' })
  @ApiParam({ name: 'userId', type: Number, example: 1 })
  listFollowers(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<FollowFollowerListItem[]> {
    return this.followsService.listFollowers(userId);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'List accounts a user follows' })
  @ApiParam({ name: 'userId', type: Number, example: 1 })
  listFollowing(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<FollowFollowingListItem[]> {
    return this.followsService.listFollowing(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/received')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'List follow requests received by the current user',
  })
  listReceivedRequests(
    @CurrentUser() user: AuthUser,
  ): Promise<FollowRequestListItem[]> {
    return this.followsService.listReceivedRequests(user.userId);
  }
}
