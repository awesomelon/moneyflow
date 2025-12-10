'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAllTransactions, exportTransactions } from '@/actions/data';
import { useToast } from '@/components/Toast';

export default function SettingsClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleExport = async () => {
    startTransition(async () => {
      try {
        const data = await exportTransactions();

        // JSON 다운로드
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneyflow-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(
          `${data.totalTransactions}건의 데이터를 내보냈습니다`,
          'success'
        );
      } catch (error) {
        showToast('내보내기에 실패했습니다', 'error');
      }
    });
  };

  const handleReset = async () => {
    if (
      !confirm(
        '정말 모든 거래 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!'
      )
    )
      return;
    if (!confirm('마지막 확인입니다. 정말로 삭제하시겠습니까?')) return;

    startTransition(async () => {
      try {
        await deleteAllTransactions();
        showToast('모든 데이터가 삭제되었습니다', 'success');
        router.refresh();
      } catch (error) {
        showToast('삭제에 실패했습니다', 'error');
      }
    });
  };

  return (
    <>
      {/* 데이터 내보내기 */}
      <button
        onClick={handleExport}
        disabled={isPending}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-5 w-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <span className="font-medium text-slate-700">데이터 내보내기</span>
        </div>
        <svg
          className="h-5 w-5 text-slate-400"
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

      {/* 데이터 초기화 */}
      <button
        onClick={handleReset}
        disabled={isPending}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-rose-50 disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
            <svg
              className="h-5 w-5 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <span className="font-medium text-rose-600">데이터 초기화</span>
            <p className="text-xs text-slate-400">모든 거래 데이터 삭제</p>
          </div>
        </div>
      </button>
    </>
  );
}
