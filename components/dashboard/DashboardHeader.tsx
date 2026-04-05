'use client';

import { Bell, ChevronRight } from 'lucide-react';
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
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0C10]/85 border-b border-white/10"
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Conta</span>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-white font-medium">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all"
            >
              <Bell className="w-5 h-5 text-gray-300" />
            </motion.button>

            <motion.div
              whileHover={{ y: -1 }}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/[0.06] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">{userName}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
