'use client';

import { motion } from 'framer-motion';
import { Search, Bell, ChevronRight, User } from 'lucide-react';
import { useState } from 'react';

interface DashboardHeaderProps {
  userName: string;
  breadcrumbs?: string[];
}

export default function DashboardHeader({ userName, breadcrumbs = ['Home', 'Dashboard'] }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState(3);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-xl border-b border-white/10 px-8 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={index === breadcrumbs.length - 1 ? 'text-white font-semibold' : 'text-gray-400'}>
                {crumb}
              </span>
              {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-64"
            />
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {notifications}
              </motion.span>
            )}
          </motion.button>

          {/* User Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-sm font-semibold text-white">Online</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
