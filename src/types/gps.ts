export interface GpsGoal {
    id: string;
    text: string;
}

export interface GpsMajorMove {
    id: string;
    taskId: string | null;
    title: string;
}

export interface GpsFailureScenario {
    id: string;
    scenario: string;
    prevention: string;
}

export interface GpsReminder {
    id: string;
    day: string;
    time: string;
    label: string;
}

export interface GpsSystem {
    tracking: string;
    reminders: GpsReminder[];
    accountability: string;
}

export type GpsStatus = "active" | "completed" | "archived";

export interface GpsDto {
    id: string;
    userId: string;
    title: string;
    status: GpsStatus;
    goals: GpsGoal[];
    antiGoals: string[];
    majorMoves: GpsMajorMove[];
    crystalBall: GpsFailureScenario[];
    system: GpsSystem;
    createdAt: string;
    updatedAt: string;
}

export interface GpsMajorMoveInput {
    title: string;
    isNumeric: boolean;
    targetCount: number | null;
}

export interface GpsCreateInput {
    title: string;
    goals: GpsGoal[];
    antiGoals: string[];
    majorMoves: GpsMajorMoveInput[];
    crystalBall: GpsFailureScenario[];
    system: GpsSystem;
}

export interface GpsUpdateInput {
    title?: string;
    status?: GpsStatus;
    goals?: GpsGoal[];
    antiGoals?: string[];
    crystalBall?: GpsFailureScenario[];
    system?: GpsSystem;
}
