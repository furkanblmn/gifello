import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const seedPassword = 'Password123!';

type BcryptModule = {
  hash(value: string, rounds: number): Promise<string>;
};

type AppSettingDelegate = {
  deleteMany(): Promise<unknown>;
  createMany(args: {
    data: Array<{
      key: string;
      value: string;
    }>;
  }): Promise<unknown>;
};

const bcryptLib = bcrypt as unknown as BcryptModule;
const appSettingDelegate = prisma.appSetting as unknown as AppSettingDelegate;

async function main() {
  await appSettingDelegate.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.reportTarget.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reportReason.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.postHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.followRequest.deleteMany();
  await prisma.userBlock.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.userAuthAccount.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcryptLib.hash(seedPassword, 10);

  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice',
        phoneNumber: '+905551111111',
        passwordHash,
        displayName: 'Alice Carter',
        firstName: 'Alice',
        lastName: 'Carter',
        bio: 'Travel, coffee and photography.',
        website: 'https://alice.example.com',
        avatarUrl: 'https://cdn.example.com/avatars/alice.jpg',
        coverUrl: 'https://cdn.example.com/covers/alice.jpg',
        birthDate: new Date('1997-03-14T00:00:00.000Z'),
        gender: 'FEMALE',
        countryCode: 'TR',
        latitude: '41.0082400',
        longitude: '28.9783590',
        locationUpdatedAt: new Date('2026-04-09T08:20:00.000Z'),
        role: 'USER',
        status: 'ACTIVE',
        isPrivate: false,
        emailVerifiedAt: new Date('2026-01-10T10:00:00.000Z'),
        phoneVerifiedAt: new Date('2026-01-10T10:05:00.000Z'),
        followersCount: 1,
        followingCount: 1,
        postsCount: 2,
        lastLoginAt: new Date('2026-04-08T08:00:00.000Z'),
        lastSeenAt: new Date('2026-04-09T08:30:00.000Z'),
        createdAt: new Date('2026-01-10T09:00:00.000Z'),
        updatedAt: new Date('2026-04-09T08:30:00.000Z'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob',
        phoneNumber: '+905552222222',
        passwordHash,
        displayName: 'Bob Stone',
        firstName: 'Bob',
        lastName: 'Stone',
        bio: 'Fitness and startup life.',
        website: 'https://bob.example.com',
        avatarUrl: 'https://cdn.example.com/avatars/bob.jpg',
        coverUrl: 'https://cdn.example.com/covers/bob.jpg',
        birthDate: new Date('1995-07-22T00:00:00.000Z'),
        gender: 'MALE',
        countryCode: 'US',
        latitude: '41.0101200',
        longitude: '28.9799400',
        locationUpdatedAt: new Date('2026-04-09T09:00:00.000Z'),
        role: 'USER',
        status: 'ACTIVE',
        isPrivate: true,
        emailVerifiedAt: new Date('2026-01-11T11:00:00.000Z'),
        followersCount: 1,
        followingCount: 0,
        postsCount: 1,
        lastLoginAt: new Date('2026-04-08T11:20:00.000Z'),
        lastSeenAt: new Date('2026-04-09T09:10:00.000Z'),
        createdAt: new Date('2026-01-11T10:00:00.000Z'),
        updatedAt: new Date('2026-04-09T09:10:00.000Z'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        username: 'carol',
        phoneNumber: '+905553333333',
        passwordHash,
        displayName: 'Carol Reed',
        firstName: 'Carol',
        lastName: 'Reed',
        bio: 'Design, books and slow mornings.',
        website: 'https://carol.example.com',
        avatarUrl: 'https://cdn.example.com/avatars/carol.jpg',
        coverUrl: 'https://cdn.example.com/covers/carol.jpg',
        birthDate: new Date('1998-11-05T00:00:00.000Z'),
        gender: 'PREFER_NOT_TO_SAY',
        countryCode: 'GB',
        latitude: '41.0255000',
        longitude: '28.9901000',
        locationUpdatedAt: new Date('2026-04-09T09:50:00.000Z'),
        role: 'ADMIN',
        status: 'ACTIVE',
        isPrivate: false,
        emailVerifiedAt: new Date('2026-01-12T09:00:00.000Z'),
        phoneVerifiedAt: new Date('2026-01-12T09:15:00.000Z'),
        followersCount: 0,
        followingCount: 1,
        postsCount: 1,
        lastLoginAt: new Date('2026-04-08T14:40:00.000Z'),
        lastSeenAt: new Date('2026-04-09T10:00:00.000Z'),
        createdAt: new Date('2026-01-12T08:00:00.000Z'),
        updatedAt: new Date('2026-04-09T10:00:00.000Z'),
      },
    }),
  ]);

  await appSettingDelegate.createMany({
    data: [
      {
        key: 'POST_SCENT_RADIUS_METERS',
        value: '300',
      },
    ],
  });

  await prisma.notificationPreference.createMany({
    data: [
      {
        userId: alice.id,
        createdAt: new Date('2026-01-10T09:00:00.000Z'),
        updatedAt: new Date('2026-04-09T08:30:00.000Z'),
      },
      {
        userId: bob.id,
        mentionNotificationsEnabled: false,
        createdAt: new Date('2026-01-11T10:00:00.000Z'),
        updatedAt: new Date('2026-04-09T09:10:00.000Z'),
      },
      {
        userId: carol.id,
        emailEnabled: false,
        createdAt: new Date('2026-01-12T08:00:00.000Z'),
        updatedAt: new Date('2026-04-09T10:00:00.000Z'),
      },
    ],
  });

  const [aliceSession, bobSession, carolSession] = await Promise.all([
    prisma.session.create({
      data: {
        userId: alice.id,
        deviceId: 'device-alice-iphone',
        deviceName: 'iPhone 15 Pro',
        platform: 'IOS',
        ipAddress: '10.0.0.11',
        userAgent: 'Gifello iOS 1.0',
        lastUsedAt: new Date('2026-04-09T08:30:00.000Z'),
        expiresAt: new Date('2026-05-09T08:30:00.000Z'),
        createdAt: new Date('2026-04-01T08:30:00.000Z'),
        updatedAt: new Date('2026-04-09T08:30:00.000Z'),
      },
    }),
    prisma.session.create({
      data: {
        userId: bob.id,
        deviceId: 'device-bob-pixel',
        deviceName: 'Pixel 9',
        platform: 'ANDROID',
        ipAddress: '10.0.0.12',
        userAgent: 'Gifello Android 1.0',
        lastUsedAt: new Date('2026-04-09T09:10:00.000Z'),
        expiresAt: new Date('2026-05-09T09:10:00.000Z'),
        createdAt: new Date('2026-04-02T09:10:00.000Z'),
        updatedAt: new Date('2026-04-09T09:10:00.000Z'),
      },
    }),
    prisma.session.create({
      data: {
        userId: carol.id,
        deviceId: 'device-carol-mac',
        deviceName: 'MacBook Air',
        platform: 'WEB',
        ipAddress: '10.0.0.13',
        userAgent: 'Gifello Web 1.0',
        lastUsedAt: new Date('2026-04-09T10:00:00.000Z'),
        expiresAt: new Date('2026-05-09T10:00:00.000Z'),
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        updatedAt: new Date('2026-04-09T10:00:00.000Z'),
      },
    }),
  ]);

  await prisma.refreshToken.createMany({
    data: [
      {
        sessionId: aliceSession.id,
        tokenHash: 'hash_refresh_alice_1',
        expiresAt: new Date('2026-05-09T08:30:00.000Z'),
        createdAt: new Date('2026-04-01T08:30:00.000Z'),
        updatedAt: new Date('2026-04-09T08:30:00.000Z'),
      },
      {
        sessionId: bobSession.id,
        tokenHash: 'hash_refresh_bob_1',
        expiresAt: new Date('2026-05-09T09:10:00.000Z'),
        createdAt: new Date('2026-04-02T09:10:00.000Z'),
        updatedAt: new Date('2026-04-09T09:10:00.000Z'),
      },
      {
        sessionId: carolSession.id,
        tokenHash: 'hash_refresh_carol_1',
        expiresAt: new Date('2026-05-09T10:00:00.000Z'),
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        updatedAt: new Date('2026-04-09T10:00:00.000Z'),
      },
    ],
  });

  await prisma.verificationToken.createMany({
    data: [
      {
        userId: alice.id,
        type: 'EMAIL_VERIFICATION',
        tokenHash: 'hash_verify_alice_email',
        targetValue: 'alice@example.com',
        expiresAt: new Date('2026-01-11T09:00:00.000Z'),
        usedAt: new Date('2026-01-10T10:00:00.000Z'),
        createdAt: new Date('2026-01-10T09:30:00.000Z'),
        updatedAt: new Date('2026-01-10T10:00:00.000Z'),
      },
      {
        userId: bob.id,
        type: 'PASSWORD_RESET',
        tokenHash: 'hash_reset_bob',
        targetValue: 'bob@example.com',
        expiresAt: new Date('2026-04-12T09:00:00.000Z'),
        createdAt: new Date('2026-04-09T09:00:00.000Z'),
        updatedAt: new Date('2026-04-09T09:00:00.000Z'),
      },
      {
        userId: carol.id,
        type: 'PHONE_VERIFICATION',
        tokenHash: 'hash_verify_carol_phone',
        targetValue: '+905553333333',
        expiresAt: new Date('2026-01-12T10:00:00.000Z'),
        usedAt: new Date('2026-01-12T09:15:00.000Z'),
        createdAt: new Date('2026-01-12T08:30:00.000Z'),
        updatedAt: new Date('2026-01-12T09:15:00.000Z'),
      },
    ],
  });

  await prisma.userAuthAccount.createMany({
    data: [
      {
        userId: alice.id,
        provider: 'APPLE',
        providerUserId: 'apple_alice_001',
        providerEmail: 'alice@example.com',
        createdAt: new Date('2026-01-10T09:00:00.000Z'),
        updatedAt: new Date('2026-04-09T08:30:00.000Z'),
      },
      {
        userId: bob.id,
        provider: 'GOOGLE',
        providerUserId: 'google_bob_001',
        providerEmail: 'bob@example.com',
        createdAt: new Date('2026-01-11T10:00:00.000Z'),
        updatedAt: new Date('2026-04-09T09:10:00.000Z'),
      },
      {
        userId: carol.id,
        provider: 'APPLE',
        providerUserId: 'apple_carol_001',
        providerEmail: 'carol@example.com',
        createdAt: new Date('2026-01-12T08:00:00.000Z'),
        updatedAt: new Date('2026-04-09T10:00:00.000Z'),
      },
    ],
  });

  await prisma.follow.createMany({
    data: [
      {
        followerUserId: alice.id,
        followingUserId: bob.id,
        createdAt: new Date('2026-02-01T10:00:00.000Z'),
      },
      {
        followerUserId: carol.id,
        followingUserId: alice.id,
        createdAt: new Date('2026-02-03T12:00:00.000Z'),
      },
    ],
  });

  const bobToCarolRequest = await prisma.followRequest.create({
    data: {
      requesterUserId: bob.id,
      targetUserId: carol.id,
      status: 'PENDING',
      createdAt: new Date('2026-02-02T11:00:00.000Z'),
      updatedAt: new Date('2026-02-02T11:00:00.000Z'),
    },
  });

  await prisma.userBlock.createMany({
    data: [
      {
        blockerUserId: bob.id,
        blockedUserId: alice.id,
        createdAt: new Date('2026-03-01T12:00:00.000Z'),
      },
      {
        blockerUserId: carol.id,
        blockedUserId: bob.id,
        createdAt: new Date('2026-03-02T13:00:00.000Z'),
      },
    ],
  });

  const [alicePost, bobPost, carolPost] = await Promise.all([
    prisma.post.create({
      data: {
        userId: alice.id,
        type: 'STANDARD',
        caption: 'Sunset and city lights.',
        visibility: 'PUBLIC',
        likesCount: 1,
        commentsCount: 2,
        savesCount: 1,
        mediaCount: 1,
        publishedAt: new Date('2026-04-01T18:00:00.000Z'),
        createdAt: new Date('2026-04-01T18:00:00.000Z'),
        updatedAt: new Date('2026-04-01T18:00:00.000Z'),
      },
    }),
    prisma.post.create({
      data: {
        userId: bob.id,
        type: 'STANDARD',
        caption: 'Morning workout done.',
        visibility: 'FOLLOWERS_ONLY',
        likesCount: 1,
        commentsCount: 1,
        savesCount: 1,
        mediaCount: 1,
        publishedAt: new Date('2026-04-02T07:15:00.000Z'),
        createdAt: new Date('2026-04-02T07:15:00.000Z'),
        updatedAt: new Date('2026-04-02T07:15:00.000Z'),
      },
    }),
    prisma.post.create({
      data: {
        userId: carol.id,
        type: 'STANDARD',
        caption: 'A quiet desk setup for deep work. @alice',
        visibility: 'PUBLIC',
        likesCount: 1,
        commentsCount: 1,
        savesCount: 1,
        mediaCount: 1,
        publishedAt: new Date('2026-04-03T09:45:00.000Z'),
        createdAt: new Date('2026-04-03T09:45:00.000Z'),
        updatedAt: new Date('2026-04-03T09:45:00.000Z'),
      },
    }),
  ]);

  await prisma.post.create({
    data: {
      userId: alice.id,
      type: 'GOSSIP_CAULDRON',
      hasScent: true,
      caption:
        'Dedikodu kazaninda bugunun konusu: ofiste kahve makinesini yine kim bozdu?',
      visibility: 'PUBLIC',
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      mediaCount: 0,
      publishedAt: new Date('2026-04-04T12:00:00.000Z'),
      createdAt: new Date('2026-04-04T12:00:00.000Z'),
      updatedAt: new Date('2026-04-04T12:00:00.000Z'),
    },
  });

  await prisma.postMedia.createMany({
    data: [
      {
        postId: alicePost.id,
        mediaType: 'IMAGE',
        storageKey: 'posts/alice-1.jpg',
        mediaUrl: 'https://cdn.example.com/posts/alice-1.jpg',
        width: 1080,
        height: 1350,
        sortOrder: 0,
        createdAt: new Date('2026-04-01T18:00:00.000Z'),
        updatedAt: new Date('2026-04-01T18:00:00.000Z'),
      },
      {
        postId: bobPost.id,
        mediaType: 'IMAGE',
        storageKey: 'posts/bob-1.jpg',
        mediaUrl: 'https://cdn.example.com/posts/bob-1.jpg',
        width: 1080,
        height: 1080,
        sortOrder: 0,
        createdAt: new Date('2026-04-02T07:15:00.000Z'),
        updatedAt: new Date('2026-04-02T07:15:00.000Z'),
      },
      {
        postId: carolPost.id,
        mediaType: 'VIDEO',
        storageKey: 'posts/carol-1.mp4',
        mediaUrl: 'https://cdn.example.com/posts/carol-1.mp4',
        thumbnailUrl: 'https://cdn.example.com/posts/carol-1-thumb.jpg',
        width: 1080,
        height: 1920,
        durationMs: 12000,
        sortOrder: 0,
        createdAt: new Date('2026-04-03T09:45:00.000Z'),
        updatedAt: new Date('2026-04-03T09:45:00.000Z'),
      },
    ],
  });

  const aliceRootComment = await prisma.comment.create({
    data: {
      postId: alicePost.id,
      userId: bob.id,
      body: 'Looks amazing.',
      repliesCount: 1,
      likesCount: 1,
      createdAt: new Date('2026-04-01T18:10:00.000Z'),
      updatedAt: new Date('2026-04-01T18:10:00.000Z'),
    },
  });

  const aliceReplyComment = await prisma.comment.create({
    data: {
      postId: alicePost.id,
      userId: alice.id,
      parentCommentId: aliceRootComment.id,
      body: 'Thanks Bob, glad you liked it.',
      createdAt: new Date('2026-04-01T18:15:00.000Z'),
      updatedAt: new Date('2026-04-01T18:15:00.000Z'),
    },
  });

  const bobComment = await prisma.comment.create({
    data: {
      postId: bobPost.id,
      userId: carol.id,
      body: 'Strong start to the day, @alice would approve.',
      likesCount: 1,
      createdAt: new Date('2026-04-02T07:25:00.000Z'),
      updatedAt: new Date('2026-04-02T07:25:00.000Z'),
    },
  });

  const carolComment = await prisma.comment.create({
    data: {
      postId: carolPost.id,
      userId: alice.id,
      body: 'Love this setup.',
      likesCount: 1,
      createdAt: new Date('2026-04-03T10:00:00.000Z'),
      updatedAt: new Date('2026-04-03T10:00:00.000Z'),
    },
  });

  await prisma.postLike.createMany({
    data: [
      {
        postId: alicePost.id,
        userId: carol.id,
        createdAt: new Date('2026-04-01T18:20:00.000Z'),
      },
      {
        postId: bobPost.id,
        userId: alice.id,
        createdAt: new Date('2026-04-02T07:30:00.000Z'),
      },
      {
        postId: carolPost.id,
        userId: bob.id,
        createdAt: new Date('2026-04-03T10:05:00.000Z'),
      },
    ],
  });

  await prisma.commentLike.createMany({
    data: [
      {
        commentId: aliceRootComment.id,
        userId: alice.id,
        createdAt: new Date('2026-04-01T18:21:00.000Z'),
      },
      {
        commentId: bobComment.id,
        userId: bob.id,
        createdAt: new Date('2026-04-02T07:31:00.000Z'),
      },
      {
        commentId: carolComment.id,
        userId: carol.id,
        createdAt: new Date('2026-04-03T10:06:00.000Z'),
      },
    ],
  });

  await prisma.savedPost.createMany({
    data: [
      {
        userId: alice.id,
        postId: carolPost.id,
        createdAt: new Date('2026-04-03T10:10:00.000Z'),
      },
      {
        userId: bob.id,
        postId: alicePost.id,
        createdAt: new Date('2026-04-01T18:30:00.000Z'),
      },
      {
        userId: carol.id,
        postId: bobPost.id,
        createdAt: new Date('2026-04-02T07:35:00.000Z'),
      },
    ],
  });

  const [sunset, fitness, workspace] = await Promise.all([
    prisma.hashtag.create({
      data: {
        tag: 'sunset',
        normalizedTag: 'sunset',
        postsCount: 1,
        createdAt: new Date('2026-04-01T18:00:00.000Z'),
        updatedAt: new Date('2026-04-01T18:00:00.000Z'),
      },
    }),
    prisma.hashtag.create({
      data: {
        tag: 'fitness',
        normalizedTag: 'fitness',
        postsCount: 1,
        createdAt: new Date('2026-04-02T07:15:00.000Z'),
        updatedAt: new Date('2026-04-02T07:15:00.000Z'),
      },
    }),
    prisma.hashtag.create({
      data: {
        tag: 'workspace',
        normalizedTag: 'workspace',
        postsCount: 1,
        createdAt: new Date('2026-04-03T09:45:00.000Z'),
        updatedAt: new Date('2026-04-03T09:45:00.000Z'),
      },
    }),
  ]);

  await prisma.postHashtag.createMany({
    data: [
      {
        postId: alicePost.id,
        hashtagId: sunset.id,
        createdAt: new Date('2026-04-01T18:00:00.000Z'),
      },
      {
        postId: bobPost.id,
        hashtagId: fitness.id,
        createdAt: new Date('2026-04-02T07:15:00.000Z'),
      },
      {
        postId: carolPost.id,
        hashtagId: workspace.id,
        createdAt: new Date('2026-04-03T09:45:00.000Z'),
      },
    ],
  });

  await prisma.mention.createMany({
    data: [
      {
        actorUserId: alice.id,
        mentionedUserId: bob.id,
        targetType: 'POST',
        postId: alicePost.id,
        createdAt: new Date('2026-04-01T18:00:00.000Z'),
      },
      {
        actorUserId: carol.id,
        mentionedUserId: alice.id,
        targetType: 'COMMENT',
        commentId: bobComment.id,
        createdAt: new Date('2026-04-02T07:25:00.000Z'),
      },
      {
        actorUserId: carol.id,
        mentionedUserId: alice.id,
        targetType: 'POST',
        postId: carolPost.id,
        createdAt: new Date('2026-04-03T09:45:00.000Z'),
      },
    ],
  });

  const directConversation = await prisma.conversation.create({
    data: {
      conversationType: 'DIRECT',
      createdByUserId: alice.id,
      createdAt: new Date('2026-04-05T09:00:00.000Z'),
      updatedAt: new Date('2026-04-05T09:10:00.000Z'),
    },
  });

  const groupConversation = await prisma.conversation.create({
    data: {
      conversationType: 'GROUP',
      title: 'Core Team',
      createdByUserId: carol.id,
      createdAt: new Date('2026-04-06T10:00:00.000Z'),
      updatedAt: new Date('2026-04-06T10:20:00.000Z'),
    },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      {
        conversationId: directConversation.id,
        userId: alice.id,
        joinedAt: new Date('2026-04-05T09:00:00.000Z'),
        createdAt: new Date('2026-04-05T09:00:00.000Z'),
        updatedAt: new Date('2026-04-05T09:00:00.000Z'),
      },
      {
        conversationId: directConversation.id,
        userId: bob.id,
        joinedAt: new Date('2026-04-05T09:00:00.000Z'),
        createdAt: new Date('2026-04-05T09:00:00.000Z'),
        updatedAt: new Date('2026-04-05T09:00:00.000Z'),
      },
      {
        conversationId: groupConversation.id,
        userId: alice.id,
        joinedAt: new Date('2026-04-06T10:00:00.000Z'),
        createdAt: new Date('2026-04-06T10:00:00.000Z'),
        updatedAt: new Date('2026-04-06T10:00:00.000Z'),
      },
      {
        conversationId: groupConversation.id,
        userId: bob.id,
        joinedAt: new Date('2026-04-06T10:00:00.000Z'),
        createdAt: new Date('2026-04-06T10:00:00.000Z'),
        updatedAt: new Date('2026-04-06T10:00:00.000Z'),
      },
      {
        conversationId: groupConversation.id,
        userId: carol.id,
        joinedAt: new Date('2026-04-06T10:00:00.000Z'),
        createdAt: new Date('2026-04-06T10:00:00.000Z'),
        updatedAt: new Date('2026-04-06T10:00:00.000Z'),
      },
    ],
  });

  const aliceToBobMessage = await prisma.message.create({
    data: {
      conversationId: directConversation.id,
      senderUserId: alice.id,
      messageType: 'TEXT',
      body: 'Hey Bob, did you see the new post?',
      createdAt: new Date('2026-04-05T09:01:00.000Z'),
      updatedAt: new Date('2026-04-05T09:01:00.000Z'),
    },
  });

  const bobToAliceMessage = await prisma.message.create({
    data: {
      conversationId: directConversation.id,
      senderUserId: bob.id,
      messageType: 'TEXT',
      body: 'Yes, it looks great.',
      replyToMessageId: aliceToBobMessage.id,
      createdAt: new Date('2026-04-05T09:02:00.000Z'),
      updatedAt: new Date('2026-04-05T09:02:00.000Z'),
    },
  });

  const groupMessage = await prisma.message.create({
    data: {
      conversationId: groupConversation.id,
      senderUserId: carol.id,
      messageType: 'TEXT',
      body: 'Let’s review notification flows later today.',
      createdAt: new Date('2026-04-06T10:05:00.000Z'),
      updatedAt: new Date('2026-04-06T10:05:00.000Z'),
    },
  });

  await prisma.messageRead.createMany({
    data: [
      {
        messageId: aliceToBobMessage.id,
        userId: bob.id,
        readAt: new Date('2026-04-05T09:02:30.000Z'),
        createdAt: new Date('2026-04-05T09:02:30.000Z'),
      },
      {
        messageId: bobToAliceMessage.id,
        userId: alice.id,
        readAt: new Date('2026-04-05T09:03:00.000Z'),
        createdAt: new Date('2026-04-05T09:03:00.000Z'),
      },
      {
        messageId: groupMessage.id,
        userId: alice.id,
        readAt: new Date('2026-04-06T10:10:00.000Z'),
        createdAt: new Date('2026-04-06T10:10:00.000Z'),
      },
    ],
  });

  await prisma.conversation.update({
    where: { id: directConversation.id },
    data: {
      lastMessageId: bobToAliceMessage.id,
      lastMessageAt: bobToAliceMessage.createdAt,
    },
  });

  await prisma.conversation.update({
    where: { id: groupConversation.id },
    data: {
      lastMessageId: groupMessage.id,
      lastMessageAt: groupMessage.createdAt,
    },
  });

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: directConversation.id,
      userId: { in: [alice.id, bob.id] },
    },
    data: {
      lastReadMessageId: bobToAliceMessage.id,
      lastReadAt: new Date('2026-04-05T09:03:00.000Z'),
    },
  });

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: groupConversation.id,
      userId: { in: [alice.id, carol.id] },
    },
    data: {
      lastReadMessageId: groupMessage.id,
      lastReadAt: new Date('2026-04-06T10:10:00.000Z'),
    },
  });

  const [spamReason, harassmentReason] = await Promise.all([
    prisma.reportReason.create({
      data: {
        code: 'SPAM',
        label: 'Spam',
        description: 'Repeated unwanted promotional content.',
        appliesToPost: true,
        appliesToComment: true,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    }),
    prisma.reportReason.create({
      data: {
        code: 'HARASSMENT',
        label: 'Harassment',
        description: 'Targeted abusive behavior.',
        appliesToUser: true,
        appliesToMessage: true,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    }),
    prisma.reportReason.create({
      data: {
        code: 'NUDITY',
        label: 'Nudity',
        description: 'Sensitive or explicit content.',
        appliesToPost: true,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    }),
  ]);

  const bobPostReport = await prisma.report.create({
    data: {
      reporterUserId: alice.id,
      reasonId: spamReason.id,
      description: 'Looks like repetitive promotion.',
      status: 'OPEN',
      createdAt: new Date('2026-04-07T10:00:00.000Z'),
      updatedAt: new Date('2026-04-07T10:00:00.000Z'),
    },
  });

  const carolUserReport = await prisma.report.create({
    data: {
      reporterUserId: bob.id,
      reasonId: harassmentReason.id,
      description: 'Unexpected hostile messages.',
      status: 'RESOLVED',
      resolvedAt: new Date('2026-04-07T12:30:00.000Z'),
      createdAt: new Date('2026-04-07T11:00:00.000Z'),
      updatedAt: new Date('2026-04-07T12:30:00.000Z'),
    },
  });

  await prisma.reportTarget.createMany({
    data: [
      {
        reportId: bobPostReport.id,
        targetType: 'POST',
        targetPostId: bobPost.id,
        createdAt: new Date('2026-04-07T10:00:00.000Z'),
      },
      {
        reportId: carolUserReport.id,
        targetType: 'USER',
        targetUserId: carol.id,
        createdAt: new Date('2026-04-07T11:00:00.000Z'),
      },
      {
        reportId: carolUserReport.id,
        targetType: 'MESSAGE',
        targetMessageId: groupMessage.id,
        createdAt: new Date('2026-04-07T11:00:00.000Z'),
      },
    ],
  });

  await prisma.moderationAction.createMany({
    data: [
      {
        reportId: bobPostReport.id,
        targetType: 'POST',
        targetPostId: bobPost.id,
        actionType: 'WARN',
        moderatorUserId: carol.id,
        notes: 'Warned user while review is ongoing.',
        createdAt: new Date('2026-04-07T10:30:00.000Z'),
      },
      {
        reportId: carolUserReport.id,
        targetType: 'USER',
        targetUserId: carol.id,
        actionType: 'CLOSE_REPORT',
        moderatorUserId: carol.id,
        notes: 'Insufficient evidence after review.',
        createdAt: new Date('2026-04-07T12:30:00.000Z'),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        recipientUserId: bob.id,
        actorUserId: alice.id,
        type: 'NEW_FOLLOWER',
        title: 'New follower',
        body: 'Alice started following you.',
        createdAt: new Date('2026-02-01T10:00:00.000Z'),
        updatedAt: new Date('2026-02-01T10:00:00.000Z'),
      },
      {
        recipientUserId: carol.id,
        actorUserId: bob.id,
        type: 'FOLLOW_REQUEST',
        followRequestId: bobToCarolRequest.id,
        title: 'Follow request',
        body: 'Bob requested to follow you.',
        isRead: true,
        readAt: new Date('2026-02-02T11:05:00.000Z'),
        createdAt: new Date('2026-02-02T11:00:00.000Z'),
        updatedAt: new Date('2026-02-02T11:05:00.000Z'),
      },
      {
        recipientUserId: bob.id,
        actorUserId: alice.id,
        type: 'COMMENT_REPLY',
        postId: alicePost.id,
        commentId: aliceReplyComment.id,
        title: 'New reply',
        body: 'Alice replied to your comment.',
        createdAt: new Date('2026-04-01T18:15:00.000Z'),
        updatedAt: new Date('2026-04-01T18:15:00.000Z'),
      },
      {
        recipientUserId: bob.id,
        actorUserId: alice.id,
        type: 'MESSAGE_RECEIVED',
        messageId: aliceToBobMessage.id,
        title: 'New message',
        body: 'Alice sent you a message.',
        isRead: true,
        readAt: new Date('2026-04-05T09:02:30.000Z'),
        createdAt: new Date('2026-04-05T09:01:00.000Z'),
        updatedAt: new Date('2026-04-05T09:02:30.000Z'),
      },
      {
        recipientUserId: bob.id,
        actorUserId: carol.id,
        type: 'REPORT_STATUS_UPDATED',
        reportId: carolUserReport.id,
        title: 'Report updated',
        body: 'Your report has been reviewed.',
        createdAt: new Date('2026-04-07T12:30:00.000Z'),
        updatedAt: new Date('2026-04-07T12:30:00.000Z'),
      },
    ],
  });

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
