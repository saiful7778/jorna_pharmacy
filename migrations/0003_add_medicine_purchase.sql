CREATE TABLE `medicines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`generic_name` text,
	`strength` text,
	`company_id` text,
	`type` text NOT NULL,
	`base_unit` text NOT NULL,
	`rack_location` text,
	`minimum_stock` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `medicine_name_idx` ON `medicines` (`name`);--> statement-breakpoint
CREATE INDEX `medicine_companyId_idx` ON `medicines` (`company_id`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`company_invoice_no` text,
	`subtotal` real NOT NULL,
	`discount` real DEFAULT 1 NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`note` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_companyInvoice_idx` ON `purchases` (`company_id`,`company_invoice_no`);--> statement-breakpoint
CREATE INDEX `purchase_companyId_idx` ON `purchases` (`company_id`);--> statement-breakpoint
CREATE INDEX `purchase_createdAt_idx` ON `purchases` (`created_at`);--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`medicine_id` text NOT NULL,
	`batch_no` text,
	`qty_purchased` integer NOT NULL,
	`qty_remaining` integer NOT NULL,
	`cost_per_unit` real NOT NULL,
	`sell_per_unit` real NOT NULL,
	`expiry_date` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "purchaseItem_qty_chk" CHECK("purchase_items"."qty_purchased" > 0 AND "purchase_items"."qty_remaining" >= 0 AND "purchase_items"."qty_remaining" <= "purchase_items"."qty_purchased")
);
--> statement-breakpoint
CREATE INDEX `purchaseItem_purchaseId_idx` ON `purchase_items` (`purchase_id`);--> statement-breakpoint
CREATE INDEX `purchaseItem_medicineExpiry_idx` ON `purchase_items` (`medicine_id`,`expiry_date`);--> statement-breakpoint
CREATE TABLE `purchase_returns` (
	`id` text PRIMARY KEY NOT NULL,
	`compnay_id` text NOT NULL,
	`purchase_id` text NOT NULL,
	`total_amount` real NOT NULL,
	`reason` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`compnay_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `companyId_idx` ON `purchase_returns` (`compnay_id`);--> statement-breakpoint
CREATE INDEX `purchaseReturn_createdBy_idx` ON `purchase_returns` (`created_by`);--> statement-breakpoint
CREATE TABLE `purchase_return_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_return_id` text NOT NULL,
	`purchase_item_id` text NOT NULL,
	`qty` integer NOT NULL,
	`unit_cost` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`purchase_item_id`) REFERENCES `purchase_items`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "purchaseReturnItem_qty_chk" CHECK("purchase_return_items"."qty" > 0)
);
--> statement-breakpoint
CREATE INDEX `purchaseReturnItem_returnId_idx` ON `purchase_return_items` (`purchase_return_id`);