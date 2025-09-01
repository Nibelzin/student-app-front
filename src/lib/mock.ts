import type { Activity, Note, Subject } from "@/types/types";

export const NEXT_ACTIVITIES_PLACEHOLDER: Activity[] = [
    {
        id: '1',
        subjectId: 'math101',
        title: 'Prova de Cálculo I',
        description: 'Capítulos 1 a 5',
        dueDate: new Date('2023-09-10T10:00:00'),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        subjectId: 'cs201',
        title: 'Entrega do Projeto de Algoritmos',
        description: 'Implementar o algoritmo de ordenação',
        dueDate: new Date('2023-09-12T23:59:59'),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '3',
        subjectId: 'hist301',
        title: 'Redação sobre a Revolução Francesa',
        description: 'Mínimo de 1000 palavras',
        dueDate: new Date('2023-09-15T17:00:00'),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

export const QUICK_NOTES_PLACEHOLDER: Note[] = [
    {
        content: 'Revisar os capítulos 1 a 5 do livro de matemática.',
        createdAt: new Date('2023-09-01T14:30:00'),
        id: '1',
        userId: 'user1',
        title: 'Revisão de Matemática',
        isPinned: false,
        updatedAt: new Date()
    },
    {
        content: 'Reunião com o professor na sexta-feira às 14h.',
        createdAt: new Date('2023-09-02T10:00:00'),
        id: '2',
        userId: 'user1',
        title: 'Reunião com o Professor',
        isPinned: false,
        updatedAt: new Date()
    },
    {
        content: 'Brainstorming de ideias para o projeto de história.',
        createdAt: new Date('2023-09-03T15:00:00'),
        id: '3',
        userId: 'user1',
        title: 'Brainstorming de História',
        isPinned: false,
        updatedAt: new Date()
    },
    {
        content: 'Listar todas as tarefas pendentes para a próxima semana.',
        createdAt: new Date('2023-09-04T09:00:00'),
        id: '4',
        userId: 'user1',
        title: 'Lista de Tarefas Pendentes',
        isPinned: false,
        updatedAt: new Date()
    }
]

export const SUBJECTS_PLACEHOLDER: Subject[] = [
    {
        id: 'math101',
        color: 'red',
        name: 'Matemática',
        periodId: 'period1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        classroom: 'Sala 101',
        professor: 'Dr. Silva'
    },
    {
        id: 'cs201',
        color: 'blue',
        name: 'Ciência da Computação',
        periodId: 'period1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        classroom: 'Sala 102',
        professor: 'Prof. Souza'
    },
    {
        id: 'hist301',
        color: 'green',
        name: 'História',
        periodId: 'period1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        classroom: 'Sala 103',
        professor: 'Profa. Oliveira'
    },
    {
        id: 'geo401',
        color: 'yellow',
        name: 'Geografia',
        periodId: 'period1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        classroom: 'Sala 104',
        professor: 'Prof. Lima'
    }
]