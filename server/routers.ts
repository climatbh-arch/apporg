import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { generateWorkOrderPDF } from "./pdf-generator";
import { sendWhatsAppMessage, formatWorkOrderMessage } from "./services/whatsapp";
import { sendEmail, getWorkOrderEmailTemplate } from "./services/email";
import { generateMonthlyReportExcel, generateServiceReportExcel } from "./services/reports";

// ============ CLIENTS ROUTER ============

const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    if (!ctx.user.isApproved) throw new TRPCError({ code: "FORBIDDEN", message: "Sua conta está aguardando aprovação do administrador" });
    return await db.getAllClients(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      if (!ctx.user.isApproved) throw new TRPCError({ code: "FORBIDDEN", message: "Sua conta está aguardando aprovação do administrador" });
      const client = await db.getClientById(input.id, ctx.user.id);
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }
      return client;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        clientType: z.enum(["residential", "commercial"]).default("residential"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const result = await db.createClient({ ...input, userId: ctx.user.id });
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        clientType: z.enum(["residential", "commercial"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const { id, ...data } = input;
      return await db.updateClient(id, data, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      await db.deleteClient(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ============ EQUIPMENTS ROUTER ============

const equipmentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    return await db.getAllEquipments(ctx.user.id);
  }),

  getByClientId: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      return await db.getEquipmentsByClientId(input.clientId, ctx.user.id);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const equipment = await db.getEquipmentById(input.id, ctx.user.id);
      if (!equipment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Equipamento não encontrado" });
      }
      return equipment;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        brand: z.string().min(1),
        model: z.string().min(1),
        btu: z.number().positive(),
        type: z.enum(["split", "window", "portable", "floor_ceiling", "cassette"]),
        serialNumber: z.string().optional(),
        installationDate: z.date().optional(),
        lastMaintenanceDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const result = await db.createEquipment({ ...input, userId: ctx.user.id });
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        brand: z.string().optional(),
        model: z.string().optional(),
        btu: z.number().positive().optional(),
        type: z.enum(["split", "window", "portable", "floor_ceiling", "cassette"]).optional(),
        serialNumber: z.string().optional(),
        installationDate: z.date().optional(),
        lastMaintenanceDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const { id, ...data } = input;
      return await db.updateEquipment(id, data, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      await db.deleteEquipment(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ============ QUOTES ROUTER ============

const quotesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getAllQuotes(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const quote = await db.getQuoteById(input.id, ctx.user.id);
      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
      }
      return quote;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        equipmentId: z.number().optional(),
        serviceType: z.enum([
          "installation",
          "maintenance",
          "gas_charge",
          "cleaning",
          "repair",
          "inspection",
        ]),
        totalValue: z.string(),
        description: z.string().optional(),
        validityDate: z.date().optional(),
        discountPercent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const quoteNumber = `ORC-${Date.now()}`;
      const subtotal = parseFloat(input.totalValue);
      const discountPercent = parseFloat(input.discountPercent || "0");
      const discountAmount = (subtotal * discountPercent) / 100;
      const totalValue = subtotal - discountAmount;

      const result = await db.createQuote({
        userId: ctx.user.id,
        quoteNumber,
        clientId: input.clientId,
        equipmentId: input.equipmentId,
        serviceType: input.serviceType,
        status: "draft",
        subtotal: input.totalValue,
        discountPercent: input.discountPercent || "0",
        discountAmount: discountAmount.toString(),
        totalValue: totalValue.toString(),
        description: input.description,
        validityDate: input.validityDate,
      });
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "approved", "rejected", "converted"]).optional(),
        totalValue: z.string().optional(),
        description: z.string().optional(),
        discountPercent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return await db.updateQuote(id, data, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.deleteQuote(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ============ WORK ORDERS ROUTER ============

const workOrdersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    return await db.getAllWorkOrders(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const workOrder = await db.getWorkOrderById(input.id, ctx.user.id);
      if (!workOrder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ordem de serviço não encontrada" });
      }
      return workOrder;
    }),

  getByClientId: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      return await db.getWorkOrdersByClientId(input.clientId, ctx.user.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        equipmentId: z.number().optional(),
        serviceType: z.enum([
          "installation",
          "maintenance",
          "gas_charge",
          "cleaning",
          "repair",
          "inspection",
        ]),
        totalValue: z.string(),
        description: z.string().optional(),
        technician: z.string().optional(),
        scheduledDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workOrderNumber = `OS-${Date.now()}`;
      const result = await db.createWorkOrder({
        ...input,
        userId: ctx.user.id,
        workOrderNumber,
        status: "pending",
        subtotal: input.totalValue,
      });
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]).optional(),
        totalValue: z.string().optional(),
        description: z.string().optional(),
        technician: z.string().optional(),
        scheduledDate: z.date().optional(),
        completedDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      const { id, ...data } = input;
      return await db.updateWorkOrder(id, data, ctx.user.id);
    }),
});

// ============ WORK ORDER ITEMS ROUTER ============

const workOrderItemsRouter = router({
  getByWorkOrderId: protectedProcedure
    .input(z.object({ workOrderId: z.number() }))
    .query(async ({ input }) => {
      return await db.getWorkOrderItems(input.workOrderId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        workOrderId: z.number(),
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.string(),
        totalPrice: z.string(),
        itemType: z.enum(["part", "product", "labor"]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createWorkOrderItem(input);
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteWorkOrderItem(input.id);
      return { success: true };
    }),
});

// ============ INVENTORY ROUTER ============

const inventoryRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllInventory();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const item = await db.getInventoryById(input.id);
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item de estoque não encontrado" });
      }
      return item;
    }),

  getLowStock: protectedProcedure.query(async () => {
    return await db.getLowStockItems();
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.enum([
          "condenser",
          "tubing",
          "gas",
          "connector",
          "support",
          "filter",
          "compressor",
          "other",
        ]),
        quantity: z.number().nonnegative(),
        minimumQuantity: z.number().nonnegative(),
        unitPrice: z.string(),
        supplier: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createInventoryItem(input);
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().nonnegative().optional(),
        minimumQuantity: z.number().nonnegative().optional(),
        unitPrice: z.string().optional(),
        supplier: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateInventoryItem(id, data);
    }),
});

