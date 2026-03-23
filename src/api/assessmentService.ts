import type { Assessment, Page } from "@/types/types";
import { apiRequest } from "./apiClient";

interface CreateAssessmentParams {
    title: string;
    assessmentDate: Date;
    grade?: number;
    maxGrade?: number;
    weight?: number;
    subjectId: string;
}

interface UpdateAssessmentParams {
    id: string;
    title?: string;
    assessmentDate?: Date;
    grade?: number;
    maxGrade?: number;
    weight?: number;
}

export async function createAssessment(params: CreateAssessmentParams): Promise<Assessment> {
    return apiRequest<Assessment>(`/assessments`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        }
    );
}

export async function updateAssessment(params: UpdateAssessmentParams): Promise<Assessment> {
    return apiRequest<Assessment>(`/assessments/${params.id}`,
        {
            method: 'PUT',
            body: JSON.stringify(params)
        }
    );
}

export async function getUserAssessments(userId: string): Promise<Page<Assessment>> {
    return apiRequest<Page<Assessment>>(`/assessments?userId=${userId}`, {
        method: 'GET',
    });
}