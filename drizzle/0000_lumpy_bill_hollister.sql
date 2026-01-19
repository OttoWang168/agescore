CREATE TABLE `calendar_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gmt_create` integer NOT NULL,
	`gmt_modified` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`date` text NOT NULL,
	`definition_code` text NOT NULL,
	`is_highlight` integer DEFAULT false,
	FOREIGN KEY (`definition_code`) REFERENCES `event_definitions`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_calendar_schedules_date` ON `calendar_schedules` (`date`);--> statement-breakpoint
CREATE INDEX `idx_calendar_schedules_def_name` ON `calendar_schedules` (`definition_code`);--> statement-breakpoint
CREATE TABLE `event_definitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gmt_create` integer NOT NULL,
	`gmt_modified` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`icon` text DEFAULT '📅',
	`description` text,
	`en_name` text,
	`meteorological_changes` text,
	`poem` text,
	`custom` text,
	`food` text,
	`health` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_event_definitions_name` ON `event_definitions` (`name`);--> statement-breakpoint
CREATE INDEX `idx_event_definitions_type` ON `event_definitions` (`type`);--> statement-breakpoint
CREATE TABLE `event_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gmt_create` integer NOT NULL,
	`gmt_modified` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`event_id` integer NOT NULL,
	`log_date` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_event_log_event_id` ON `event_log` (`event_id`);--> statement-breakpoint
CREATE INDEX `idx_event_log_log_date` ON `event_log` (`log_date`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gmt_create` integer NOT NULL,
	`gmt_modified` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`title` text NOT NULL,
	`event_date` text NOT NULL,
	`owner_id` integer,
	`icon` text DEFAULT '📅',
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_event_date` ON `events` (`event_date`);--> statement-breakpoint
CREATE INDEX `idx_events_user_id` ON `events` (`owner_id`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gmt_create` integer NOT NULL,
	`gmt_modified` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	`creator` text DEFAULT '77',
	`schedule_date` text,
	`is_used` integer DEFAULT false,
	`used_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_quote_schedule_date` ON `quotes` (`schedule_date`);--> statement-breakpoint
CREATE INDEX `idx_quote_pool` ON `quotes` (`is_deleted`,`is_used`,`schedule_date`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gmt_create` integer NOT NULL,
	`gmt_modified` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`username` text NOT NULL,
	`access_code_hash` text NOT NULL,
	`role` text DEFAULT 'user',
	`avatar` text DEFAULT '😄'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uk_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_user_is_deleted` ON `users` (`is_deleted`);