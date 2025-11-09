import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  clients,
  equipments,
  quotes,
  quoteItems,
  workOrders,
  workOrderMaterials,
  maintenanceHistory,
  maintenanceReminders,
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

// ============ QUOTES ============

export async function getAllQuotes(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.createdAt));
}

export async function getQuoteById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuotesByClientId(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(quotes).where(and(eq(quotes.clientId, clientId), eq(quotes.userId, userId))).orderBy(desc(quotes.createdAt));
}

export async function createQuote(data: typeof quotes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!data.userId) throw new Error("userId is required");

  const result = await db.insert(quotes).values(data);
  return result;
}

export async function updateQuote(id: number, data: Partial<typeof quotes.$inferInsert>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(quotes).set(data).where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
  return getQuoteById(id, userId);
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

export async function createQuoteItem(data: typeof quoteItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quoteItems).values(data);
  return result;
}

export async function updateQuoteItem(id: number, data: Partial<typeof quoteItems.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(quoteItems).set(data).where(eq(quoteItems.id, id));
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
  if (!db) return undefined;

  const result = await db.select().from(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWorkOrdersByClientId(clientId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workOrders).where(and(eq(workOrders.clientId, clientId), eq(workOrders.userId, userId))).orderBy(desc(workOrders.createdAt));
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

export async function deleteWorkOrder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.userId, userId)));
}

// ============ WORK ORDER MATERIALS ============

export async function getWorkOrderMaterials(workOrderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workOrderMaterials).where(eq(workOrderMaterials.workOrderId, workOrderId));
}

export async function createWorkOrderMaterial(data: typeof workOrderMaterials.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workOrderMaterials).values(data);
  return result;
}

export async function updateWorkOrderMaterial(id: number, data: Partial<typeof workOrderMaterials.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(workOrderMaterials).set(data).where(eq(workOrderMaterials.id, id));
}

export async function deleteWorkOrderMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(workOrderMaterials).where(eq(workOrderMaterials.id, id));
}

// ============ MAINTENANCE HISTORY ============

export async function getMaintenanceHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(maintenanceHistory).where(eq(maintenanceHistory.userId, userId)).orderBy(desc(maintenanceHistory.createdAt));
}

export async function createMaintenanceHistory(data: typeof maintenanceHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(maintenanceHistory).values(data);
  return result;
}

// ============ MAINTENANCE REMINDERS ============

export async function getMaintenanceReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(maintenanceReminders).where(eq(maintenanceReminders.userId, userId)).orderBy(desc(maintenanceReminders.createdAt));
}

export async function createMaintenanceReminder(data: typeof maintenanceReminders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(maintenanceReminders).values(data);
  return result;
}

export async function updateMaintenanceReminder(id: number, data: Partial<typeof maintenanceReminders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(maintenanceReminders).set(data).where(eq(maintenanceReminders.id, id));
}
