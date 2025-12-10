import { getTransactionsByMonth } from '@/actions/transactions';
import AppLayout from '@/components/AppLayout';
import HistoryClient from '@/components/HistoryClient';

interface HistoryPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;

  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const transactions = await getTransactionsByMonth(year, month);

  return (
    <AppLayout>
      <HistoryClient
        initialTransactions={transactions}
        initialYear={year}
        initialMonth={month}
      />
    </AppLayout>
  );
}
