-- Move pending follow rows into dedicated follow_requests table
CREATE TABLE `follow_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requester_user_id` INTEGER NOT NULL,
    `target_user_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `responded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `follow_requests_requester_user_id_target_user_id_key`(`requester_user_id`, `target_user_id`),
    INDEX `follow_requests_requester_user_id_idx`(`requester_user_id`),
    INDEX `follow_requests_target_user_id_idx`(`target_user_id`),
    INDEX `follow_requests_status_idx`(`status`),
    INDEX `follow_requests_created_at_idx`(`created_at`),
    INDEX `follow_requests_target_user_id_status_created_at_idx`(`target_user_id`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `follow_requests`
    ADD CONSTRAINT `follow_requests_requester_user_id_fkey`
    FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `follow_requests_target_user_id_fkey`
    FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `follow_requests` (
    `requester_user_id`,
    `target_user_id`,
    `status`,
    `created_at`,
    `updated_at`
)
SELECT
    `follower_user_id`,
    `following_user_id`,
    'PENDING',
    `created_at`,
    `updated_at`
FROM `follows`
WHERE `status` = 'PENDING';

DELETE FROM `follows`
WHERE `status` = 'PENDING';

DROP INDEX `follows_status_idx` ON `follows`;

ALTER TABLE `follows`
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`;

CREATE INDEX `follows_created_at_idx` ON `follows`(`created_at`);

-- Expand posts into normalized content structure
ALTER TABLE `posts`
    ADD COLUMN `visibility` ENUM('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC' AFTER `caption`,
    ADD COLUMN `comments_disabled` BOOLEAN NOT NULL DEFAULT false AFTER `visibility`,
    ADD COLUMN `likes_count` INTEGER NOT NULL DEFAULT 0 AFTER `comments_disabled`,
    ADD COLUMN `comments_count` INTEGER NOT NULL DEFAULT 0 AFTER `likes_count`,
    ADD COLUMN `saves_count` INTEGER NOT NULL DEFAULT 0 AFTER `comments_count`,
    ADD COLUMN `media_count` INTEGER NOT NULL DEFAULT 0 AFTER `saves_count`,
    ADD COLUMN `published_at` DATETIME(3) NULL AFTER `media_count`,
    ADD COLUMN `archived_at` DATETIME(3) NULL AFTER `published_at`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL AFTER `archived_at`;

UPDATE `posts`
SET `published_at` = `created_at`
WHERE `published_at` IS NULL;

CREATE TABLE `post_media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `media_type` ENUM('IMAGE', 'VIDEO', 'CAROUSEL_ITEM') NOT NULL,
    `storage_key` VARCHAR(191) NOT NULL,
    `media_url` VARCHAR(191) NOT NULL,
    `thumbnail_url` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration_ms` INTEGER NULL,
    `file_size_bytes` INTEGER NULL,
    `sort_order` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `post_media_post_id_sort_order_key`(`post_id`, `sort_order`),
    INDEX `post_media_post_id_idx`(`post_id`),
    INDEX `post_media_post_id_sort_order_idx`(`post_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `post_media`
    ADD CONSTRAINT `post_media_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `post_media` (
    `post_id`,
    `media_type`,
    `storage_key`,
    `media_url`,
    `sort_order`,
    `created_at`,
    `updated_at`
)
SELECT
    `id`,
    'IMAGE',
    `image_url`,
    `image_url`,
    0,
    `created_at`,
    `updated_at`
FROM `posts`
WHERE `image_url` IS NOT NULL AND `image_url` <> '';

UPDATE `posts`
SET `media_count` = 1
WHERE `image_url` IS NOT NULL AND `image_url` <> '';

ALTER TABLE `posts`
    DROP COLUMN `image_url`;

CREATE INDEX `posts_published_at_idx` ON `posts`(`published_at`);
CREATE INDEX `posts_deleted_at_idx` ON `posts`(`deleted_at`);
CREATE INDEX `posts_user_id_created_at_idx` ON `posts`(`user_id`, `created_at`);
CREATE INDEX `posts_user_id_published_at_idx` ON `posts`(`user_id`, `published_at`);
CREATE INDEX `posts_visibility_published_at_idx` ON `posts`(`visibility`, `published_at`);

-- Post likes
CREATE TABLE `post_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `post_likes_post_id_user_id_key`(`post_id`, `user_id`),
    INDEX `post_likes_post_id_idx`(`post_id`),
    INDEX `post_likes_user_id_idx`(`user_id`),
    INDEX `post_likes_post_id_created_at_idx`(`post_id`, `created_at`),
    INDEX `post_likes_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `post_likes`
    ADD CONSTRAINT `post_likes_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `post_likes_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Saved posts
CREATE TABLE `saved_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `saved_posts_user_id_post_id_key`(`user_id`, `post_id`),
    INDEX `saved_posts_user_id_idx`(`user_id`),
    INDEX `saved_posts_post_id_idx`(`post_id`),
    INDEX `saved_posts_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `saved_posts`
    ADD CONSTRAINT `saved_posts_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `saved_posts_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Comments
CREATE TABLE `comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `parent_comment_id` INTEGER NULL,
    `body` TEXT NOT NULL,
    `replies_count` INTEGER NOT NULL DEFAULT 0,
    `likes_count` INTEGER NOT NULL DEFAULT 0,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `comments_post_id_idx`(`post_id`),
    INDEX `comments_user_id_idx`(`user_id`),
    INDEX `comments_parent_comment_id_idx`(`parent_comment_id`),
    INDEX `comments_created_at_idx`(`created_at`),
    INDEX `comments_post_id_created_at_idx`(`post_id`, `created_at`),
    INDEX `comments_parent_comment_id_created_at_idx`(`parent_comment_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `comments`
    ADD CONSTRAINT `comments_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `comments_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `comments_parent_comment_id_fkey`
    FOREIGN KEY (`parent_comment_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Comment likes
CREATE TABLE `comment_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `comment_likes_comment_id_user_id_key`(`comment_id`, `user_id`),
    INDEX `comment_likes_comment_id_idx`(`comment_id`),
    INDEX `comment_likes_user_id_idx`(`user_id`),
    INDEX `comment_likes_comment_id_created_at_idx`(`comment_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `comment_likes`
    ADD CONSTRAINT `comment_likes_comment_id_fkey`
    FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `comment_likes_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Hashtags and post-hashtag relations
CREATE TABLE `hashtags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(191) NOT NULL,
    `normalized_tag` VARCHAR(191) NOT NULL,
    `posts_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hashtags_tag_key`(`tag`),
    UNIQUE INDEX `hashtags_normalized_tag_key`(`normalized_tag`),
    INDEX `hashtags_posts_count_idx`(`posts_count`),
    INDEX `hashtags_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `post_hashtags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `hashtag_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `post_hashtags_post_id_hashtag_id_key`(`post_id`, `hashtag_id`),
    INDEX `post_hashtags_post_id_idx`(`post_id`),
    INDEX `post_hashtags_hashtag_id_idx`(`hashtag_id`),
    INDEX `post_hashtags_hashtag_id_created_at_idx`(`hashtag_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `post_hashtags`
    ADD CONSTRAINT `post_hashtags_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `post_hashtags_hashtag_id_fkey`
    FOREIGN KEY (`hashtag_id`) REFERENCES `hashtags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Mentions
CREATE TABLE `mentions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mentioned_user_id` INTEGER NOT NULL,
    `actor_user_id` INTEGER NOT NULL,
    `target_type` ENUM('POST', 'COMMENT') NOT NULL,
    `post_id` INTEGER NULL,
    `comment_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mentions_mentioned_user_id_idx`(`mentioned_user_id`),
    INDEX `mentions_actor_user_id_idx`(`actor_user_id`),
    INDEX `mentions_post_id_idx`(`post_id`),
    INDEX `mentions_comment_id_idx`(`comment_id`),
    INDEX `mentions_mentioned_user_id_created_at_idx`(`mentioned_user_id`, `created_at`),
    INDEX `mentions_target_type_created_at_idx`(`target_type`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `mentions`
    ADD CONSTRAINT `mentions_mentioned_user_id_fkey`
    FOREIGN KEY (`mentioned_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `mentions_actor_user_id_fkey`
    FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `mentions_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `mentions_comment_id_fkey`
    FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
