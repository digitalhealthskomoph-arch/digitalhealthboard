"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

export default function TabIntroduction({ planData, onUpdate }: { planData: any, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rationale: planData?.rationale || '',
    alignment: planData?.alignment || '',
    scope: planData?.scope || []
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('strategic_plans')
        .update({
          rationale: formData.rationale,
          alignment: formData.alignment,
          scope: formData.scope
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

  const addScope = () => {
    setFormData(prev => ({ ...prev, scope: [...prev.scope, ''] }));
  };

  const updateScope = (index: number, value: string) => {
    const newScope = [...formData.scope];
    newScope[index] = value;
    setFormData(prev => ({ ...prev, scope: newScope }));
  };

  const removeScope = (index: number) => {
    const newScope = [...formData.scope];
    newScope.splice(index, 1);
    setFormData(prev => ({ ...prev, scope: newScope }));
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">แก้ไขส่วนที่ 1 บทนำ</h2>
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
          <label className="block text-sm font-bold text-gray-900 mb-2">1.1 หลักการและเหตุผล</label>
          <textarea
            rows={6}
            value={formData.rationale}
            onChange={(e) => setFormData(prev => ({ ...prev, rationale: e.target.value }))}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ระบุหลักการและเหตุผล..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">1.2 ขอบเขตของแผน</label>
          <div className="space-y-2 mb-3">
            {formData.scope.map((item: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateScope(idx, e.target.value)}
                  className="flex-1 border-gray-300 rounded-lg shadow-sm text-sm"
                  placeholder={`ข้อที่ ${idx + 1}`}
                />
                <button onClick={() => removeScope(idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addScope} className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
            <Plus className="w-4 h-4" /> เพิ่มขอบเขต
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">1.3 ความสอดคล้องกับนโยบายและยุทธศาสตร์ระดับบน</label>
          <textarea
            rows={5}
            value={formData.alignment}
            onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ระบุความสอดคล้อง..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <button 
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="แก้ไขเนื้อหา"
      >
        <Edit2 className="w-5 h-5" />
      </button>

      <div>
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-3">1.1 หลักการและเหตุผล</h3>
        {planData?.rationale ? (
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-justify indent-8">
            {planData.rationale}
          </div>
        ) : (
          <p className="text-gray-400 italic">ยังไม่ได้ระบุข้อมูล</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-3">1.2 ขอบเขตของแผน</h3>
        {planData?.scope && planData.scope.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            {planData.scope.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">ยังไม่ได้ระบุข้อมูล</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-3">1.3 ความสอดคล้องกับนโยบาย</h3>
        {planData?.alignment ? (
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-justify indent-8">
            {planData.alignment}
          </div>
        ) : (
          <p className="text-gray-400 italic">ยังไม่ได้ระบุข้อมูล</p>
        )}
      </div>
    </div>
  );
}
