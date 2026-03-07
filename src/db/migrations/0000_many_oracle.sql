CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer,
	`reminder_sent` integer DEFAULT false
);
