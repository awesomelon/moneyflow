'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { calculateInstallmentFee } from '@/lib/installment';
import { revalidatePath } from 'next/cache';
import { TransactionType, PaymentMethod } from '@/types';

// Transaction 입력 타입
interface CreateTransactionInput {
  type: TransactionType;
  date: string;
  amount: number;
  category: string;
  desc?: string;
  method?: PaymentMethod;
  installmentMonths?: number;
  note?: string;
}

interface UpdateTransactionInput extends CreateTransactionInput {
  id: number;
}

/**
 * 수입/지출 등록
 */
export async function createTransaction(input: CreateTransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  const {
    type,
    date,
    amount,
    category,
    desc,
    method,
    installmentMonths = 1,
    note,
  } = input;

  // 지출 + 카드 + 할부일 때만 수수료 계산
  const isInstallment =
    type === 'EXPENSE' && method === 'CARD' && installmentMonths > 1;
  const installmentFee = isInstallment
    ? calculateInstallmentFee(amount, installmentMonths)
    : 0;

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type,
      date: new Date(date),
      amount,
      category,
      desc: desc || null,
      method: type === 'EXPENSE' ? method : null,
      isInstallment,
      installmentMonths: isInstallment ? installmentMonths : 1,
      installmentFee,
      note: note || null,
    },
  });

  revalidatePath('/');
  revalidatePath('/history');

  return transaction;
}

/**
 * 거래 내역 조회 (월별)
 */
export async function getTransactionsByMonth(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  // 해당 월의 시작일과 종료일
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return transactions;
}

/**
 * 월별 요약 데이터
 */
export async function getMonthlySummary(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  // 해당 월의 시작일과 종료일
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 해당 월의 거래 내역
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // 수입/지출 합계 계산
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      // 지출의 경우 원금 + 할부 수수료
      totalExpense += tx.amount + tx.installmentFee;
    }
  });

  // 전체 잔액 계산 (전체 기간의 수입 - 지출)
  const allTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        lte: endDate,
      },
    },
  });

  let balance = 0;
  allTransactions.forEach(tx => {
    if (tx.type === 'INCOME') {
      balance += tx.amount;
    } else {
      balance -= tx.amount + tx.installmentFee;
    }
  });

  return {
    totalIncome,
    totalExpense,
    balance,
  };
}

/**
 * 카테고리별 지출 통계
 */
export async function getCategoryStats(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type: 'EXPENSE',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // 카테고리별 집계
  const categoryMap = new Map<string, number>();
  let total = 0;

  transactions.forEach(tx => {
    const amount = tx.amount + tx.installmentFee;
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + amount);
    total += amount;
  });

  // 정렬 및 퍼센트 계산
  const stats = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return stats;
}

/**
 * 거래 수정
 */
export async function updateTransaction(input: UpdateTransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  const {
    id,
    type,
    date,
    amount,
    category,
    desc,
    method,
    installmentMonths = 1,
    note,
  } = input;

  // 기존 거래가 본인 것인지 확인
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error('거래를 찾을 수 없습니다');
  }

  const isInstallment =
    type === 'EXPENSE' && method === 'CARD' && installmentMonths > 1;
  const installmentFee = isInstallment
    ? calculateInstallmentFee(amount, installmentMonths)
    : 0;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      type,
      date: new Date(date),
      amount,
      category,
      desc: desc || null,
      method: type === 'EXPENSE' ? method : null,
      isInstallment,
      installmentMonths: isInstallment ? installmentMonths : 1,
      installmentFee,
      note: note || null,
    },
  });

  revalidatePath('/');
  revalidatePath('/history');

  return transaction;
}

/**
 * 거래 삭제
 */
export async function deleteTransaction(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  // 기존 거래가 본인 것인지 확인
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error('거래를 찾을 수 없습니다');
  }

  await prisma.transaction.delete({
    where: { id },
  });

  revalidatePath('/');
  revalidatePath('/history');
}

/**
 * 단일 거래 조회
 */
export async function getTransaction(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다');
  }

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });

  return transaction;
}
