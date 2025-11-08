import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { workOrders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const workOrdersRouter = router({
  // Listar todas as ordens de serviço
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(workOrders);
  }),

  // Buscar uma ordem de serviço por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(workOrders)
        .where(eq(workOrders.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  // Criar nova ordem de serviço
  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(1, "Descrição é obrigatória"),
        status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]),
        totalValue: z.number().min(0, "Valor deve ser maior que zero"),
        notes: z.string().optional(),
        clientName: z.string().min(1, "Nome do cliente é obrigatório"),
        equipmentModel: z.string().min(1, "Modelo do equipamento é obrigatório"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(workOrders).values({
        description: input.description,
        status: input.status,
        totalValue: input.totalValue,
        notes: input.notes || null,
        clientName: input.clientName,
        equipmentModel: input.equipmentModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: result.insertId };
    }),

  // Atualizar ordem de serviço
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().optional(),
        status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]).optional(),
        totalValue: z.number().optional(),
        notes: z.string().optional(),
        clientName: z.string().optional(),
        equipmentModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      await db
        .update(workOrders)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(workOrders.id, id));

      return { success: true };
    }),

  // Deletar ordem de serviço
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(workOrders).where(eq(workOrders.id, input.id));

      return { success: true };
    }),

  // Atualizar status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(workOrders)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(workOrders.id, input.id));

      return { success: true };
    }),
});
