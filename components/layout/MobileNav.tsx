import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'sgpa',  icon: 'calculate', label: 'SGPA' },
  { page: 'cgpa',  icon: 'analytics', label: 'CGPA' },
  { page: 'rules', icon: 'gavel',     label: 'Rules' },
];

const MobileNav: React.FC<Props> = ({ activePage, onNavigate }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-[#0c0c0f] border-t border-[#27272a]">
      {NAV_ITEMS.map(({ page, icon, label }) => {
        const active = activePage === page;
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active ? 'text-[#a78bfa]' : 'text-[#a1a1aa]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className={`text-[10px] uppercase tracking-wider ${active ? 'font-bold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
