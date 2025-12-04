import type { User } from "@/types/types";
import { apiRequest } from "./apiClient";


type CreateUserParams = {
    email: string;
    password: string;
    name: string;
};

export async function createUser(params: CreateUserParams): Promise<User> {
    const response = await apiRequest<User>(`/users`, {
        method: 'POST',
        body: JSON.stringify(params),
    });

    return response;
}

export async function getMe(): Promise<User> {
    return apiRequest<User>(`/users/me`)
}