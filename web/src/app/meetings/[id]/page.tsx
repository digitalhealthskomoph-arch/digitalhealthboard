"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { exportToWord, buildMinutesHTML } from './word-export';

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [agendas, setAgendas] = useState<any[]>([]);

  // Form states
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ title: '', description: '', order_index: 1 });
  
  const [activeResolutionAgendaId, setActiveResolutionAgendaId] = useState<string | null>(null);
  const [newResolution, setNewResolution] = useState({ resolution_type: 'รับทราบ', detail: '' });

  useEffect(() => {
    fetchMeetingData();
  }, [id]);

  const fetchMeetingData = async () => {
    setLoading(true);
    try {
      // Fetch meeting
      const { data: meetingData, error: mError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();
        
      if (mError) throw mError;
      setMeeting(meetingData);

      // Fetch agendas with resolutions
      const { data: agendasData, error: aError } = await supabase
        .from('agendas')
        .select(`
          *,
          resolutions (*)
        `)
        .eq('meeting_id', id)
        .order('order_index', { ascending: true });
        
      if (aError) throw aError;
      setAgendas(agendasData || []);
      
      // Default next order_index
      if (agendasData && agendasData.length > 0) {
        setNewAgenda(prev => ({ ...prev, order_index: agendasData.length + 1 }));
      }

    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('agendas')
        .insert([{
          meeting_id: id,
          title: newAgenda.title,
          description: newAgenda.description,
          order_index: newAgenda.order_index
        }]);
      if (error) throw error;
      
      setNewAgenda({ title: '', description: '', order_index: newAgenda.order_index + 1 });
      setShowAgendaForm(false);
      fetchMeetingData();
    } catch (error) {
      console.error('Error adding agenda:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มวาระ');
    }
  };

  const handleAddResolution = async (agendaId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('resolutions')
        .insert([{
          agenda_id: agendaId,
          resolution_type: newResolution.resolution_type,
          detail: newResolution.detail
        }]);
      if (error) throw error;
      
      setNewResolution({ resolution_type: 'รับทราบ', detail: '' });
      setActiveResolutionAgendaId(null);
      fetchMeetingData();
    } catch (error) {
      console.error('Error adding resolution:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกมติ');
    }
  };

  const deleteAgenda = async (agendaId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวาระการประชุมนี้?')) return;
    try {
      await supabase.from('agendas').delete().eq('id', agendaId);
      fetchMeetingData();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteResolution = async (resolutionId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบมตินี้?')) return;
    try {
      await supabase.from('resolutions').delete().eq('id', resolutionId);
      fetchMeetingData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportWord = () => {
    if (!meeting) return;
    const htmlContent = buildMinutesHTML({
      meetingName: meeting.title,
      meetingDate: meeting.meeting_date,
      location: meeting.location,
      agendas: agendas
    });
    
    // Create a safe filename
    const safeTitle = meeting.title.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    exportToWord(htmlContent, `รายงานการประชุม_${safeTitle}`);
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูลการประชุม...</div>;
  }

  if (!meeting) {
    return <div className="p-12 text-center text-red-500">ไม่พบข้อมูลการประชุม</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/meetings" className="hover:text-blue-600 transition-colors">การประชุมทั้งหมด</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">รายละเอียดการประชุม</span>
      </div>

      {/* Meeting Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
              meeting.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {meeting.status === 'completed' ? 'เสร็จสิ้น' : meeting.status === 'in_progress' ? 'กำลังดำเนินการ' : 'แบบร่าง'}
            </span>
          </div>
          <p className="text-gray-600 flex items-center gap-4 text-sm mt-3">
            <span>📅 วันที่: {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ยังไม่กำหนด'}</span>
            <span>📍 สถานที่: {meeting.location || 'ไม่ได้ระบุ'}</span>
          </p>
        </div>
        
        <button 
          onClick={handleExportWord}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors border border-blue-200 shadow-sm"
        >
          <Download className="w-4 h-4" />
          ส่งออกรายงาน (Word)
        </button>
      </div>

      {/* Agendas Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            ระเบียบวาระการประชุม และ มติ
          </h2>
          <button 
            onClick={() => setShowAgendaForm(true)}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-4 h-4" /> เพิ่มวาระ
          </button>
        </div>

        <div className="p-6 space-y-6">
          {agendas.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500">ยังไม่มีวาระการประชุม</p>
              <button 
                onClick={() => setShowAgendaForm(true)}
                className="mt-3 text-sm text-blue-600 font-medium hover:underline"
              >
                + เพิ่มวาระแรก
              </button>
            </div>
          ) : (
            agendas.map((agenda, index) => (
              <div key={agenda.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      วาระที่ {agenda.order_index} {agenda.title}
                    </h3>
                    {agenda.description && (
                      <p className="text-sm text-gray-600 mt-1">{agenda.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => deleteAgenda(agenda.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">มติที่ประชุม</h4>
                    {activeResolutionAgendaId !== agenda.id && (
                      <button 
                        onClick={() => {
                          setActiveResolutionAgendaId(agenda.id);
                          setNewResolution({ resolution_type: 'รับทราบ', detail: '' });
                        }}
                        className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> บันทึกมติ
                      </button>
                    )}
                  </div>

                  {(!agenda.resolutions || agenda.resolutions.length === 0) && activeResolutionAgendaId !== agenda.id ? (
                    <p className="text-sm text-gray-500 italic text-center py-3">ยังไม่ได้บันทึกมติสำหรับวาระนี้</p>
                  ) : (
                    <div className="space-y-3">
                      {agenda.resolutions?.map((res: any) => (
                        <div key={res.id} className="flex items-start justify-between bg-blue-50/30 p-3 rounded-lg border border-blue-100">
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                              res.resolution_type === 'เห็นชอบ' ? 'bg-green-100 text-green-700' :
                              res.resolution_type === 'ไม่เห็นชอบ' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {res.resolution_type}
                            </span>
                            {res.detail && <p className="text-sm text-gray-700 mt-1">{res.detail}</p>}
                          </div>
                          <button onClick={() => deleteResolution(res.id)} className="text-gray-400 hover:text-red-500 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Resolution Form */}
                  {activeResolutionAgendaId === agenda.id && (
                    <form onSubmit={(e) => handleAddResolution(agenda.id, e)} className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">ประเภทมติ</label>
                          <select
                            value={newResolution.resolution_type}
                            onChange={e => setNewResolution({...newResolution, resolution_type: e.target.value})}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="รับทราบ">รับทราบ</option>
                            <option value="เห็นชอบ">เห็นชอบ</option>
                            <option value="ไม่เห็นชอบ">ไม่เห็นชอบ</option>
                            <option value="อนุมัติ">อนุมัติ</option>
                            <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด (ถ้ามี)</label>
                          <input
                            type="text"
                            value={newResolution.detail}
                            onChange={e => setNewResolution({...newResolution, detail: e.target.value})}
                            placeholder="เช่น เห็นชอบให้ดำเนินการตามเสนอ"
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button type="button" onClick={() => setActiveResolutionAgendaId(null)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100">ยกเลิก</button>
                        <button type="submit" className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 font-medium">บันทึกมติ</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Add Agenda Form Modal or Inline */}
          {showAgendaForm && (
            <div className="border border-blue-200 rounded-lg p-5 bg-blue-50/30">
              <h3 className="font-bold text-gray-900 mb-4 text-sm border-b border-blue-100 pb-2">เพิ่มวาระการประชุมใหม่</h3>
              <form onSubmit={handleAddAgenda} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ลำดับวาระ</label>
                    <input
                      type="number"
                      required
                      value={newAgenda.order_index}
                      onChange={e => setNewAgenda({...newAgenda, order_index: Number(e.target.value)})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวาระ *</label>
                    <input
                      type="text"
                      required
                      value={newAgenda.title}
                      onChange={e => setNewAgenda({...newAgenda, title: e.target.value})}
                      placeholder="เช่น เรื่องที่ประธานแจ้งให้ทราบ"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows={2}
                    value={newAgenda.description}
                    onChange={e => setNewAgenda({...newAgenda, description: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAgendaForm(false)} 
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    บันทึกวาระ
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
