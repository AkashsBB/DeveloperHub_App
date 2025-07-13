import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    // prisma handles connection automatically, just testing
    await prisma.$connect();
    console.log("PostgreSQL connected successfully");
  } catch (error: unknown) {
    console.error("PostgreSQL connection error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
};

export default prisma;