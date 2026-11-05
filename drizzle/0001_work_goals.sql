CREATE TABLE `work_goals` (
	`user_id` text NOT NULL,
	`week` integer NOT NULL,
	`kind` text NOT NULL,
	`target` integer NOT NULL,
	PRIMARY KEY(`user_id`, `week`, `kind`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
