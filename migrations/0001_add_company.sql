CREATE TABLE `companies` (
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
CREATE INDEX `company_name_idx` ON `companies` (`name`);--> statement-breakpoint
CREATE TABLE `company_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`purchase_id` text,
	`amount` real NOT NULL,
	`note` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "companyPayment_amount_chk" CHECK("company_payments"."amount" > 0)
);
--> statement-breakpoint
CREATE INDEX `companyPayment_companyId_idx` ON `company_payments` (`company_id`);--> statement-breakpoint
CREATE INDEX `companyPayment_createdAt_idx` ON `company_payments` (`created_at`);--> statement-breakpoint
CREATE INDEX `companyPayment_createdBy_idx` ON `company_payments` (`created_by`);