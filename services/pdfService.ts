
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SGPASubject, CGPASemester } from '../types';
import { AWKUM_LOGO_URL } from '../constants';

// Extending jsPDF with autotable plugin functionality
// In a standard React environment with types, we treat it as any for the plugin methods
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => void;
  lastAutoTable: { finalY: number };
};

export async function exportSGPA_PDF(subjects: SGPASubject[], gpa: number, grade: string) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Header
  try {
    doc.addImage(AWKUM_LOGO_URL, 'PNG', 15, 15, 25, 25);
  } catch (e) {
    console.error("Logo failed to load", e);
  }

  doc.setFontSize(20);
  doc.setTextColor(0, 90, 193);
  doc.text("Abdul Wali Khan University Mardan", 50, 25);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Provisional Semester Grade Sheet", 50, 32);

  doc.setLineWidth(0.5);
  doc.line(15, 45, 195, 45);

  const head = [['Subject', 'Credit Hours', 'Obtained Marks', 'Grade Point', 'Grade']];
  const body = subjects.map(s => [
    s.name || 'Untitled Subject',
    s.credits,
    s.marks,
    s.gradePoint.toFixed(2),
    s.gradeLetter
  ]);

  doc.autoTable({
    startY: 55,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [0, 90, 193] },
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Semester GPA: ${gpa.toFixed(2)}`, 15, finalY);
  doc.text(`Letter Grade: ${grade}`, 15, finalY + 8);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("This is a system-generated document for unofficial use only.", 105, 280, { align: 'center' });

  doc.save(`AWKUM_SGPA_${new Date().getTime()}.pdf`);
}

export async function exportCGPA_PDF(semesters: CGPASemester[], cgpa: number, grade: string) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  try {
    doc.addImage(AWKUM_LOGO_URL, 'PNG', 15, 15, 25, 25);
  } catch (e) {
    console.error("Logo failed to load", e);
  }

  doc.setFontSize(20);
  doc.setTextColor(0, 90, 193);
  doc.text("Abdul Wali Khan University Mardan", 50, 25);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Provisional Cumulative Grade Sheet", 50, 32);

  doc.setLineWidth(0.5);
  doc.line(15, 45, 195, 45);

  const head = [['Semester', 'Obtained SGPA', 'Total Credits', 'Weighted Score']];
  const body = semesters.map(s => [
    s.name || 'Untitled Semester',
    Number(s.sgpa).toFixed(2),
    s.credits,
    (Number(s.sgpa) * Number(s.credits)).toFixed(2)
  ]);

  doc.autoTable({
    startY: 55,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [0, 90, 193] },
  });

  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Cumulative GPA: ${cgpa.toFixed(2)}`, 15, finalY);
  doc.text(`Overall Grade: ${grade}`, 15, finalY + 8);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("This is a system-generated document for unofficial use only.", 105, 280, { align: 'center' });

  doc.save(`AWKUM_CGPA_${new Date().getTime()}.pdf`);
}
