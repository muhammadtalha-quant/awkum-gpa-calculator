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

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  isCGPA,
  rowCount = 0,
}) => {
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
    photo: undefined,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (info.programme === 'Undergraduate (BS)') {
      setInfo((prev) => ({ ...prev, semester: prev.isCompleted ? '8' : '1' }));
    } else if (!info.isCompleted) {
      setInfo((prev) => ({ ...prev, semester: '1' }));
    }
  }, [info.programme, info.isCompleted]);

  if (!isOpen) return null;

  const sanitizeName = (val: string) => val.replace(/[^A-Za-z\s]/g, '');
  const sanitizeSection = (val: string) =>
    val
      .replace(/[^A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, 1);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo((prev) => ({ ...prev, photo: reader.result as string }));
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
      if (info.programme === 'Undergraduate (BS)') {
        if (rowCount !== 8) cgpaConstraintError = `BS requires 8 semesters (Provided: ${rowCount})`;
      } else {
        const duration = parseInt(info.totalDuration || '0');
        if (!duration || rowCount !== duration)
          cgpaConstraintError = `${duration ? `Required: ${duration}` : 'Total duration needed'}`;
      }
    } else {
      const currentSem = parseInt(info.semester);
      if (rowCount !== currentSem - 1)
        cgpaConstraintError = `Sem ${currentSem} requires ${currentSem - 1} records (Found: ${rowCount})`;
    }
  }

  const isFormValid =
    isNameValid &&
    isFatherValid &&
    isRegValid &&
    isSectionValid &&
    isSubjectValid &&
    info.isVerified &&
    !cgpaConstraintError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalInfo = {
      ...info,
      registrationNumber: `AWKUM-${info.registrationNumber}`,
      semester:
        info.isCompleted && info.programme !== 'Undergraduate (BS)'
          ? info.totalDuration
          : info.semester,
    };

    onSubmit(finalInfo as UserInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 bg-bg-surface animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 sm:p-10 text-center relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="relative z-10">
            <h3 className="text-2xl font-black font-headline text-white uppercase tracking-[0.2em] mb-2">
              {title}
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Official AWKUM Credential Verification
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="material-symbols-outlined text-6xl">verified_user</span>
          </div>
        </div>

          <form
          onSubmit={handleSubmit}
          className="px-6 sm:px-10 pb-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          {/* Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black font-label text-primary uppercase tracking-widest">
                Personal Identity
              </span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden bg-bg-surface-lowest hover:border-primary/50 transition-all duration-500 shadow-xl"
                >
                  {info.photo ? (
                    <img src={info.photo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-zinc-700 text-3xl">
                      add_a_photo
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                      Update
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={info.name}
                    onChange={(e) => setInfo({ ...info, name: sanitizeName(e.target.value) })}
                    className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-bold text-on-surface transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                    Father&apos;s Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter father's name"
                    value={info.fatherName}
                    onChange={(e) => setInfo({ ...info, fatherName: sanitizeName(e.target.value) })}
                    className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-bold text-on-surface transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                Registration Number
              </label>
              <div className="flex items-center bg-bg-surface-lowest border border-white/5 rounded-xl overflow-hidden focus-within:border-primary transition-all">
                <div className="px-5 py-3.5 bg-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  AWKUM -
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="00000000"
                  value={info.registrationNumber}
                  onChange={(e) =>
                    setInfo({ ...info, registrationNumber: e.target.value.replace(/\D/g, '') })
                  }
                  className="flex-1 bg-transparent px-5 py-3.5 outline-none text-sm font-black tracking-[0.3em] text-on-surface"
                />
              </div>
            </div>
          </section>

          {/* Academic Profile */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black font-label text-primary uppercase tracking-widest">
                Academic Ranking
              </span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                  Academic Program
                </label>
                <select
                  value={info.programme}
                  onChange={(e) => setInfo({ ...info, programme: e.target.value })}
                  className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm font-bold text-on-surface appearance-none cursor-pointer hover:bg-white/5 transition-all"
                >
                  {PROGRAMMES.map((p) => (
                    <option key={p} value={p} className="bg-zinc-900">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                  {info.isCompleted ? 'Total Duration' : 'Target Semester'}
                </label>
                {isCGPA && info.isCompleted && info.programme !== 'Undergraduate (BS)' ? (
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Semesters"
                    value={info.totalDuration}
                    onChange={(e) => setInfo({ ...info, totalDuration: e.target.value })}
                    className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm font-black text-center text-on-surface"
                  />
                ) : (
                  <select
                    disabled={info.isCompleted && info.programme === 'Undergraduate (BS)'}
                    value={info.semester}
                    onChange={(e) => setInfo({ ...info, semester: e.target.value })}
                    className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm disabled:opacity-30 font-bold text-on-surface appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <option key={s} value={s.toString()} className="bg-zinc-900">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                  Major Discipline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computing"
                  value={info.subject}
                  onChange={(e) => setInfo({ ...info, subject: sanitizeName(e.target.value) })}
                  className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm font-bold text-on-surface transition-all placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                  Section
                </label>
                <input
                  type="text"
                  placeholder="A"
                  value={info.section}
                  onChange={(e) => setInfo({ ...info, section: sanitizeSection(e.target.value) })}
                  className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-center font-black text-sm text-on-surface transition-all"
                />
              </div>
            </div>
          </section>

          {/* Terms & Verification */}
          <section className="space-y-4 pt-4">
            {isCGPA && (
              <button
                type="button"
                onClick={() => setInfo({ ...info, isCompleted: !info.isCompleted })}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${info.isCompleted ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10'}`}
              >
                <span className="text-xs font-black uppercase tracking-widest">
                  Graduation Status Completed
                </span>
                <span
                  className={`material-symbols-outlined ${info.isCompleted ? 'opacity-100' : 'opacity-20'}`}
                >
                  {info.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
            )}

            {cgpaConstraintError && (
              <div className="p-5 bg-error/10 border border-error/20 rounded-2xl text-error flex items-center gap-3 animate-bounce-short">
                <span className="material-symbols-outlined text-xl">warning</span>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  {cgpaConstraintError}
                </p>
              </div>
            )}

            <div
              className={`p-6 rounded-[2rem] transition-all bg-white/5 border border-white/5 ${info.isVerified ? 'border-primary/30' : ''}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="finalVerify"
                  checked={info.isVerified}
                  onChange={(e) => setInfo({ ...info, isVerified: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded-lg accent-primary cursor-pointer"
                />
                <label
                  htmlFor="finalVerify"
                  className="text-[10px] font-bold text-zinc-400 leading-relaxed cursor-pointer select-none"
                >
                  I solemnly declare that all academic figures and personal credentials provided are
                  authentic and mirrored against my official AWKUM student record.
                </label>
              </div>
            </div>
          </section>

          <footer className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-xl font-black font-label text-[10px] uppercase tracking-widest text-zinc-500 hover:bg-white/5 transition-all text-center"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex-[2] py-4 px-6 rounded-xl font-black font-label text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] ${isFormValid ? 'bg-primary text-on-primary hover:shadow-primary/20' : 'bg-surface-container-highest text-zinc-600 opacity-50 cursor-not-allowed'}`}
            >
              Verify & Proceed
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;
