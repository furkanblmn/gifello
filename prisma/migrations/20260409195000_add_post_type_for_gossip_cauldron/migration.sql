-- Add post type support for standard and text-only gossip cauldron posts
ALTER TABLE `posts`
    ADD COLUMN `type` ENUM('STANDARD', 'GOSSIP_CAULDRON') NOT NULL DEFAULT 'STANDARD' AFTER `user_id`;

CREATE INDEX `posts_type_idx` ON `posts`(`type`);
CREATE INDEX `posts_type_published_at_idx` ON `posts`(`type`, `published_at`);
