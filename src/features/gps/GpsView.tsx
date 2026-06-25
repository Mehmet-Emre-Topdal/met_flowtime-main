import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useGpsCRUD } from './hooks/useGpsCRUD';
import { useGetTasksQuery } from '@/features/kanban/api/tasksApi';
import { useAppSelector } from '@/hooks/storeHooks';
import { GpsCreateInput, GpsUpdateInput, GpsMajorMoveInput } from '@/types/gps';
import GpsCard from './components/GpsCard';
import GpsForm from './components/GpsForm';
import GpsDetail from './components/GpsDetail';
import FlowtimeTimer from '@/features/timer/FlowtimeTimer';

type ViewMode = 'browse' | 'create' | 'edit';

const GpsView = () => {
    const { t } = useTranslation();
    const { user } = useAppSelector((state) => state.auth);
    const {
        gpsList,
        isLoading,
        isCreating,
        isUpdating,
        isAddingMove,
        createGps,
        updateGps,
        deleteGps,
        addMajorMove,
        removeMajorMove,
    } = useGpsCRUD();
    const { data: tasks = [] } = useGetTasksQuery(user?.uid || '', { skip: !user?.uid });

    const [mode, setMode] = useState<ViewMode>('browse');
    const [selectedGpsId, setSelectedGpsId] = useState<string | null>(null);

    useEffect(() => {
        if (gpsList.length === 0) return;
        const isValid = selectedGpsId && gpsList.some(gps => gps.id === selectedGpsId);
        if (!isValid) setSelectedGpsId(gpsList[0].id);
    }, [gpsList, selectedGpsId]);

    const selectedGps = gpsList.find(gps => gps.id === selectedGpsId) ?? null;

    const handleCreate = async (input: GpsCreateInput) => {
        try {
            const result = await createGps(input).unwrap();
            setSelectedGpsId(result.id);
            setMode('browse');
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = async (updates: GpsUpdateInput) => {
        if (!selectedGpsId) return;
        try {
            await updateGps({ gpsId: selectedGpsId, updates }).unwrap();
            setMode('browse');
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddMove = async (move: GpsMajorMoveInput) => {
        if (!selectedGpsId) return;
        try {
            await addMajorMove({ gpsId: selectedGpsId, move }).unwrap();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveMove = async (moveId: string) => {
        if (!selectedGpsId) return;
        try {
            await removeMajorMove({ gpsId: selectedGpsId, moveId }).unwrap();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = () => {
        if (!selectedGps) return;
        confirmDialog({
            message: `"${selectedGps.title}" ${t("gps.deleteConfirm")}`,
            header: t("gps.deleteHeader"),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'bg-red-500 text-white border-red-500 px-4 py-2 rounded-lg ml-2',
            rejectClassName: 'border border-[#e2e2ea] text-[#6b6b75] px-4 py-2 rounded-lg',
            acceptLabel: t("common.delete"),
            rejectLabel: t("common.cancel"),
            accept: async () => {
                try {
                    await deleteGps({ gpsId: selectedGps.id }).unwrap();
                    setSelectedGpsId(null);
                } catch (e) {
                    console.error(e);
                }
            },
        });
    };

    if (isLoading) return null;

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
            <ConfirmDialog />

            <AnimatePresence mode="wait">
                {mode === 'browse' && (
                    <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                        <header className="flex items-end justify-between gap-4 flex-wrap">
                            <div className="flex flex-col gap-1.5">
                                <h1 className="text-[25px] font-bold tracking-tight text-[#1d1d22]">{t("gps.title")}</h1>
                                <p className="text-sm text-[#6b6b75] max-w-[58ch]">
                                    {t("gps.subtitlePrefix")} <b className="text-[#2f9183]">Goal</b> + <b className="text-[#3f74c4]">Plan</b> + <b className="text-[#c87f2e]">System</b>{t("gps.subtitleSuffix")}
                                </p>
                            </div>
                            <Button
                                label={t("gps.newGps")}
                                icon="pi pi-plus"
                                onClick={() => setMode('create')}
                                className="bg-[#7c6cd4] border-none text-white px-4 py-2.5 rounded-lg hover:bg-[#6b59c9] text-xs font-medium"
                            />
                        </header>

                        {gpsList.length === 0 ? (
                            <div className="text-center py-20 bg-[#ffffff] rounded-2xl border border-dashed border-[#e2e2ea]">
                                <i className="pi pi-compass text-3xl text-[#d9d2f4] mb-3 block" />
                                <p className="text-sm text-[#9494a0]">{t("gps.empty")}</p>
                            </div>
                        ) : (
                            <div className="gps-split">
                                <div className="gps-sprint-list">
                                    <div className="gps-focus-panel">
                                        <FlowtimeTimer variant="panel" compact />
                                    </div>
                                    <span className="gps-sprint-list__label">{t("gps.sprints")}</span>
                                    {gpsList.map((gps) => (
                                        <GpsCard
                                            key={gps.id}
                                            gps={gps}
                                            tasks={tasks}
                                            isActive={gps.id === selectedGpsId}
                                            onClick={() => setSelectedGpsId(gps.id)}
                                        />
                                    ))}
                                </div>
                                <div className="gps-detail-panel">
                                    {selectedGps && (
                                        <GpsDetail
                                            gps={selectedGps}
                                            tasks={tasks}
                                            onEdit={() => setMode('edit')}
                                            onDelete={handleDelete}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {mode === 'create' && (
                    <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <GpsForm
                            mode="create"
                            submitting={isCreating}
                            onSubmitCreate={handleCreate}
                            onCancel={() => setMode('browse')}
                        />
                    </motion.div>
                )}

                {mode === 'edit' && selectedGps && (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <GpsForm
                            mode="edit"
                            initial={selectedGps}
                            submitting={isUpdating}
                            addingMove={isAddingMove}
                            onSubmitEdit={handleEdit}
                            onAddMove={handleAddMove}
                            onRemoveMove={handleRemoveMove}
                            onCancel={() => setMode('browse')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GpsView;
