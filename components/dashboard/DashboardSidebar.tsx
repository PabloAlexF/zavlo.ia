'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  Heart, 
  Tag, 
  CreditCard, 
  Settings, 
  LogOut,
  Sparkles,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Search, label: 'Buscar', path: '/chat' },
  { icon: Heart, label: 'Favoritos', path: '/favorites' },
  { icon: Tag, label: 'Anunciar', path: '/sell' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: CreditCard, label: 'Planos', path: '/plans' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('zavlo_user');
    router.push('/');
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0B0B0F] via-[#0F0F14] to-[#0B0B0F] border-r border-white/10 backdrop-blur-xl z-50 flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image 
              src="/assets/icons/logo.ico" 
              alt="Zavlo.ia" 
              width={40} 
              height={40}
              className="rounded-xl"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0B0B0F] animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Zavlo.ia</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => router.push(item.path)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all relative group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : ''}`} />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
