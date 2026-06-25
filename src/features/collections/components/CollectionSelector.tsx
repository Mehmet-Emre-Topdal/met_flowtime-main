import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/hooks/storeHooks';
import { useGetTasksQuery } from '@/features/kanban/api/tasksApi';
import { setSelectedCollectionId, openCreateCollectionModal } from '../slices/collectionSlice';
import { useCollections } from '../hooks/useCollections';

const CollectionSelector = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { collections, selectedCollection, selectedCollectionId, countTasksInCollection } = useCollections();
    const { data: tasks = [] } = useGetTasksQuery(user?.uid || '', { skip: !user?.uid });

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    if (collections.length === 0) {
        return (
            <button
                onClick={() => dispatch(openCreateCollectionModal())}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#e2e2ea] bg-[#ffffff] text-[13.5px] font-semibold text-[#7c6cd4] hover:border-[#d9d2f4] transition-colors"
            >
                <i className="pi pi-plus text-[11px]" />
                {t("collections.newCollection")}
            </button>
        );
    }

    const selectedCount = selectedCollectionId ? countTasksInCollection(tasks, selectedCollectionId) : 0;

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-[#ffffff] border border-[#e2e2ea] rounded-lg text-[13.5px] font-semibold text-[#1d1d22] hover:border-[#d9d2f4] transition-colors shadow-[0_1px_2px_rgba(20,20,40,0.04)]"
            >
                {selectedCollection && (
                    <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: selectedCollection.color }} />
                )}
                <span>{selectedCollection?.name}</span>
                <span className="text-[11px] text-[#aeaeb8] font-semibold">{selectedCount} {t("collections.tasksShort")}</span>
                <i className={`pi pi-chevron-down text-[10px] text-[#9494a0] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 min-w-[230px] bg-[#ffffff] border border-[#ededf2] rounded-xl shadow-[0_12px_32px_rgba(20,20,40,0.16)] p-1.5 z-30">
                    {collections.map((collection) => {
                        const isActive = collection.id === selectedCollectionId;
                        return (
                            <button
                                key={collection.id}
                                onClick={() => {
                                    dispatch(setSelectedCollectionId(collection.id));
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${isActive ? 'bg-[#7c6cd4]/[0.08] text-[#1d1d22] font-semibold' : 'text-[#5d5d68] font-medium hover:bg-[#f4f4f7]'}`}
                            >
                                <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: collection.color }} />
                                <span className="flex-1 text-left truncate">{collection.name}</span>
                                <span className="text-[11px] text-[#aeaeb8] font-semibold">{countTasksInCollection(tasks, collection.id)}</span>
                            </button>
                        );
                    })}
                    <div className="h-px bg-[#f0f0f4] mx-2 my-1.5" />
                    <button
                        onClick={() => {
                            dispatch(openCreateCollectionModal());
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-[#7c6cd4] hover:bg-[#7c6cd4]/[0.08] transition-colors"
                    >
                        <i className="pi pi-plus text-[10px]" />
                        {t("collections.newCollection")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CollectionSelector;
