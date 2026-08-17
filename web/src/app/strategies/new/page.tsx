"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Target, Save, X, AlignLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewStrategyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year_start: new Date().getFullYear() + 543, // Default to current Thai year
    year_end: new Date().getFullYear() + 543 + 3
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('strategies')
        .insert([{
          name: formData.name,
          description: formData.description,
          year_start: Number(formData.year_start),
          year_end: Number(formData.year_end)
        }])
        .select()
        .single();

      if (err) throw err;
      
      router.push('/strategies');
      router.refresh();
      
    } catch (err: any) {
      console.error('Error creating strategy:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/strategies" className="hover:text-blue-600 transition-colors">แผนยุทธศาสตร์และตัวชี้วัด</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">เพิ่มแผนยุทธศาสตร์ใหม่</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-blue-50/50 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มแผนยุทธศาสตร์ใหม่</h1>
            <p className="text-sm text-gray-500">กำหนดกรอบยุทธศาสตร์สุขภาพดิจิทัลสำหรับใช้เป็นเป้าหมาย</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อยุทธศาสตร์ / เป้าประสงค์ *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="เช่น ยุทธศาสตร์ที่ 1: พัฒนาระบบสุขภาพดิจิทัลให้ครอบคลุม"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด / คำอธิบายเพิ่มเติม</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="พิมพ์รายละเอียดของยุทธศาสตร์..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่เริ่มต้น (พ.ศ.) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="year_start"
                    required
                    value={formData.year_start}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่สิ้นสุด (พ.ศ.) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="year_end"
                    required
                    value={formData.year_end}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Link 
                href="/strategies"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4" />
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกยุทธศาสตร์'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
