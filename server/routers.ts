import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { editRouter } from "./routers/editRouter";

// ============ CLIENTS ROUTER ============
const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllClients(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const client = await db.getClientById(input.id, ctx.user.id);
    if (!client) throw new TRPCError({ code: "NOT_FOUND" });
    return client;
  }),
  create: protectedProcedure.input(z.object({
    name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(),
    whatsapp: z.string().optional(), address: z.string().optional(), city: z.string().optional(),
    state: z.string().optional(), zipCode: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.createClient({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), email: z.string().email().optional(),
    phone: z.string().optional(), whatsapp: z.string().optional(), address: z.string().optional(),
    city: z.string().optional(), state: z.string().optional(), zipCode: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updateClient(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
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
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const quote = await db.getQuoteById(input.id, ctx.user.id);
    if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
    return quote;
  }),
  create: protectedProcedure.input(z.object({
    clientId: z.number(), clientName: z.string().min(1), clientEmail: z.string().email().optional(),
    clientPhone: z.string().optional(), clientWhatsapp: z.string().optional(),
    serviceDescription: z.string().optional(), subtotal: z.string(), discountPercent: z.string(),
    discountAmount: z.string(), totalValue: z.string(), validityDate: z.date().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const quoteNumber = `ORC-${Date.now()}`;
    return await db.createQuote({ ...input, userId: ctx.user.id, quoteNumber });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), clientName: z.string().optional(), clientEmail: z.string().email().optional(),
    clientPhone: z.string().optional(), clientWhatsapp: z.string().optional(),
    serviceDescription: z.string().optional(), subtotal: z.string().optional(),
    discountPercent: z.string().optional(), discountAmount: z.string().optional(),
    totalValue: z.string().optional(), status: z.enum(["draft", "sent", "approved", "rejected", "converted"]).optional(),
    validityDate: z.date().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updateQuote(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.deleteQuote(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ============ QUOTE ITEMS ROUTER ============
const quoteItemsRouter = router({
  list: protectedProcedure.input(z.object({ quoteId: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getQuoteItems(input.quoteId, ctx.user.id);
  }),
  create: protectedProcedure.input(z.object({
    quoteId: z.number(), itemName: z.string().min(1), quantity: z.string(),
    unitPrice: z.string(), totalPrice: z.string(),
  })).mutation(async ({ input }) => {
    return await db.createQuoteItem(input);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
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
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const workOrder = await db.getWorkOrderById(input.id, ctx.user.id);
    if (!workOrder) throw new TRPCError({ code: "NOT_FOUND" });
    return workOrder;
  }),
  create: protectedProcedure.input(z.object({
    quoteId: z.number().optional(), clientId: z.number(), clientName: z.string().min(1),
    clientEmail: z.string().email().optional(), clientPhone: z.string().optional(),
    clientWhatsapp: z.string().optional(), serviceDescription: z.string().optional(),
    technicianId: z.number().optional(), technician: z.string().optional(),
    laborHours: z.string(), laborCostPerHour: z.string(), laborTotal: z.string(),
    materialsTotal: z.string(), totalValue: z.string(), openedAt: z.date().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const workOrderNumber = `OS-${Date.now()}`;
    return await db.createWorkOrder({ ...input, userId: ctx.user.id, workOrderNumber });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), clientName: z.string().optional(), clientEmail: z.string().email().optional(),
    clientPhone: z.string().optional(), clientWhatsapp: z.string().optional(),
    serviceDescription: z.string().optional(), technician: z.string().optional(),
    laborHours: z.string().optional(), laborCostPerHour: z.string().optional(),
    laborTotal: z.string().optional(), materialsTotal: z.string().optional(),
    totalValue: z.string().optional(), status: z.enum(["open", "in_progress", "completed", "delivered", "cancelled"]).optional(),
    completedAt: z.date().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updateWorkOrder(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.deleteWorkOrder(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ============ WORK ORDER ITEMS ROUTER ============
const workOrderItemsRouter = router({
  list: protectedProcedure.input(z.object({ workOrderId: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getWorkOrderItems(input.workOrderId, ctx.user.id);
  }),
  create: protectedProcedure.input(z.object({
    workOrderId: z.number(), itemName: z.string().min(1), itemType: z.enum(["material", "labor", "service"]),
    quantity: z.string(), unitPrice: z.string(), totalPrice: z.string(),
  })).mutation(async ({ input }) => {
    return await db.createWorkOrderItem(input);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
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

// ============ TECHNICIANS ROUTER ============
const techniciansRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllTechnicians(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const technician = await db.getTechnicianById(input.id, ctx.user.id);
    if (!technician) throw new TRPCError({ code: "NOT_FOUND" });
    return technician;
  }),
  create: protectedProcedure.input(z.object({
    name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(),
    cpf: z.string().optional(), role: z.string().optional(), hourlyRate: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.createTechnician({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), email: z.string().email().optional(),
    phone: z.string().optional(), cpf: z.string().optional(), role: z.string().optional(),
    hourlyRate: z.string().optional(), isActive: z.boolean().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updateTechnician(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.deleteTechnician(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ============ PRODUCTS ROUTER ============
const productsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllProducts(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const product = await db.getProductById(input.id, ctx.user.id);
    if (!product) throw new TRPCError({ code: "NOT_FOUND" });
    return product;
  }),
  create: protectedProcedure.input(z.object({
    name: z.string().min(1), description: z.string().optional(), type: z.enum(["product", "service"]).default("product"),
    price: z.string(), cost: z.string().optional(), stock: z.number().optional(), unit: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.createProduct({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), description: z.string().optional(),
    type: z.enum(["product", "service"]).optional(), price: z.string().optional(),
    cost: z.string().optional(), stock: z.number().optional(), unit: z.string().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updateProduct(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.deleteProduct(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ============ PAYMENTS ROUTER ============
const paymentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllPayments(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const payment = await db.getPaymentById(input.id, ctx.user.id);
    if (!payment) throw new TRPCError({ code: "NOT_FOUND" });
    return payment;
  }),
  create: protectedProcedure.input(z.object({
    workOrderId: z.number().optional(), quoteId: z.number().optional(), clientId: z.number(),
    clientName: z.string(), amount: z.string(), paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]),
    status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(), dueDate: z.date().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.createPayment({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
    amount: z.string().optional(), paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]).optional(),
    paidAt: z.date().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updatePayment(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.deletePayment(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ============ EXPENSES ROUTER ============
const expensesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getAllExpenses(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const expense = await db.getExpenseById(input.id, ctx.user.id);
    if (!expense) throw new TRPCError({ code: "NOT_FOUND" });
    return expense;
  }),
  create: protectedProcedure.input(z.object({
    description: z.string().min(1), category: z.string().optional(), amount: z.string(),
    paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]),
    status: z.enum(["pending", "paid"]).optional(), dueDate: z.date().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.createExpense({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), description: z.string().optional(), category: z.string().optional(),
    amount: z.string().optional(), paymentMethod: z.enum(["cash", "card", "pix", "boleto", "transfer"]).optional(),
    status: z.enum(["pending", "paid"]).optional(), paidAt: z.date().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { id, ...data } = input;
    return await db.updateExpense(id, data, ctx.user.id);
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.deleteExpense(input.id, ctx.user.id);
    return { success: true };
  }),
});

// ============ FINANCIAL ROUTER ============
const financialRouter = router({
  getReport: protectedProcedure.input(z.object({
    startDate: z.date().optional(), endDate: z.date().optional(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.getFinancialReport(ctx.user.id, input.startDate, input.endDate);
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
