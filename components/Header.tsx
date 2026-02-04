
import React, { useState } from 'react';
import { AWKUM_LOGO_URL } from '../constants';

interface HeaderProps {
  theme: any;
}

const Header: React.FC<HeaderProps> = ({ theme }) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(AWKUM_LOGO_URL);

  const handleImageError = () => {
    if (currentSrc === AWKUM_LOGO_URL) {
      setCurrentSrc('AWKUM.png');
    } else {
      setImageError(true);
    }
  };

  return (
    <header className="flex flex-col items-center mb-8 text-center">
      {!imageError ? (
        <img 
          src={currentSrc} 
          alt="AWKUM Logo" 
          className="w-24 h-24 object-contain mb-4 transition-opacity duration-300"
          onError={handleImageError}
        />
      ) : (
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-sm border-2 ${theme.border} bg-white/5`}>
          <span className={`font-bold text-xs ${theme.accent}`}>AWKUM</span>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Abdul Wali Khan University Mardan
        </h1>
        <p className={`mt-2 inline-block text-white text-sm px-4 py-1 rounded-full font-medium ${theme.primary}`}>
          GPA & CGPA Calculator
        </p>
      </div>
    </header>
  );
};

export default Header;
