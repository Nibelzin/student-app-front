import type { GridStackWidget } from "gridstack";


export type User = {
    id: string;
    name: string;
    email: string;
    course: string;
    currentSemester?: number;
    currentXp: number;
    currentLevel: number;
    coins: number;
    currentStreak: number;
    lastActivityDate: Date;
    createdAt: Date;
    updatedAt?: Date;
    role: string;
    periods?: Period[];
}

export type Period = {
    id: string;
    userId?: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type Subject = {
    id: string;
    userId: string;
    periodId: string;
    periodName?: string;
    name: string;
    professor?: string;
    classroom?: string;
    color: string;
    maxAbsencesAllowed: number;
    createdAt: Date;
    updatedAt: Date;
}

export type Note = {
    id: string;
    userId: string;
    content: string;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CheckListItem = {
    description: string;
    isDone: boolean;
}

export type Activity = {
    id: string;
    subjectId: string;
    subjectName: string;
    title: string;
    description?: string;
    dueDate: Date;
    isCompleted: boolean;
    type?: string;
    createdAt: Date;
    checkList?: CheckListItem[];
    updatedAt: Date;
}

export type ClassSchedule = {
    id: string;
    subjectId: string;
    weekDay: number;
    startTime: Date;
    endTime?: Date;
    location?: string;
}

export type FileObject = {
    id: string;
    name: string;
    storageProvider: string;
    bucket: string;
    storagePath: string;
    mimeType: string;
    size: number;
    checksum: string;
    createdAt: Date;
}

export type Material = {
    id: string;
    title: string;
    type: string;
    fileUrl?: string;
    isFavorite: boolean;
    createdAt: Date;
    subjectId?: string;
    subjectName?: string;
    activityId?: string;
    activityName?: string;
    externalUrl?: string;
}

export type GradeAttendance = {
    id: string;
    description?: string;
    grade?: number;
    absences: number
}

export type Widget = {
    position: number,
    type: 'notes' | 'tasks' | 'events',
    width: number,
    height: number
}

export type ApiError = {
    timestamp: string;
    status: number;
    error: string;
    message: string
}

export type UserPreferences = {
    id: string;
    theme: 'light' | 'dark' | 'system';
    language: string;
    settings: Record<string, any>;
    dashboardLayout: GridStackWidget[];
}

export type Page<T> = {
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    size: number;
    content: T[];
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    pageable: {
        offset: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        paged: boolean;
        pageSize: number;
        pageNumber: number;
        unpaged: boolean;
    };
    empty: boolean;
}

export type PageParams = {
    page?: number;
    size?: number;
    sort?: string;
}