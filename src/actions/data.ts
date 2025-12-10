'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * 모든 거래 데이터 삭제 (초기화)
 */
export async function deleteAllTransactions() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  await prisma.transaction.deleteMany({
    where: {
      userId: session.user.id,
    },
  });

  revalidatePath('/');
  revalidatePath('/history');
  revalidatePath('/settings');
}

/**
 * 거래 데이터 내보내기 (JSON 형식)
 */
export async function exportTransactions() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: 'desc',
    },
  });

  // JSON 형식으로 변환
  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: session.user.id,
    userName: session.user.name,
    totalTransactions: transactions.length,
    transactions: transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      date: tx.date.toISOString(),
      amount: tx.amount,
      category: tx.category,
      desc: tx.desc,
      method: tx.method,
      isInstallment: tx.isInstallment,
      installmentMonths: tx.installmentMonths,
      installmentFee: tx.installmentFee,
      note: tx.note,
      createdAt: tx.createdAt.toISOString(),
    })),
  };

  return exportData;
}

/**
 * 거래 통계 조회
 */
export async function getTransactionStats() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount + tx.installmentFee;
    }
  });

  return {
    totalTransactions: transactions.length,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
