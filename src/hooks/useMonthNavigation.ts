'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useMonthNavigation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const now = new Date();
  const currentYear = parseInt(
    searchParams.get('year') || String(now.getFullYear())
  );
  const currentMonth = parseInt(
    searchParams.get('month') || String(now.getMonth() + 1)
  );

  const goToPrevMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth - 1;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    const params = new URLSearchParams(searchParams);
    params.set('year', String(newYear));
    params.set('month', String(newMonth));
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToNextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth + 1;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    const params = new URLSearchParams(searchParams);
    params.set('year', String(newYear));
    params.set('month', String(newMonth));
    router.push(`${pathname}?${params.toString()}`);
  };

  return {
    year: currentYear,
    month: currentMonth,
    goToPrevMonth,
    goToNextMonth,
  };
}
