import React, { useState } from 'react';
import { SGPASubject, asMark, asSubjectCredit } from '../src/domain/types';
import { calculateGradePoint, getLetterFromGP } from '../src/domain/grading/engine';
import { isValidCourseCode, sanitizeSubjectName } from '../src/core/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: Partial<SGPASubject>) => void;
  initialData?: Partial<SGPASubject>;
  enableCodes: boolean;
}

const SubjectEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  enableCodes,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [credits, setCredits] = useState(initialData?.credits?.toString() || '3');
  const [marks, setMarks] = useState(initialData?.marks?.toString() || '');

  // Sync state from props when initialData changes (Synchronous update during render)
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setName(initialData?.name || '');
    setCode(initialData?.code || '');
    setCredits(initialData?.credits?.toString() || '3');
    setMarks(initialData?.marks?.toString() || '');
  }

  if (!isOpen) return null;

  const numCredits = parseInt(credits);
  const numMarks = marks === '' ? -1 : parseInt(marks);
  const isNameInvalid = name !== '' && !name.trim();
  const isCodeInvalid = enableCodes && code !== '' && !isValidCourseCode(code);
  const isCreditsInvalid =
    credits !== '' && (isNaN(numCredits) || numCredits < 2 || numCredits > 6);
  const isMarksInvalid = marks !== '' && (isNaN(numMarks) || numMarks < 0 || numMarks > 100);
  const isFormValid =
    name.trim() &&
    (!enableCodes || (code && isValidCourseCode(code))) &&
    !isCreditsInvalid &&
    !isMarksInvalid &&
    credits !== '' &&
    marks !== '';

  const handleSave = () => {
    if (!isFormValid) return;
    const gp = calculateGradePoint(asMark(numMarks));
    onSubmit({
      name: sanitizeSubjectName(name),
      code: enableCodes ? code.toUpperCase() : '',
      credits: asSubjectCredit(numCredits),
      marks: asMark(numMarks),
      gradePoint: gp,
      gradeLetter: getLetterFromGP(gp),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in">
      <div className="bg-bg-surface w-full max-w-lg rounded-[2.5rem] p-10 sm:p-12 border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-8xl text-primary">edit_note</span>
        </div>

        <div className="flex justify-between items-start mb-10 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">book</span>
              </div>
              <h3 className="text-[11px] font-black font-headline text-primary uppercase tracking-[0.4em]">
                {initialData?.id ? 'Update Registry' : 'Course Initialization'}
              </h3>
            </div>
            <p className="text-[10px] font-bold font-label text-zinc-600 uppercase tracking-widest pl-1">
              Academic entity parameter entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface-lowest border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
                Subject Designation
              </label>
              {isNameInvalid && (
                <span className="text-[8px] font-black text-error uppercase tracking-widest bg-error/10 px-2 py-0.5 rounded-md">
                  Required Field
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Advanced Thermodynamics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-6 py-4 bg-bg-surface-lowest border rounded-2xl outline-none text-zinc-900 dark:text-white font-black text-sm transition-all placeholder:text-zinc-800 shadow-inner-glow ${isNameInvalid ? 'border-error/40 ring-2 ring-error/5' : 'border-white/5 focus:border-primary/50'}`}
            />
          </div>

          {enableCodes && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
                  Course Protocol Code
                </label>
                {isCodeInvalid && (
                  <span className="text-[8px] font-black text-error uppercase tracking-widest bg-error/10 px-2 py-0.5 rounded-md">
                    Format: AB-123
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. PH-201"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full px-6 py-4 bg-bg-surface-lowest border rounded-2xl outline-none text-zinc-900 dark:text-white font-black font-mono text-sm tracking-widest transition-all placeholder:text-zinc-800 shadow-inner-glow uppercase ${isCodeInvalid ? 'border-error/40 ring-2 ring-error/5' : 'border-white/5 focus:border-primary/50'}`}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
                Credit Units
              </label>
              <div className="relative group/range">
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className={`w-full px-6 py-5 bg-bg-surface-lowest border rounded-2xl outline-none text-center text-2xl font-black text-primary transition-all shadow-inner-glow ${isCreditsInvalid ? 'border-error/40 ring-1 ring-error/10' : 'border-white/5 focus:border-primary/50'}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/range:opacity-30 transition-opacity">
                  <span className="text-[9px] font-black text-primary font-mono select-none">
                    Units
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
                Raw Score (%)
              </label>
              <div className="relative group/range">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="0—100"
                  className={`w-full px-6 py-5 bg-bg-surface-lowest border rounded-2xl outline-none text-center text-2xl font-black text-primary transition-all placeholder:text-zinc-800 shadow-inner-glow ${isMarksInvalid ? 'border-error/40 ring-1 ring-error/10' : 'border-white/5 focus:border-primary/50'}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/range:opacity-30 transition-opacity">
                  <span className="text-[9px] font-black text-primary font-mono select-none">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className="group/save relative w-full h-[60px] bg-primary text-on-primary font-black font-label uppercase tracking-[0.2em] rounded-2xl overflow-hidden transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed shadow-glow"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/save:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Finalize Entry
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectEntryModal;
