CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text,
	`company_id` text,
	`review_type` text DEFAULT 'post_decision' NOT NULL,
	`review_date` text NOT NULL,
	`what_happened` text DEFAULT '' NOT NULL,
	`assumptions_validated` text DEFAULT '' NOT NULL,
	`assumptions_failed` text DEFAULT '' NOT NULL,
	`lessons` text DEFAULT '' NOT NULL,
	`principle_changes_needed` text DEFAULT '' NOT NULL,
	`ai_summary` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`decision_id`) REFERENCES `decisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
