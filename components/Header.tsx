
import React from 'react';
import { AWKUM_LOGO_URL } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center mb-8 text-center">
      <img 
        src={AWKUM_LOGO_URL} 
        alt="AWKUM Logo" 
        className="w-24 h-24 object-contain mb-4" 
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Abdul Wali Khan University Mardan
        </h1>
        <p className="mt-2 inline-block bg-blue-100 text-blue-800 text-sm px-4 py-1 rounded-full font-medium">
          GPA & CGPA Calculator
        </p>
      </div>
    </header>
  );
};

export default Header;
