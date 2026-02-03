
import React, { useState } from 'react';
import { CGPASemester, UserInfo } from '../types';
import { getLetterFromGP } from '../utils/gradingLogic';
import { exportCGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';

const CGPACalculator: React.FC = () => {
  const [semesters, setSemesters] = useState<CGPASemester[]>([
    { id: '1', name: 'Semester 1', sgpa: '', credits: 18, gradeLetter: 'F' }
  ]);
  const [cgpa, setCgpa] = useState(0);
  const [overallGrade, setOverallGrade] = useState('F');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addRow = () => {
    const nextNum = semesters.length + 1;
    setSemesters([...semesters, { 
      id: nextNum.toString(), 
      name: `Semester ${nextNum}`, 
      sgpa: '', 
      credits: 18, 
      gradeLetter: 'F' 
    }]);
  };

  const removeRow = (id: string) => {
    if (semesters.length > 1) {
      // Re-map names to maintain order
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
        if (field === 'credits') {
          const num = parseFloat(value);
          if (num > 21) finalVal = '21';
        }

        const updated = { ...s, [field]: finalVal };
        if (field === 'sgpa') {
          const val = parseFloat(value);
          if (!isNaN(val) && val >= 0 && val <= 4.00) {
            updated.gradeLetter = getLetterFromGP(val);
          } else {
            updated.gradeLetter = 'F';
          }
        }
        return updated;
      }
      return s;
    }));
    setIsCalculated(false);
  };

  const calculateTotal = () => {
    let totalWeightedSGPA = 0;
    let totalCredits = 0;
    let hasError = false;

    semesters.forEach(s => {
      const gpa = parseFloat(s.sgpa.toString());
      const credits = parseFloat(s.credits.toString());

      if (isNaN(gpa) || gpa < 0 || gpa > 4.00 || isNaN(credits) || credits <= 0 || credits > 21) {
        hasError = true;
      } else {
        totalWeightedSGPA += (gpa * credits);
        totalCredits += credits;
      }
    });

    if (hasError || totalCredits === 0) {
      alert("Check inputs: SGPA (0-4.00) and Credits (1-21) are required for all semesters.");
      return;
    }

    const res = totalWeightedSGPA / totalCredits;
    setCgpa(res);
    setOverallGrade(getLetterFromGP(res));
    setIsCalculated(true);
  };

  const resetAll = () => {
    setSemesters([{ id: '1', name: 'Semester 1', sgpa: '', credits: 18, gradeLetter: 'F' }]);
    setCgpa(0);
    setOverallGrade('F');
    setIsCalculated(false);
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, cgpa, overallGrade, userInfo);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <UserInfoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Cumulative Grade Sheet Details"
        isCGPA={true}
        rowCount={semesters.length}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Cumulative GPA</h2>
        <button 
          onClick={resetAll}
          className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto -mx-6 mb-6">
        <table className="w-full text-left min-w-[600px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">Semester Order</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%] text-center">Obtained SGPA</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%] text-center">Total Credits</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {semesters.map((sem) => (
              <tr key={sem.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    disabled
                    value={sem.name}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-semibold text-sm cursor-not-allowed"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00 - 4.00"
                    value={sem.sgpa}
                    onChange={(e) => handleInputChange(sem.id, 'sgpa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${
                      (Number(sem.sgpa) > 4 || Number(sem.sgpa) < 0) ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    max="21"
                    placeholder="Max 21"
                    value={sem.credits}
                    onChange={(e) => handleInputChange(sem.id, 'credits', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center"
                  />
                </td>
                <td className="px-6 py-3 text-right">
                  <button 
                    onClick={() => removeRow(sem.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={addRow}
          className="px-6 py-2.5 bg-white border border-gray-200 text-blue-600 font-medium rounded-full hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Semester
        </button>
        <button 
          onClick={calculateTotal}
          className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-sm transition-all"
        >
          Calculate CGPA
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!isCalculated}
          className={`px-6 py-2.5 font-medium rounded-full transition-all flex items-center gap-2 ${
            isCalculated 
            ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export Transcript
        </button>
      </div>

      {isCalculated && (
        <div className="bg-blue-900 rounded-3xl p-8 text-center text-white transform transition-all animate-in zoom-in-95">
          <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-2">Cumulative Grade Point Average</p>
          <h3 className="text-6xl font-black mb-2">{cgpa.toFixed(2)}</h3>
          <p className="text-xl font-medium opacity-90">Overall Standing: <span className="font-bold border-b-2 border-blue-500 px-1">{overallGrade}</span></p>
          <div className="mt-4 inline-block px-4 py-1 bg-white/10 rounded-full text-sm">
            {cgpa < 2.0 ? '⚠️ Academic Warning: Below Graduation Requirement' : '✅ Satisfactory Standing'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CGPACalculator;
