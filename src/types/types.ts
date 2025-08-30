export type User = {
    id: string;
    name: string;
    email: string;
    course: string;
    semester?: number;
    created_at: Date
}

export type Subject = {
    id: string;
    userId: string;
    name: string;
    professor?: string;
    classroom?: string
}

export type Note = {
    id: string;
    userId: string;
    content: string;
    createdAt: Date
}

export type Activity = {
    id: string;
    subjectId: string;
    title: string;
    description?: string;
    dueDate: Date;
    isCompleted: boolean
}

export type ClassSchedule = {
    id: string;
    subjectId: string;
    weekDay: number;
    startTime: Date;
    endTime?: Date
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