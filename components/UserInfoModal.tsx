import React, { useState, useRef } from 'react';
import { UserInfo } from '../src/domain/types';
import { PROGRAMMES } from '../constants';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: UserInfo) => void;
  title: string;
  isCGPA?: boolean;
  rowCount?: number;
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

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      let newSem = info.semester;
      let newCompleted = info.isCompleted;

      if (isCGPA) {
        if (!info.isCompleted) {
          newSem = String(rowCount);
        }
      } else {
        newSem = '1';
      }

      setInfo({
        ...info,
        semester: newSem,
        isCompleted: newCompleted,
      });
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sanitizeName = (val: string) => val.replace(/[^A-Za-z\s]/g, '');
  const sanitizeDiscipline = (val: string) => val.replace(/[^A-Za-z\s-]/g, '');
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
  const isSubjectValid = /^[A-Za-z\s]{2,}(-[A-Za-z\s]{2,})?$/.test(info.subject.trim());

  let cgpaConstraintError = '';
  if (isCGPA && info.isCompleted) {
    const prog = info.programme;
    if (prog === 'Undergraduate (BS)') {
      if (rowCount < 8)
        cgpaConstraintError = `BS requires minimum 8 semesters (Found: ${rowCount})`;
    } else if (prog === 'Graduation(MS)' || prog === 'M.Phil') {
      if (rowCount < 3)
        cgpaConstraintError = `MS/MPhil requires minimum 3 semesters (Found: ${rowCount})`;
    } else if (prog === 'Ph.D') {
      if (rowCount < 6)
        cgpaConstraintError = `PhD requires minimum 6 semesters (Found: ${rowCount})`;
    }
  }

  const isFormValid =
    isNameValid &&
    isFatherValid &&
    isRegValid &&
    isSectionValid &&
    isSubjectValid &&
    info.isVerified &&
    (!isCGPA || !info.isCompleted || !cgpaConstraintError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalInfo = {
      ...info,
      registrationNumber: `AWKUM-${info.registrationNumber}`,
      semester: isCGPA ? (info.isCompleted ? info.totalDuration : String(rowCount)) : info.semester,
    };

    onSubmit(finalInfo as UserInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in">
      <div className="w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 bg-bg-surface animate-zoom-in">
        {/* Header */}
        <div className="p-8 sm:p-10 text-center relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="relative z-10">
            <h3 className="text-2xl font-black font-headline text-white uppercase tracking-[0.2em] mb-2">
              {title}
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Official AWKUM Credential Verification
            </p>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <span className="material-symbols-outlined text-6xl">verified_user</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-8 sm:px-12 pb-10 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
        >
          {/* Identity Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black font-label text-primary uppercase tracking-widest">
                Personal Identity
              </span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-12">
              <div className="relative group shrink-0 mx-auto lg:mx-0">
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

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-1.5 md:col-span-2">
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
                  onChange={(e) => {
                    const prog = e.target.value;
                    let sem = info.semester;
                    if (!isCGPA) {
                      sem = '1';
                    }
                    setInfo({ ...info, programme: prog, semester: sem });
                  }}
                  className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm font-bold text-on-surface appearance-none cursor-pointer hover:bg-white/5 transition-all"
                >
                  {PROGRAMMES.map((p) => (
                    <option key={p} value={p} className="bg-zinc-900">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {(!isCGPA || info.isCompleted) && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                    {info.isCompleted ? 'Total Duration (Semesters)' : 'Target Semester'}
                  </label>
                  {isCGPA && info.isCompleted ? (
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="e.g. 8"
                      value={info.totalDuration}
                      onChange={(e) => setInfo({ ...info, totalDuration: e.target.value })}
                      className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm font-black text-center text-on-surface transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <select
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
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black font-label text-zinc-400 uppercase tracking-widest ml-1">
                  Discipline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science-Biology"
                  value={info.subject}
                  onChange={(e) =>
                    setInfo({ ...info, subject: sanitizeDiscipline(e.target.value) })
                  }
                  className={`w-full px-5 py-3.5 bg-bg-surface-lowest border rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm font-bold text-on-surface transition-all placeholder:text-zinc-600 ${
                    info.subject && !isSubjectValid
                      ? 'border-error/50'
                      : 'border-white/5 focus:border-primary'
                  }`}
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
                onClick={() => {
                  const compl = !info.isCompleted;
                  let sem = info.semester;
                  if (!isCGPA) {
                    sem = '1';
                  }
                  setInfo({ ...info, isCompleted: compl, semester: sem });
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${info.isCompleted ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10'}`}
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
              <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error flex items-center gap-3 animate-bounce-short">
                <span className="material-symbols-outlined text-xl">warning</span>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  {cgpaConstraintError}
                </p>
              </div>
            )}

            <div
              className={`p-4 rounded-[2rem] transition-all bg-white/5 border border-white/5 ${info.isVerified ? 'border-primary/30' : ''}`}
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
              className={`flex-[2] py-4 px-6 rounded-xl font-black font-label text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] ${isFormValid ? 'bg-primary text-on-primary hover:shadow-glow-sm' : 'bg-surface-container-highest text-zinc-600 opacity-50 cursor-not-allowed'}`}
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
