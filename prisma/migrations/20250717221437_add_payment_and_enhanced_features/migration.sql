-- AlterTable
ALTER TABLE `orders` ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `order_id_razorpay` VARCHAR(255) NULL,
    ADD COLUMN `payment_id` VARCHAR(255) NULL,
    ADD COLUMN `payment_status` VARCHAR(50) NULL DEFAULT 'pending',
    ADD COLUMN `receipt_url` VARCHAR(500) NULL,
    ADD COLUMN `shipping_address` TEXT NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `discount_percent` DECIMAL(5, 2) NULL,
    ADD COLUMN `is_featured` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `is_new` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `on_sale` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `sale_end_date` TIMESTAMP(0) NULL,
    ADD COLUMN `sale_price` DECIMAL(10, 2) NULL,
    ADD COLUMN `sale_start_date` TIMESTAMP(0) NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `sale_banners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `link_url` VARCHAR(255) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `start_date` TIMESTAMP(0) NULL,
    `end_date` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `admin_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `payment_id` ON `orders`(`payment_id`);

-- CreateIndex
CREATE INDEX `order_id_razorpay` ON `orders`(`order_id_razorpay`);
