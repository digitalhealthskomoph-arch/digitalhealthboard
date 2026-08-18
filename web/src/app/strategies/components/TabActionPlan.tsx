"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TabActionPlan({ planData }: { planData: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    strategy_id: '',
    activity_name: '',
    responsible_person: '',
    quarter: 'Q1',
    budget: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch strategies for the dropdown
      const { data: strats } = await supabase.from('strategies').select('id, name').order('name');
      if (strats) setStrategies(strats);
      if (strats && strats.length > 0 && !formData.strategy_id) {
        setFormData(prev => ({ ...prev, strategy_id: strats[0].id }));
      }

      // Fetch action plans
      const { data: plans } = await supabase
        .from('action_plans')
        .select(`*, strategies(name)`)
        .order('created_at');
      
      if (plans) setActionPlans(plans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update
        await supabase.from('action_plans').update({
          strategy_id: formData.strategy_id,
          activity_name: formData.activity_name,
          responsible_person: formData.responsible_person,
          quarter: formData.quarter,
          budget: formData.budget
        }).eq('id', formData.id);
      } else {
        // Insert
        await supabase.from('action_plans').insert([{
          strategy_id: formData.strategy_id,
          activity_name: formData.activity_name,
          responsible_person: formData.responsible_person,
          quarter: formData.quarter,
          budget: formData.budget
        }]);
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      strategy_id: strategies.length > 0 ? strategies[0].id : '',
      activity_name: '',
      responsible_person: '',
      quarter: 'Q1',
      budget: 0
    });
  };

  const handleEdit = (plan: any) => {
    setFormData({
      id: plan.id,
      strategy_id: plan.strategy_id,
      activity_name: plan.activity_name,
      responsible_person: plan.responsible_person || '',
      quarter: plan.quarter || 'Q1',
      budget: plan.budget || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแผนปฏิบัติการนี้?')) return;
    try {
      await supabase.from('action_plans').delete().eq('id', id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500">กำลังโหลดข้อมูลแผนปฏิบัติการ...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900">ส่วนที่ 5 แผนปฏิบัติการประจำปี</h2>
        {!showForm && user && (
          <button 
            onClick={() => setShowForm(true)} 
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> เพิ่มแผนปฏิบัติการ
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">{formData.id ? 'แก้ไขแผนปฏิบัติการ' : 'เพิ่มแผนปฏิบัติการใหม่'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ภายใต้ยุทธศาสตร์</label>
              <select 
                required
                value={formData.strategy_id}
                onChange={e => setFormData({...formData, strategy_id: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
              >
                {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กิจกรรมหลัก</label>
              <input 
                required
                type="text"
                value={formData.activity_name}
                onChange={e => setFormData({...formData, activity_name: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
                placeholder="ระบุชื่อกิจกรรม/โครงการ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบหลัก</label>
                <input 
                  type="text"
                  value={formData.responsible_person}
                  onChange={e => setFormData({...formData, responsible_person: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
                  placeholder="เช่น กลุ่มงานดิจิทัล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ไตรมาส</label>
                <select 
                  value={formData.quarter}
                  onChange={e => setFormData({...formData, quarter: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
                >
                  <option value="Q1">ไตรมาส 1 (ต.ค. - ธ.ค.)</option>
                  <option value="Q2">ไตรมาส 2 (ม.ค. - มี.ค.)</option>
                  <option value="Q3">ไตรมาส 3 (เม.ย. - มิ.ย.)</option>
                  <option value="Q4">ไตรมาส 4 (ก.ค. - ก.ย.)</option>
                  <option value="Q1-Q2">ไตรมาส 1-2</option>
                  <option value="Q3-Q4">ไตรมาส 3-4</option>
                  <option value="ตลอดปี">ตลอดปี</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">งบประมาณ (บาท)</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                  className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
              >
                บันทึกแผนปฏิบัติการ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ยุทธศาสตร์ที่</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">กิจกรรมหลัก</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ผู้รับผิดชอบหลัก</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ไตรมาส</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">งบประมาณ (บาท)</th>
              {user && <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actionPlans.length === 0 ? (
              <tr>
                <td colSpan={user ? 6 : 5} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                  ยังไม่มีแผนปฏิบัติการ
                </td>
              </tr>
            ) : (
              actionPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium whitespace-nowrap">
                    {plan.strategies?.name?.split(' ')[1] || plan.strategies?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{plan.activity_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{plan.responsible_person || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {plan.quarter}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono">
                    {Number(plan.budget).toLocaleString()}
                  </td>
                  {user && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-900 mr-3">แก้ไข</button>
                      <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
