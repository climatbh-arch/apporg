CREATE TABLE `workOrderHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workOrderId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`previousStatus` varchar(50),
	`newStatus` varchar(50),
	`changedFields` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workOrderHistory_id` PRIMARY KEY(`id`)
);
