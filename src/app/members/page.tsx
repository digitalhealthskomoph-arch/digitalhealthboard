"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Download, FileText, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Document modal states
  const [showDocModal, setShowDocModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', url: '' });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Edit member states
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editMemberData, setEditMemberData] = useState({ name: '', position: '', role: '', order_ref: '' });
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('role', { ascending: true }); // Ideally we'd sort by a specific order index
          
        if (!error && data) {
          setMembers(data);
        }

        const { data: docsData } = await supabase
          .from('resources')
          .select('*')
          .eq('category', 'member_document')
          .order('created_at', { ascending: false });
        
        if (docsData) setDocuments(docsData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('คุณต้องการลบรายชื่อกรรมการท่านนี้ใช่หรือไม่?')) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: editMemberData.name,
          position: editMemberData.position,
          role: editMemberData.role,
          order_ref: editMemberData.order_ref
        })
        .eq('id', editingMember.id);
        
      if (error) throw error;
      
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...editMemberData } : m));
      setShowEditMemberModal(false);
      setEditingMember(null);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูลกรรมการ');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return alert('กรุณาระบุชื่อเอกสาร');
    
    setUploadingDoc(true);
    try {
      let finalUrl = newDoc.url;
      
      if (fileToUpload) {
        // Upload to Supabase Storage 'documents' bucket
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `members/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(filePath, fileToUpload);
          
        if (uploadError) {
          console.error(uploadError);
          // If bucket doesn't exist, fallback to warning
          if (uploadError.message.includes('Bucket not found')) {
            alert('ไม่พบ Storage Bucket ชื่อ "documents" ใน Supabase \nกรุณาไปที่ Supabase > Storage > สร้าง Bucket ชื่อ "documents" (ตั้งเป็น Public)');
            setUploadingDoc(false);
            return;
          }
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        finalUrl = publicUrlData.publicUrl;
      }
      
      if (!finalUrl) {
        alert('กรุณาอัปโหลดไฟล์ หรือใส่ลิงก์เอกสาร');
        setUploadingDoc(false);
        return;
      }
      
      const { data: insertedDoc, error } = await supabase
        .from('resources')
        .insert([{
          title: newDoc.title,
          url: finalUrl,
          category: 'member_document',
          description: fileToUpload ? fileToUpload.name : 'Link'
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setDocuments([insertedDoc, ...documents]);
      setShowDocModal(false);
      setNewDoc({ title: '', url: '' });
      setFileToUpload(null);
    } catch (error) {
      console.error('Error adding document:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มเอกสาร');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('ยืนยันการลบเอกสารนี้?')) return;
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  // Basic grouping by role (mock logic, in real life you might want an order column)
  const groupedMembers = members.reduce((acc: any, member: any) => {
    const role = member.role || 'กรรมการ';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {});

  const orderOfRoles = ['ประธานกรรมการ', 'รองประธานกรรมการ', 'กรรมการ', 'กรรมการและเลขานุการ', 'กรรมการและผู้ช่วยเลขานุการ'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            ข้อมูลคณะกรรมการ
          </h1>
          <p className="text-gray-500 mt-1">รายชื่อคณะกรรมการสุขภาพดิจิทัลและคำสั่งแต่งตั้ง</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            คำสั่งแต่งตั้ง
          </button>
          {user && (
            <Link href="/members/new" className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors">
              <UserPlus className="w-4 h-4" />
              เพิ่มกรรมการ
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="ค้นหารายชื่อ หรือตำแหน่ง..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">ยังไม่มีรายชื่อคณะกรรมการ</h3>
            <p className="text-gray-500 mt-1">โปรดเพิ่มข้อมูลรายชื่อคณะกรรมการเข้าระบบ</p>
          </div>
        ) : (
          <div className="p-0">
            {orderOfRoles.map((roleTitle) => {
              const roleMembers = groupedMembers[roleTitle];
              if (!roleMembers || roleMembers.length === 0) return null;
              
              return (
                <div key={roleTitle} className="border-b border-gray-100 last:border-0">
                  <div className="bg-purple-50/50 px-6 py-3 border-b border-purple-100">
                    <h3 className="text-sm font-bold text-purple-800">{roleTitle}</h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {roleMembers.map((member: any) => (
                      <li key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {member.order_ref && (
                            <span className="hidden sm:inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md">
                              อ้างอิง: {member.order_ref}
                            </span>
                          )}
                          {user && (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingMember(member);
                                  setEditMemberData({
                                    name: member.name || '',
                                    position: member.position || '',
                                    role: member.role || '',
                                    order_ref: member.order_ref || ''
                                  });
                                  setShowEditMemberModal(true);
                                }} 
                                className="text-gray-400 hover:text-blue-600 text-sm font-medium mr-2"
                              >
                                แก้ไข
                              </button>
                              <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">ลบ</button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {/* Catch-all for roles that weren't in our preset order array */}
            {Object.keys(groupedMembers).filter(r => !orderOfRoles.includes(r)).map((roleTitle) => (
               <div key={roleTitle} className="border-b border-gray-100 last:border-0">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700">{roleTitle}</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {groupedMembers[roleTitle].map((member: any) => (
                    <li key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                      </div>
                      {user && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingMember(member);
                              setEditMemberData({
                                name: member.name || '',
                                position: member.position || '',
                                role: member.role || '',
                                order_ref: member.order_ref || ''
                              });
                              setShowEditMemberModal(true);
                            }} 
                            className="text-gray-400 hover:text-blue-600 text-sm font-medium mr-2"
                          >
                            แก้ไข
                          </button>
                          <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">ลบ</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Document Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          เอกสารที่เกี่ยวข้อง
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="relative border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:border-blue-300 hover:shadow-sm transition-all group">
              <div className="bg-blue-100 p-2 rounded text-blue-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate" title={doc.title}>
                  {doc.title}
                </a>
                <p className="text-xs text-gray-500 mt-1 truncate">{doc.description || 'เอกสารแนบ'}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  อัปเดตเมื่อ: {new Date(doc.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              {user && (
                <button 
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="ลบเอกสาร"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              )}
            </div>
          ))}
          
          {user && (
            <button 
              onClick={() => setShowDocModal(true)}
              className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-500 hover:text-blue-600 min-h-[100px]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">เพิ่มเอกสารอ้างอิง</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">เพิ่มเอกสารที่เกี่ยวข้อง</h3>
              <button onClick={() => {
                setShowDocModal(false);
                setFileToUpload(null);
                setNewDoc({title:'', url:''});
              }} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddDocument}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร *</label>
                  <input
                    type="text"
                    required
                    value={newDoc.title}
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                    placeholder="เช่น คำสั่งแต่งตั้งคณะกรรมการ"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดไฟล์</label>
                  <input
                    type="file"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFileToUpload(e.target.files[0]);
                        setNewDoc({...newDoc, url: ''}); // clear URL if file is chosen
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">หมายเหตุ: ต้องสร้าง Storage Bucket ชื่อ `documents` แบบ Public ใน Supabase ก่อน</p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">หรือใช้ลิงก์ภายนอก</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์เอกสาร (Google Drive, ฯลฯ)</label>
                  <input
                    type="url"
                    value={newDoc.url}
                    onChange={e => setNewDoc({...newDoc, url: e.target.value})}
                    placeholder="https://..."
                    disabled={!!fileToUpload}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={uploadingDoc}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingDoc ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-purple-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><User className="w-5 h-5 text-purple-600"/> แก้ไขข้อมูลกรรมการ</h3>
              <button onClick={() => {
                setShowEditMemberModal(false);
                setEditingMember(null);
              }} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateMember}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={editMemberData.name}
                    onChange={e => setEditMemberData({...editMemberData, name: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่งทางบริหาร (ถ้ามี)</label>
                  <input
                    type="text"
                    value={editMemberData.position}
                    onChange={e => setEditMemberData({...editMemberData, position: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">บทบาทในคณะกรรมการ *</label>
                  <select
                    value={editMemberData.role}
                    onChange={e => setEditMemberData({...editMemberData, role: e.target.value})}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="ประธานกรรมการ">ประธานกรรมการ</option>
                    <option value="รองประธานกรรมการ">รองประธานกรรมการ</option>
                    <option value="กรรมการ">กรรมการ</option>
                    <option value="กรรมการและเลขานุการ">กรรมการและเลขานุการ</option>
                    <option value="กรรมการและผู้ช่วยเลขานุการ">กรรมการและผู้ช่วยเลขานุการ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่คำสั่งอ้างอิง</label>
                  {documents.length > 0 ? (
                    <select
                      value={editMemberData.order_ref}
                      onChange={e => setEditMemberData({...editMemberData, order_ref: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm"
                    >
                      <option value="">-- ไม่ระบุ / เลือกภายหลัง --</option>
                      {documents.map(doc => (
                        <option key={doc.id} value={doc.title}>{doc.title}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                      ยังไม่มีเอกสารคำสั่งแต่งตั้ง (เพิ่มได้ที่ "เอกสารที่เกี่ยวข้อง")
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowEditMemberModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
