import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

type FollowUserSummary = {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type FollowFollowerListItem = {
  id: number;
  createdAt: Date;
  follower: FollowUserSummary;
};

export type FollowFollowingListItem = {
  id: number;
  createdAt: Date;
  following: FollowUserSummary;
};

export type FollowRequestListItem = {
  id: number;
  requesterUserId: number;
  targetUserId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt: Date | null;
  requester: FollowUserSummary;
};

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async listFollowers(userId: number): Promise<FollowFollowerListItem[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followingUserId: userId },
      select: {
        id: true,
        createdAt: true,
        follower: {
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

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      follower: row.follower,
    }));
  }

  async listFollowing(userId: number): Promise<FollowFollowingListItem[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followerUserId: userId },
      select: {
        id: true,
        createdAt: true,
        following: {
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

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      following: row.following,
    }));
  }

  async listReceivedRequests(userId: number): Promise<FollowRequestListItem[]> {
    const rows = await this.prisma.followRequest.findMany({
      where: {
        targetUserId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
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

    return rows.map((row) => ({
      id: row.id,
      requesterUserId: row.requesterUserId,
      targetUserId: row.targetUserId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      respondedAt: row.respondedAt,
      requester: row.requester,
    }));
  }
}
