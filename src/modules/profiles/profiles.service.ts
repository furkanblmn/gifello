import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type ProfileDetail = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    displayName: true;
    firstName: true;
    lastName: true;
    bio: true;
    website: true;
    avatarUrl: true;
    coverUrl: true;
    isPrivate: true;
    followersCount: true;
    followingCount: true;
    postsCount: true;
    createdAt: true;
    posts: {
      select: {
        id: true;
        type: true;
        hasScent: true;
        caption: true;
        visibility: true;
        likesCount: true;
        commentsCount: true;
        mediaCount: true;
        publishedAt: true;
        mediaItems: {
          select: {
            id: true;
            mediaType: true;
            mediaUrl: true;
            thumbnailUrl: true;
            sortOrder: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUsername(username: string): Promise<ProfileDetail> {
    const profile = await this.prisma.user.findUnique({
      where: {
        username: username.trim().toLowerCase(),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        bio: true,
        website: true,
        avatarUrl: true,
        coverUrl: true,
        isPrivate: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true,
        posts: {
          where: {
            deletedAt: null,
            publishedAt: {
              not: null,
            },
          },
          select: {
            id: true,
            type: true,
            hasScent: true,
            caption: true,
            visibility: true,
            likesCount: true,
            commentsCount: true,
            mediaCount: true,
            publishedAt: true,
            mediaItems: {
              select: {
                id: true,
                mediaType: true,
                mediaUrl: true,
                thumbnailUrl: true,
                sortOrder: true,
              },
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 12,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }

    return profile;
  }
}
