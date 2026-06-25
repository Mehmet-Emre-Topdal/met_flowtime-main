import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { confirmDialog } from 'primereact/confirmdialog';
import {
    useGetTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useUpdateTaskStatusMutation,
    useArchiveTaskMutation,
} from '../api/tasksApi';
import { useAppSelector, useAppDispatch } from '@/hooks/storeHooks';
import { setSelectedTaskId } from '../slices/taskSlice';
import { TaskDto, TaskStatus } from '@/types/task';

export interface NewTask {
    title: string;
    description: string;
    status: TaskStatus;
    isDaily: boolean;
    isNumeric: boolean;
    targetCount: number | null;
}

export interface EditingTask {
    id: string;
    title: string;
    description: string;
    isDaily: boolean;
    isNumeric: boolean;
    targetCount: number | null;
    remainingCount: number | null;
    collectionId: string | null;
}

export function useTaskCRUD() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { selectedTaskId } = useAppSelector((state) => state.task);
    const selectedCollectionId = useAppSelector((state) => state.collection.selectedCollectionId);

    const { data: tasks = [], isLoading } = useGetTasksQuery(user?.uid || '', { skip: !user?.uid });
    const [createTask] = useCreateTaskMutation();
    const [updateTask] = useUpdateTaskMutation();
    const [updateTaskStatus] = useUpdateTaskStatusMutation();
    const [archiveTask] = useArchiveTaskMutation();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newTask, setNewTask] = useState<NewTask>({ title: '', description: '', status: 'todo', isDaily: false, isNumeric: false, targetCount: null });
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingTask, setEditingTask] = useState<EditingTask | null>(null);

    const handleCreateTask = async () => {
        if (!user?.uid || !newTask.title) return;
        try {
            const targetCount = newTask.isNumeric ? (newTask.targetCount ?? 0) : null;
            await createTask({
                userId: user.uid,
                task: { ...newTask, targetCount, collectionId: selectedCollectionId },
                order: tasks.length,
            }).unwrap();
            setShowCreateDialog(false);
            setNewTask({ title: '', description: '', status: 'todo', isDaily: false, isNumeric: false, targetCount: null });
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditTask = (task: TaskDto) => {
        setEditingTask({
            id: task.id,
            title: task.title,
            description: task.description,
            isDaily: task.isDaily,
            isNumeric: task.isNumeric,
            targetCount: task.targetCount,
            remainingCount: task.remainingCount,
            collectionId: task.collectionId,
        });
        setShowEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!editingTask || !editingTask.title.trim()) return;
        try {
            const isNumeric = editingTask.isNumeric;
            const targetCount = isNumeric ? (editingTask.targetCount ?? 0) : null;
            const remainingCount = isNumeric ? (editingTask.remainingCount ?? targetCount) : null;
            await updateTask({
                taskId: editingTask.id,
                updates: {
                    title: editingTask.title,
                    description: editingTask.description,
                    isDaily: editingTask.isDaily,
                    isNumeric,
                    targetCount,
                    remainingCount,
                    collectionId: editingTask.collectionId,
                },
            }).unwrap();
            setShowEditDialog(false);
            setEditingTask(null);
        } catch (e) {
            console.error(e);
        }
    };

    const handleArchiveTask = (task: TaskDto) => {
        confirmDialog({
            message: `"${task.title}" ${t("tasks.archiveConfirm")}`,
            header: t("tasks.archiveHeader"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'bg-red-500 text-white border-red-500 px-4 py-2 rounded-lg ml-2',
            rejectClassName: 'border border-[#ededf2] text-[#9494a0] px-4 py-2 rounded-lg',
            acceptLabel: t("common.delete"),
            rejectLabel: t("common.cancel"),
            accept: async () => {
                try {
                    await archiveTask({ taskId: task.id }).unwrap();
                    if (selectedTaskId === task.id) {
                        dispatch(setSelectedTaskId(null));
                    }
                } catch (e) {
                    console.error(e);
                }
            },
        });
    };

    return {
        user,
        tasks,
        isLoading,
        selectedTaskId,
        dispatch,
        updateTask,
        updateTaskStatus,
        showCreateDialog, setShowCreateDialog,
        newTask, setNewTask,
        showEditDialog, setShowEditDialog,
        editingTask, setEditingTask,
        handleCreateTask,
        handleEditTask,
        handleSaveEdit,
        handleArchiveTask,
    };
}
