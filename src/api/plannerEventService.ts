import type { PlannerEvent } from "@/types/types";
import { apiRequest } from "./apiClient";

export type CreatePlannerEventParams = {
    title: string;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    rule?: string;
    color?: string;
    userId: string;
    activityId?: string;
    subjectId?: string;
};

export type UpdatePlannerEventParams = Omit<CreatePlannerEventParams, 'userId'>;

export async function createPlannerEvent(params: CreatePlannerEventParams): Promise<PlannerEvent> {
    return apiRequest<PlannerEvent>(`/planner-event`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function updatePlannerEvent(id: string, params: UpdatePlannerEventParams): Promise<PlannerEvent> {
    return apiRequest<PlannerEvent>(`/planner-event/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params),
    });
}

export async function deletePlannerEvent(id: string): Promise<void> {
    return apiRequest<void>(`/planner-event/${id}`, {
        method: 'DELETE',
    });
}

export async function getPlannerEventById(id: string): Promise<PlannerEvent> {
    return apiRequest<PlannerEvent>(`/planner-event/${id}`, {
        method: 'GET',});
}
