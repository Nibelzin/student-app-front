import { apiRequest } from "./apiClient";
import type { Material } from "@/types/types";

interface CreateMaterialParams {
    title: string;
    type: string;
    isFavorite: boolean;
    subjectId?: string;
    activityId?: string;
    externalUrl: string;
}

interface CreateMaterialWithFileParams {
    title: string;
    type: string;
    isFavorite: boolean;
    subjectId?: string;
    activityId?: string;
    file: File;
}

export async function createMaterial(params: CreateMaterialParams): Promise<Material> {
    return apiRequest<Material>('/materials', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function createMaterialWithFile(params: CreateMaterialWithFileParams): Promise<Material> {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('type', params.type);
    formData.append('isFavorite', String(params.isFavorite));
    if (params.subjectId) formData.append('subjectId', params.subjectId);
    if (params.activityId) formData.append('activityId', params.activityId);
    formData.append('file', params.file);

    return apiRequest<Material>('/materials/with-file', {
        method: 'POST',
        body: formData,
    });
}


export async function updateMaterial(id: string, params: Partial<Material>): Promise<Material> {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    return apiRequest<Material>(`/materials/${id}`, {
        method: 'PUT',
        body: formData,
    });
}

export async function deleteMaterial(id: string): Promise<void> {
    return apiRequest<void>(`/materials/${id}`, {
        method: 'DELETE',
    });
}
