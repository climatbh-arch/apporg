CREATE TYPE "public"."clientType" AS ENUM('residential', 'commercial');--> statement-breakpoint
CREATE TYPE "public"."equipmentType" AS ENUM('split', 'window', 'portable', 'floor_ceiling', 'cassette');--> statement-breakpoint
CREATE TYPE "public"."inventoryCategory" AS ENUM('condenser', 'tubing', 'gas', 'connector', 'support', 'filter', 'compressor', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventoryMovementType" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TYPE "public"."paymentMethod" AS ENUM('cash', 'credit_card', 'debit_card', 'transfer', 'check');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."serviceType" AS ENUM('installation', 'maintenance', 'gas_charge', 'cleaning', 'repair', 'inspection');--> statement-breakpoint
CREATE TYPE "public"."transactionStatus" AS ENUM('pending', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transactionType" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."workOrderStatus" AS ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "cashClosures" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cashClosures_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"closureDate" timestamp NOT NULL,
	"totalIncome" numeric(10, 2) NOT NULL,
	"totalExpense" numeric(10, 2) NOT NULL,
	"balance" numeric(10, 2) NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"zipCode" varchar(10),
	"clientType" "clientType" DEFAULT 'residential' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "equipments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"btu" integer NOT NULL,
	"type" "equipmentType" NOT NULL,
	"serialNumber" varchar(100),
	"installationDate" timestamp,
	"lastMaintenanceDate" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" "inventoryCategory" NOT NULL,
	"quantity" integer NOT NULL,
	"minimumQuantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"supplier" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventoryMovements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventoryMovements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"inventoryId" integer NOT NULL,
	"workOrderId" integer,
	"type" "inventoryMovementType" NOT NULL,
	"quantity" integer NOT NULL,
	"reason" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenanceHistory" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "maintenanceHistory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"equipmentId" integer NOT NULL,
	"workOrderId" integer,
	"description" text NOT NULL,
	"technician" varchar(255),
	"maintenanceDate" timestamp DEFAULT now() NOT NULL,
	"nextMaintenanceDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "transactionType" NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"workOrderId" integer,
	"paymentMethod" "paymentMethod" NOT NULL,
	"status" "transactionStatus" DEFAULT 'pending' NOT NULL,
	"dueDate" timestamp,
	"paidDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64),
	"email" varchar(320),
	"name" text,
	"passwordHash" varchar(255),
	"loginMethod" varchar(64) DEFAULT 'local',
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workOrderItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workOrderItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workOrderId" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	"itemType" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workOrders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workOrders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"equipmentId" integer,
	"serviceType" "serviceType" NOT NULL,
	"status" "workOrderStatus" DEFAULT 'pending' NOT NULL,
	"totalValue" numeric(10, 2) NOT NULL,
	"description" text,
	"technician" varchar(255),
	"scheduledDate" timestamp,
	"completedDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
