import type { Subject, Material, Page, AbsenceLog, Assessment } from "@/types/types";
import { apiRequest } from "./apiClient";

export type CreateSubjectParams = {
    userId: string;
    periodId: string;
    name: string;
    professor?: string;
    classroom?: string;
    color: string;
};

export async function createSubject(params: CreateSubjectParams): Promise<Subject> {
    return apiRequest<Subject>(`/subjects`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function getSubjectMaterials(subjectId: string): Promise<Page<Material>> {
    return apiRequest<Page<Material>>(`/subjects/${subjectId}/materials`, {
        method: 'GET',
    });
}

export async function getSubjectDetails(subjectId: string): Promise<Subject> {
    return apiRequest<Subject>(`/subjects/${subjectId}`, {
        method: 'GET',
    });
}

export async function getSubjectAbsenceLogs(subjectId: string): Promise<Page<AbsenceLog>> {
    return apiRequest<Page<AbsenceLog>>(`/absence-logs/subject/${subjectId}`, {
        method: 'GET',
    });
}

export async function getSubjectAssessments(subjectId: string): Promise<Page<Assessment>> {
    return apiRequest<Page<Assessment>>(`/assessments/subject/${subjectId}`, {
        method: 'GET',
    });
}
