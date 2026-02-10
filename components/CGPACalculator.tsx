import React, { useState, useEffect } from 'react';
import { CGPASemester, UserInfo, SGPASubject } from '../types';
import { getLetterFromGP, calculateGradePoint } from '../utils/gradingLogic';
import { isValidCourseCode } from '../utils/validation';
import { exportCGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';
import SemesterSubjectTable from './SemesterSubjectTable';

interface Props {
  theme: any;
}

const CGPA_MODE_KEY = 'awkum_cgpa_mode_expert_v1';

const CGPACalculator: React.FC<Props> = ({ theme }) => {
  const [semesters, setSemesters] = useState<CGPASemester[]>([]);
  const [cgpa, setCgpa] = useState(0);
  const [overallGrade, setOverallGrade] = useState('F');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [isInfoVerified, setIsInfoVerified] = useState(false);

  const MAX_CREDITS = 216;
  const MIN_ROOM_FOR_ADD = 18;
  const MAX_ROWS = 12;

  // Initial Restore
  useEffect(() => {
    // Restore Mode
    const savedMode = localStorage.getItem(CGPA_MODE_KEY);
    if (savedMode) {
      setIsExpertMode(JSON.parse(savedMode));
    }

    setSemesters([{ id: Date.now().toString(), name: 'Semester 1', sgpa: '', credits: 18, gradeLetter: 'F', isLocked: false, subjects: [] }]);
  }, []);



  // Save Mode
  useEffect(() => {
    localStorage.setItem(CGPA_MODE_KEY, JSON.stringify(isExpertMode));
  }, [isExpertMode]);

  // Credit Hour Pruning logic for CGPA
  useEffect(() => {
    // In Expert mode, credits are computed, so we might not want to prune aggressively or we do it based on the computed sum.
    // The requirement says "inherit all limit rules". 
    // If expert mode, the credits are derived.
    if (!isExpertMode) {
      const totalCredits = semesters.reduce((sum: number, s: CGPASemester) => sum + (parseInt(s.credits.toString()) || 0), 0);
      if (totalCredits > MAX_CREDITS) {
        setSemesters(prev => {
          let current = [...prev];
          let removedCount = 0;
          while (current.reduce((sum: number, s: CGPASemester) => sum + (parseInt(s.credits.toString()) || 0), 0) > MAX_CREDITS && current.length > 1) {
            current.pop();
            removedCount++;
          }

          if (removedCount > 0) {
            const msg = removedCount === 1
              ? "Automatically Deleted Last Column to Maintain the Maximum Credit Hours Limit"
              : `Automatically Deleted Last ${removedCount} Columns to Maintain the Maximum Credit Hours Limit`;
            setErrorMsg(msg);
          }
          return current;
        });
      }
    }
  }, [semesters, isExpertMode]);

  const addRow = () => {
    const currentTotalCredits = semesters.reduce((sum: number, s: CGPASemester) => sum + (parseInt(s.credits.toString()) || 0), 0);
    if (semesters.length >= MAX_ROWS || (MAX_CREDITS - currentTotalCredits) < MIN_ROOM_FOR_ADD) return;

    setErrorMsg('');
    setSemesters(prev => {
      const nextNum = prev.length + 1;
      const newId = (Date.now() + Math.random()).toString();

      const newSemester: CGPASemester = {
        id: newId,
        name: `Semester ${nextNum}`,
        sgpa: '',
        credits: 18,
        gradeLetter: 'F',
        isLocked: false,
        subjects: isExpertMode ? [{ id: Date.now().toString(), name: '', code: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F', isLocked: false }] : []
      };

      return [...prev, newSemester];
    });
  };



  const removeRow = (id: string) => {
    setErrorMsg('');
    setSemesters(prev => {
      if (prev.length > 1) {
        const filtered = prev.filter(s => s.id !== id);
        return filtered.map((s, index) => ({
          ...s,
          name: `Semester ${index + 1}`
        }));
      }
      return prev;
    });
  };

  const handleInputChange = (id: string, field: keyof CGPASemester, value: string) => {
    setErrorMsg('');
    setSemesters(prev => prev.map(s => {
      if (s.id === id) {
        let finalVal = value;
        if (field === 'sgpa') {
          // Allow digits and a single dot. Check max 4.00
          if (value === '' || /^\d*\.?\d*$/.test(value)) {
            if (parseFloat(value) > 4.00) finalVal = '4.00';
            else finalVal = value;
          } else {
            return s; // Ignore invalid char
          }
        }
        if (field === 'credits') {
          let cleaned = value.replace(/\D/g, '');
          let num = parseInt(cleaned);
          if (isNaN(num)) finalVal = '';
          else { if (num > 21) num = 21; finalVal = num.toString(); }
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

  const handleSubjectsUpdate = (semesterId: string, updatedSubjects: SGPASubject[]) => {
    setSemesters(prev => prev.map(s => {
      if (s.id === semesterId) {
        // Calculate SGPA and Credits for this semester automatically based on subjects
        let totalWeightedGP = 0;
        let totalCredits = 0;

        updatedSubjects.forEach((sub: SGPASubject) => {
          const c = parseInt(sub.credits.toString()) || 0;
          const gp = sub.gradePoint || 0;
          totalCredits += c;
          totalWeightedGP += (gp * c);
        });

        const semSgpa = totalCredits > 0 ? (totalWeightedGP / totalCredits) : 0;

        return {
          ...s,
          subjects: updatedSubjects,
          credits: totalCredits,
          sgpa: semSgpa.toFixed(2),
          gradeLetter: getLetterFromGP(semSgpa)
        };
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
          if (!isNaN(val)) corrected = val.toFixed(2);
          else corrected = '0.00';
        }
        if (field === 'credits') {
          let num = parseInt(value);
          if (isNaN(num)) num = 18;
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
    setErrorMsg('');
    let totalWeightedSGPA = 0;
    let totalCredits = 0;
    let hasError = false;

    // Use current state logic
    semesters.forEach(s => {
      const gpa = parseFloat(s.sgpa.toString());
      const credits = parseInt(s.credits.toString());

      // Validation slightly differs for Expert Mode? 
      // User said "inherit limit rules". 
      // In Expert Mode, credits are sum of subjects. Range 2-21 mostly covered by Subject constraints (2-6 per subject).
      // But SGPA check 0-4.00 is same.

      if (isNaN(gpa) || gpa < 0 || gpa > 4.00 || isNaN(credits)) {
        // Quick mode has Credit limits 12-21. Expert mode involves summing subjects.
        // Expert Mode: Validation is on the subjects. If subjects are valid (Marks 0-100), GPA is valid.
        // Is there a minimum credit limit for a semester in Expert Mode? 
        // Original SGPA tab doesn't strictly enforce min total credits for calculation but Quick Mode CGPA does (12-21).
        // Let's assume valid subjects imply valid semester.
        hasError = true;
      } else {
        if (!isExpertMode && (credits < 12 || credits > 21)) {
          hasError = true;
        } else {
          totalWeightedSGPA += (gpa * credits);
          totalCredits += credits;
        }
      }
    });

    if (hasError || totalCredits === 0) {
      setErrorMsg(isExpertMode
        ? "Please ensure all subjects in every semester are filled correctly."
        : "Check inputs: SGPA (0-4.00) and Credits (12-21) are required for all semesters.");
      return;
    }
    const res = totalWeightedSGPA / totalCredits;
    setCgpa(res);
    setOverallGrade(getLetterFromGP(res));
    setIsCalculated(true);
  };

  const resetAll = () => {
    setErrorMsg('');
    const initialSubjects = isExpertMode ? [{ id: Date.now().toString(), name: '', code: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F', isLocked: false }] : [];
    const initial = [{ id: Date.now().toString(), name: 'Semester 1', sgpa: '', credits: 18, gradeLetter: 'F', isLocked: false, subjects: initialSubjects }];
    setSemesters(initial);
    setCgpa(0);
    setOverallGrade('F');
    setIsCalculated(false);

  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, cgpa, overallGrade, userInfo);
  };

  const toggleMode = (checked: boolean) => {
    setIsExpertMode(checked);
    setIsCalculated(false);

    // If switching to Expert Mode, ensure subjects exist
    if (checked) {
      setSemesters(prev => prev.map(s => ({
        ...s,
        subjects: (s.subjects && s.subjects.length > 0) ? s.subjects : [{ id: (Date.now() + Math.random()).toString(), name: '', code: '', credits: 3, marks: '', gradePoint: 0, gradeLetter: 'F', isLocked: false }]
      })));
    } else {
      setIsInfoVerified(false);
    }
  };

  // Gating for Export Transcript in Expert Mode
  // "This button should appear if and only if expert mode is enabled and all the inputs are filled and validated"
  const isExpertValid = isExpertMode && semesters.every(sem => {
    // Check if semester has subjects and all subjects are valid
    if (!sem.subjects || sem.subjects.length === 0) return false;
    return sem.subjects.every(sub => sub.marks !== '' && sub.credits !== '' && sub.code && isValidCourseCode(sub.code));
  });

  const showExportButton = isExpertMode ? (isExpertValid && isCalculated && isInfoVerified) : false;
  // Wait, User said "Remove the Export Transcript Button... in the quick mode." 
  // "Export Transcript... GATED... should appear if and only if expert mode is enabled..."
  // So NO Export Transcript in Quick Mode at all? 
  // "The Export Transcript button should be removed in the quick mode." -> YES.
  // "This button should appear if and only if expert mode is enabled..." -> YES.

  const currentTotalCredits = semesters.reduce((sum: number, s: CGPASemester) => sum + (parseInt(s.credits.toString()) || 0), 0);
  const showAddButton = semesters.length < MAX_ROWS && (MAX_CREDITS - currentTotalCredits) >= MIN_ROOM_FOR_ADD;

  return (
    <div className={`${theme.card} rounded-2xl p-6 shadow-sm border ${theme.border}`}>
      <UserInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handlePdfExport} title="Cumulative Grade Sheet Details" isCGPA={true} rowCount={semesters.length} theme={theme} />

      <div className="flex justify-between items-center mb-6">
        <label className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest cursor-pointer select-none ${theme.accent}`}>
          <input
            type="checkbox"
            checked={isExpertMode}
            onChange={e => toggleMode(e.target.checked)}
            className="themed-checkbox"
          />
          {isExpertMode ? 'Quick Mode' : 'Expert Mode'}
        </label>
        <button onClick={resetAll} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-colors">CLEAR ALL</button>
      </div>

      <div className="overflow-x-auto -mx-6 mb-6">
        {!isExpertMode ? (
          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead>
              <tr className={`bg-black/5 border-y ${theme.border}`}>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider w-[40%]">Semester Order</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[25%] text-center">Obtained SGPA</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[25%] text-center">Total Credits</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider w-[10%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10">
              {semesters.map((sem) => (
                <tr key={sem.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <input type="text" disabled value={sem.name} className="w-full px-3 py-2 bg-black/5 border border-transparent rounded-lg text-gray-400 font-semibold text-sm cursor-not-allowed" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" placeholder="0.00 - 4.00" value={sem.sgpa} onChange={(e) => handleInputChange(sem.id, 'sgpa', e.target.value)} onBlur={(e) => handleBlur(sem.id, 'sgpa', e.target.value)} className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${theme.border}`} />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" placeholder="12 - 21" value={sem.credits} onChange={(e) => handleInputChange(sem.id, 'credits', e.target.value)} onBlur={(e) => handleBlur(sem.id, 'credits', e.target.value)} className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-center ${theme.border}`} />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => removeRow(sem.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Remove Row">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 flex flex-col gap-6">
            {semesters.map((sem, index) => (
              <div key={sem.id} className={`p-6 rounded-2xl border ${theme.border} bg-white/5 animate-in fade-in slide-in-from-bottom-2`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">{sem.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-mono opacity-60">SGPA: <span className={`${theme.accent} font-bold`}>{sem.sgpa || '0.00'}</span></div>
                    <div className="text-xs font-mono opacity-60">Credits: <span className={`${theme.accent} font-bold`}>{sem.credits || '0'}</span></div>
                    <button onClick={() => removeRow(sem.id)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Remove Semester">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
                <SemesterSubjectTable
                  semesterId={sem.id}
                  subjects={sem.subjects || []}
                  onUpdate={handleSubjectsUpdate}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-2 items-center">
        {showAddButton ? (
          <button onClick={addRow} className={`px-6 py-2.5 bg-transparent border ${theme.border} ${theme.accent} font-medium rounded-full hover:bg-black/5 transition-all flex items-center gap-2`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Semester
          </button>
        ) : (
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 p-3 rounded-full border border-blue-500/20 shadow-sm animate-in fade-in">
            Maximum Limit of Semesters Reached !
          </div>
        )}

        <button onClick={calculateTotal} className={`px-8 py-2.5 text-white font-semibold rounded-full hover:opacity-90 shadow-sm transition-all ${theme.primary}`}>Calculate CGPA</button>

        {showExportButton && (
          <button onClick={() => setIsModalOpen(true)} className={`px-6 py-2.5 font-medium rounded-full transition-all flex items-center gap-2 bg-black/10 border ${theme.border} animate-in zoom-in-95`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export Transcript
          </button>
        )}
      </div>

      {!isExpertMode && (
        <div className="mt-4 mb-4 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 w-fit animate-in fade-in">
          To generate a detailed unofficial transcript, switch to Expert Mode and enter full details of each semester such as subject name, course code, credit hours and marks.
        </div>
      )}

      {isExpertMode && (
        <div className="mt-4 mb-4 flex items-center gap-4 p-5 bg-black/5 rounded-[1.5rem] animate-in slide-in-from-left-4 border border-white/10 shadow-inner w-fit">
          <input
            type="checkbox"
            id="confirmInfo"
            checked={isInfoVerified}
            onChange={e => setIsInfoVerified(e.target.checked)}
            className="themed-checkbox"
          />
          <label htmlFor="confirmInfo" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 cursor-pointer select-none leading-relaxed">
            I confirm that the information entered here is correct to the best of my knowledge and is verified against my MIS Profile.
          </label>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          {errorMsg}
        </div>
      )}
      {isCalculated && (
        <div className={`rounded-3xl p-8 text-center text-white transform transition-all animate-in zoom-in-95 mt-4 ${theme.primary}`}>
          <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-2">Cumulative Grade Point Average</p>
          <h3 className="text-6xl font-black mb-2">{cgpa.toFixed(2)}</h3>
          <p className="text-xl font-medium opacity-90">Overall Standing: <span className="font-bold border-b-2 border-white/40 px-1">{overallGrade}</span></p>
        </div>
      )}
    </div>
  );
};

export default CGPACalculator;