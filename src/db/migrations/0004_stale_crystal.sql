CREATE TABLE `checklist_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_type` text NOT NULL,
	`company_id` text,
	`principle_id` text,
	`items_json` text DEFAULT '[]' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`final_judgment` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`principle_id`) REFERENCES `investment_principles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`checklist_run_id` text,
	`principle_id` text,
	`decision_type` text NOT NULL,
	`final_user_judgment` text NOT NULL,
	`key_assumptions` text DEFAULT '' NOT NULL,
	`risks` text DEFAULT '' NOT NULL,
	`opponent_summary` text DEFAULT '' NOT NULL,
	`decision_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`checklist_run_id`) REFERENCES `checklist_runs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`principle_id`) REFERENCES `investment_principles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `investment_principles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '我的 A 股价值投资原则' NOT NULL,
	`circle_of_competence` text DEFAULT '' NOT NULL,
	`excluded_industries` text DEFAULT '' NOT NULL,
	`minimum_financial_quality` text DEFAULT '' NOT NULL,
	`minimum_margin_of_safety` text DEFAULT '' NOT NULL,
	`position_rules` text DEFAULT '' NOT NULL,
	`buy_rules` text DEFAULT '' NOT NULL,
	`sell_rules` text DEFAULT '' NOT NULL,
	`do_nothing_rules` text DEFAULT '' NOT NULL,
	`risk_rules` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
