import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, quotes, quoteItems, workOrders, workOrderItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

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

export async function createClient(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clients).values(data);
  return data;
}

export async function updateClient(id: number, data: any, userId: number) {
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

// ============ QUOTES ============

export async function getAllQuotes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotes).where(eq(quotes.userId, userId));
}

export async function getQuoteById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createQuote(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quotes).values(data);
  return data;
}

export async function updateQuote(id: number, data: any, userId: number) {
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

// ============ QUOTE ITEMS ============

export async function getQuoteItems(quoteId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

export async function createQuoteItem(data: any) {
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
  return await db.select().from(workOrders).where(eq(workOrders.userId, userId));
}

export async function getWorkOrderById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createWorkOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(workOrders).values(data);
  return data;
}

export async function updateWorkOrder(id: number, data: any, userId: number) {
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

// ============ WORK ORDER ITEMS ============

export async function getWorkOrderItems(workOrderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(workOrderItems).where(eq(workOrderItems.workOrderId, workOrderId));
}

export async function createWorkOrderItem(data: any) {
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

// ============ DASHBOARD ============

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
