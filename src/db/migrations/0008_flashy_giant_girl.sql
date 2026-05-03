CREATE TABLE `learning_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`node_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`mastery_score` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_results` (
	`id` text PRIMARY KEY NOT NULL,
	`question_set_json` text DEFAULT '[]' NOT NULL,
	`answers_json` text DEFAULT '{}' NOT NULL,
	`weak_topics_json` text DEFAULT '[]' NOT NULL,
	`answered_count` integer DEFAULT 0 NOT NULL,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`review_advice` text DEFAULT '' NOT NULL,
	`examiner_prompt` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
