"use client";

import { Bell, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
      <div className="flex flex-1">
        {/* สามารถเพิ่ม Search bar ตรงนี้ได้ในอนาคต */}
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>
        
        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm">
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
              <LogOut className="h-4 w-4" />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        ) : (
          <Link 
            href="/login"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}
