import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { FollowsModule } from './modules/follows/follows.module';
import { FeedModule } from './modules/feed/feed.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    FollowsModule,
    FeedModule,
    MediaModule,
    NotificationsModule,
    ChatModule,
    SearchModule,
  ],
})
export class AppModule {}
