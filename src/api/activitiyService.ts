import type { Activity, CheckListItem, Material, Page, PageParams } from "@/types/types";
import { apiRequest } from "./apiClient";
import { buildQueryString, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/utils";

interface GetActivitiesParams extends PageParams {
    subjectId?: string;
    userId?: string;
    dueDate?: Date;
    isCompleted?: boolean;
    isOverdue?: boolean;
}

interface UpdateActivityParams {
    id: string;
    title?: string;
    description?: string;
    checklist?: CheckListItem[];
    dueDate?: Date;
    isCompleted?: boolean;
}

export async function getActivities(params: GetActivitiesParams): Promise<Page<Activity>> {
    const query = buildQueryString({
        ...params
    })

    return apiRequest<Page<Activity>>(`/activity?${query}`,
        {
            method: 'GET',
        }
    );
}

export async function getActivityById(id: string): Promise<Activity> {
    return apiRequest<Activity>(`/activity/${id}`,
        {
            method: 'GET',
        }
    );
}


export async function updateActivity(params: UpdateActivityParams): Promise<Activity> {
    return apiRequest<Activity>(`/activity/${params.id}`,
        {
            method: 'PUT',
            body: JSON.stringify(params)
        }
    );
}

interface CreateActivityParams {
    title: string;
    description?: string;
    checklist?: CheckListItem[];
    dueDate: Date;
    type?: string;
    subjectId: string;
}

export async function createActivity(params: CreateActivityParams): Promise<Activity> {

    return apiRequest<Activity>(`/activity`,
        {
            method: 'POST',
            body: JSON.stringify(params)
        }
    );
}

export async function deleteActivity(id: string): Promise<void> {
    return apiRequest<void>(`/activity/${id}`,
        {
            method: 'DELETE'
        }
    );
}

export async function getMaterialsByActivity(activityId: string): Promise<Material[]> {
    return apiRequest<Material[]>(`/activity/${activityId}/materials`, {
        method: 'GET',
    });
}
