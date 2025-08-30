

import { useMemo, useRef } from 'react'
import { Card } from '@/components/ui/card'
import type { Activity, Note } from '@/types/types'
import { GridStack } from 'gridstack'
import { useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Temporary mocked data placeholders (to be replaced with real data fetching later)

const NEXT_ACTIVITIES_PLACEHOLDER: Activity[] = [
    {
        id: '1',
        subjectId: 'math101',
        title: 'Prova de Cálculo I',
        description: 'Capítulos 1 a 5',
        dueDate: new Date('2023-09-10T10:00:00'),
        isCompleted: false
    },
    {
        id: '2',
        subjectId: 'cs201',
        title: 'Entrega do Projeto de Algoritmos',
        description: 'Implementar o algoritmo de ordenação',
        dueDate: new Date('2023-09-12T23:59:59'),
        isCompleted: false
    },
    {
        id: '3',
        subjectId: 'hist301',
        title: 'Redação sobre a Revolução Francesa',
        description: 'Mínimo de 1000 palavras',
        dueDate: new Date('2023-09-15T17:00:00'),
        isCompleted: false
    }
]

const QUICK_NOTES_PLACEHOLDER: Note[] = [
    {
        content: 'Revisar os capítulos 1 a 5 do livro de matemática.',
        createdAt: new Date('2023-09-01T14:30:00'),
        id: '1',
        userId: 'user1'
    },
    {
        content: 'Reunião com o professor na sexta-feira às 14h.',
        createdAt: new Date('2023-09-02T10:00:00'),
        id: '2',
        userId: 'user1'
    },
    {
        content: 'Brainstorming de ideias para o projeto de história.',
        createdAt: new Date('2023-09-03T15:00:00'),
        id: '3',
        userId: 'user1'
    },
    {
        content: 'Listar todas as tarefas pendentes para a próxima semana.',
        createdAt: new Date('2023-09-04T09:00:00'),
        id: '4',
        userId: 'user1'
    }
]

let grid: GridStack

const Home = () => {
    const todayLabel = useMemo(() => {
        const d = new Date()
        // Format: 24 de Agosto de 2025 (capitalize month)
        const raw = d.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        return raw.replace(/ de ([a-zç]+)/, (_, month) => ` de ${month.charAt(0).toUpperCase()}${month.slice(1)}`)
    }, [])

    const itemsRef = useRef(new Map<string, HTMLElement>())

    function getMap() {
        return itemsRef.current
    }

    useEffect(() => {
        grid = GridStack.init({
            marginUnit: 'px',
            margin: 16,
            handle: '.handle',
            cellHeight: '100px',
            columnOpts: {
                breakpoints: [{
                    w: 768,
                    c: 1
                }],
                columnMax: 6,
                layout: 'compact'
            }
        })

    }, [])


    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            {/* Greeting */}
            <header className="m-4">
                <h1 className="text-2xl font-semibold tracking-tight">Olá, Luan</h1>
                <p className="text-sm text-neutral-600">{todayLabel}</p>
            </header>

            <div className='grid-stack '>
                <div className='grid-stack-item' gs-w="4" gs-min-w="2" gs-max-h="6" gs-h="4">
                    <div className='grid-stack-item-content bg-white p-4 rounded-md border'>
                        <div className='flex items-center mb-4 gap-2'>
                            <GripVertical size={20} className='handle cursor-pointer' />
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Próximas atividades</h2>
                        </div>
                        {NEXT_ACTIVITIES_PLACEHOLDER.length === 0 ? (
                            <div className="lg:col-span-2">
                                <Card className="flex items-center justify-center h-64 bg-neutral-50 p-4 text-center text-neutral-500 dark:bg-neutral-900/40">
                                    Nenhuma atividade próxima
                                </Card>
                            </div>
                        ) : (
                            <div className="lg:col-span-2">
                                <div className="flex flex-col gap-3">
                                    {NEXT_ACTIVITIES_PLACEHOLDER.map(activity => (
                                        <Card
                                            key={activity.id}
                                            className="flex flex-col p-4 bg-neutral-50 dark:bg-neutral-900/40"
                                        >
                                            <p className=''>{activity.title}</p>
                                            <p className='text-lg'>{activity.description}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='grid-stack-item' gs-w="2" gs-h="4" ref={(node) => { const map = getMap(); if (node) map.set('item1', node); else map.delete('item1'); }}>
                    <div className='grid-stack-item-content bg-white p-4 rounded-md border'>
                        <div className='flex items-center mb-4 gap-2'>
                            <GripVertical size={20} className='handle cursor-pointer' />
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Notas Rápidas</h2>
                        </div>
                        {QUICK_NOTES_PLACEHOLDER.length === 0 ? (
                            <div className="lg:col-span-2">
                                <Card className="flex items-center justify-center h-64 bg-neutral-50 p-4 text-center text-neutral-500 dark:bg-neutral-900/40">
                                    Nenhuma Nota
                                </Card>
                            </div>
                        ) : (
                            <div className="lg:col-span-2">
                                <div className="flex flex-col gap-3">
                                    {QUICK_NOTES_PLACEHOLDER.map(note => (
                                        <Card
                                            key={note.id}
                                            className="flex flex-col p-4 bg-yellow-100 dark:bg-neutral-900/40"
                                        >
                                            <p className=''>{note.content}</p>
                                            <p className='text-sm'>{note.createdAt.toLocaleString()}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='grid-stack-item' gs-w="6" gs-h="4" ref={(node) => { const map = getMap(); if (node) map.set('item1', node); else map.delete('item1'); }}>
                    <div className=' grid-stack-item-content'>
                        <Card className="h-full">
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Home
