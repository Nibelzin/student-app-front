import type { Note, Page, Period, Subject, User, UserPreferences, PageParams, Activity } from "@/types/types";
import { apiRequest } from "./apiClient";
import { buildQueryString, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/utils";


interface CreateUserParams {
    email: string;
    password: string;
    name: string;
};

interface GetUserPreferencesParams {
    userId: string;
}



interface GetUserNotesParams extends PageParams {
    userId: string;
    search?: string;
}

interface GetUserSubjectsParams extends PageParams {
    userId: string;
    search?: string;
}

interface GetUserActivitiesParams extends PageParams {
    userId: string;
    search?: string;
}

export async function createUser(params: CreateUserParams): Promise<User> {
    const response = await apiRequest<User>(`/users`, {
        method: 'POST',
        body: JSON.stringify(params),
    });

    return response;
}

export async function getUserNotes(params: GetUserNotesParams): Promise<Page<Note>> {
    const query = buildQueryString({
        page: params.page ?? DEFAULT_PAGE,
        size: params.size ?? DEFAULT_PAGE_SIZE,
        search: params.search,
    })



    return apiRequest<Page<Note>>(`/users/${params.userId}/notes?${query}`,
        {
            method: 'GET',
        }
    );
}

export async function getUserSubjects(params: GetUserSubjectsParams): Promise<Page<Subject>> {
    const query = buildQueryString({
        page: params.page || DEFAULT_PAGE,
        size: params.size || DEFAULT_PAGE_SIZE,
        search: params.search,
    })

    return apiRequest<Page<Subject>>(`/users/${params.userId}/subjects?${query}`,
        {
            method: 'GET',
        }
    );
}


export async function getUserPeriods(params: { userId: string }): Promise<Period[]> {
    return apiRequest<Period[]>(`/users/${params.userId}/periods`, {
        method: 'GET',
    });
}

export async function getMe(): Promise<User> {
    return apiRequest<User>(`/users/me`)
}

export async function getUserPreferences(params: GetUserPreferencesParams): Promise<UserPreferences> {
    return apiRequest<UserPreferences>(`/users/${params.userId}/preferences`)
}

export async function updateUserPreferences(id: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return apiRequest<UserPreferences>(`/user-preferences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(preferences),
    });
}