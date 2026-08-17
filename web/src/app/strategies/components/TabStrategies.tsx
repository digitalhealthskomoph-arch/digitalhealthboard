"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, ChevronDown, ChevronRight, FileSearch, Trash2, Save, X } from 'lucide-react';
import KPIFormModal from './KPIFormModal';

export default function TabStrategies({ planData }: { planData: any }) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStrats, setExpandedStrats] = useState<string[]>([]);
  
  // Strategy Edit State
  const [editingStrat, setEditingStrat] = useState<string | null>(null);
  const [stratForm, setStratForm] = useState<{ id?: string, name: string, theme_color: string, definition: string[], measures: string[] }>({ name: '', theme_color: 'blue', definition: [], measures: [] });
  const [showAddStrat, setShowAddStrat] = useState(false);

  // Objective Add/Edit State
  const [objForm, setObjForm] = useState({ id: '', strategy_id: '', name: '', description: '' });
  const [showObjForm, setShowObjForm] = useState(false);

  // KPI Add/Edit State
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [targetStratId, setTargetStratId] = useState<string>('');
  const [targetObjId, setTargetObjId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stratRes, objRes, kpiRes] = await Promise.all([
        supabase.from('strategies').select('*').order('name'),
        supabase.from('objectives').select('*').order('created_at'),
        supabase.from('kpis').select('*').order('created_at')
      ]);

      if (stratRes.data) {
        setStrategies(stratRes.data);
        if (expandedStrats.length === 0) {
          setExpandedStrats([stratRes.data[0]?.id]); // expand first by default
        }
      }
      if (objRes.data) setObjectives(objRes.data);
      if (kpiRes.data) setKpis(kpiRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedStrats.includes(id)) {
      setExpandedStrats(expandedStrats.filter(s => s !== id));
    } else {
      setExpandedStrats([...expandedStrats, id]);
    }
  };

  // Strategy Handlers
  const startEditStrat = (strat: any) => {
    setStratForm({
      name: strat.name || '',
      theme_color: strat.theme_color || 'blue',
      definition: strat.definition || [],
      measures: strat.measures || []
    });
    setEditingStrat(strat.id);
  };

  const saveStrat = async (id?: string) => {
    if (!stratForm.name) return alert('กรุณาระบุชื่อยุทธศาสตร์');
    try {
      if (id) {
        await supabase.from('strategies').update({
          name: stratForm.name,
          theme_color: stratForm.theme_color,
          definition: stratForm.definition,
          measures: stratForm.measures
        }).eq('id', id);
      } else {
        await supabase.from('strategies').insert([{
          name: stratForm.name,
          theme_color: stratForm.theme_color,
          definition: stratForm.definition,
          measures: stratForm.measures
        }]);
        setShowAddStrat(false);
      }
      setEditingStrat(null);
      fetchData();
    } catch(err) {
      alert("Error saving strategy details");
    }
  };

  const updateArray = (field: 'definition'|'measures', idx: number, val: string) => {
    const arr = [...stratForm[field]];
    arr[idx] = val;
    setStratForm({ ...stratForm, [field]: arr });
  };
  const addArray = (field: 'definition'|'measures') => {
    setStratForm({ ...stratForm, [field]: [...stratForm[field], ''] });
  };
  const removeArray = (field: 'definition'|'measures', idx: number) => {
    const arr = [...stratForm[field]];
    arr.splice(idx, 1);
    setStratForm({ ...stratForm, [field]: arr });
  };

  // Objective Handlers
  const saveObjective = async () => {
    if (!objForm.name) return alert("ระบุชื่อเป้าประสงค์");
    try {
      if (objForm.id) {
        await supabase.from('objectives').update({ name: objForm.name, description: objForm.description }).eq('id', objForm.id);
      } else {
        await supabase.from('objectives').insert([{
          strategy_id: objForm.strategy_id,
          name: objForm.name,
          description: objForm.description
        }]);
      }
      setShowObjForm(false);
      fetchData();
    } catch (e) { alert("Error saving objective"); }
  };

  if (loading) return <div className="py-8 text-center text-gray-500">กำลังโหลดข้อมูลยุทธศาสตร์...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900">ส่วนที่ 4 ยุทธศาสตร์ & ตัวชี้วัด (KPIs)</h2>
        <button 
          onClick={() => {
            setStratForm({ name: '', theme_color: 'blue', definition: [], measures: [] });
            setShowAddStrat(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มยุทธศาสตร์
        </button>
      </div>

      {showAddStrat && (
        <div className="border border-blue-200 rounded-xl bg-blue-50 p-5 mb-6 shadow-sm relative">
          <h3 className="font-bold text-blue-900 mb-4">เพิ่มยุทธศาสตร์ใหม่</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-bold block mb-1">ชื่อยุทธศาสตร์</label>
              <input 
                value={stratForm.name} 
                onChange={e => setStratForm({...stratForm, name: e.target.value})} 
                className="w-full border-gray-300 rounded p-2 text-sm"
                placeholder="ระบุชื่อยุทธศาสตร์..."
              />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">ธีมสีของยุทธศาสตร์</label>
              <select 
                value={stratForm.theme_color} 
                onChange={e => setStratForm({...stratForm, theme_color: e.target.value})} 
                className="w-full border-gray-300 rounded p-2 text-sm"
              >
                <option value="blue">สีฟ้า (Blue)</option>
                <option value="emerald">สีเขียว (Emerald)</option>
                <option value="purple">สีม่วง (Purple)</option>
                <option value="rose">สีชมพู (Rose)</option>
                <option value="amber">สีส้มเหลือง (Amber)</option>
                <option value="cyan">สีคราม (Cyan)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setShowAddStrat(false)} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50">ยกเลิก</button>
            <button onClick={() => saveStrat()} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded">บันทึก</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {strategies.map(strat => {
          const isExpanded = expandedStrats.includes(strat.id);
          const stratObjs = objectives.filter(o => o.strategy_id === strat.id);
          const theme = strat.theme_color || 'blue';
          
          const themeColors: Record<string, { bg: string, headerBg: string, text: string, objBorder: string, objBg: string, objText: string }> = {
            blue: { bg: 'bg-blue-50/50', headerBg: 'bg-blue-50', text: 'text-blue-900', objBorder: 'border-blue-200', objBg: 'bg-blue-50', objText: 'text-blue-600' },
            emerald: { bg: 'bg-emerald-50/50', headerBg: 'bg-emerald-50', text: 'text-emerald-900', objBorder: 'border-emerald-200', objBg: 'bg-emerald-50', objText: 'text-emerald-600' },
            purple: { bg: 'bg-purple-50/50', headerBg: 'bg-purple-50', text: 'text-purple-900', objBorder: 'border-purple-200', objBg: 'bg-purple-50', objText: 'text-purple-600' },
            rose: { bg: 'bg-rose-50/50', headerBg: 'bg-rose-50', text: 'text-rose-900', objBorder: 'border-rose-200', objBg: 'bg-rose-50', objText: 'text-rose-600' },
            amber: { bg: 'bg-amber-50/50', headerBg: 'bg-amber-50', text: 'text-amber-900', objBorder: 'border-amber-200', objBg: 'bg-amber-50', objText: 'text-amber-600' },
            cyan: { bg: 'bg-cyan-50/50', headerBg: 'bg-cyan-50', text: 'text-cyan-900', objBorder: 'border-cyan-200', objBg: 'bg-cyan-50', objText: 'text-cyan-600' }
          };
          
          const currentTheme = themeColors[theme] || themeColors.blue;
          
          return (
            <div key={strat.id} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div 
                className={`${currentTheme.headerBg} px-5 py-4 flex items-center justify-between cursor-pointer hover:brightness-95 transition-colors`}
                onClick={() => toggleExpand(strat.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                  <h3 className={`font-bold text-lg ${currentTheme.text}`}>{strat.name}</h3>
                </div>
                <span className="text-xs font-semibold bg-white px-2 py-1 rounded-md text-gray-500 border">
                  {stratObjs.length} เป้าประสงค์
                </span>
              </div>

              {/* Content */}
              {isExpanded && (
                <div className="p-5 border-t border-gray-100">
                  {/* Strategy Details (Def & Measures) */}
                  <div className={`mb-6 ${currentTheme.bg} rounded-lg p-5 border ${currentTheme.objBorder} relative`}>
                    {editingStrat === strat.id ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className={`font-bold ${currentTheme.text}`}>แก้ไขรายละเอียด</h4>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingStrat(null)} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"><X className="w-4 h-4 inline"/></button>
                            <button onClick={() => saveStrat(strat.id)} className="px-2 py-1 text-xs text-white bg-blue-600 rounded"><Save className="w-4 h-4 inline"/> บันทึก</button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-bold block mb-1">ชื่อยุทธศาสตร์</label>
                            <input 
                              value={stratForm.name} 
                              onChange={e => setStratForm({...stratForm, name: e.target.value})} 
                              className="w-full border-gray-300 rounded p-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold block mb-1">ธีมสีของยุทธศาสตร์</label>
                            <select 
                              value={stratForm.theme_color} 
                              onChange={e => setStratForm({...stratForm, theme_color: e.target.value})} 
                              className="w-full border-gray-300 rounded p-2 text-sm"
                            >
                              <option value="blue">สีฟ้า (Blue)</option>
                              <option value="emerald">สีเขียว (Emerald)</option>
                              <option value="purple">สีม่วง (Purple)</option>
                              <option value="rose">สีชมพู (Rose)</option>
                              <option value="amber">สีส้มเหลือง (Amber)</option>
                              <option value="cyan">สีคราม (Cyan)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-bold block mb-1">นิยามยุทธศาสตร์และความเชื่อมโยง</label>
                          {stratForm.definition.map((def: string, i: number) => (
                            <div key={i} className="flex gap-1 mb-1">
                              <input value={def} onChange={e=>updateArray('definition', i, e.target.value)} className="flex-1 text-sm border-gray-300 rounded" />
                              <button onClick={()=>removeArray('definition', i)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          ))}
                          <button onClick={()=>addArray('definition')} className="text-xs text-blue-600">+ เพิ่มนิยาม</button>
                        </div>
                        
                        <div>
                          <label className="text-sm font-bold block mb-1">มาตรการหลัก</label>
                          {stratForm.measures.map((m: string, i: number) => (
                            <div key={i} className="flex gap-1 mb-1">
                              <input value={m} onChange={e=>updateArray('measures', i, e.target.value)} className="flex-1 text-sm border-gray-300 rounded" />
                              <button onClick={()=>removeArray('measures', i)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          ))}
                          <button onClick={()=>addArray('measures')} className="text-xs text-blue-600">+ เพิ่มมาตรการ</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => startEditStrat(strat)} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4"/></button>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className={`font-bold text-sm ${currentTheme.text} mb-2`}>นิยามยุทธศาสตร์และความเชื่อมโยง</h4>
                            {strat.definition?.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                {strat.definition.map((d:string, i:number) => <li key={i}>{d}</li>)}
                              </ul>
                            ) : <p className="text-xs text-gray-400 italic">ยังไม่ระบุ</p>}
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${currentTheme.text} mb-2`}>มาตรการหลัก</h4>
                            {strat.measures?.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                {strat.measures.map((m:string, i:number) => <li key={i}>{m}</li>)}
                              </ul>
                            ) : <p className="text-xs text-gray-400 italic">ยังไม่ระบุ</p>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Objectives List */}
                  <div className="space-y-4">
                    {stratObjs.map(obj => {
                      const objKpis = kpis.filter(k => k.objective_id === obj.id);
                      return (
                        <div key={obj.id} className={`border ${currentTheme.objBorder} rounded-lg overflow-hidden`}>
                          <div className={`${currentTheme.objBg} px-4 py-2 flex justify-between items-center border-b ${currentTheme.objBorder}`}>
                            <div>
                              <span className={`text-xs font-bold ${currentTheme.objText} uppercase mr-2`}>เป้าประสงค์</span>
                              <span className="font-bold text-gray-900 text-sm">{obj.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setObjForm(obj); setShowObjForm(true); }}
                                className={`text-xs text-gray-500 hover:${currentTheme.objText}`}
                              >
                                แก้ไขเป้าประสงค์
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white">
                            {objKpis.length > 0 && (
                              <div className="overflow-x-auto mb-3">
                                <table className="w-full text-sm text-left border-collapse">
                                  <thead className="bg-gray-50 border-b">
                                    <tr>
                                      <th className="px-4 py-2 font-semibold text-gray-700 min-w-[200px]">ชื่อตัวชี้วัด</th>
                                      <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">สถานะ</th>
                                      <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">เป้า 2570</th>
                                      <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">เป้า 2571</th>
                                      <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">เป้า 2572</th>
                                      <th className="px-4 py-2 font-semibold text-gray-700 w-16 text-center">จัดการ</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {objKpis.map(kpi => (
                                      <tr key={kpi.id} className="border-b hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-900">{kpi.name}</td>
                                        <td className="px-4 py-3 text-center">
                                          <span className={`px-2 py-1 text-[10px] whitespace-nowrap rounded-full ${kpi.readiness_status === 'พร้อมวัด' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {kpi.readiness_status || 'ไม่ระบุ'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600 text-xs">{kpi.target_2570 || '-'}</td>
                                        <td className="px-4 py-3 text-center text-gray-600 text-xs">{kpi.target_2571 || '-'}</td>
                                        <td className="px-4 py-3 text-center text-gray-600 text-xs">{kpi.target_2572 || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                          <button 
                                            onClick={() => {
                                              setEditingKpiId(kpi.id);
                                              setTargetStratId(strat.id);
                                              setTargetObjId(obj.id);
                                              setKpiModalOpen(true);
                                            }}
                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md mx-auto block"
                                            title="ดู/แก้ไข Data Dictionary"
                                          >
                                            <FileSearch className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            
                            <button 
                              onClick={() => {
                                setEditingKpiId(null);
                                setTargetStratId(strat.id);
                                setTargetObjId(obj.id);
                                setKpiModalOpen(true);
                              }}
                              className={`text-sm font-medium ${currentTheme.objText} flex items-center gap-1 hover:underline mt-2`}
                            >
                              <Plus className="w-4 h-4" /> เพิ่มตัวชี้วัดในเป้าประสงค์นี้
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* KPIs without Objectives (Legacy/Unassigned) */}
                    {kpis.filter(k => k.strategy_id === strat.id && !k.objective_id).length > 0 && (
                      <div className="border border-gray-200 border-dashed rounded-lg p-4 bg-gray-50">
                        <h4 className="text-sm font-bold text-gray-500 mb-3">ตัวชี้วัดที่ยังไม่ได้ผูกกับเป้าประสงค์</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
                            <thead className="bg-gray-100 border-b">
                              <tr>
                                <th className="px-4 py-2 font-semibold text-gray-700 min-w-[200px]">ชื่อตัวชี้วัด</th>
                                <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">สถานะ</th>
                                <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">เป้า 2570</th>
                                <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">เป้า 2571</th>
                                <th className="px-4 py-2 font-semibold text-gray-700 w-24 text-center">เป้า 2572</th>
                                <th className="px-4 py-2 font-semibold text-gray-700 w-16 text-center">แก้ไข</th>
                              </tr>
                            </thead>
                            <tbody>
                              {kpis.filter(k => k.strategy_id === strat.id && !k.objective_id).map(kpi => (
                                <tr key={kpi.id} className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-gray-900">{kpi.name}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 text-[10px] whitespace-nowrap rounded-full ${kpi.readiness_status === 'พร้อมวัด' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {kpi.readiness_status || 'ไม่ระบุ'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600 text-xs">{kpi.target_2570 || '-'}</td>
                                  <td className="px-4 py-3 text-center text-gray-600 text-xs">{kpi.target_2571 || '-'}</td>
                                  <td className="px-4 py-3 text-center text-gray-600 text-xs">{kpi.target_2572 || '-'}</td>
                                  <td className="px-4 py-3 text-center">
                                    <button 
                                      onClick={() => {
                                        setEditingKpiId(kpi.id);
                                        setTargetStratId(strat.id);
                                        setTargetObjId(null);
                                        setKpiModalOpen(true);
                                      }}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md mx-auto block"
                                      title="แก้ไข"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setObjForm({ id: '', strategy_id: strat.id, name: '', description: '' });
                        setShowObjForm(true);
                      }}
                      className={`text-sm font-medium ${currentTheme.objText} flex items-center gap-1 hover:${currentTheme.objBg} px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:${currentTheme.objBorder}`}
                    >
                      <Plus className="w-4 h-4" /> เพิ่มเป้าประสงค์ใหม่
                    </button>
                  </div>

                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Objective Form Modal */}
      {showObjForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{objForm.id ? 'แก้ไขเป้าประสงค์' : 'เพิ่มเป้าประสงค์'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเป้าประสงค์</label>
                <input 
                  type="text" 
                  value={objForm.name} 
                  onChange={e => setObjForm({...objForm, name: e.target.value})} 
                  className="w-full border-gray-300 rounded-lg text-sm" 
                  placeholder="เช่น ประชาชนเข้าถึงบริการสุขภาพดิจิทัลอย่างทั่วถึง"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย (ไม่บังคับ)</label>
                <textarea 
                  value={objForm.description} 
                  onChange={e => setObjForm({...objForm, description: e.target.value})} 
                  className="w-full border-gray-300 rounded-lg text-sm" 
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowObjForm(false)} className="px-4 py-2 border rounded-lg text-sm">ยกเลิก</button>
                <button onClick={saveObjective} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Dictionary Modal */}
      {kpiModalOpen && (
        <KPIFormModal 
          kpiId={editingKpiId} 
          strategyId={targetStratId}
          objectiveId={targetObjId}
          objectives={objectives.filter(o => o.strategy_id === targetStratId)}
          onClose={() => { setKpiModalOpen(false); fetchData(); }} 
        />
      )}
    </div>
  );
}
