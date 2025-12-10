import { auth } from '@/auth';
import { logout } from '@/actions/auth';
import { getTransactionStats } from '@/actions/data';
import AppLayout from '@/components/AppLayout';
import SettingsClient from '@/components/SettingsClient';
import Image from 'next/image';

export default async function SettingsPage() {
  const session = await auth();
  const stats = await getTransactionStats();

  return (
    <AppLayout>
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">설정</h2>

        {/* 사용자 정보 */}
        <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-4 p-5">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="프로필"
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200">
                <svg
                  className="h-7 w-7 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">
                {session?.user?.name || '사용자'}
              </p>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
            </div>
          </div>
        </section>

        {/* 통계 요약 */}
        <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="p-5">
            <h3 className="mb-3 text-sm font-medium text-slate-500">
              전체 통계
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">총 거래 수</p>
                <p className="text-lg font-semibold text-slate-900">
                  {stats.totalTransactions}건
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">현재 잔액</p>
                <p
                  className={`text-lg font-semibold ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  ₩{stats.balance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">총 수입</p>
                <p className="text-lg font-semibold text-emerald-600">
                  ₩{stats.totalIncome.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">총 지출</p>
                <p className="text-lg font-semibold text-rose-600">
                  ₩{stats.totalExpense.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 메뉴 */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {/* 데이터 관리 (클라이언트 컴포넌트로 분리) */}
            <SettingsClient />

            {/* 앱 정보 */}
            <div className="flex w-full items-center justify-between p-4">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="font-medium text-slate-700">앱 정보</span>
              </div>
              <span className="text-sm text-slate-400">v1.0.0</span>
            </div>

            {/* 로그아웃 */}
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 p-4 text-left text-rose-500 transition-colors hover:bg-rose-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <span className="font-medium">로그아웃</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
