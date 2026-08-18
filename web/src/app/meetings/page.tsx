"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Presentation, Plus, Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .order('date', { ascending: false });
          
        if (!error && data) {
          setMeetings(data);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">เสร็จสิ้น</span>;
      case 'ongoing':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-200">กำลังดำเนินการ</span>;
      case 'draft':
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">ฉบับร่าง</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = parseISO(dateStr);
      return format(date, 'd MMMM yyyy', { locale: th });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Presentation className="w-6 h-6 text-emerald-600" />
            การประชุมคณะกรรมการ
          </h1>
          <p className="text-gray-500 mt-1">จัดการวาระการประชุม บันทึกมติ และออกรายงาน</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          {user && (
            <Link href="/meetings/new" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              สร้างการประชุมใหม่
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : meetings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Presentation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">ยังไม่มีการจัดการประชุม</h3>
          <p className="text-gray-500 mt-1">เริ่มต้นสร้างการประชุมครั้งแรกของคุณ</p>
          {user && (
            <button className="mt-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              สร้างการประชุม
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Link 
              href={`/meetings/${meeting.id}`} 
              key={meeting.id} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md">
                    ครั้งที่ {meeting.meeting_no}
                  </span>
                  {getStatusBadge(meeting.status)}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {meeting.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{meeting.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between mt-auto">
                <span className="text-sm font-medium text-gray-500">จัดการวาระและมติ</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
