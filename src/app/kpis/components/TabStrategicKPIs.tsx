"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Target, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function TabStrategicKPIs() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const [stratRes, objRes, kpiRes] = await Promise.all([
        supabase.from('strategies').select('*').order('order_index', { ascending: true }).order('name'),
        supabase.from('objectives').select('*').order('order_index', { ascending: true }).order('created_at'),
        supabase.from('kpis').select('*').order('order_index', { ascending: true }).order('created_at')
      ]);

      if (stratRes.data) setStrategies(stratRes.data);
      if (objRes.data) setObjectives(objRes.data);
      if (kpiRes.data) setKpis(kpiRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredKpis = kpis.filter((k) => {
    if (selectedStrategy !== 'all' && k.strategy_id !== selectedStrategy) return false;
    if (!searchQuery) return true;
    return k.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const readyCount = kpis.filter((k) => k.readiness_status === 'พร้อมวัด').length;
  const inProgressCount = kpis.length - readyCount;

  if (loading) {
    return <div className="py-16 text-center text-gray-500 text-sm">กำลังโหลดตัวชี้วัดตามยุทธศาสตร์...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">ตัวชี้วัดยุทธศาสตร์ทั้งหมด</span>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{kpis.length} ตัวชี้วัด</div>
          <p className="text-xs text-gray-400 mt-1">กระจายอยู่ใน {strategies.length} ยุทธศาสตร์หลัก</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold">สถานะพร้อมจัดเก็บ</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{readyCount} ตัวชี้วัด</div>
          <p className="text-xs text-emerald-600/80 mt-1">
            คิดเป็น {kpis.length ? Math.round((readyCount / kpis.length) * 100) : 0}% ของตัวชี้วัดทั้งหมด
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold">อยู่ระหว่างเตรียมการ/พัฒนา</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{inProgressCount} ตัวชี้วัด</div>
          <p className="text-xs text-amber-600/80 mt-1">อยู่ระหว่างจัดทำ Data Dictionary / ระบบดึงข้อมูล</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อตัวชี้วัด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">ทุกยุทธศาสตร์ ({strategies.length} ยุทธศาสตร์)</option>
            {strategies.map((s, idx) => (
              <option key={s.id} value={s.id}>
                ยุทธศาสตร์ที่ {idx + 1}: {s.name}
              </option>
            ))}
          </select>
        </div>

        <Link
          href="/strategies"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          จัดการ Data Dictionary ในเล่มแผน &rarr;
        </Link>
      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-5 py-3.5 font-bold">ชื่อตัวชี้วัด</th>
                <th className="px-4 py-3.5 font-bold text-center w-28">ความพร้อม</th>
                <th className="px-4 py-3.5 font-bold text-center w-24">เป้า 2570</th>
                <th className="px-4 py-3.5 font-bold text-center w-24">เป้า 2571</th>
                <th className="px-4 py-3.5 font-bold text-center w-24">เป้า 2572</th>
                <th className="px-4 py-3.5 font-bold text-center w-28">ผลงานล่าสุด</th>
                <th className="px-4 py-3.5 font-bold text-center w-24">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredKpis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    ไม่พบตัวชี้วัดตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredKpis.map((kpi) => {
                  const strat = strategies.find((s) => s.id === kpi.strategy_id);
                  const obj = objectives.find((o) => o.id === kpi.objective_id);

                  return (
                    <tr key={kpi.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{kpi.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          {strat && (
                            <span className="font-medium text-blue-600">{strat.name}</span>
                          )}
                          {obj && (
                            <>
                              <span>&bull;</span>
                              <span className="truncate max-w-[200px]">{obj.name}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium ${
                            kpi.readiness_status === 'พร้อมวัด'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {kpi.readiness_status || 'ไม่ระบุ'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-medium text-gray-700">
                        {kpi.target_2570 || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-medium text-gray-700">
                        {kpi.target_2571 || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-medium text-gray-700">
                        {kpi.target_2572 || '-'}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-gray-900">
                          {kpi.current_value || '-'}
                        </span>
                        {kpi.unit && (
                          <span className="text-xs text-gray-500 ml-1">{kpi.unit}</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                            kpi.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : kpi.status === 'at_risk'
                              ? 'bg-amber-100 text-amber-800'
                              : kpi.status === 'behind'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {kpi.status === 'completed'
                            ? 'บรรลุเป้าหมาย'
                            : kpi.status === 'at_risk'
                            ? 'เฝ้าระวัง'
                            : kpi.status === 'behind'
                            ? 'ล่าช้า'
                            : 'ตามแผน'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
