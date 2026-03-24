import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';

interface Props {
  activePage: Page;
  onExport?: () => void;
}

const PAGE_TITLES: Record<Page, string> = {
  sgpa:  'SGPA Calculator',
  cgpa:  'CGPA Calculator',
  rules: 'University Rules',
};

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
  onExport?: () => void;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activePage, onExport, onMenuClick }) => {
  const exportLabel = EXPORT_LABELS[activePage];
  const exportIcon  = EXPORT_ICONS[activePage];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-[#09090b] border-b border-[#27272a]">
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-xl font-bold tracking-tighter text-[#fafafa]">AWKUM GPA Calculator</span>
      </div>

      {/* Right: export button + desktop label */}
      <div className="flex items-center gap-4">

        {exportLabel && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-[#a78bfa] text-[#0a0012] font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">{exportIcon}</span>
            <span>{exportLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
