import type { AbsenceLog } from "@/types/types";
import { apiRequest } from "./apiClient";

interface CreateAbsenceLogParams {
    absenceDate: Date;
    notes?: string;
    subjectId: string;
}

export async function createAbsenceLog(params: CreateAbsenceLogParams): Promise<AbsenceLog> {
    return apiRequest<AbsenceLog>(`/absence-logs`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        }
    );
}

