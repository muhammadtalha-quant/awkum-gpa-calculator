
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SGPASubject, CGPASemester, UserInfo } from '../types';
import { AWKUM_LOGO_URL } from '../constants';

type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => void;
  lastAutoTable: { finalY: number };
};

const drawHeader = (doc: jsPDFWithAutoTable, title: string, userInfo: UserInfo) => {
  // Logo
  try {
    doc.addImage(AWKUM_LOGO_URL, 'PNG', 15, 10, 25, 25);
  } catch (e) {
    console.warn("Logo failed to load for PDF", e);
  }

  // University Name
  doc.setFontSize(18);
  doc.setTextColor(0, 90, 193); // AWKUM Blue
  doc.setFont("helvetica", "bold");
  doc.text("Abdul Wali Khan University Mardan", 45, 20);

  // Document Title
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text(title, 45, 27);

  // Divider
  doc.setDrawColor(0, 90, 193);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);

  // Student Info Block
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const startX = 15;
  const startY = 46;
  const rowHeight = 6;

  doc.setFont("helvetica", "bold");
  doc.text("Name:", startX, startY);
  doc.text("Father's Name:", startX, startY + rowHeight);
  doc.text("Registration No:", startX, startY + (rowHeight * 2));

  doc.setFont("helvetica", "normal");
  doc.text(userInfo.name.toUpperCase(), startX + 35, startY);
  doc.text(userInfo.fatherName.toUpperCase(), startX + 35, startY + rowHeight);
  doc.text(userInfo.registrationNumber.toUpperCase(), startX + 35, startY + (rowHeight * 2));

  // Secondary Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.1);
  doc.line(15, 65, 195, 65);

  return 70; // Return next Y position
};

export async function exportSGPA_PDF(subjects: SGPASubject[], gpa: number, grade: string, userInfo: UserInfo) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  const startY = drawHeader(doc, "Provisional Semester Grade Sheet", userInfo);

  const head = [['Subject', 'Credit Hours', 'Obtained Marks', 'Grade Point', 'Grade']];
  const body = subjects.map(s => [
    s.name || 'Untitled Subject',
    s.credits,
    s.marks,
    s.gradePoint.toFixed(2),
    s.gradeLetter
  ]);

  doc.autoTable({
    startY: startY,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [0, 90, 193], halign: 'center' },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  
  // Results Box
  doc.setDrawColor(0, 90, 193);
  doc.setLineWidth(0.5);
  doc.rect(15, finalY, 180, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`SEMESTER GPA: ${gpa.toFixed(2)}`, 20, finalY + 12);
  doc.text(`LETTER GRADE: ${grade}`, 130, finalY + 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text("This is a provisional computer-generated document. Original DMC will be issued by the Controller of Examinations.", 105, 285, { align: 'center' });

  doc.save(`${userInfo.registrationNumber}_SGPA.pdf`);
}

export async function exportCGPA_PDF(semesters: CGPASemester[], cgpa: number, grade: string, userInfo: UserInfo) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  const startY = drawHeader(doc, "Provisional Cumulative Grade Sheet", userInfo);

  const head = [['Semester', 'Obtained SGPA', 'Total Credits', 'Weighted Score']];
  const body = semesters.map(s => [
    s.name || 'Untitled Semester',
    Number(s.sgpa).toFixed(2),
    s.credits,
    (Number(s.sgpa) * Number(s.credits)).toFixed(2)
  ]);

  doc.autoTable({
    startY: startY,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [0, 90, 193], halign: 'center' },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  // Results Box
  doc.setDrawColor(0, 90, 193);
  doc.setLineWidth(0.5);
  doc.rect(15, finalY, 180, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`CUMULATIVE GPA: ${cgpa.toFixed(2)}`, 20, finalY + 12);
  doc.text(`OVERALL GRADE: ${grade}`, 130, finalY + 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text("This is a provisional computer-generated document. Original Transcript will be issued by the Controller of Examinations.", 105, 285, { align: 'center' });

  doc.save(`${userInfo.registrationNumber}_CGPA.pdf`);
}
