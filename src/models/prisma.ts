import { PrismaClient } from "../generated/prisma";

// Prisma 클라이언트 싱글톤 - 연결 중복 방지
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

export default prisma;