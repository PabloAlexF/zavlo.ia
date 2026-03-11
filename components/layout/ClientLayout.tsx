'use client';

import { UserProvider } from '@/contexts/UserContext';
import { Header } from './Header';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <Header />
      {children}
    </UserProvider>
  );
}
