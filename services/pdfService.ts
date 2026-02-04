
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SGPASubject, CGPASemester, UserInfo } from '../types';
import { AWKUM_LOGO_URL } from '../constants';

// Extending jsPDF type to include the lastAutoTable property added by the plugin
type jsPDFWithAutoTable = jsPDF & {
  lastAutoTable: { finalY: number };
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

const drawHeader = async (doc: jsPDF, title: string, userInfo: UserInfo) => {
  let logoLoaded = false;
  try {
    const img = await loadImage(AWKUM_LOGO_URL);
    doc.addImage(img, 'PNG', 15, 12, 22, 22);
    logoLoaded = true;
  } catch (e) {
    try {
       const fallbackImg = await loadImage('AWKUM.png');
       doc.addImage(fallbackImg, 'PNG', 15, 12, 22, 22);
       logoLoaded = true;
    } catch (innerE) {
      console.warn("Logo failed to load.");
    }
  }

  if (!logoLoaded) {
    doc.setDrawColor(0, 90, 193);
    doc.setLineWidth(0.5);
    doc.rect(15, 12, 22, 22);
    doc.setFontSize(6);
    doc.setTextColor(0, 90, 193);
    doc.text("AWKUM", 20, 24);
  }

  // Right-aligned Passport Photo
  if (userInfo.photo) {
    try {
      doc.addImage(userInfo.photo, 'JPEG', 165, 12, 25, 30);
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.rect(165, 12, 25, 30);
    } catch (e) {
      console.warn("Photo add error", e);
    }
  }

  doc.setFontSize(18);
  doc.setTextColor(0, 90, 193);
  doc.setFont("helvetica", "bold");
  doc.text("Abdul Wali Khan University Mardan", 42, 20);

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(title, 42, 27);

  doc.setDrawColor(0, 90, 193);
  doc.setLineWidth(0.8);
  doc.line(15, 45, 195, 45);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const startX = 15;
  const col2X = 110;
  let currentY = 53;
  const lineHeight = 6;

  const degreeText = userInfo.programme === "Undergraduate (BS)" 
    ? `BS ${userInfo.subject}${userInfo.minor ? ' - ' + userInfo.minor : ''}`
    : `${userInfo.programme} ${userInfo.subject}`;

  // Column 1
  doc.setFont("helvetica", "bold"); doc.text("Student Name:", startX, currentY);
  doc.setFont("helvetica", "normal"); doc.text(userInfo.name.toUpperCase() || 'N/A', startX + 30, currentY);
  
  currentY += lineHeight;
  doc.setFont("helvetica", "bold"); doc.text("Father's Name:", startX, currentY);
  doc.setFont("helvetica", "normal"); doc.text(userInfo.fatherName.toUpperCase() || 'N/A', startX + 30, currentY);

  currentY += lineHeight;
  doc.setFont("helvetica", "bold"); doc.text("Registration No:", startX, currentY);
  doc.setFont("helvetica", "normal"); doc.text(userInfo.registrationNumber || 'N/A', startX + 30, currentY);

  // Column 2
  currentY = 53;
  doc.setFont("helvetica", "bold"); doc.text("Degree:", col2X, currentY);
  doc.setFont("helvetica", "normal"); doc.text(degreeText, col2X + 25, currentY);

  currentY += lineHeight;
  doc.setFont("helvetica", "bold"); doc.text("Semester:", col2X, currentY);
  doc.setFont("helvetica", "normal"); doc.text(`${userInfo.semester}-${userInfo.section}`, col2X + 35, currentY);

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  doc.line(15, 75, 195, 75);

  return 85;
};

export async function exportSGPA_PDF(subjects: SGPASubject[], gpa: number, grade: string, userInfo: UserInfo) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const startY = await drawHeader(doc, "PROVISIONAL SEMESTER GRADE SHEET", userInfo);

  const head = [['Subject Description', 'Credits', 'Marks', 'Grade Point', 'Grade']];
  const body = subjects.map(s => [
    s.code ? `${s.name} (${s.code})` : (s.name || 'Untitled Subject'),
    s.credits,
    s.marks,
    s.gradePoint.toFixed(2),
    s.gradeLetter
  ]);

  autoTable(doc, {
    startY: startY,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [0, 90, 193], halign: 'center' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFillColor(245, 247, 255);
  doc.rect(15, finalY, 180, 22, 'F');
  doc.setDrawColor(0, 90, 193);
  doc.setLineWidth(0.5);
  doc.rect(15, finalY, 180, 22, 'S');
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Semester GPA: ${gpa.toFixed(2)}`, 25, finalY + 14);
  doc.text(`Grade: ${grade}`, 140, finalY + 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text("Note: This is a computer-generated provisional document. Accuracy is subject to verification with official record.", 105, 285, { align: 'center' });

  doc.save(`${userInfo.registrationNumber}_SGPA.pdf`);
}

export async function exportCGPA_PDF(semesters: CGPASemester[], cgpa: number, grade: string, userInfo: UserInfo) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const startY = await drawHeader(doc, "PROVISIONAL CUMULATIVE GRADE SHEET", userInfo);

  const head = [['Semester Order', 'Semester SGPA', 'Credit Hours', 'Quality Points']];
  const body = semesters.map(s => [
    s.name || 'Untitled Semester',
    Number(s.sgpa).toFixed(2),
    s.credits,
    (Number(s.sgpa) * Number(s.credits)).toFixed(2)
  ]);

  autoTable(doc, {
    startY: startY,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [0, 90, 193], halign: 'center' },
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  doc.setFillColor(245, 247, 255);
  doc.rect(15, finalY, 180, 22, 'F');
  doc.setDrawColor(0, 90, 193);
  doc.setLineWidth(0.5);
  doc.rect(15, finalY, 180, 22, 'S');
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Cumulative GPA: ${cgpa.toFixed(2)}`, 25, finalY + 14);
  doc.text(`Overall Grade: ${grade}`, 140, finalY + 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text("Note: This is a provisional transcript generated for student use. Official documents issued by Exam Dept.", 105, 285, { align: 'center' });

  doc.save(`${userInfo.registrationNumber}_CGPA.pdf`);
}
