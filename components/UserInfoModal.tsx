
import React, { useState, useEffect, useRef } from 'react';
import { UserInfo } from '../src/domain/types';
import { PROGRAMMES } from '../constants';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: UserInfo) => void;
  title: string;
  isCGPA?: boolean;
  rowCount?: number;
  theme?: any;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, onSubmit, title, isCGPA, rowCount = 0 }) => {
  const [info, setInfo] = useState<UserInfo>({
    name: '',
    fatherName: '',
    registrationNumber: '',
    programme: PROGRAMMES[0],
    semester: '1',
    section: '',
    subject: '',
    minor: '',
    isCompleted: false,
    totalDuration: '',
    isVerified: false,
    photo: undefined
  });

  const [formTouched, setFormTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (info.programme === "Undergraduate (BS)") {
      setInfo(prev => ({ ...prev, semester: prev.isCompleted ? '8' : '1' }));
    } else if (!info.isCompleted) {
      setInfo(prev => ({ ...prev, semester: '1' }));
    }
  }, [info.programme, info.isCompleted]);

  if (!isOpen) return null;

  const sanitizeName = (val: string) => val.replace(/[^A-Za-z\s]/g, '');
  const sanitizeSection = (val: string) => val.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 1);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isNameValid = info.name.trim().length > 2;
  const isFatherValid = info.fatherName.trim().length > 2;
  const isRegValid = info.registrationNumber.length === 8;
  const isSectionValid = info.section.length === 1;
  const isSubjectValid = info.subject.trim().length >= 2;

  let cgpaConstraintError = '';
  if (isCGPA) {
    if (info.isCompleted) {
      if (info.programme === "Undergraduate (BS)") {
        if (rowCount !== 8) cgpaConstraintError = `BS requires 8 semesters (Provided: ${rowCount})`;
      } else {
        const duration = parseInt(info.totalDuration || '0');
        if (!duration || rowCount !== duration) cgpaConstraintError = `${duration ? `Required: ${duration}` : 'Total duration needed'}`;
      }
    } else {
      const currentSem = parseInt(info.semester);
      if (rowCount !== (currentSem - 1)) cgpaConstraintError = `Sem ${currentSem} requires ${currentSem - 1} records (Found: ${rowCount})`;
    }
  }

  const isFormValid = isNameValid && isFatherValid && isRegValid && isSectionValid && isSubjectValid && info.isVerified && !cgpaConstraintError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalInfo = {
      ...info,
      registrationNumber: `AWKUM-${info.registrationNumber}`,
      semester: (info.isCompleted && info.programme !== "Undergraduate (BS)") ? info.totalDuration : info.semester
    };

    onSubmit(finalInfo as UserInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl border border-[#27272a] bg-[#121215] animate-in zoom-in-95 duration-300">

        {/* Modern Centered Header */}
        <div className={`p-10 text-center relative overflow-hidden bg-gradient-to-b from-black/20 to-transparent`}>
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-[0.3em] mb-2">{title}</h3>
            <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">Official Credential Verification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-px bg-current opacity-10"></span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Personal Identity</span>
              <span className="h-px bg-current opacity-10 flex-1"></span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="relative group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-[#27272a] flex items-center justify-center cursor-pointer overflow-hidden bg-[#18181b] hover:scale-105 transition-all duration-500 shadow-xl"
                >
                  {info.photo ? (
                    <img src={info.photo} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Update</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Full Name</label>
                      {formTouched && !isNameValid && <span className="text-[8px] font-bold text-red-500 uppercase">Invalid</span>}
                    </div>
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={info.name}
                      onFocus={() => setFormTouched(true)}
                      onChange={(e) => setInfo({ ...info, name: sanitizeName(e.target.value) })}
                      className={`w-full px-5 py-3 bg-[#18181b] border-2 rounded-lg outline-none transition-all ${formTouched && !isNameValid ? 'border-[#ef4444]/50' : isNameValid ? 'border-[#34d399]/30' : 'border-[#27272a]'} focus:border-[#a78bfa] font-bold text-sm text-[#fafafa]`}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Father's Name</label>
                      {formTouched && !isFatherValid && <span className="text-[8px] font-bold text-red-500 uppercase">Invalid</span>}
                    </div>
                    <input
                      type="text"
                      placeholder="Father's Name"
                      value={info.fatherName}
                      onFocus={() => setFormTouched(true)}
                      onChange={(e) => setInfo({ ...info, fatherName: sanitizeName(e.target.value) })}
                      className={`w-full px-5 py-3 bg-[#18181b] border-2 rounded-lg outline-none transition-all ${formTouched && !isFatherValid ? 'border-[#ef4444]/50' : isFatherValid ? 'border-[#34d399]/30' : 'border-[#27272a]'} focus:border-[#a78bfa] font-bold text-sm text-[#fafafa]`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Registration Identifier</label>
              <div className={`flex items-center bg-[#18181b] rounded-lg border-2 transition-all overflow-hidden ${formTouched && !isRegValid ? 'border-[#ef4444]/50' : isRegValid ? 'border-[#34d399]/30' : 'border-[#27272a]'}`}>
                <span className="px-5 py-3 bg-black/20 text-[10px] font-black opacity-40 tracking-widest border-r border-white/5">AWKUM -</span>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="00000000"
                  value={info.registrationNumber}
                  onFocus={() => setFormTouched(true)}
                  onChange={(e) => setInfo({ ...info, registrationNumber: e.target.value.replace(/\D/g, '') })}
                  className="flex-1 bg-transparent px-5 py-3 outline-none text-sm font-black tracking-[0.3em]"
                />
              </div>
            </div>
          </section>

          {/* Academic Profile */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-px bg-current opacity-10"></span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Academic Standing</span>
              <span className="h-px bg-current opacity-10 flex-1"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Programme</label>
                <select
                  value={info.programme}
                  onChange={(e) => setInfo({ ...info, programme: e.target.value })}
                  className="w-full px-5 py-3 bg-[#18181b] border-2 border-[#27272a] rounded-lg outline-none transition-all focus:border-[#a78bfa] text-sm font-bold text-[#fafafa]"
                >
                  {PROGRAMMES.map(p => <option key={p} value={p} className="bg-gray-800 text-white">{p}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">
                  {info.isCompleted ? 'Final Target' : 'Current Terminal'}
                </label>
                {isCGPA && info.isCompleted && info.programme !== "Undergraduate (BS)" ? (
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Semesters"
                    value={info.totalDuration}
                    onChange={(e) => setInfo({ ...info, totalDuration: e.target.value })}
                    className="w-full px-5 py-3 bg-[#18181b] border-2 border-[#27272a] rounded-lg outline-none transition-all focus:border-[#a78bfa] text-sm font-black text-center text-[#fafafa]"
                  />
                ) : (
                  <select
                    disabled={info.isCompleted && info.programme === "Undergraduate (BS)"}
                    value={info.semester}
                    onChange={(e) => setInfo({ ...info, semester: e.target.value })}
                    className="w-full px-5 py-3 bg-[#18181b] border-2 border-[#27272a] rounded-lg outline-none transition-all focus:border-[#a78bfa] text-sm disabled:opacity-30 font-bold text-[#fafafa]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                      <option key={s} value={s.toString()} className="bg-gray-800 text-white">Semester {s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Major/Disc.</label>
                  {formTouched && !isSubjectValid && <span className="text-[8px] font-bold text-red-500 uppercase">Invalid</span>}
                </div>
                <input
                  type="text"
                  placeholder="e.g. CS"
                  value={info.subject}
                  onFocus={() => setFormTouched(true)}
                  onChange={(e) => setInfo({ ...info, subject: sanitizeName(e.target.value) })}
                  className={`w-full px-5 py-3 bg-[#18181b] border-2 rounded-lg outline-none transition-all ${formTouched && !isSubjectValid ? 'border-[#ef4444]/50' : isSubjectValid ? 'border-[#34d399]/30' : 'border-[#27272a]'} focus:border-[#a78bfa] font-bold text-sm text-[#fafafa]`}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Section</label>
                  {formTouched && !isSectionValid && <span className="text-[8px] font-bold text-red-500 uppercase">!</span>}
                </div>
                <input
                  type="text"
                  placeholder="A"
                  value={info.section}
                  onFocus={() => setFormTouched(true)}
                  onChange={(e) => setInfo({ ...info, section: sanitizeSection(e.target.value) })}
                  className={`w-full px-5 py-3 bg-[#18181b] border-2 rounded-lg outline-none transition-all ${formTouched && !isSectionValid ? 'border-[#ef4444]/50' : isSectionValid ? 'border-[#34d399]/30' : 'border-[#27272a]'} focus:border-[#a78bfa] text-center font-black text-sm text-[#fafafa]`}
                />
              </div>
            </div>
          </section>

          {/* Verification & Warnings */}
          <section className="space-y-4 pt-4">
            {isCGPA && (
              <div className="flex items-center gap-4 p-5 bg-black/10 rounded-[1.5rem] border border-white/5 hover:bg-black/20 transition-all group cursor-pointer" onClick={() => setInfo({ ...info, isCompleted: !info.isCompleted })}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${info.isCompleted ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                  {info.isCompleted && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Graduation Status Completed</span>
              </div>
            )}

            {cgpaConstraintError && (
              <div className="p-5 bg-red-500/10 border-2 border-red-500/20 rounded-[1.5rem] text-red-500 animate-in shake">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{cgpaConstraintError}</p>
                </div>
              </div>
            )}

            <div className={`p-6 rounded-[2rem] transition-all bg-black/10 border-2 ${info.isVerified ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5'}`}>
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="finalVerify"
                  checked={info.isVerified}
                  onChange={(e) => setInfo({ ...info, isVerified: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded-lg themed-checkbox"
                />
                <label htmlFor="finalVerify" className="text-[10px] font-bold opacity-60 leading-relaxed cursor-pointer select-none">
                  I solemnly declare that all academic figures and personal credentials provided are authentic and mirrored against my official AWKUM student record.
                </label>
              </div>
            </div>
          </section>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] opacity-40 hover:opacity-100 hover:bg-black/5 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex-[2] py-5 px-6 rounded-lg font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all active:scale-[0.98] ${isFormValid ? 'bg-[#a78bfa] text-[#0a0012]' : 'bg-[#27272a] text-[#52525b] opacity-30 cursor-not-allowed'}`}
            >
              Verify & Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;
