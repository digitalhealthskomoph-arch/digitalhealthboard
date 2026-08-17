// Export to Word utility for Strategic Plan

export function exportToWord(htmlContent: string, filename: string = 'document') {
  const pageSize = 'size: 595.3pt 841.9pt;';
  const margin = 'margin: 2.5cm 2cm 2cm 3cm;';

  const h1 = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
  const h2 = '<head><meta charset="utf-8"><title>' + filename + '</title>';
  const h3 = '<style>@page Section1 { ' + pageSize + ' ' + margin + ' mso-header-margin:35.4pt;mso-footer-margin:35.4pt;mso-paper-source:0; } div.Section1 { page:Section1; } body { font-family:"TH Sarabun PSK","TH Sarabun New","Sarabun",sans-serif;font-size:16pt;line-height:1.5;color:#000; } table { width:100%;border-collapse:collapse;margin-top:10pt;margin-bottom:10pt; } th,td { border:1pt solid black;padding:4pt 6pt;vertical-align:top; } .print-black { color: #000 !important; } h1,h2,h3,h4,h5,h6 { font-weight:bold;margin-top:12pt;margin-bottom:6pt; } .text-center { text-align:center; } .indent { text-indent: 1.5cm; } .page-break { page-break-before: always; }</style></head><body><div class="Section1">';
  const footer = '</div></body></html>';
  const sourceHTML = h1 + h2 + h3 + htmlContent + footer;

  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = filename + '.doc';
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildStrategicPlanHTML(data: {
  plan: any;
  strategies: any[];
  objectives: any[];
  kpis: any[];
  actionPlans: any[];
}) {
  const { plan, strategies, objectives, kpis, actionPlans } = data;

  const title = plan?.title || 'ไม่ระบุชื่อ';

  // Helper for rendering lists
  const renderList = (arr: any[]) => {
    if (!arr || arr.length === 0) return '<p class="indent">-</p>';
    return arr.map((item, i) => `<div class="indent">${i+1}. ${item}</div>`).join('');
  };

  // 1. บทนำ
  let html = `
    <h1 class="text-center" style="font-size:24pt;margin-bottom:40pt;">${title}</h1>
    
    <h2>ส่วนที่ 1 บทนำ</h2>
    <h3>1.1 หลักการและเหตุผล</h3>
    <div class="indent" style="text-align:justify;">${(plan?.rationale || '').replace(/\n/g, '<br>')}</div>
    
    <h3>1.2 ขอบเขตของแผน</h3>
    ${renderList(plan?.scope)}
    
    <h3>1.3 ความสอดคล้องกับนโยบายและยุทธศาสตร์ระดับบน</h3>
    <div class="indent" style="text-align:justify;">${(plan?.alignment || '').replace(/\n/g, '<br>')}</div>
    
    <div class="page-break"></div>
  `;

  // 2. สถานการณ์
  html += `
    <h2>ส่วนที่ 2 การวิเคราะห์สถานการณ์</h2>
    <h3>2.1 ข้อมูลพื้นฐาน (Baseline)</h3>
    <p>สรุปจากข้อมูลตัวชี้วัดของแต่ละยุทธศาสตร์ (โปรดดูรายละเอียดในส่วนที่ 4)</p>
    
    <h3>2.2 การวิเคราะห์จุดแข็ง จุดอ่อน โอกาส และภัยคุกคาม (SWOT)</h3>
    <h4>จุดแข็ง (Strengths)</h4>
    ${renderList(plan?.swot_s)}
    <h4>จุดอ่อน (Weaknesses)</h4>
    ${renderList(plan?.swot_w)}
    <h4>โอกาส (Opportunities)</h4>
    ${renderList(plan?.swot_o)}
    <h4>ภัยคุกคาม (Threats)</h4>
    ${renderList(plan?.swot_t)}
    
    <div class="page-break"></div>
  `;

  // 3. วิสัยทัศน์
  html += `
    <h2>ส่วนที่ 3 วิสัยทัศน์ พันธกิจ และเป้าประสงค์</h2>
    <h3>3.1 วิสัยทัศน์</h3>
    <div class="text-center" style="font-size:20pt;font-weight:bold;margin:20pt 0;">"${plan?.vision || ''}"</div>
    <p><strong>นิยามวิสัยทัศน์:</strong> ${plan?.vision_definition || ''}</p>
    
    <h3>3.2 พันธกิจ</h3>
    ${renderList(plan?.missions)}
    
    <h3>3.3 เป้าประสงค์หลัก</h3>
    <p>ระบุไว้ภายใต้แต่ละยุทธศาสตร์ในส่วนที่ 4</p>
    
    <div class="page-break"></div>
  `;

  // 4. ยุทธศาสตร์
  html += `
    <h2>ส่วนที่ 4 ยุทธศาสตร์ ตัวชี้วัด และแนวทางดำเนินการ</h2>
  `;
  
  strategies.forEach((strat, sIndex) => {
    html += `
      <h3 style="margin-top:20pt;">${strat.name}</h3>
      <p><strong>นิยามยุทธศาสตร์และความเชื่อมโยง:</strong></p>
      ${renderList(strat.definition)}
      <p><strong>มาตรการหลัก:</strong></p>
      ${renderList(strat.measures)}
    `;

    const stratObjs = objectives.filter(o => o.strategy_id === strat.id);
    stratObjs.forEach((obj, oIndex) => {
      html += `
        <h4 style="margin-left:20pt;margin-top:10pt;">เป้าประสงค์: ${obj.name}</h4>
      `;
      const objKpis = kpis.filter(k => k.objective_id === obj.id);
      objKpis.forEach((kpi, kIndex) => {
        html += `
          <div style="margin-left:40pt;margin-bottom:20pt;border:1pt solid #ccc;padding:10pt;">
            <div style="font-weight:bold;margin-bottom:10pt;">ตัวชี้วัด: ${kpi.name}</div>
            <table style="width:100%;border-collapse:collapse;font-size:14pt;">
              <tr><td style="width:30%;font-weight:bold;">สถานะความพร้อมวัด</td><td>${kpi.readiness_status || '-'}</td></tr>
              <tr><td style="font-weight:bold;">ผู้รับผิดชอบ</td><td>${kpi.responsible_person || '-'}</td></tr>
              <tr><td style="font-weight:bold;">นิยามเชิงปฏิบัติการ</td><td>${kpi.op_definition || '-'}</td></tr>
              <tr><td style="font-weight:bold;">สูตรคำนวณ</td><td>${kpi.calc_formula || '-'}</td></tr>
              <tr><td style="font-weight:bold;">ตัวตั้ง</td><td>${kpi.numerator || '-'}</td></tr>
              <tr><td style="font-weight:bold;">ตัวหาร</td><td>${kpi.denominator || '-'}</td></tr>
              <tr><td style="font-weight:bold;">แหล่งข้อมูล</td><td>${kpi.data_source || '-'}</td></tr>
              <tr><td style="font-weight:bold;">วิธีดึงข้อมูล</td><td>${kpi.extraction_method || '-'}</td></tr>
              <tr><td style="font-weight:bold;">ความถี่การวัด</td><td>${kpi.frequency || '-'}</td></tr>
              <tr><td style="font-weight:bold;">เป้าปี 2570</td><td>${kpi.target_2570 || '-'}</td></tr>
              <tr><td style="font-weight:bold;">เป้าปี 2571</td><td>${kpi.target_2571 || '-'}</td></tr>
              <tr><td style="font-weight:bold;">เป้าปี 2572</td><td>${kpi.target_2572 || '-'}</td></tr>
              <tr><td style="font-weight:bold;">สิ่งที่ต้องทำก่อนวัด</td><td>${kpi.prerequisites || '-'}</td></tr>
            </table>
          </div>
        `;
      });
    });
  });

  html += `<div class="page-break"></div>`;

  // 5. แผนปฏิบัติการ
  html += `
    <h2>ส่วนที่ 5 แผนปฏิบัติการประจำปีงบประมาณ</h2>
    <table>
      <thead>
        <tr>
          <th>ยุทธศาสตร์</th>
          <th>กิจกรรมหลัก</th>
          <th>ผู้รับผิดชอบหลัก</th>
          <th>ไตรมาส</th>
          <th>งบประมาณ (บาท)</th>
        </tr>
      </thead>
      <tbody>
  `;
  if(actionPlans.length === 0) {
    html += `<tr><td colspan="5" class="text-center">ไม่มีแผนปฏิบัติการ</td></tr>`;
  } else {
    actionPlans.forEach(p => {
      const stratName = strategies.find(s => s.id === p.strategy_id)?.name || '';
      html += `
        <tr>
          <td>${stratName}</td>
          <td>${p.activity_name}</td>
          <td>${p.responsible_person || '-'}</td>
          <td class="text-center">${p.quarter}</td>
          <td style="text-align:right;">${Number(p.budget).toLocaleString()}</td>
        </tr>
      `;
    });
  }
  html += `
      </tbody>
    </table>
  `;

  return html;
}
