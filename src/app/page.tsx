"use client";

import { Target, Users, Presentation, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [meetingNo, setMeetingNo] = useState('-');
  const [memberCount, setMemberCount] = useState('-');

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch latest meeting
      const { data: meetings } = await supabase
        .from('meetings')
        .select('meeting_no')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (meetings && meetings.length > 0) {
        setMeetingNo(meetings[0].meeting_no);
      } else {
        setMeetingNo('-');
      }

      // Fetch members count
      const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
        
      if (count !== null) {
        setMemberCount(count.toString() + ' ท่าน');
      } else {
        setMemberCount('-');
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-gray-500 mt-1">ระบบบริหารจัดการคณะกรรมการสุขภาพดิจิทัลจังหวัด</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">แผนสุขภาพดิจิทัล</p>
              <h3 className="text-2xl font-bold text-gray-900">3 ปี</h3>
            </div>
          </div>
          <Link href="/strategies" className="mt-auto text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center">
            จัดการแผนสุขภาพดิจิทัล &rarr;
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">การประชุมครั้งล่าสุด</p>
              <h3 className="text-2xl font-bold text-gray-900">{meetingNo}</h3>
            </div>
          </div>
          <Link href="/meetings" className="mt-auto text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center">
            ดูวาระการประชุม &rarr;
          </Link>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">คณะกรรมการ</p>
              <h3 className="text-2xl font-bold text-gray-900">{memberCount}</h3>
            </div>
          </div>
          <Link href="/members" className="mt-auto text-sm text-purple-600 font-medium hover:text-purple-700 flex items-center">
            จัดการรายชื่อ &rarr;
          </Link>
        </div>
        
        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">สถานะตัวชี้วัด</p>
              <h3 className="text-2xl font-bold text-gray-900">รอดำเนินการ</h3>
            </div>
          </div>
          <Link href="/strategies" className="mt-auto text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center">
            อัปเดตความคืบหน้า &rarr;
          </Link>
        </div>
      </div>
      
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">ยินดีต้อนรับสู่ Digital Health Board</h2>
        <div className="prose text-gray-600 max-w-none">
          <p>ระบบนี้ออกแบบมาเพื่ออำนวยความสะดวกในการบริหารจัดการงานของคณะกรรมการสุขภาพดิจิทัล ประกอบด้วย:</p>
          <ul>
            <li><strong>แผนยุทธศาสตร์และตัวชี้วัด:</strong> จัดทำแผน 3 ปี และกำหนด KPI เพื่อติดตามผล</li>
            <li><strong>การประชุม:</strong> สร้างวาระการประชุม บันทึกมติ และออกรายงานการประชุมอัตโนมัติ</li>
            <li><strong>ข้อมูลคณะกรรมการ:</strong> รวบรวมคำสั่งแต่งตั้งและบทบาทหน้าที่ให้ค้นหาง่าย</li>
            <li><strong>แหล่งข้อมูล:</strong> รวบรวมลิงก์ไปยัง Dashboard และระบบที่เกี่ยวข้อง</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
