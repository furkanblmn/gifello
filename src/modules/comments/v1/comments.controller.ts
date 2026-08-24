import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommentsService, type CommentListItem } from '../comments.service';

@ApiTags('Comments')
@Controller({
  path: 'comments',
  version: '1',
})
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: 'List comments for a post' })
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  listByPost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<CommentListItem[]> {
    return this.commentsService.listByPost(postId);
  }
}
