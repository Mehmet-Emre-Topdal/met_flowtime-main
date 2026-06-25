import React from 'react';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskDto } from '@/types/task';
import { useTranslation } from 'react-i18next';
import NumericCounter from './NumericCounter';

interface SortableTaskCardProps {
    task: TaskDto;
    isSelected: boolean;
    onClick: () => void;
    onEdit: () => void;
    onArchive: () => void;
}

const SortableTaskCard = ({ task, isSelected, onClick, onEdit, onArchive }: SortableTaskCardProps) => {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? 'none' : transition ?? undefined,
        opacity: isDragging ? 0.2 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <div
                className={`relative p-3.5 rounded-xl cursor-grab active:cursor-grabbing border bg-[#ffffff] group transition-all overflow-hidden shadow-[0_1px_2px_rgba(20,20,40,0.04)]
                    ${isSelected
                        ? 'border-[#7c6cd4]'
                        : 'border-[#ededf2] hover:border-[#e2ddf6] hover:shadow-[0_7px_20px_rgba(20,20,40,0.09)] hover:-translate-y-px'}`}
                onClick={onClick}
            >
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="w-8 h-8 sm:w-7 sm:h-7 lg:w-6 lg:h-6 flex items-center justify-center rounded bg-[#ededf2] hover:bg-[#e2e2ea] text-[#9494a0] hover:text-[#1d1d22] transition-colors"
                        title={t("common.edit")}
                    >
                        <i className="pi pi-pencil text-xs lg:text-[10px]" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onArchive(); }}
                        className="w-8 h-8 sm:w-7 sm:h-7 lg:w-6 lg:h-6 flex items-center justify-center rounded bg-[#ededf2] hover:bg-red-500/20 text-[#9494a0] hover:text-red-400 transition-colors"
                        title={t("common.delete")}
                    >
                        <i className="pi pi-trash text-xs lg:text-[10px]" />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-1 overflow-hidden">
                    <h5 className={`text-sm leading-tight select-none pr-16 font-semibold truncate ${task.status === 'done' ? 'text-[#9aa0a6] line-through' : 'text-[#1d1d22]'}`}>
                        {task.title}
                    </h5>
                    {task.isDaily && (
                        <span className="text-[9px] text-[#7c6cd4] border border-[#7c6cd4]/30 bg-[#7c6cd4]/5 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider shrink-0">
                            {t("tasks.daily")}
                        </span>
                    )}
                </div>
                {task.description && (
                    <p className="text-xs text-[#6b6b75]/70 mt-1 leading-relaxed select-none overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.description}
                    </p>
                )}
                {task.isNumeric && (
                    <div className="mt-3">
                        <NumericCounter task={task} />
                    </div>
                )}
                {task.gpsId && (
                    <div className="mt-3">
                        <Link
                            href="/gps"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f0f0f4] text-[11.5px] font-semibold text-[#5d5d68] no-underline hover:bg-[#e8e8ee] transition-colors"
                        >
                            <i className="pi pi-compass text-[10px] text-[#7c6cd4]" />
                            GPS
                        </Link>
                    </div>
                )}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#6b6b75]">
                        <i className="pi pi-clock text-[9px]" />
                        <span>{task.totalFocusedTime} {t("tasks.focused")}</span>
                    </div>
                    {isSelected && (
                        <div className="flex items-center gap-1 ml-2 bg-[#7c6cd4]/10 px-1.5 py-0.5 rounded">
                            <span className="text-[9px] text-[#7c6cd4] font-medium">{t("tasks.focusing")}</span>
                            <i className="pi pi-bolt text-[#7c6cd4] text-[9px] animate-pulse"></i>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SortableTaskCard;
