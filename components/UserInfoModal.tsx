
import React, { useState, useEffect } from 'react';
import { UserInfo } from '../types';
import { PROGRAMMES } from '../constants';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: UserInfo) => void;
  title: string;
  isCGPA?: boolean;
  rowCount?: number;
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
    isVerified: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (info.programme === "Undergraduate (BS)") {
      setInfo(prev => ({ ...prev, semester: prev.isCompleted ? '8' : '1' }));
    } else {
      setInfo(prev => ({ ...prev, semester: '' }));
    }
  }, [info.programme, info.isCompleted]);

  if (!isOpen) return null;

  const sanitizeName = (val: string) => val.replace(/[0-9]/g, '');
  const sanitizeSection = (val: string) => val.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic required fields
    if (!info.name.trim() || !info.fatherName.trim() || !info.registrationNumber.trim() || !info.subject.trim() || !info.section.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!info.isVerified) {
      setError('You must confirm the accuracy of your details.');
      return;
    }

    // CGPA Specific Validations
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
            setError('Please provide a valid total duration for your programme.');
            return;
          }
          if (rowCount !== duration) {
            setError(`Incomplete data: You indicated a ${duration} semester programme, but provided ${rowCount} semester records.`);
            return;
          }
        }
      } else {
        // Active Student logic
        const currentSem = parseInt(info.semester);
        if (rowCount !== (currentSem - 1)) {
          setError(`Inconsistent data: For Semester ${currentSem}, you should have provided results for ${currentSem - 1} previous semesters. Found: ${rowCount}`);
          return;
        }
      }
    }

    const finalInfo = {
      ...info,
      registrationNumber: `AWKUM-${info.registrationNumber}`
    };

    onSubmit(finalInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-blue-100 text-xs mt-1">Academic Credential Verification</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Name</label>
              <input
                type="text"
                placeholder="Ex. Ahmad Khan"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: sanitizeName(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Father's Name</label>
              <input
                type="text"
                placeholder="Ex. Gul Khan"
                value={info.fatherName}
                onChange={(e) => setInfo({ ...info, fatherName: sanitizeName(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registration Number</label>
            <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200">
              <span className="bg-gray-100 px-3 py-2 text-gray-500 font-mono text-xs border-r border-gray-200 flex items-center">AWKUM-</span>
              <input
                type="text"
                maxLength={8}
                placeholder="12345678"
                value={info.registrationNumber}
                onChange={(e) => setInfo({ ...info, registrationNumber: e.target.value.replace(/\D/g, '') })}
                className="flex-1 px-4 py-2 bg-white outline-none text-sm font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Programme</label>
              <select
                value={info.programme}
                onChange={(e) => setInfo({ ...info, programme: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {info.isCompleted ? 'Total Semesters' : 'Current Semester'}
              </label>
              <select
                disabled={info.isCompleted && info.programme === "Undergraduate (BS)"}
                value={info.semester}
                onChange={(e) => setInfo({ ...info, semester: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {isCGPA && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <input 
                type="checkbox" 
                id="isCompleted"
                checked={info.isCompleted}
                onChange={(e) => setInfo({ ...info, isCompleted: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isCompleted" className="text-sm font-semibold text-blue-800">Completed Graduation</label>
              {info.isCompleted && info.programme !== "Undergraduate (BS)" && (
                <input 
                  type="number"
                  placeholder="Total Semesters"
                  value={info.totalDuration}
                  onChange={(e) => setInfo({ ...info, totalDuration: e.target.value })}
                  className="ml-auto w-20 px-2 py-1 text-xs border border-blue-200 rounded"
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Major / Subject</label>
              <input
                type="text"
                placeholder="Ex. Computer Science"
                value={info.subject}
                onChange={(e) => setInfo({ ...info, subject: sanitizeName(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Section</label>
              <input
                type="text"
                placeholder="A"
                value={info.section}
                onChange={(e) => setInfo({ ...info, section: sanitizeSection(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Minor (Optional)</label>
            <input
              type="text"
              placeholder="Ex. Statistics"
              value={info.minor}
              onChange={(e) => setInfo({ ...info, minor: sanitizeName(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            <input 
              type="checkbox" 
              checked={info.isVerified}
              onChange={(e) => setInfo({ ...info, isVerified: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 rounded"
            />
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              I confirm that the marks and the details I added here are correct to my knowledge and verified against my user profile inside MIS.
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-[11px] font-bold bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
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
