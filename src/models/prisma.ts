import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/welive",
});

export default prisma;