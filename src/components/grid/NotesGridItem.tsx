import type { Note, Page, User } from '@/types/types'
import { GripVertical, Plus } from 'lucide-react'
import React, { forwardRef, useState } from 'react'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import UserNote from '../notes/UserNote'
import { createNote, deleteNote, updateNote, type CreateNoteParams, type UpdateNoteParams } from '@/api/notesService'
import { useQuery, type QueryClient } from '@tanstack/react-query'
import { nodeContainsText, safeParseNoteContent } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { getUserNotes, getUserSubjects } from '@/api/userService'

interface NotesGridItemProps {
  user: User | undefined
  queryClient: QueryClient
}

const NotesGridItem = forwardRef<HTMLDivElement, NotesGridItemProps>(({ user, queryClient }, ref) => {

  const [noteSearch, setNoteSearch] = useState<string>('')
  const debouncedSearch = useDebounce(noteSearch, 300);

  const { data: notesPage, isPending: isNotesLoading } = useQuery({
    queryKey: ['userNotes', user?.id, debouncedSearch],
    queryFn: () => getUserNotes({ userId: user?.id!, search: debouncedSearch }),
    enabled: !!user?.id,
  })

  const { data: subjectsPage, isPending: isSubjectsLoading } = useQuery({
    queryKey: ['userSubjects', user?.id],
    queryFn: () => getUserSubjects({ userId: user?.id! }),
    enabled: !!user?.id,
  })

  const filteredNotes = notesPage?.content
    .slice()
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const addUserNote = async () => {

    if (!user) return;

    const newNote: CreateNoteParams = {
      userId: user.id,
      isPinned: false,
      content: '{"type":"doc","content":[{"type":"paragraph"}]}'
    }

    try {
      await createNote(newNote)
      await queryClient.invalidateQueries({
        queryKey: ['userNotes', user?.id],
        refetchType: 'all'
      })
    } catch (error) {
      console.error("Erro ao criar nova nota:", error);
    }
  }

  const updateUserNote = async (updatedNote: UpdateNoteParams) => {
    try {
      await updateNote(updatedNote)
    } catch (error) {
      console.error("Erro ao atualizar nota:", error);
    }
  }

  const deleteUserNote = async (noteId: string) => {
    try {
      await deleteNote({ noteId })
      await queryClient.invalidateQueries({
        queryKey: ['userNotes', user?.id],
        refetchType: 'all'
      })
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  }

  return (
    <div className='grid-stack-item' gs-id="notes" gs-w="2" gs-h="4" ref={ref}>
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
            {filteredNotes?.length === 0 ? (
              <div className='h-full'>
                <Card className="flex items-center justify-center h-full p-4 text-center text-neutral-500 dark:bg-neutral-900/40 shadow-none">
                  Adicione suas notas rápidas aqui para acessá-las facilmente!
                </Card>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-3">
                  {filteredNotes?.map(note => (
                    <UserNote subjects={subjectsPage?.content} key={note.id} updateUserNote={updateUserNote} deleteUserNote={deleteUserNote} note={note} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default NotesGridItem