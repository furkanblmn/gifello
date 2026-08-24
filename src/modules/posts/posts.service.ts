import { PostType, Prisma, type PostMedia } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreatePostDto } from './dto/create-post.dto';

type PostAuthorSummary = {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type UserLocationRow = {
  id: number;
  username?: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
};

type AppSettingLookup = {
  value: string;
};

type AppSettingDelegate = {
  findUnique(args: {
    where: {
      key: string;
    };
    select: {
      value: true;
    };
  }): Promise<AppSettingLookup | null>;
};

export type PostListItem = {
  id: number;
  type: PostType;
  hasScent: boolean;
  caption: string | null;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  mediaCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  user: PostAuthorSummary;
  mediaItems: Array<{
    id: number;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    sortOrder: number;
  }>;
};

export type PostDetailComment = {
  id: number;
  body: string;
  parentCommentId: number | null;
  repliesCount: number;
  likesCount: number;
  createdAt: Date;
  user: PostAuthorSummary;
};

export type PostDetail = {
  id: number;
  userId: number;
  type: PostType;
  hasScent: boolean;
  caption: string | null;
  visibility: string;
  commentsDisabled: boolean;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  mediaCount: number;
  publishedAt: Date | null;
  archivedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: PostAuthorSummary;
  mediaItems: PostMedia[];
  comments: PostDetailComment[];
};

type SelectedPostListRow = Prisma.PostGetPayload<{
  select: {
    id: true;
    type: true;
    hasScent: true;
    caption: true;
    visibility: true;
    likesCount: true;
    commentsCount: true;
    savesCount: true;
    mediaCount: true;
    publishedAt: true;
    createdAt: true;
    user: {
      select: {
        id: true;
        username: true;
        displayName: true;
        avatarUrl: true;
      };
    };
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
}>;

type SelectedPostDetailRow = Prisma.PostGetPayload<{
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
    comments: {
      include: {
        user: {
          select: {
            id: true;
            username: true;
            displayName: true;
            avatarUrl: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(type?: PostType): Promise<PostListItem[]> {
    const rows = await this.prisma.post.findMany({
      where: {
        ...(type ? { type } : {}),
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
        savesCount: true,
        mediaCount: true,
        publishedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
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
        publishedAt: 'desc',
      },
      take: 20,
    });

    return rows.map((row) => this.toPostListItem(row));
  }

  async getById(id: number): Promise<PostDetail> {
    const post = await this.prisma.post.findUnique({
      where: { id },
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
        comments: {
          where: {
            deletedAt: null,
            parentCommentId: null,
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
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 20,
        },
      },
    });

    if (!post || post.deletedAt || !post.publishedAt) {
      throw new NotFoundException('Post not found.');
    }

    return this.toPostDetail(post);
  }

  async create(user: AuthUser, dto: CreatePostDto): Promise<PostDetail> {
    const type = dto.type ?? PostType.STANDARD;
    const mediaItems = dto.mediaItems ?? [];
    const caption = dto.caption.trim();
    const hasScent = dto.hasScent ?? false;

    if (!caption) {
      throw new BadRequestException('Post caption is required.');
    }

    if (type === PostType.GOSSIP_CAULDRON && mediaItems.length > 0) {
      throw new BadRequestException(
        'Gossip cauldron posts are text-only and cannot include media.',
      );
    }

    if (hasScent) {
      const authorLocation = await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          latitude: true,
          longitude: true,
        },
      });

      if (!authorLocation?.latitude || !authorLocation.longitude) {
        throw new BadRequestException(
          'Scent posts require the author to have a saved location.',
        );
      }
    }

    const createdPost = await this.prisma.post.create({
      data: {
        userId: user.userId,
        type,
        hasScent,
        caption,
        visibility: dto.visibility ?? 'PUBLIC',
        commentsDisabled: dto.commentsDisabled ?? false,
        mediaCount: mediaItems.length,
        publishedAt: new Date(),
        mediaItems: mediaItems.length
          ? {
              create: mediaItems.map((item, index) => ({
                mediaType: item.mediaType,
                storageKey: item.storageKey,
                mediaUrl: item.mediaUrl,
                thumbnailUrl: item.thumbnailUrl ?? null,
                mimeType: item.mimeType ?? null,
                width: item.width ?? null,
                height: item.height ?? null,
                durationMs: item.durationMs ?? null,
                fileSizeBytes: item.fileSizeBytes ?? null,
                sortOrder: index,
              })),
            }
          : undefined,
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
        comments: {
          where: {
            deletedAt: null,
            parentCommentId: null,
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
          },
        },
      },
    });

    await this.prisma.user.update({
      where: { id: user.userId },
      data: {
        postsCount: {
          increment: 1,
        },
      },
    });

    if (hasScent) {
      await this.notifyNearbyUsersForScentPost(
        createdPost.id,
        user.userId,
        caption,
      );
    }

    return this.toPostDetail(createdPost);
  }

  async listGossipCauldron(): Promise<PostListItem[]> {
    return this.list(PostType.GOSSIP_CAULDRON);
  }

  private toPostListItem(row: SelectedPostListRow): PostListItem {
    return {
      id: row.id,
      type: row.type,
      hasScent: row.hasScent,
      caption: row.caption,
      visibility: row.visibility,
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      savesCount: row.savesCount,
      mediaCount: row.mediaCount,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      user: row.user,
      mediaItems: row.mediaItems.map((item) => ({
        id: item.id,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        sortOrder: item.sortOrder,
      })),
    };
  }

  private toPostDetail(row: SelectedPostDetailRow): PostDetail {
    const hasScent =
      'hasScent' in row && typeof row.hasScent === 'boolean'
        ? row.hasScent
        : false;

    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      hasScent,
      caption: row.caption,
      visibility: row.visibility,
      commentsDisabled: row.commentsDisabled,
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      savesCount: row.savesCount,
      mediaCount: row.mediaCount,
      publishedAt: row.publishedAt,
      archivedAt: row.archivedAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
      mediaItems: row.mediaItems,
      comments: row.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        parentCommentId: comment.parentCommentId,
        repliesCount: comment.repliesCount,
        likesCount: comment.likesCount,
        createdAt: comment.createdAt,
        user: comment.user,
      })),
    };
  }

  private async notifyNearbyUsersForScentPost(
    postId: number,
    actorUserId: number,
    caption: string,
  ) {
    const actor = (await this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: {
        id: true,
        username: true,
        latitude: true,
        longitude: true,
      },
    })) as UserLocationRow | null;

    if (!actor?.latitude || !actor.longitude) {
      return;
    }

    const radiusMeters = await this.getScentRadiusMeters();
    const candidateUsers = (await this.prisma.user.findMany({
      where: {
        id: {
          not: actorUserId,
        },
        status: 'ACTIVE',
        deletedAt: null,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
      },
    })) as UserLocationRow[];

    const nearbyUserIds = candidateUsers
      .filter((candidate) => {
        if (!candidate.latitude || !candidate.longitude) {
          return false;
        }

        const distance = this.calculateDistanceMeters(
          Number(actor.latitude),
          Number(actor.longitude),
          Number(candidate.latitude),
          Number(candidate.longitude),
        );

        return distance <= radiusMeters;
      })
      .map((candidate) => candidate.id);

    if (!nearbyUserIds.length) {
      return;
    }

    await this.prisma.notification.createMany({
      data: nearbyUserIds.map((recipientUserId) => ({
        recipientUserId,
        actorUserId,
        type: 'SCENT_POST_NEARBY',
        postId,
        title: 'Yakınında yeni bir koku postu var',
        body: caption.slice(0, 160),
      })),
    });
  }

  private async getScentRadiusMeters(): Promise<number> {
    const appSettingDelegate = this.prisma
      .appSetting as unknown as AppSettingDelegate;

    const setting = await appSettingDelegate.findUnique({
      where: {
        key: 'POST_SCENT_RADIUS_METERS',
      },
      select: {
        value: true,
      },
    });

    const parsed = Number(setting?.value ?? '300');

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 300;
    }

    return parsed;
  }

  private calculateDistanceMeters(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    const earthRadiusMeters = 6_371_000;
    const dLat = this.toRadians(toLat - fromLat);
    const dLng = this.toRadians(toLng - fromLng);
    const lat1 = this.toRadians(fromLat);
    const lat2 = this.toRadians(toLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
