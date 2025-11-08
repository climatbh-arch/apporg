import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyToken } from "../auth";
import * as db from "../db";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try Manus OAuth first
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // If Manus OAuth fails, try local JWT authentication
    try {
      const authHeader = opts.req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const decoded = verifyToken(token, ENV.jwtSecret);
        if (decoded) {
          user = await db.getUserById(decoded.userId);
        }
      }
    } catch (jwtError) {
      // JWT verification failed, user remains null
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
