import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'flowtime_quick_notes';

const StickyNotes = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [note, setNote] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setNote(saved);
        } catch {
        }
    }, []);

    const handleNoteChange = (value: string) => {
        setNote(value);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, value);
            } catch {
            }
        }, 400);
    };

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.value.length;
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <div
                className={`transition-all duration-200 ease-out origin-bottom-right
                    ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                    }`}
            >
                <div className="w-[300px] bg-[#ffffff] border border-[#ededf2] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#ededf2]">
                        <div className="flex items-center gap-2">
                            <i className="pi pi-bookmark text-[#7c6cd4] text-xs" />
                            <span className="text-xs text-[#9494a0] font-medium">
                                {t("notes.quickNotes")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i
                                className="pi pi-question-circle text-[#e2e2ea] hover:text-[#6b6b75] text-xs cursor-help transition-colors"
                                id="notes-info-icon"
                            />
                            <Tooltip
                                target="#notes-info-icon"
                                position="left"
                                className="max-w-[240px]"
                                pt={{
                                    text: { className: 'bg-[#ffffff] text-[#1d1d22] text-[11px] border border-[#ededf2] p-3 rounded-lg' }
                                }}
                            >
                                <span>
                                    {t("notes.tooltip")}
                                </span>
                            </Tooltip>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-5 h-5 flex items-center justify-center rounded text-[#e2e2ea] hover:text-[#9494a0] hover:bg-[#ededf2] transition-colors"
                            >
                                <i className="pi pi-minus text-[10px]" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={note}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        placeholder={t("notes.placeholder")}
                        className="w-full h-[180px] bg-transparent text-[#1d1d22]/90 text-sm leading-relaxed p-4 resize-none outline-none placeholder:text-[#e2e2ea]"
                        spellCheck={false}
                    />

                    <div className="flex items-center justify-between px-4 py-2 border-t border-[#ededf2]">
                        <span className="text-[9px] text-[#e2e2ea] tabular-nums">
                            {note.length > 0 ? `${note.length} ${t("common.chars")}` : t("common.empty")}
                        </span>
                        <button
                            onClick={() => {
                                if (note.trim() && confirm(t("notes.clearConfirm"))) {
                                    handleNoteChange('');
                                }
                            }}
                            className="text-[9px] text-red-400/30 hover:text-red-400 uppercase tracking-wider transition-colors font-medium"
                        >
                            {t("common.clear")}
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-11 h-11 rounded-lg flex items-center justify-center
                    transition-all duration-200
                    ${isOpen
                        ? 'bg-[#7c6cd4] text-white'
                        : 'bg-[#ffffff] border border-[#ededf2] text-[#6b6b75] hover:bg-[#ededf2] hover:text-[#9494a0]'
                    }`}
            >
                <i className={`pi ${isOpen ? 'pi-times' : 'pi-pencil'} text-sm transition-transform duration-200`} />

                {!isOpen && note.trim().length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#7c6cd4] rounded-full border-2 border-[#f4f4f7]" />
                )}
            </button>
        </div>
    );
};

export default StickyNotes;
