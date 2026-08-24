import { Prisma } from '@prisma/client';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export type ConversationListItem = Prisma.ConversationParticipantGetPayload<{
  include: {
    conversation: {
      include: {
        participants: {
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
        lastMessage: {
          select: {
            id: true;
            body: true;
            messageType: true;
            createdAt: true;
          };
        };
      };
    };
  };
}>;

export type MessageListItem = Prisma.MessageGetPayload<{
  include: {
    senderUser: {
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
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  listConversations(userId: number): Promise<ConversationListItem[]> {
    return this.prisma.conversationParticipant.findMany({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                leftAt: null,
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
            lastMessage: {
              select: {
                id: true,
                body: true,
                messageType: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async listMessages(
    userId: number,
    conversationId: number,
  ): Promise<MessageListItem[]> {
    const membership = await this.prisma.conversationParticipant.findFirst({
      where: {
        userId,
        conversationId,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a participant in this conversation.',
      );
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        senderUser: {
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
