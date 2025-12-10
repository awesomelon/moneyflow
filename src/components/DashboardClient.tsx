'use client';

import Link from 'next/link';
import { CategorySummary } from '@/types';

interface Transaction {
  id: number;
  date: Date;
  type: string;
  category: string;
  amount: number;
  desc: string | null;
  installmentFee: number;
}

interface DashboardClientProps {
  userName: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  categoryStats: CategorySummary[];
  recentTransactions: Transaction[];
  year: number;
  month: number;
}

export default function DashboardClient({
  userName,
  summary,
  categoryStats,
  recentTransactions,
  year,
  month,
}: DashboardClientProps) {
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 도넛 차트 색상
  const chartColors = [
    '#4f46e5', // indigo
    '#0891b2', // cyan
    '#059669', // emerald
    '#d97706', // amber
    '#dc2626', // red
    '#7c3aed', // violet
    '#db2777', // pink
  ];

  return (
    <div className="p-4">
      {/* 자산 현황 카드 */}
      <section className="mb-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 text-white shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-100">
              안녕하세요, {userName}님
            </span>
          </div>

          {/* 현재 잔액 */}
          <div className="mb-4">
            <p className="text-sm text-indigo-200">현재 잔액</p>
            <p
              className={`text-3xl font-bold ${summary.balance < 0 ? 'text-rose-300' : ''}`}
            >
              ₩ {formatMoney(summary.balance)}
            </p>
          </div>

          {/* 수입/지출 */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs text-indigo-200">이번 달 수입</p>
              <p className="text-lg font-semibold text-emerald-300">
                + ₩ {formatMoney(summary.totalIncome)}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs text-indigo-200">이번 달 지출</p>
              <p className="text-lg font-semibold text-rose-300">
                - ₩ {formatMoney(summary.totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 지출 통계 */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">지출 통계</h2>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          {categoryStats.length > 0 ? (
            <>
              {/* 도넛 차트 */}
              <div className="mb-4 flex justify-center">
                <div className="relative h-40 w-40">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full -rotate-90"
                  >
                    {
                      categoryStats.reduce(
                        (acc, stat, index) => {
                          const circumference = 2 * Math.PI * 35;
                          const strokeLength =
                            (stat.percentage / 100) * circumference;
                          const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
                          const strokeDashoffset = -acc.offset;

                          acc.elements.push(
                            <circle
                              key={stat.category}
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke={chartColors[index % chartColors.length]}
                              strokeWidth="20"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                            />
                          );

                          acc.offset += strokeLength;
                          return acc;
                        },
                        { elements: [] as React.ReactNode[], offset: 0 }
                      ).elements
                    }
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400">총 지출</p>
                    <p className="text-sm font-bold text-slate-900">
                      ₩{formatMoney(summary.totalExpense)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 카테고리 리스트 */}
              <div className="space-y-2">
                {categoryStats.map((stat, index) => (
                  <div key={stat.category} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="flex-1 text-sm text-slate-700">
                      {stat.category}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      ₩{formatMoney(stat.amount)}
                    </span>
                    <span className="w-12 text-right text-xs text-slate-400">
                      {stat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <div className="text-center">
                <svg
                  className="mx-auto mb-2 h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
                <p className="text-sm">아직 데이터가 없습니다</p>
                <p className="text-xs text-slate-300">지출을 기록해보세요!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 최근 거래 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">최근 거래</h2>
          <Link
            href="/history"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            전체보기
          </Link>
        </div>
        <div className="rounded-2xl bg-white shadow-sm">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.type === 'INCOME' ? 'bg-emerald-100' : 'bg-rose-100'
                      }`}
                    >
                      <span className="text-lg">
                        {tx.type === 'INCOME' ? '💰' : '💸'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {tx.desc || tx.category}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(tx.date)} · {tx.category}
                      </p>
                    </div>
                  </div>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center p-5 text-slate-400">
              <p className="text-sm">거래 내역이 없습니다</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
