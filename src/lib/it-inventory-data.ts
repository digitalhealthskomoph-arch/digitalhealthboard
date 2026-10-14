export interface Hospital {
  id: string;
  name: string;
  short_name: string;
  district: string;
  contact_name?: string;
  contact_phone?: string;
  order_index?: number;
}

export interface ITCategory {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  suggestedTags: string[];
  examples: string;
}

export interface HospitalITSystem {
  id: string;
  hospital_id: string;
  category_id: string;
  system_name: string;
  sub_type_tag?: string;
  developer_type: 'in_house' | 'vendor' | 'central' | 'other';
  vendor_name?: string;
  go_live_year?: string;
  deployment_type: 'on_premise' | 'cloud' | 'subscription' | 'local' | 'other';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HospitalCategoryStatus {
  id?: string;
  hospital_id: string;
  category_id: string;
  status: 'has_system' | 'no_system' | 'in_procurement';
  notes?: string;
  updated_at?: string;
}

export const DEFAULT_HOSPITALS: Hospital[] = [
  { id: 'hosp-1', name: 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว', short_name: 'รพร.สระแก้ว', district: 'เมืองสระแก้ว', order_index: 1 },
  { id: 'hosp-2', name: 'โรงพยาบาลคลองหาด', short_name: 'รพ.คลองหาด', district: 'คลองหาด', order_index: 2 },
  { id: 'hosp-3', name: 'โรงพยาบาลตาพระยา', short_name: 'รพ.ตาพระยา', district: 'ตาพระยา', order_index: 3 },
  { id: 'hosp-4', name: 'โรงพยาบาลวังน้ำเย็น', short_name: 'รพ.วังน้ำเย็น', district: 'วังน้ำเย็น', order_index: 4 },
  { id: 'hosp-5', name: 'โรงพยาบาลวัฒนานคร', short_name: 'รพ.วัฒนานคร', district: 'วัฒนานคร', order_index: 5 },
  { id: 'hosp-6', name: 'โรงพยาบาลอรัญประเทศ', short_name: 'รพ.อรัญประเทศ', district: 'อรัญประเทศ', order_index: 6 },
  { id: 'hosp-7', name: 'โรงพยาบาลเขาฉกรรจ์', short_name: 'รพ.เขาฉกรรจ์', district: 'เขาฉกรรจ์', order_index: 7 },
  { id: 'hosp-8', name: 'โรงพยาบาลโคกสูง', short_name: 'รพ.โคกสูง', district: 'โคกสูง', order_index: 8 },
  { id: 'hosp-9', name: 'โรงพยาบาลวังสมบูรณ์', short_name: 'รพ.วังสมบูรณ์', district: 'วังสมบูรณ์', order_index: 9 },
];

export const IT_CATEGORIES: ITCategory[] = [
  {
    id: 'cat_bed_patient',
    name: 'ระบบบริหารเตียง ผู้ป่วย ผู้รับบริการ',
    subtitle: 'งานบริการผู้ป่วยนอก/ใน บริหารจัดการเตียง และระบบจัดการคิว',
    iconName: 'BedDouble',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    suggestedTags: [
      'IPD Paperless',
      'OPD Paperless',
      'บริหารจัดการเตียง (Bed Management)',
      'ระบบคิวผู้รับบริการ (Smart Queue)',
      'ระบบนัดหมายออนไลน์',
      'เวชระเบียนอิเล็กทรอนิกส์ (EMR)'
    ],
    examples: 'Smart Bed, Q-Hospital, Paperless IPD, Smart OPD'
  },
  {
    id: 'cat_saraban',
    name: 'ระบบธุรการและสารบรรณ',
    subtitle: 'งานสารบรรณอิเล็กทรอนิกส์ รับ-ส่งหนังสือเวียน เอกสารภายใน',
    iconName: 'FileText',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    suggestedTags: [
      'สารบรรณอิเล็กทรอนิกส์ (e-Saraban)',
      'ระบบหนังสือเวียน',
      'ลงนามอิเล็กทรอนิกส์ (Digital Signature)',
      'ระบบออกเลขคำสั่ง/ประกาศ',
      'จัดเก็บเอกสารดิจิทัล (EDMS)'
    ],
    examples: 'e-Saraban, Saraban Online, Paperless Doc'
  },
  {
    id: 'cat_pharmacy',
    name: 'ระบบบริหารเวชภัณฑ์/ยา',
    subtitle: 'งานคลังยา คลังเวชภัณฑ์มิใช่ยา จัดซื้อจัดหา และการกระจายยา',
    iconName: 'Pill',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    suggestedTags: [
      'คลังยาหลัก (Main Drug Store)',
      'คลังยาย่อย/ตู้ยาอัจฉริยะ (Smart Drug Cabinet)',
      'จัดซื้อจัดจ้างยาและเวชภัณฑ์',
      'ระบบฉลากยาและคำแนะนำ (Smart Label)',
      'ควบคุมเบิกจ่ายเวชภัณฑ์มิใช่ยา'
    ],
    examples: 'INVS, Drug Inventory, Smart Cabinet, ระบบคลังยา รพ.'
  },
  {
    id: 'cat_finance',
    name: 'ระบบการเงินการคลัง และการบัญชี',
    subtitle: 'งานบัญชีลูกหนี้ เจ้าหนี้ รับเงิน ออกใบเสร็จ เบิกจ่ายงบประมาณ และ e-Claim',
    iconName: 'DollarSign',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    suggestedTags: [
      'ระบบบัญชีและการเงิน (Accounting)',
      'ออกใบเสร็จรับเงินอิเล็กทรอนิกส์ (e-Receipt)',
      'เบิกจ่ายงบประมาณ (Budgeting)',
      'ระบบส่งเคลมค่ารักษา (e-Claim / FDH / สปสช.)',
      'ตรวจสอบสิทธิ์และเรียกเก็บเงิน'
    ],
    examples: 'Express, AccHospital, FDH Claim, e-Claim Client'
  },
  {
    id: 'cat_hr',
    name: 'ระบบทรัพยากรบุคคล (HR)',
    subtitle: 'ข้อมูลบุคลากร ระบบลงเวลา บันทึกการลา และการจัดตารางเวร',
    iconName: 'Users',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    suggestedTags: [
      'ระบบลงเวลาปฏิบัติงาน (Time Attendance)',
      'ระบบบันทึกการลาออนไลน์ (e-Leave)',
      'ระบบจัดตารางเวร/ภาระงาน (Shift Scheduling)',
      'ประวัติและข้อมูลบุคลากร (HRIS)',
      'ระบบประเมินผลการปฏิบัติงาน'
    ],
    examples: 'HR-Pro, FingerScan Time, Nurse Shift, e-Leave'
  },
  {
    id: 'cat_asset',
    name: 'ระบบพัสดุ ครุภัณฑ์ สินทรัพย์',
    subtitle: 'งานจัดซื้อจัดจ้าง ควบคุมทะเบียนครุภัณฑ์ การตรวจนับ และตัดจำหน่าย',
    iconName: 'Box',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    suggestedTags: [
      'ทะเบียนครุภัณฑ์และสินทรัพย์ (Asset Management)',
      'ระบบตรวจนับครุภัณฑ์ด้วย QR/RFID',
      'ระบบเบิกจ่ายพัสดุ/วัสดุสิ้นเปลือง',
      'จัดซื้อจัดจ้างพัสดุ (e-Procurement)',
      'ระบบบำรุงรักษาเครื่องมือแพทย์'
    ],
    examples: 'Asset Plus, Medical Equipment Tool, ระบบพัสดุ รพ.'
  },
  {
    id: 'cat_it_infra',
    name: 'ระบบด้านเทคโนโลยีสารสนเทศ (IT)',
    subtitle: 'งานสนับสนุน IT แจ้งซ่อม บันทึก Log การสำรองข้อมูล และความปลอดภัยไซเบอร์',
    iconName: 'Server',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    suggestedTags: [
      'ระบบแจ้งซ่อม IT / Helpdesk Service',
      'ระบบเก็บ Log ตาม พ.ร.บ.คอมพิวเตอร์',
      'ระบบสำรองข้อมูล (Data Backup & Recovery)',
      'ความปลอดภัยไซเบอร์และ Antivirus (EDR/SOC)',
      'ระบบควบคุมเครือข่ายและ Firewall'
    ],
    examples: 'GLPI, OTRS, Syslog Server, Veeam Backup'
  },
  {
    id: 'cat_his',
    name: 'ระบบ HIS หลัก',
    subtitle: 'ระบบสารสนเทศหลักประจำโรงพยาบาลสำหรับบันทึกข้อมูลบริการและการรักษา',
    iconName: 'Building2',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    suggestedTags: [
      'HOSxP',
      'HOSxP XE',
      'Jhcis',
      'HOMC',
      'BMS-HOSxP',
      'SSB Hospital System',
      'ระบบ HIS พัฒนาเอง (In-house)'
    ],
    examples: 'HOSxP v3, HOSxP v4/XE, HOMC, Jhcis'
  },
  {
    id: 'cat_service_apps',
    name: 'กลุ่มโปรแกรมหรือแอปในการให้บริการหรือเกี่ยวกับผู้ป่วยและผู้รับบริการ',
    subtitle: 'โมบายแอปพลิเคชัน LINE OA เว็บพอร์ทัล และช่องทางบริการภาคประชาชน',
    iconName: 'Smartphone',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    suggestedTags: [
      'หมอพร้อม / MOPH Connect',
      'LINE OA ประจำโรงพยาบาล',
      'แอปพลิเคชันจองคิวนัดหมาย (Queue App)',
      'ระบบแพทย์ทางไกล (Telemedicine / Telehealth)',
      'ระบบส่งผลแล็บ/แจ้งเตือนการตรวจ',
      'Kiosk ให้บริการตนเอง'
    ],
    examples: 'หมอพร้อม, LINE Official Account รพ., Telehealth App, Smart Kiosk'
  },
  {
    id: 'cat_ai',
    name: 'AI (ปัญญาประดิษฐ์)',
    subtitle: 'ปัญญาประดิษฐ์ทางการแพทย์ ระบบประมวลผลภาษา และเครื่องมืออัตโนมัติ',
    iconName: 'Bot',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    suggestedTags: [
      'AI วิเคราะห์ภาพรังสีทรวงอก (CXR AI)',
      'Enterprise AI Subscription (ChatGPT / Claude / Copilot)',
      'Local AI / On-Premise LLM',
      'AI แชตบอตตอบคำถาม/คัดกรองอาการ',
      'AI ถอดความเสียงเป็นข้อความ (Speech to Text)',
      'AI ช่วยวิเคราะห์ข้อมูลสุขภาพ'
    ],
    examples: 'Qure.ai (qXR), DeepTek, ChatGPT Enterprise, Claude Team, Local Llama'
  }
];

export const DEVELOPER_TYPES = [
  { value: 'vendor', label: 'จ้างบริษัทพัฒนา (Vendor)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'in_house', label: 'พัฒนาเองใน รพ. (In-House)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'central', label: 'ส่วนกลางจัดหา (กระทรวง/สป.สธ.)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'other', label: 'อื่นๆ / ภายนอก', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export const DEPLOYMENT_TYPES = [
  { value: 'on_premise', label: 'On-Premise (Server รพ.)' },
  { value: 'cloud', label: 'Cloud Hosting' },
  { value: 'subscription', label: 'SaaS / Subscription รายเดือน-ปี' },
  { value: 'local', label: 'Local App ประจำเครื่อง' },
  { value: 'other', label: 'อื่นๆ' },
];

export const CATEGORY_STATUS_OPTIONS = [
  { value: 'has_system', label: 'มีระบบงาน', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'no_system', label: 'ยังไม่มีระบบ / ดำเนินการแบบเดิม (กระดาษ/แมนนวล)', badgeClass: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'in_procurement', label: 'อยู่ระหว่างจัดหา / พัฒนา', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
];
