import { supabase } from '@/lib/supabase';
import { Link as LinkIcon, Plus, ExternalLink, Edit2, Trash2, Folder, LayoutDashboard, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  let resources: any[] = [];
  
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      resources = data;
    }
  } catch (err) {
    console.error('Error fetching resources:', err);
  }

  // Fallback / Mock categories if empty, or just group them
  const groupedResources = resources.reduce((acc: any, res: any) => {
    const cat = res.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(res);
    return acc;
  }, {});

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dashboard': return <LayoutDashboard className="w-5 h-5 text-blue-600" />;
      case 'database': return <Database className="w-5 h-5 text-purple-600" />;
      default: return <LinkIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'dashboard': return 'แดชบอร์ดสรุปผล';
      case 'database': return 'ระบบฐานข้อมูล';
      case 'document': return 'เอกสารอ้างอิง';
      default: return 'ลิงก์และข้อมูลทั่วไป';
    }
  };

  const categories = Object.keys(groupedResources);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Folder className="w-6 h-6 text-orange-600" />
            แหล่งรวบรวมข้อมูลและลิงก์
          </h1>
          <p className="text-gray-500 mt-1">รวมหน้าแดชบอร์ดภายนอกและเว็บไซต์ที่เกี่ยวข้องกับการทำงาน</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Link href="/resources/new" className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            เพิ่มแหล่งข้อมูล
          </Link>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">ยังไม่มีแหล่งข้อมูลในระบบ</h3>
          <p className="text-gray-500 mt-1">เพิ่มลิงก์แดชบอร์ดกระทรวง หรือเว็บไซต์ที่เกี่ยวข้องเพื่อรวบรวมไว้ที่นี่</p>
          <Link href="/resources/new" className="mt-6 inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            เพิ่มแหล่งข้อมูลแรก
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                {getCategoryIcon(cat)}
                {getCategoryName(cat)}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedResources[cat].map((resource: any) => (
                  <div key={resource.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative">
                    
                    {/* Admin actions overlay */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                       <button className="p-1.5 bg-white text-gray-500 hover:text-blue-600 shadow-sm border border-gray-100 rounded-md transition-colors" title="แก้ไข">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-white text-gray-500 hover:text-red-600 shadow-sm border border-gray-100 rounded-md transition-colors" title="ลบ">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 pr-16">{resource.title}</h3>
                    
                    {resource.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                        {resource.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
                      >
                        เข้าสู่เว็บไซต์ <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
