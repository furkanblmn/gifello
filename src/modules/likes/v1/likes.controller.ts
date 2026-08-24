import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  LikesService,
  type CommentLikeListItem,
  type PostLikeListItem,
} from '../likes.service';

@ApiTags('Likes')
@Controller({
  path: 'likes',
  version: '1',
})
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('posts/:postId')
  @ApiOperation({ summary: 'List likes for a post' })
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  listPostLikes(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<PostLikeListItem[]> {
    return this.likesService.listPostLikes(postId);
  }

  @Get('comments/:commentId')
  @ApiOperation({ summary: 'List likes for a comment' })
  @ApiParam({ name: 'commentId', type: Number, example: 1 })
  listCommentLikes(
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<CommentLikeListItem[]> {
    return this.likesService.listCommentLikes(commentId);
  }
}
