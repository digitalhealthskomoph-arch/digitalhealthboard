"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

export default function TabVision({ planData, onUpdate }: { planData: any, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vision: planData?.vision || '',
    vision_definition: planData?.vision_definition || '',
    missions: planData?.missions || []
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('strategic_plans')
        .update({
          vision: formData.vision,
          vision_definition: formData.vision_definition,
          missions: formData.missions
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

  const updateMission = (index: number, value: string) => {
    const newMissions = [...formData.missions];
    newMissions[index] = value;
    setFormData(prev => ({ ...prev, missions: newMissions }));
  };

  const addMission = () => {
    setFormData(prev => ({ ...prev, missions: [...prev.missions, ''] }));
  };

  const removeMission = (index: number) => {
    const newMissions = [...formData.missions];
    newMissions.splice(index, 1);
    setFormData(prev => ({ ...prev, missions: newMissions }));
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">แก้ไขส่วนที่ 3 วิสัยทัศน์ และ พันธกิจ</h2>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 border rounded-md hover:bg-gray-50 flex items-center gap-1">
              <X className="w-4 h-4" /> ยกเลิก
            </button>
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-1">
              <Save className="w-4 h-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">3.1 วิสัยทัศน์ (Vision)</label>
          <input
            type="text"
            value={formData.vision}
            onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4 font-medium text-blue-900"
            placeholder="ระบุข้อความวิสัยทัศน์..."
          />
          
          <label className="block text-sm font-bold text-gray-900 mb-2">นิยามของวิสัยทัศน์</label>
          <textarea
            rows={4}
            value={formData.vision_definition}
            onChange={(e) => setFormData(prev => ({ ...prev, vision_definition: e.target.value }))}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="อธิบายความหมายของวิสัยทัศน์..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">3.2 พันธกิจ (Mission)</label>
          <div className="space-y-2 mb-3">
            {formData.missions.map((item: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateMission(idx, e.target.value)}
                  className="flex-1 border-gray-300 rounded-lg shadow-sm text-sm"
                  placeholder={`ข้อที่ ${idx + 1}`}
                />
                <button onClick={() => removeMission(idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addMission} className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
            <Plus className="w-4 h-4" /> เพิ่มพันธกิจ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">ส่วนที่ 3 วิสัยทัศน์ และ พันธกิจ</h2>
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="แก้ไขเนื้อหา"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 text-center shadow-sm">
        <h3 className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-4">วิสัยทัศน์ (Vision)</h3>
        {planData?.vision ? (
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 leading-tight mb-6">
            "{planData.vision}"
          </h2>
        ) : (
          <h2 className="text-xl font-bold text-gray-400 italic mb-6">ยังไม่ได้ระบุวิสัยทัศน์</h2>
        )}
        
        {planData?.vision_definition && (
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 font-semibold mb-2 text-left">นิยามวิสัยทัศน์:</p>
            <p className="text-gray-700 text-left whitespace-pre-wrap leading-relaxed text-sm bg-white/60 p-4 rounded-xl border border-white">
              {planData.vision_definition}
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-4">3.2 พันธกิจ (Mission)</h3>
        {planData?.missions && planData.missions.length > 0 ? (
          <div className="grid gap-3">
            {planData.missions.map((item: string, idx: number) => (
              <div key={idx} className="flex gap-4 items-start bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray-700 pt-1">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">ยังไม่ได้ระบุข้อมูล</p>
        )}
      </div>
      
      {/* Note: Objectives will be in Part 4 combined with strategies, or we can show them here if we fetch them */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mt-8">
        <h3 className="text-md font-bold text-orange-800 mb-2">3.3 เป้าประสงค์หลัก (Objectives)</h3>
        <p className="text-orange-700 text-sm">
          เป้าประสงค์จะถูกจัดโครงสร้างอยู่ภายใต้ยุทธศาสตร์ (ส่วนที่ 4) เพื่อแสดงความเชื่อมโยงของตัวชี้วัด (KPIs) ที่ใช้วัดผลแต่ละเป้าประสงค์ได้อย่างชัดเจน กรุณาดูในแท็บ "ส่วนที่ 4 ยุทธศาสตร์ & KPI"
        </p>
      </div>
    </div>
  );
}
