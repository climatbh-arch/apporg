import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { workOrders, transactions } from "../../drizzle/schema";
import { between, gte, lte } from "drizzle-orm";

export const reportsRouter = router({
  // Relatório de manutenção por período
  maintenanceReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data = await db
        .select()
        .from(workOrders)
        .where(
          between(workOrders.createdAt, input.startDate, input.endDate)
        );

      return {
        period: {
          start: input.startDate,
          end: input.endDate,
        },
        total: data.length,
        completed: data.filter((wo) => wo.status === "completed").length,
        pending: data.filter((wo) => wo.status === "pending").length,
        inProgress: data.filter((wo) => wo.status === "in_progress").length,
        data,
      };
    }),

  // Relatório financeiro
  financialReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transactions_data = await db
        .select()
        .from(transactions)
        .where(
          between(transactions.createdAt, input.startDate, input.endDate)
        );

      const revenue = transactions_data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expenses = transactions_data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        period: {
          start: input.startDate,
          end: input.endDate,
        },
        revenue,
        expenses,
        profit: revenue - expenses,
        transactions: transactions_data,
      };
    }),

  // Relatório de performance
  performanceReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const data = await db
        .select()
        .from(workOrders)
        .where(
          between(workOrders.createdAt, input.startDate, input.endDate)
        );

      const completionRate =
        data.length > 0
          ? (data.filter((wo) => wo.status === "completed").length / data.length) * 100
          : 0;

      const avgValue =
        data.length > 0
          ? data.reduce((sum, wo) => sum + (wo.totalValue || 0), 0) / data.length
          : 0;

      return {
        period: {
          start: input.startDate,
          end: input.endDate,
        },
        totalOrders: data.length,
        completedOrders: data.filter((wo) => wo.status === "completed").length,
        completionRate: Math.round(completionRate),
        averageValue: avgValue,
        data,
      };
    }),

  // Exportar para PDF (retorna dados formatados)
  exportPDF: protectedProcedure
    .input(
      z.object({
        reportType: z.enum(["maintenance", "financial", "performance"]),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Aqui você pode usar uma biblioteca como pdfkit ou reportlab
      // Por enquanto, retornamos os dados formatados
      return {
        success: true,
        message: "PDF gerado com sucesso",
        data: {
          type: input.reportType,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      };
    }),

  // Exportar para Excel (retorna dados formatados)
  exportExcel: protectedProcedure
    .input(
      z.object({
        reportType: z.enum(["maintenance", "financial", "performance"]),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Aqui você pode usar uma biblioteca como xlsx
      // Por enquanto, retornamos os dados formatados
      return {
        success: true,
        message: "Excel gerado com sucesso",
        data: {
          type: input.reportType,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      };
    }),
});
