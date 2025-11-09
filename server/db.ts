import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  adminCredentials,
  clients,
  equipments,
  quotes,
  quoteItems,
  workOrders,
  workOrderItems,
  inventory,
  inventoryMovements,
  transactions,
  maintenanceHistory,
  cashClosures,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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

// ============ USERS ============

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CLIENTS ============

export async function getAllClients(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: typeof clients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: Partial<typeof clients.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(and(eq(clients.id, id), eq(clients.userId, userId)));
  return getClientById(id, userId);
}

export async function deleteClient(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
}

// ============ EQUIPMENTS ============

export async function getAllEquipments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(equipments).where(eq(equipments.userId, userId)).orderBy(desc(equipments.createdAt));
}

export async function getEquipmentsByClientId(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(equipments).where(and(eq(equipments.clientId, clientId), eq(equipments.userId, userId))).orderBy(desc(equipments.createdAt));
}

export async function getEquipmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(equipments).where(and(eq(equipments.id, id), eq(equipments.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEquipment(data: typeof equipments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(equipments).values(data);
  return result;
}

export async function updateEquipment(id: number, data: Partial<typeof equipments.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(equipments).set(data).where(and(eq(equipments.id, id), eq(equipments.userId, userId)));
  return getEquipmentById(id, userId);
}

export async function deleteEquipment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(equipments).where(and(eq(equipments.id, id), eq(equipments.userId, userId)));
}

// ============ WORK ORDERS ============

export async function getAllWorkOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workOrders).where(eq(workOrders.userId, userId)).orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWorkOrdersByClientId(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workOrders)
    .where(and(eq(workOrders.clientId, clientId), eq(workOrders.userId, userId)))
    .orderBy(desc(workOrders.createdAt));
}

export async function createWorkOrder(data: typeof workOrders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(workOrders).values(data);
  return result;
}

export async function updateWorkOrder(id: number, data: Partial<typeof workOrders.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(workOrders).set(data).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)));
  return getWorkOrderById(id, userId);
}

// ============ WORK ORDER ITEMS ============

export async function getWorkOrderItems(workOrderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.workOrderId, workOrderId));
}

export async function createWorkOrderItem(data: typeof workOrderItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workOrderItems).values(data);
  return result;
}

export async function deleteWorkOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(workOrderItems).where(eq(workOrderItems.id, id));
}

// ============ INVENTORY ============

export async function getAllInventory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(inventory).where(eq(inventory.userId, userId)).orderBy(desc(inventory.createdAt));
}

export async function getInventoryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(inventory).where(and(eq(inventory.id, id), eq(inventory.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLowStockItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Fetch all inventory and filter in JS
  const allItems = await db.select().from(inventory).where(eq(inventory.userId, userId)).orderBy(desc(inventory.createdAt));
  return allItems.filter((item) => item.quantity <= item.minimumQuantity);
}

export async function createInventoryItem(data: typeof inventory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(inventory).values(data);
  return result;
}

export async function updateInventoryItem(id: number, data: Partial<typeof inventory.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(inventory).set(data).where(and(eq(inventory.id, id), eq(inventory.userId, userId)));
  return getInventoryById(id, userId);
}

// ============ INVENTORY MOVEMENTS ============

export async function createInventoryMovement(data: typeof inventoryMovements.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(inventoryMovements).values(data);
  return result;
}

export async function getInventoryMovements(inventoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.inventoryId, inventoryId))
    .orderBy(desc(inventoryMovements.createdAt));
}

// ============ TRANSACTIONS ============

export async function getAllTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
}

export async function getTransactionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date, userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Ajustar as datas para incluir todo o dia (00:00 a 23:59:59)
  const adjustedStartDate = new Date(startDate);
  adjustedStartDate.setHours(0, 0, 0, 0);
  
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setHours(23, 59, 59, 999);

  return await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.createdAt, adjustedStartDate),
        lte(transactions.createdAt, adjustedEndDate)
      )
    )
    .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(data: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(transactions).values(data as any);
  return result;
}

export async function updateTransaction(id: number, data: Partial<typeof transactions.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  return getTransactionById(id, userId);
}

// ============ MAINTENANCE HISTORY ============

export async function getMaintenanceHistoryByEquipmentId(equipmentId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(maintenanceHistory)
    .where(and(eq(maintenanceHistory.equipmentId, equipmentId), eq(maintenanceHistory.userId, userId)))
    .orderBy(desc(maintenanceHistory.maintenanceDate));
}

export async function createMaintenanceRecord(data: typeof maintenanceHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(maintenanceHistory).values(data);
  return result;
}

// ============ CASH CLOSURES ============

export async function getCashClosures(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cashClosures).where(eq(cashClosures.userId, userId)).orderBy(desc(cashClosures.closureDate));
}

export async function createCashClosure(data: typeof cashClosures.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(cashClosures).values(data);
  return result;
}

// ============ DASHBOARD STATS ============

export async function getDailyStats(date: Date, userId: number) {
  const db = await getDb();
  if (!db) return { income: 0, expense: 0, workOrders: 0 };

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.createdAt, startOfDay),
        lte(transactions.createdAt, endOfDay)
      )
    );

  const income = dailyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const expense = dailyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const workOrdersCount = await db
    .select()
    .from(workOrders)
    .where(
      and(
        eq(workOrders.userId, userId),
        gte(workOrders.createdAt, startOfDay),
        lte(workOrders.createdAt, endOfDay)
      )
    );

  return {
    income,
    expense,
    workOrders: workOrdersCount.length,
  };
}


// ============ QUOTES ============

export async function getAllQuotes(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .orderBy(desc(quotes.createdAt));
}

export async function getQuoteById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuote(data: typeof quotes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quotes).values(data);
  return result;
}

export async function updateQuote(id: number, data: Partial<typeof quotes.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o quote pertence ao usuário
  const quote = await getQuoteById(id, userId);
  if (!quote) throw new Error("Quote not found or unauthorized");

  await db.update(quotes).set(data).where(eq(quotes.id, id));
  return getQuoteById(id, userId);
}

export async function deleteQuote(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o quote pertence ao usuário
  const quote = await getQuoteById(id, userId);
  if (!quote) throw new Error("Quote not found or unauthorized");

  await db.delete(quotes).where(eq(quotes.id, id));
}

// ============ QUOTE ITEMS ============

export async function getQuoteItems(quoteId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quoteId));
}

export async function createQuoteItem(data: typeof quoteItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quoteItems).values(data);
  return result;
}

export async function deleteQuoteItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(quoteItems).where(eq(quoteItems.id, id));
}


// ============ ADMIN CREDENTIALS ============

export async function createAdminCredential(data: typeof adminCredentials.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adminCredentials).values(data);
  return result;
}

export async function getAdminCredentialByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminCredentials)
    .where(eq(adminCredentials.username, username))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAdminCredentialByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminCredentials)
    .where(eq(adminCredentials.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
