import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    status: string;
    label: string;
    count: number;
    children: React.ReactNode;
}

const columnDotColors: Record<string, string> = {
    todo: '#bcbcc6',
    inprogress: '#d9a24e',
    done: '#3f9d77',
};

const DroppableColumn = ({ status, label, count, children }: DroppableColumnProps) => {
    const { isOver, setNodeRef } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col gap-2.5 px-3 pt-3 pb-4 rounded-[14px] min-h-[400px] transition-colors duration-200
                ${isOver
                    ? 'bg-[#7c6cd4]/8 ring-1 ring-[#7c6cd4]/30'
                    : 'bg-[#f0f0f4]'
                }`}
        >
            <div className="flex items-center gap-2 px-1.5 pb-3">
                <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: columnDotColors[status] ?? '#bcbcc6' }}
                />
                <span className="text-[13px] font-semibold text-[#46464f]">{label}</span>
                <span className="text-xs text-[#a0a0aa] font-semibold bg-[#e4e4ea] rounded-full px-2 py-px">
                    {count}
                </span>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">{children}</div>
        </div>
    );
};

export default DroppableColumn;
