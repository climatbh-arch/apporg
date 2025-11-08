import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { workOrders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const quotesRouter = router({
  // Listar todos os orçamentos
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(workOrders);
  }),

  // Buscar um orçamento por ID
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

  // Criar novo orçamento
  create: protectedProcedure
    .input(
      z.object({
        clientName: z.string().min(1, "Nome do cliente é obrigatório"),
        description: z.string().min(1, "Descrição é obrigatória"),
        totalValue: z.number().min(0, "Valor deve ser maior que zero"),
        items: z.array(
          z.object({
            name: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(workOrders).values({
        description: input.description,
        status: "pending",
        totalValue: input.totalValue,
        notes: input.notes || null,
        clientName: input.clientName,
        equipmentModel: "Orçamento",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: result.insertId };
    }),

  // Atualizar orçamento
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        clientName: z.string().optional(),
        description: z.string().optional(),
        totalValue: z.number().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              quantity: z.number(),
              unitPrice: z.number(),
            })
          )
          .optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      await db
        .update(workOrders)
        .set({
          clientName: updateData.clientName,
          description: updateData.description,
          totalValue: updateData.totalValue,
          notes: updateData.notes,
          updatedAt: new Date(),
        })
        .where(eq(workOrders.id, id));

      return { success: true };
    }),

  // Deletar orçamento
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(workOrders).where(eq(workOrders.id, input.id));

      return { success: true };
    }),

  // Atualizar status do orçamento
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "converted"]),
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
