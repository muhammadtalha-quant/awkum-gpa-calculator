import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'sgpa',  icon: 'calculate', label: 'SGPA Calculator' },
  { page: 'cgpa',  icon: 'analytics', label: 'CGPA Calculator' },
  { page: 'rules', icon: 'gavel',     label: 'University Rules' },
];

const SideNav: React.FC<Props> = ({ activePage, onNavigate }) => {
  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 w-64 bg-[#0c0c0f] border-r border-[#27272a] flex-shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-[#27272a]">
        <h1 className="text-lg font-black text-[#a78bfa] uppercase tracking-tighter">AWKUM GPA</h1>
        <p className="text-[10px] text-[#71717a] tracking-widest uppercase mt-0.5">Academic Utility</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const active = activePage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-left ${
                active
                  ? 'bg-[#18181b] text-[#a78bfa] font-bold border-l-2 border-[#a78bfa]'
                  : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa] border-l-2 border-transparent'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#27272a]">
        <p className="text-[10px] text-[#52525b] text-center">© {new Date().getFullYear()} AWKUMIAN</p>
      </div>
    </aside>
  );
};

export default SideNav;
