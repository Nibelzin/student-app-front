import type { Assessment, Page, PageParams } from "@/types/types";
import { apiRequest } from "./apiClient";
import { buildQueryString } from "@/lib/utils";

interface GetAssessmentsParams extends PageParams {
    subjectId?: string;
    userId?: string;
    assessmentDate?: Date;
    isCompleted?: boolean;
}

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

export async function getAssessments(params: GetAssessmentsParams): Promise<Page<Assessment>> {
    const query = buildQueryString({
        ...params
    })

    return apiRequest<Page<Assessment>>(`/assessments?${query}`,
        {
            method: 'GET',
        }
    );
}
