CREATE TABLE `company_research_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`title` text NOT NULL,
	`source_type` text DEFAULT 'manual_note' NOT NULL,
	`source_name` text DEFAULT '' NOT NULL,
	`source_date` text DEFAULT '' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`key_points` text DEFAULT '' NOT NULL,
	`verification_status` text DEFAULT 'pending' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
