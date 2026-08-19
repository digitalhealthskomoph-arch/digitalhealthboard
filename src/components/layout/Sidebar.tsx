"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Users, Presentation, Link as LinkIcon, X } from 'lucide-react';

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: LayoutDashboard },
  { name: 'แผนสุขภาพดิจิทัล', href: '/strategies', icon: Target },
  { name: 'การประชุมคณะกรรมการ', href: '/meetings', icon: Presentation },
  { name: 'ข้อมูลคณะกรรมการ', href: '/members', icon: Users },
  { name: 'แหล่งข้อมูลและลิงก์', href: '/resources', icon: LinkIcon },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDesktop: boolean;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, isDesktop }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && !isDesktop && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-white border-r transition-transform duration-300 ease-in-out md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
          <h1 className="text-lg font-bold text-blue-700">Digital Health</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (!isDesktop) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} aria-hidden="true" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  );
}
