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
import { authRouter } from "./auth-routes";

// ============ CLIENTS ROUTER ============

const clientsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllClients();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const client = await db.getClientById(input.id);
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
    .mutation(async ({ input }) => {
      const result = await db.createClient(input);
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
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateClient(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteClient(input.id);
      return { success: true };
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        clientType: z.enum(["residential", "commercial"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const allClients = await db.getAllClients();
      
      let filtered = allClients;

      if (input.query) {
        const q = input.query.toLowerCase();
        filtered = filtered.filter((client: any) => {
          const name = client.name ? client.name.toLowerCase() : "";
          const email = client.email ? client.email.toLowerCase() : "";
          const phone = client.phone ? client.phone.toLowerCase() : "";
          return name.includes(q) || email.includes(q) || phone.includes(q);
        });
      }

      if (input.clientType) {
        filtered = filtered.filter((client: any) => client.clientType === input.clientType);
      }

      const total = filtered.length;
      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;
      const data = filtered.slice(start, end);

      return {
        data,
        total,
        page: input.page,
        limit: input.limit,
        pages: Math.ceil(total / input.limit),
      };
    }),
});

// ============ EQUIPMENTS ROUTER ============

const equipmentsRouter = router({
  getByClientId: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await db.getEquipmentsByClientId(input.clientId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const equipment = await db.getEquipmentById(input.id);
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
    .mutation(async ({ input }) => {
      const result = await db.createEquipment(input);
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
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateEquipment(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteEquipment(input.id);
      return { success: true };
    }),
});

// ============ WORK ORDERS ROUTER ============

const workOrdersRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllWorkOrders();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const workOrder = await db.getWorkOrderById(input.id);
      if (!workOrder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ordem de serviço não encontrada" });
      }
      return workOrder;
    }),

  getByClientId: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return await db.getWorkOrdersByClientId(input.clientId);
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
    .mutation(async ({ input }) => {
      const result = await db.createWorkOrder({
        ...input,
        status: "pending",
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
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateWorkOrder(id, data);
    }),

  // Busca e filtros avançados
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]).optional(),
        serviceType: z.enum(["installation", "maintenance", "gas_charge", "cleaning", "repair", "inspection"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const allOrders = await db.getAllWorkOrders();
      
      let filtered = allOrders;

      // Filtro por query (busca em cliente, descrição, técnico)
      if (input.query) {
        const q = input.query.toLowerCase();
        filtered = filtered.filter((order: any) => {
          const client = order.clientId ? order.clientId.toString() : "";
          const desc = order.description ? order.description.toLowerCase() : "";
          const tech = order.technician ? order.technician.toLowerCase() : "";
          return client.includes(q) || desc.includes(q) || tech.includes(q);
        });
      }

      // Filtro por status
      if (input.status) {
        filtered = filtered.filter((order: any) => order.status === input.status);
      }

      // Filtro por tipo de serviço
      if (input.serviceType) {
        filtered = filtered.filter((order: any) => order.serviceType === input.serviceType);
      }

      // Filtro por data
      if (input.startDate) {
        filtered = filtered.filter((order: any) => new Date(order.createdAt) >= input.startDate);
      }
      if (input.endDate) {
        filtered = filtered.filter((order: any) => new Date(order.createdAt) <= input.endDate);
      }

      // Filtro por valor
      if (input.minValue !== undefined) {
        filtered = filtered.filter((order: any) => Number(order.totalValue) >= input.minValue);
      }
      if (input.maxValue !== undefined) {
        filtered = filtered.filter((order: any) => Number(order.totalValue) <= input.maxValue);
      }

      // Paginação
      const total = filtered.length;
      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;
      const data = filtered.slice(start, end);

      return {
        data,
        total,
        page: input.page,
        limit: input.limit,
        pages: Math.ceil(total / input.limit),
      };
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

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,

  health: router({
    check: publicProcedure.query(() => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Sistema de Controle de AC esta funcionando",
    })),
  }),

  // Feature routers
  clients: clientsRouter,
  equipments: equipmentsRouter,
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

// Adicionar endpoints de PDF e CSV ao router de relatórios (já existem em routers.ts)
// Se não existirem, adicionar manualmente os seguintes endpoints:
/*
    exportMonthlyReportPDF: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .mutation(async ({ input }) => {
        const transactions = await db.getTransactionsByDateRange(input.startDate, input.endDate);
        const workOrders = await db.getAllWorkOrders();
        
        const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
        const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
        
        let pdfContent = `Relatório Mensal\n\nPeríodo: ${input.startDate.toLocaleDateString('pt-BR')} a ${input.endDate.toLocaleDateString('pt-BR')}\n\n`;
        pdfContent += `Total de Entradas: R$ ${totalIncome.toFixed(2)}\n`;
        pdfContent += `Total de Saídas: R$ ${totalExpense.toFixed(2)}\n`;
        pdfContent += `Lucro: R$ ${(totalIncome - totalExpense).toFixed(2)}\n\n`;
        pdfContent += `Total de Ordens: ${workOrders.length}\n`;
        
        return {
          pdf: Buffer.from(pdfContent).toString('base64'),
          filename: `Relatorio_Mensal_${new Date().getTime()}.pdf`,
        };
      }),
    
    exportMonthlyReportCSV: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .mutation(async ({ input }) => {
        const transactions = await db.getTransactionsByDateRange(input.startDate, input.endDate);
        let csv = 'Tipo,Descrição,Valor,Data\n';
        
        transactions.forEach((t) => {
          const tipo = t.type === 'income' ? 'Entrada' : 'Saída';
          const descricao = (t.description || 'N/A').replace(/,/g, ';');
          const valor = parseFloat(t.amount.toString()).toFixed(2);
          const data = new Date(t.createdAt).toLocaleDateString('pt-BR');
          csv += `${tipo},${descricao},${valor},${data}\n`;
        });
        
        return {
          csv,
          filename: `Relatorio_Mensal_${new Date().getTime()}.csv`,
        };
      }),
*/
