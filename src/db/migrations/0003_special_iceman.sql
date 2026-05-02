ALTER TABLE `companies` ADD `watch_status` text DEFAULT 'watching' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `valuation_status` text DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `in_circle` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `thesis` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `key_risks` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `next_action` text DEFAULT '' NOT NULL;