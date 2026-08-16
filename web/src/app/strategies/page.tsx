import { supabase } from '@/lib/supabase';
import { Target, Plus, AlertCircle, Edit2, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StrategiesPage() {
  // Fetch strategies with nested KPIs
  // Because we are using placeholders for env vars, this might fail or return nothing.
  // We'll wrap it in a try-catch for robustness in this mock stage.
  
  let strategies: any[] = [];
  let errorMsg = null;
  
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select(`
        *,
        kpis (*)
      `)
      .order('year_start', { ascending: true });
      
    if (error) throw error;
    strategies = data || [];
  } catch (err: any) {
    console.error('Supabase fetch error:', err);
    errorMsg = err.message || 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ โปรดตรวจสอบการตั้งค่า .env.local';
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            แผนยุทธศาสตร์สุขภาพดิจิทัล 3 ปี
          </h1>
          <p className="text-gray-500 mt-1">จัดการแผนยุทธศาสตร์และตัวชี้วัด (KPI Dictionary)</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            เพิ่มแผนยุทธศาสตร์
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-medium">ข้อผิดพลาดในการดึงข้อมูล</h3>
              <p className="text-red-700 text-sm mt-1">{errorMsg}</p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                คำแนะนำ: โปรดรันสคริปต์ supabase_schema.sql ใน Supabase และนำค่า URL, Anon Key มาใส่ในไฟล์ .env.local
              </p>
            </div>
          </div>
        </div>
      )}

      {!errorMsg && strategies.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">ยังไม่มีข้อมูลแผนยุทธศาสตร์</h3>
          <p className="text-gray-500 mt-1">เริ่มต้นสร้างแผนยุทธศาสตร์ใหม่เพื่อกำหนดทิศทางและตัวชี้วัด</p>
          <button className="mt-6 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            เพิ่มแผนยุทธศาสตร์แรก
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{strategy.name}</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      ปี {strategy.year_start} - {strategy.year_end}
                    </span>
                  </div>
                  {strategy.description && (
                    <p className="text-gray-600 text-sm mt-1">{strategy.description}</p>
                  )}
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors" title="แก้ไข">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors" title="ลบ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">ตัวชี้วัด (KPIs)</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" /> เพิ่มตัวชี้วัด
                  </button>
                </div>
                
                {(!strategy.kpis || strategy.kpis.length === 0) ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">ยังไม่มีตัวชี้วัดในยุทธศาสตร์นี้</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-medium">ชื่อตัวชี้วัด</th>
                          <th className="px-4 py-3 font-medium">เป้าหมาย</th>
                          <th className="px-4 py-3 font-medium">หน่วยนับ</th>
                          <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {strategy.kpis.map((kpi: any) => (
                          <tr key={kpi.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{kpi.name}</td>
                            <td className="px-4 py-3 text-gray-600">{kpi.target_value}</td>
                            <td className="px-4 py-3 text-gray-600">{kpi.unit}</td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-gray-400 hover:text-blue-600 mr-3">แก้ไข</button>
                              <button className="text-gray-400 hover:text-red-600">ลบ</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
