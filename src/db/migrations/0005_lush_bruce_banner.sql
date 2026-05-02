CREATE TABLE `valuations` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`template_type` text NOT NULL,
	`title` text NOT NULL,
	`valuation_date` text NOT NULL,
	`current_price` integer DEFAULT 0 NOT NULL,
	`shares_outstanding` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`scenario_bear_json` text DEFAULT '{}' NOT NULL,
	`scenario_base_json` text DEFAULT '{}' NOT NULL,
	`scenario_bull_json` text DEFAULT '{}' NOT NULL,
	`result_json` text DEFAULT '{}' NOT NULL,
	`user_notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
