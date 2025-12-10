'use client';

import { useMonthNavigation } from '@/hooks/useMonthNavigation';

export default function Header() {
  const { year, month, goToPrevMonth, goToNextMonth } = useMonthNavigation();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur-md border-b border-slate-100">
      {/* 이전 달 버튼 */}
      <button
        onClick={goToPrevMonth}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200"
        aria-label="이전 달"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* 현재 년/월 표시 */}
      <h1 className="text-lg font-semibold text-slate-900">
        {year}년 {month}월
      </h1>

      {/* 다음 달 버튼 */}
      <button
        onClick={goToNextMonth}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200"
        aria-label="다음 달"
      >
        <svg
          className="h-5 w-5"
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
      </button>
    </header>
  );
}
