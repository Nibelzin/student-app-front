import { useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { GridStack } from 'gridstack'
import { useEffect } from 'react'
import { GripVertical, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import UserNote from '@/components/notes/UserNote'
import { NEXT_ACTIVITIES_PLACEHOLDER, QUICK_NOTES_PLACEHOLDER } from '@/lib/mock'
import { Input } from '@/components/ui/input'
import type { Note } from '@/types/types'
import { nodeContainsText } from '@/lib/utils'

const Home = () => {
    const [notes, setNotes] = useState<Note[]>(QUICK_NOTES_PLACEHOLDER)
    const [noteSearch, setNoteSearch] = useState<string>('')
    const [isGridReady, setGridReady] = useState(false);

    const gridRef = useRef<GridStack | null>(null)

    const itemsRef = useRef(new Map<string, HTMLElement>())

    function getMap() {
        return itemsRef.current
    }

    const setUserNotes = (newNotes: Note[]) => {
        setNotes(newNotes)
        console.log("novas notas", newNotes)
    }

    const addUserNote = () => {
        console.log("adicionado")

        const newNote: Note = {
            id: (notes.length + 1).toString(),
            isPinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            content: "{\"type\":\"doc\"}"
        }
        setNotes(prevNotes => [...prevNotes, newNote])
    }

    const deleteUserNote = (noteId: string) => {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
    }

    const filteredNotes = notes.filter(note => {
        try {
            const noteDocument = JSON.parse(note.content);
            return nodeContainsText(noteDocument, noteSearch);
        } catch (error) {
            console.error('Erro ao parsear o conteúdo da nota:', error);
            return false;
        }
    });

    useEffect(() => {
        const saveLayout = () => {
            if (gridRef.current) {
                const serializedData = gridRef.current.save(false);
                localStorage.setItem('grid-layout', JSON.stringify(serializedData));
            }
        };

      
        const timer = setTimeout(() => {
            const grid = GridStack.init({
                marginUnit: 'px',
                handle: '.handle',
                cellHeight: '100px',
                columnOpts: {
                    breakpoints: [{ w: 768, c: 1 }],
                    columnMax: 6,
                    layout: 'compact'
                }
            });

            if (!grid) {
                console.error("Falha ao inicializar o GridStack. O elemento alvo pode não existir.");
                return;
            }

            gridRef.current = grid;

            const savedLayout = localStorage.getItem('grid-layout');
            if (savedLayout) {
                try {
                    const parsedLayout = JSON.parse(savedLayout);
                    console.log("Layout salvo encontrado:", parsedLayout);
                    grid.load(parsedLayout);
                } catch (e) {
                    console.error('Erro ao carregar layout salvo:', e);
                }
            }

            grid.on('change', saveLayout);

            setTimeout(() => {
                setGridReady(true);
            }, 200);

        }, 0); 


        return () => {
            clearTimeout(timer); 
            const grid = gridRef.current;
            if (grid) {
                grid.off('change');
                grid.destroy();
                gridRef.current = null;
            }
        };

    }, []);


    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            {/* Greeting */}
            <header className="m-4">
                <h1 className="text-2xl tracking-tight text-balance font-semibold">Olá, Luan</h1>
                <p className="text-sm text-neutral-600">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </header>

            <div className={`grid-stack ${isGridReady ? 'grid-ready' : ''}`}>
                <div className='grid-stack-item' gs-id="activities" gs-w="4" gs-min-w="2" gs-max-h="6" gs-h="4">
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
                <div className='grid-stack-item' gs-id="notes" gs-w="2" gs-h="4" ref={(node) => { const map = getMap(); if (node) map.set('item1', node); else map.delete('item1'); }}>
                    <div className='grid-stack-item-content rounded-md border bg-white'>
                        <div className=' h-[calc(100%-96px)] overflow'>
                            <div className='p-4 flex flex-col gap-2'>
                                <div className='flex items-center justify-between w-full'>
                                    <div className='flex items-center gap-2'>
                                        <GripVertical size={20} className='handle cursor-pointer' />
                                        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Notas</h2>
                                    </div>
                                    <Plus className='cursor-pointer' size={20} onClick={() => addUserNote()} />
                                </div>
                                <div className=''>
                                    <Input placeholder='Pesquisar Notas...' className='shadow-none' value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className='px-4 pb-4 h-full overflow-y-auto'>
                                {QUICK_NOTES_PLACEHOLDER.length === 0 ? (
                                    <div>
                                        <Card className="flex items-center justify-center h-64 p-4 text-center text-neutral-500 dark:bg-neutral-900/40 shadow-none">
                                            Nenhuma Nota
                                        </Card>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex flex-col gap-3">
                                            {filteredNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(note => (
                                                <UserNote key={note.id} setUserNotes={setUserNotes} deleteUserNote={deleteUserNote} note={note} notes={notes} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-stack-item' gs-id="files" gs-w="6" gs-h="4" ref={(node) => { const map = getMap(); if (node) map.set('item1', node); else map.delete('item1'); }}>
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
