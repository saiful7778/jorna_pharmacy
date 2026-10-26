PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`customer_id` text,
	`subtotal` real NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`invoice_id`) REFERENCES `sale_invoices`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_sales`("id", "invoice_id", "customer_id", "subtotal", "discount", "total_amount", "paid_amount", "created_by", "created_at", "updated_at") SELECT "id", "invoice_id", "customer_id", "subtotal", "discount", "total_amount", "paid_amount", "created_by", "created_at", "updated_at" FROM `sales`;--> statement-breakpoint
DROP TABLE `sales`;--> statement-breakpoint
ALTER TABLE `__new_sales` RENAME TO `sales`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `sale_invoiceId_idx` ON `sales` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `sale_customerId_idx` ON `sales` (`customer_id`);--> statement-breakpoint
CREATE INDEX `sale_createdAt_idx` ON `sales` (`created_at`);--> statement-breakpoint
CREATE INDEX `sale_createdBy_idx` ON `sales` (`created_by`);