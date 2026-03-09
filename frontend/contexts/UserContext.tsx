'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  name: string;
  email: string;
  plan?: string;
  credits?: number;
  token?: string;
  createdAt?: string;
  searchesUsedToday?: number;
  imageSearchesUsedToday?: number;
  billingCycle?: string;
  planStartedAt?: string;
  planExpiresAt?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar ambos os formatos de localStorage
    const storedUser = localStorage.getItem('zavlo_user') || localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
    setLoading(false);

    // Escutar mudanças no localStorage (mesmo na mesma aba)
    const handleStorageChange = (e?: StorageEvent) => {
      const updatedUser = localStorage.getItem('zavlo_user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (error) {
          console.error('Erro ao atualizar usuário:', error);
        }
      } else {
        setUser(null);
      }
    };

    // Listener para mudanças entre abas
    window.addEventListener('storage', handleStorageChange);
    
    // Listener customizado para mudanças na mesma aba
    window.addEventListener('userChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleStorageChange);
    };
  }, []);

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('zavlo_user');
    setUser(null);
    
    // Disparar evento para atualizar outras páginas e mesma aba
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('userChanged'));
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
