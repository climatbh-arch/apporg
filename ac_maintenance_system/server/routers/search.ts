import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const searchRouter = router({
  global: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const q = input.query.toLowerCase();
      const clients = await db.getAllClients();
      const workOrders = await db.getAllWorkOrders();

      return {
        clients: clients
          .filter(
            (c: any) =>
              c.name?.toLowerCase().includes(q) ||
              c.email?.toLowerCase().includes(q) ||
              c.phone?.toLowerCase().includes(q)
          )
          .slice(0, 5),
        workOrders: workOrders
          .filter(
            (w: any) =>
              w.description?.toLowerCase().includes(q) ||
              w.technician?.toLowerCase().includes(q)
          )
          .slice(0, 5),
      };
    }),
});
