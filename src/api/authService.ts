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
    if (!token) return false;

    try {
        const payloadBase64Url = token.split('.')[1];
        const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);

        if (decoded.exp) {
            return Date.now() < decoded.exp * 1000;
        }

        return true;
    } catch (e) {
        return false;
    }
}