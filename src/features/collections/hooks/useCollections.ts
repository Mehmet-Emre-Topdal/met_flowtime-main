import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/storeHooks';
import { useGetCollectionsQuery } from '../api/collectionsApi';
import { setSelectedCollectionId } from '../slices/collectionSlice';
import { TaskDto } from '@/types/task';

export function useCollections() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const selectedCollectionId = useAppSelector((state) => state.collection.selectedCollectionId);

    const { data: collections = [], isLoading } = useGetCollectionsQuery(user?.uid || '', { skip: !user?.uid });

    const defaultCollectionId = collections[0]?.id ?? null;

    useEffect(() => {
        if (collections.length === 0) return;
        const isValidSelection = selectedCollectionId && collections.some(c => c.id === selectedCollectionId);
        if (!isValidSelection) {
            dispatch(setSelectedCollectionId(collections[0].id));
        }
    }, [collections, selectedCollectionId, dispatch]);

    const selectedCollection = collections.find(c => c.id === selectedCollectionId) ?? null;

    const taskMatchesCollection = (task: TaskDto, collectionId: string | null): boolean => {
        if (task.gpsId) return false;
        if (!collectionId) return task.collectionId == null;
        if (task.collectionId === collectionId) return true;
        return task.collectionId == null && collectionId === defaultCollectionId;
    };

    const countTasksInCollection = (tasks: TaskDto[], collectionId: string): number =>
        tasks.filter(task => taskMatchesCollection(task, collectionId)).length;

    return {
        collections,
        isLoading,
        selectedCollectionId,
        selectedCollection,
        defaultCollectionId,
        taskMatchesCollection,
        countTasksInCollection,
    };
}
