'use client';

import { ReactNode, Suspense } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
}

function HeaderWrapper() {
  return (
    <Suspense
      fallback={<div className="h-14 bg-white border-b border-slate-100" />}
    >
      <Header />
    </Suspense>
  );
}

export default function AppLayout({
  children,
  showHeader = true,
  showNav = true,
}: AppLayoutProps) {
  return (
    <div className="mobile-container relative flex min-h-screen flex-col bg-slate-50">
      {/* Sticky Header */}
      {showHeader && <HeaderWrapper />}

      {/* Main Content */}
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>{children}</main>

      {/* Bottom Navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}
