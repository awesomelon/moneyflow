import { PrismaClient } from '@/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// PrismaClient 싱글톤 패턴 (개발 환경에서 핫 리로드 시 중복 인스턴스 방지)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL ?? '',
  })?.$extends(withAccelerate());

export default prisma;
