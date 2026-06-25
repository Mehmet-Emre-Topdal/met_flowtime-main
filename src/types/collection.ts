export interface CollectionDto {
    id: string;
    userId: string;
    name: string;
    color: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CollectionCreateInput {
    name: string;
}

export interface CollectionUpdateInput {
    name?: string;
    color?: string;
}

export const COLLECTION_PALETTE = ['#7c6cd4', '#3f9d8f', '#d99036', '#5b8def', '#c87a7a'];
