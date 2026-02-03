
import React, { useState } from 'react';
import { UserInfo } from '../types';

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
    registrationNumber: 'AWKUM-'
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!info.name.trim() || !info.fatherName.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!info.registrationNumber.toUpperCase().startsWith('AWKUM-') || info.registrationNumber.length < 7) {
      setError('Registration number must start with "AWKUM-" followed by your ID.');
      return;
    }

    onSubmit(info);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-blue-100 text-sm mt-1">Please enter student details for the DMC</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Student Name</label>
            <input
              autoFocus
              type="text"
              placeholder="Full Name"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Father's Name</label>
            <input
              type="text"
              placeholder="Father's Full Name"
              value={info.fatherName}
              onChange={(e) => setInfo({ ...info, fatherName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registration Number</label>
            <input
              type="text"
              placeholder="AWKUM-XXXXXXXX"
              value={info.registrationNumber}
              onChange={(e) => setInfo({ ...info, registrationNumber: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono transition-all"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              Generate PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;
