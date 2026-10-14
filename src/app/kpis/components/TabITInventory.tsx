"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  Layers, 
  FileSpreadsheet, 
  Edit3, 
  LayoutGrid, 
  AlertCircle, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { 
  Hospital, 
  ITCategory, 
  HospitalITSystem, 
  HospitalCategoryStatus, 
  DEFAULT_HOSPITALS, 
  IT_CATEGORIES 
} from '@/lib/it-inventory-data';
import HospitalEntryView from './HospitalEntryView';
import MatrixDashboardView from './MatrixDashboardView';

export default function TabITInventory() {
  const [viewMode, setViewMode] = useState<'entry' | 'matrix'>('entry');
  const [loading, setLoading] = useState(true);
  const [tableMissingWarning, setTableMissingWarning] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>(DEFAULT_HOSPITALS);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(DEFAULT_HOSPITALS[0].id);
  const [systems, setSystems] = useState<HospitalITSystem[]>([]);
  const [categoryStatuses, setCategoryStatuses] = useState<Record<string, HospitalCategoryStatus>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setTableMissingWarning(false);
    try {
      // 1. Fetch hospitals
      const { data: hospData, error: hospErr } = await supabase
        .from('hospitals')
        .select('*')
        .order('order_index', { ascending: true });

      if (hospErr) {
        console.warn('Could not query hospitals table:', hospErr.message);
        setTableMissingWarning(true);
        // Fallback to default hospitals
        setHospitals(DEFAULT_HOSPITALS);
        setSelectedHospitalId(DEFAULT_HOSPITALS[0].id);
      } else if (hospData && hospData.length > 0) {
        setHospitals(hospData);
        setSelectedHospitalId(hospData[0].id);
      } else {
        // Table exists but empty -> Auto-seed default 9 hospitals
        const seedPayload = DEFAULT_HOSPITALS.map((h, idx) => ({
          name: h.name,
          short_name: h.short_name,
          district: h.district,
          order_index: idx + 1,
        }));
        const { data: seeded, error: seedErr } = await supabase
          .from('hospitals')
          .insert(seedPayload)
          .select();
        if (!seedErr && seeded && seeded.length > 0) {
          setHospitals(seeded);
          setSelectedHospitalId(seeded[0].id);
        } else {
          setHospitals(DEFAULT_HOSPITALS);
          setSelectedHospitalId(DEFAULT_HOSPITALS[0].id);
        }
      }

      // 2. Fetch Systems
      const { data: sysData, error: sysErr } = await supabase
        .from('hospital_it_systems')
        .select('*')
        .order('created_at', { ascending: true });

      if (!sysErr && sysData) {
        setSystems(sysData);
      }

      // 3. Fetch Category Statuses
      const { data: statusData, error: statusErr } = await supabase
        .from('hospital_it_category_status')
        .select('*');

      if (!statusErr && statusData) {
        const map: Record<string, HospitalCategoryStatus> = {};
        statusData.forEach((st) => {
          map[`${st.hospital_id}_${st.category_id}`] = st;
        });
        setCategoryStatuses(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Save Hospital Contact Info
  const handleSaveContact = async (hospitalId: string, contactName: string, contactPhone: string) => {
    // Optimistic UI update
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === hospitalId ? { ...h, contact_name: contactName, contact_phone: contactPhone } : h
      )
    );

    try {
      const { error } = await supabase
        .from('hospitals')
        .update({ contact_name: contactName, contact_phone: contactPhone, updated_at: new Date().toISOString() })
        .eq('id', hospitalId);
      if (error) throw error;
    } catch (err) {
      console.error('Error saving contact info:', err);
    }
  };

  // Handler: Update Category Status (has_system, no_system, in_procurement)
  const handleUpdateCategoryStatus = async (
    hospitalId: string,
    categoryId: string,
    status: 'has_system' | 'no_system' | 'in_procurement',
    notes?: string
  ) => {
    const key = `${hospitalId}_${categoryId}`;
    const newStatus: HospitalCategoryStatus = {
      hospital_id: hospitalId,
      category_id: categoryId,
      status,
      notes,
    };

    setCategoryStatuses((prev) => ({
      ...prev,
      [key]: newStatus,
    }));

    try {
      const { error } = await supabase
        .from('hospital_it_category_status')
        .upsert(
          [
            {
              hospital_id: hospitalId,
              category_id: categoryId,
              status,
              notes,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'hospital_id,category_id' }
        );
      if (error) throw error;
    } catch (err) {
      console.error('Error updating category status:', err);
    }
  };

  // Handler: Save System (Add or Update)
  const handleSaveSystem = async (systemData: Partial<HospitalITSystem>) => {
    try {
      if (systemData.id) {
        // Update existing
        const { error } = await supabase
          .from('hospital_it_systems')
          .update({
            ...systemData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', systemData.id);
        if (error) throw error;

        setSystems((prev) =>
          prev.map((s) => (s.id === systemData.id ? ({ ...s, ...systemData } as HospitalITSystem) : s))
        );
      } else {
        // Insert new
        const newSysPayload = {
          hospital_id: selectedHospitalId,
          category_id: systemData.category_id!,
          system_name: systemData.system_name!,
          sub_type_tag: systemData.sub_type_tag || null,
          developer_type: systemData.developer_type || 'vendor',
          vendor_name: systemData.vendor_name || null,
          go_live_year: systemData.go_live_year || null,
          deployment_type: systemData.deployment_type || 'on_premise',
          notes: systemData.notes || null,
        };

        const { data, error } = await supabase
          .from('hospital_it_systems')
          .insert([newSysPayload])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSystems((prev) => [...prev, data]);
        }
      }

      // Also ensure category status is marked as 'has_system'
      if (systemData.category_id) {
        handleUpdateCategoryStatus(selectedHospitalId, systemData.category_id, 'has_system');
      }
    } catch (err: any) {
      console.error('Error saving system:', err);
      // If table doesn't exist, update local state for preview
      if (err.message && err.message.includes('relation') || tableMissingWarning) {
        const mockItem: HospitalITSystem = {
          id: 'temp-' + Date.now(),
          hospital_id: selectedHospitalId,
          category_id: systemData.category_id!,
          system_name: systemData.system_name!,
          sub_type_tag: systemData.sub_type_tag,
          developer_type: systemData.developer_type as any || 'vendor',
          vendor_name: systemData.vendor_name,
          go_live_year: systemData.go_live_year,
          deployment_type: systemData.deployment_type as any || 'on_premise',
          notes: systemData.notes,
        };
        setSystems((prev) => [...prev, mockItem]);
      } else {
        throw err;
      }
    }
  };

  // Handler: Delete System
  const handleDeleteSystem = async (systemId: string) => {
    setSystems((prev) => prev.filter((s) => s.id !== systemId));
    try {
      const { error } = await supabase.from('hospital_it_systems').delete().eq('id', systemId);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting system:', err);
    }
  };

  // Handler: Export Matrix to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = [
      'ลำดับ',
      'หมวดหมู่ระบบสารสนเทศ',
      ...hospitals.map((h) => `${h.name} (${h.short_name})`),
    ];

    const rows: string[][] = [];

    IT_CATEGORIES.forEach((cat, idx) => {
      const row = [
        (idx + 1).toString(),
        `"${cat.name.replace(/"/g, '""')}"`,
      ];

      hospitals.forEach((hosp) => {
        const catStatus = categoryStatuses[`${hosp.id}_${cat.id}`]?.status;
        const catSystems = systems.filter(
          (s) => s.hospital_id === hosp.id && s.category_id === cat.id
        );

        if (catStatus === 'no_system') {
          row.push('"ยังไม่มีระบบ (ทำมือ)"');
        } else if (catStatus === 'in_procurement') {
          row.push('"อยู่ระหว่างจัดหา"');
        } else if (catSystems.length > 0) {
          const sysDetails = catSystems
            .map((s) => {
              const dev = s.developer_type === 'in_house' ? 'พัฒนาเอง' : s.developer_type === 'central' ? 'ส่วนกลาง' : 'บริษัท';
              const vendor = s.vendor_name ? ` (${s.vendor_name})` : '';
              const year = s.go_live_year ? ` [ปี ${s.go_live_year}]` : '';
              return `${s.system_name}${vendor} - ${dev}${year}`;
            })
            .join(' | ');
          row.push(`"${sysDetails.replace(/"/g, '""')}"`);
        } else {
          row.push('"-"');
        }
      });

      rows.push(row);
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ทะเบียนระบบสารสนเทศ_9รพ_สระแก้ว_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySqlNotice = () => {
    navigator.clipboard.writeText('psql < schema_it_inventory.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm font-medium">กำลังโหลดข้อมูลทะเบียนระบบสารสนเทศ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notice if tables are newly created or missing */}
      {tableMissingWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">ยังไม่พบบางตารางในฐานข้อมูล Supabase:</span> ระบบกำลังแสดงผลตัวอย่าง (Mock Preview)
              <p className="text-xs text-amber-700 mt-0.5">
                กรุณารันคำสั่งในไฟล์ <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-900">schema_it_inventory.sql</code> ใน Supabase SQL Editor เพื่อเปิดใช้งานการบันทึกข้อมูลถาวร
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> ตรวจสอบตารางใหม่
          </button>
        </div>
      )}

      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode('entry')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'entry'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            บันทึกข้อมูลราย รพ.
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'matrix'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            ภาพรวมเปรียบเทียบ 9 รพ. (Matrix)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            ส่งออก Excel
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === 'entry' ? (
        <HospitalEntryView
          hospitals={hospitals}
          selectedHospitalId={selectedHospitalId}
          onSelectHospital={setSelectedHospitalId}
          systems={systems}
          categoryStatuses={categoryStatuses}
          onSaveContact={handleSaveContact}
          onUpdateCategoryStatus={handleUpdateCategoryStatus}
          onSaveSystem={handleSaveSystem}
          onDeleteSystem={handleDeleteSystem}
        />
      ) : (
        <MatrixDashboardView
          hospitals={hospitals}
          systems={systems}
          categoryStatuses={categoryStatuses}
          onExportExcel={handleExportExcel}
        />
      )}
    </div>
  );
}
