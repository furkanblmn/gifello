import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type FeedPostItem = Prisma.PostGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        displayName: true;
        avatarUrl: true;
      };
    };
    mediaItems: true;
  };
}>;

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeFeed(userId: number): Promise<FeedPostItem[]> {
    const follows = await this.prisma.follow.findMany({
      where: {
        followerUserId: userId,
      },
      select: {
        followingUserId: true,
      },
    });

    const authorIds = [
      userId,
      ...follows.map((follow) => follow.followingUserId),
    ];

    return this.prisma.post.findMany({
      where: {
        userId: {
          in: authorIds,
        },
        deletedAt: null,
        publishedAt: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        mediaItems: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 25,
    });
  }
}
