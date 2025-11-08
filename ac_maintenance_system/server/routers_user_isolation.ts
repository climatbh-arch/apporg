// Exemplo de como filtrar dados por usuário logado

// ANTES (sem isolamento):
const clientsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllClients(); // ❌ Retorna TODOS
  }),
});

// DEPOIS (com isolamento):
const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user.id é o ID do usuário logado
    return await db.getClientsByUserId(ctx.user.id); // ✅ Retorna apenas do usuário
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      // ... outros campos
    }))
    .mutation(async ({ input, ctx }) => {
      // Adicionar userId ao criar
      const result = await db.createClient({
        ...input,
        userId: ctx.user.id, // ✅ Associar ao usuário logado
      });
      return result;
    }),
});

// MESMO PADRÃO PARA:
// - equipments (filtrar por userId via cliente)
// - workOrders (filtrar por userId)
// - transactions (filtrar por userId)
// - workOrderItems (filtrar por userId)
// - inventory (filtrar por userId)
// - maintenanceHistory (filtrar por userId)
