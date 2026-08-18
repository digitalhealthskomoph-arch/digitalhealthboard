"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Activity, Save, X, AlignLeft } from 'lucide-react';
import Link from 'next/link';

function KPIFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const strategyId = searchParams.get('strategy_id');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategyName, setStrategyName] = useState<string>('กำลังโหลด...');

  const [formData, setFormData] = useState({
    name: '',
    target_value: '',
    unit: '',
    current_value: '',
    baseline: '',
    status: 'on_track'
  });

  useEffect(() => {
    if (strategyId) {
      const fetchStrategy = async () => {
        const { data } = await supabase.from('strategies').select('name').eq('id', strategyId).single();
        if (data) setStrategyName(data.name);
      };
      fetchStrategy();
    } else {
      setStrategyName('ไม่มียุทธศาสตร์ที่เลือก');
    }
  }, [strategyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategyId) {
      setError('ไม่พบ ID ของยุทธศาสตร์ที่ต้องการเพิ่มตัวชี้วัด');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('kpis')
        .insert([{
          ...formData,
          strategy_id: strategyId
        }])
        .select()
        .single();

      if (err) throw err;
      
      router.push('/strategies');
      router.refresh();
      
    } catch (err: any) {
      console.error('Error creating KPI:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/strategies" className="hover:text-blue-600 transition-colors">แผนยุทธศาสตร์และตัวชี้วัด</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">เพิ่มตัวชี้วัดใหม่</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-blue-50/50 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มตัวชี้วัด (KPI)</h1>
            <p className="text-sm text-gray-500">ภายใต้ยุทธศาสตร์: <span className="font-medium text-blue-700">{strategyName}</span></p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อตัวชี้วัด *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="เช่น ระดับความสำเร็จของการพัฒนาระบบข้อมูลสุขภาพ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ค่าเป้าหมาย (Target) *</label>
                <input
                  type="text"
                  name="target_value"
                  required
                  value={formData.target_value}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="เช่น 100, ระดับ 5, มากกว่า 80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยนับ *</label>
                <input
                  type="text"
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="เช่น เปอร์เซ็นต์ (%), แห่ง, ระดับ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ข้อมูลฐาน (Baseline)</label>
                <input
                  type="text"
                  name="baseline"
                  value={formData.baseline}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ระบุค่าเริ่มต้นก่อนเริ่มยุทธศาสตร์ (ถ้ามี)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ผลงานปัจจุบัน</label>
                <input
                  type="text"
                  name="current_value"
                  value={formData.current_value}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ระบุผลงานล่าสุด (ปรับปรุงได้ในภายหลัง)"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะปัจจุบัน</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="on_track">ตามแผน (On Track)</option>
                  <option value="at_risk">เฝ้าระวัง (At Risk)</option>
                  <option value="behind">ล่าช้า (Behind Schedule)</option>
                  <option value="completed">บรรลุเป้าหมาย (Completed)</option>
                </select>
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
                disabled={loading || !strategyId}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกตัวชี้วัด'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function NewKPIPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Suspense fallback={<div className="p-8 text-center text-gray-500">กำลังโหลด...</div>}>
        <KPIFormContent />
      </Suspense>
    </div>
  );
}
