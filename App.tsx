import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SGPACalculator from './components/SGPACalculator';
import CGPACalculator from './components/CGPACalculator';
import CalculationInfo from './components/CalculationInfo';
import GradingChart from './components/GradingChart';
import { ThemeType, ThemeMode } from './src/domain/types';
import { THEMES } from './constants';

const App: React.FC = () => {
  // UI State
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');
  const [theme, setTheme] = useState<ThemeType>('catppuccin');
  const [mode, setMode] = useState<ThemeMode>('light');

  const currentTheme = THEMES[mode][theme];

  const transition = (event: React.MouseEvent, update: () => void) => {
    if (!(document as any).startViewTransition) {
      update();
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const transition = (document as any).startViewTransition(() => {
      update();
    });
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        { clipPath: clipPath },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  const handleThemeChange = (e: React.MouseEvent, t: ThemeType) => {
    transition(e, () => setTheme(t));
  };

  const toggleMode = (e: React.MouseEvent) => {
    transition(e, () => setMode((prev: ThemeMode) => prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 ${currentTheme.bg} ${currentTheme.text}`}>

      {/* Removed Cloud Sync Status */}

      <style>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-old(root) { z-index: 1; }
        ::view-transition-new(root) { z-index: 9999; }

        /* Truly Themed Custom Checkbox */
        .themed-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.5rem;
          border: 2px solid currentColor;
          position: relative;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: rgba(0,0,0,0.05);
        }
        .themed-checkbox:checked {
          background-color: currentColor;
          border-color: transparent;
        }
        .themed-checkbox:checked::after {
          content: '✓';
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.8rem;
        }
        .themed-checkbox:hover {
          transform: scale(1.1);
          background-color: rgba(0,0,0,0.1);
        }
        
        /* Dark mode adjustment for checkbox background */
        .dark .themed-checkbox {
          background-color: rgba(255,255,255,0.05);
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8 w-full">

        {/* Top Bar with Theme & Auth */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl bg-black/5 backdrop-blur-sm border border-white/5">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 text-gray-600 dark:text-gray-400">Colorscheme</span>
              <button
                onClick={toggleMode}
                className={`p-2 rounded-full transition-all hover:bg-black/10 ${currentTheme.accent}`}
                title={mode === 'light' ? "Switch to Dark" : "Switch to Light"}
              >
                {mode === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex gap-2 bg-black/10 p-1 rounded-xl">
              {(['tokyonight', 'catppuccin', 'gruvbox'] as ThemeType[]).map((t) => (
                <button
                  key={t}
                  onClick={(e) => handleThemeChange(e, t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${theme === t ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* CloudAuth removed */}
        </div>

        <Header theme={currentTheme} />

        <div className="flex justify-center mb-8 sm:mb-12">
          <nav className="flex items-center gap-2 sm:gap-8 p-1 sm:p-1.5 rounded-3xl bg-black/5 border border-white/5 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('sgpa')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-8 py-2.5 sm:py-3 rounded-2xl transition-all duration-500 group ${activeTab === 'sgpa'
                ? `bg-white text-black shadow-2xl scale-105`
                : 'opacity-40 hover:opacity-100'
                }`}
            >
              <span className={`text-[10px] font-black ${activeTab === 'sgpa' ? 'text-blue-500' : 'text-current'}`}>01</span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-[0.2em]">Semester GPA</span>
            </button>
            <div className="w-px h-6 bg-current opacity-10 hidden sm:block"></div>
            <button
              onClick={() => setActiveTab('cgpa')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-8 py-2.5 sm:py-3 rounded-2xl transition-all duration-500 group ${activeTab === 'cgpa'
                ? `bg-white text-black shadow-2xl scale-105`
                : 'opacity-40 hover:opacity-100'
                }`}
            >
              <span className={`text-[10px] font-black ${activeTab === 'cgpa' ? 'text-blue-500' : 'text-current'}`}>02</span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-[0.2em]">Cumulative GPA</span>
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
          <p className="mt-1">Developed with ❤️ for AWKUMIANS by AWKUMIAN</p>
        </footer>
      </div>
    </div>
  );
};

export default App;