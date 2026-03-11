'use client';

import { Search, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0B0F]/80 border-b border-white/10"
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Home</span>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-white font-semibold">Dashboard</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-48"
              />
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
            </motion.button>

            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-white">{userName}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
