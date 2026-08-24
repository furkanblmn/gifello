-- Drop redundant non-unique indexes on uniquely constrained user identity fields
DROP INDEX `users_email_idx` ON `users`;
DROP INDEX `users_username_idx` ON `users`;
DROP INDEX `users_phone_number_idx` ON `users`;

-- Align users table with normalized auth specification
ALTER TABLE `users`
    DROP COLUMN `auth_provider`,
    DROP COLUMN `is_email_verified`,
    DROP COLUMN `is_phone_verified`,
    DROP COLUMN `is_active`,
    DROP COLUMN `is_deleted`;

-- Align sessions table with spec-based lifecycle model
DROP INDEX `sessions_public_id_idx` ON `sessions`;
DROP INDEX `sessions_device_id_idx` ON `sessions`;
DROP INDEX `sessions_status_idx` ON `sessions`;

ALTER TABLE `sessions`
    DROP COLUMN `public_id`,
    DROP COLUMN `device_os`,
    DROP COLUMN `app_version`,
    DROP COLUMN `status`,
    DROP COLUMN `revoke_reason`;

CREATE INDEX `sessions_revoked_at_idx` ON `sessions`(`revoked_at`);

-- Align refresh_tokens ownership and rotation tracking
ALTER TABLE `refresh_tokens`
    DROP FOREIGN KEY `refresh_tokens_user_id_fkey`;

DROP INDEX `refresh_tokens_user_id_idx` ON `refresh_tokens`;
DROP INDEX `refresh_tokens_family_id_idx` ON `refresh_tokens`;
DROP INDEX `refresh_tokens_token_id_idx` ON `refresh_tokens`;

ALTER TABLE `refresh_tokens`
    DROP COLUMN `user_id`,
    DROP COLUMN `token_id`,
    DROP COLUMN `family_id`,
    DROP COLUMN `parent_token_id`,
    DROP COLUMN `revoked_reason`,
    DROP COLUMN `consumed_at`,
    DROP COLUMN `replaced_at`,
    ADD COLUMN `replaced_by_token_id` INTEGER NULL AFTER `revoked_at`;

CREATE INDEX `refresh_tokens_revoked_at_idx` ON `refresh_tokens`(`revoked_at`);
CREATE INDEX `refresh_tokens_replaced_by_token_id_idx` ON `refresh_tokens`(`replaced_by_token_id`);

ALTER TABLE `refresh_tokens`
    ADD CONSTRAINT `refresh_tokens_replaced_by_token_id_fkey`
    FOREIGN KEY (`replaced_by_token_id`) REFERENCES `refresh_tokens`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Expand verification token support and indexing
DROP INDEX `verification_tokens_user_id_idx` ON `verification_tokens`;
DROP INDEX `verification_tokens_type_idx` ON `verification_tokens`;

ALTER TABLE `verification_tokens`
    MODIFY `type` ENUM(
        'EMAIL_VERIFICATION',
        'PASSWORD_RESET',
        'PHONE_VERIFICATION',
        'CHANGE_EMAIL',
        'CHANGE_PHONE'
    ) NOT NULL,
    ADD COLUMN `target_value` VARCHAR(191) NULL AFTER `token_hash`,
    ADD COLUMN `updated_at` DATETIME(3) NULL AFTER `created_at`;

UPDATE `verification_tokens`
SET `updated_at` = `created_at`
WHERE `updated_at` IS NULL;

ALTER TABLE `verification_tokens`
    MODIFY `updated_at` DATETIME(3) NOT NULL;

CREATE INDEX `verification_tokens_user_id_type_idx`
    ON `verification_tokens`(`user_id`, `type`);

-- Add provider account linking table for external auth
CREATE TABLE `user_auth_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `provider` ENUM('GOOGLE', 'APPLE') NOT NULL,
    `provider_user_id` VARCHAR(191) NOT NULL,
    `provider_email` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_auth_accounts_provider_provider_user_id_key`(`provider`, `provider_user_id`),
    INDEX `user_auth_accounts_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_auth_accounts`
    ADD CONSTRAINT `user_auth_accounts_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename follow relation columns to explicit user-based naming
ALTER TABLE `follows`
    DROP FOREIGN KEY `follows_follower_id_fkey`,
    DROP FOREIGN KEY `follows_following_id_fkey`;

DROP INDEX `follows_follower_id_idx` ON `follows`;
DROP INDEX `follows_following_id_idx` ON `follows`;
DROP INDEX `follows_follower_id_following_id_key` ON `follows`;

ALTER TABLE `follows`
    CHANGE COLUMN `follower_id` `follower_user_id` INTEGER NOT NULL,
    CHANGE COLUMN `following_id` `following_user_id` INTEGER NOT NULL;

CREATE INDEX `follows_follower_user_id_idx` ON `follows`(`follower_user_id`);
CREATE INDEX `follows_following_user_id_idx` ON `follows`(`following_user_id`);
CREATE UNIQUE INDEX `follows_follower_user_id_following_user_id_key`
    ON `follows`(`follower_user_id`, `following_user_id`);

ALTER TABLE `follows`
    ADD CONSTRAINT `follows_follower_user_id_fkey`
    FOREIGN KEY (`follower_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `follows_following_user_id_fkey`
    FOREIGN KEY (`following_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename block relation columns to explicit user-based naming
ALTER TABLE `user_blocks`
    DROP FOREIGN KEY `user_blocks_blocker_id_fkey`,
    DROP FOREIGN KEY `user_blocks_blocked_id_fkey`;

DROP INDEX `user_blocks_blocker_id_idx` ON `user_blocks`;
DROP INDEX `user_blocks_blocked_id_idx` ON `user_blocks`;
DROP INDEX `user_blocks_blocker_id_blocked_id_key` ON `user_blocks`;

ALTER TABLE `user_blocks`
    CHANGE COLUMN `blocker_id` `blocker_user_id` INTEGER NOT NULL,
    CHANGE COLUMN `blocked_id` `blocked_user_id` INTEGER NOT NULL;

CREATE INDEX `user_blocks_blocker_user_id_idx` ON `user_blocks`(`blocker_user_id`);
CREATE INDEX `user_blocks_blocked_user_id_idx` ON `user_blocks`(`blocked_user_id`);
CREATE UNIQUE INDEX `user_blocks_blocker_user_id_blocked_user_id_key`
    ON `user_blocks`(`blocker_user_id`, `blocked_user_id`);

ALTER TABLE `user_blocks`
    ADD CONSTRAINT `user_blocks_blocker_user_id_fkey`
    FOREIGN KEY (`blocker_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `user_blocks_blocked_user_id_fkey`
    FOREIGN KEY (`blocked_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
