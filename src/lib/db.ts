import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = process.env.DATABASE_URL
  ? globalThis.prisma || new PrismaClient()
  : (null as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalThis.prisma = db;
}
