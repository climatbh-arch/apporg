-- Add userId column to clients table (nullable)
ALTER TABLE `clients` ADD COLUMN `userId` int;

-- Add userId column to equipments table (nullable)
ALTER TABLE `equipments` ADD COLUMN `userId` int;

-- Add userId column to inventory table (nullable)
ALTER TABLE `inventory` ADD COLUMN `userId` int;

-- Add userId column to transactions table (nullable)
ALTER TABLE `transactions` ADD COLUMN `userId` int;

-- Add userId column to maintenanceHistory table (nullable)
ALTER TABLE `maintenanceHistory` ADD COLUMN `userId` int;

-- Add userId column to cashClosures table (nullable)
ALTER TABLE `cashClosures` ADD COLUMN `userId` int;
