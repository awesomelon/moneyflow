'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TransactionType,
  PaymentMethod,
} from '@/types';
import {
  updateTransaction,
  getTransaction,
  deleteTransaction,
} from '@/actions/transactions';
import { getInstallmentPreview } from '@/lib/installment';
import { useToast } from '@/components/Toast';

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [transactionId, setTransactionId] = useState<number | null>(null);

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [installmentMonths, setInstallmentMonths] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // 거래 데이터 로드
  useEffect(() => {
    const loadTransaction = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setTransactionId(id);

      try {
        const tx = await getTransaction(id);
        if (tx) {
          setType(tx.type as TransactionType);
          setDate(new Date(tx.date).toISOString().split('T')[0]);
          setAmount(tx.amount.toLocaleString());
          setCategory(tx.category);
          setDesc(tx.desc || '');
          setMethod((tx.method as PaymentMethod) || 'CARD');
          setInstallmentMonths(tx.installmentMonths);
          setNote(tx.note || '');
        } else {
          setError('거래를 찾을 수 없습니다');
        }
      } catch (err) {
        setError('데이터를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransaction();
  }, [params]);

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const showPaymentMethod = type === 'EXPENSE';
  const showInstallment = type === 'EXPENSE' && method === 'CARD';

  const amountNumber = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const installmentPreview =
    showInstallment && amountNumber > 0
      ? getInstallmentPreview(amountNumber, installmentMonths)
      : '';

  const formatAmount = (value: string) => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amountNumber || amountNumber <= 0) {
      setError('금액을 입력해주세요');
      return;
    }
    if (!category) {
      setError('분류를 선택해주세요');
      return;
    }
    if (!transactionId) {
      setError('거래 ID가 없습니다');
      return;
    }

    startTransition(async () => {
      try {
        await updateTransaction({
          id: transactionId,
          type,
          date,
          amount: amountNumber,
          category,
          desc: desc || undefined,
          method: type === 'EXPENSE' ? method : undefined,
          installmentMonths: showInstallment ? installmentMonths : 1,
          note: note || undefined,
        });

        showToast('수정되었습니다', 'success');
        router.push('/history');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : '수정에 실패했습니다');
        showToast('수정에 실패했습니다', 'error');
      }
    });
  };

  const handleDelete = async () => {
    if (!transactionId) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;

    startTransition(async () => {
      try {
        await deleteTransaction(transactionId);
        showToast('삭제되었습니다', 'success');
        router.push('/history');
        router.refresh();
      } catch (err) {
        showToast('삭제에 실패했습니다', 'error');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mobile-container flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-100">
        <Link
          href="/history"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
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
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">거래 수정</h1>
        <button
          type="submit"
          form="transaction-form"
          disabled={isPending}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </header>

      {error && (
        <div className="mx-4 mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <form
        id="transaction-form"
        onSubmit={handleSubmit}
        className="p-4 space-y-5"
      >
        {/* 구분 (Type) */}
        <div className="flex overflow-hidden rounded-xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setCategory('');
            }}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            지출
          </button>
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setCategory('');
            }}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            수입
          </button>
        </div>

        {/* 일자 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            일자
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* 금액 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            금액
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ₩
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-right text-xl font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 분류 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            분류
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? type === 'INCOME'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 내용 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            내용
          </label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="예: 점심 식사"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* 결제 수단 (지출 시만) */}
        {showPaymentMethod && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              결제 수단
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                  method === 'CARD'
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💳 카드
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('CASH');
                  setInstallmentMonths(1);
                }}
                className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                  method === 'CASH'
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💵 현금
              </button>
            </div>
          </div>
        )}

        {/* 할부 설정 */}
        {showInstallment && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              할부
            </label>
            <select
              value={installmentMonths}
              onChange={e => setInstallmentMonths(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={1}>일시불</option>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                <option key={month} value={month}>
                  {month}개월{month <= 3 ? ' (무이자)' : ''}
                </option>
              ))}
            </select>
            {installmentPreview && amountNumber > 0 && (
              <p className="mt-2 text-sm text-indigo-600 font-medium">
                {installmentPreview}
              </p>
            )}
          </div>
        )}

        {/* 비고 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            비고
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="상세 메모 (선택)"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* 삭제 버튼 */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="w-full rounded-xl bg-rose-50 py-4 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
        >
          거래 삭제
        </button>
      </form>
    </div>
  );
}
