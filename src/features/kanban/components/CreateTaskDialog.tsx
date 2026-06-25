import React from 'react';
import { Dialog } from 'primereact/dialog';
import { dialogPt } from '@/utils/dialogStyles';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { TaskStatus } from '@/types/task';
import { useTranslation } from 'react-i18next';

interface NewTask {
    title: string;
    description: string;
    status: TaskStatus;
    isDaily: boolean;
    isNumeric: boolean;
    targetCount: number | null;
}

interface CreateTaskDialogProps {
    visible: boolean;
    onHide: () => void;
    newTask: NewTask;
    setNewTask: React.Dispatch<React.SetStateAction<NewTask>>;
    onCreateTask: () => void;
}

const CreateTaskDialog = ({ visible, onHide, newTask, setNewTask, onCreateTask }: CreateTaskDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog
            header={t("tasks.newTask")}
            visible={visible}
            onHide={onHide}
            className="w-full max-w-lg bg-[#ffffff] border border-[#ededf2]"
            pt={dialogPt}
        >
            <div className="flex flex-col gap-5 mt-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#6b6b75] font-medium">{t("tasks.titleLabel")}</label>
                    <InputText
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && onCreateTask()}
                        className="bg-[#f4f4f7] border-[#ededf2] text-[#1d1d22] focus:border-[#3f9d77]"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#6b6b75] font-medium">{t("tasks.descriptionLabel")}</label>
                    <InputTextarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        rows={3}
                        className="bg-[#f4f4f7] border-[#ededf2] text-[#1d1d22] focus:border-[#3f9d77]"
                    />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#ededf2] bg-[#f4f4f7]">
                    <Checkbox
                        inputId="kanban-daily-toggle"
                        checked={newTask.isDaily}
                        onChange={(e) => setNewTask({ ...newTask, isDaily: e.checked ?? false })}
                        className="daily-checkbox"
                    />
                    <label htmlFor="kanban-daily-toggle" className="text-xs text-[#9494a0] font-medium cursor-pointer select-none">
                        {t("tasks.dailyToggle")}
                    </label>
                    <i
                        className="pi pi-question-circle text-[#e2e2ea] hover:text-[#6b6b75] text-xs cursor-help transition-colors ml-auto"
                        id="kanban-daily-tooltip-icon"
                    />
                    <Tooltip
                        target="#kanban-daily-tooltip-icon"
                        position="top"
                        pt={{ text: { className: 'bg-[#ffffff] text-[#1d1d22] text-[11px] border border-[#ededf2] p-3 rounded-lg' } }}
                    >
                        {t("tasks.dailyTooltip")}
                    </Tooltip>
                </div>
                <div className="flex flex-col gap-3 p-3 rounded-lg border border-[#ededf2] bg-[#f4f4f7]">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            inputId="kanban-numeric-toggle"
                            checked={newTask.isNumeric}
                            onChange={(e) => setNewTask({ ...newTask, isNumeric: e.checked ?? false })}
                            className="daily-checkbox"
                        />
                        <label htmlFor="kanban-numeric-toggle" className="text-xs text-[#9494a0] font-medium cursor-pointer select-none">
                            {t("tasks.numericToggle")}
                        </label>
                    </div>
                    {newTask.isNumeric && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-[#6b6b75]">{t("tasks.targetCount")}</label>
                            <InputNumber
                                value={newTask.targetCount}
                                onValueChange={(e) => setNewTask({ ...newTask, targetCount: e.value ?? null })}
                                min={0}
                                inputClassName="w-24 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs"
                            />
                        </div>
                    )}
                </div>
                <Button
                    label={t("tasks.createTask")}
                    onClick={onCreateTask}
                    className="bg-[#7c6cd4] border-none text-white py-2.5 rounded-lg hover:bg-[#6b59c9] font-medium"
                />
            </div>
        </Dialog>
    );
};

export default CreateTaskDialog;
