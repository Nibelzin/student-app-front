import type { Subject } from "@/types/types";
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
