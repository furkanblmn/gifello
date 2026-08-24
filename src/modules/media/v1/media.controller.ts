import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MediaService } from '../media.service';
import type { PostMedia } from '@prisma/client';

@ApiTags('Media')
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('posts/:postId')
  @ApiOperation({ summary: 'List media items for a post' })
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  listForPost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<PostMedia[]> {
    return this.mediaService.listForPost(postId);
  }
}
