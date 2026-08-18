"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, FileText, Target, ListTodo, Presentation, Download } from 'lucide-react';
import TabIntroduction from './components/TabIntroduction';
import TabSituation from './components/TabSituation';
import TabVision from './components/TabVision';
import TabStrategies from './components/TabStrategies';
import TabActionPlan from './components/TabActionPlan';
import { exportToWord, buildStrategicPlanHTML } from './word-export';

export default function StrategicBookPage() {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        const { data: newData } = await supabase
          .from('strategic_plans')
          .insert([{ title: 'ร่างแผนยุทธศาสตร์สุขภาพดิจิทัล' }])
          .select()
          .single();
        data = newData;
      }
      
      setPlanData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWord = async () => {
    try {
      const [stratRes, objRes, kpiRes, apRes] = await Promise.all([
        supabase.from('strategies').select('*').order('name'),
        supabase.from('objectives').select('*').order('created_at'),
        supabase.from('kpis').select('*').order('created_at'),
        supabase.from('action_plans').select('*').order('created_at')
      ]);
      
      const html = buildStrategicPlanHTML({
        plan: planData,
        strategies: stratRes.data || [],
        objectives: objRes.data || [],
        kpis: kpiRes.data || [],
        actionPlans: apRes.data || []
      });
      
      exportToWord(html, planData?.title || 'Document');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ Word');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  const tabs = [
    { id: 1, name: 'บทนำ', icon: BookOpen },
    { id: 2, name: 'สถานการณ์', icon: Presentation },
    { id: 3, name: 'วิสัยทัศน์', icon: Target },
    { id: 4, name: 'ยุทธศาสตร์ & KPI', icon: FileText },
    { id: 5, name: 'แผนปฏิบัติการ', icon: ListTodo },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{planData?.title || 'จัดการแผนยุทธศาสตร์'}</h1>
          <p className="text-gray-500 mt-1">จัดการเนื้อหาทั้งหมดในเล่ม</p>
        </div>
        <button 
          onClick={handleExportWord}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors border border-blue-200 shadow-sm"
        >
          <Download className="w-4 h-4" />
          ส่งออกเป็น Word
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                isActive 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              ส่วนที่ {tab.id} {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 min-h-[500px]">
        {activeTab === 1 && <TabIntroduction planData={planData} onUpdate={fetchPlan} />}
        {activeTab === 2 && <TabSituation planData={planData} onUpdate={fetchPlan} />}
        {activeTab === 3 && <TabVision planData={planData} onUpdate={fetchPlan} />}
        {activeTab === 4 && <TabStrategies planData={planData} />}
        {activeTab === 5 && <TabActionPlan planData={planData} />}
      </div>
    </div>
  );
}
