"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, Save, X, User } from 'lucide-react';
import Link from 'next/link';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    role: 'กรรมการ',
    order_ref: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('members')
        .insert([formData])
        .select()
        .single();

      if (err) throw err;
      
      router.push('/members');
      router.refresh();
      
    } catch (err: any) {
      console.error('Error creating member:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/members" className="hover:text-purple-600 transition-colors">ข้อมูลคณะกรรมการ</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">เพิ่มรายชื่อกรรมการ</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-purple-50/50 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มรายชื่อกรรมการ</h1>
            <p className="text-sm text-gray-500">บันทึกรายชื่อและบทบาทหน้าที่ในคณะทำงาน</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="เช่น นพ.สมชาย ใจดี"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่งทางบริหาร (ถ้ามี)</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="เช่น นายแพทย์สาธารณสุขจังหวัด"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บทบาทในคณะกรรมการ *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="ประธานกรรมการ">ประธานกรรมการ</option>
                  <option value="รองประธานกรรมการ">รองประธานกรรมการ</option>
                  <option value="กรรมการ">กรรมการ</option>
                  <option value="กรรมการและเลขานุการ">กรรมการและเลขานุการ</option>
                  <option value="กรรมการและผู้ช่วยเลขานุการ">กรรมการและผู้ช่วยเลขานุการ</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่คำสั่งอ้างอิง</label>
                <input
                  type="text"
                  name="order_ref"
                  value={formData.order_ref}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="เช่น คำสั่งจังหวัดสระแก้ว ที่ 123/2569"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Link 
                href="/members"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <X className="w-4 h-4" />
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกรายชื่อ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
