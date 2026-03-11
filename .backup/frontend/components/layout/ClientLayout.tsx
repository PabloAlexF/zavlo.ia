'use client';

import { UserProvider } from '@/contexts/UserContext';
import { Header } from './Header';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname === '/chat';

  return (
    <UserProvider>
      {!hideHeader && <Header />}
      <div className={hideHeader ? '' : 'pt-16'}>
        {children}
      </div>
    </UserProvider>
  );
}
