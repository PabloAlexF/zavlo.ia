'use client';

import { usePathname } from 'next/navigation';
import { UserProvider } from '@/contexts/UserContext';
import { Header } from './Header';
import { ReactNode } from 'react';

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Ocultar header em páginas de dashboard e chat
  const hideHeader = pathname?.startsWith('/dashboard') || pathname?.startsWith('/chat');

  return (
    <UserProvider>
      {!hideHeader && <Header />}
      {children}
    </UserProvider>
  );
}
