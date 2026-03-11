'use client';
import { UserProvider } from '@/contexts/UserContext';
import { Header } from './Header';
export function ClientLayout({ children }) {
    return (<UserProvider>
      <Header />
      {children}
    </UserProvider>);
}
