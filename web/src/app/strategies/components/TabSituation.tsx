"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

export default function TabSituation({ planData, onUpdate }: { planData: any, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    swot_s: planData?.swot_s || [],
    swot_w: planData?.swot_w || [],
    swot_o: planData?.swot_o || [],
    swot_t: planData?.swot_t || []
  });
  const [saving, setSaving] = useState(false);

  // Baseline data from KPIs
  const [baselineData, setBaselineData] = useState<any[]>([]);

  useEffect(() => {
    const fetchBaselines = async () => {
      const { data, error } = await supabase
        .from('kpis')
        .select(`
          name, 
          description,
          target_value,
          strategy_id,
          strategies(name)
        `)
        .not('description', 'is', null);
      if (!error && data) {
        setBaselineData(data);
      }
    };
    fetchBaselines();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('strategic_plans')
        .update({
          swot_s: formData.swot_s,
          swot_w: formData.swot_w,
          swot_o: formData.swot_o,
          swot_t: formData.swot_t
        })
        .eq('id', planData.id);
        
      if (error) throw error;
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const updateList = (type: 's'|'w'|'o'|'t', index: number, value: string) => {
    const key = `swot_${type}` as keyof typeof formData;
    const newList = [...formData[key]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [key]: newList }));
  };

  const addList = (type: 's'|'w'|'o'|'t') => {
    const key = `swot_${type}` as keyof typeof formData;
    setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeList = (type: 's'|'w'|'o'|'t', index: number) => {
    const key = `swot_${type}` as keyof typeof formData;
    const newList = [...formData[key]];
    newList.splice(index, 1);
    setFormData(prev => ({ ...prev, [key]: newList }));
  };

  const renderEditSwotList = (title: string, type: 's'|'w'|'o'|'t') => {
    const key = `swot_${type}` as keyof typeof formData;
    return (
      <div className="mb-6">
        <h4 className="font-bold text-gray-700 mb-2">{title}</h4>
        <div className="space-y-2 mb-2">
          {formData[key].map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateList(type, idx, e.target.value)}
                className="flex-1 border-gray-300 rounded-lg shadow-sm text-sm"
              />
              <button onClick={() => removeList(type, idx)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => addList(type)} className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
          <Plus className="w-4 h-4" /> เพิ่มข้อ
        </button>
      </div>
    );
  };

  const renderSwotList = (title: string, dataList: string[], colorClass: string) => {
    return (
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h4 className={`font-bold text-lg mb-3 ${colorClass}`}>{title}</h4>
        {dataList && dataList.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {dataList.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-gray-400 italic text-sm">ยังไม่มีข้อมูล</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 relative">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">ส่วนที่ 2 การวิเคราะห์สถานการณ์</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 flex items-center gap-1">
            <Edit2 className="w-4 h-4" /> แก้ไข SWOT
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 border rounded-md hover:bg-gray-50 flex items-center gap-1">
              <X className="w-4 h-4" /> ยกเลิก
            </button>
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-1">
              <Save className="w-4 h-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-4">2.1 ข้อมูลพื้นฐาน (Baseline Data)</h3>
        <p className="text-sm text-gray-500 mb-4">*ดึงข้อมูลสรุป Baseline ล่าสุดจากตัวชี้วัด (KPIs) โดยอัตโนมัติ</p>
        
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          {baselineData.length > 0 ? (
            <div className="space-y-4">
              {baselineData.map((kpi, idx) => {
                // Extract baseline from description text (temporary fallback since we added dictionary fields but old data used description)
                let bText = kpi.description;
                if (bText && bText.includes('Baseline:')) {
                  bText = bText.split('Baseline:')[1].split('\n')[0].trim();
                }
                return (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-1">{kpi.strategies?.name}</div>
                      <div className="font-medium text-gray-900 text-sm">{kpi.name}</div>
                    </div>
                    <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm whitespace-nowrap min-w-[150px]">
                      <span className="text-gray-500 text-xs block mb-0.5">Baseline</span>
                      <span className="font-semibold text-gray-800">{bText || '-'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <p className="text-gray-400 italic text-center py-4">ไม่พบข้อมูลตัวชี้วัด</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-4">2.2 การวิเคราะห์จุดแข็ง จุดอ่อน โอกาส และภัยคุกคาม (SWOT)</h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
            {renderEditSwotList('จุดแข็ง (Strengths)', 's')}
            {renderEditSwotList('จุดอ่อน (Weaknesses)', 'w')}
            {renderEditSwotList('โอกาส (Opportunities)', 'o')}
            {renderEditSwotList('อุปสรรค/ภัยคุกคาม (Threats)', 't')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSwotList('S - Strengths (จุดแข็ง)', planData?.swot_s, 'text-green-600')}
            {renderSwotList('W - Weaknesses (จุดอ่อน)', planData?.swot_w, 'text-orange-600')}
            {renderSwotList('O - Opportunities (โอกาส)', planData?.swot_o, 'text-blue-600')}
            {renderSwotList('T - Threats (อุปสรรค)', planData?.swot_t, 'text-red-600')}
          </div>
        )}
      </div>

    </div>
  );
}
