import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type PostLikeListItem = Prisma.PostLikeGetPayload<{
  select: {
    id: true;
    createdAt: true;
    user: {
      select: {
        id: true;
        username: true;
        displayName: true;
        avatarUrl: true;
      };
    };
  };
}>;

export type CommentLikeListItem = Prisma.CommentLikeGetPayload<{
  select: {
    id: true;
    createdAt: true;
    user: {
      select: {
        id: true;
        username: true;
        displayName: true;
        avatarUrl: true;
      };
    };
  };
}>;

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  listPostLikes(postId: number): Promise<PostLikeListItem[]> {
    return this.prisma.postLike.findMany({
      where: { postId },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  listCommentLikes(commentId: number): Promise<CommentLikeListItem[]> {
    return this.prisma.commentLike.findMany({
      where: { commentId },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
