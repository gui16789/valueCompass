CREATE TABLE `custom_checklist_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_type` text NOT NULL,
	`title` text NOT NULL,
	`items_json` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
