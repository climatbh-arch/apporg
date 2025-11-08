import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword, generateToken } from "./auth";
import { ENV } from "./_core/env";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(2),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email ja cadastrado" });
      }

      const passwordHash = hashPassword(input.password);
      await db.createLocalUser(input.email, input.name, passwordHash);

      const user = await db.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar usuario",
        });
      }

      const token = generateToken(user.id, ENV.jwtSecret);
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const isPasswordValid = verifyPassword(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      await db.updateUserLastSignedIn(user.id);
      const token = generateToken(user.id, ENV.jwtSecret);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  logout: publicProcedure.mutation(() => ({
    success: true,
  })),
});
