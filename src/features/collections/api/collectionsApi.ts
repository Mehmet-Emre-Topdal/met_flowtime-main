import { baseApi } from "@/store/api/baseApi";
import { CollectionDto, CollectionCreateInput, CollectionUpdateInput } from "@/types/collection";

export const collectionsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

        getCollections: builder.query<CollectionDto[], string>({
            query: () => 'collections',
            transformResponse: (response: { collections: CollectionDto[] }) => response.collections,
            providesTags: ["Collection"],
        }),

        createCollection: builder.mutation<{ success: boolean; id: string }, CollectionCreateInput>({
            query: (input) => ({
                url: 'collections',
                method: 'POST',
                body: input,
            }),
            invalidatesTags: ["Collection"],
        }),

        updateCollection: builder.mutation<{ success: boolean }, { collectionId: string; updates: CollectionUpdateInput }>({
            query: ({ collectionId, updates }) => ({
                url: `collections/${collectionId}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ["Collection"],
        }),

        deleteCollection: builder.mutation<{ success: boolean }, { collectionId: string }>({
            query: ({ collectionId }) => ({
                url: `collections/${collectionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Collection", "Task"],
        }),
    }),
});

export const {
    useGetCollectionsQuery,
    useCreateCollectionMutation,
    useUpdateCollectionMutation,
    useDeleteCollectionMutation,
} = collectionsApi;
