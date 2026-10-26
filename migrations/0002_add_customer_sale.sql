CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`address` text,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `customer_phone_idx` ON `customers` (`phone`);--> statement-breakpoint
CREATE INDEX `customer_name_idx` ON `customers` (`name`);--> statement-breakpoint
CREATE TABLE `customer_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`sale_id` text,
	`amount` real NOT NULL,
	`note` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "customerPayment_amount_chk" CHECK("customer_payments"."amount" > 0)
);
--> statement-breakpoint
CREATE INDEX `customerPayment_customerId_idx` ON `customer_payments` (`customer_id`);--> statement-breakpoint
CREATE INDEX `customerPayment_saleId_idx` ON `customer_payments` (`sale_id`);--> statement-breakpoint
CREATE INDEX `customerPayment_createdAt_idx` ON `customer_payments` (`created_at`);--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`invoiceId` text NOT NULL,
	`customer_id` text,
	`subtotal` real NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`invoiceId`) REFERENCES `sale_invoices`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "sale_walkInPaid_chk" CHECK("sales"."customer_id" IS NOT NULL OR "sales"."paid_amount" = "sales"."total_amount")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sale_invoiceId_idx` ON `sales` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `sale_customerId_idx` ON `sales` (`customer_id`);--> statement-breakpoint
CREATE INDEX `sale_createdAt_idx` ON `sales` (`created_at`);--> statement-breakpoint
CREATE INDEX `sale_createdBy_idx` ON `sales` (`created_by`);--> statement-breakpoint
CREATE TABLE `sale_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`is_linked` integer DEFAULT false NOT NULL,
	`reserved_by` text,
	`reserved_until` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`reserved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sale_invoice_number_idx` ON `sale_invoices` (`number`);--> statement-breakpoint
CREATE INDEX `sale_invoice_reservation_idx` ON `sale_invoices` (`is_linked`,`reserved_until`);--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`medicine_id` text NOT NULL,
	`purchase_item_id` text NOT NULL,
	`qty` integer NOT NULL,
	`unit_price` real NOT NULL,
	`unit_cost` real NOT NULL,
	`line_total` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`purchase_item_id`) REFERENCES `purchase_items`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "saleItem_qty_chk" CHECK("sale_items"."qty" > 0)
);
--> statement-breakpoint
CREATE INDEX `saleItem_saleId_idx` ON `sale_items` (`sale_id`);--> statement-breakpoint
CREATE INDEX `saleItem_medicineId_idx` ON `sale_items` (`medicine_id`);--> statement-breakpoint
CREATE INDEX `saleItem_purchaseItemId_idx` ON `sale_items` (`purchase_item_id`);