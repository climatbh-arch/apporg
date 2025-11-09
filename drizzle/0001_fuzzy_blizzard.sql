CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`category` varchar(100),
	`amount` varchar(20) NOT NULL,
	`paymentMethod` enum('cash','card','pix','boleto','transfer') DEFAULT 'cash',
	`status` enum('pending','paid') DEFAULT 'pending',
	`dueDate` date,
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workOrderId` int,
	`quoteId` int,
	`clientId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`amount` varchar(20) NOT NULL,
	`paymentMethod` enum('cash','card','pix','boleto','transfer') DEFAULT 'cash',
	`status` enum('pending','paid','overdue','cancelled') DEFAULT 'pending',
	`dueDate` date,
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('product','service') DEFAULT 'product',
	`price` varchar(20) NOT NULL,
	`cost` varchar(20) DEFAULT '0',
	`stock` int DEFAULT 0,
	`unit` varchar(50) DEFAULT 'un',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quoteHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`previousStatus` varchar(50),
	`newStatus` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quoteHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technicians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(20),
	`email` varchar(320),
	`phone` varchar(20),
	`role` varchar(100),
	`hourlyRate` varchar(20) DEFAULT '0',
	`isActive` boolean DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technicians_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workOrderChecklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workOrderId` int NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`isCompleted` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workOrderChecklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clients` ADD `cpfCnpj` varchar(20);--> statement-breakpoint
ALTER TABLE `quotes` ADD `sentVia` varchar(50);--> statement-breakpoint
ALTER TABLE `quotes` ADD `sentAt` timestamp;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `technicianId` int;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `clientSignature` text;--> statement-breakpoint
ALTER TABLE `workOrders` ADD `signedAt` timestamp;