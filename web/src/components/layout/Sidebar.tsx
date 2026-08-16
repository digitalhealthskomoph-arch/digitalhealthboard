import Link from 'next/link';
import { LayoutDashboard, Target, Users, Presentation, Link as LinkIcon } from 'lucide-react';

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: LayoutDashboard },
  { name: 'แผนยุทธศาสตร์ 3 ปี', href: '/strategies', icon: Target },
  { name: 'การประชุมคณะกรรมการ', href: '/meetings', icon: Presentation },
  { name: 'ข้อมูลคณะกรรมการ', href: '/members', icon: Users },
  { name: 'แหล่งข้อมูลและลิงก์', href: '/resources', icon: LinkIcon },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <h1 className="text-lg font-bold text-blue-700">Digital Health Board</h1>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
