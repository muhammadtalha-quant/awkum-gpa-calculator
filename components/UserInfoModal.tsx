
import React, { useState, useEffect, useRef } from 'react';
import { UserInfo } from '../types';
import { PROGRAMMES } from '../constants';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: UserInfo) => void;
  title: string;
  isCGPA?: boolean;
  rowCount?: number;
  theme: any;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, onSubmit, title, isCGPA, rowCount = 0, theme }) => {
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
  const [error, setError] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!info.name.trim() || !info.fatherName.trim() || !info.registrationNumber.trim() || !info.subject.trim() || !info.section.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!info.isVerified) {
      setError('You must confirm the accuracy of your details.');
      return;
    }

    if (isCGPA) {
      if (info.isCompleted) {
        if (info.programme === "Undergraduate (BS)") {
          if (rowCount !== 8) {
            setError(`Incomplete data: A completed BS programme requires exactly 8 semesters. Currently provided: ${rowCount}`);
            return;
          }
        } else {
          const duration = parseInt(info.totalDuration || '0');
          if (isNaN(duration) || duration <= 0) {
            setError('Please provide the total number of semesters for your programme.');
            return;
          }
          if (rowCount !== duration) {
            setError(`Incomplete data: You indicated a ${duration} semester programme, but provided ${rowCount} semester records.`);
            return;
          }
        }
      } else {
        const currentSem = parseInt(info.semester);
        if (rowCount !== (currentSem - 1)) {
          setError(`Inconsistent data: For Semester ${currentSem}, you should have provided results for ${currentSem - 1} previous semesters. Found: ${rowCount}`);
          return;
        }
      }
    }

    const finalInfo = {
      ...info,
      registrationNumber: `AWKUM-${info.registrationNumber}`,
      semester: (info.isCompleted && info.programme !== "Undergraduate (BS)") ? info.totalDuration : info.semester
    };

    onSubmit(finalInfo as UserInfo);
    onClose();
  };

  const isCompletedNonBS = isCGPA && info.isCompleted && info.programme !== "Undergraduate (BS)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${theme.card} ${theme.text}`}>
        <div className={`p-6 text-white text-center ${theme.primary}`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-white/70 text-xs mt-1">Academic Credential Verification</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center mb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-24 h-24 rounded-2xl border-2 border-dashed ${theme.border} flex items-center justify-center cursor-pointer overflow-hidden hover:bg-black/5 transition-all relative group`}
            >
              {info.photo ? (
                <img src={info.photo} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <span className="text-[10px] font-bold opacity-50">Upload Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold">Change</span>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Student Name</label>
              <input
                type="text"
                placeholder="Ex. Ahmad Khan"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: sanitizeName(e.target.value) })}
                className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Father's Name</label>
              <input
                type="text"
                placeholder="Ex. Gul Khan"
                value={info.fatherName}
                onChange={(e) => setInfo({ ...info, fatherName: sanitizeName(e.target.value) })}
                className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Registration Number</label>
            <div className={`flex shadow-sm rounded-xl overflow-hidden border ${theme.border}`}>
              <span className="bg-black/5 px-3 py-2 opacity-50 font-mono text-xs border-r flex items-center">AWKUM-</span>
              <input
                type="text"
                maxLength={8}
                placeholder="12345678"
                value={info.registrationNumber}
                onChange={(e) => setInfo({ ...info, registrationNumber: e.target.value.replace(/\D/g, '') })}
                className="flex-1 px-4 py-2 bg-transparent outline-none text-sm font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Programme</label>
              <select
                value={info.programme}
                onChange={(e) => setInfo({ ...info, programme: e.target.value })}
                className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
              >
                {PROGRAMMES.map(p => <option key={p} value={p} className="text-black">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">
                {info.isCompleted ? 'Total Semesters' : 'Current Semester'}
              </label>
              {isCompletedNonBS ? (
                <input
                  type="number"
                  min="1"
                  max="12"
                  placeholder="e.g. 4"
                  value={info.totalDuration}
                  onChange={(e) => setInfo({ ...info, totalDuration: e.target.value })}
                  className={`w-full px-4 py-2 bg-transparent border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold ${theme.accent} ${theme.border}`}
                />
              ) : (
                <select
                  disabled={info.isCompleted && info.programme === "Undergraduate (BS)"}
                  value={info.semester}
                  onChange={(e) => setInfo({ ...info, semester: e.target.value })}
                  className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-30 ${theme.border}`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                    <option key={s} value={s.toString()} className="text-black">Semester {s}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {isCGPA && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border border-transparent bg-black/5`}>
              <input 
                type="checkbox" 
                id="isCompleted"
                checked={info.isCompleted}
                onChange={(e) => setInfo({ ...info, isCompleted: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="isCompleted" className="text-sm font-bold cursor-pointer select-none">Completed Graduation</label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Major / Subject</label>
              <input
                type="text"
                placeholder="Ex. CS"
                value={info.subject}
                onChange={(e) => setInfo({ ...info, subject: sanitizeName(e.target.value) })}
                className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Section</label>
              <input
                type="text"
                placeholder="A"
                value={info.section}
                onChange={(e) => setInfo({ ...info, section: sanitizeSection(e.target.value) })}
                className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Minor (Optional)</label>
            <input
              type="text"
              placeholder="Ex. SE, DS"
              value={info.minor}
              onChange={(e) => setInfo({ ...info, minor: sanitizeName(e.target.value) })}
              className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
            />
          </div>

          {/* Tips Section */}
          <div className="p-3 bg-black/5 rounded-xl border border-transparent">
            <p className="text-[10px] leading-tight opacity-70">
              <span className="font-bold uppercase tracking-wider block mb-1">💡 Professional Tip:</span>
              Use acronyms for Major/Minor (e.g. "CS" instead of "Computer Science", "SE" instead of "Software Engineering") for a cooler, more official transcript look.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-black/5 border border-transparent rounded-2xl">
            <input 
              type="checkbox" 
              checked={info.isVerified}
              onChange={(e) => setInfo({ ...info, isVerified: e.target.checked })}
              className="mt-1 w-4 h-4 rounded"
            />
            <p className="text-[11px] leading-relaxed font-medium opacity-80">
              I confirm that the marks and the details I added here are correct to my knowledge and verified against my user profile inside MIS.
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-[11px] font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 opacity-60 font-bold text-sm rounded-xl hover:bg-black/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!info.isVerified}
              className={`flex-1 py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 ${
                info.isVerified ? theme.primary : 'opacity-40 cursor-not-allowed'
              }`}
            >
              Proceed to Export
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;
