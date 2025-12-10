import { PrismaClient } from '../generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
const prismaClientSingleton = () =>
  new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL ?? '',
  }).$extends(withAccelerate());
// 확장된 클라이언트의 타입을 추론
type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
