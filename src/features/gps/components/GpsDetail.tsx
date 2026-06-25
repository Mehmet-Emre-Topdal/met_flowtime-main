import React from 'react';
import { useTranslation } from 'react-i18next';
import { GpsDto } from '@/types/gps';
import { TaskDto } from '@/types/task';
import { Button } from 'primereact/button';
import NumericCounter from '@/features/kanban/components/NumericCounter';

interface GpsDetailProps {
    gps: GpsDto;
    tasks: TaskDto[];
    onEdit: () => void;
    onDelete: () => void;
    focusedTaskId?: string | null;
    onFocusMove?: (taskId: string) => void;
}

const statusLabelKey: Record<string, string> = {
    todo: 'tasks.toDoShort',
    inprogress: 'tasks.inProgressShort',
    done: 'tasks.doneShort',
};

const GpsDetail = ({ gps, tasks, onEdit, onDelete, focusedTaskId, onFocusMove }: GpsDetailProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 w-full pb-10">
            <div className="bg-[#ffffff] border border-[#ededf2] rounded-2xl px-6 py-5 shadow-[0_1px_3px_rgba(20,20,40,0.05)] flex items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-[#1d1d22] min-w-0 truncate">{gps.title}</h1>
                <div className="flex items-center gap-2 shrink-0">
                    <Button label={t("common.edit")} icon="pi pi-pencil" onClick={onEdit} className="bg-[#f4f4f7] border border-[#e2e2ea] text-[#1d1d22] px-3 py-2 rounded-lg text-xs hover:bg-[#ededf2]" />
                    <Button icon="pi pi-trash" onClick={onDelete} className="bg-[#f4f4f7] border border-[#e2e2ea] text-[#9494a0] hover:text-red-500 w-9 h-9 rounded-lg" />
                </div>
            </div>

            <div className="border border-[#d4ebe5] bg-[#f5fbf9] rounded-2xl px-6 py-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-[26px] h-[26px] rounded-lg bg-[#2f9183] text-white flex items-center justify-center text-sm font-extrabold shrink-0">G</span>
                    <div>
                        <div className="text-sm font-bold text-[#23766b]">{t("gps.goalLayer")}</div>
                        <div className="text-[11.5px] text-[#5f9a90]">{t("gps.goalLayerHint")}</div>
                    </div>
                </div>

                <div className="text-[11px] font-bold tracking-wider text-[#5f9a90] mb-2.5">{t("gps.goals").toUpperCase()}</div>
                <div className="flex flex-col gap-2">
                    {gps.goals.length === 0 && <p className="text-xs text-[#5f9a90]/70">{t("common.empty")}</p>}
                    {gps.goals.map((goal) => (
                        <div key={goal.id} className="flex items-center gap-2.5 text-sm text-[#2b2b32] bg-[#ffffff] border border-[#e4f0eb] rounded-lg px-3 py-2.5">
                            <i className="pi pi-check text-[#2f9183] text-[11px]" />
                            <span>{goal.text}</span>
                        </div>
                    ))}
                </div>

                {gps.antiGoals.length > 0 && (
                    <>
                        <div className="text-[11px] font-bold tracking-wider text-[#b08a8a] mt-4 mb-2.5">{t("gps.antiGoals").toUpperCase()}</div>
                        <div className="flex flex-col gap-1.5">
                            {gps.antiGoals.map((anti, index) => (
                                <div key={index} className="flex items-center gap-2.5 text-[13.5px] text-[#7a6363]">
                                    <i className="pi pi-times text-[#c87a7a] text-[11px]" />
                                    <span>{anti}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="border border-[#d8e4f7] bg-[#f6f9fe] rounded-2xl px-6 py-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-[26px] h-[26px] rounded-lg bg-[#3f74c4] text-white flex items-center justify-center text-sm font-extrabold shrink-0">P</span>
                    <div>
                        <div className="text-sm font-bold text-[#345fa1]">{t("gps.planLayer")}</div>
                        <div className="text-[11.5px] text-[#6789c0]">{t("gps.planLayerHint")}</div>
                    </div>
                </div>

                <div className="text-[11px] font-bold tracking-wider text-[#6789c0] mb-2.5">{t("gps.majorMoves").toUpperCase()}</div>
                <div className="flex flex-col gap-2.5">
                    {gps.majorMoves.map((move, index) => {
                        const task = tasks.find(item => item.id === move.taskId);
                        const isDone = task?.status === 'done';
                        const isFocused = Boolean(task && task.id === focusedTaskId);
                        const canFocus = Boolean(task && onFocusMove);
                        return (
                            <div
                                key={move.id}
                                onClick={() => { if (task && onFocusMove) onFocusMove(task.id); }}
                                className={`border rounded-xl px-3.5 py-3 bg-[#ffffff] transition-all ${canFocus ? 'cursor-pointer' : ''} ${isFocused ? 'border-[#7c6cd4] ring-1 ring-[#7c6cd4]/30' : `border-[#e4ecf8] ${canFocus ? 'hover:border-[#cdbff2]' : ''}`}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className={`w-[22px] h-[22px] rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isFocused ? 'bg-[#7c6cd4] text-white' : 'bg-[#ecf2fc] text-[#3f74c4]'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                                        {index + 1}
                                    </span>
                                    <span className={`text-sm truncate ${isDone ? 'text-[#9aa0a6] line-through' : 'text-[#1d1d22]'}`}>{move.title}</span>
                                    {isFocused && (
                                        <span className="ml-auto flex items-center gap-1 text-[10.5px] font-semibold text-[#7c6cd4] bg-[#7c6cd4]/[0.10] rounded-md px-2 py-0.5 shrink-0">
                                            <i className="pi pi-bolt text-[9px]" />
                                            {t("tasks.focusing")}
                                        </span>
                                    )}
                                    {task && (
                                        <span className={`text-[10.5px] text-[#9494a0] font-semibold bg-[#f0f0f4] rounded-md px-2 py-0.5 shrink-0 ${isFocused ? '' : 'ml-auto'}`}>
                                            {t(statusLabelKey[task.status] ?? 'tasks.toDoShort')}
                                        </span>
                                    )}
                                </div>
                                {task?.isNumeric && (
                                    <div className="mt-3 pl-8">
                                        <NumericCounter task={task} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {gps.crystalBall.length > 0 && (
                    <>
                        <div className="text-[11px] font-bold tracking-wider text-[#6789c0] mt-4 mb-2.5">{t("gps.crystalBall").toUpperCase()}</div>
                        <div className="flex flex-col gap-2">
                            {gps.crystalBall.map((scenario) => (
                                <div key={scenario.id} className="flex gap-3 items-stretch bg-[#ffffff] border border-[#e4ecf8] rounded-xl px-3.5 py-3">
                                    <div className="flex-1">
                                        <div className="text-[10.5px] font-bold text-[#c87a7a] tracking-wide mb-1">{t("gps.scenarioLabel")}</div>
                                        <div className="text-[13px] text-[#46464f] leading-snug">{scenario.scenario}</div>
                                    </div>
                                    {scenario.prevention && (
                                        <>
                                            <div className="w-px bg-[#eef0f3]" />
                                            <div className="flex-1">
                                                <div className="text-[10.5px] font-bold text-[#3f9d77] tracking-wide mb-1">{t("gps.preventionLabel")}</div>
                                                <div className="text-[13px] text-[#46464f] leading-snug">{scenario.prevention}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="border border-[#f0e2c8] bg-[#fdf9f0] rounded-2xl px-6 py-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-[26px] h-[26px] rounded-lg bg-[#c87f2e] text-white flex items-center justify-center text-sm font-extrabold shrink-0">S</span>
                    <div>
                        <div className="text-sm font-bold text-[#a3681f]">{t("gps.systemLayer")}</div>
                        <div className="text-[11.5px] text-[#bd8e4e]">{t("gps.systemLayerHint")}</div>
                    </div>
                </div>

                {gps.system.tracking && (
                    <>
                        <div className="text-[11px] font-bold tracking-wider text-[#bd8e4e] mb-2">{t("gps.tracking").toUpperCase()}</div>
                        <div className="text-[13.5px] text-[#46464f] leading-relaxed bg-[#ffffff] border border-[#f3e8d3] rounded-lg px-3.5 py-3 whitespace-pre-wrap">{gps.system.tracking}</div>
                    </>
                )}

                {gps.system.reminders.length > 0 && (
                    <>
                        <div className="text-[11px] font-bold tracking-wider text-[#bd8e4e] mt-4 mb-2.5">{t("gps.reminders").toUpperCase()}</div>
                        <div className="flex flex-col gap-1.5">
                            {gps.system.reminders.map((reminder) => (
                                <div key={reminder.id} className="flex items-center gap-2.5 bg-[#ffffff] border border-[#f3e8d3] rounded-lg px-3 py-2.5">
                                    <span className="text-[12.5px] font-semibold text-[#c87f2e] bg-[#fbf3e6] rounded-md px-2 py-0.5 shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{reminder.time}</span>
                                    <span className="text-[12.5px] font-semibold text-[#7a6a4d] shrink-0">{t(`gps.days.${reminder.day}`)}</span>
                                    <span className="text-[13px] text-[#46464f] truncate">{reminder.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {gps.system.accountability && (
                    <>
                        <div className="text-[11px] font-bold tracking-wider text-[#bd8e4e] mt-4 mb-2">{t("gps.accountability").toUpperCase()}</div>
                        <div className="text-[13.5px] text-[#46464f] leading-relaxed bg-[#ffffff] border border-[#f3e8d3] rounded-lg px-3.5 py-3 whitespace-pre-wrap">{gps.system.accountability}</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GpsDetail;
