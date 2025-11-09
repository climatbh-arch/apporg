import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, decimal, boolean } from "drizzle-orm/mysql-core";

// ============ USERS ============
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

// ============ CLIENTS ============
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
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

// ============ TECHNICIANS ============
export const technicians = mysqlTable("technicians", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 100 }),
  hourlyRate: varchar("hourlyRate", { length: 20 }).default("0"),
  isActive: boolean("isActive").default(true),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ PRODUCTS/SERVICES ============
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["product", "service"]).default("product"),
  price: varchar("price", { length: 20 }).notNull(),
  cost: varchar("cost", { length: 20 }).default("0"),
  stock: int("stock").default(0),
  unit: varchar("unit", { length: 50 }).default("un"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ QUOTES ============
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
  sentVia: varchar("sentVia", { length: 50 }),
  sentAt: timestamp("sentAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ QUOTE ITEMS ============
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

// ============ QUOTE HISTORY ============
export const quoteHistory = mysqlTable("quoteHistory", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  previousStatus: varchar("previousStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============ WORK ORDERS ============
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
  technicianId: int("technicianId"),
  technician: varchar("technician", { length: 255 }),
  laborHours: varchar("laborHours", { length: 20 }).default("0"),
  laborCostPerHour: varchar("laborCostPerHour", { length: 20 }).default("0"),
  laborTotal: varchar("laborTotal", { length: 20 }).default("0"),
  materialsTotal: varchar("materialsTotal", { length: 20 }).default("0"),
  totalValue: varchar("totalValue", { length: 20 }).default("0"),
  status: mysqlEnum("status", ["open", "in_progress", "completed", "delivered", "cancelled"]).default("open"),
  openedAt: date("openedAt"),
  completedAt: date("completedAt"),
  clientSignature: text("clientSignature"),
  signedAt: timestamp("signedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ WORK ORDER ITEMS ============
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

// ============ WORK ORDER CHECKLIST ============
export const workOrderChecklist = mysqlTable("workOrderChecklist", {
  id: int("id").autoincrement().primaryKey(),
  workOrderId: int("workOrderId").notNull(),
  taskName: varchar("taskName", { length: 255 }).notNull(),
  isCompleted: boolean("isCompleted").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============ PAYMENTS ============
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workOrderId: int("workOrderId"),
  quoteId: int("quoteId"),
  clientId: int("clientId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 20 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "pix", "boleto", "transfer"]).default("cash"),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending"),
  dueDate: date("dueDate"),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ EXPENSES ============
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  amount: varchar("amount", { length: 20 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "pix", "boleto", "transfer"]).default("cash"),
  status: mysqlEnum("status", ["pending", "paid"]).default("pending"),
  dueDate: date("dueDate"),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ TYPES ============
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = typeof technicians.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

export type QuoteHistory = typeof quoteHistory.$inferSelect;
export type InsertQuoteHistory = typeof quoteHistory.$inferInsert;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;

export type WorkOrderItem = typeof workOrderItems.$inferSelect;
export type InsertWorkOrderItem = typeof workOrderItems.$inferInsert;

export type WorkOrderChecklist = typeof workOrderChecklist.$inferSelect;
export type InsertWorkOrderChecklist = typeof workOrderChecklist.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
