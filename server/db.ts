import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser, users, clients, quotes, quoteItems, workOrders, workOrderItems,
  technicians, products, payments, expenses, quoteHistory, workOrderChecklist,
  InsertClient, InsertTechnician, InsertProduct, InsertQuote, InsertQuoteItem,
  InsertWorkOrder, InsertWorkOrderItem, InsertPayment, InsertExpense
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      if (user[field] !== undefined) {
        values[field] = user[field];
        updateSet[field] = user[field];
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ CLIENTS ============

export async function getAllClients(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clients).where(eq(clients.userId, userId));
}

export async function getClientById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clients).values(data);
  // Get the inserted client with ID
  const insertedClient = await db.select().from(clients).where(eq(clients.userId, data.userId)).orderBy(desc(clients.id)).limit(1);
  if (!insertedClient[0]) throw new Error("Failed to retrieve inserted client");
  return insertedClient[0];
}

export async function updateClient(id: number, data: Partial<InsertClient>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(and(eq(clients.id, id), eq(clients.userId, userId)));
  return { id, ...data };
}

export async function deleteClient(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
}

// ============ TECHNICIANS ============

export async function getAllTechnicians(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(technicians).where(eq(technicians.userId, userId));
}

export async function getTechnicianById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(technicians).where(and(eq(technicians.id, id), eq(technicians.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTechnician(data: InsertTechnician) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Convert hourlyRate to string if it's a number
  const processedData = {
    ...data,
    hourlyRate: data.hourlyRate ? String(data.hourlyRate) : "0"
  };
  const result = await db.insert(technicians).values(processedData);
  const insertedTechnician = await db.select().from(technicians).where(eq(technicians.userId, data.userId)).orderBy(desc(technicians.id)).limit(1);
  return insertedTechnician[0] || processedData;
}

export async function updateTechnician(id: number, data: Partial<InsertTechnician>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(technicians).set(data).where(and(eq(technicians.id, id), eq(technicians.userId, userId)));
  return { id, ...data };
}

export async function deleteTechnician(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(technicians).where(and(eq(technicians.id, id), eq(technicians.userId, userId)));
}

// ============ PRODUCTS ============

export async function getAllProducts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.userId, userId));
}

export async function getProductById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(and(eq(products.id, id), eq(products.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(data);
  return data;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(and(eq(products.id, id), eq(products.userId, userId)));
  return { id, ...data };
}

export async function deleteProduct(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)));
}

// ============ QUOTES ============

export async function getAllQuotes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.createdAt));
}

export async function getQuoteById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createQuote(data: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quotes).values(data);
  // Get the inserted quote with ID
  const insertedQuote = await db.select().from(quotes).where(eq(quotes.userId, data.userId)).orderBy(desc(quotes.id)).limit(1);
  return insertedQuote[0] || data;
}

export async function updateQuote(id: number, data: Partial<InsertQuote>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set(data).where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
  return { id, ...data };
}

export async function deleteQuote(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
}

export async function getQuoteItems(quoteId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const quote = await getQuoteById(quoteId, userId);
  if (!quote) return [];
  return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

export async function createQuoteItem(data: InsertQuoteItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quoteItems).values(data);
  return data;
}

export async function deleteQuoteItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(quoteItems).where(eq(quoteItems.id, id));
}

// ============ WORK ORDERS ============

export async function getAllWorkOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(workOrders).where(eq(workOrders.userId, userId)).orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createWorkOrder(data: InsertWorkOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(workOrders).values(data);
  return data;
}

export async function updateWorkOrder(id: number, data: Partial<InsertWorkOrder>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(workOrders).set(data).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)));
  return { id, ...data };
}

export async function deleteWorkOrder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)));
}

export async function getWorkOrderItems(workOrderId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const workOrder = await getWorkOrderById(workOrderId, userId);
  if (!workOrder) return [];
  return await db.select().from(workOrderItems).where(eq(workOrderItems.workOrderId, workOrderId));
}

export async function createWorkOrderItem(data: InsertWorkOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(workOrderItems).values(data);
  return data;
}

export async function deleteWorkOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(workOrderItems).where(eq(workOrderItems.id, id));
}

// ============ PAYMENTS ============

export async function getAllPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
}

export async function getPaymentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(payments).values(data);
  return data;
}

export async function updatePayment(id: number, data: Partial<InsertPayment>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(and(eq(payments.id, id), eq(payments.userId, userId)));
  return { id, ...data };
}

export async function deletePayment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(payments).where(and(eq(payments.id, id), eq(payments.userId, userId)));
}

// ============ EXPENSES ============

export async function getAllExpenses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.createdAt));
}

export async function getExpenseById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createExpense(data: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(expenses).values(data);
  return data;
}

export async function updateExpense(id: number, data: Partial<InsertExpense>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expenses).set(data).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  return { id, ...data };
}

export async function deleteExpense(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalQuotes: 0, totalWorkOrders: 0, quotesApproved: 0, workOrdersCompleted: 0 };

  const allQuotes = await db.select().from(quotes).where(eq(quotes.userId, userId));
  const allWorkOrders = await db.select().from(workOrders).where(eq(workOrders.userId, userId));

  const quotesApproved = allQuotes.filter(q => q.status === 'approved').length;
  const workOrdersCompleted = allWorkOrders.filter(w => w.status === 'completed').length;

  return {
    totalQuotes: allQuotes.length,
    totalWorkOrders: allWorkOrders.length,
    quotesApproved,
    workOrdersCompleted,
  };
}

// ============ FINANCIAL REPORT ============

export async function getFinancialReport(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, pendingPayments: 0 };

  let paymentsData = await db.select().from(payments).where(eq(payments.userId, userId));
  let expensesData = await db.select().from(expenses).where(eq(expenses.userId, userId));

  if (startDate && endDate) {
    paymentsData = paymentsData.filter(p => new Date(p.createdAt) >= startDate && new Date(p.createdAt) <= endDate);
    expensesData = expensesData.filter(e => new Date(e.createdAt) >= startDate && new Date(e.createdAt) <= endDate);
  }

  const totalRevenue = paymentsData
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalExpenses = expensesData
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const pendingPayments = paymentsData
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return {
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    pendingPayments,
  };
}
