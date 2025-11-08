import {
  integer,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
  pgTable,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const clientTypeEnum = pgEnum("clientType", ["residential", "commercial"]);
export const equipmentTypeEnum = pgEnum("equipmentType", ["split", "window", "portable", "floor_ceiling", "cassette"]);
export const serviceTypeEnum = pgEnum("serviceType", ["installation", "maintenance", "gas_charge", "cleaning", "repair", "inspection"]);
export const workOrderStatusEnum = pgEnum("workOrderStatus", ["pending", "approved", "in_progress", "completed", "cancelled"]);
export const inventoryMovementTypeEnum = pgEnum("inventoryMovementType", ["in", "out"]);
export const inventoryCategoryEnum = pgEnum("inventoryCategory", ["condenser", "tubing", "gas", "connector", "support", "filter", "compressor", "other"]);
export const transactionTypeEnum = pgEnum("transactionType", ["income", "expense"]);
export const paymentMethodEnum = pgEnum("paymentMethod", ["cash", "credit_card", "debit_card", "transfer", "check"]);
export const transactionStatusEnum = pgEnum("transactionStatus", ["pending", "completed", "cancelled"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }).unique(),
  name: text("name"),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clientes da empresa
 */
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  clientType: clientTypeEnum("clientType").default("residential").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Equipamentos de ar condicionado
 */
export const equipments = pgTable("equipments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  btu: integer("btu").notNull(),
  type: equipmentTypeEnum("type").notNull(),
  serialNumber: varchar("serialNumber", { length: 100 }),
  installationDate: timestamp("installationDate"),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Equipment = typeof equipments.$inferSelect;
export type InsertEquipment = typeof equipments.$inferInsert;

/**
 * Orçamentos e Ordens de Serviço
 */
export const workOrders = pgTable("workOrders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  clientId: integer("clientId").notNull(),
  equipmentId: integer("equipmentId"),
  serviceType: serviceTypeEnum("serviceType").notNull(),
  status: workOrderStatusEnum("status").default("pending").notNull(),
  totalValue: numeric("totalValue", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  technician: varchar("technician", { length: 255 }),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

/**
 * Itens de Orçamento/OS (peças, produtos, mão de obra)
 */
export const workOrderItems = pgTable("workOrderItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  workOrderId: integer("workOrderId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("totalPrice", { precision: 10, scale: 2 }).notNull(),
  itemType: varchar("itemType", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkOrderItem = typeof workOrderItems.$inferSelect;
export type InsertWorkOrderItem = typeof workOrderItems.$inferInsert;

/**
 * Estoque de peças e produtos
 */
export const inventory = pgTable("inventory", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: inventoryCategoryEnum("category").notNull(),
  quantity: integer("quantity").notNull(),
  minimumQuantity: integer("minimumQuantity").notNull(),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Movimentação de estoque
 */
export const inventoryMovements = pgTable("inventoryMovements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  inventoryId: integer("inventoryId").notNull(),
  workOrderId: integer("workOrderId"),
  type: inventoryMovementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = typeof inventoryMovements.$inferInsert;

/**
 * Transações Financeiras
 */
export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  type: transactionTypeEnum("type").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  workOrderId: integer("workOrderId"),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  status: transactionStatusEnum("status").default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Histórico de Manutenção
 */
export const maintenanceHistory = pgTable("maintenanceHistory", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  equipmentId: integer("equipmentId").notNull(),
  workOrderId: integer("workOrderId"),
  description: text("description").notNull(),
  technician: varchar("technician", { length: 255 }),
  maintenanceDate: timestamp("maintenanceDate").defaultNow().notNull(),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type InsertMaintenanceHistory = typeof maintenanceHistory.$inferInsert;

/**
 * Fechamento de Caixa
 */
export const cashClosures = pgTable("cashClosures", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  closureDate: timestamp("closureDate").notNull(),
  totalIncome: numeric("totalIncome", { precision: 10, scale: 2 }).notNull(),
  totalExpense: numeric("totalExpense", { precision: 10, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashClosure = typeof cashClosures.$inferSelect;
export type InsertCashClosure = typeof cashClosures.$inferInsert;
