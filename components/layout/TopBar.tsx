/* eslint-disable no-console */
import React from 'react';

type Page = 'sgpa' | 'cgpa' | 'rules';



interface TopBarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activePage, onNavigate, onMenuClick }) => {

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AWKUM GPA Calculator', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('URL copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };

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
        <button
          onClick={handleShare}
          className="text-zinc-400 hover:text-primary transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>

      <div className="lg:hidden flex items-center gap-4">

      </div>
    </header>
  );
};

export default TopBar;
