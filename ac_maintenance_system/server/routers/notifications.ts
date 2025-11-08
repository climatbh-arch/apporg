import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const notificationsRouter = router({
  // Listar todas as notificações
  list: protectedProcedure.query(async () => {
    const transactions = await db.getAllTransactions();
    
    return transactions.map((t: any) => ({
      id: t.id,
      type: "system",
      title: `Transação: ${t.description}`,
      message: `${t.type === "income" ? "Entrada" : "Saída"}: R$ ${t.amount}`,
      status: "read",
      createdAt: t.createdAt,
      data: t,
    }));
  }),

  // Listar notificações por tipo
  getByType: protectedProcedure
    .input(z.object({ type: z.enum(["email", "sms", "whatsapp", "system"]) }))
    .query(async ({ input }) => {
      if (input.type === "system") {
        const transactions = await db.getAllTransactions();
        return transactions.map((t: any) => ({
          id: t.id,
          type: "system",
          title: `Transação: ${t.description}`,
          message: `${t.type === "income" ? "Entrada" : "Saída"}: R$ ${t.amount}`,
          status: "read",
          createdAt: t.createdAt,
        }));
      }
      
      return [];
    }),

  // Enviar notificação por email
  sendEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string(),
        message: z.string(),
        workOrderId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Aqui você integraria com um serviço de email real
      // Por enquanto, apenas retornamos sucesso
      return {
        success: true,
        id: Math.random(),
        type: "email",
        recipient: input.to,
        subject: input.subject,
        message: input.message,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
    }),

  // Enviar notificação por WhatsApp
  sendWhatsApp: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
        message: z.string(),
        workOrderId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Aqui você integraria com Twilio ou outro serviço
      return {
        success: true,
        id: Math.random(),
        type: "whatsapp",
        recipient: input.phone,
        message: input.message,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
    }),

  // Enviar notificação por SMS
  sendSMS: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
        message: z.string(),
        workOrderId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Aqui você integraria com um serviço de SMS
      return {
        success: true,
        id: Math.random(),
        type: "sms",
        recipient: input.phone,
        message: input.message,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
    }),

  // Obter estatísticas de notificações
  getStats: protectedProcedure.query(async () => {
    const transactions = await db.getAllTransactions();
    
    const income = transactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    return {
      totalNotifications: transactions.length,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      lastNotification: transactions.length > 0 ? transactions[0].createdAt : null,
    };
  }),

  // Criar alerta automático
  createAlert: protectedProcedure
    .input(
      z.object({
        type: z.enum(["low_stock", "pending_order", "overdue_payment", "maintenance_due"]),
        title: z.string(),
        message: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        relatedId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        id: Math.random(),
        type: input.type,
        title: input.title,
        message: input.message,
        priority: input.priority,
        createdAt: new Date().toISOString(),
        status: "active",
      };
    }),
});
