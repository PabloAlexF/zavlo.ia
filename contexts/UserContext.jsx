'use client';
import { createContext, useContext, useState, useEffect } from 'react';
const UserContext = createContext(undefined);
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Verificar se estamos no cliente antes de acessar localStorage
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('zavlo_user') || localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                }
                catch (error) {
                    console.error('Erro ao carregar usuário:', error);
                }
            }
        }
        setLoading(false);
        // Escutar mudanças no localStorage (mesmo na mesma aba) - apenas no cliente
        if (typeof window !== 'undefined') {
            const handleStorageChange = (e) => {
                const updatedUser = localStorage.getItem('zavlo_user');
                if (updatedUser) {
                    try {
                        setUser(JSON.parse(updatedUser));
                    }
                    catch (error) {
                        console.error('Erro ao atualizar usuário:', error);
                    }
                }
                else {
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
        }
    }, []);
    const updateUser = (userData) => {
        if (user && typeof window !== 'undefined') {
            const updatedUser = Object.assign(Object.assign({}, user), userData);
            setUser(updatedUser);
            localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
        }
    };
    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('zavlo_user');
            // Disparar evento para atualizar outras páginas e mesma aba
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('userChanged'));
        }
        setUser(null);
    };
    return (<UserContext.Provider value={{ user, setUser, logout, loading, updateUser }}>
      {children}
    </UserContext.Provider>);
}
export function useUser() {
    const context = useContext(UserContext);
    if (!context)
        throw new Error('useUser must be used within a UserProvider');
    return context;
}
