'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  Heart,
  Tag,
  Bell,
  BarChart3,
  User,
  CreditCard,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Search, label: 'Buscar', href: '/search' },
  { icon: Heart, label: 'Favoritos', href: '/favorites' },
  { icon: Tag, label: 'Meus Anúncios', href: '/my-listings' },
  { icon: Bell, label: 'Alertas', href: '/price-alerts' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: User, label: 'Perfil', href: '/profile' },
  { icon: CreditCard, label: 'Planos', href: '/plans' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('zavlo_user');
    router.push('/auth');
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#0A0C10] border-r border-white/10 flex-col z-50"
    >
      <div className="p-6 border-b border-white/10">
        <motion.div
          whileHover={{ y: -1 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">Z</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Zavlo.ia</h1>
            <p className="text-xs text-gray-500">Área logada</p>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-white/[0.08] border border-white/15 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
              }`} />
              <span className="font-medium text-sm">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sair</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
