import React, { useState } from 'react';
import Header from './components/Header';
import SGPACalculator from './components/SGPACalculator';
import CGPACalculator from './components/CGPACalculator';
import CalculationInfo from './components/CalculationInfo';
import GradingChart from './components/GradingChart';
import { ThemeType, ThemeMode } from './types';
import { THEMES } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');
  const [theme, setTheme] = useState<ThemeType>('catppuccin');
  const [mode, setMode] = useState<ThemeMode>('light');

  const currentTheme = THEMES[mode][theme];

  // Helper to trigger view transition for circular animation
  const transition = (event: React.MouseEvent, update: () => void) => {
    // Check if View Transitions API is supported
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
      // Always animate from 0 to full radius (origination from toggle)
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
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
    transition(e, () => setMode(prev => prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Dynamic Style for View Transition */}
      <style>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-old(root) {
          z-index: 1;
        }
        ::view-transition-new(root) {
          z-index: 9999;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Theme Controls */}
        <div className="flex flex-col items-center gap-2 mb-8 p-4 rounded-2xl bg-black/5 backdrop-blur-sm">
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
          <nav className="inline-flex p-1 rounded-2xl bg-black/10 backdrop-blur-md">
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
          <p className="mt-1">Developed with ❤️ for AWKUMIANS by AWKUMIAN</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
