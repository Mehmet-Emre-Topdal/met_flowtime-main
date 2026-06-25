import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@/hooks/storeHooks';
import { setSelectedTaskId } from './slices/taskSlice';
import { TaskDto } from '@/types/task';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Checkbox } from 'primereact/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTaskCRUD } from './hooks/useTaskCRUD';
import { useCollections } from '@/features/collections/hooks/useCollections';
import CreateTaskDialog from './components/CreateTaskDialog';
import EditTaskDialog from './components/EditTaskDialog';
import NumericCounter from './components/NumericCounter';

interface TaskListViewProps {
    filterDaily: boolean;
}

const TaskListView = ({ filterDaily }: TaskListViewProps) => {
    const { t } = useTranslation();
    const {
        tasks,
        isLoading,
        selectedTaskId,
        dispatch,
        updateTaskStatus,
        showCreateDialog, setShowCreateDialog,
        newTask, setNewTask,
        showEditDialog, setShowEditDialog,
        editingTask, setEditingTask,
        handleCreateTask,
        handleEditTask,
        handleSaveEdit,
        handleArchiveTask,
    } = useTaskCRUD();

    const { selectedCollectionId, taskMatchesCollection } = useCollections();
    const [hideCompleted, setHideCompleted] = useState(false);
    const [statusDropdownTaskId, setStatusDropdownTaskId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!statusDropdownTaskId) return;
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setStatusDropdownTaskId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [statusDropdownTaskId]);

    const handleTaskClick = (taskId: string) => {
        dispatch(setSelectedTaskId(taskId === selectedTaskId ? null : taskId));
    };

    const getStatusSeverity = (status: string): "success" | "warning" | "secondary" => {
        switch (status) {
            case 'done': return 'success';
            case 'inprogress': return 'warning';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done': return t("tasks.done");
            case 'inprogress': return t("tasks.inProgress");
            default: return t("tasks.toDo");
        }
    };

    const statusOptions: { value: string; label: string; icon: string; color: string }[] = [
        { value: 'todo', label: t("tasks.toDoShort"), icon: 'pi pi-circle', color: 'text-[#6b6b75]' },
        { value: 'inprogress', label: t("tasks.inProgressShort"), icon: 'pi pi-spinner', color: 'text-[#7c6cd4]' },
        { value: 'done', label: t("tasks.doneShort"), icon: 'pi pi-check-circle', color: 'text-emerald-500' },
    ];

    const handleStatusSelect = async (taskId: string, newStatus: string) => {
        setStatusDropdownTaskId(null);
        try {
            await updateTaskStatus({ taskId, status: newStatus }).unwrap();
        } catch (err) {
            console.error(t("tasks.statusUpdateFailed"), err);
        }
    };

    if (isLoading) return null;

    const statusPriority: Record<string, number> = { inprogress: 0, todo: 1, done: 2 };
    const filteredTasks = tasks.filter((t: TaskDto) => {
        if (!taskMatchesCollection(t, selectedCollectionId)) return false;
        if (filterDaily && !t.isDaily) return false;
        if (hideCompleted && t.status === 'done') return false;
        return true;
    });
    const sortedTasks = [...filteredTasks].sort(
        (a, b) => (statusPriority[a.status] ?? 1) - (statusPriority[b.status] ?? 1)
    );

    return (
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto py-6">
            <ConfirmDialog />

            <header className="flex justify-between items-center p-4 sm:p-5 rounded-xl border border-[#ededf2] bg-[#ffffff] gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[#1d1d22] truncate">{t("tasks.tasks")}</h3>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            inputId="hide-completed"
                            checked={hideCompleted}
                            onChange={(e) => setHideCompleted(e.checked ?? false)}
                            className="w-4 h-4 border-[#e2e2ea] rounded-sm"
                        />
                        <label htmlFor="hide-completed" className="hidden sm:block text-xs text-[#9494a0] cursor-pointer hover:text-[#1d1d22] transition-colors select-none">
                            {t("tasks.hideDoneTasks")}
                        </label>
                    </div>
                    <Button
                        label={t("tasks.newTask")}
                        icon="pi pi-plus"
                        onClick={() => setShowCreateDialog(true)}
                        className="p-button-sm bg-[#7c6cd4] border-none text-white hover:bg-[#6b59c9] px-3 sm:px-4 py-2 rounded-lg text-xs font-medium"
                    />
                </div>
            </header>

            <div className="flex flex-col gap-1.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout" initial={false}>
                    {sortedTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout="position"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{
                                opacity: { duration: 0.2 },
                                layout: { duration: 0.2, ease: "easeInOut" }
                            }}
                        >
                            <div
                                onClick={() => handleTaskClick(task.id)}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-lg border transition-all duration-200 cursor-pointer group gap-3
                                    ${selectedTaskId === task.id
                                        ? 'bg-[#7c6cd4]/5 border-[#7c6cd4]/30'
                                        : 'bg-[#ffffff] border-[#ededf2] hover:border-[#e2e2ea]'}`}
                            >
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className={`text-sm font-medium transition-colors truncate
                                                ${selectedTaskId === task.id ? 'text-[#1d1d22]' : 'text-[#9494a0] group-hover:text-[#1d1d22]'}`}>
                                                {task.title}
                                            </span>
                                            {task.isDaily && (
                                                <span className="text-[9px] text-[#3f9d77] border border-[#7c6cd4]/30 bg-[#7c6cd4]/5 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider shrink-0">
                                                    {t("tasks.daily")}
                                                </span>
                                            )}
                                            {task.gpsId && (
                                                <Link
                                                    href="/gps"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-[9px] text-[#7c6cd4] border border-[#7c6cd4]/30 bg-[#7c6cd4]/5 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider shrink-0 no-underline"
                                                >
                                                    <i className="pi pi-compass text-[8px]" /> GPS
                                                </Link>
                                            )}
                                            {selectedTaskId === task.id && (
                                                <div className="flex items-center gap-1.5 bg-[#7c6cd4]/10 px-1.5 py-0.5 rounded shrink-0">
                                                    <span className="text-[9px] text-[#7c6cd4] font-medium">{t("tasks.focusing")}</span>
                                                    <i className="pi pi-bolt text-[#7c6cd4] text-[8px] animate-pulse"></i>
                                                </div>
                                            )}
                                            <div className="relative shrink-0">
                                                <Tag
                                                    value={getStatusLabel(task.status)}
                                                    severity={getStatusSeverity(task.status)}
                                                    className="text-[8px] tracking-wide px-2 py-0.5 rounded font-medium border border-current bg-transparent cursor-pointer transition-opacity opacity-100 hover:opacity-75"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setStatusDropdownTaskId(
                                                            statusDropdownTaskId === task.id ? null : task.id
                                                        );
                                                    }}
                                                />
                                                {statusDropdownTaskId === task.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute left-0 top-full mt-1 z-50 bg-[#ffffff] border border-[#ededf2] rounded-lg overflow-hidden min-w-[140px] animate-dropdown-in shadow-xl"
                                                    >
                                                        {statusOptions.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusSelect(task.id, opt.value);
                                                                }}
                                                                className={`w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 text-xs transition-colors
                                                                    ${task.status === opt.value
                                                                        ? 'bg-[#ededf2] text-[#1d1d22]'
                                                                        : 'text-[#9494a0] hover:bg-[#ededf2] hover:text-[#1d1d22]'
                                                                    }`}
                                                            >
                                                                <i className={`${opt.icon} text-[10px] ${opt.color}`} />
                                                                <span>{opt.label}</span>
                                                                {task.status === opt.value && (
                                                                    <i className="pi pi-check text-[8px] text-[#7c6cd4] ml-auto" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[10px] text-[#6b6b75]">{task.totalFocusedTime} {t("tasks.focused")}</span>
                                            {task.isNumeric && <NumericCounter task={task} />}
                                        </div>
                                        {task.description && (
                                            <p className="text-xs text-[#6b6b75]/70 mt-1 leading-relaxed line-clamp-1 sm:line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                            className="w-9 h-9 sm:w-8 sm:h-8 lg:w-7 lg:h-7 flex items-center justify-center rounded bg-[#ededf2] hover:bg-[#e2e2ea] text-[#6b6b75] hover:text-[#1d1d22] transition-colors"
                                            title={t("common.edit")}
                                        >
                                            <i className="pi pi-pencil text-sm sm:text-xs" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleArchiveTask(task); }}
                                            className="w-9 h-9 sm:w-8 sm:h-8 lg:w-7 lg:h-7 flex items-center justify-center rounded bg-[#ededf2] hover:bg-red-500/20 text-[#6b6b75] hover:text-red-400 transition-colors"
                                            title={t("common.delete")}
                                        >
                                            <i className="pi pi-trash text-sm sm:text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {sortedTasks.length === 0 && (
                <div className="text-center py-16 bg-[#ffffff] rounded-xl border border-dashed border-[#ededf2]">
                    <p className="text-sm text-[#6b6b75]">
                        {filterDaily ? t("tasks.noDailyTasks") : t("tasks.noTasks")}
                    </p>
                </div>
            )}

            <CreateTaskDialog
                visible={showCreateDialog}
                onHide={() => setShowCreateDialog(false)}
                newTask={newTask}
                setNewTask={setNewTask}
                onCreateTask={handleCreateTask}
            />

            <EditTaskDialog
                visible={showEditDialog}
                onHide={() => { setShowEditDialog(false); setEditingTask(null); }}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                onSaveEdit={handleSaveEdit}
            />
        </div>
    );
};

export default TaskListView;
