import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreatePostDto } from '../dto/create-post.dto';
import { ListPostsFilterDto } from '../dto/list-posts-filter.dto';
import {
  PostsService,
  type PostDetail,
  type PostListItem,
} from '../posts.service';

@ApiTags('Posts')
@Controller({
  path: 'posts',
  version: '1',
})
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'List posts with optional filter payload' })
  @ApiBody({ type: ListPostsFilterDto })
  @Post()
  list(@Body() filter: ListPostsFilterDto): Promise<PostListItem[]> {
    return this.postsService.list(filter.type);
  }

  @Get('gossip-cauldron')
  @ApiOperation({ summary: 'List text-only gossip cauldron posts' })
  listGossipCauldron(): Promise<PostListItem[]> {
    return this.postsService.listGossipCauldron();
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a post. Gossip cauldron posts are text-only.',
  })
  @ApiBody({ type: CreatePostDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePostDto,
  ): Promise<PostDetail> {
    return this.postsService.create(user, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  getById(@Param('id', ParseIntPipe) id: number): Promise<PostDetail> {
    return this.postsService.getById(id);
  }
}
