import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { quotes, quoteHistory, workOrders, workOrderHistory } from "../../drizzle/schema";

export const editRouter = router({
  updateQuote: protectedProcedure
    .input(z.object({
      id: z.number(),
      clientName: z.string().optional(),
      clientEmail: z.string().email().optional(),
      clientPhone: z.string().optional(),
      clientWhatsapp: z.string().optional(),
      serviceDescription: z.string().optional(),
      status: z.enum(["draft", "sent", "approved", "rejected", "converted"]).optional(),
      validityDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const quote = await database.query.quotes.findFirst({ where: eq(quotes.id, input.id) });
        if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
        if (quote.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const { id, ...updateData } = input;
        await database.update(quotes).set(updateData as any).where(eq(quotes.id, id));

        if (updateData.status && updateData.status !== quote.status) {
          await database.insert(quoteHistory).values({
            quoteId: id,
            action: "status_changed",
            previousStatus: quote.status,
            newStatus: updateData.status,
            notes: `Status alterado de ${quote.status} para ${updateData.status}`,
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Erro ao atualizar orçamento:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  updateWorkOrder: protectedProcedure
    .input(z.object({
      id: z.number(),
      clientName: z.string().optional(),
      clientEmail: z.string().email().optional(),
      clientPhone: z.string().optional(),
      clientWhatsapp: z.string().optional(),
      serviceDescription: z.string().optional(),
      technician: z.string().optional(),
      laborHours: z.string().optional(),
      laborCostPerHour: z.string().optional(),
      laborTotal: z.string().optional(),
      materialsTotal: z.string().optional(),
      totalValue: z.string().optional(),
      status: z.enum(["open", "in_progress", "completed", "delivered", "cancelled"]).optional(),
      completedAt: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const workOrder = await database.query.workOrders.findFirst({ where: eq(workOrders.id, input.id) });
        if (!workOrder) throw new TRPCError({ code: "NOT_FOUND" });
        if (workOrder.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const { id, ...updateData } = input;
        await database.update(workOrders).set(updateData as any).where(eq(workOrders.id, id));

        if (updateData.status && updateData.status !== workOrder.status) {
          await database.insert(workOrderHistory).values({
            workOrderId: id,
            action: "status_changed",
            previousStatus: workOrder.status,
            newStatus: updateData.status,
            notes: `Status alterado de ${workOrder.status} para ${updateData.status}`,
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Erro ao atualizar ordem de serviço:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
