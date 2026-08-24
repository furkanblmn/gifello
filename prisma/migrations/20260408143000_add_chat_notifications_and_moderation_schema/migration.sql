-- Notification preferences
CREATE TABLE `notification_preferences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `push_enabled` BOOLEAN NOT NULL DEFAULT true,
    `email_enabled` BOOLEAN NOT NULL DEFAULT true,
    `follow_notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `like_notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `comment_notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `mention_notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `message_notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_preferences_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `notification_preferences`
    ADD CONSTRAINT `notification_preferences_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Conversations
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_type` ENUM('DIRECT', 'GROUP') NOT NULL,
    `title` VARCHAR(191) NULL,
    `created_by_user_id` INTEGER NULL,
    `last_message_id` INTEGER NULL,
    `last_message_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conversations_last_message_id_key`(`last_message_id`),
    INDEX `conversations_conversation_type_idx`(`conversation_type`),
    INDEX `conversations_created_by_user_id_idx`(`created_by_user_id`),
    INDEX `conversations_last_message_at_idx`(`last_message_at`),
    INDEX `conversations_conversation_type_last_message_at_idx`(`conversation_type`, `last_message_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `conversations`
    ADD CONSTRAINT `conversations_created_by_user_id_fkey`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Messages
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `sender_user_id` INTEGER NOT NULL,
    `message_type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'SYSTEM') NOT NULL,
    `body` TEXT NULL,
    `media_url` VARCHAR(191) NULL,
    `thumbnail_url` VARCHAR(191) NULL,
    `reply_to_message_id` INTEGER NULL,
    `edited_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `messages_conversation_id_idx`(`conversation_id`),
    INDEX `messages_sender_user_id_idx`(`sender_user_id`),
    INDEX `messages_reply_to_message_id_idx`(`reply_to_message_id`),
    INDEX `messages_created_at_idx`(`created_at`),
    INDEX `messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `messages_conversation_id_deleted_at_created_at_idx`(`conversation_id`, `deleted_at`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `messages`
    ADD CONSTRAINT `messages_conversation_id_fkey`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `messages_sender_user_id_fkey`
    FOREIGN KEY (`sender_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `messages_reply_to_message_id_fkey`
    FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `conversations`
    ADD CONSTRAINT `conversations_last_message_id_fkey`
    FOREIGN KEY (`last_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Conversation participants
CREATE TABLE `conversation_participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `left_at` DATETIME(3) NULL,
    `last_read_message_id` INTEGER NULL,
    `last_read_at` DATETIME(3) NULL,
    `is_muted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conversation_participants_conversation_id_user_id_key`(`conversation_id`, `user_id`),
    INDEX `conversation_participants_conversation_id_idx`(`conversation_id`),
    INDEX `conversation_participants_user_id_idx`(`user_id`),
    INDEX `conversation_participants_user_id_updated_at_idx`(`user_id`, `updated_at`),
    INDEX `conversation_participants_conversation_id_left_at_idx`(`conversation_id`, `left_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `conversation_participants`
    ADD CONSTRAINT `conversation_participants_conversation_id_fkey`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `conversation_participants_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `conversation_participants_last_read_message_id_fkey`
    FOREIGN KEY (`last_read_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Message reads
CREATE TABLE `message_reads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `read_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `message_reads_message_id_user_id_key`(`message_id`, `user_id`),
    INDEX `message_reads_message_id_idx`(`message_id`),
    INDEX `message_reads_user_id_idx`(`user_id`),
    INDEX `message_reads_user_id_read_at_idx`(`user_id`, `read_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `message_reads`
    ADD CONSTRAINT `message_reads_message_id_fkey`
    FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `message_reads_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Report reasons
CREATE TABLE `report_reasons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `applies_to_user` BOOLEAN NOT NULL DEFAULT false,
    `applies_to_post` BOOLEAN NOT NULL DEFAULT false,
    `applies_to_comment` BOOLEAN NOT NULL DEFAULT false,
    `applies_to_message` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `report_reasons_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Reports
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporter_user_id` INTEGER NOT NULL,
    `reason_id` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `resolved_at` DATETIME(3) NULL,

    INDEX `reports_reporter_user_id_idx`(`reporter_user_id`),
    INDEX `reports_reason_id_idx`(`reason_id`),
    INDEX `reports_status_idx`(`status`),
    INDEX `reports_created_at_idx`(`created_at`),
    INDEX `reports_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reports`
    ADD CONSTRAINT `reports_reporter_user_id_fkey`
    FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `reports_reason_id_fkey`
    FOREIGN KEY (`reason_id`) REFERENCES `report_reasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Report targets
CREATE TABLE `report_targets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_id` INTEGER NOT NULL,
    `target_type` ENUM('USER', 'POST', 'COMMENT', 'MESSAGE') NOT NULL,
    `target_user_id` INTEGER NULL,
    `target_post_id` INTEGER NULL,
    `target_comment_id` INTEGER NULL,
    `target_message_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_targets_report_id_idx`(`report_id`),
    INDEX `report_targets_target_type_idx`(`target_type`),
    INDEX `report_targets_target_user_id_idx`(`target_user_id`),
    INDEX `report_targets_target_post_id_idx`(`target_post_id`),
    INDEX `report_targets_target_comment_id_idx`(`target_comment_id`),
    INDEX `report_targets_target_message_id_idx`(`target_message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `report_targets`
    ADD CONSTRAINT `report_targets_report_id_fkey`
    FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `report_targets_target_user_id_fkey`
    FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `report_targets_target_post_id_fkey`
    FOREIGN KEY (`target_post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `report_targets_target_comment_id_fkey`
    FOREIGN KEY (`target_comment_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `report_targets_target_message_id_fkey`
    FOREIGN KEY (`target_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Moderation actions
CREATE TABLE `moderation_actions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_id` INTEGER NULL,
    `target_type` ENUM('USER', 'POST', 'COMMENT', 'MESSAGE') NOT NULL,
    `target_user_id` INTEGER NULL,
    `target_post_id` INTEGER NULL,
    `target_comment_id` INTEGER NULL,
    `target_message_id` INTEGER NULL,
    `action_type` ENUM('WARN', 'REMOVE_CONTENT', 'SUSPEND_USER', 'BAN_USER', 'RESTORE_CONTENT', 'CLOSE_REPORT') NOT NULL,
    `moderator_user_id` INTEGER NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `moderation_actions_report_id_idx`(`report_id`),
    INDEX `moderation_actions_action_type_idx`(`action_type`),
    INDEX `moderation_actions_moderator_user_id_idx`(`moderator_user_id`),
    INDEX `moderation_actions_created_at_idx`(`created_at`),
    INDEX `moderation_actions_target_type_idx`(`target_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `moderation_actions`
    ADD CONSTRAINT `moderation_actions_report_id_fkey`
    FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `moderation_actions_target_user_id_fkey`
    FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `moderation_actions_target_post_id_fkey`
    FOREIGN KEY (`target_post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `moderation_actions_target_comment_id_fkey`
    FOREIGN KEY (`target_comment_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `moderation_actions_target_message_id_fkey`
    FOREIGN KEY (`target_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `moderation_actions_moderator_user_id_fkey`
    FOREIGN KEY (`moderator_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Notifications
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipient_user_id` INTEGER NOT NULL,
    `actor_user_id` INTEGER NULL,
    `type` ENUM(
        'FOLLOW_REQUEST',
        'FOLLOW_ACCEPTED',
        'NEW_FOLLOWER',
        'POST_LIKE',
        'COMMENT_LIKE',
        'COMMENT_REPLY',
        'POST_COMMENT',
        'MENTION_IN_POST',
        'MENTION_IN_COMMENT',
        'MESSAGE_RECEIVED',
        'REPORT_STATUS_UPDATED'
    ) NOT NULL,
    `post_id` INTEGER NULL,
    `comment_id` INTEGER NULL,
    `message_id` INTEGER NULL,
    `follow_request_id` INTEGER NULL,
    `report_id` INTEGER NULL,
    `title` VARCHAR(191) NULL,
    `body` TEXT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_recipient_user_id_idx`(`recipient_user_id`),
    INDEX `notifications_actor_user_id_idx`(`actor_user_id`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_is_read_idx`(`is_read`),
    INDEX `notifications_recipient_user_id_is_read_created_at_idx`(`recipient_user_id`, `is_read`, `created_at`),
    INDEX `notifications_recipient_user_id_created_at_idx`(`recipient_user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `notifications`
    ADD CONSTRAINT `notifications_recipient_user_id_fkey`
    FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `notifications_actor_user_id_fkey`
    FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `notifications_post_id_fkey`
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `notifications_comment_id_fkey`
    FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `notifications_message_id_fkey`
    FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `notifications_follow_request_id_fkey`
    FOREIGN KEY (`follow_request_id`) REFERENCES `follow_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `notifications_report_id_fkey`
    FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
