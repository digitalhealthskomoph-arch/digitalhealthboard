"use client";

import { useState } from 'react';
import { 
  Building2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Info, 
  X,
  Server,
  Layers,
  Calendar,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Hospital, 
  ITCategory, 
  HospitalITSystem, 
  HospitalCategoryStatus, 
  IT_CATEGORIES, 
  DEVELOPER_TYPES,
  DEPLOYMENT_TYPES 
} from '@/lib/it-inventory-data';
import CategoryIcon from './CategoryIcon';

interface MatrixDashboardViewProps {
  hospitals: Hospital[];
  systems: HospitalITSystem[];
  categoryStatuses: Record<string, HospitalCategoryStatus>;
  onExportExcel: () => void;
}

export default function MatrixDashboardView({
  hospitals,
  systems,
  categoryStatuses,
  onExportExcel,
}: MatrixDashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [inspectSystem, setInspectSystem] = useState<{ system: HospitalITSystem; hospital: Hospital; category: ITCategory } | null>(null);

  // Filter categories
  const filteredCategories = IT_CATEGORIES.filter((cat) => {
    if (selectedCatFilter !== 'all' && cat.id !== selectedCatFilter) return false;
    if (!searchTerm) return true;
    // Check if category name matches or any system in this category matches
    const catMatches = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const sysMatches = systems.some(
      (s) =>
        s.category_id === cat.id &&
        (s.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.vendor_name && s.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.sub_type_tag && s.sub_type_tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    return catMatches || sysMatches;
  });

  // Calculate stats
  const totalSystems = systems.length;
  const inHouseCount = systems.filter((s) => s.developer_type === 'in_house').length;
  const vendorCount = systems.filter((s) => s.developer_type === 'vendor').length;
  const centralCount = systems.filter((s) => s.developer_type === 'central').length;

  const surveyedHospitalsCount = hospitals.filter((hosp) => {
    const hasSys = systems.some((s) => s.hospital_id === hosp.id);
    const hasStatus = Object.keys(categoryStatuses).some((k) => k.startsWith(`${hosp.id}_`));
    return hasSys || hasStatus;
  }).length;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">โรงพยาบาลในจังหวัด</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{hospitals.length}</span>
            <span className="text-xs text-gray-500">แห่ง</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            สำรวจแล้ว {surveyedHospitalsCount} แห่ง ({Math.round((surveyedHospitalsCount / (hospitals.length || 1)) * 100)}%)
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">ระบบสารสนเทศทั้งหมด</span>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalSystems}</span>
            <span className="text-xs text-gray-500">ระบบที่ขึ้นทะเบียน</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            เฉลี่ย {hospitals.length ? (totalSystems / hospitals.length).toFixed(1) : 0} ระบบ/รพ.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">จ้างบริษัท vs พัฒนาเอง</span>
            <Server className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-700">{vendorCount}</span>
            <span className="text-xs text-gray-400">บ.</span>
            <span className="text-gray-300">/</span>
            <span className="text-lg font-bold text-emerald-600">{inHouseCount}</span>
            <span className="text-xs text-gray-400">ทำเอง</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            ส่วนกลางจัดหา: {centralCount} ระบบ
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">ระบบ HIS หลัก</span>
            <Building2 className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-base font-bold text-gray-900 truncate">
            {(() => {
              const hisSystems = systems.filter((s) => s.category_id === 'cat_his');
              if (hisSystems.length === 0) return 'อยู่ระหว่างสำรวจ';
              // Find most common
              const counts: Record<string, number> = {};
              hisSystems.forEach((s) => {
                const name = s.system_name.toUpperCase();
                counts[name] = (counts[name] || 0) + 1;
              });
              const topName = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
              return `${topName} (${counts[topName]} รพ.)`;
            })()}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            ครอบคลุม {systems.filter((s) => s.category_id === 'cat_his').length} / {hospitals.length} รพ.
          </p>
        </div>
      </div>

      {/* Filter Bar & Export Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อระบบ, บริษัท, หรือหมวดหมู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter Dropdown */}
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">ทุกหมวดหมู่ (10 หมวด)</option>
            {IT_CATEGORIES.map((cat, i) => (
              <option key={cat.id} value={cat.id}>
                {i + 1}. {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Export to Excel Button */}
        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs w-full sm:w-auto justify-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          ส่งออกเป็น Excel (CSV)
        </button>
      </div>

      {/* Interactive Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200">
                <th className="p-4 font-bold text-gray-900 w-64 sticky left-0 bg-gray-50 z-20 shadow-sm">
                  หมวดหมู่ระบบสารสนเทศ
                </th>
                {hospitals.map((hosp, i) => (
                  <th key={hosp.id} className="p-3.5 font-bold text-gray-800 text-center min-w-[130px] border-l border-gray-200">
                    <div className="text-xs text-blue-600 font-semibold">{hosp.short_name}</div>
                    <div className="text-[11px] text-gray-400 font-normal">อ.{hosp.district}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat, catIdx) => (
                <tr key={cat.id} className="hover:bg-blue-50/20 transition-colors">
                  {/* Category Name (Sticky Column) */}
                  <td className="p-4 sticky left-0 bg-white z-10 border-r border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50 border ${cat.borderColor} ${cat.color} shrink-0 mt-0.5`}>
                        <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-xs">
                          {catIdx + 1}. {cat.name}
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {cat.subtitle}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 9 Hospitals Cells */}
                  {hospitals.map((hosp) => {
                    const statusKey = `${hosp.id}_${cat.id}`;
                    const statusObj = categoryStatuses[statusKey];
                    const catStatus = statusObj?.status || 'has_system';
                    const catSystems = systems.filter(
                      (s) => s.hospital_id === hosp.id && s.category_id === cat.id
                    );

                    return (
                      <td key={hosp.id} className="p-2.5 text-center border-l border-gray-100 align-top">
                        {catStatus === 'no_system' ? (
                          <span className="inline-block text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-500 font-medium border border-gray-200">
                            ไม่มีระบบ (ทำมือ)
                          </span>
                        ) : catStatus === 'in_procurement' ? (
                          <span className="inline-block text-[10px] px-2 py-1 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                            อยู่ระหว่างจัดหา
                          </span>
                        ) : catSystems.length > 0 ? (
                          <div className="space-y-1.5">
                            {catSystems.map((sys) => {
                              const devColor =
                                sys.developer_type === 'in_house'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : sys.developer_type === 'central'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';

                              return (
                                <button
                                  key={sys.id}
                                  onClick={() =>
                                    setInspectSystem({
                                      system: sys,
                                      hospital: hosp,
                                      category: cat,
                                    })
                                  }
                                  className={`w-full text-left text-[11px] p-1.5 rounded-lg border font-semibold block transition-colors shadow-2xs group ${devColor}`}
                                  title="คลิกเพื่อดูรายละเอียด"
                                >
                                  <div className="truncate font-bold">{sys.system_name}</div>
                                  {sys.vendor_name && (
                                    <div className="text-[10px] text-gray-500 truncate font-normal">
                                      {sys.vendor_name}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Detail Popover Modal */}
      {inspectSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  {inspectSystem.hospital.name}
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-1">
                  {inspectSystem.system.system_name}
                </h4>
                <p className="text-xs text-gray-500">
                  หมวด: {inspectSystem.category.name}
                </p>
              </div>
              <button
                onClick={() => setInspectSystem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
              {inspectSystem.system.sub_type_tag && (
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">ประเภทย่อย:</span>
                  <span className="font-semibold text-gray-800">
                    {inspectSystem.system.sub_type_tag}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">รูปแบบการพัฒนา:</span>
                <span className="font-semibold text-gray-800">
                  {DEVELOPER_TYPES.find((d) => d.value === inspectSystem.system.developer_type)?.label || 'จ้างบริษัท'}
                </span>
              </div>
              {inspectSystem.system.vendor_name && (
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">ผู้พัฒนา / บริษัท:</span>
                  <span className="font-semibold text-gray-800">
                    {inspectSystem.system.vendor_name}
                  </span>
                </div>
              )}
              {inspectSystem.system.go_live_year && (
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">ปีที่เริ่มขึ้นระบบ:</span>
                  <span className="font-semibold text-gray-800">
                    {inspectSystem.system.go_live_year}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">รูปแบบการติดตั้ง:</span>
                <span className="font-semibold text-gray-800">
                  {DEPLOYMENT_TYPES.find((d) => d.value === inspectSystem.system.deployment_type)?.label || 'On-Premise'}
                </span>
              </div>
              {inspectSystem.system.notes && (
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">หมายเหตุ:</span>
                  <p className="text-gray-800 bg-white p-2.5 rounded-lg border border-gray-200">
                    {inspectSystem.system.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectSystem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
