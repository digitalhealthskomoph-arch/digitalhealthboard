"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Presentation, Plus, Calendar, MapPin, Clock, ChevronRight, Edit2, Trash2, X, Save } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMeetingData, setEditMeetingData] = useState<any>(null);
  
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการประชุมนี้ทั้งหมด รวมถึงวาระและมติที่เกี่ยวข้อง?')) return;
    try {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
      setMeetings(meetings.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMeetingData) return;
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          title: editMeetingData.title,
          meeting_no: editMeetingData.meeting_no,
          date: editMeetingData.date,
          location: editMeetingData.location,
          status: editMeetingData.status
        })
        .eq('id', editMeetingData.id);
      if (error) throw error;
      
      setMeetings(meetings.map(m => m.id === editMeetingData.id ? editMeetingData : m));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการประชุม');
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
                  <div className="flex items-center gap-2">
                    {getStatusBadge(meeting.status)}
                    {user && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditMeetingData(meeting);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 bg-white rounded-full hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, meeting.id)}
                          className="p-1 text-gray-400 hover:text-red-600 bg-white rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
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
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && editMeetingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">แก้ไขข้อมูลการประชุม</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อการประชุม *</label>
                  <input
                    type="text"
                    required
                    value={editMeetingData.title}
                    onChange={e => setEditMeetingData({...editMeetingData, title: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ครั้งที่ประชุม *</label>
                    <input
                      type="text"
                      required
                      value={editMeetingData.meeting_no}
                      onChange={e => setEditMeetingData({...editMeetingData, meeting_no: e.target.value})}
                      placeholder="เช่น 1/2569"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ประชุม</label>
                    <input
                      type="date"
                      value={editMeetingData.date || ''}
                      onChange={e => setEditMeetingData({...editMeetingData, date: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ / ช่องทางออนไลน์</label>
                  <input
                    type="text"
                    value={editMeetingData.location || ''}
                    onChange={e => setEditMeetingData({...editMeetingData, location: e.target.value})}
                    placeholder="เช่น ห้องประชุม 1 หรือ Zoom Link"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={editMeetingData.status}
                    onChange={e => setEditMeetingData({...editMeetingData, status: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="draft">ฉบับร่าง (Draft)</option>
                    <option value="ongoing">กำลังดำเนินการ (Ongoing)</option>
                    <option value="completed">เสร็จสิ้น (Completed)</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
