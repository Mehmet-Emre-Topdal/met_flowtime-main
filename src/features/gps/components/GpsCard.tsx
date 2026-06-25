import React from 'react';
import { useTranslation } from 'react-i18next';
import { GpsDto } from '@/types/gps';
import { TaskDto } from '@/types/task';

interface GpsCardProps {
    gps: GpsDto;
    tasks: TaskDto[];
    onClick: () => void;
    isActive?: boolean;
}

const GpsCard = ({ gps, tasks, onClick, isActive = false }: GpsCardProps) => {
    const { t } = useTranslation();

    const linkedTasks = gps.majorMoves
        .map(move => tasks.find(task => task.id === move.taskId))
        .filter((task): task is TaskDto => Boolean(task));
    const doneCount = linkedTasks.filter(task => task.status === 'done').length;
    const totalMoves = gps.majorMoves.length;
    const progress = totalMoves > 0 ? Math.round((doneCount / totalMoves) * 100) : 0;

    return (
        <button
            onClick={onClick}
            className={`flex flex-col gap-3.5 p-4 rounded-2xl border bg-[#ffffff] transition-all text-left w-full ${isActive ? 'border-[#7c6cd4] shadow-[0_4px_16px_rgba(124,108,212,0.12)]' : 'border-[#ededf2] hover:border-[#d9d2f4] hover:shadow-[0_7px_20px_rgba(20,20,40,0.08)]'}`}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-[#1d1d22] leading-snug min-w-0">{gps.title}</h3>
                <span className="text-[10px] text-[#7c6cd4] bg-[#7c6cd4]/[0.08] rounded-md px-2 py-0.5 font-semibold uppercase tracking-wider shrink-0">
                    {t(`gps.status.${gps.status}`)}
                </span>
            </div>

            <div className="flex gap-1.5">
                <span className="text-[11px] font-bold text-[#2f9183] bg-[#e7f4f1] rounded-md px-2 py-0.5">G {gps.goals.length}</span>
                <span className="text-[11px] font-bold text-[#3f74c4] bg-[#ecf2fc] rounded-md px-2 py-0.5">P {totalMoves}</span>
                <span className="text-[11px] font-bold text-[#c87f2e] bg-[#fbf3e6] rounded-md px-2 py-0.5">S {gps.system.reminders.length}</span>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#9494a0]">
                    <span>{t("gps.progress")}</span>
                    <span>{doneCount}/{totalMoves}</span>
                </div>
                <div className="h-1.5 w-full bg-[#ededf2] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3f9d77] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </button>
    );
};

export default GpsCard;
