import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { editRouter } from "./routers/editRouter";

// ============ CLIENTS ROUTER ============
const clientsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await db.getAllClients((ctx.user?.id || 1));
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const client = await db.getClientById(input.id, (ctx.user?.id || 1));
    if (!client) throw new TRPCError({ code: "NOT_FOUND" });
    return client;
  }),
  create: publicProcedure.input(z.object({
    name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(),
    whatsapp: z.string().optional(), address: z.string().optional(), city: z.string().optional(),
    state: z.string().optional(), zipCode: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    try {
      const userId = ctx.user?.id || 1;
      return await db.createClient({ ...input, userId });
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), email: z.string().email().optional(),
    phone: z.string().optional(), whatsapp: z.string().optional(), address: z.string().optional(),
    city: z.string().optional(), state: z.string().optional(), zipCode: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    const userId = ctx.user?.id || 1;
    return await db.updateClient(id, data, userId);
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id || 1;
    await db.deleteClient(input.id, userId);
    return { success: true };
  }),
});

// ============ QUOTES ROUTER ============
const quotesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id || 1;
    return await db.getAllQuotes(userId);
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const userId = ctx.user?.id || 1;
    const quote = await db.getQuoteById(input.id, userId);
    if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
    return quote;
  }),
  create: publicProcedure.input(z.object({
    clientId: z.number(), clientName: z.string().min(1), clientEmail: z.string().email().optional(),
    clientPhone: z.string().optional(), clientWhatsapp: z.string().optional(),
    serviceDescription: z.string().optional(), subtotal: z.string(), discountPercent: z.string(),
    discountAmount: z.string(), totalValue: z.string(), validityDate: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    try {
      const quoteNumber = `ORC-${Date.now()}`;
      const userId = ctx.user?.id || 1;
      return await db.createQuote({ ...input, userId, quoteNumber });
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), clientName: z.string().optional(), clientEmail: z.string().email().optional(),
    clientPhone: z.string().optional(), clientWhatsapp: z.string().optional(),
    serviceDescription: z.string().optional(), subtotal: z.string().optional(),
    discountPercent: z.string().optional(), discountAmount: z.string().optional(),
    totalValue: z.string().optional(), status: z.enum(["draft", "sent", "approved", "rejected", "converted"]).optional(),
    validityDate: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    const userId = ctx.user?.id || 1;
    return await db.updateQuote(id, data, userId);
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id || 1;
    await db.deleteQuote(input.id, userId);
    return { success: true };
  }),
});

// ============ QUOTE ITEMS ROUTER ============
const quoteItemsRouter = router({
  list: publicProcedure.input(z.object({ quoteId: z.number() })).query(async ({ input, ctx }) => {
    return await db.getQuoteItems(input.quoteId, (ctx.user?.id || 1));
  }),
  create: publicProcedure.input(z.object({
    quoteId: z.number(), itemName: z.string().min(1), quantity: z.string(),
    unitPrice: z.string(), totalPrice: z.string(),
  })).mutation(async ({ input }) => {
    return await db.createQuoteItem(input);
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteQuoteItem(input.id);
    return { success: true };
  }),
});

// ============ WORK ORDERS ROUTER ============
const workOrdersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await db.getAllWorkOrders((ctx.user?.id || 1));
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const workOrder = await db.getWorkOrderById(input.id, (ctx.user?.id || 1));
    if (!workOrder) throw new TRPCError({ code: "NOT_FOUND" });
    return workOrder;
  }),
  create: publicProcedure.input(z.object({
    quoteId: z.number().optional(), clientId: z.number(), clientName: z.string().min(1),
    clientEmail: z.string().email().optional(), clientPhone: z.string().optional(),
    clientWhatsapp: z.string().optional(), serviceDescription: z.string().optional(),
    technicianId: z.number().optional(), technician: z.string().optional(),
    laborHours: z.string(), laborCostPerHour: z.string(), laborTotal: z.string(),
    materialsTotal: z.string(), totalValue: z.string(), openedAt: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const workOrderNumber = `OS-${Date.now()}`;
    return await db.createWorkOrder({ ...input, userId: (ctx.user?.id || 1), workOrderNumber });
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), clientName: z.string().optional(), clientEmail: z.string().email().optional(),
    clientPhone: z.string().optional(), clientWhatsapp: z.string().optional(),
    serviceDescription: z.string().optional(), technician: z.string().optional(),
    laborHours: z.string().optional(), laborCostPerHour: z.string().optional(),
    laborTotal: z.string().optional(), materialsTotal: z.string().optional(),
    totalValue: z.string().optional(), status: z.enum(["open", "in_progress", "completed", "delivered", "cancelled"]).optional(),
    completedAt: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    return await db.updateWorkOrder(id, data, (ctx.user?.id || 1));
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteWorkOrder(input.id, (ctx.user?.id || 1));
    return { success: true };
  }),
});

