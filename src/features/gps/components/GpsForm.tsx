import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import {
    GpsDto,
    GpsGoal,
    GpsFailureScenario,
    GpsReminder,
    GpsSystem,
    GpsMajorMove,
    GpsMajorMoveInput,
    GpsCreateInput,
    GpsUpdateInput,
} from '@/types/gps';
import { TaskDto } from '@/types/task';

interface MajorMoveUpdate {
    title?: string;
    isNumeric?: boolean;
    targetCount?: number | null;
    remainingCount?: number | null;
}

interface GpsFormProps {
    mode: 'create' | 'edit';
    initial?: GpsDto | null;
    tasks?: TaskDto[];
    submitting: boolean;
    addingMove?: boolean;
    onSubmitCreate?: (input: GpsCreateInput) => void;
    onSubmitEdit?: (updates: GpsUpdateInput) => void;
    onAddMove?: (move: GpsMajorMoveInput) => void;
    onUpdateMove?: (moveId: string, updates: MajorMoveUpdate) => void;
    onRemoveMove?: (moveId: string) => void;
    onCancel: () => void;
}

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const emptyMove: GpsMajorMoveInput = { title: '', isNumeric: false, targetCount: null };

const inputClass = 'bg-[#ffffff] border-[#e2e2ea] text-[#1d1d22] focus:border-[#7c6cd4] w-full';
const goalSectionClass = 'flex flex-col gap-4 p-5 rounded-2xl border border-[#d4ebe5] bg-[#f5fbf9]';
const planSectionClass = 'flex flex-col gap-4 p-5 rounded-2xl border border-[#d8e4f7] bg-[#f6f9fe]';
const systemSectionClass = 'flex flex-col gap-4 p-5 rounded-2xl border border-[#f0e2c8] bg-[#fdf9f0]';
const labelClass = 'text-xs text-[#9494a0] font-medium';

