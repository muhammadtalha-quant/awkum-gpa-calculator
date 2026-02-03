
import React, { useState } from 'react';
import { SGPASubject, UserInfo } from '../types';
import { calculateGradePoint, getLetterFromGP } from '../utils/gradingLogic';
import { exportSGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';

const SGPACalculator: React.FC = () => {
  const [subjects, setSubjects] = useState<SGPASubject[]>([
    { id: '1', name: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F' }
  ]);
  const [sgpa, setSgpa] = useState(0);
  const [finalGrade, setFinalGrade] = useState('F');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addRow = () => {
    const newId = (subjects.length + 1).toString();
    setSubjects([...subjects, { id: newId, name: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F' }]);
  };

  const removeRow = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleInputChange = (id: string, field: keyof SGPASubject, value: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        let finalVal = value;
        if (field === 'credits') {
          const num = parseFloat(value);
          if (num > 6) finalVal = '6';
        }
        
        const updated = { ...s, [field]: finalVal };
        
        if (field === 'marks') {
          const marks = parseFloat(value);
          if (!isNaN(marks) && marks >= 0 && marks <= 100) {
            const gp = calculateGradePoint(marks);
            updated.gradePoint = gp;
            updated.gradeLetter = getLetterFromGP(gp);
          } else {
            updated.gradePoint = 0;
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
    let totalWeightedGP = 0;
    let totalCredits = 0;
    let hasError = false;

    subjects.forEach(s => {
      const credits = parseFloat(s.credits.toString());
      const marks = parseFloat(s.marks.toString());

      if (isNaN(credits) || credits <= 0 || credits > 6 || isNaN(marks) || marks < 0 || marks > 100) {
        hasError = true;
      } else {
        totalWeightedGP += (s.gradePoint * credits);
        totalCredits += credits;
      }
    });

    if (hasError || totalCredits === 0) {
      alert("Please ensure all subjects have valid credits (1-6) and marks (0-100).");
      return;
    }

    const res = totalWeightedGP / totalCredits;
    setSgpa(res);
    setFinalGrade(getLetterFromGP(res));
    setIsCalculated(true);
  };

  const resetAll = () => {
    setSubjects([{ id: '1', name: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F' }]);
    setSgpa(0);
    setFinalGrade('F');
    setIsCalculated(false);
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportSGPA_PDF(subjects, sgpa, finalGrade, userInfo);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <UserInfoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Semester Grade Sheet Details"
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Semester GPA</h2>
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
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">Subject</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%] text-center">Credits</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%] text-center">Marks</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%] text-center">Grade Point</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%] text-center">Grade</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    placeholder={`Subject Name`}
                    value={sub.name}
                    onChange={(e) => handleInputChange(sub.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    max="6"
                    placeholder="3"
                    value={sub.credits}
                    onChange={(e) => handleInputChange(sub.id, 'credits', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    placeholder="0-100"
                    value={sub.marks}
                    onChange={(e) => handleInputChange(sub.id, 'marks', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${
                      (Number(sub.marks) > 100 || Number(sub.marks) < 0) ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-blue-600 font-semibold text-sm text-center">
                  {sub.gradePoint.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-bold text-gray-700 text-sm text-center">
                  {sub.gradeLetter}
                </td>
                <td className="px-6 py-3 text-right">
                  <button 
                    onClick={() => removeRow(sub.id)}
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
          Add Subject
        </button>
        <button 
          onClick={calculateTotal}
          className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-sm transition-all"
        >
          Calculate SGPA
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
          Export DMC (PDF)
        </button>
      </div>

      {isCalculated && (
        <div className="bg-blue-600 rounded-3xl p-8 text-center text-white transform transition-all animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-2">Semester Grade Point Average</p>
          <h3 className="text-6xl font-black mb-2">{sgpa.toFixed(2)}</h3>
          <p className="text-xl font-medium opacity-90">Letter Grade: <span className="underline decoration-wavy decoration-blue-300">{finalGrade}</span></p>
        </div>
      )}
    </div>
  );
};

export default SGPACalculator;
