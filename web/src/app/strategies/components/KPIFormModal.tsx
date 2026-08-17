"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Trash2 } from 'lucide-react';

export default function KPIFormModal({ kpiId, strategyId, objectiveId, onClose }: { kpiId: string | null, strategyId: string, objectiveId: string | null, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    readiness_status: 'พร้อมวัด',
    op_definition: '',
    calc_formula: '',
    numerator: '',
    denominator: '',
    inclusion_criteria: '',
    exclusion_criteria: '',
    data_source: '',
    extraction_method: '',
    cutoff_date: '',
    frequency: '',
    responsible_person: '',
    target_2570: '',
    target_2571: '',
    target_2572: '',
    reason: '',
    precautions: '',
    risk_distortion: '',
    prerequisites: ''
  });

  useEffect(() => {
    if (kpiId) {
      fetchKpi();
    }
  }, [kpiId]);

  const fetchKpi = async () => {
    try {
      const { data } = await supabase.from('kpis').select('*').eq('id', kpiId).single();
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          readiness_status: data.readiness_status || 'พร้อมวัด',
          op_definition: data.op_definition || '',
          calc_formula: data.calc_formula || '',
          numerator: data.numerator || '',
          denominator: data.denominator || '',
          inclusion_criteria: data.inclusion_criteria || '',
          exclusion_criteria: data.exclusion_criteria || '',
          data_source: data.data_source || '',
          extraction_method: data.extraction_method || '',
          cutoff_date: data.cutoff_date || '',
          frequency: data.frequency || '',
          responsible_person: data.responsible_person || '',
          target_2570: data.target_2570 || '',
          target_2571: data.target_2571 || '',
          target_2572: data.target_2572 || data.target_value || '', // fallback to old target_value
          reason: data.reason || '',
          precautions: data.precautions || '',
          risk_distortion: data.risk_distortion || '',
          prerequisites: data.prerequisites || ''
        });
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        strategy_id: strategyId,
        objective_id: objectiveId
      };
      
      if (kpiId) {
        await supabase.from('kpis').update(payload).eq('id', kpiId);
      } else {
        await supabase.from('kpis').insert([payload]);
      }
      onClose();
    } catch (err) {
      alert("Error saving KPI");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(!confirm("ลบตัวชี้วัดนี้หรือไม่?")) return;
    try {
      await supabase.from('kpis').delete().eq('id', kpiId);
      onClose();
    } catch (e) { alert("Error deleting KPI"); }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50/50 rounded-t-xl shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{kpiId ? 'Data Dictionary (แก้ไข)' : 'สร้างตัวชี้วัดใหม่ (Data Dictionary)'}</h2>
            <p className="text-sm text-gray-500">บันทึกรายละเอียดตัวชี้วัดเชิงลึก</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="space-y-8">
            
            {/* ข้อมูลพื้นฐาน */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-blue-900">1. ข้อมูลทั่วไป</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อตัวชี้วัด</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะความพร้อมวัด</label>
                  <select name="readiness_status" value={formData.readiness_status} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm">
                    <option value="พร้อมวัด">พร้อมวัด</option>
                    <option value="สร้างใหม่">สร้างใหม่</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                  <input name="responsible_person" value={formData.responsible_person} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">นิยามเชิงปฏิบัติการ (Operational Definition)</label>
                  <textarea name="op_definition" rows={3} value={formData.op_definition} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </section>

            {/* การคำนวณ */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-blue-900">2. สูตรและการคำนวณ</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สูตรคำนวณ (Calculation Formula)</label>
                  <input name="calc_formula" value={formData.calc_formula} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" placeholder="เช่น (A / B) * 100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ตัวตั้ง (Numerator)</label>
                    <textarea name="numerator" rows={2} value={formData.numerator} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ตัวหาร (Denominator)</label>
                    <textarea name="denominator" rows={2} value={formData.denominator} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เกณฑ์นับเข้า (Inclusion Criteria)</label>
                    <textarea name="inclusion_criteria" rows={2} value={formData.inclusion_criteria} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เกณฑ์นับออก (Exclusion Criteria)</label>
                    <textarea name="exclusion_criteria" rows={2} value={formData.exclusion_criteria} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </section>

            {/* การเก็บข้อมูล */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-blue-900">3. การเก็บข้อมูล</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">แหล่งข้อมูล (Data Source)</label>
                  <input name="data_source" value={formData.data_source} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วิธีดึงข้อมูล (Extraction Method)</label>
                  <input name="extraction_method" value={formData.extraction_method} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความถี่การวัด (Frequency)</label>
                  <input name="frequency" value={formData.frequency} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" placeholder="เช่น รายเดือน, รายไตรมาส" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันตัดข้อมูล (Cut-off Date)</label>
                  <input name="cutoff_date" value={formData.cutoff_date} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" placeholder="เช่น ทุกวันที่ 5 ของเดือนถัดไป" />
                </div>
              </div>
            </section>

            {/* เป้าหมาย */}
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-blue-900">4. เป้าหมาย</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เป้าปี 2570</label>
                  <input name="target_2570" value={formData.target_2570} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เป้าปี 2571</label>
                  <input name="target_2571" value={formData.target_2571} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เป้าปี 2572</label>
                  <input name="target_2572" value={formData.target_2572} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผล (Reason)</label>
                  <textarea name="reason" rows={2} value={formData.reason} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ข้อควรระวัง (Precautions)</label>
                  <textarea name="precautions" rows={2} value={formData.precautions} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความเสี่ยงตัวเลขบิดเบือน</label>
                  <textarea name="risk_distortion" rows={2} value={formData.risk_distortion} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">สิ่งที่ต้องทำก่อนจึงจะวัดได้ (Prerequisites)</label>
                  <textarea name="prerequisites" rows={2} value={formData.prerequisites} onChange={handleChange} className="w-full border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50/50 shrink-0">
          {kpiId ? (
            <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 font-medium">
              <Trash2 className="w-4 h-4" /> ลบตัวชี้วัด
            </button>
          ) : <div></div>}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">ยกเลิก</button>
            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'กำลังบันทึก...' : 'บันทึก Data Dictionary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
