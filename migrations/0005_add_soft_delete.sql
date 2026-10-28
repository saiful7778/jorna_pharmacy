ALTER TABLE `companies` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `companies` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `company_payments` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `company_payments` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `customer_payments` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `customer_payments` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `purchases` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `purchases` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `purchase_returns` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `purchase_returns` ADD `deleted_by` text;--> statement-breakpoint
ALTER TABLE `sales` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `sales` ADD `deleted_by` text;