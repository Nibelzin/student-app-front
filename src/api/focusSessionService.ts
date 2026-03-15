import { apiRequest } from "./apiClient";

export interface FocusSessionCreateRequest {
    userId: string;
    subjectId?: string;
    activityId?: string;
}

export interface FocusSessionUpdateRequest {
    durationSeconds: number;
    isCompleted: boolean;
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

export const createFocusSession = async (sessionData: FocusSessionCreateRequest): Promise<FocusSessionResponse> => {
    const response = await apiRequest<FocusSessionResponse>('/focus-sessions', 
        {
            method: 'POST',
            body: JSON.stringify(sessionData),
        }
    );
    return response;
};

export const updateFocusSession = async (sessionId: string, updateData: FocusSessionUpdateRequest): Promise<FocusSessionResponse> => {
    const response = await apiRequest<FocusSessionResponse>(`/focus-sessions/${sessionId}`, 
        {
            method: 'PUT',
            body: JSON.stringify(updateData),
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

