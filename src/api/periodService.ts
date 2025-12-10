import type { Period } from "@/types/types";
import { apiRequest } from "./apiClient";

export type CreatePeriodParams = {
    userId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
};

export async function createPeriod(params: CreatePeriodParams): Promise<Period> {
    return apiRequest<Period>(`/periods`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
