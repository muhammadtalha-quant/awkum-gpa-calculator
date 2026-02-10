import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SGPACalculator from './components/SGPACalculator';
import CGPACalculator from './components/CGPACalculator';
import CalculationInfo from './components/CalculationInfo';
import GradingChart from './components/GradingChart';
import { ThemeType, ThemeMode } from './types';
import { THEMES } from './constants';

const UI_SYNC_KEY = 'awkum_gpa_ui_config_v2';
const ACCESS_KEY = 'awkum_gpa_last_access_v2';

const App: React.FC = () => {
  // UI State
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');
  const [theme, setTheme] = useState<ThemeType>('catppuccin');
  const [mode, setMode] = useState<ThemeMode>('light');

  // Notification State
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncVisible, setIsSyncVisible] = useState(false);

  const currentTheme = THEMES[mode][theme];

  // Ref to hold current state for silent beforeunload save
  const stateRef = useRef({ activeTab, theme, mode });
  useEffect(() => {
    stateRef.current = { activeTab, theme, mode };
  }, [activeTab, theme, mode]);

  // Garbage Collection & Initial Restoration
  useEffect(() => {
    const lastAccess = localStorage.getItem(ACCESS_KEY);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Auto Garbage Collection: If site not accessed in 24h, clear everything
    if (lastAccess && now - parseInt(lastAccess) > twentyFourHours) {
      localStorage.removeItem(UI_SYNC_KEY);
      localStorage.removeItem('awkum_sgpa_config_v1');
    }
    localStorage.setItem(ACCESS_KEY, now.toString());

    // Restore UI UI State
    const savedUI = localStorage.getItem(UI_SYNC_KEY);
    if (savedUI) {
      try {
        const data = JSON.parse(savedUI);
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.theme) setTheme(data.theme);
        if (data.mode) setMode(data.mode);

      } catch (e) {
        console.error("UI restore failed", e);
      }
    }

    // Silent Save before app close
    const handleUnload = () => {
      localStorage.setItem(UI_SYNC_KEY, JSON.stringify(stateRef.current));
      localStorage.setItem(ACCESS_KEY, Date.now().toString());
    };
    window.addEventListener('beforeunload', handleUnload);

    // Reactive Cloud Save Trigger every 2 minutes
    const saveInterval = setInterval(() => {
      triggerSyncMessage("Session Saved");
    }, 120000);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      clearInterval(saveInterval);
    };
  }, []);

  // Sync UI state to storage on every change
  useEffect(() => {
    localStorage.setItem(UI_SYNC_KEY, JSON.stringify({ activeTab, theme, mode }));
  }, [activeTab, theme, mode]);

  const triggerSyncMessage = (msg: string) => {
    setSyncMessage(msg);
    setIsSyncVisible(true);
    setTimeout(() => setIsSyncVisible(false), 4000);
  };

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
    transition(e, () => setMode(prev => prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 ${currentTheme.bg} ${currentTheme.text}`}>

      {/* Reactive Cloud Notification (Swiped Down animation) */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out transform ${isSyncVisible ? 'translate-y-6 opacity-100' : '-translate-y-20 opacity-0'
          }`}
      >
        <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] ${currentTheme.text}`}>
          <svg className="w-5 h-5 text-blue-500 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.5 19c-3.037 0-5.5-2.463-5.5-5.5s2.463-5.5 5.5-5.5c1.455 0 2.775.568 3.75 1.493V7a7.001 7.001 0 00-11.91-5.007C7.306 2.053 5.378 4.295 5.105 7.15A5.002 5.002 0 005 17h12.5a6.5 6.5 0 100-13 1 1 0 010 2 4.5 4.5 0 010 9z" />
          </svg>
          {syncMessage}
        </div>
      </div>

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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${theme === t ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'
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
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'sgpa'
                  ? `shadow-md bg-white text-black`
                  : 'opacity-60 hover:opacity-100'
                }`}
            >
              Semester GPA
            </button>
            <button
              onClick={() => setActiveTab('cgpa')}
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'cgpa'
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