// ============ WORK ORDER ITEMS ROUTER ============
const workOrderItemsRouter = router({
  list: publicProcedure.input(z.object({ workOrderId: z.number() })).query(async ({ input, ctx }) => {
    return await db.getWorkOrderItems(input.workOrderId, (ctx.user?.id || 1));
  }),
  create: publicProcedure.input(z.object({
    workOrderId: z.number(), itemName: z.string().min(1), itemType: z.enum(["material", "labor", "service"]),
    quantity: z.string(), unitPrice: z.string(), totalPrice: z.string(),
  })).mutation(async ({ input }) => {
    return await db.createWorkOrderItem(input);
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteWorkOrderItem(input.id);
    return { success: true };
  }),
});

// ============ DASHBOARD ROUTER ============
const dashboardRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    return await db.getDashboardStats((ctx.user?.id || 1));
  }),
});

// ============ TECHNICIANS ROUTER ============
const techniciansRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await db.getAllTechnicians((ctx.user?.id || 1));
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const technician = await db.getTechnicianById(input.id, (ctx.user?.id || 1));
    if (!technician) throw new TRPCError({ code: "NOT_FOUND" });
    return technician;
  }),
  create: publicProcedure.input(z.object({
    name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(),
    cpf: z.string().optional(), role: z.string().optional(), hourlyRate: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return await db.createTechnician({ ...input, userId: (ctx.user?.id || 1) });
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), email: z.string().email().optional(),
    phone: z.string().optional(), cpf: z.string().optional(), role: z.string().optional(),
    hourlyRate: z.string().optional(), isActive: z.boolean().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    return await db.updateTechnician(id, data, (ctx.user?.id || 1));
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteTechnician(input.id, (ctx.user?.id || 1));
    return { success: true };
  }),
});

// ============ PRODUCTS ROUTER ============
const productsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await db.getAllProducts((ctx.user?.id || 1));
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const product = await db.getProductById(input.id, (ctx.user?.id || 1));
    if (!product) throw new TRPCError({ code: "NOT_FOUND" });
    return product;
  }),
  create: publicProcedure.input(z.object({
    name: z.string().min(1), description: z.string().optional(), type: z.enum(["product", "service"]).default("product"),
    price: z.string(), cost: z.string().optional(), stock: z.number().optional(), unit: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return await db.createProduct({ ...input, userId: (ctx.user?.id || 1) });
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), description: z.string().optional(),
    type: z.enum(["product", "service"]).optional(), price: z.string().optional(),
    cost: z.string().optional(), stock: z.number().optional(), unit: z.string().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    return await db.updateProduct(id, data, (ctx.user?.id || 1));
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteProduct(input.id, (ctx.user?.id || 1));
    return { success: true };
  }),
});

// ============ PAYMENTS ROUTER ============
const paymentsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await db.getAllPayments((ctx.user?.id || 1));
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const payment = await db.getPaymentById(input.id, (ctx.user?.id || 1));
    if (!payment) throw new TRPCError({ code: "NOT_FOUND" });
    return payment;
  }),
  create: publicProcedure.input(z.object({
    workOrderId: z.number().optional(), quoteId: z.number().optional(), clientId: z.number(),
    clientName: z.string(), amount: z.string(), paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]),
    status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(), dueDate: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return await db.createPayment({ ...input, userId: (ctx.user?.id || 1) });
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
    amount: z.string().optional(), paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]).optional(),
    paidAt: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    return await db.updatePayment(id, data, (ctx.user?.id || 1));
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deletePayment(input.id, (ctx.user?.id || 1));
    return { success: true };
  }),
});

// ============ EXPENSES ROUTER ============
const expensesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await db.getAllExpenses((ctx.user?.id || 1));
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const expense = await db.getExpenseById(input.id, (ctx.user?.id || 1));
    if (!expense) throw new TRPCError({ code: "NOT_FOUND" });
    return expense;
  }),
  create: publicProcedure.input(z.object({
    description: z.string().min(1), category: z.string().optional(), amount: z.string(),
    paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]),
    status: z.enum(["pending", "paid"]).optional(), dueDate: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return await db.createExpense({ ...input, userId: (ctx.user?.id || 1) });
  }),
  update: publicProcedure.input(z.object({
    id: z.number(), description: z.string().optional(), category: z.string().optional(),
    amount: z.string().optional(), paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]).optional(),
    status: z.enum(["pending", "paid"]).optional(), paidAt: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    return await db.updateExpense(id, data, (ctx.user?.id || 1));
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteExpense(input.id, (ctx.user?.id || 1));
    return { success: true };
  }),
});

// ============ FINANCIAL ROUTER ============
const financialRouter = router({
  getReport: publicProcedure.input(z.object({
    startDate: z.string().optional(), endDate: z.string().optional(),
  })).query(async ({ input, ctx }) => {
    return await db.getFinancialReport((ctx.user?.id || 1), input.startDate ? new Date(input.startDate) : undefined, input.endDate ? new Date(input.endDate) : undefined);
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
      return { success: true } as const;
    }),
  }),
  clients: clientsRouter,
  quotes: quotesRouter,
  quoteItems: quoteItemsRouter,
  workOrders: workOrdersRouter,
  workOrderItems: workOrderItemsRouter,
  dashboard: dashboardRouter,
  technicians: techniciansRouter,
  products: productsRouter,
  payments: paymentsRouter,
  expenses: expensesRouter,
  financial: financialRouter,
  edit: editRouter,
});

export type AppRouter = typeof appRouter;
