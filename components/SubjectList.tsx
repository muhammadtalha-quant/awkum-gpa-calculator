import React, { useState } from 'react';
import { SGPASubject, Credit, Mark, GradePoint } from '../src/domain/types';
import SubjectEntryModal from './SubjectEntryModal';
import MISParserModal from './MISParserModal';
import Pagination from './Pagination';

interface Props {
    subjects: SGPASubject[];
    onUpdate: (subjects: SGPASubject[]) => void;
    theme: any;
    enableCodes: boolean;
    maxCredits: number;
}

const SubjectList: React.FC<Props> = ({ subjects, onUpdate, theme, enableCodes, maxCredits }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMISModalOpen, setIsMISModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SGPASubject | undefined>(undefined);

    const ITEMS_PER_PAGE = 3;

    const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);
    const paginatedSubjects = subjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenAdd = () => {
        setEditingSubject(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (sub: SGPASubject) => {
        setEditingSubject(sub);
        setIsModalOpen(true);
    };

    const handleRemove = (id: string) => {
        onUpdate(subjects.filter(s => s.id !== id));
        if (paginatedSubjects.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSubmit = (data: Partial<SGPASubject>) => {
        if (editingSubject) {
            onUpdate(subjects.map(s => s.id === editingSubject.id ? { ...s, ...data } as SGPASubject : s));
        } else {
            const newSub: SGPASubject = {
                id: (Date.now() + Math.random()).toString(),
                name: data.name || '',
                code: data.code || '',
                credits: data.credits || 0 as Credit,
                marks: data.marks || 0 as Mark,
                gradePoint: data.gradePoint || 0 as GradePoint,
                gradeLetter: data.gradeLetter || 'F'
            };
            onUpdate([...subjects, newSub]);
        }
    };

    const currentTotalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    const canAdd = currentTotalCredits < maxCredits;
    const existingCodes = subjects.map(s => s.code || '').filter(Boolean);

    const handleMISImport = (imported: SGPASubject[]) => {
        // Merge: replace duplicates by code, add new ones
        const merged = [...subjects];
        for (const imp of imported) {
            const idx = merged.findIndex(s => s.code === imp.code);
            if (idx >= 0) {
                merged[idx] = imp;
            } else {
                merged.push(imp);
            }
        }
        onUpdate(merged);
    };

    return (
        <div className="space-y-4">
            <SubjectEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingSubject}
                theme={theme}
                enableCodes={enableCodes}
            />

            <MISParserModal
                isOpen={isMISModalOpen}
                onClose={() => setIsMISModalOpen(false)}
                onImport={handleMISImport}
                existingSubjectCodes={existingCodes}
                theme={theme}
            />

            <div className="grid grid-cols-1 gap-3">
                {paginatedSubjects.map((sub) => (
                    <div
                        key={sub.id}
                        className={`p-4 rounded-2xl border ${theme.border} bg-black/5 hover:bg-black/10 transition-all duration-200 animate-in fade-in slide-in-from-right-2`}
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded bg-black/10 opacity-60">
                                        {Number(sub.credits)} Credits
                                    </span>
                                    {enableCodes && sub.code && (
                                        <span className="text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                                            {sub.code}
                                        </span>
                                    )}
                                </div>
                                <h5 className="text-sm font-bold truncate">{sub.name || 'Unnamed Subject'}</h5>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                                <div className="text-center">
                                    <p className="text-[8px] font-black uppercase tracking-tighter opacity-40 mb-0.5">Marks</p>
                                    <p className="text-sm font-black">{sub.marks === '' ? '-' : sub.marks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black uppercase tracking-tighter opacity-40 mb-0.5">GP</p>
                                    <p className={`text-sm font-black ${theme.accent}`}>{sub.gradePoint.toFixed(2)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black uppercase tracking-tighter opacity-40 mb-0.5">Grade</p>
                                    <p className="text-sm font-black">{sub.gradeLetter}</p>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={() => handleOpenEdit(sub)}
                                        className="p-1.5 rounded-lg bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleRemove(sub.id)}
                                        className="p-1.5 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <button
                    disabled={!canAdd}
                    onClick={handleOpenAdd}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${canAdd
                        ? `${theme.border} ${theme.accent} hover:bg-black/5`
                        : 'opacity-20 cursor-not-allowed grayscale'
                        }`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Subject
                </button>

                {enableCodes && (
                    <button
                        onClick={() => setIsMISModalOpen(true)}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 border-purple-500/40 text-purple-400 hover:bg-purple-500/10`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Paste from MIS
                    </button>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme={theme}
                />
            </div>
        </div>
    );
};

export default SubjectList;
