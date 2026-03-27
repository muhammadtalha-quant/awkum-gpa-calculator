import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'sgpa', icon: 'calculate', label: 'SGPA Calculator' },
  { page: 'cgpa', icon: 'analytics', label: 'CGPA Calculator' },
  { page: 'rules', icon: 'gavel', label: 'University Rules' },
];

const SideNav: React.FC<Props> = ({ activePage, onNavigate, mobileOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden animate-in transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#0c0c0f] border-r border-white/5 flex-col gap-4 py-8 z-[200] lg:z-50 lg:mt-16 w-64 transform-gpu transition-transform duration-300 ease-in-out will-change-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="px-6 mb-4">
          <h2
            className="text-xl font-black text-zinc-100 font-headline uppercase tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Obsidian Academics
          </h2>
          <p
            className="text-[10px] font-label font-bold text-zinc-500 tracking-[0.2em] uppercase"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            AWKUM Scholar v3.2
          </p>
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map(({ page, icon, label }) => {
            const active = activePage === page;
            return (
              <div
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label text-sm tracking-wider uppercase ${active
                    ? 'bg-violet-500/10 text-violet-400 border-r-4 border-violet-500 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                  }`}
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {icon}
                </span>
                <span>{label.replace(' Calculator', '').replace('University ', '')}</span>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default SideNav;
