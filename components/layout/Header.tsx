'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, Search, Heart, Package, BarChart3, User, Store, PlusCircle, LogOut, ChevronDown } from 'lucide-react';

export function Header() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [credits, setCredits] = useState(user?.credits || 0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setCredits(user?.credits || 0);
    
    const handleUpdate = () => {
      const stored = localStorage.getItem('zavlo_user');
      if (stored) {
        const userData = JSON.parse(stored);
        setCredits(userData.credits || 0);
      }
    };
    
    window.addEventListener('userChanged', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('userChanged', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  const handleNavigation = (href: string) => {
    setIsDropdownOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/favorites', label: 'Favoritos', icon: Heart },
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    { href: '/plans', label: 'Planos', icon: Package },
  ];

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/my-listings', label: 'Meus Anúncios', icon: Package },
    { href: '/sell', label: 'Vender', icon: PlusCircle },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0B0B0F]/95 backdrop-blur-xl border-b border-white/10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image 
            src="/assets/icons/logo.ico" 
            alt="Zavlo.ia" 
            width={32} 
            height={32}
            className="rounded-xl group-hover:scale-105 transition-transform"
          />
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Zavlo.ia</span>
        </Link>
        
        {/* Navigation - All screens */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {user ? (
            // Usuário logado - All screens
            <div className="relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-1 py-1 pr-2 sm:pr-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-105 transition-transform border border-white/10"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-white text-xs sm:text-sm font-medium hidden lg:block">{user.name?.split(' ')[0] || 'Usuário'}</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-2 w-auto sm:w-80 bg-[#1A1A1F]/95 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100]"
                  style={{
                    maxHeight: 'calc(100vh - 5rem)',
                    overflowY: 'auto'
                  }}
                >
                  {/* Header com info do usuário */}
                  <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                        <p className="text-xs font-medium text-purple-300 capitalize">{user.plan || 'free'}</p>
                      </div>
                      {credits > 0 && (
                        <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                          <p className="text-xs font-medium text-blue-300">{credits} créditos</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu items com preview */}
                  <div className="p-2">
                    {/* Links principais */}
                    <Link 
                      href="/search" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/search'); }}
                      onMouseEnter={() => setHoveredItem('search')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Buscar</p>
                        {hoveredItem === 'search' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Encontre produtos em 9+ sites</p>
                        )}
                      </div>
                    </Link>

                    <Link 
                      href="/favorites" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/favorites'); }}
                      onMouseEnter={() => setHoveredItem('favorites')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Favoritos</p>
                        {hoveredItem === 'favorites' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Seus produtos salvos</p>
                        )}
                      </div>
                    </Link>

                    <Link 
                      href="/marketplace" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/marketplace'); }}
                      onMouseEnter={() => setHoveredItem('marketplace')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Marketplace</p>
                        {hoveredItem === 'marketplace' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Explore todos os anúncios</p>
                        )}
                      </div>
                    </Link>

                    <Link 
                      href="/plans" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/plans'); }}
                      onMouseEnter={() => setHoveredItem('plans')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Planos</p>
                        {hoveredItem === 'plans' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Upgrade e créditos</p>
                        )}
                      </div>
                    </Link>

                    <div className="h-px bg-white/10 my-2" />

                    {/* Links secundários */}
                    <Link 
                      href="/dashboard" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/dashboard'); }}
                      onMouseEnter={() => setHoveredItem('dashboard')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Dashboard</p>
                        {hoveredItem === 'dashboard' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Estatísticas e histórico</p>
                        )}
                      </div>
                    </Link>

                    <Link 
                      href="/profile" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/profile'); }}
                      onMouseEnter={() => setHoveredItem('profile')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Perfil</p>
                        {hoveredItem === 'profile' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Editar suas informações</p>
                        )}
                      </div>
                    </Link>

                    <Link 
                      href="/my-listings" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/my-listings'); }}
                      onMouseEnter={() => setHoveredItem('listings')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Meus Anúncios</p>
                        {hoveredItem === 'listings' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Gerencie seus produtos</p>
                        )}
                      </div>
                    </Link>

                    <Link 
                      href="/sell" 
                      onClick={(e) => { e.preventDefault(); handleNavigation('/sell'); }}
                      onMouseEnter={() => setHoveredItem('sell')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Vender</p>
                        {hoveredItem === 'sell' && (
                          <p className="text-xs text-gray-500 animate-in fade-in slide-in-from-left-1 duration-200">Anuncie seu produto</p>
                        )}
                      </div>
                    </Link>

                    <div className="h-px bg-white/10 my-2" />

                    {/* Logout */}
                    <button 
                      onClick={handleLogout}
                      onMouseEnter={() => setHoveredItem('logout')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Sair</p>
                        {hoveredItem === 'logout' && (
                          <p className="text-xs text-red-500/70 animate-in fade-in slide-in-from-left-1 duration-200">Desconectar da conta</p>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Usuário não logado
            <>
              <Link href="/about" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">Sobre</Link>
              <Link href="/plans" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">Planos</Link>
              <Link href="/auth" className="text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:scale-105 transition-transform shadow-lg">
                Entrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
