import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  clients,
  equipments,
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

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: typeof clients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: Partial<typeof clients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(eq(clients.id, id));
  return getClientById(id);
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clients).where(eq(clients.id, id));
}

// ============ EQUIPMENTS ============

export async function getEquipmentsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(equipments)
    .where(eq(equipments.clientId, clientId))
    .orderBy(desc(equipments.createdAt));
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(equipments).where(eq(equipments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEquipment(data: typeof equipments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(equipments).values(data);
  return result;
}

export async function updateEquipment(id: number, data: Partial<typeof equipments.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(equipments).set(data).where(eq(equipments.id, id));
  return getEquipmentById(id);
}

export async function deleteEquipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(equipments).where(eq(equipments.id, id));
}

// ============ WORK ORDERS ============

export async function getAllWorkOrders() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workOrders).orderBy(desc(workOrders.createdAt));
}

export async function getWorkOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWorkOrdersByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.clientId, clientId))
    .orderBy(desc(workOrders.createdAt));
}

export async function createWorkOrder(data: typeof workOrders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workOrders).values(data);
  return result;
}

export async function updateWorkOrder(id: number, data: Partial<typeof workOrders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(workOrders).set(data).where(eq(workOrders.id, id));
  return getWorkOrderById(id);
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

export async function getAllInventory() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(inventory).orderBy(desc(inventory.createdAt));
}

export async function getInventoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLowStockItems() {
  const db = await getDb();
  if (!db) return [];

  // Fetch all inventory and filter in JS
  const allItems = await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  return allItems.filter((item) => item.quantity <= item.minimumQuantity);
}

export async function createInventoryItem(data: typeof inventory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(inventory).values(data);
  return result;
}

export async function updateInventoryItem(id: number, data: Partial<typeof inventory.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(inventory).set(data).where(eq(inventory.id, id));
  return getInventoryById(id);
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

export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      )
    )
    .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(data: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(transactions).values(data);
  return result;
}

export async function updateTransaction(id: number, data: Partial<typeof transactions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(transactions).set(data).where(eq(transactions.id, id));
  return getTransactionById(id);
}

// ============ MAINTENANCE HISTORY ============

export async function getMaintenanceHistoryByEquipmentId(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(maintenanceHistory)
    .where(eq(maintenanceHistory.equipmentId, equipmentId))
    .orderBy(desc(maintenanceHistory.maintenanceDate));
}

export async function createMaintenanceRecord(data: typeof maintenanceHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(maintenanceHistory).values(data);
  return result;
}

// ============ CASH CLOSURES ============

export async function getCashClosures() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cashClosures).orderBy(desc(cashClosures.closureDate));
}

export async function createCashClosure(data: typeof cashClosures.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(cashClosures).values(data);
  return result;
}

// ============ DASHBOARD STATS ============

export async function getDailyStats(date: Date) {
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
