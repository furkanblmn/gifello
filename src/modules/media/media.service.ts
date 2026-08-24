import { type PostMedia } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  listForPost(postId: number): Promise<PostMedia[]> {
    return this.prisma.postMedia.findMany({
      where: { postId },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }
}
