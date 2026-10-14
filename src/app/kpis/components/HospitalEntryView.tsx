"use client";

import { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Calendar,
  Layers,
  Server
} from 'lucide-react';
import { 
  Hospital, 
  ITCategory, 
  HospitalITSystem, 
  HospitalCategoryStatus, 
  IT_CATEGORIES, 
  DEVELOPER_TYPES,
  DEPLOYMENT_TYPES,
  CATEGORY_STATUS_OPTIONS 
} from '@/lib/it-inventory-data';
import CategoryIcon from './CategoryIcon';
import SystemModal from './SystemModal';

interface HospitalEntryViewProps {
  hospitals: Hospital[];
  selectedHospitalId: string;
  onSelectHospital: (hospitalId: string) => void;
  systems: HospitalITSystem[];
  categoryStatuses: Record<string, HospitalCategoryStatus>;
  onSaveContact: (hospitalId: string, contactName: string, contactPhone: string) => Promise<void>;
  onUpdateCategoryStatus: (hospitalId: string, categoryId: string, status: 'has_system' | 'no_system' | 'in_procurement', notes?: string) => Promise<void>;
  onSaveSystem: (systemData: Partial<HospitalITSystem>) => Promise<void>;
  onDeleteSystem: (systemId: string) => Promise<void>;
}

