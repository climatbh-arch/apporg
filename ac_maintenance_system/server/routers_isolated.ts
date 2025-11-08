// ROUTERS COM ISOLAMENTO DE USUÁRIO

// CLIENTES - Filtrar por usuário logado
const clientsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ✅ Retorna apenas clientes do usuário logado
    return await db.getClientsByUserId(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      clientType: z.enum(["residential", "commercial"]).default("residential"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ✅ Adiciona userId automaticamente
      return await db.createClientWithUser(input, ctx.user.id);
    }),
});

// ORDENS DE SERVIÇO - Filtrar por usuário logado
const workOrdersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ✅ Retorna apenas ordens do usuário logado
    return await db.getWorkOrdersByUserId(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      equipmentId: z.number().optional(),
      serviceType: z.enum(["installation", "maintenance", "gas_charge", "cleaning", "repair", "inspection"]),
      totalValue: z.string(),
      description: z.string().optional(),
      technician: z.string().optional(),
      scheduledDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ✅ Adiciona userId automaticamente
      return await db.createWorkOrderWithUser(input, ctx.user.id);
    }),
});

// TRANSAÇÕES - Filtrar por usuário logado
const transactionsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ✅ Retorna apenas transações do usuário logado
    return await db.getTransactionsByUserId(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      type: z.enum(["income", "expense"]),
      amount: z.string(),
      description: z.string().optional(),
      workOrderId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ✅ Adiciona userId automaticamente
      return await db.createTransactionWithUser(input, ctx.user.id);
    }),
});
