import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const links = [
  { t: "MOPH ERP", u: "https://referlink.moph.go.th/mopherp/#/", i: "ri-server-line", d: "ระบบบริหารจัดการทรัพยากรองค์กร" },
  { t: "รายงานผลความพึงพอใจ", u: "https://bdh-service.moph.go.th/survey/", i: "ri-emotion-happy-line", d: "ระบบรายงานผลการประเมินความพึงพอใจ" },
  { t: "Dashboard Health ID", u: "https://app.powerbi.com/view?r=eyJrIjoiYjUwZWFmY2EtMmUwNS00Mjg2LTkyMzItZThiMGNlMzhhMmRmIiwidCI6ImI3NmEyM2QzLThjZGYtNDNjMC1hNTNiLTYwYmNkMjM3OTg5NSIsImMiOjEwfQ%3D%3D", i: "ri-bar-chart-groupped-line", d: "Health ID ทารกแรกเกิด หรือ แยกช่วงอายุ" },
  { t: "Telemedicine หมอพร้อม/สอน.บัดดี้", u: "https://lookerstudio.google.com/u/0/reporting/33f2a1d7-2f28-43b1-85ea-6cf3e8d579ac/page/p_q5mrcvqeyd", i: "ri-video-add-line", d: "จำนวนการให้บริการ Telemedicine" },
  { t: "Cyber security CTAM+", u: "https://ict.moph.go.th/th/extension/1763", i: "ri-shield-check-line", d: "เกณฑ์ประเมิน Cyber Security" },
  { t: "รพ.อัจฉริยะ 2569", u: "https://bdh-service.moph.go.th/smarthosp2569/", i: "ri-hospital-line", d: "ระบบประเมิน Smart Hospital 2569" },
  { t: "คู่มือหมอไม่ล้า 69ฯ", u: "https://bdh.moph.go.th/site/wp-content/uploads/2025/12/SOP-%E0%B8%AB%E0%B8%A1%E0%B8%AD%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A5%E0%B9%89%E0%B8%B2-3.pdf", i: "ri-book-read-line", d: "คู่มือการดำเนินงานระบบที่เกี่ยวข้องกับนโยบาย" },
  { t: "นโยบายยกระดับ 30 บาท", u: "https://health-mis-dashboard.moph.go.th/main/login", i: "ri-bank-card-line", d: "Onepage Jumbo, Cyber, Provider ID, MOPH Cert, etc." },
  { t: "Telemedicine (HDC จาก HIS)", u: "https://hdc.moph.go.th/center/public/standard-report-detail/2d85d6ec39840f8051854b028fa13073", i: "ri-video-chat-line", d: "ข้อมูลเลื่อนระดับ Telemedicine HDC" },
  { t: "ลายมือชื่ออิเล็กทรอนิกส์ (CA)", u: "https://app.powerbi.com/view?r=eyJrIjoiNjc2ODAxMWUtM2ViMC00ZDU3LTg1YTEtMjcxOTczNmI3OWViIiwidCI6ImI3NmEyM2QzLThjZGYtNDNjMC1hNTNiLTYwYmNkMjM3OTg5NSIsImMiOjEwfQ%3D%3D", i: "ri-pen-nib-line", d: "Dashboard ติดตาม CA" },
  { t: "ใบรับรองแพทย์อิเล็กทรอนิกส์", u: "https://app.powerbi.com/view?r=eyJrIjoiM2Y0MTAwZjItZDYwNC00MmUyLTlmZjktM2I1MWM3YjY3MjRmIiwidCI6ImI3NmEyM2QzLThjZGYtNDNjMC1hNTNiLTYwYmNkMjM3OTg5NSIsImMiOjEwfQ%3D%3D", i: "ri-file-paper-2-line", d: "Dashboard ติดตามใบรับรองแพทย์ดิจิทัล" },
  { t: "รพ.อัจฉริยะ 2568", u: "https://bdh-service.moph.go.th/smarthosp-quest/login", i: "ri-hospital-line", d: "ระบบประเมิน Smart Hospital 2568" },
  { t: "สอน.บัดดี้", u: "https://dashboard-dhi.one.th/dashboard_buddy_care", i: "ri-heart-pulse-line", d: "Dashboard สอน.บัดดี้" },
  { t: "moph refer", u: "https://moph-refer.inet.co.th/Dashboard-refer", i: "ri-ambulance-line", d: "ระบบส่งต่อผู้ป่วย" },
  { t: "Thailand Health Atlas", u: "https://thailandhealthatlas.buddy-care.org", i: "ri-map-pin-user-line", d: "แผนที่สุขภาพประเทศไทย" },
  { t: "Imaging Hub", u: "https://imaginghub-dashboard.one.th/area_view?area=06", i: "ri-image-line", d: "ศูนย์ข้อมูลภาพถ่ายทางการแพทย์" },
  { t: "ติดตามผล FDH", u: "https://dashboard-dhi.one.th/dashboard_telemedicine", i: "ri-pulse-line", d: "ติดตามผลการดำเนินงาน FDH" }
];

async function migrate() {
  console.log("Migrating resources...");
  
  const mappedLinks = links.map(link => {
    let category = "general";
    if (link.u.includes("powerbi.com") || link.u.includes("dashboard") || link.u.includes("lookerstudio") || link.u.includes("report")) {
      category = "dashboard";
    } else if (link.t.includes("คู่มือ") || link.u.includes(".pdf")) {
      category = "document";
    }
    
    return {
      title: link.t,
      url: link.u,
      description: link.d,
      category: category
    };
  });
  
  const { data, error } = await supabase.from('resources').insert(mappedLinks);
  
  if (error) {
    console.error("Error inserting resources:", error);
  } else {
    console.log("Successfully inserted resources!");
  }
}

migrate();
