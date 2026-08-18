"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Download, FileText, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('role', { ascending: true }); // Ideally we'd sort by a specific order index
          
        if (!error && data) {
          setMembers(data);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('คุณต้องการลบรายชื่อกรรมการท่านนี้ใช่หรือไม่?')) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // Basic grouping by role (mock logic, in real life you might want an order column)
  const groupedMembers = members.reduce((acc: any, member: any) => {
    const role = member.role || 'กรรมการ';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {});

  const orderOfRoles = ['ประธานกรรมการ', 'รองประธานกรรมการ', 'กรรมการ', 'กรรมการและเลขานุการ', 'กรรมการและผู้ช่วยเลขานุการ'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            ข้อมูลคณะกรรมการ
          </h1>
          <p className="text-gray-500 mt-1">รายชื่อคณะกรรมการสุขภาพดิจิทัลและคำสั่งแต่งตั้ง</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            คำสั่งแต่งตั้ง
          </button>
          {user && (
            <Link href="/members/new" className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors">
              <UserPlus className="w-4 h-4" />
              เพิ่มกรรมการ
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="ค้นหารายชื่อ หรือตำแหน่ง..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">ยังไม่มีรายชื่อคณะกรรมการ</h3>
            <p className="text-gray-500 mt-1">โปรดเพิ่มข้อมูลรายชื่อคณะกรรมการเข้าระบบ</p>
          </div>
        ) : (
          <div className="p-0">
            {orderOfRoles.map((roleTitle) => {
              const roleMembers = groupedMembers[roleTitle];
              if (!roleMembers || roleMembers.length === 0) return null;
              
              return (
                <div key={roleTitle} className="border-b border-gray-100 last:border-0">
                  <div className="bg-purple-50/50 px-6 py-3 border-b border-purple-100">
                    <h3 className="text-sm font-bold text-purple-800">{roleTitle}</h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {roleMembers.map((member: any) => (
                      <li key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {member.order_ref && (
                            <span className="hidden sm:inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md">
                              อ้างอิง: {member.order_ref}
                            </span>
                          )}
                          {user && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">ลบ</button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {/* Catch-all for roles that weren't in our preset order array */}
            {Object.keys(groupedMembers).filter(r => !orderOfRoles.includes(r)).map((roleTitle) => (
               <div key={roleTitle} className="border-b border-gray-100 last:border-0">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700">{roleTitle}</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {groupedMembers[roleTitle].map((member: any) => (
                    <li key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                      </div>
                      {user && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">ลบ</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Document Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          เอกสารที่เกี่ยวข้อง
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
            <div className="bg-red-100 p-2 rounded text-red-600 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">คำสั่งแต่งตั้งคณะกรรมการสุขภาพดิจิทัล.pdf</p>
              <p className="text-xs text-gray-500 mt-1">อัปเดตเมื่อ: 10 ม.ค. 2569</p>
            </div>
          </div>
          
          {user && (
            <button className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-500 hover:text-blue-600">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">อัปโหลดเอกสารอ้างอิง</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
