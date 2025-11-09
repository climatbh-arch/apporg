import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credenciais de admin para login com usuário/senha
 */
export const adminCredentials = mysqlTable("adminCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  passwordSalt: varchar("passwordSalt", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * Clientes da empresa
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  clientType: mysqlEnum("clientType", ["residential", "commercial"]).default("residential").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Equipamentos de ar condicionado
 */
export const equipments = mysqlTable("equipments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  clientId: int("clientId").notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  btu: int("btu").notNull(), // Capacidade em BTU
  type: mysqlEnum("type", ["split", "window", "portable", "floor_ceiling", "cassette"]).notNull(),
  serialNumber: varchar("serialNumber", { length: 100 }),
  installationDate: timestamp("installationDate"),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipments.$inferSelect;
export type InsertEquipment = typeof equipments.$inferInsert;

/**
 * Orçamentos (Quotes)
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  equipmentId: int("equipmentId"),
  serviceType: mysqlEnum("serviceType", [
    "installation",
    "maintenance",
    "gas_charge",
    "cleaning",
    "repair",
    "inspection",
  ]).notNull(),
  status: mysqlEnum("quoteStatus", [
    "draft",
    "sent",
    "approved",
    "rejected",
    "converted",
  ]).default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).default("0").notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  validityDate: timestamp("validityDate"),
  sentDate: timestamp("sentDate"),
  approvedDate: timestamp("approvedDate"),
  convertedToWorkOrderId: int("convertedToWorkOrderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Itens de Orçamento
 */
export const quoteItems = mysqlTable("quoteItems", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  itemType: mysqlEnum("itemType", ["part", "product", "labor"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

/**
 * Ordens de Serviço (Work Orders)
 */
export const workOrders = mysqlTable("workOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workOrderNumber: varchar("workOrderNumber", { length: 50 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  equipmentId: int("equipmentId"),
  quoteId: int("quoteId"),
  serviceType: mysqlEnum("serviceType", [
    "installation",
    "maintenance",
    "gas_charge",
    "cleaning",
    "repair",
    "inspection",
  ]).notNull(),
  status: mysqlEnum("workOrderStatus", [
    "pending",
    "approved",
    "in_progress",
    "completed",
    "cancelled",
  ]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  technician: varchar("technician", { length: 255 }),
  scheduledDate: timestamp("scheduledDate"),
  startDate: timestamp("startDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

/**
 * Itens de Ordem de Serviço (peças, produtos, mão de obra)
 */
export const workOrderItems = mysqlTable("workOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  workOrderId: int("workOrderId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  itemType: mysqlEnum("itemType", ["part", "product", "labor"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkOrderItem = typeof workOrderItems.$inferSelect;
export type InsertWorkOrderItem = typeof workOrderItems.$inferInsert;

/**
 * Estoque de peças e produtos
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "condenser",
    "tubing",
    "gas",
    "connector",
    "support",
    "filter",
    "compressor",
    "other",
  ]).notNull(),
  quantity: int("quantity").notNull(),
  minimumQuantity: int("minimumQuantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Movimentação de estoque
 */
export const inventoryMovements = mysqlTable("inventoryMovements", {
  id: int("id").autoincrement().primaryKey(),
  inventoryId: int("inventoryId").notNull(),
  workOrderId: int("workOrderId"),
  type: mysqlEnum("type", ["in", "out"]).notNull(),
  quantity: int("quantity").notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = typeof inventoryMovements.$inferInsert;

/**
 * Transações Financeiras
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  workOrderId: int("workOrderId"),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "credit_card", "debit_card", "transfer", "check"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Histórico de Manutenção
 */
export const maintenanceHistory = mysqlTable("maintenanceHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  equipmentId: int("equipmentId").notNull(),
  workOrderId: int("workOrderId"),
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
export const cashClosures = mysqlTable("cashClosures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  closureDate: timestamp("closureDate").notNull(),
  totalIncome: decimal("totalIncome", { precision: 10, scale: 2 }).notNull(),
  totalExpense: decimal("totalExpense", { precision: 10, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashClosure = typeof cashClosures.$inferSelect;
export type InsertCashClosure = typeof cashClosures.$inferInsert;
