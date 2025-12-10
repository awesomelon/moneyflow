'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deleteTransaction } from '@/actions/transactions';

interface Transaction {
  id: number;
  date: Date;
  type: string;
  category: string;
  amount: number;
  desc: string | null;
  method: string | null;
  installmentFee: number;
  installmentMonths: number;
  isInstallment: boolean;
}

interface HistoryClientProps {
  initialTransactions: Transaction[];
  initialYear: number;
  initialMonth: number;
}

export default function HistoryClient({
  initialTransactions,
  initialYear,
  initialMonth,
}: HistoryClientProps) {
  const [transactions] = useState(initialTransactions);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  const formatFullDate = (date: Date) => {
    const d = new Date(date);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
  };

  // 날짜별 그룹화
  const groupedTransactions = transactions.reduce(
    (acc, tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: tx.date,
          items: [],
        };
      }
      acc[dateKey].items.push(tx);
      return acc;
    },
    {} as Record<string, { date: Date; items: Transaction[] }>
  );

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteTransaction(id);
      window.location.reload();
    } catch (error) {
      alert('삭제에 실패했습니다');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialYear}년 {initialMonth}월 거래 내역
        </h2>
        <span className="text-sm text-slate-400">{transactions.length}건</span>
      </div>

      {Object.keys(groupedTransactions).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateKey, group]) => (
            <div key={dateKey}>
              {/* 날짜 헤더 */}
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">
                  {formatFullDate(group.date)}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* 거래 목록 */}
              <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {group.items.map(tx => (
                    <Link
                      key={tx.id}
                      href={`/edit/${tx.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-100'
                              : 'bg-rose-100'
                          }`}
                        >
                          <span className="text-lg">
                            {tx.type === 'INCOME'
                              ? '💰'
                              : tx.method === 'CARD'
                                ? '💳'
                                : '💵'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {tx.desc || tx.category}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                              {tx.category}
                            </span>
                            {tx.isInstallment && (
                              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
                                {tx.installmentMonths}개월
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              tx.type === 'INCOME'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {tx.type === 'INCOME' ? '+' : '-'} ₩
                            {formatMoney(tx.amount + tx.installmentFee)}
                          </p>
                          {tx.installmentFee > 0 && (
                            <p className="text-xs text-slate-400">
                              수수료 ₩{formatMoney(tx.installmentFee)}
                            </p>
                          )}
                        </div>
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-10 shadow-sm">
          <svg
            className="mb-3 h-16 w-16 text-slate-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-slate-400">거래 내역이 없습니다</p>
          <Link
            href="/add"
            className="mt-3 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + 첫 거래 등록하기
          </Link>
        </div>
      )}
    </div>
  );
}
