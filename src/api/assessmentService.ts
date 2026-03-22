import type { Assessment } from "@/types/types";
import { apiRequest } from "./apiClient";

interface CreateAssessmentParams {
    title: string;
    assessmentDate: Date;
    grade?: number;
    maxGrade?: number;
    weight?: number;
    subjectId: string;
}

export async function createAssessment(params: CreateAssessmentParams): Promise<Assessment> {
    return apiRequest<Assessment>(`/assessments`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        }
    );
}