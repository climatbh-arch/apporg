import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============ CLIENTS ROUTER ============

const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllClients(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const client = await db.getClientById(input.id, ctx.user.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      return client;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await db.createClient({ ...input, userId: ctx.user.id });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      return await db.updateClient(id, data, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.deleteClient(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ============ QUOTES ROUTER ============

const quotesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllQuotes(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const quote = await db.getQuoteById(input.id, ctx.user.id);
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      return quote;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        clientName: z.string().min(1),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
        clientWhatsapp: z.string().optional(),
        serviceDescription: z.string().optional(),
        subtotal: z.string(),
        discountPercent: z.string().default("0"),
        validityDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const quoteNumber = `ORC-${Date.now()}`;
      const subtotal = parseFloat(input.subtotal);
      const discountPercent = parseFloat(input.discountPercent || "0");
      const discountAmount = (subtotal * discountPercent) / 100;
      const totalValue = subtotal - discountAmount;

      return await db.createQuote({
        userId: ctx.user.id,
        quoteNumber,
        clientId: input.clientId,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        clientWhatsapp: input.clientWhatsapp,
        serviceDescription: input.serviceDescription,
        status: "draft",
        subtotal: input.subtotal,
        discountPercent: input.discountPercent || "0",
        discountAmount: discountAmount.toString(),
        totalValue: totalValue.toString(),
        validityDate: input.validityDate,
        notes: input.notes,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "approved", "rejected", "converted"]).optional(),
        subtotal: z.string().optional(),
        discountPercent: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;

      if (data.subtotal && data.discountPercent) {
        const subtotal = parseFloat(data.subtotal);
        const discountPercent = parseFloat(data.discountPercent);
        const discountAmount = (subtotal * discountPercent) / 100;
        const totalValue = subtotal - discountAmount;

        (data as any).discountAmount = discountAmount.toString();
        (data as any).totalValue = totalValue.toString();
      }

      return await db.updateQuote(id, data, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.deleteQuote(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ============ QUOTE ITEMS ROUTER ============

const quoteItemsRouter = router({
  getByQuoteId: protectedProcedure
    .input(z.object({ quoteId: z.number() }))
    .query(async ({ input }) => {
      return await db.getQuoteItems(input.quoteId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        quoteId: z.number(),
        itemName: z.string().min(1),
        quantity: z.string(),
        unitPrice: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const quantity = parseFloat(input.quantity);
      const unitPrice = parseFloat(input.unitPrice);
      const totalPrice = quantity * unitPrice;

      return await db.createQuoteItem({
        quoteId: input.quoteId,
        itemName: input.itemName,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        totalPrice: totalPrice.toString(),
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteQuoteItem(input.id);
      return { success: true };
    }),
});

// ============ WORK ORDERS ROUTER ============

const workOrdersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllWorkOrders(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const workOrder = await db.getWorkOrderById(input.id, ctx.user.id);
      if (!workOrder) throw new TRPCError({ code: "NOT_FOUND" });
      return workOrder;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        clientName: z.string().min(1),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
        clientWhatsapp: z.string().optional(),
        serviceDescription: z.string().optional(),
        technician: z.string().optional(),
        laborHours: z.string().default("0"),
        laborCostPerHour: z.string().default("0"),
        materialsTotal: z.string().default("0"),
        openedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const workOrderNumber = `OS-${Date.now()}`;
      const laborHours = parseFloat(input.laborHours || "0");
      const laborCostPerHour = parseFloat(input.laborCostPerHour || "0");
      const laborTotal = laborHours * laborCostPerHour;
      const materialsTotal = parseFloat(input.materialsTotal || "0");
      const totalValue = laborTotal + materialsTotal;

      return await db.createWorkOrder({
        userId: ctx.user.id,
        workOrderNumber,
        clientId: input.clientId,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        clientWhatsapp: input.clientWhatsapp,
        serviceDescription: input.serviceDescription,
        technician: input.technician,
        laborHours: input.laborHours || "0",
        laborCostPerHour: input.laborCostPerHour || "0",
        laborTotal: laborTotal.toString(),
        materialsTotal: input.materialsTotal || "0",
        totalValue: totalValue.toString(),
        status: "open",
        openedAt: input.openedAt || new Date(),
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "completed", "delivered", "cancelled"]).optional(),
        laborHours: z.string().optional(),
        laborCostPerHour: z.string().optional(),
        materialsTotal: z.string().optional(),
        completedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;

      if (data.laborHours && data.laborCostPerHour) {
        const laborHours = parseFloat(data.laborHours);
        const laborCostPerHour = parseFloat(data.laborCostPerHour);
        const laborTotal = laborHours * laborCostPerHour;
        const materialsTotal = parseFloat(data.materialsTotal || "0");
        const totalValue = laborTotal + materialsTotal;

        (data as any).laborTotal = laborTotal.toString();
        (data as any).totalValue = totalValue.toString();
      }

      return await db.updateWorkOrder(id, data, ctx.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.deleteWorkOrder(input.id, ctx.user.id);
      return { success: true };
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
        itemName: z.string().min(1),
        itemType: z.enum(["material", "labor", "service"]),
        quantity: z.string(),
        unitPrice: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const quantity = parseFloat(input.quantity);
      const unitPrice = parseFloat(input.unitPrice);
      const totalPrice = quantity * unitPrice;

      return await db.createWorkOrderItem({
        workOrderId: input.workOrderId,
        itemName: input.itemName,
        itemType: input.itemType,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        totalPrice: totalPrice.toString(),
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteWorkOrderItem(input.id);
      return { success: true };
    }),
});

// ============ DASHBOARD ROUTER ============

const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getDashboardStats(ctx.user.id);
  }),
});

// ============ MAIN APP ROUTER ============

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

  // Feature routers
  clients: clientsRouter,
  quotes: quotesRouter,
  quoteItems: quoteItemsRouter,
  workOrders: workOrdersRouter,
  workOrderItems: workOrderItemsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
