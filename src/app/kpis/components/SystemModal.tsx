"use client";

import { useState, useEffect } from 'react';
import { X, Save, Tag, Building2, Calendar, Server, Info } from 'lucide-react';
import { ITCategory, HospitalITSystem, DEVELOPER_TYPES, DEPLOYMENT_TYPES } from '@/lib/it-inventory-data';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (systemData: Partial<HospitalITSystem>) => Promise<void>;
  initialData?: Partial<HospitalITSystem> | null;
  category: ITCategory;
  hospitalName: string;
}

export default function SystemModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  category,
  hospitalName,
}: SystemModalProps) {
  const [formData, setFormData] = useState<Partial<HospitalITSystem>>({
    system_name: '',
    sub_type_tag: '',
    developer_type: 'vendor',
    vendor_name: '',
    go_live_year: '',
    deployment_type: 'on_premise',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        system_name: initialData.system_name || '',
        sub_type_tag: initialData.sub_type_tag || '',
        developer_type: initialData.developer_type || 'vendor',
        vendor_name: initialData.vendor_name || '',
        go_live_year: initialData.go_live_year || '',
        deployment_type: initialData.deployment_type || 'on_premise',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        system_name: '',
        sub_type_tag: category.suggestedTags[0] || '',
        developer_type: 'vendor',
        vendor_name: '',
        go_live_year: '',
        deployment_type: 'on_premise',
        notes: '',
      });
    }
  }, [initialData, category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.system_name?.trim()) {
      alert('กรุณาระบุชื่อโปรแกรม/ระบบ');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...formData,
        category_id: category.id,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      sub_type_tag: tag,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100">
              {hospitalName}
            </span>
            <h3 className="text-lg font-bold mt-1">
              {initialData?.id ? 'แก้ไขระบบสารสนเทศ' : 'เพิ่มระบบสารสนเทศใหม่'}
            </h3>
            <p className="text-xs text-blue-100/90 mt-0.5">
              หมวด: {category.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* System Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              ชื่อโปรแกรม / ระบบสารสนเทศ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น HOSxP XE, Smart Queue, Paperless EMR, ChatGPT Team"
              value={formData.system_name || ''}
              onChange={(e) => setFormData({ ...formData, system_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            {category.examples && (
              <p className="text-xs text-gray-400 mt-1">
                ตัวอย่าง: {category.examples}
              </p>
            )}
          </div>

          {/* Sub-type Tag with clickable chips */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-blue-600" />
              ประเภทย่อย / ขอบเขตของระบบ
            </label>
            {category.suggestedTags && category.suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {category.suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      formData.sub_type_tag === tag
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="ระบุเพิ่มเติม หรือเลือกจากแท็กด้านบน"
              value={formData.sub_type_tag || ''}
              onChange={(e) => setFormData({ ...formData, sub_type_tag: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Developer Type & Vendor Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                รูปแบบการพัฒนา
              </label>
              <select
                value={formData.developer_type || 'vendor'}
                onChange={(e) => setFormData({ ...formData, developer_type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {DEVELOPER_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                ชื่อบริษัท / ทีมผู้พัฒนา
              </label>
              <input
                type="text"
                placeholder={
                  formData.developer_type === 'in_house'
                    ? 'เช่น กลุ่มงาน IT รพ. / พัฒนาเอง'
                    : formData.developer_type === 'central'
                    ? 'เช่น กระทรวงสาธารณสุข / ศูนย์เทคโนโลยีสารสนเทศ'
                    : 'เช่น บริษัท บางกอก เมดิคอล ซอฟต์แวร์ จำกัด'
                }
                value={formData.vendor_name || ''}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Go Live Year & Deployment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                ปีที่เริ่มใช้งาน / ขึ้นระบบ
              </label>
              <input
                type="text"
                placeholder="เช่น พ.ศ. 2564 หรือ ใช้งานมา 3 ปี"
                value={formData.go_live_year || ''}
                onChange={(e) => setFormData({ ...formData, go_live_year: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600" />
                รูปแบบการติดตั้ง / ให้บริการ
              </label>
              <select
                value={formData.deployment_type || 'on_premise'}
                onChange={(e) => setFormData({ ...formData, deployment_type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {DEPLOYMENT_TYPES.map((dp) => (
                  <option key={dp.value} value={dp.value}>
                    {dp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-gray-500" />
              หมายเหตุ / รายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              placeholder="เช่น เวอร์ชันปัจจุบัน, เชื่อมโยงกับระบบ HIS, มีแผนปรับปรุงในปีงบถัดไป..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกระบบงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
