
import React, { useState, useEffect } from 'react';
import { UserInfo } from '../types';
import { PROGRAMMES } from '../constants';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: UserInfo) => void;
  title: string;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, onSubmit, title }) => {
  const [info, setInfo] = useState<UserInfo>({
    name: '',
    fatherName: '',
    registrationNumber: '',
    programme: PROGRAMMES[0],
    semester: '1',
    section: '',
    subject: '',
    minor: ''
  });
  const [error, setError] = useState('');

  // Reset semester type when programme changes
  useEffect(() => {
    if (info.programme === "Undergraduate (BS)") {
      setInfo(prev => ({ ...prev, semester: '1' }));
    } else {
      setInfo(prev => ({ ...prev, semester: '' }));
    }
  }, [info.programme]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!info.name.trim() || !info.fatherName.trim() || !info.registrationNumber.trim() || !info.subject.trim() || !info.section.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (info.registrationNumber.length > 8) {
      setError('Registration number suffix cannot exceed 8 digits.');
      return;
    }

    // Pass the combined registration string
    const finalInfo = {
      ...info,
      registrationNumber: `AWKUM-${info.registrationNumber}`
    };

    onSubmit(finalInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-blue-100 text-sm mt-1">Provide student credentials for the transcript</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Student Name</label>
              <input
                autoFocus
                type="text"
                placeholder="Full Name"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Father's Name</label>
              <input
                type="text"
                placeholder="Father's Full Name"
                value={info.fatherName}
                onChange={(e) => setInfo({ ...info, fatherName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Registration Number</label>
            <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200">
              <input
                type="text"
                disabled
                value="AWKUM-"
                className="w-24 bg-gray-100 px-4 py-2.5 text-gray-500 font-mono text-sm border-r border-gray-200 cursor-not-allowed"
              />
              <input
                type="text"
                maxLength={8}
                placeholder="25141794"
                value={info.registrationNumber}
                onChange={(e) => setInfo({ ...info, registrationNumber: e.target.value.replace(/\D/g, '') })}
                className="flex-1 px-4 py-2.5 bg-white outline-none text-sm font-mono tracking-wider focus:bg-blue-50 transition-colors"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 italic">Numeric ID only (Max 8 digits)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Programme</label>
              <select
                value={info.programme}
                onChange={(e) => setInfo({ ...info, programme: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
              >
                {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Semester</label>
              {info.programme === "Undergraduate (BS)" ? (
                <select
                  value={info.semester}
                  onChange={(e) => setInfo({ ...info, semester: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={info.semester}
                  onChange={(e) => setInfo({ ...info, semester: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Subject / Major</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={info.subject}
                onChange={(e) => setInfo({ ...info, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Section</label>
              <input
                type="text"
                placeholder="e.g. A"
                maxLength={2}
                value={info.section}
                onChange={(e) => setInfo({ ...info, section: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {info.programme === "Undergraduate (BS)" && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Minor (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Statistics"
                value={info.minor}
                onChange={(e) => setInfo({ ...info, minor: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 font-bold text-sm rounded-2xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              Generate Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;
