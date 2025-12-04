import { apiRequest } from "./apiClient";

type LoginParams = {
    email: string;
    password: string;
}

type LoginResponse = {
    token: string;
}

export async function login(params: LoginParams): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>(`/auth/login`, {
        method: 'POST',
        body: JSON.stringify(params)
    });

    localStorage.setItem('authToken', response.token);

    return response;
}

export function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
}

export function isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
}