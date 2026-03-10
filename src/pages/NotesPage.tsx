import { getActivities } from '@/api/activitiyService';
import { createNote, type CreateNoteParams } from '@/api/noteService';
import { getUserNotes, getUserSubjects } from '@/api/userService';
import UserNote from '@/components/notes/UserNote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useCurrentUser } from '@/hooks/use-user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, NotepadText, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const NotesPage = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    const [noteSearch, setNoteSearch] = useState<string>('');
    const debouncedSearch = useDebounce(noteSearch, 300);

    const { data: notesPage } = useQuery({
        queryKey: ['userNotes', user?.id, debouncedSearch],
        queryFn: () => getUserNotes({ userId: user?.id!, search: debouncedSearch }),
        enabled: !!user?.id,
    });

    const { data: subjectsPage } = useQuery({
        queryKey: ['userSubjects', user?.id],
        queryFn: () => getUserSubjects({ userId: user?.id! }),
        enabled: !!user?.id,
    });

    const { data: activitiesPage } = useQuery({
        queryKey: ['userActivities', user?.id],
        queryFn: () => getActivities({ userId: user?.id! }),
        enabled: !!user?.id,
    });

    const filteredNotes = notesPage?.content
        .slice()
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const { mutate: performAddNote } = useMutation({
        mutationFn: createNote,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['userNotes', user?.id],
                refetchType: 'all'
            });
        }
    });

    const addUserNote = () => {
        if (!user) return;

        const newNote: CreateNoteParams = {
            userId: user.id,
            isPinned: false,
            content: '{"type":"doc","content":[{"type":"paragraph"}]}'
        };

        performAddNote(newNote);
    };

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-semibold">Minhas Notas</h1>
                </div>
                <Button onClick={addUserNote}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Nota
                </Button>
            </header>

            <div className="mb-6">
                <Input
                    placeholder="Pesquisar Notas..."
                    className="max-w-md"
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                />
            </div>

            {filteredNotes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                    <NotepadText size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">Você ainda não tem notas</p>
                    <Button variant="link" onClick={addUserNote}>Criar minha primeira nota</Button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredNotes?.map(note => (
                        <UserNote
                            key={note.id}
                            note={note}
                            subjects={subjectsPage?.content}
                            activities={activitiesPage?.content}
                        />
                    ))}
                </div>
            )}
        </main>
    );
};

export default NotesPage;
