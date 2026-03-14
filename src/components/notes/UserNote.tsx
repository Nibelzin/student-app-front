import { useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Card } from '../ui/card'
import type { Activity, Note, Subject } from '@/types/types'
import { Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extensions'
import Mention from '@tiptap/extension-mention'
import suggestion, { createSuggestion } from '../../lib/suggestion.ts'
import { updateNote, deleteNote, type UpdateNoteParams } from '@/api/noteService.ts'
import { useDebouncedCallback } from '@/hooks/use-debounce.ts'
import SlashCommand from '@/lib/slashCommand.ts'
import { safeParseNoteContent } from '@/lib/utils.ts'
import { useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UserNoteProps {
    note: Note
    subjects: Subject[] | undefined
    activities: Activity[] | undefined
}


const UserNote = ({ note, subjects, activities }: UserNoteProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    const parsedContent = useMemo(() => safeParseNoteContent(note.content), [note.content])

    const { mutate: performUpdate, isPending: isSaving } = useMutation({
        mutationFn: updateNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotes'] })
        }
    })

    const { mutate: performDelete, isPending: isDeleting } = useMutation({
        mutationFn: (noteId: string) => deleteNote({ noteId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotes'] })
        }
    })

    const debouncedUpdate = useDebouncedCallback((updatedNote: UpdateNoteParams) => {
        performUpdate(updatedNote)
    }, 500);

    const editor = useEditor({
        onUpdate: ({ editor }) => {
            const updatedNote: UpdateNoteParams = {
                noteId: note.id,
                content: JSON.stringify(editor.getJSON()),
                isPinned: note.isPinned
            }
            debouncedUpdate(updatedNote)
        },
        extensions: [
            StarterKit,
            Highlight,
            SlashCommand,
            Placeholder.configure({
                placeholder: 'Escreva sua anotação aqui...',
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention color-gray-500',
                },
                renderText({ options, node }) {
                    return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
                },
                renderHTML({ node }) {
                    return ['a', { class: 'mention', 'data-subject-id': node.attrs.id }, `@${node.attrs.label ?? node.attrs.id}`]
                },
                suggestion: createSuggestion(subjects ?? [], activities ?? [])
            })
        ],
        content: parsedContent,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none dark:prose-invert min-h-36 max-h-96 overflow-hidden hover:overflow-y-auto'
            },
            handleClick: (view, pos, event) => {
                const target = event.target as HTMLElement;
                if (target.classList.contains('mention')) {
                    const subjectId = target.getAttribute('data-subject-id');
                    if (subjectId) {
                        event.preventDefault()
                        navigate(`/subject/${subjectId}`);
                        return true;
                    }
                }
                return false;
            }

        }
    }, [subjects]);

    return (
        <Card
            key={note.id}
            className="p-4 dark:bg-neutral-900/40 shadow-none"
        >
            <div className='flex flex-col justify-between min-h-96'>
                <div className='w-full h-full'>
                    <EditorContent editor={editor} />
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <p className='text-xs'>{format(note.updatedAt, 'dd/MM/yyyy HH:mm')}</p>
                        {isSaving && <span className='text-[10px] text-neutral-400 flex items-center gap-1'><Loader2 size={10} className='animate-spin' /> Salvando...</span>}
                    </div>
                    {isDeleting ? <Loader2 size={16} className='animate-spin text-red-500' /> : <Trash2 className='cursor-pointer hover:text-red-500 transition-colors' size={16} onClick={() => performDelete(note.id)} />}
                </div>
            </div>
        </Card>
    )
}

export default UserNote