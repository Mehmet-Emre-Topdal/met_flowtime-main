import React from 'react';
import { Dialog } from 'primereact/dialog';
import { dialogPt } from '@/utils/dialogStyles';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import { useCollections } from '@/features/collections/hooks/useCollections';

interface EditingTask {
    id: string;
    title: string;
    description: string;
    isDaily: boolean;
    isNumeric: boolean;
    targetCount: number | null;
    remainingCount: number | null;
    collectionId: string | null;
}

interface CollectionOption {
    label: string;
    value: string;
    color: string;
}

interface EditTaskDialogProps {
    visible: boolean;
    onHide: () => void;
    editingTask: EditingTask | null;
    setEditingTask: React.Dispatch<React.SetStateAction<EditingTask | null>>;
    onSaveEdit: () => void;
}

const EditTaskDialog = ({ visible, onHide, editingTask, setEditingTask, onSaveEdit }: EditTaskDialogProps) => {
    const { t } = useTranslation();
    const { collections } = useCollections();

    const collectionOptions: CollectionOption[] = collections.map((collection) => ({
        label: collection.name,
        value: collection.id,
        color: collection.color,
    }));

    const collectionItemTemplate = (option: CollectionOption) => (
        <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: option.color }} />
            <span>{option.label}</span>
        </div>
    );

    return (
        <Dialog
            header={t("tasks.editTask")}
            visible={visible}
            onHide={onHide}
            className="w-full max-w-lg bg-[#ffffff] border border-[#ededf2]"
            pt={dialogPt}
        >
            {editingTask && (
                <div className="flex flex-col gap-5 mt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-[#6b6b75] font-medium">{t("tasks.titleLabel")}</label>
                        <InputText
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
                            className="bg-[#f4f4f7] border-[#ededf2] text-[#1d1d22] focus:border-[#3f9d77]"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-[#6b6b75] font-medium">{t("tasks.descriptionLabel")}</label>
                        <InputTextarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                            rows={3}
                            className="bg-[#f4f4f7] border-[#ededf2] text-[#1d1d22] focus:border-[#3f9d77]"
                        />
                    </div>
                    {collectionOptions.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-[#6b6b75] font-medium">{t("tasks.collectionLabel")}</label>
                            <Dropdown
                                value={editingTask.collectionId}
                                options={collectionOptions}
                                onChange={(e) => setEditingTask({ ...editingTask, collectionId: e.value })}
                                itemTemplate={collectionItemTemplate}
                                valueTemplate={(option: CollectionOption | null) =>
                                    option ? collectionItemTemplate(option) : <span className="text-[#9494a0]">{t("tasks.collectionLabel")}</span>
                                }
                                className="bg-[#f4f4f7] border-[#ededf2]"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[#ededf2] bg-[#f4f4f7]">
                        <Checkbox
                            inputId="kanban-edit-daily-toggle"
                            checked={editingTask.isDaily}
                            onChange={(e) => setEditingTask({ ...editingTask, isDaily: e.checked ?? false })}
                            className="daily-checkbox"
                        />
                        <label htmlFor="kanban-edit-daily-toggle" className="text-xs text-[#9494a0] font-medium cursor-pointer select-none">
                            {t("tasks.dailyToggle")}
                        </label>
                        <i
                            className="pi pi-question-circle text-[#e2e2ea] hover:text-[#6b6b75] text-xs cursor-help transition-colors ml-auto"
                            id="kanban-edit-daily-tooltip-icon"
                        />
                        <Tooltip
                            target="#kanban-edit-daily-tooltip-icon"
                            position="top"
                            pt={{ text: { className: 'bg-[#ffffff] text-[#1d1d22] text-[11px] border border-[#ededf2] p-3 rounded-lg' } }}
                        >
                            {t("tasks.dailyTooltip")}
                        </Tooltip>
                    </div>
                    <div className="flex flex-col gap-3 p-3 rounded-lg border border-[#ededf2] bg-[#f4f4f7]">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                inputId="kanban-edit-numeric-toggle"
                                checked={editingTask.isNumeric}
                                onChange={(e) => setEditingTask({ ...editingTask, isNumeric: e.checked ?? false })}
                                className="daily-checkbox"
                            />
                            <label htmlFor="kanban-edit-numeric-toggle" className="text-xs text-[#9494a0] font-medium cursor-pointer select-none">
                                {t("tasks.numericToggle")}
                            </label>
                        </div>
                        {editingTask.isNumeric && (
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-[#6b6b75]">{t("tasks.targetCount")}</label>
                                    <InputNumber
                                        value={editingTask.targetCount}
                                        onValueChange={(e) => setEditingTask({ ...editingTask, targetCount: e.value ?? null })}
                                        min={0}
                                        inputClassName="w-20 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-[#6b6b75]">{t("tasks.remaining")}</label>
                                    <InputNumber
                                        value={editingTask.remainingCount}
                                        onValueChange={(e) => setEditingTask({ ...editingTask, remainingCount: e.value ?? null })}
                                        min={0}
                                        inputClassName="w-20 bg-[#ffffff] border-[#ededf2] text-[#1d1d22] text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <Button
                        label={t("tasks.saveChanges")}
                        icon="pi pi-check"
                        onClick={onSaveEdit}
                        className="bg-[#7c6cd4] border-none text-white py-2.5 rounded-lg hover:bg-[#6b59c9] font-medium"
                    />
                </div>
            )}
        </Dialog>
    );
};

export default EditTaskDialog;
