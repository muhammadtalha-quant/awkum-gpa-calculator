import React, { useState } from 'react';
import Header from './components/Header';
import SGPACalculator from './components/SGPACalculator';
import CGPACalculator from './components/CGPACalculator';
import CalculationInfo from './components/CalculationInfo';
import GradingChart from './components/GradingChart';
import { ThemeType } from './types';
import { THEMES } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');
  const [theme, setTheme] = useState<ThemeType>('catppuccin');

  const currentTheme = THEMES[theme];

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 ${currentTheme.bg} ${currentTheme.text}`}>
      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Theme Controls */}
        <div className="flex flex-col items-center gap-2 mb-8 p-4 rounded-2xl bg-black/5 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Colorscheme</span>
          <div className="flex gap-2 bg-black/10 p-1 rounded-xl">
            {(['tokyonight', 'catppuccin', 'gruvbox'] as ThemeType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  theme === t ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Header theme={currentTheme} />

        <div className="flex justify-center mb-8">
          <nav className="inline-flex p-1 rounded-2xl bg-gray-200">
            <button
              onClick={() => setActiveTab('sgpa')}
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'sgpa'
                  ? `shadow-md bg-white text-black`
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Semester GPA
            </button>
            <button
              onClick={() => setActiveTab('cgpa')}
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'cgpa'
                  ? `shadow-md bg-white text-black`
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Cumulative GPA
            </button>
          </nav>
        </div>

        <main className="space-y-8">
          {activeTab === 'sgpa' ? (
            <div className="animate-in fade-in duration-300">
              <SGPACalculator theme={currentTheme} />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <CGPACalculator theme={currentTheme} />
            </div>
          )}

          <CalculationInfo theme={currentTheme} />
          <GradingChart theme={currentTheme} />
        </main>

        <footer className="mt-12 text-center opacity-50 text-xs">
          <p>© {new Date().getFullYear()} Abdul Wali Khan University Mardan - Academic Tools</p>
          <p className="mt-1">Developed for Students of AWKUM</p>
        </footer>
      </div>
    </div>
  );
};

export default App;