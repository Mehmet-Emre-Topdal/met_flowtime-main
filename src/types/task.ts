export type TaskStatus = "todo" | "inprogress" | "done";

export interface TaskDto {
    id: string;
    userId: string;
    title: string;
    description: string;
    status: TaskStatus;
    totalFocusedTime: number;
    order: number;
    isArchived: boolean;
    isDaily: boolean;
    lastResetDate: string;
    isNumeric: boolean;
    targetCount: number | null;
    remainingCount: number | null;
    gpsId: string | null;
    majorMoveId: string | null;
    collectionId: string | null;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

export interface TaskCreateInput {
    title: string;
    description: string;
    status: TaskStatus;
    isDaily?: boolean;
    isNumeric?: boolean;
    targetCount?: number | null;
    gpsId?: string | null;
    majorMoveId?: string | null;
    collectionId?: string | null;
}

export interface TaskUpdateInput {
    title: string;
    description: string;
    isDaily?: boolean;
    isNumeric?: boolean;
    targetCount?: number | null;
    remainingCount?: number | null;
    collectionId?: string | null;
}
