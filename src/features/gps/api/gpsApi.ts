import { baseApi } from "@/store/api/baseApi";
import { tasksApi } from "@/features/kanban/api/tasksApi";
import { GpsDto, GpsCreateInput, GpsUpdateInput, GpsMajorMoveInput } from "@/types/gps";

export const gpsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

        getGps: builder.query<GpsDto[], string>({
            query: () => 'gps',
            transformResponse: (response: { gps: GpsDto[] }) => response.gps,
            providesTags: ["Gps"],
        }),

        createGps: builder.mutation<{ success: boolean; id: string }, GpsCreateInput>({
            query: (gps) => ({
                url: 'gps',
                method: 'POST',
                body: gps,
            }),
            invalidatesTags: ["Gps", "Task"],
        }),

        updateGps: builder.mutation<{ success: boolean }, { gpsId: string; updates: GpsUpdateInput }>({
            query: ({ gpsId, updates }) => ({
                url: `gps/${gpsId}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ["Gps"],
        }),

        deleteGps: builder.mutation<{ success: boolean }, { gpsId: string }>({
            query: ({ gpsId }) => ({
                url: `gps/${gpsId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Gps", "Task"],
        }),

        addMajorMove: builder.mutation<{ success: boolean }, { gpsId: string; move: GpsMajorMoveInput }>({
            query: ({ gpsId, move }) => ({
                url: `gps/${gpsId}/moves`,
                method: 'POST',
                body: move,
            }),
            invalidatesTags: ["Gps", "Task"],
        }),

        updateMajorMove: builder.mutation<{ success: boolean }, { gpsId: string; moveId: string; title?: string; isNumeric?: boolean; targetCount?: number | null; remainingCount?: number | null }>({
            query: ({ gpsId, moveId, title, isNumeric, targetCount, remainingCount }) => ({
                url: `gps/${gpsId}/moves`,
                method: 'PUT',
                body: { moveId, title, isNumeric, targetCount, remainingCount },
            }),
            async onQueryStarted({ gpsId, moveId, title, isNumeric, targetCount, remainingCount }, { dispatch, queryFulfilled, getState }) {
                const state = getState() as { auth?: { user?: { uid?: string } } };
                const userId = state.auth?.user?.uid;
                if (!userId) return;

                const gpsList = gpsApi.endpoints.getGps.select(userId)(state as never).data as GpsDto[] | undefined;
                const taskId = gpsList?.find(g => g.id === gpsId)?.majorMoves.find(m => m.id === moveId)?.taskId;

                const taskPatch = taskId
                    ? dispatch(
                        tasksApi.util.updateQueryData("getTasks", userId, (draft) => {
                            const task = draft.find(t => t.id === taskId);
                            if (!task) return;
                            if (typeof title === 'string' && title.trim()) task.title = title.trim();
                            if (isNumeric !== undefined) task.isNumeric = isNumeric;
                            if (targetCount !== undefined) task.targetCount = targetCount;
                            if (remainingCount !== undefined) task.remainingCount = remainingCount;
                        })
                    )
                    : null;

                const gpsPatch = (typeof title === 'string' && title.trim())
                    ? dispatch(
                        gpsApi.util.updateQueryData("getGps", userId, (draft) => {
                            const move = draft.find(g => g.id === gpsId)?.majorMoves.find(m => m.id === moveId);
                            if (move) move.title = title.trim();
                        })
                    )
                    : null;

                try {
                    await queryFulfilled;
                } catch {
                    taskPatch?.undo();
                    gpsPatch?.undo();
                }
            },
            invalidatesTags: ["Gps", "Task"],
        }),

        removeMajorMove: builder.mutation<{ success: boolean }, { gpsId: string; moveId: string }>({
            query: ({ gpsId, moveId }) => ({
                url: `gps/${gpsId}/moves?moveId=${moveId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Gps", "Task"],
        }),
    }),
});

export const {
    useGetGpsQuery,
    useCreateGpsMutation,
    useUpdateGpsMutation,
    useDeleteGpsMutation,
    useAddMajorMoveMutation,
    useUpdateMajorMoveMutation,
    useRemoveMajorMoveMutation,
} = gpsApi;
