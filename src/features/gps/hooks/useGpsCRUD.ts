import { useAppSelector } from '@/hooks/storeHooks';
import {
    useGetGpsQuery,
    useCreateGpsMutation,
    useUpdateGpsMutation,
    useDeleteGpsMutation,
    useAddMajorMoveMutation,
    useUpdateMajorMoveMutation,
    useRemoveMajorMoveMutation,
} from '../api/gpsApi';

export function useGpsCRUD() {
    const { user } = useAppSelector((state) => state.auth);

    const { data: gpsList = [], isLoading } = useGetGpsQuery(user?.uid || '', { skip: !user?.uid });
    const [createGps, { isLoading: isCreating }] = useCreateGpsMutation();
    const [updateGps, { isLoading: isUpdating }] = useUpdateGpsMutation();
    const [deleteGps] = useDeleteGpsMutation();
    const [addMajorMove, { isLoading: isAddingMove }] = useAddMajorMoveMutation();
    const [updateMajorMove] = useUpdateMajorMoveMutation();
    const [removeMajorMove] = useRemoveMajorMoveMutation();

    return {
        user,
        gpsList,
        isLoading,
        isCreating,
        isUpdating,
        isAddingMove,
        createGps,
        updateGps,
        deleteGps,
        addMajorMove,
        updateMajorMove,
        removeMajorMove,
    };
}
