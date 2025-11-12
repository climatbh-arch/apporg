-- ============ ASSETS (Gestão de Ativos) ============
CREATE TABLE IF NOT EXISTS "assets" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "clientId" INTEGER NOT NULL,
  "serialNumber" VARCHAR(100) UNIQUE NOT NULL,
  "brand" VARCHAR(100) NOT NULL,
  "model" VARCHAR(100) NOT NULL,
  "capacity" VARCHAR(50),
  "installationDate" DATE,
  "warrantyDate" DATE,
  "physicalLocation" TEXT,
  "lastWorkOrderId" INTEGER,
  "nextMaintenanceDate" DATE,
  "assetType" VARCHAR(50) DEFAULT 'air_conditioner',
  "status" VARCHAR(50) DEFAULT 'active',
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ TECHNICIAN SKILLS (Habilidades dos Técnicos) ============
CREATE TABLE IF NOT EXISTS "technicianSkills" (
  "id" SERIAL PRIMARY KEY,
  "technicianId" INTEGER NOT NULL,
  "skillName" VARCHAR(100) NOT NULL,
  "skillLevel" VARCHAR(50) DEFAULT 'intermediate',
  "certificationNumber" VARCHAR(100),
  "certificationDate" DATE,
  "expiryDate" DATE,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ TECHNICIAN LOCATIONS (Geolocalização dos Técnicos) ============
CREATE TABLE IF NOT EXISTS "technicianLocations" (
  "id" SERIAL PRIMARY KEY,
  "technicianId" INTEGER NOT NULL,
  "latitude" DECIMAL(10, 8) NOT NULL,
  "longitude" DECIMAL(11, 8) NOT NULL,
  "accuracy" DECIMAL(10, 2),
  "status" VARCHAR(50) DEFAULT 'available',
  "workOrderId" INTEGER,
  "timestamp" TIMESTAMP DEFAULT NOW() NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ WORK ORDER PHOTOS (Fotos das OS) ============
CREATE TABLE IF NOT EXISTS "workOrderPhotos" (
  "id" SERIAL PRIMARY KEY,
  "workOrderId" INTEGER NOT NULL,
  "photoUrl" TEXT NOT NULL,
  "photoType" VARCHAR(50) DEFAULT 'before',
  "latitude" DECIMAL(10, 8),
  "longitude" DECIMAL(11, 8),
  "timestamp" TIMESTAMP DEFAULT NOW() NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ AUTOMATED NOTIFICATIONS (Notificações Automatizadas) ============
CREATE TABLE IF NOT EXISTS "automatedNotifications" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "notificationType" VARCHAR(50) NOT NULL,
  "recipientType" VARCHAR(50) NOT NULL,
  "recipientId" INTEGER NOT NULL,
  "recipientContact" VARCHAR(100) NOT NULL,
  "channel" VARCHAR(50) DEFAULT 'email',
  "subject" VARCHAR(255),
  "message" TEXT NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "scheduledFor" TIMESTAMP,
  "sentAt" TIMESTAMP,
  "errorMessage" TEXT,
  "relatedEntityType" VARCHAR(50),
  "relatedEntityId" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ MAINTENANCE CONTRACTS (Contratos de Manutenção) ============
CREATE TABLE IF NOT EXISTS "maintenanceContracts" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "clientId" INTEGER NOT NULL,
  "contractNumber" VARCHAR(50) UNIQUE NOT NULL,
  "assetId" INTEGER,
  "contractType" VARCHAR(50) DEFAULT 'preventive',
  "frequency" VARCHAR(50) DEFAULT 'monthly',
  "value" VARCHAR(20) NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "status" VARCHAR(50) DEFAULT 'active',
  "autoRenew" BOOLEAN DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============ DISPATCH QUEUE (Fila de Despacho) ============
CREATE TABLE IF NOT EXISTS "dispatchQueue" (
  "id" SERIAL PRIMARY KEY,
  "workOrderId" INTEGER NOT NULL,
  "priority" INTEGER DEFAULT 5,
  "slaLevel" VARCHAR(50) DEFAULT 'normal',
  "requiredSkills" TEXT,
  "estimatedDuration" INTEGER,
  "suggestedTechnicianId" INTEGER,
  "assignmentScore" DECIMAL(5, 2),
  "status" VARCHAR(50) DEFAULT 'pending',
  "assignedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS "idx_assets_clientId" ON "assets"("clientId");
CREATE INDEX IF NOT EXISTS "idx_assets_serialNumber" ON "assets"("serialNumber");
CREATE INDEX IF NOT EXISTS "idx_assets_nextMaintenanceDate" ON "assets"("nextMaintenanceDate");
CREATE INDEX IF NOT EXISTS "idx_technicianSkills_technicianId" ON "technicianSkills"("technicianId");
CREATE INDEX IF NOT EXISTS "idx_technicianLocations_technicianId" ON "technicianLocations"("technicianId");
CREATE INDEX IF NOT EXISTS "idx_technicianLocations_timestamp" ON "technicianLocations"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_workOrderPhotos_workOrderId" ON "workOrderPhotos"("workOrderId");
CREATE INDEX IF NOT EXISTS "idx_automatedNotifications_status" ON "automatedNotifications"("status");
CREATE INDEX IF NOT EXISTS "idx_automatedNotifications_scheduledFor" ON "automatedNotifications"("scheduledFor");
CREATE INDEX IF NOT EXISTS "idx_maintenanceContracts_clientId" ON "maintenanceContracts"("clientId");
CREATE INDEX IF NOT EXISTS "idx_maintenanceContracts_status" ON "maintenanceContracts"("status");
CREATE INDEX IF NOT EXISTS "idx_dispatchQueue_status" ON "dispatchQueue"("status");
CREATE INDEX IF NOT EXISTS "idx_dispatchQueue_workOrderId" ON "dispatchQueue"("workOrderId");

-- Adicionar campos novos às tabelas existentes
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "assetId" INTEGER;
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "serviceType" VARCHAR(50) DEFAULT 'corrective';
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "priority" INTEGER DEFAULT 5;
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "slaLevel" VARCHAR(50) DEFAULT 'normal';
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP;
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER;
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "checkInTime" TIMESTAMP;
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "checkOutTime" TIMESTAMP;
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "checkInLatitude" DECIMAL(10, 8);
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "checkInLongitude" DECIMAL(11, 8);
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "checkOutLatitude" DECIMAL(10, 8);
ALTER TABLE "workOrders" ADD COLUMN IF NOT EXISTS "checkOutLongitude" DECIMAL(11, 8);

ALTER TABLE "technicians" ADD COLUMN IF NOT EXISTS "currentStatus" VARCHAR(50) DEFAULT 'available';
ALTER TABLE "technicians" ADD COLUMN IF NOT EXISTS "currentLatitude" DECIMAL(10, 8);
ALTER TABLE "technicians" ADD COLUMN IF NOT EXISTS "currentLongitude" DECIMAL(11, 8);
ALTER TABLE "technicians" ADD COLUMN IF NOT EXISTS "workZone" VARCHAR(100);
ALTER TABLE "technicians" ADD COLUMN IF NOT EXISTS "maxWorkOrdersPerDay" INTEGER DEFAULT 8;

ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "contractType" VARCHAR(50) DEFAULT 'on_demand';
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "segmentation" VARCHAR(50);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 8);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11, 8);