const GpsForm = ({
    mode,
    initial,
    tasks = [],
    submitting,
    addingMove,
    onSubmitCreate,
    onSubmitEdit,
    onAddMove,
    onUpdateMove,
    onRemoveMove,
    onCancel,
}: GpsFormProps) => {
    const { t } = useTranslation();

    const [title, setTitle] = useState(initial?.title ?? '');
    const [goals, setGoals] = useState<GpsGoal[]>(initial?.goals?.length ? initial.goals : [{ id: newId(), text: '' }]);
    const [antiGoals, setAntiGoals] = useState<string[]>(initial?.antiGoals?.length ? initial.antiGoals : ['']);
    const [createMoves, setCreateMoves] = useState<GpsMajorMoveInput[]>([{ ...emptyMove }, { ...emptyMove }, { ...emptyMove }]);
    const [crystalBall, setCrystalBall] = useState<GpsFailureScenario[]>(
        initial?.crystalBall?.length ? initial.crystalBall : [{ id: newId(), scenario: '', prevention: '' }]
    );
    const [system, setSystem] = useState<GpsSystem>(
        initial?.system ?? { tracking: '', reminders: [], accountability: '' }
    );
    const [draftMove, setDraftMove] = useState<GpsMajorMoveInput>({ ...emptyMove });

    const dayOptions = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((key) => ({
        label: t(`gps.days.${key}`),
        value: key,
    }));

    const updateGoal = (id: string, text: string) => setGoals(goals.map(g => g.id === id ? { ...g, text } : g));
    const addGoal = () => { if (goals.length < 3) setGoals([...goals, { id: newId(), text: '' }]); };
    const removeGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

    const updateAntiGoal = (index: number, value: string) => setAntiGoals(antiGoals.map((a, i) => i === index ? value : a));
    const addAntiGoal = () => setAntiGoals([...antiGoals, '']);
    const removeAntiGoal = (index: number) => setAntiGoals(antiGoals.filter((_, i) => i !== index));

    const updateCreateMove = (index: number, patch: Partial<GpsMajorMoveInput>) =>
        setCreateMoves(createMoves.map((m, i) => i === index ? { ...m, ...patch } : m));
    const addCreateMove = () => { if (createMoves.length < 5) setCreateMoves([...createMoves, { ...emptyMove }]); };
    const removeCreateMove = (index: number) => setCreateMoves(createMoves.filter((_, i) => i !== index));

    const updateScenario = (id: string, patch: Partial<GpsFailureScenario>) =>
        setCrystalBall(crystalBall.map(s => s.id === id ? { ...s, ...patch } : s));
    const addScenario = () => setCrystalBall([...crystalBall, { id: newId(), scenario: '', prevention: '' }]);
    const removeScenario = (id: string) => setCrystalBall(crystalBall.filter(s => s.id !== id));

    const updateReminder = (id: string, patch: Partial<GpsReminder>) =>
        setSystem({ ...system, reminders: system.reminders.map(r => r.id === id ? { ...r, ...patch } : r) });
    const addReminder = () => setSystem({ ...system, reminders: [...system.reminders, { id: newId(), day: 'mon', time: '09:00', label: '' }] });
    const removeReminder = (id: string) => setSystem({ ...system, reminders: system.reminders.filter(r => r.id !== id) });

    const cleanedGoals = goals.filter(g => g.text.trim());
    const cleanedAntiGoals = antiGoals.filter(a => a.trim());
    const cleanedScenarios = crystalBall.filter(s => s.scenario.trim() || s.prevention.trim());
    const cleanedSystem: GpsSystem = {
        tracking: system.tracking,
        accountability: system.accountability,
        reminders: system.reminders.filter(r => r.label.trim()),
    };

    const handleSubmit = () => {
        if (!title.trim()) return;
        if (mode === 'create') {
            const moves = createMoves.filter(m => m.title.trim()).map(m => ({
                title: m.title.trim(),
                isNumeric: m.isNumeric,
                targetCount: m.isNumeric ? m.targetCount : null,
            }));
            if (moves.length < 1) return;
            onSubmitCreate?.({
                title: title.trim(),
                goals: cleanedGoals,
                antiGoals: cleanedAntiGoals,
                majorMoves: moves,
                crystalBall: cleanedScenarios,
                system: cleanedSystem,
            });
        } else {
            onSubmitEdit?.({
                title: title.trim(),
                goals: cleanedGoals,
                antiGoals: cleanedAntiGoals,
                crystalBall: cleanedScenarios,
                system: cleanedSystem,
            });
        }
    };

    const existingMoves = (initial?.majorMoves ?? []) as GpsMajorMove[];

    return (
        <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <button onClick={onCancel} className="flex items-center gap-2 text-xs text-[#9494a0] hover:text-[#1d1d22] transition-colors">
                    <i className="pi pi-arrow-left text-[10px]" />
                    <span>{t("common.cancel")}</span>
                </button>
                <h2 className="text-base font-semibold text-[#1d1d22]">
                    {mode === 'create' ? t("gps.newGps") : t("gps.editGps")}
                </h2>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>{t("gps.sprintTitle")}</label>
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>

            <div className={goalSectionClass}>
                <div className="flex items-center gap-2">
                    <span className="w-[26px] h-[26px] rounded-[8px] bg-[#2f9183] text-white flex items-center justify-center text-sm font-extrabold shrink-0">G</span>
                    <h3 className="text-sm font-semibold text-[#1d1d22]">{t("gps.goalLayer")}</h3>
                </div>

                <div className="flex flex-col gap-2">
                    <label className={labelClass}>{t("gps.goals")} ({goals.length}/3)</label>
                    {goals.map((goal) => (
                        <div key={goal.id} className="flex items-center gap-2">
                            <InputText value={goal.text} onChange={(e) => updateGoal(goal.id, e.target.value)} placeholder={t("gps.goalPlaceholder")} className={inputClass} />
                            {goals.length > 1 && (
                                <Button icon="pi pi-times" onClick={() => removeGoal(goal.id)} className="bg-[#ededf2] border-none text-[#9494a0] hover:text-red-400 w-9 h-9 shrink-0" />
                            )}
                        </div>
                    ))}
                    {goals.length < 3 && (
                        <button onClick={addGoal} className="self-start text-xs text-[#7c6cd4] hover:text-[#6b59c9] flex items-center gap-1">
                            <i className="pi pi-plus text-[10px]" /> {t("gps.addGoal")}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className={labelClass}>{t("gps.antiGoals")}</label>
                    {antiGoals.map((anti, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <InputText value={anti} onChange={(e) => updateAntiGoal(index, e.target.value)} placeholder={t("gps.antiGoalPlaceholder")} className={inputClass} />
                            {antiGoals.length > 1 && (
                                <Button icon="pi pi-times" onClick={() => removeAntiGoal(index)} className="bg-[#ededf2] border-none text-[#9494a0] hover:text-red-400 w-9 h-9 shrink-0" />
                            )}
                        </div>
                    ))}
                    <button onClick={addAntiGoal} className="self-start text-xs text-[#7c6cd4] hover:text-[#6b59c9] flex items-center gap-1">
                        <i className="pi pi-plus text-[10px]" /> {t("gps.addAntiGoal")}
                    </button>
                </div>
            </div>

            <div className={planSectionClass}>
                <div className="flex items-center gap-2">
                    <span className="w-[26px] h-[26px] rounded-[8px] bg-[#3f74c4] text-white flex items-center justify-center text-sm font-extrabold shrink-0">P</span>
                    <h3 className="text-sm font-semibold text-[#1d1d22]">{t("gps.planLayer")}</h3>
                </div>

                <div className="flex flex-col gap-3">
                    <label className={labelClass}>{t("gps.majorMoves")}</label>

                    {mode === 'create' ? (
                        <>
                            {createMoves.map((move, index) => (
                                <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border border-[#ededf2] bg-[#ffffff]">
                                    <div className="flex items-center gap-2">
                                        <InputText value={move.title} onChange={(e) => updateCreateMove(index, { title: e.target.value })} placeholder={t("gps.majorMovePlaceholder")} className={inputClass} />
                                        {createMoves.length > 1 && (
                                            <Button icon="pi pi-times" onClick={() => removeCreateMove(index)} className="bg-[#ededf2] border-none text-[#9494a0] hover:text-red-400 w-9 h-9 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <Checkbox inputId={`move-numeric-${index}`} checked={move.isNumeric} onChange={(e) => updateCreateMove(index, { isNumeric: e.checked ?? false })} className="daily-checkbox" />
                                            <label htmlFor={`move-numeric-${index}`} className="text-xs text-[#6b6b75] cursor-pointer select-none">{t("tasks.numericToggle")}</label>
                                        </div>
                                        {move.isNumeric && (
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-[#9494a0]">{t("tasks.targetCount")}</label>
                                                <InputNumber value={move.targetCount} onValueChange={(e) => updateCreateMove(index, { targetCount: e.value ?? null })} min={0} inputClassName="w-20 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {createMoves.length < 5 && (
                                <button onClick={addCreateMove} className="self-start text-xs text-[#7c6cd4] hover:text-[#6b59c9] flex items-center gap-1">
                                    <i className="pi pi-plus text-[10px]" /> {t("gps.addMajorMove")}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            {existingMoves.map((move) => {
                                const moveTask = tasks.find(item => item.id === move.taskId);
                                const moveIsNumeric = moveTask?.isNumeric ?? false;
                                return (
                                    <div key={move.id} className="flex flex-col gap-2 p-3 rounded-lg border border-[#ededf2] bg-[#ffffff]">
                                        <div className="flex items-center gap-2">
                                            <InputText
                                                defaultValue={move.title}
                                                placeholder={t("gps.majorMovePlaceholder")}
                                                onBlur={(e) => {
                                                    const next = e.target.value.trim();
                                                    if (next && next !== move.title) onUpdateMove?.(move.id, { title: next });
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                                className={inputClass}
                                            />
                                            <Button icon="pi pi-times" onClick={() => onRemoveMove?.(move.id)} className="bg-[#ededf2] border-none text-[#9494a0] hover:text-red-400 w-9 h-9 shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    inputId={`edit-move-numeric-${move.id}`}
                                                    checked={moveIsNumeric}
                                                    onChange={(e) => {
                                                        const checked = e.checked ?? false;
                                                        if (checked) {
                                                            const target = moveTask?.targetCount ?? 1;
                                                            onUpdateMove?.(move.id, { isNumeric: true, targetCount: target, remainingCount: moveTask?.remainingCount ?? target });
                                                        } else {
                                                            onUpdateMove?.(move.id, { isNumeric: false, targetCount: null, remainingCount: null });
                                                        }
                                                    }}
                                                    className="daily-checkbox"
                                                />
                                                <label htmlFor={`edit-move-numeric-${move.id}`} className="text-xs text-[#6b6b75] cursor-pointer select-none">{t("tasks.numericToggle")}</label>
                                            </div>
                                            {moveIsNumeric && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-[#9494a0]">{t("tasks.targetCount")}</label>
                                                        <InputNumber
                                                            value={moveTask?.targetCount ?? null}
                                                            onValueChange={(e) => onUpdateMove?.(move.id, { targetCount: e.value ?? null })}
                                                            min={0}
                                                            inputClassName="w-16 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-[#9494a0]">{t("tasks.remaining")}</label>
                                                        <InputNumber
                                                            value={moveTask?.remainingCount ?? null}
                                                            onValueChange={(e) => onUpdateMove?.(move.id, { remainingCount: e.value ?? null })}
                                                            min={0}
                                                            inputClassName="w-16 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {existingMoves.length < 5 && (
                                <div className="flex flex-col gap-2 p-3 rounded-lg border border-dashed border-[#ededf2] bg-[#ffffff]">
                                    <div className="flex items-center gap-2">
                                        <InputText value={draftMove.title} onChange={(e) => setDraftMove({ ...draftMove, title: e.target.value })} placeholder={t("gps.majorMovePlaceholder")} className={inputClass} />
                                        <Button
                                            icon="pi pi-plus"
                                            loading={addingMove}
                                            disabled={!draftMove.title.trim()}
                                            onClick={() => {
                                                if (!draftMove.title.trim()) return;
                                                onAddMove?.({
                                                    title: draftMove.title.trim(),
                                                    isNumeric: draftMove.isNumeric,
                                                    targetCount: draftMove.isNumeric ? draftMove.targetCount : null,
                                                });
                                                setDraftMove({ ...emptyMove });
                                            }}
                                            className="bg-[#7c6cd4] border-none text-white w-9 h-9 shrink-0"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <Checkbox inputId="draft-move-numeric" checked={draftMove.isNumeric} onChange={(e) => setDraftMove({ ...draftMove, isNumeric: e.checked ?? false })} className="daily-checkbox" />
                                            <label htmlFor="draft-move-numeric" className="text-xs text-[#6b6b75] cursor-pointer select-none">{t("tasks.numericToggle")}</label>
                                        </div>
                                        {draftMove.isNumeric && (
                                            <InputNumber value={draftMove.targetCount} onValueChange={(e) => setDraftMove({ ...draftMove, targetCount: e.value ?? null })} min={0} inputClassName="w-20 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className={labelClass}>{t("gps.crystalBall")}</label>
                    <p className="text-[11px] text-[#9494a0]/70 -mt-1">{t("gps.crystalBallHint")}</p>
                    {crystalBall.map((scenario) => (
                        <div key={scenario.id} className="flex flex-col gap-2 p-3 rounded-lg border border-[#ededf2] bg-[#ffffff]">
                            <div className="flex items-center gap-2">
                                <InputText value={scenario.scenario} onChange={(e) => updateScenario(scenario.id, { scenario: e.target.value })} placeholder={t("gps.failurePlaceholder")} className={inputClass} />
                                {crystalBall.length > 1 && (
                                    <Button icon="pi pi-times" onClick={() => removeScenario(scenario.id)} className="bg-[#ededf2] border-none text-[#9494a0] hover:text-red-400 w-9 h-9 shrink-0" />
                                )}
                            </div>
                            <InputText value={scenario.prevention} onChange={(e) => updateScenario(scenario.id, { prevention: e.target.value })} placeholder={t("gps.preventionPlaceholder")} className={inputClass} />
                        </div>
                    ))}
                    <button onClick={addScenario} className="self-start text-xs text-[#7c6cd4] hover:text-[#6b59c9] flex items-center gap-1">
                        <i className="pi pi-plus text-[10px]" /> {t("gps.addScenario")}
                    </button>
                </div>
            </div>

            <div className={systemSectionClass}>
                <div className="flex items-center gap-2">
                    <span className="w-[26px] h-[26px] rounded-[8px] bg-[#c87f2e] text-white flex items-center justify-center text-sm font-extrabold shrink-0">S</span>
                    <h3 className="text-sm font-semibold text-[#1d1d22]">{t("gps.systemLayer")}</h3>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>{t("gps.tracking")}</label>
                    <InputTextarea value={system.tracking} onChange={(e) => setSystem({ ...system, tracking: e.target.value })} rows={2} placeholder={t("gps.trackingPlaceholder")} className={inputClass} />
                </div>

                <div className="flex flex-col gap-2">
                    <label className={labelClass}>{t("gps.reminders")}</label>
                    {system.reminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <Dropdown value={reminder.day} options={dayOptions} onChange={(e) => updateReminder(reminder.id, { day: e.value })} className="bg-[#ffffff] border-[#ededf2] text-[#1d1d22] w-40 shrink-0" />
                            <InputText type="time" value={reminder.time} onChange={(e) => updateReminder(reminder.id, { time: e.target.value })} className="bg-[#ffffff] border-[#ededf2] text-[#1d1d22] w-28 shrink-0" />
                            <InputText value={reminder.label} onChange={(e) => updateReminder(reminder.id, { label: e.target.value })} placeholder={t("gps.reminderPlaceholder")} className={inputClass} />
                            <Button icon="pi pi-times" onClick={() => removeReminder(reminder.id)} className="bg-[#ededf2] border-none text-[#9494a0] hover:text-red-400 w-9 h-9 shrink-0" />
                        </div>
                    ))}
                    <button onClick={addReminder} className="self-start text-xs text-[#7c6cd4] hover:text-[#6b59c9] flex items-center gap-1">
                        <i className="pi pi-plus text-[10px]" /> {t("gps.addReminder")}
                    </button>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>{t("gps.accountability")}</label>
                    <InputTextarea value={system.accountability} onChange={(e) => setSystem({ ...system, accountability: e.target.value })} rows={2} placeholder={t("gps.accountabilityPlaceholder")} className={inputClass} />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Button label={t("common.cancel")} onClick={onCancel} className="bg-transparent border border-[#ededf2] text-[#6b6b75] px-4 py-2.5 rounded-lg" />
                <Button
                    label={mode === 'create' ? t("gps.createGps") : t("gps.saveChanges")}
                    icon="pi pi-check"
                    loading={submitting}
                    disabled={!title.trim()}
                    onClick={handleSubmit}
                    className="btn-primary px-5 py-2.5"
                />
            </div>
        </div>
    );
};

export default GpsForm;
