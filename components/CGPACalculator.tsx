import React, { useState } from 'react';
import { CGPASemester, UserInfo } from '../types';
import { getLetterFromGP } from '../utils/gradingLogic';
import { exportCGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';

interface Props {
  theme: any;
}

const CGPACalculator: React.FC<Props> = ({ theme }) => {
  const [semesters, setSemesters] = useState<CGPASemester[]>([
    { id: '1', name: 'Semester 1', sgpa: '', credits: 18, gradeLetter: 'F', isLocked: false }
  ]);
  const [cgpa, setCgpa] = useState(0);
  const [overallGrade, setOverallGrade] = useState('F');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addRow = () => {
    const updated = semesters.map(s => ({ ...s, isLocked: true }));
    const nextNum = semesters.length + 1;
    setSemesters([...updated, { 
      id: nextNum.toString(), 
      name: `Semester ${nextNum}`, 
      sgpa: '', 
      credits: 18, 
      gradeLetter: 'F',
      isLocked: false 
    }]);
  };

  const editRow = (id: string) => {
    const idx = semesters.findIndex(s => s.id === id);
    setSemesters(prev => prev.map((s, i) => {
      if (s.id === id) return { ...s, isLocked: false };
      // All rows BELOW (i > idx) the focused row become totally immutable
      if (i > idx) return { ...s, isLocked: true };
      return s;
    }));
  };

  const removeRow = (id: string) => {
    if (semesters.length > 1) {
      const filtered = semesters.filter(s => s.id !== id);
      const remapped = filtered.map((s, index) => ({
        ...s,
        id: (index + 1).toString(),
        name: `Semester ${index + 1}`
      }));
      setSemesters(remapped);
    }
  };

  const handleInputChange = (id: string, field: keyof CGPASemester, value: string) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === id) {
        let finalVal = value;

        if (field === 'sgpa') {
          // Strictly floating point. Max 4.00. No alphabets.
          let cleaned = value.replace(/[^0-9.]/g, '');
          let floatVal = parseFloat(cleaned);
          if (isNaN(floatVal)) finalVal = '';
          else {
            if (floatVal > 4.00) floatVal = 4.00;
            finalVal = floatVal.toString();
          }
        }

        if (field === 'credits') {
          // Strictly integer. No decimals, no alphabets. Max 21.
          let cleaned = value.replace(/\D/g, '');
          let num = parseInt(cleaned);
          if (isNaN(num)) finalVal = '';
          else {
            if (num > 21) num = 21;
            finalVal = num.toString();
          }
        }

        const updated = { ...s, [field]: finalVal };
        if (field === 'sgpa' && finalVal !== '') {
          const val = parseFloat(finalVal);
          updated.gradeLetter = getLetterFromGP(val);
        } else if (field === 'sgpa' && finalVal === '') {
          updated.gradeLetter = 'F';
        }
        return updated;
      }
      return s;
    }));
    setIsCalculated(false);
  };

  const handleBlur = (id: string, field: keyof CGPASemester, value: string) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === id) {
        let corrected = value;
        if (field === 'sgpa') {
          const val = parseFloat(value);
          if (!isNaN(val)) {
            corrected = val.toFixed(2);
          } else {
            corrected = '0.00';
          }
        }
        if (field === 'credits') {
          let num = parseInt(value);
          if (isNaN(num)) num = 18; // Default if empty
          if (num < 12) num = 12;
          if (num > 21) num = 21;
          corrected = num.toString();
        }
        return { ...s, [field]: corrected };
      }
      return s;
    }));
  };

  const calculateTotal = () => {
    let totalWeightedSGPA = 0;
    let totalCredits = 0;
    let hasError = false;

    semesters.forEach(s => {
      const gpa = parseFloat(s.sgpa.toString());
      const credits = parseInt(s.credits.toString());

      if (isNaN(gpa) || gpa < 0 || gpa > 4.00 || isNaN(credits) || credits < 12 || credits > 21) {
        hasError = true;
      } else {
        totalWeightedSGPA += (gpa * credits);
        totalCredits += credits;
      }
    });

    if (hasError || totalCredits === 0) {
      alert("Check inputs: SGPA (0-4.00) and Credits (12-21) are required for all semesters.");
      return;
    }

    const res = totalWeightedSGPA / totalCredits;
    setCgpa(res);
    setOverallGrade(getLetterFromGP(res));
    setIsCalculated(true);
  };

  const resetAll = () => {
    setSemesters([{ id: '1', name: 'Semester 1', sgpa: '', credits: 18, gradeLetter: 'F', isLocked: false }]);
    setCgpa(0);
    setOverallGrade('F');
    setIsCalculated(false);
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, cgpa, overallGrade, userInfo);
  };

  return (
    <div className={`${theme.card} rounded-2xl p-6 shadow-sm border ${theme.border}`}>
      <UserInfoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Cumulative Grade Sheet Details"
        isCGPA={true}
        rowCount={semesters.length}
        theme={theme}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Cumulative GPA</h2>
        <button 
          onClick={resetAll}
          className="text-red-500 text-sm font-medium hover:opacity-70 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto -mx-6 mb-6">
        <table className="w-full text-left min-w-[600px] border-collapse">
          <thead>
            <tr className={`bg-gray-50 border-y ${theme.border}`}>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider w-[40%]">Semester Order</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[25%] text-center">Obtained SGPA</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[25%] text-center">Total Credits</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider w-[10%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/10">
            {semesters.map((sem) => (
              <tr key={sem.id} className={`${sem.isLocked ? 'opacity-60 bg-black/5' : 'hover:bg-white/5'} transition-colors`}>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    disabled
                    value={sem.name}
                    className="w-full px-3 py-2 bg-black/5 border border-transparent rounded-lg text-gray-400 font-semibold text-sm cursor-not-allowed"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    disabled={sem.isLocked}
                    placeholder="0.00 - 4.00"
                    value={sem.sgpa}
                    onChange={(e) => handleInputChange(sem.id, 'sgpa', e.target.value)}
                    onBlur={(e) => handleBlur(sem.id, 'sgpa', e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${theme.border}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    disabled={sem.isLocked}
                    placeholder="12 - 21"
                    value={sem.credits}
                    onChange={(e) => handleInputChange(sem.id, 'credits', e.target.value)}
                    onBlur={(e) => handleBlur(sem.id, 'credits', e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${theme.border}`}
                  />
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {sem.isLocked && (
                      <button 
                        onClick={() => editRow(sem.id)}
                        className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${theme.accent}`}
                        title="Edit Row"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    )}
                    <button 
                      onClick={() => removeRow(sem.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove Row"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={addRow}
          className={`px-6 py-2.5 bg-transparent border ${theme.border} ${theme.accent} font-medium rounded-full hover:bg-black/5 transition-all flex items-center gap-2`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Semester
        </button>
        <button 
          onClick={calculateTotal}
          className={`px-8 py-2.5 text-white font-semibold rounded-full hover:opacity-90 shadow-sm transition-all ${theme.primary}`}
        >
          Calculate CGPA
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!isCalculated}
          className={`px-6 py-2.5 font-medium rounded-full transition-all flex items-center gap-2 ${
            isCalculated 
            ? `bg-black/10 border ${theme.border}` 
            : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export Transcript
        </button>
      </div>

      {isCalculated && (
        <div className={`rounded-3xl p-8 text-center text-white transform transition-all animate-in zoom-in-95 ${theme.primary}`}>
          <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-2">Cumulative Grade Point Average</p>
          <h3 className="text-6xl font-black mb-2">{cgpa.toFixed(2)}</h3>
          <p className="text-xl font-medium opacity-90">Overall Standing: <span className="font-bold border-b-2 border-white/40 px-1">{overallGrade}</span></p>
        </div>
      )}
    </div>
  );
};

export default CGPACalculator;