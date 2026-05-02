CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_code` text NOT NULL,
	`stock_name` text NOT NULL,
	`exchange` text NOT NULL,
	`industry` text DEFAULT '' NOT NULL,
	`company_type` text DEFAULT 'other' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `knowledge_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `model_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`role` text NOT NULL,
	`model_name` text NOT NULL,
	`temperature` integer DEFAULT 20 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `model_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `model_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`api_base_url` text NOT NULL,
	`api_key_encrypted` text NOT NULL,
	`is_openai_compatible` integer DEFAULT true NOT NULL,
	`default_model_name` text NOT NULL,
	`default_temperature` integer DEFAULT 20 NOT NULL,
	`max_context_tokens` integer DEFAULT 8000 NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`last_test_status` text DEFAULT 'not_tested' NOT NULL,
	`last_test_message` text DEFAULT '' NOT NULL,
	`last_tested_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
