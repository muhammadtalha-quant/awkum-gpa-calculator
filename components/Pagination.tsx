import React from 'react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    theme: any;
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange, theme }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className={`p-2 rounded-xl border ${theme.border} transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all ${currentPage === page
                            ? `${theme.primary} text-white border-transparent shadow-md`
                            : `${theme.border} opacity-60 hover:opacity-100 hover:bg-black/5`
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className={`p-2 rounded-xl border ${theme.border} transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>
    );
};

export default Pagination;
