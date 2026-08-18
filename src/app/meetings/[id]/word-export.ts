// Function to build HTML content for the Minutes of Meeting
export function buildMinutesHTML(opts: {
  meetingName: string;
  meetingDate?: string;
  location?: string;
  agendas: any[];
}) {
  const { meetingName, meetingDate, location, agendas } = opts;

  // Format date
  let dateDisplay = 'ยังไม่กำหนดวันที่';
  if (meetingDate) {
    const d = new Date(meetingDate);
    const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    dateDisplay = `วันที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  }

  // Build Agendas HTML
  let agendasHTML = '';
  if (agendas && agendas.length > 0) {
    agendas.forEach((agenda) => {
      // Agenda Title
      agendasHTML += `<div style="font-weight:bold;margin-top:16pt;margin-bottom:4pt;font-size:16pt;">
        ระเบียบวาระที่ ${toThaiNumeral(agenda.order_index)} ${agenda.title}
      </div>`;
      
      // Agenda Description
      if (agenda.description) {
        agendasHTML += `<div style="text-indent:2.5cm;margin-bottom:8pt;font-size:16pt;">
          ${agenda.description.replace(/\n/g, '<br>')}
        </div>`;
      }

      // Resolutions
      if (agenda.resolutions && agenda.resolutions.length > 0) {
        agenda.resolutions.forEach((res: any) => {
          agendasHTML += `<div style="text-indent:2.5cm;font-weight:bold;margin-bottom:4pt;font-size:16pt;">
            มติ: ${res.resolution_type} ${res.detail ? `(${res.detail})` : ''}
          </div>`;
        });
      } else {
        agendasHTML += `<div style="text-indent:2.5cm;font-style:italic;color:#666;margin-bottom:4pt;font-size:16pt;">
          (ยังไม่มีการบันทึกมติ)
        </div>`;
      }
    });
  } else {
    agendasHTML = `<div style="text-indent:2.5cm;margin-top:16pt;font-size:16pt;">(ไม่มีวาระการประชุม)</div>`;
  }

  return `
  <div style="font-family:'TH Sarabun PSK','TH Sarabun New','Sarabun',sans-serif;font-size:16pt;line-height:1.5;color:#000;">
    <div style="text-align:center;font-weight:bold;font-size:18pt;line-height:1.5;">
      รายงานการประชุม<br>
      ${meetingName}<br>
      <span style="font-size:16pt;">${dateDisplay} ${location ? `ณ ${location}` : ''}</span>
    </div>
    
    <div style="text-align:center;font-size:16pt;letter-spacing:4px;margin:16pt 0;">
      ***************************
    </div>

    ${agendasHTML}

    <table style="width:100%;margin-top:60pt;border-collapse:collapse;border:none;page-break-inside:avoid;">
      <tr>
        <td style="width:50%;text-align:center;border:none;"></td>
        <td style="width:50%;text-align:center;border:none;">
          <div>..............................................................</div>
          <div style="margin-top:4pt;">ผู้บันทึกรายงานการประชุม</div>
        </td>
      </tr>
    </table>
  </div>`;
}

// Convert numbers to Thai numerals for formal documents
function toThaiNumeral(num: number | string): string {
  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return String(num).replace(/[0-9]/g, (match) => thaiNums[parseInt(match)]);
}

// Export the generated HTML content into a MS Word (.doc) file
export function exportToWord(htmlContent: string, filename: string = 'document', landscape: boolean = false) {
  const pageSize = landscape
    ? 'size: 841.9pt 595.3pt;'
    : 'size: 595.3pt 841.9pt;'
  const margin = landscape
    ? 'margin: 1.5cm 1.5cm 1.5cm 2cm;'
    : 'margin: 2.5cm 2cm 2cm 3cm;'

  const h1 = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
  const h2 = '<head><meta charset="utf-8"><title>' + filename + '</title>'
  const h3 = '<style>@page Section1 { ' + pageSize + ' ' + margin + ' mso-header-margin:35.4pt;mso-footer-margin:35.4pt;mso-paper-source:0; } div.Section1 { page:Section1; } body { font-family:"TH Sarabun PSK","TH Sarabun New","Sarabun",sans-serif;font-size:16pt;line-height:1.5;color:#000; } table { width:100%;border-collapse:collapse; } th,td { border:1pt solid black;padding:4pt 6pt;vertical-align:top; } .print-black { color: #000 !important; }</style></head><body><div class="Section1">'
  const footer = '</div></body></html>'
  const sourceHTML = h1 + h2 + h3 + htmlContent + footer

  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  document.body.appendChild(a)
  a.href = url
  a.download = filename + '.doc'
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
