import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type SearchUserItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    displayName: true;
    avatarUrl: true;
  };
}>;

export type SearchHashtagItem = Prisma.HashtagGetPayload<{
  select: {
    id: true;
    tag: true;
    normalizedTag: true;
    postsCount: true;
  };
}>;

export type SearchPostItem = Prisma.PostGetPayload<{
  select: {
    id: true;
    type: true;
    hasScent: true;
    caption: true;
    publishedAt: true;
    user: {
      select: {
        id: true;
        username: true;
        displayName: true;
      };
    };
  };
}>;

export type SearchResult = {
  users: SearchUserItem[];
  hashtags: SearchHashtagItem[];
  posts: SearchPostItem[];
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string): Promise<SearchResult> {
    const q = query.trim();

    if (!q) {
      return {
        users: [],
        hashtags: [],
        posts: [],
      };
    }

    const [users, hashtags, posts] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [{ username: { contains: q } }, { displayName: { contains: q } }],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
        take: 10,
      }),
      this.prisma.hashtag.findMany({
        where: {
          normalizedTag: { contains: q.toLowerCase() },
        },
        select: {
          id: true,
          tag: true,
          normalizedTag: true,
          postsCount: true,
        },
        take: 10,
      }),
      this.prisma.post.findMany({
        where: {
          caption: { contains: q },
          deletedAt: null,
          publishedAt: { not: null },
        },
        select: {
          id: true,
          type: true,
          hasScent: true,
          caption: true,
          publishedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
        take: 10,
      }),
    ]);

    return { users, hashtags, posts };
  }
}
