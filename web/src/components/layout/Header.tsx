import { Bell, User } from 'lucide-react';

export default function Header() {
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
        
        {/* User dropdown placeholder */}
        <div className="relative">
          <button className="flex items-center gap-2 rounded-full bg-gray-50 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <User className="h-5 w-5" />
            </div>
            <span className="hidden md:block font-medium text-gray-700 mr-2">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
