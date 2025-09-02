export type User = {
    id: string;
    name: string;
    email: string;
    course: string;
    currentSemester?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type Period = {
    id: string;
    userId: string;
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
    name: string;
    professor?: string;
    classroom?: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export type Note = {
    id: string;
    userId?: string;
    title?: string;
    content: string;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type Activity = {
    id: string;
    subjectId: string;
    title: string;
    description?: string;
    dueDate: Date;
    isCompleted: boolean;
    type?: string;
    reminderAt?: Date;
    createdAt: Date;
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

export type Material = {
    id: string;
    subjectId: string;
    title: string;
    type: string;
    url: string;
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