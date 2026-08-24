import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type CommentListItem = Prisma.CommentGetPayload<{
  select: {
    id: true;
    body: true;
    parentCommentId: true;
    repliesCount: true;
    likesCount: true;
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
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  listByPost(postId: number): Promise<CommentListItem[]> {
    return this.prisma.comment.findMany({
      where: {
        postId,
        deletedAt: null,
      },
      select: {
        id: true,
        body: true,
        parentCommentId: true,
        repliesCount: true,
        likesCount: true,
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
        createdAt: 'asc',
      },
    });
  }
}
