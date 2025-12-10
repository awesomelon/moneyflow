import { auth } from '@/auth';
import {
  getMonthlySummary,
  getCategoryStats,
  getTransactionsByMonth,
} from '@/actions/transactions';
import AppLayout from '@/components/AppLayout';
import DashboardClient from '@/components/DashboardClient';

interface HomeProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();
  const params = await searchParams;

  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  // 서버에서 데이터 가져오기
  const [summary, categoryStats, transactions] = await Promise.all([
    getMonthlySummary(year, month),
    getCategoryStats(year, month),
    getTransactionsByMonth(year, month),
  ]);

  // 최근 거래 5개만
  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppLayout>
      <DashboardClient
        userName={session?.user?.name || '사용자'}
        summary={summary}
        categoryStats={categoryStats}
        recentTransactions={recentTransactions}
        year={year}
        month={month}
      />
    </AppLayout>
  );
}
