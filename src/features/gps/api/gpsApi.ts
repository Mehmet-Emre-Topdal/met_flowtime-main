import { baseApi } from "@/store/api/baseApi";
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
    useRemoveMajorMoveMutation,
} = gpsApi;
