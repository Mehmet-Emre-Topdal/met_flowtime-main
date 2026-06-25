import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CollectionState {
    selectedCollectionId: string | null;
    isCreateModalOpen: boolean;
    editingCollectionId: string | null;
}

const initialState: CollectionState = {
    selectedCollectionId: null,
    isCreateModalOpen: false,
    editingCollectionId: null,
};

const collectionSlice = createSlice({
    name: "collection",
    initialState,
    reducers: {
        setSelectedCollectionId: (state, action: PayloadAction<string | null>) => {
            state.selectedCollectionId = action.payload;
        },
        openCreateCollectionModal: (state) => {
            state.isCreateModalOpen = true;
        },
        closeCreateCollectionModal: (state) => {
            state.isCreateModalOpen = false;
        },
        openEditCollectionModal: (state, action: PayloadAction<string>) => {
            state.editingCollectionId = action.payload;
        },
        closeEditCollectionModal: (state) => {
            state.editingCollectionId = null;
        },
        resetCollection: (state) => {
            state.selectedCollectionId = null;
            state.isCreateModalOpen = false;
            state.editingCollectionId = null;
        },
    },
});

export const {
    setSelectedCollectionId,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openEditCollectionModal,
    closeEditCollectionModal,
    resetCollection,
} = collectionSlice.actions;
export default collectionSlice.reducer;
