CREATE TABLE `quoteItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`itemType` enum('part','product','labor') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quoteItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quoteNumber` varchar(50) NOT NULL,
	`clientId` int NOT NULL,
	`equipmentId` int,
	`serviceType` enum('installation','maintenance','gas_charge','cleaning','repair','inspection') NOT NULL,
	`quoteStatus` enum('draft','sent','approved','rejected','converted') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(10,2) NOT NULL,
	`discountPercent` decimal(5,2) NOT NULL DEFAULT '0',
	`discountAmount` decimal(10,2) NOT NULL DEFAULT '0',
	`totalValue` decimal(10,2) NOT NULL,
	`description` text,
	`validityDate` timestamp,
	`sentDate` timestamp,
	`approvedDate` timestamp,
	`convertedToWorkOrderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotes_quoteNumber_unique` UNIQUE(`quoteNumber`)
);
--> statement-breakpoint
ALTER TABLE `workOrders` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `workOrderNumber` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `quoteId` int;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `workOrderStatus` enum('pending','approved','in_progress','completed','cancelled') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `subtotal` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `startDate` timestamp;--> statement-breakpoint
ALTER TABLE `workOrders` ADD CONSTRAINT `workOrders_workOrderNumber_unique` UNIQUE(`workOrderNumber`);--> statement-breakpoint
ALTER TABLE `workOrders` DROP COLUMN `status`;