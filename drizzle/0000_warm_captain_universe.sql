CREATE TABLE `completions` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`user_id` text NOT NULL,
	`at` integer NOT NULL,
	`day` integer NOT NULL,
	`period` integer NOT NULL,
	`amount` real,
	`effects` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `completions_habit_period` ON `completions` (`habit_id`,`period`);--> statement-breakpoint
CREATE INDEX `completions_user_day` ON `completions` (`user_id`,`day`);--> statement-breakpoint
CREATE TABLE `feed_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`icon` text NOT NULL,
	`at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feed_at` ON `feed_events` (`at`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`icon` text NOT NULL,
	`notes` text,
	`template_id` text,
	`difficulty` text NOT NULL,
	`weights` text NOT NULL,
	`schedule` text,
	`quantity` integer,
	`unit` text,
	`due_day` integer,
	`anchor_day` integer NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`best_streak` integer DEFAULT 0 NOT NULL,
	`last_evaluated` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`archived_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `habits_user` ON `habits` (`user_id`);--> statement-breakpoint
CREATE TABLE `inventory` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`qty` integer DEFAULT 1 NOT NULL,
	`acquired_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mission_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mission_id` text NOT NULL,
	`pet_id` text,
	`seed` integer NOT NULL,
	`started_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`claimed_at` integer,
	`outcome` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `mission_runs_user` ON `mission_runs` (`user_id`);--> statement-breakpoint
CREATE TABLE `pets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`species_id` text NOT NULL,
	`name` text NOT NULL,
	`stage` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`fullness` real DEFAULT 80 NOT NULL,
	`joy` real DEFAULT 80 NOT NULL,
	`tidiness` real DEFAULT 80 NOT NULL,
	`needs_at` integer NOT NULL,
	`warmth` integer DEFAULT 0 NOT NULL,
	`warmth_needed` integer DEFAULT 0 NOT NULL,
	`accessory_id` text,
	`active` integer DEFAULT false NOT NULL,
	`last_pat_at` integer,
	`last_play_at` integer,
	`last_tidy_at` integer,
	`source` text NOT NULL,
	`obtained_at` integer NOT NULL,
	`hatched_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pets_user` ON `pets` (`user_id`);--> statement-breakpoint
CREATE TABLE `player_abilities` (
	`user_id` text NOT NULL,
	`ability_id` text NOT NULL,
	`acquired_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `ability_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `players` (
	`user_id` text PRIMARY KEY NOT NULL,
	`hero_name` text NOT NULL,
	`avatar` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`gp` integer DEFAULT 0 NOT NULL,
	`attr_points` integer DEFAULT 0 NOT NULL,
	`ability_points` integer DEFAULT 0 NOT NULL,
	`allocated` text NOT NULL,
	`stat_xp` text NOT NULL,
	`theme_id` text DEFAULT 'meadow' NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`day_start_hour` integer DEFAULT 4 NOT NULL,
	`resting` integer DEFAULT false NOT NULL,
	`last_visit_day` integer,
	`return_streak` integer DEFAULT 0 NOT NULL,
	`welcome_day` integer,
	`welcome_mess` integer DEFAULT 0 NOT NULL,
	`welcome_away` integer DEFAULT 0 NOT NULL,
	`welcome_done` integer DEFAULT true NOT NULL,
	`away_note` text,
	`shield_week` integer,
	`shields_used` integer DEFAULT 0 NOT NULL,
	`last_forage_day` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`display_name` text,
	`created_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);