export default function HospitalEntryView({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  systems,
  categoryStatuses,
  onSaveContact,
  onUpdateCategoryStatus,
  onSaveSystem,
  onDeleteSystem,
}: HospitalEntryViewProps) {
  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Contact person state
  const [contactName, setContactName] = useState(currentHospital?.contact_name || '');
  const [contactPhone, setContactPhone] = useState(currentHospital?.contact_phone || '');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  // System Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ITCategory>(IT_CATEGORIES[0]);
  const [editingSystem, setEditingSystem] = useState<HospitalITSystem | null>(null);

  // Expanded Categories
  const [expandedCats, setExpandedCats] = useState<string[]>(IT_CATEGORIES.map(c => c.id));

  // Sync contact fields when hospital changes
  const handleHospitalChange = (hospitalId: string) => {
    onSelectHospital(hospitalId);
    const hosp = hospitals.find((h) => h.id === hospitalId);
    setContactName(hosp?.contact_name || '');
    setContactPhone(hosp?.contact_phone || '');
    setContactSaved(false);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHospital) return;
    setIsSavingContact(true);
    try {
      await onSaveContact(currentHospital.id, contactName, contactPhone);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ประสานงาน');
    } finally {
      setIsSavingContact(false);
    }
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCats((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleOpenAddModal = (cat: ITCategory) => {
    setActiveCategory(cat);
    setEditingSystem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: ITCategory, sys: HospitalITSystem) => {
    setActiveCategory(cat);
    setEditingSystem(sys);
    setModalOpen(true);
  };

  const handleDelete = async (sysId: string) => {
    if (confirm('คุณต้องการลบรายการระบบสารสนเทศนี้ใช่หรือไม่?')) {
      await onDeleteSystem(sysId);
    }
  };

  // Systems for currently selected hospital
  const hospitalSystems = systems.filter((s) => s.hospital_id === currentHospital?.id);

  // Calculate completion percentage
  const totalCategories = IT_CATEGORIES.length;
  const recordedCategoriesCount = IT_CATEGORIES.filter((cat) => {
    const status = categoryStatuses[`${currentHospital?.id}_${cat.id}`]?.status;
    const catSystems = hospitalSystems.filter((s) => s.category_id === cat.id);
    return status === 'no_system' || status === 'in_procurement' || catSystems.length > 0;
  }).length;
  const progressPercent = Math.round((recordedCategoriesCount / totalCategories) * 100);

  return (
    <div className="space-y-6">
      {/* Hospital Selection & Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                เลือกโรงพยาบาลที่ต้องการบันทึกข้อมูล
              </label>
              <select
                value={currentHospital?.id}
                onChange={(e) => handleHospitalChange(e.target.value)}
                className="mt-1 text-lg font-bold text-gray-900 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {hospitals.map((hosp, idx) => (
                  <option key={hosp.id} value={hosp.id}>
                    {idx + 1}. {hosp.name} ({hosp.short_name}) - อ.{hosp.district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress Badge */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-gray-600">ความคืบหน้าการสำรวจ</span>
              <span className="font-bold text-blue-700">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 text-right">
              สำรวจแล้ว {recordedCategoriesCount} จาก {totalCategories} หมวด
            </p>
          </div>
        </div>

        {/* Contact Info Form */}
        <form onSubmit={handleSaveContact} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              ชื่อ-นามสกุล ผู้บันทึกข้อมูล / ผู้ประสานงาน IT
            </label>
            <input
              type="text"
              placeholder="เช่น นายสมชาย ใจดี (หน.กลุ่มงานสุขภาพดิจิทัล)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              เบอร์โทรศัพท์ / LINE ID ติดต่อ
            </label>
            <input
              type="text"
              placeholder="เช่น 081-234-5678 หรือ somchai_it"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSavingContact}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSavingContact ? 'กำลังบันทึก...' : 'บันทึกผู้ติดต่อ'}
            </button>
            {contactSaved && (
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" /> บันทึกแล้ว
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 10 Categories Accordions */}
      <div className="space-y-4">
        {IT_CATEGORIES.map((cat, idx) => {
          const isExpanded = expandedCats.includes(cat.id);
          const catStatusObj = categoryStatuses[`${currentHospital?.id}_${cat.id}`];
          const catStatus = catStatusObj?.status || 'has_system';
          const catSystems = hospitalSystems.filter((s) => s.category_id === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:border-gray-300"
            >
              {/* Category Header */}
              <div
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                  isExpanded ? cat.bgColor + ' border-b border-gray-100' : 'hover:bg-gray-50/70'
                }`}
                onClick={() => toggleCategoryExpand(cat.id)}
              >
                <div className="flex items-start md:items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm border ${cat.borderColor} ${cat.color} shrink-0`}>
                    <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 border text-gray-700">
                        หมวดที่ {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-gray-900">{cat.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.subtitle}</p>
                  </div>
                </div>

                {/* Right Badges & Toggle */}
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Category Status Pill */}
                  {catStatus === 'has_system' ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {catSystems.length > 0 ? `${catSystems.length} ระบบ` : 'มีระบบงาน'}
                    </span>
                  ) : catStatus === 'in_procurement' ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" /> อยู่ระหว่างจัดหา
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <AlertCircle className="w-3.5 h-3.5" /> ยังไม่มีระบบ (ทำมือ)
                    </span>
                  )}

                  <button
                    onClick={() => toggleCategoryExpand(cat.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Category Body */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Category Status Selector */}
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-gray-700">
                      สถานะภาพรวมของหมวดนี้ในโรงพยาบาล:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            onUpdateCategoryStatus(
                              currentHospital.id,
                              cat.id,
                              opt.value as any
                            )
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                            catStatus === opt.value
                              ? `${opt.badgeClass} ring-2 ring-blue-500/30 font-bold`
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Systems List when has_system */}
                  {catStatus === 'has_system' && (
                    <div className="space-y-3">
                      {catSystems.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                          <p className="text-sm text-gray-500 font-medium">ยังไม่มีรายการระบบในหมวดนี้</p>
                          <p className="text-xs text-gray-400 mt-1">คลิกปุ่มด้านล่างเพื่อเพิ่มโปรแกรมหรือระบบที่ รพ. ใช้งาน</p>
                          <button
                            onClick={() => handleOpenAddModal(cat)}
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" /> เพิ่มระบบงานแรก
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {catSystems.map((sys, sysIdx) => {
                            const devType = DEVELOPER_TYPES.find((d) => d.value === sys.developer_type) || DEVELOPER_TYPES[0];
                            const deployType = DEPLOYMENT_TYPES.find((d) => d.value === sys.deployment_type) || DEPLOYMENT_TYPES[0];

                            return (
                              <div
                                key={sys.id}
                                className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                              >
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-200">
                                      {sysIdx + 1}
                                    </span>
                                    <h5 className="font-bold text-gray-900 text-base">{sys.system_name}</h5>
                                    
                                    {sys.sub_type_tag && (
                                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                                        {sys.sub_type_tag}
                                      </span>
                                    )}

                                    <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${devType.color}`}>
                                      {devType.label}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                                    {sys.vendor_name && (
                                      <span className="flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                        <strong className="font-medium text-gray-700">ผู้พัฒนา:</strong> {sys.vendor_name}
                                      </span>
                                    )}
                                    {sys.go_live_year && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <strong className="font-medium text-gray-700">ขึ้นระบบเมื่อ:</strong> {sys.go_live_year}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Server className="w-3.5 h-3.5 text-gray-400" />
                                      <strong className="font-medium text-gray-700">ติดตั้งแบบ:</strong> {deployType.label}
                                    </span>
                                  </div>

                                  {sys.notes && (
                                    <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100 mt-2">
                                      <span className="font-semibold text-gray-700">หมายเหตุ:</span> {sys.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Edit/Delete buttons */}
                                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                  <button
                                    onClick={() => handleOpenEditModal(cat, sys)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                    title="แก้ไข"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sys.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                    title="ลบ"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          <div className="pt-2">
                            <button
                              onClick={() => handleOpenAddModal(cat)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-xs"
                            >
                              <Plus className="w-4 h-4" /> เพิ่มระบบงานในหมวดนี้
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages for no_system / in_procurement */}
                  {catStatus === 'no_system' && (
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          โรงพยาบาลยังไม่มีระบบสารสนเทศในหมวดนี้
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ปัจจุบันยังคงดำเนินงานด้วยรูปแบบเดิม (เอกสารกระดาษ / บันทึกด้วยมือ) หากมีการจัดหาระบบในอนาคต สามารถเปลี่ยนสถานะและบันทึกระบบได้ทุกเมื่อ
                        </p>
                      </div>
                    </div>
                  )}

                  {catStatus === 'in_procurement' && (
                    <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900">
                          อยู่ระหว่างจัดหา / มีแผนการพัฒนา
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          โรงพยาบาลมีแผนในการจัดหาระบบสารสนเทศในหมวดนี้ เช่น อยู่ในงบประมาณประจำปี หรืออยู่ระหว่างคัดเลือกผู้ให้บริการ
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit System Modal */}
      <SystemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveSystem}
        initialData={editingSystem}
        category={activeCategory}
        hospitalName={currentHospital?.name || ''}
      />
    </div>
  );
}