// ============ TRANSACTIONS ROUTER ============

const transactionsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllTransactions();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const transaction = await db.getTransactionById(input.id);
      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transação não encontrada" });
      }
      return transaction;
    }),

  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await db.getTransactionsByDateRange(input.startDate, input.endDate);
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["income", "expense"]),
        category: z.string().min(1),
        description: z.string().min(1),
        amount: z.string(),
        workOrderId: z.number().optional(),
        paymentMethod: z.enum(["cash", "credit_card", "debit_card", "transfer", "check"]),
        status: z.enum(["pending", "completed", "cancelled"]).default("completed"),
        dueDate: z.date().optional(),
        paidDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createTransaction(input);
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "cancelled"]).optional(),
        paidDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateTransaction(id, data);
    }),
});

// ============ MAINTENANCE HISTORY ROUTER ============

const maintenanceHistoryRouter = router({
  getByEquipmentId: protectedProcedure
    .input(z.object({ equipmentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getMaintenanceHistoryByEquipmentId(input.equipmentId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        equipmentId: z.number(),
        workOrderId: z.number().optional(),
        description: z.string().min(1),
        technician: z.string().optional(),
        maintenanceDate: z.date(),
        nextMaintenanceDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createMaintenanceRecord(input);
      return result;
    }),
});

// ============ DASHBOARD ROUTER ============

const dashboardRouter = router({
  getDailyStats: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ input }) => {
      return await db.getDailyStats(input.date);
    }),

  getPendingWorkOrders: protectedProcedure.query(async () => {
    const allOrders = await db.getAllWorkOrders();
    return allOrders.filter((order) => order.status === "pending" || order.status === "in_progress");
  }),

  getLowStockAlert: protectedProcedure.query(async () => {
    return await db.getLowStockItems();
  }),
});

// ============ MAIN APP ROUTER ============

// ============ ADMIN ROUTER ============

const adminRouter = router({
  getPendingUsers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado. Apenas administradores podem acessar." });
    return await db.getPendingUsers();
  }),

  getAllApprovedUsers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado. Apenas administradores podem acessar." });
    return await db.getAllApprovedUsers();
  }),

  approveUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado. Apenas administradores podem acessar." });
      const success = await db.approveUser(input.userId);
      if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao aprovar usuário" });
      return { success: true, message: "Usuário aprovado com sucesso" };
    }),

  rejectUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado. Apenas administradores podem acessar." });
      const success = await db.rejectUser(input.userId);
      if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao rejeitar usuário" });
      return { success: true, message: "Usuário rejeitado e removido do sistema" };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  admin: adminRouter,

  // Feature routers
  clients: clientsRouter,
  equipments: equipmentsRouter,
  quotes: quotesRouter,
  workOrders: workOrdersRouter,
  workOrderItems: workOrderItemsRouter,
  inventory: inventoryRouter,
  transactions: transactionsRouter,
  maintenanceHistory: maintenanceHistoryRouter,
  dashboard: dashboardRouter,
  pdf: router({
    generateWorkOrderPDF: protectedProcedure
      .input(z.object({ workOrderId: z.number() }))
      .mutation(async ({ input }) => {
        const workOrder = await db.getWorkOrderById(input.workOrderId);
        if (!workOrder) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ordem de serviço não encontrada" });
        }

        const client = await db.getClientById(workOrder.clientId);
        const equipment = workOrder.equipmentId ? await db.getEquipmentById(workOrder.equipmentId) : null;

        const pdfBuffer = await generateWorkOrderPDF({
          id: workOrder.id,
          clientName: client?.name || "Cliente Desconhecido",
          clientPhone: client?.phone || "",
          clientAddress: client?.address || "",
          equipmentBrand: equipment?.brand || "",
          equipmentModel: equipment?.model || "",
          serviceType: workOrder.serviceType,
          description: workOrder.description || "",
          value: Number(workOrder.totalValue),
          status: workOrder.status,
          createdAt: workOrder.createdAt,
          technician: workOrder.technician || undefined,
        });

        return {
          pdf: pdfBuffer.toString("base64"),
          filename: `OS_${workOrder.id}_${new Date().getTime()}.pdf`,
        };
      }),
  }),
  messaging: router({
    sendWorkOrderEmail: protectedProcedure
      .input(z.object({ workOrderId: z.number() }))
      .mutation(async ({ input }) => {
        const workOrder = await db.getWorkOrderById(input.workOrderId);
        if (!workOrder) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ordem de serviço não encontrada" });
        }

        const client = await db.getClientById(workOrder.clientId);
        if (!client?.email) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cliente não possui email" });
        }

        const htmlTemplate = getWorkOrderEmailTemplate(
          workOrder.id,
          client.name,
          workOrder.serviceType,
          Number(workOrder.totalValue),
          workOrder.description || "",
          workOrder.technician || ""
        );

        return await sendEmail(
          client.email,
          `Orçamento/OS #${workOrder.id} - Confirmação`,
          htmlTemplate
        );
      }),
  }),
  reports: router({
    exportMonthlyReportExcel: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .mutation(async ({ input }) => {
        const buffer = await generateMonthlyReportExcel(input);
        return {
          excel: buffer.toString("base64"),
          filename: `Relatorio_Mensal_${new Date().getTime()}.xlsx`,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
