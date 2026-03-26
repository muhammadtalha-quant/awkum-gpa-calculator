import React from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-10 animate-slide-in-top">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white hover:border-white/10 active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <div className="flex items-center gap-2 px-2 py-1 rounded-[1.5rem] bg-white/[0.02] border border-white/5 shadow-inner-glow">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl text-[10px] font-black font-label transition-all flex items-center justify-center tracking-widest ${
              currentPage === page
                ? 'bg-primary text-on-primary shadow-glow scale-105'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            {page.toString().padStart(2, '0')}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-zinc-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white hover:border-white/10 active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  );
};

export default Pagination;
