'use client';

import { UserProvider } from '@/contexts/UserContext';
import { Header } from './Header';
import { ReactNode } from 'react';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <Header />
      {children}
    </UserProvider>
  );
}
