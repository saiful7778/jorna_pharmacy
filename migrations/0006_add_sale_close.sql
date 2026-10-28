CREATE TABLE `sale_closings` (
	`id` text PRIMARY KEY NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`vendor_paid` real DEFAULT 0,
	`total_sales` real NOT NULL,
	`opening_cash` real DEFAULT 0,
	`cash_received` real NOT NULL,
	`total_expenses` real DEFAULT 0 NOT NULL,
	`total_salary` real NOT NULL,
	`counted_cash` real,
	`closed_by` text,
	`note` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`closed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "saleClosing_period_chk" CHECK("sale_closings"."period_end" > "sale_closings"."period_start")
);
--> statement-breakpoint
CREATE INDEX `saleClosing_closedBy_idx` ON `sale_closings` (`closed_by`);--> statement-breakpoint
CREATE INDEX `saleClosing_periodStart_idx` ON `sale_closings` (`period_start`);