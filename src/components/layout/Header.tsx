"use client";

import { Bell, User, LogOut, LogIn, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ sidebarOpen = false, setSidebarOpen = () => {} }: HeaderProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* สามารถเพิ่ม Search bar ตรงนี้ได้ในอนาคต */}
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <button type="button" className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
        </button>
        
        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-2 md:px-3 py-1.5 text-sm">
              <User className="h-4 w-4 text-blue-700" />
              <span className="hidden md:block font-medium text-blue-800 text-xs truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        ) : (
          <Link 
            href="/login"
            className="flex items-center gap-1 md:gap-2 rounded-lg bg-blue-600 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">เข้าสู่ระบบ</span>
          </Link>
        )}
      </div>
    </header>
  );
}
