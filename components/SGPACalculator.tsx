import React, { useState } from 'react';
import { SGPASubject, UserInfo } from '../types';
import { calculateGradePoint, getLetterFromGP } from '../utils/gradingLogic';
import { exportSGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';

interface Props {
  theme: any;
}

const SGPACalculator: React.FC<Props> = ({ theme }) => {
  const [subjects, setSubjects] = useState<SGPASubject[]>([
    { id: '1', name: '', code: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F', isLocked: false }
  ]);
  const [enableCodes, setEnableCodes] = useState(false);
  const [sgpa, setSgpa] = useState(0);
  const [finalGrade, setFinalGrade] = useState('F');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addRow = () => {
    setErrorMsg('');
    const updated = subjects.map(s => ({ ...s, isLocked: true }));
    const newId = (subjects.length + 1).toString();
    setSubjects([...updated, { id: newId, name: '', code: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F', isLocked: false }]);
  };

  const editRow = (id: string) => {
    setErrorMsg('');
    setSubjects(prev => prev.map((s) => ({
      ...s,
      isLocked: s.id !== id
    })));
  };

  const removeRow = (id: string) => {
    setErrorMsg('');
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleInputChange = (id: string, field: keyof SGPASubject, value: string) => {
    setErrorMsg('');
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        let finalVal = value;

        if (field === 'name') {
          finalVal = value.replace(/[^A-Za-z\s]/g, '');
        }

        if (field === 'code') {
          finalVal = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
          const dashCount = (finalVal.match(/-/g) || []).length;
          if (dashCount > 1) {
            finalVal = finalVal.substring(0, finalVal.lastIndexOf('-'));
          }
        }

        if (field === 'credits') {
          let num = parseInt(value.replace(/\D/g, ''));
          if (isNaN(num)) finalVal = '';
          else {
            if (num > 6) num = 6;
            finalVal = num.toString();
          }
        }

        if (field === 'marks') {
          let num = parseInt(value.replace(/\D/g, ''));
          if (isNaN(num)) finalVal = '';
          else {
            if (num > 100) num = 100;
            finalVal = num.toString();
          }
        }
        
        const updated = { ...s, [field]: finalVal };
        
        if (field === 'marks' && finalVal !== '') {
          const marks = parseInt(finalVal);
          const gp = calculateGradePoint(marks);
          updated.gradePoint = gp;
          updated.gradeLetter = getLetterFromGP(gp);
        } else if (field === 'marks' && finalVal === '') {
          updated.gradePoint = 0;
          updated.gradeLetter = 'F';
        }

        return updated;
      }
      return s;
    }));
    setIsCalculated(false);
  };

  const handleBlur = (id: string, field: keyof SGPASubject, value: string) => {
    if (field === 'credits') {
      const num = parseInt(value);
      if (isNaN(num) || num < 2) {
        handleInputChange(id, 'credits', '2');
      }
    }
  };

  const calculateTotal = () => {
    setErrorMsg('');
    let totalWeightedGP = 0;
    let totalCredits = 0;
    let hasError = false;

    subjects.forEach(s => {
      const credits = parseInt(s.credits.toString());
      const marks = parseInt(s.marks.toString());

      if (isNaN(credits) || credits < 2 || credits > 6 || isNaN(marks) || marks < 0 || marks > 100) {
        hasError = true;
      } else {
        totalWeightedGP += (s.gradePoint * credits);
        totalCredits += credits;
      }
    });

    if (hasError || totalCredits === 0) {
      setErrorMsg("Please ensure all subjects have valid credits (2-6) and marks (0-100).");
      return;
    }

    const res = totalWeightedGP / totalCredits;
    setSgpa(res);
    setFinalGrade(getLetterFromGP(res));
    setIsCalculated(true);
  };

  const resetAll = () => {
    setErrorMsg('');
    setSubjects([{ id: '1', name: '', code: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F', isLocked: false }]);
    setSgpa(0);
    setFinalGrade('F');
    setIsCalculated(false);
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportSGPA_PDF(subjects, sgpa, finalGrade, userInfo);
  };

  return (
    <div className={`${theme.card} rounded-2xl p-6 shadow-sm border ${theme.border}`}>
      <UserInfoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Semester Grade Sheet Details"
        theme={theme}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Semester GPA</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input 
              type="checkbox" 
              checked={enableCodes} 
              onChange={e => setEnableCodes(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Enable Subject Codes
          </label>
          <button 
            onClick={resetAll}
            className="text-red-500 text-sm font-medium hover:opacity-70 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 mb-6">
        <table className="w-full text-left min-w-[700px] border-collapse">
          <thead>
            <tr className={`bg-black/5 border-y ${theme.border}`}>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider w-[25%]">Subject</th>
              {enableCodes && <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[15%]">Code</th>}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[10%] text-center">Credits</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[10%] text-center">Marks</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[15%] text-center">Grade Point</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[10%] text-center">Grade</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider w-[15%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/10">
            {subjects.map((sub) => (
              <tr key={sub.id} className={`${sub.isLocked ? 'opacity-60 bg-black/5' : 'hover:bg-white/5'} transition-colors`}>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    disabled={sub.isLocked}
                    placeholder="Subject Name"
                    value={sub.name}
                    onChange={(e) => handleInputChange(sub.id, 'name', e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
                  />
                </td>
                {enableCodes && (
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      disabled={sub.isLocked}
                      placeholder="e.g. CS-113"
                      value={sub.code}
                      onChange={(e) => handleInputChange(sub.id, 'code', e.target.value)}
                      onBlur={(e) => handleBlur(sub.id, 'code', e.target.value)}
                      className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    disabled={sub.isLocked}
                    placeholder="3"
                    value={sub.credits}
                    onChange={(e) => handleInputChange(sub.id, 'credits', e.target.value)}
                    onBlur={(e) => handleBlur(sub.id, 'credits', e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${theme.border}`}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="text"
                    disabled={sub.isLocked}
                    placeholder="0-100"
                    value={sub.marks}
                    onChange={(e) => handleInputChange(sub.id, 'marks', e.target.value)}
                    className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${theme.border}`}
                  />
                </td>
                <td className={`px-4 py-3 font-mono font-semibold text-sm text-center ${theme.accent}`}>
                  {sub.gradePoint.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-bold text-sm text-center">
                  {sub.gradeLetter}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {sub.isLocked && (
                      <button 
                        onClick={() => editRow(sub.id)}
                        className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${theme.accent}`}
                        title="Edit Row"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    )}
                    <button 
                      onClick={() => removeRow(sub.id)}
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

      <div className="flex flex-wrap gap-4 mb-2">
        <button 
          onClick={addRow}
          className={`px-6 py-2.5 bg-transparent border ${theme.border} ${theme.accent} font-medium rounded-full hover:bg-black/5 transition-all flex items-center gap-2`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Subject
        </button>
        <button 
          onClick={calculateTotal}
          className={`px-8 py-2.5 text-white font-semibold rounded-full hover:opacity-90 shadow-sm transition-all ${theme.primary}`}
        >
          Calculate SGPA
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
          Export DMC
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          {errorMsg}
        </div>
      )}

      {isCalculated && (
        <div className={`rounded-3xl p-8 text-center text-white transform transition-all animate-in fade-in slide-in-from-bottom-4 mt-4 ${theme.primary}`}>
          <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-2">Semester Grade Point Average</p>
          <h3 className="text-6xl font-black mb-2">{sgpa.toFixed(2)}</h3>
          <p className="text-xl font-medium opacity-90">Letter Grade: <span className="font-bold border-b-2 border-white/40 px-1">{finalGrade}</span></p>
        </div>
      )}
    </div>
  );
};

export default SGPACalculator;