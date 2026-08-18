"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Folder, Save, X, Link as LinkIcon, Type, AlignLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewResourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate URL
    let submitUrl = formData.url;
    if (!submitUrl.startsWith('http://') && !submitUrl.startsWith('https://')) {
      submitUrl = 'https://' + submitUrl;
    }

    try {
      const { data, error: err } = await supabase
        .from('resources')
        .insert([{ ...formData, url: submitUrl }])
        .select()
        .single();

      if (err) throw err;
      
      router.push('/resources');
      router.refresh();
      
    } catch (err: any) {
      console.error('Error creating resource:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/resources" className="hover:text-orange-600 transition-colors">แหล่งรวบรวมข้อมูล</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">เพิ่มแหล่งข้อมูลใหม่</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-orange-50/50 flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มแหล่งข้อมูล / ลิงก์ใหม่</h1>
            <p className="text-sm text-gray-500">บันทึกหน้าแดชบอร์ด เอกสาร หรือเว็บไซต์ที่เกี่ยวข้องเข้าสู่ระบบส่วนกลาง</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเรียก / หัวข้อ *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="เช่น แดชบอร์ดสรุปผลการเบิกจ่ายงบประมาณ"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL / ลิงก์ *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="url"
                    required
                    value={formData.url}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                >
                  <option value="dashboard">แดชบอร์ดสรุปผล</option>
                  <option value="database">ระบบฐานข้อมูล</option>
                  <option value="document">เอกสารอ้างอิง</option>
                  <option value="general">ลิงก์และข้อมูลทั่วไป</option>
                </select>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายเพิ่มเติม (ถ้ามี)</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="ใส่คำอธิบายสั้นๆ เกี่ยวกับแหล่งข้อมูลนี้..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Link 
                href="/resources"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <X className="w-4 h-4" />
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
