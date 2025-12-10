import type { Note } from "@/types/types";
import { apiRequest } from "./apiClient";


export type CreateNoteParams = {
    content: string;
    isPinned?: boolean;
    userId: string;
};

export type UpdateNoteParams = {
    content: string;
    isPinned?: boolean;
    noteId: string;
}

type DeleteNoteParams = {
    noteId: string;
}


export async function createNote(params: CreateNoteParams): Promise<Note> {
    return apiRequest<Note>(`/notes`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function deleteNote(params: DeleteNoteParams): Promise<void> {
    return apiRequest<void>(`/notes/${params.noteId}`, {
        method: 'DELETE',
    });
}

export async function updateNote(params: UpdateNoteParams): Promise<Note> {

    console.log("Atualizando nota:", params);

    return apiRequest<Note>(`/notes/${params.noteId}`, {
        method: 'PUT',
        body: JSON.stringify({
            content: params.content,
            isPinned: params.isPinned,
        }),
    });
}
