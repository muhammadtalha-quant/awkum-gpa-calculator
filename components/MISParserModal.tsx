import React, { useState, useMemo } from 'react';
import { parseMISText, ParsedSubject } from '../src/core/misParser';
import { calculateGradePoint } from '../src/domain/grading/engine';
import { getLetterFromGP } from '../src/domain/grading/engine';
import { SGPASubject, Credit, Mark } from '../src/domain/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (subjects: SGPASubject[]) => void;
  existingSubjectCodes: string[];
  targetSemester?: number;
}

type Step = 'paste' | 'credits' | 'confirm';

interface SubjectDraft extends ParsedSubject {
  credits: number;
  isDuplicate: boolean;
}

const DEFAULT_CREDITS = 3;

const MISParserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImport,
  existingSubjectCodes,
  targetSemester,
}) => {
  const [step, setStep] = useState<Step>('paste');
  const [rawText, setRawText] = useState('');
  const [drafts, setDrafts] = useState<SubjectDraft[]>([]);
  const [globalCredits, setGlobalCredits] = useState(DEFAULT_CREDITS);

  const detected = useMemo(() => parseMISText(rawText, targetSemester), [rawText, targetSemester]);

  const toStep = (next: Step) => {
    if (next === 'credits') {
      setDrafts(
        detected.map((sub) => ({
          ...sub,
          credits: DEFAULT_CREDITS,
          isDuplicate: existingSubjectCodes.includes(sub.code),
        })),
      );
      setGlobalCredits(DEFAULT_CREDITS);
    }
    setStep(next);
  };

  const applyGlobalCredits = (val: number) => {
    setGlobalCredits(val);
    setDrafts((prev) => prev.map((d) => ({ ...d, credits: val })));
  };

  const updateCredit = (code: string, credits: number) => {
    setDrafts((prev) => prev.map((d) => (d.code === code ? { ...d, credits } : d)));
  };

  const handleImport = () => {
    const subjects: SGPASubject[] = drafts.map((d) => {
      const gp = calculateGradePoint(d.marks as Mark);
      return {
        id: crypto.randomUUID(),
        name: d.name,
        code: d.code || '',
        credits: d.credits as Credit,
        marks: d.marks as Mark,
        gradePoint: gp,
        gradeLetter: getLetterFromGP(gp),
      };
    });
    onImport(subjects);
    handleClose();
  };

  const handleClose = () => {
    setStep('paste');
    setRawText('');
    setDrafts([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-in">
      {/* Modal Container */}
      <div className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[85vh] flex flex-col rounded-t-[2rem] sm:rounded-[2.5rem] border-t sm:border border-white/5 bg-bg-surface shadow-2xl overflow-hidden animate-slide-in-top">
        {/* Header */}
        <div className="flex flex-col px-8 sm:px-12 pt-10 pb-6 border-b border-white/5 relative bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h2 className="text-xl font-black font-headline text-white uppercase tracking-tight">
                MIS Intelligent Import
              </h2>
            </div>
            <button
              onClick={handleClose}
              data-testid="close-modal"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-4">
            {[
              { step: 'paste', icon: 'content_paste' },
              { step: 'credits', icon: 'edit_calendar' },
              { step: 'confirm', icon: 'fact_check' },
            ].map((s, i) => {
              const isActive = step === s.step;
              const isCompleted = (step === 'credits' && i === 0) || (step === 'confirm' && i < 2);
              return (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isActive ? 'bg-primary text-on-primary ring-4 ring-primary/20' : isCompleted ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-zinc-700'}`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-primary' : 'text-zinc-700'}`}
                    >
                      {s.step}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`h-px flex-1 mx-2 sm:mx-0 ${isCompleted ? 'bg-primary/30' : 'bg-white/5'}`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8 space-y-6 custom-scrollbar">
          {/* Step 1: Paste Mode */}
          {step === 'paste' && (
            <div className="space-y-6 animate-slide-in-top">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                <span className="material-symbols-outlined text-primary text-2xl">info</span>
                <p className="text-xs text-zinc-400 font-body leading-relaxed">
                  Copy the entire content from your{' '}
                  <span className="text-white font-bold">MIS Result Page</span> (Ctrl+A then Ctrl+C)
                  and paste it below. Our engine will automatically extract grades and course data.
                </p>
              </div>
              <textarea
                autoFocus
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder={'Paste MIS raw text here...'}
                className="w-full px-6 py-6 rounded-2xl border border-white/5 bg-bg-surface-lowest text-zinc-300 font-mono text-xs resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-600"
              />
              {rawText.length > 0 && (
                <div
                  className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${detected.length > 0 ? 'bg-primary/10 border-primary/20' : 'bg-zinc-950 border-white/5 opacity-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black font-headline text-primary">
                      {detected.length}
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Analysis Result
                      </p>
                      <p className="text-sm font-bold text-white">
                        {detected.length === 0
                          ? 'No courses identified'
                          : `${detected.length} Courses Extracted`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined text-3xl ${detected.length > 0 ? 'text-primary' : 'text-zinc-800'}`}
                  >
                    {detected.length > 0 ? 'task_alt' : 'error'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Credits Configuration */}
          {step === 'credits' && (
            <div className="space-y-6 animate-slide-in-top">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-bg-surface-lowest border border-white/5">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">
                    Batch Configuration
                  </h4>
                  <p className="text-[10px] text-zinc-500">
                    Apply uniform credits to all detected subjects
                  </p>
                </div>
                <div className="flex gap-2">
                  {[2, 3, 4].map((cr) => (
                    <button
                      key={cr}
                      onClick={() => applyGlobalCredits(cr)}
                      className={`w-12 h-12 rounded-xl font-black text-xs border transition-all ${globalCredits === cr ? 'bg-primary text-on-primary border-primary shadow-lg shadow-glow-sm' : 'border-white/10 text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                      {cr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {drafts.map((d) => (
                  <div
                    key={d.code}
                    className={`flex items-center gap-4 p-5 rounded-2xl border bg-bg-surface-lowest transition-all ${d.isDuplicate ? 'border-orange-500/20' : 'border-white/5'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded uppercase tracking-wider">
                          {d.code}
                        </span>
                        {d.isDuplicate && (
                          <span className="text-[8px] font-black text-orange-500 px-1.5 py-0.5 bg-orange-500/10 rounded">
                            EXISTING
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-white truncate">{d.name}</h5>
                    </div>
                    <div className="flex items-center bg-zinc-950 rounded-xl p-1 border border-white/5">
                      {[2, 3, 4].map((cr) => (
                        <button
                          key={cr}
                          onClick={() => updateCredit(d.code, cr)}
                          className={`w-9 h-9 rounded-lg font-black text-[10px] transition-all ${d.credits === cr ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                          {cr}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation Review */}
          {step === 'confirm' && (
            <div className="space-y-6 animate-slide-in-top">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Final Dataset Preview
              </h4>
              <div className="bg-bg-surface-lowest rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                {drafts.map((d) => {
                  const gp = calculateGradePoint(d.marks as Mark);
                  const letter = getLetterFromGP(gp);
                  return (
                    <div
                      key={d.code}
                      className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-headline ${letter === 'F' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}
                        >
                          {letter}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-none">
                            {d.name}
                          </p>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                            {d.code}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            Mark
                          </p>
                          <p className="text-xs font-bold text-zinc-300">{d.marks}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            Cr.
                          </p>
                          <p className="text-xs font-bold text-white">{d.credits}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-primary/60 uppercase">Total Items</p>
                      <p className="text-2xl font-black text-primary">{drafts.length}</p>
                    </div>
                    <div className="w-px h-8 bg-primary/20"></div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-primary/60 uppercase">
                        Total Credits
                      </p>
                      <p className="text-2xl font-black text-primary">
                        {drafts.reduce((acc, d) => acc + d.credits, 0)}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary/20 text-4xl">
                    inventory_2
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <footer className="px-8 sm:px-12 py-8 border-t border-white/5 bg-bg-surface-lowest flex items-center justify-between gap-4">
          <button
            onClick={() =>
              step === 'paste' ? handleClose() : setStep(step === 'confirm' ? 'credits' : 'paste')
            }
            className="px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 transition-all"
          >
            {step === 'paste' ? 'Cancel' : 'Back Step'}
          </button>

          {step === 'paste' && (
            <button
              disabled={detected.length === 0}
              onClick={() => toStep('credits')}
              className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${detected.length > 0 ? 'bg-primary text-on-primary hover:scale-[1.02]' : 'bg-surface-container-highest text-zinc-700 opacity-30 cursor-not-allowed'}`}
            >
              Analyze & Next
            </button>
          )}

          {step === 'credits' && (
            <button
              onClick={() => toStep('confirm')}
              className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-on-primary shadow-2xl hover:scale-[1.02] transition-all"
            >
              Final Verification
            </button>
          )}

          {step === 'confirm' && (
            <button
              onClick={handleImport}
              className="px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xl hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">download_done</span>
              Commit Import
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default MISParserModal;
