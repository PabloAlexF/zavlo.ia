'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, Search, Heart, Package, BarChart3, User, Store, PlusCircle, LogOut, ChevronDown, Rocket, CreditCard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
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
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = user ? [
    { href: '/chat', label: 'Buscar' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/plans', label: 'Planos' },
  ] : [
    { href: '/#como-funciona', label: 'Como Funciona' },
    { href: '/plans', label: 'Planos' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0B0F]/95 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left Side: Logo + Main Nav */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <Image 
                src="/assets/icons/logo.ico" 
                alt="Zavlo.ia" 
                width={28} 
                height={28}
                className="rounded-lg group-hover:scale-105 transition-transform sm:w-8 sm:h-8"
              />
              <span className="text-base sm:text-lg font-bold text-white tracking-tight hidden xs:inline">Zavlo.ia</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-64 bg-[#18181D]/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <div className="px-3 py-3 border-b border-white/10 mb-2">
                          <p className="text-sm font-semibold text-white truncate">{user.name || 'Usuário'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        
                        <Link href="/profile" onClick={(e) => { e.preventDefault(); handleNavigation('/profile'); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
                          <User className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                          <span>Perfil</span>
                        </Link>
                        <Link href="/my-listings" onClick={(e) => { e.preventDefault(); handleNavigation('/my-listings'); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
                          <Store className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                          <span>Meus Anúncios</span>
                        </Link>
                        <Link href="/favorites" onClick={(e) => { e.preventDefault(); handleNavigation('/favorites'); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
                          <Heart className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                          <span>Favoritos</span>
                        </Link>

                        <div className="h-px bg-white/10 my-2" />

                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors group">
                          <LogOut className="w-4 h-4 text-red-500/80 group-hover:text-red-400 transition-colors" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors px-2">
                  Entrar
                </Link>
                <Link href="/auth?register=true" className="text-xs sm:text-sm font-medium bg-white text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                  Criar Conta
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1.5 sm:p-2 -mr-1 sm:-mr-2">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg"
          >
            <motion.div 
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#050409] h-full flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group">
                  <Image src="/assets/icons/logo.ico" alt="Zavlo.ia" width={32} height={32} className="rounded-lg" />
                  <span className="text-lg font-bold text-white">Zavlo.ia</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col p-4 gap-2">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10">
                {user ? (
                  <button onClick={handleLogout} className="w-full text-center px-4 py-3 text-base font-medium text-red-400 bg-red-500/10 rounded-xl">
                    Sair
                  </button>
                ) : (
                  <Link href="/auth?register=true" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center block px-5 py-4 text-base font-semibold bg-white text-black rounded-xl">
                    Criar Conta Gratuita
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
