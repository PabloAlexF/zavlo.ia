import { useState, useEffect, useCallback } from 'react';

export function useCredits() {
  const [userCredits, setUserCredits] = useState(0);

  const loadCredits = useCallback(async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        setUserCredits(profile.credits || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
    }
  }, []);

  const updateCredits = useCallback((newCredits: number) => {
    console.log('💳 [CREDITS] Atualizando créditos:', {
      anterior: userCredits,
      novo: newCredits,
      diferença: userCredits - newCredits
    });
    
    setUserCredits(newCredits);
    
    const user = localStorage.getItem('zavlo_user');
    if (user) {
      const userData = JSON.parse(user);
      const updatedUser = { ...userData, credits: newCredits };
      localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userChanged'));
    }
  }, [userCredits]);

  useEffect(() => {
    loadCredits();
    const handleUserChanged = () => loadCredits();
    window.addEventListener('userChanged', handleUserChanged);
    return () => window.removeEventListener('userChanged', handleUserChanged);
  }, [loadCredits]);

  return {
    userCredits,
    loadCredits,
    updateCredits,
  };
}
