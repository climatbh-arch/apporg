// ROUTERS CORRIGIDOS COM ISOLAMENTO DE USUÁRIO

import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============ CLIENTS ROUTER (COM ISOLAMENTO) ============

const clientsRouterFixed = router({
  // Listar APENAS clientes do usuário logado
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
    }
    
    const allClients = await db.getAllClients();
    // Filtrar apenas clientes do usuário logado
    return allClients.filter((client: any) => client.userId === ctx.user.id);
  }),

  // Buscar cliente por ID (com verificação de propriedade)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      }
      
      const client = await db.getClientById(input.id);
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }
      
      // Verificar se o cliente pertence ao usuário
      if (client.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para acessar este cliente" });
      }
      
      return client;
    }),

  // Criar cliente (com userId do usuário logado)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        phone: z.string().optional(),
        email: z.string().email("Email inválido").optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        clientType: z.enum(["residential", "commercial"]).default("residential"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      }
      
      try {
        const result = await db.createClient({
          ...input,
          userId: ctx.user.id, // Adicionar userId automaticamente
        });
        return result;
      } catch (error) {
        console.error("Erro ao criar cliente:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Erro ao criar cliente" 
        });
      }
    }),

  // Atualizar cliente (com verificação de propriedade)
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
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      }
      
      const client = await db.getClientById(input.id);
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }
      
      if (client.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para atualizar este cliente" });
      }
      
      const { id, ...data } = input;
      return await db.updateClient(id, data);
    }),

  // Deletar cliente (com verificação de propriedade)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      }
      
      const client = await db.getClientById(input.id);
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      }
      
      if (client.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para deletar este cliente" });
      }
      
      await db.deleteClient(input.id);
      return { success: true };
    }),

  // Buscar com filtros (apenas do usuário)
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        clientType: z.enum(["residential", "commercial"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não autenticado" });
      }
      
      const allClients = await db.getAllClients();
      
      // Filtrar por usuário primeiro
      let filtered = allClients.filter((client: any) => client.userId === ctx.user.id);

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

      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
        page: input.page,
        limit: input.limit,
      };
    }),
});

export { clientsRouterFixed };
