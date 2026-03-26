import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'sgpa', icon: 'calculate', label: 'SGPA' },
  { page: 'cgpa', icon: 'analytics', label: 'CGPA' },
  { page: 'rules', icon: 'gavel', label: 'Rules' },
];

const MobileNav: React.FC<Props> = ({ activePage, onNavigate }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 h-20 bg-[#0c0c0f]/95 backdrop-blur-lg border-t border-white/5 flex justify-around items-center px-2 pb-safe rounded-t-[20px] shadow-[0_-8px_30px_rgba(167,139,250,0.08)]">
      {NAV_ITEMS.map(({ page, icon, label }) => {
        const active = activePage === page;
        return (
          <div
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
              active
                ? 'bg-violet-500/10 text-violet-400 rounded-2xl px-4 py-1 font-label text-[10px] font-bold uppercase tracking-[0.1em]'
                : 'text-zinc-500 font-label text-[10px] font-bold uppercase tracking-[0.1em]'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default MobileNav;
