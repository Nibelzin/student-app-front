import type { ApiError } from "@/types/types";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';


export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {


    const headers: Record<string, string> = { ...getAuthHeaders() as Record<string, string> };

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
        }


        const errorData: ApiError = await response.json();


        throw new Error(errorData.message);
    }

    const text = await response.text();

    return text ? JSON.parse(text) : null as T;
}