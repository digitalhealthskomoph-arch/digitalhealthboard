"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { exportToWord, buildMinutesHTML } from './word-export';
import { useAuth } from '@/contexts/AuthContext';

export default function MeetingDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [agendas, setAgendas] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);

  // Form states
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ 
    agenda_no: '', 
    title: '', 
    description: '',
    resolution_summary: '',
    attachment_url: '',
    responsible_person: ''
  });
  
  const [activeAddSubAgendaId, setActiveAddSubAgendaId] = useState<string | null>(null);

  const [activeResolutionAgendaId, setActiveResolutionAgendaId] = useState<string | null>(null);
  const [newResolution, setNewResolution] = useState({ resolution_type: 'รับทราบ', detail: '' });

  // States for importing follow-up agendas
  const [showImportModal, setShowImportModal] = useState(false);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [selectedPastMeeting, setSelectedPastMeeting] = useState<string>('');
  const [importing, setImporting] = useState(false);

  // States for Edit Meeting
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [editMeetingData, setEditMeetingData] = useState({ title: '', meeting_no: '', date: '', location: '', status: '' });

  // States for Edit Agenda
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [editAgendaData, setEditAgendaData] = useState({ 
    agenda_no: '', 
    title: '', 
    description: '',
    resolution_summary: '',
    attachment_url: '',
    responsible_person: ''
  });

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

      // Fetch agendas
      const { data: agendasData, error: aError } = await supabase
        .from('agendas')
        .select('*')
        .eq('meeting_id', id)
        .order('agenda_no', { ascending: true });
        
      if (aError) throw aError;
      
      // เรียงลำดับ agenda_no แบบตัวเลข (เช่น 1, 2, 2.1, 10, 4.2.1)
      const sortedAgendas = (agendasData || []).sort((a, b) => {
        const aParts = (a.agenda_no || '').split('.').map(Number);
        const bParts = (b.agenda_no || '').split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] || 0;
          const bVal = bParts[i] || 0;
          if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
      });

      setAgendas(sortedAgendas);
      
      // Default next agenda_no (simple guess based on last item)
      if (sortedAgendas.length > 0) {
        const lastAgenda = sortedAgendas[sortedAgendas.length - 1];
        const parts = (lastAgenda.agenda_no || '').split('.');
        parts[parts.length - 1] = String(Number(parts[parts.length - 1] || 0) + 1);
        setNewAgenda(prev => ({ ...prev, agenda_no: parts.join('.') }));
      } else {
        setNewAgenda(prev => ({ ...prev, agenda_no: '1' }));
      }

      // Fetch past meetings for import feature
      const { data: pastData } = await supabase
        .from('meetings')
        .select('id, title, meeting_no, date')
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (pastData) setPastMeetings(pastData);

      // Fetch all members
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .order('role', { ascending: true });
      if (membersData) setAllMembers(membersData);

      // Fetch attendees for this meeting
      const { data: attendeesData } = await supabase
        .from('meeting_attendees')
        .select('*')
        .eq('meeting_id', id);
      if (attendeesData) setAttendees(attendeesData);

    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgenda = async (e?: React.FormEvent, presetAgendaNo?: string) => {
    if (e) e.preventDefault();
    try {
      const { error } = await supabase
        .from('agendas')
        .insert([{
          meeting_id: id,
          agenda_no: presetAgendaNo || newAgenda.agenda_no,
          title: newAgenda.title,
          description: newAgenda.description,
          resolution_summary: newAgenda.resolution_summary,
          attachment_url: newAgenda.attachment_url,
          responsible_person: newAgenda.responsible_person
        }]);
      if (error) throw error;
      
      setNewAgenda({ 
        agenda_no: '', 
        title: '', 
        description: '',
        resolution_summary: '',
        attachment_url: '',
        responsible_person: ''
      });
      setShowAgendaForm(false);
      setActiveAddSubAgendaId(null);
      fetchMeetingData();
    } catch (error) {
      console.error('Error adding agenda:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มวาระ');
    }
  };

  const handleToggleAttendance = async (memberId: string, status: string) => {
    try {
      const existing = attendees.find(a => a.member_id === memberId);
      
      if (existing) {
        if (existing.status === status) return;
        
        const { error } = await supabase
          .from('meeting_attendees')
          .update({ status })
          .eq('id', existing.id);
        if (error) throw error;
        
        setAttendees(attendees.map(a => a.id === existing.id ? { ...a, status } : a));
      } else {
        const { data, error } = await supabase
          .from('meeting_attendees')
          .insert([{ meeting_id: id, member_id: memberId, status }])
          .select()
          .single();
        if (error) throw error;
        
        setAttendees([...attendees, data]);
      }
    } catch (err) {
      console.error('Error toggling attendance:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลการเข้าร่วม');
    }
  };

  const handleUpdateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgendaId) return;
    try {
      const { error } = await supabase
        .from('agendas')
        .update({
          agenda_no: editAgendaData.agenda_no,
          title: editAgendaData.title,
          description: editAgendaData.description,
          resolution_summary: editAgendaData.resolution_summary,
          attachment_url: editAgendaData.attachment_url,
          responsible_person: editAgendaData.responsible_person
        })
        .eq('id', editingAgendaId);
      if (error) throw error;
      
      setEditingAgendaId(null);
      fetchMeetingData();
    } catch (error) {
      console.error('Error updating agenda:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขวาระ');
    }
  };

  const handleUpdateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
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
        .eq('id', id);
      if (error) throw error;
      
      setShowEditMeetingModal(false);
      fetchMeetingData();
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการประชุม');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการประชุมนี้ทั้งหมด รวมถึงวาระและมติที่เกี่ยวข้อง?')) return;
    try {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
      router.push('/meetings');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('เกิดข้อผิดพลาดในการลบการประชุม');
    }
  };

  const handleCreateStandardAgendas = async () => {
    setLoading(true);
    try {
      const standardAgendas = [
        { meeting_id: id, agenda_no: '1', title: 'เรื่องจากประธาน' },
        { meeting_id: id, agenda_no: '2', title: 'รับรองรายงานการประชุม' },
        { meeting_id: id, agenda_no: '3', title: 'เรื่องสืบเนื่อง' },
        { meeting_id: id, agenda_no: '4', title: 'เรื่องเพื่อทราบ/เพื่อพิจารณา' },
        { meeting_id: id, agenda_no: '5', title: 'วาระอื่นๆ' },
      ];
      
      const { error } = await supabase.from('agendas').insert(standardAgendas);
      if (error) throw error;
      
      fetchMeetingData();
    } catch (error) {
      console.error('Error creating standard agendas:', error);
      alert('เกิดข้อผิดพลาดในการสร้างวาระมาตรฐาน');
      setLoading(false);
    }
  };

  const handleImportPastAgendas = async () => {
    if (!selectedPastMeeting) return;
    setImporting(true);
    try {
      // ดึงวาระจากครั้งก่อน (เช่น เอามาเฉพาะเรื่องสืบเนื่อง หรือเอามาทั้งหมด)
      // ในที่นี้สมมติว่าดึงวาระทั้งหมดมาสร้างเป็นวาระย่อยของวาระที่ 3
      const { data: pastAgendas, error: fetchErr } = await supabase
        .from('agendas')
        .select('*')
        .eq('meeting_id', selectedPastMeeting)
        .order('agenda_no', { ascending: true });
        
      if (fetchErr) throw fetchErr;
      
      if (pastAgendas && pastAgendas.length > 0) {
        const importedAgendas = pastAgendas.map((pa, index) => ({
          meeting_id: id,
          agenda_no: `3.${index + 1}`,
          title: `(สืบเนื่อง) ${pa.title}`,
          description: pa.resolution_summary || pa.description,
          resolution_summary: '',
          attachment_url: pa.attachment_url,
          responsible_person: pa.responsible_person
        }));
        
        const { error: insertErr } = await supabase.from('agendas').insert(importedAgendas);
        if (insertErr) throw insertErr;
      }
      
      setShowImportModal(false);
      fetchMeetingData();
    } catch (error) {
      console.error('Error importing agendas:', error);
      alert('เกิดข้อผิดพลาดในการนำเข้าวาระ');
    } finally {
      setImporting(false);
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
      meetingDate: meeting.date,
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
            <span>📅 วันที่: {meeting.date ? new Date(meeting.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ยังไม่กำหนด'}</span>
            <span>📍 สถานที่: {meeting.location || 'ไม่ได้ระบุ'}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {user && (
            <>
              <button 
                onClick={() => {
                  setEditMeetingData({
                    title: meeting.title,
                    meeting_no: meeting.meeting_no,
                    date: meeting.date || '',
                    location: meeting.location || '',
                    status: meeting.status || 'draft'
                  });
                  setShowEditMeetingModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-300 text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                แก้ไขการประชุม
              </button>
              <button 
                onClick={handleDeleteMeeting}
                className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 border border-red-200 text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                ลบ
              </button>
            </>
          )}
          <button 
            onClick={handleExportWord}
            className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors border border-blue-200 shadow-sm"
          >
            <Download className="w-4 h-4" />
            ส่งออกรายงาน (Word)
          </button>
        </div>
      </div>

      {/* Agendas Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            ระเบียบวาระการประชุม และ มติ
          </h2>
          {user && (
            <button 
              onClick={() => setShowAgendaForm(true)}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus className="w-4 h-4" /> เพิ่มวาระ
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {agendas.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">ยังไม่มีวาระการประชุม</p>
              {user && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={handleCreateStandardAgendas}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    ใช้โครงสร้างวาระมาตรฐาน 5 วาระ
                  </button>
                  <span className="text-gray-400 text-sm">หรือ</span>
                  <button 
                    onClick={() => setShowAgendaForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มวาระเอง
                  </button>
                </div>
              )}
            </div>
          ) : (() => {
            let targetRenderFormId = activeAddSubAgendaId;
            if (activeAddSubAgendaId) {
              const parentAgenda = agendas.find(a => a.id === activeAddSubAgendaId);
              if (parentAgenda) {
                const subAgendas = agendas.filter(a => String(a.agenda_no).startsWith(`${parentAgenda.agenda_no}.`));
                if (subAgendas.length > 0) {
                  targetRenderFormId = subAgendas[subAgendas.length - 1].id;
                }
              }
            }

            return agendas.map((agenda, index) => {
              const isMainAgenda = !String(agenda.agenda_no).includes('.');
              const hasChildren = agendas.some(a => String(a.agenda_no).startsWith(`${agenda.agenda_no}.`));
              
              return (
              <div key={agenda.id} className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      วาระที่ {agenda.agenda_no} {agenda.title}
                      {agenda.title === 'เรื่องสืบเนื่อง' && user && (
                        <button 
                          onClick={() => setShowImportModal(true)}
                          className="ml-2 inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          นำเข้าวาระจากการประชุมก่อนหน้า
                        </button>
                      )}
                    </h3>
                    {agenda.description && (
                      <p className="text-sm text-gray-600 mt-1">{agenda.description}</p>
                    )}
                  </div>
                  {user && (
                    <div className="flex gap-2">
                      {!isMainAgenda && (
                        <button 
                          onClick={() => {
                            setEditAgendaData({
                              agenda_no: agenda.agenda_no || '',
                              title: agenda.title || '',
                              description: agenda.description || '',
                              resolution_summary: agenda.resolution_summary || '',
                              attachment_url: agenda.attachment_url || '',
                              responsible_person: agenda.responsible_person || ''
                            });
                            setEditingAgendaId(agenda.id);
                          }}
                          className="text-gray-400 hover:text-blue-500"
                          title="แก้ไขวาระ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const subAgendas = agendas.filter(a => String(a.agenda_no).startsWith(`${agenda.agenda_no}.`));
                          let nextNum = 1;
                          if (subAgendas.length > 0) {
                            const lastSub = subAgendas[subAgendas.length - 1];
                            const parts = String(lastSub.agenda_no).split('.');
                            const lastPart = parseInt(parts[parts.length - 1]);
                            if (!isNaN(lastPart)) {
                              nextNum = lastPart + 1;
                            }
                          }
                          setNewAgenda({ ...newAgenda, agenda_no: `${agenda.agenda_no}.${nextNum}` });
                          setActiveAddSubAgendaId(agenda.id);
                          setShowAgendaForm(false);
                        }}
                        className="text-gray-400 hover:text-green-500"
                        title="เพิ่มวาระย่อย"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      {!isMainAgenda && (
                        <button onClick={() => deleteAgenda(agenda.id)} className="text-gray-400 hover:text-red-500" title="ลบวาระ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {editingAgendaId === agenda.id ? (
                  <div className="p-4 bg-blue-50/50">
                    <form onSubmit={handleUpdateAgenda} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">ที่ (ลำดับวาระ) *</label>
                          <input
                            type="text"
                            required
                            value={editAgendaData.agenda_no}
                            onChange={e => setEditAgendaData({...editAgendaData, agenda_no: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">วาระการประชุม *</label>
                          <input
                            type="text"
                            required
                            value={editAgendaData.title}
                            onChange={e => setEditAgendaData({...editAgendaData, title: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                        <textarea
                          rows={2}
                          value={editAgendaData.description}
                          onChange={e => setEditAgendaData({...editAgendaData, description: e.target.value})}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">มติ / สรุปการประชุม</label>
                        <textarea
                          rows={4}
                          value={editAgendaData.resolution_summary}
                          onChange={e => setEditAgendaData({...editAgendaData, resolution_summary: e.target.value})}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์เอกสารแนบ</label>
                          <input
                            type="url"
                            value={editAgendaData.attachment_url}
                            onChange={e => setEditAgendaData({...editAgendaData, attachment_url: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                          <input
                            type="text"
                            value={editAgendaData.responsible_person}
                            onChange={e => setEditAgendaData({...editAgendaData, responsible_person: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setEditingAgendaId(null)} 
                          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                        >
                          ยกเลิก
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          บันทึกการแก้ไข
                        </button>
                      </div>
                    </form>
                  </div>
                ) : !isMainAgenda ? (
                  <div className="p-4 bg-white space-y-4">
                    {/* แสดงมติ/สรุปการประชุม */}
                    {agenda.resolution_summary && (
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 mb-1">มติ / สรุปการประชุม</h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {agenda.resolution_summary}
                        </div>
                      </div>
                    )}

                    {/* แสดงเอกสารแนบและผู้รับผิดชอบ */}
                    {(agenda.attachment_url || agenda.responsible_person) && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        {agenda.attachment_url && (
                          <a 
                            href={agenda.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <FileText className="w-4 h-4" />
                            เอกสารแนบ
                          </a>
                        )}
                        {agenda.responsible_person && (
                          <div className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <span className="font-semibold">ผู้รับผิดชอบ:</span>
                            {agenda.responsible_person}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* แสดง "ไม่มี" เมื่อเป็นวาระหลักและไม่มีวาระย่อย */}
                {isMainAgenda && !hasChildren && (
                  <div className="p-4 bg-white text-center">
                    <span className="text-sm text-gray-400 italic">- ไม่มีวาระย่อย -</span>
                  </div>
                )}
              </div>

                {/* Inline Add Sub-agenda Form */}
                {targetRenderFormId === agenda.id && (
                  <div className={`border border-blue-200 rounded-lg bg-blue-50/30 p-4 ${!isMainAgenda ? 'ml-8' : ''}`}>
                    <form onSubmit={handleAddAgenda} className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-blue-800 text-sm flex items-center gap-2">
                          <Plus className="w-4 h-4" /> เพิ่มวาระย่อย
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">ที่ (ลำดับวาระ) *</label>
                          <input
                            type="text"
                            required
                            value={newAgenda.agenda_no}
                            onChange={e => setNewAgenda({...newAgenda, agenda_no: e.target.value})}
                            placeholder="เช่น 1.1"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวาระการประชุม *</label>
                          <input
                            type="text"
                            required
                            value={newAgenda.title}
                            onChange={e => setNewAgenda({...newAgenda, title: e.target.value})}
                            placeholder="ระบุชื่อวาระการประชุม"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (ไม่บังคับ)</label>
                        <textarea
                          rows={2}
                          value={newAgenda.description}
                          onChange={e => setNewAgenda({...newAgenda, description: e.target.value})}
                          placeholder="รายละเอียดของวาระนี้"
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setActiveAddSubAgendaId(null)} 
                          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
                        >
                          ยกเลิก
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1 shadow-sm"
                        >
                          <Save className="w-4 h-4" />
                          บันทึกวาระ
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          });
          })()
          }

          {/* Add Agenda Form Modal or Inline */}
          {showAgendaForm && (
            <div className="border border-blue-200 rounded-lg p-5 bg-blue-50/30">
              <h3 className="font-bold text-gray-900 mb-4 text-sm border-b border-blue-100 pb-2">เพิ่มวาระการประชุมใหม่</h3>
              <form onSubmit={handleAddAgenda} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ที่ (ลำดับวาระ) *</label>
                    <input
                      type="text"
                      required
                      value={newAgenda.agenda_no}
                      onChange={e => setNewAgenda({...newAgenda, agenda_no: e.target.value})}
                      placeholder="เช่น 1, 2.1, 4.2.1"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">วาระการประชุม *</label>
                    <input
                      type="text"
                      required
                      value={newAgenda.title}
                      onChange={e => setNewAgenda({...newAgenda, title: e.target.value})}
                      placeholder="ชื่อวาระการประชุม"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                  <textarea
                    rows={2}
                    value={newAgenda.description}
                    onChange={e => setNewAgenda({...newAgenda, description: e.target.value})}
                    placeholder="รายละเอียดของวาระ"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">มติ / สรุปการประชุม</label>
                  <textarea
                    rows={4}
                    value={newAgenda.resolution_summary}
                    onChange={e => setNewAgenda({...newAgenda, resolution_summary: e.target.value})}
                    placeholder="สรุปมติที่ประชุม"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์เอกสารแนบ</label>
                    <input
                      type="url"
                      value={newAgenda.attachment_url}
                      onChange={e => setNewAgenda({...newAgenda, attachment_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                    <input
                      type="text"
                      value={newAgenda.responsible_person}
                      onChange={e => setNewAgenda({...newAgenda, responsible_person: e.target.value})}
                      placeholder="ระบุชื่อผู้รับผิดชอบ"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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

      {/* Attendance Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">บันทึกการเข้าร่วมประชุม</h2>
            <p className="text-sm text-gray-500">เช็คชื่อคณะกรรมการที่เข้าร่วมการประชุมนี้</p>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-green-600">มา: {attendees.filter(a => a.status === 'present').length}</span>
            <span className="text-red-600">ไม่มา: {attendees.filter(a => a.status === 'absent').length}</span>
            <span className="text-orange-600">ลา: {attendees.filter(a => a.status === 'leave').length}</span>
          </div>
        </div>
        
        <div className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">มา</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ไม่มา</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลา</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allMembers.map(member => {
                const attendance = attendees.find(a => a.member_id === member.id);
                const status = attendance ? attendance.status : null;
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="radio" 
                        checked={status === 'present'}
                        onChange={() => handleToggleAttendance(member.id, 'present')}
                        disabled={!user}
                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="radio" 
                        checked={status === 'absent'}
                        onChange={() => handleToggleAttendance(member.id, 'absent')}
                        disabled={!user}
                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="radio" 
                        checked={status === 'leave'}
                        onChange={() => handleToggleAttendance(member.id, 'leave')}
                        disabled={!user}
                        className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500 cursor-pointer disabled:opacity-50"
                      />
                    </td>
                  </tr>
                );
              })}
              {allMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    ยังไม่มีรายชื่อคณะกรรมการในระบบ กรุณาเพิ่มข้อมูลที่เมนู "ข้อมูลคณะกรรมการ"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">นำเข้าวาระสืบเนื่อง</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                เลือกการประชุมก่อนหน้าเพื่อนำเข้าวาระทั้งหมดมาเป็นวาระสืบเนื่อง (วาระที่ 3) ในการประชุมนี้
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกการประชุม</label>
                <select
                  value={selectedPastMeeting}
                  onChange={e => setSelectedPastMeeting(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- กรุณาเลือกการประชุม --</option>
                  {pastMeetings.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.meeting_no} - {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleImportPastAgendas}
                disabled={!selectedPastMeeting || importing}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'กำลังนำเข้า...' : 'นำเข้าวาระ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">แก้ไขข้อมูลการประชุม</h3>
              <button onClick={() => setShowEditMeetingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMeeting}>
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
                      value={editMeetingData.date}
                      onChange={e => setEditMeetingData({...editMeetingData, date: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ / ช่องทางออนไลน์</label>
                  <input
                    type="text"
                    value={editMeetingData.location}
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
                    <option value="draft">แบบร่าง (Draft)</option>
                    <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                    <option value="completed">เสร็จสิ้น (Completed)</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowEditMeetingModal(false)}
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
