import api from './config';

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

export const createFocusSession = async (sessionData: FocusSessionRequest): Promise<FocusSessionResponse> => {
    const response = await api.post<FocusSessionResponse>('/focus-session', sessionData);
    return response.data;
};
