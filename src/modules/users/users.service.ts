import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type UserListItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    displayName: true;
    avatarUrl: true;
    bio: true;
    isPrivate: true;
    followersCount: true;
    followingCount: true;
    postsCount: true;
    createdAt: true;
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<UserListItem[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isPrivate: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
