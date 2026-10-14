"use client";

import { useState } from 'react';
import { Database, Target, Layers, BarChart3 } from 'lucide-react';
import TabITInventory from './components/TabITInventory';
import TabStrategicKPIs from './components/TabStrategicKPIs';

export default function KPIsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'strategic'>('inventory');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ตัวชี้วัดและฐานข้อมูลสารสนเทศ
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                ฐานข้อมูลสำรวจระบบสารสนเทศและ HIS 9 โรงพยาบาล จ.สระแก้ว และสถานะตัวชี้วัดตามยุทธศาสตร์
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden flex flex-wrap p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 min-w-[200px] py-3 px-5 text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl transition-all ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Database className="w-4 h-4" />
          ทะเบียนระบบสารสนเทศ รพ. (9 แห่ง)
        </button>

        <button
          onClick={() => setActiveTab('strategic')}
          className={`flex-1 min-w-[200px] py-3 px-5 text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl transition-all ${
            activeTab === 'strategic'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Target className="w-4 h-4" />
          สถานะตัวชี้วัดตามยุทธศาสตร์
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'inventory' ? <TabITInventory /> : <TabStrategicKPIs />}
      </div>
    </div>
  );
}
