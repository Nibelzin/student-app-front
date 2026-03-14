import { apiRequest } from "./apiClient";

export interface FocusSessionRequest {
    durationSeconds: number;
    isCompleted: boolean;
    userId: string;
    subjectId?: string;
    activityId?: string;
}

export interface FocusSessionResponse {
    id: string;
    durationSeconds: number;
    isCompleted: boolean;
    xpEarned: number;
    createdAt: string;
    userId: string;
    subjectId?: string;
    subjectName?: string;
    activityId?: string;
    activityName?: string;
}

export interface FocusSessionTickResponse {
    currentXp: number;
    currentLevel: number;
    leveldUp: boolean;
}

export const createFocusSession = async (sessionData: FocusSessionRequest): Promise<FocusSessionResponse> => {
    const response = await apiRequest<FocusSessionResponse>('/focus-sessions', 
        {
            method: 'POST',
            body: JSON.stringify(sessionData),
        }
    );
    return response;
};

export const awardFocusSessionXP = async (): Promise<FocusSessionTickResponse> => {
    const response = await apiRequest<FocusSessionTickResponse>('/focus-sessions/tick',
        {
            method: 'POST'
        }
    );
    return response;
}

