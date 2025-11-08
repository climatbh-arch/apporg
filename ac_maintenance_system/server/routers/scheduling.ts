import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const schedulingRouter = router({
  // Listar agendamentos por data
  getByDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ input }) => {
      const allOrders = await db.getAllWorkOrders();
      
      return allOrders
        .filter((order: any) => {
          if (!order.scheduledDate) return false;
          const orderDate = new Date(order.scheduledDate);
          const inputDate = new Date(input.date);
          return (
            orderDate.getFullYear() === inputDate.getFullYear() &&
            orderDate.getMonth() === inputDate.getMonth() &&
            orderDate.getDate() === inputDate.getDate()
          );
        })
        .sort((a: any, b: any) => {
          const timeA = new Date(a.scheduledDate).getTime();
          const timeB = new Date(b.scheduledDate).getTime();
          return timeA - timeB;
        });
    }),

  // Listar agendamentos por período
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const allOrders = await db.getAllWorkOrders();
      
      return allOrders
        .filter((order: any) => {
          if (!order.scheduledDate) return false;
          const orderDate = new Date(order.scheduledDate);
          return orderDate >= input.startDate && orderDate <= input.endDate;
        })
        .sort((a: any, b: any) => {
          const timeA = new Date(a.scheduledDate).getTime();
          const timeB = new Date(b.scheduledDate).getTime();
          return timeA - timeB;
        });
    }),

  // Agendar nova ordem de serviço
  schedule: protectedProcedure
    .input(
      z.object({
        workOrderId: z.number(),
        scheduledDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.updateWorkOrder(input.workOrderId, {
        scheduledDate: input.scheduledDate,
        status: "approved",
      });
      return result;
    }),

  // Obter estatísticas de agendamentos
  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const allOrders = await db.getAllWorkOrders();
      
      const scheduled = allOrders.filter((order: any) => {
        if (!order.scheduledDate) return false;
        const orderDate = new Date(order.scheduledDate);
        return orderDate >= input.startDate && orderDate <= input.endDate;
      });

      const completed = scheduled.filter((order: any) => order.status === "completed");
      const pending = scheduled.filter((order: any) => order.status === "pending" || order.status === "approved");
      const cancelled = scheduled.filter((order: any) => order.status === "cancelled");

      return {
        total: scheduled.length,
        completed: completed.length,
        pending: pending.length,
        cancelled: cancelled.length,
        completionRate: scheduled.length > 0 ? (completed.length / scheduled.length) * 100 : 0,
      };
    }),
});
