import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
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

/**
 * Tabela de Clientes
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de Orçamentos
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientWhatsapp: varchar("clientWhatsapp", { length: 20 }),
  serviceDescription: text("serviceDescription"),
  subtotal: varchar("subtotal", { length: 20 }).default("0"),
  discountPercent: varchar("discountPercent", { length: 10 }).default("0"),
  discountAmount: varchar("discountAmount", { length: 20 }).default("0"),
  totalValue: varchar("totalValue", { length: 20 }).default("0"),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected", "converted"]).default("draft"),
  validityDate: date("validityDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de Itens de Orçamento
 */
export const quoteItems = mysqlTable("quoteItems", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: varchar("quantity", { length: 20 }).notNull(),
  unitPrice: varchar("unitPrice", { length: 20 }).notNull(),
  totalPrice: varchar("totalPrice", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de Ordens de Serviço
 */
export const workOrders = mysqlTable("workOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workOrderNumber: varchar("workOrderNumber", { length: 50 }).notNull().unique(),
  quoteId: int("quoteId"),
  clientId: int("clientId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientWhatsapp: varchar("clientWhatsapp", { length: 20 }),
  serviceDescription: text("serviceDescription"),
  technician: varchar("technician", { length: 255 }),
  laborHours: varchar("laborHours", { length: 20 }).default("0"),
  laborCostPerHour: varchar("laborCostPerHour", { length: 20 }).default("0"),
  laborTotal: varchar("laborTotal", { length: 20 }).default("0"),
  materialsTotal: varchar("materialsTotal", { length: 20 }).default("0"),
  totalValue: varchar("totalValue", { length: 20 }).default("0"),
  status: mysqlEnum("status", ["open", "in_progress", "completed", "delivered", "cancelled"]).default("open"),
  openedAt: date("openedAt"),
  completedAt: date("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de Itens de Ordem de Serviço
 */
export const workOrderItems = mysqlTable("workOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  workOrderId: int("workOrderId").notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  itemType: mysqlEnum("itemType", ["material", "labor", "service"]).default("material"),
  quantity: varchar("quantity", { length: 20 }).notNull(),
  unitPrice: varchar("unitPrice", { length: 20 }).notNull(),
  totalPrice: varchar("totalPrice", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

export type WorkOrderItem = typeof workOrderItems.$inferSelect;
export type InsertWorkOrderItem = typeof workOrderItems.$inferInsert;
