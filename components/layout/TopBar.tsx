import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';

const EXPORT_LABELS: Partial<Record<Page, string>> = {
  sgpa: 'Export DMC',
  cgpa: 'Export Transcript',
};

const EXPORT_ICONS: Partial<Record<Page, string>> = {
  sgpa: 'picture_as_pdf',
  cgpa: 'picture_as_pdf',
};

interface TopBarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onExport?: () => void;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activePage, onNavigate, onExport, onMenuClick }) => {
  const exportLabel = EXPORT_LABELS[activePage];
  const exportIcon = EXPORT_ICONS[activePage];

  return (
    <header className="fixed top-0 w-full z-[100] h-16 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-6 max-w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div
          className="text-lg font-bold text-zinc-50 tracking-tighter font-headline"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          AWKUM GPA Calculator
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-8">
        <nav className="flex gap-6 items-center">
          <a
            className={`font-['Space_Grotesk'] font-medium tracking-tight hover:text-violet-300 transition-colors duration-300 ${activePage === 'sgpa' ? 'text-violet-400 font-semibold' : 'text-zinc-400'}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('sgpa');
            }}
          >
            SGPA Calculator
          </a>
          <a
            className={`font-['Space_Grotesk'] font-medium tracking-tight hover:text-violet-300 transition-colors duration-300 ${activePage === 'cgpa' ? 'text-violet-400 font-semibold' : 'text-zinc-400'}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('cgpa');
            }}
          >
            CGPA Calculator
          </a>
          <a
            className={`font-['Space_Grotesk'] font-medium tracking-tight hover:text-violet-300 transition-colors duration-300 ${activePage === 'rules' ? 'text-violet-400 font-semibold' : 'text-zinc-400'}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('rules');
            }}
          >
            Grading Rules
          </a>
        </nav>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-primary transition-colors">
            share
          </span>
          <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-primary transition-colors">
            settings
          </span>
        </div>
      </div>

      <div className="lg:hidden flex items-center gap-4">
        {exportLabel && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-primary-container text-on-primary font-bold px-4 py-1.5 rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">{exportIcon}</span>
            <span>{exportLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
