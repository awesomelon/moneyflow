import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Better-SQLite3 어댑터 생성 (Prisma 7.x API)
const adapter = new PrismaBetterSqlite3({
  url: './dev.db',
});

// PrismaClient 싱글톤 패턴 (개발 환경에서 핫 리로드 시 중복 인스턴스 방지)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
