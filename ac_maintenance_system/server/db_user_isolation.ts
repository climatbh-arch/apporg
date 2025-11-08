// Adicionar estas funções ao server/db.ts

import { eq, and } from "drizzle-orm";
import { clients, workOrders, transactions, workOrderItems, inventory, maintenanceHistory } from "../drizzle/schema";

// CLIENTES - Filtrar por usuário
export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId));
}

// ORDENS - Filtrar por usuário
export async function getWorkOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.userId, userId));
}

// TRANSAÇÕES - Filtrar por usuário
export async function getTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));
}

// ITENS DE ORDEM - Filtrar por usuário
export async function getWorkOrderItemsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.userId, userId));
}

// ESTOQUE - Filtrar por usuário
export async function getInventoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(inventory)
    .where(eq(inventory.userId, userId));
}

// MANUTENÇÃO - Filtrar por usuário
export async function getMaintenanceHistoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(maintenanceHistory)
    .where(eq(maintenanceHistory.userId, userId));
}

// Atualizar CREATE para adicionar userId
export async function createClientWithUser(data: any, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .insert(clients)
    .values({
      ...data,
      userId, // ✅ Adicionar userId
    })
    .returning();
  
  return result[0];
}

export async function createWorkOrderWithUser(data: any, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .insert(workOrders)
    .values({
      ...data,
      userId, // ✅ Adicionar userId
    })
    .returning();
  
  return result[0];
}

export async function createTransactionWithUser(data: any, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .insert(transactions)
    .values({
      ...data,
      userId, // ✅ Adicionar userId
    })
    .returning();
  
  return result[0];
}
