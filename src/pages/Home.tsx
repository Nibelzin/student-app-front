import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { GridStack } from 'gridstack'
import { useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import UserNote from '@/components/notes/UserNote'
import { NEXT_ACTIVITIES_PLACEHOLDER, QUICK_NOTES_PLACEHOLDER } from '@/lib/mock'
import { Input } from '@/components/ui/input'

const Home = () => {

    let grid: GridStack

    const itemsRef = useRef(new Map<string, HTMLElement>())

    function getMap() {
        return itemsRef.current
    }

    useEffect(() => {
        grid = GridStack.init({
            marginUnit: 'px',
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
                <h1 className="text-2xl tracking-tight text-balance font-semibold">Olá, Luan</h1>
                <p className="text-sm text-neutral-600">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
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
                                            className="flex flex-col p-4 dark:bg-neutral-900/40 shadow-none"
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
                    <div className='grid-stack-item-content rounded-md border bg-white'>
                        <div className=' h-[calc(100%-96px)] overflow'>
                            <div className='p-4 flex flex-col gap-2'>
                                <div className='flex items-center gap-2 w-full'>
                                    <GripVertical size={20} className='handle cursor-pointer' />
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Notas</h2>
                                </div>
                                <div className=''>
                                <Input placeholder='Pesquisar Notas...' className='shadow-none'/>
                                </div>
                            </div>
                            <div className='px-4 pb-4 h-full overflow-y-auto'>
                                {QUICK_NOTES_PLACEHOLDER.length === 0 ? (
                                    <div>
                                        <Card className="flex items-center justify-center h-64 bg-neutral-50 p-4 text-center text-neutral-500 dark:bg-neutral-900/40 shadow-none">
                                            Nenhuma Nota
                                        </Card>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex flex-col gap-3">
                                            {QUICK_NOTES_PLACEHOLDER.map(note => (
                                                <UserNote key={note.id} {...note} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-stack-item' gs-w="6" gs-h="4" ref={(node) => { const map = getMap(); if (node) map.set('item1', node); else map.delete('item1'); }}>
                    <div className='grid-stack-item-content bg-white p-4 rounded-md border'>
                        <div className='flex items-center mb-4 gap-2'>
                            <GripVertical size={20} className='handle cursor-pointer' />
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Arquivos</h2>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}

export default Home
