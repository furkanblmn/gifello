-- Add configurable scent-post support
ALTER TABLE `users`
    ADD COLUMN `latitude` DECIMAL(10, 7) NULL AFTER `country_code`,
    ADD COLUMN `longitude` DECIMAL(10, 7) NULL AFTER `latitude`,
    ADD COLUMN `location_updated_at` DATETIME(3) NULL AFTER `longitude`;

ALTER TABLE `posts`
    ADD COLUMN `has_scent` BOOLEAN NOT NULL DEFAULT false AFTER `type`;

ALTER TABLE `notifications`
    MODIFY COLUMN `type` ENUM(
        'FOLLOW_REQUEST',
        'FOLLOW_ACCEPTED',
        'NEW_FOLLOWER',
        'SCENT_POST_NEARBY',
        'POST_LIKE',
        'COMMENT_LIKE',
        'COMMENT_REPLY',
        'POST_COMMENT',
        'MENTION_IN_POST',
        'MENTION_IN_COMMENT',
        'MESSAGE_RECEIVED',
        'REPORT_STATUS_UPDATED'
    ) NOT NULL;

CREATE TABLE `app_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `app_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
