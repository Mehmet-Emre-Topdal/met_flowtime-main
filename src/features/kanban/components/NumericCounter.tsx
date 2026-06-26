import React from 'react';
import { useTranslation } from 'react-i18next';
import { TaskDto } from '@/types/task';
import { useUpdateTaskNumericMutation } from '../api/tasksApi';

interface NumericCounterProps {
    task: TaskDto;
}

const NumericCounter = ({ task }: NumericCounterProps) => {
    const { t } = useTranslation();
    const [updateTaskNumeric] = useUpdateTaskNumericMutation();

    const remaining = task.remainingCount ?? 0;
    const target = task.targetCount ?? 0;
    const isComplete = target > 0 && remaining <= 0;
    const progressPercent = target > 0 ? Math.round(((target - remaining) / target) * 100) : 0;

    const setRemaining = (next: number) => {
        const clamped = target > 0 ? Math.min(target, Math.max(0, next)) : Math.max(0, next);
        if (clamped === remaining) return;
        updateTaskNumeric({ taskId: task.id, remainingCount: clamped });
    };

    const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

    return (
        <div onClick={stopPropagation} onPointerDown={stopPropagation}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="text-sm font-semibold text-[#1d1d22]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {remaining}
                    <span className="text-[#b3b3bc] font-medium"> / {target}</span>
                    <span className="text-[11px] text-[#aeaeb8] font-medium ml-1.5 lowercase">
                        {t("tasks.remaining")}
                    </span>
                </div>
                {isComplete ? (
                    <div className="flex items-center gap-1 text-[#3f9d77] text-xs font-semibold">
                        <i className="pi pi-check text-[10px]" />
                        {t("tasks.doneShort")}
                    </div>
                ) : (
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setRemaining(remaining - 1)}
                            className="w-7 h-7 rounded-[8px] border border-[#e6e6ec] bg-[#ffffff] text-[#5d5d68] text-lg leading-none flex items-center justify-center hover:bg-[#f4f4f7] transition-colors"
                            aria-label="decrement remaining"
                        >
                            −
                        </button>
                        <button
                            onClick={() => setRemaining(remaining + 1)}
                            className="w-7 h-7 rounded-[8px] bg-[#7c6cd4] text-white text-lg leading-none flex items-center justify-center hover:brightness-95 transition-all"
                            aria-label="increment remaining"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
            <div className="h-1.5 bg-[#ededf2] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${progressPercent}%`, background: isComplete ? '#3f9d77' : '#7c6cd4' }}
                />
            </div>
        </div>
    );
};

export default NumericCounter;
