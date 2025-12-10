import { useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Card } from '../ui/card'
import type { Note, Subject } from '@/types/types'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extensions'
import Mention from '@tiptap/extension-mention'
import suggestion, { createSuggestion } from '../../lib/suggestion.ts'
import type { UpdateNoteParams } from '@/api/notesService.ts'
import { useDebouncedCallback } from '@/hooks/use-debounce.ts'
import SlashCommand from '@/lib/slashCommand.ts'
import { safeParseNoteContent } from '@/lib/utils.ts'
import { useNavigate } from 'react-router'

interface UserNoteProps {
    note: Note
    subjects: Subject[] | undefined
    deleteUserNote: (noteId: string) => void
    updateUserNote: (updateUserNote: UpdateNoteParams) => Promise<void>
}


const UserNote = ({ note, subjects, deleteUserNote, updateUserNote }: UserNoteProps) => {
    const navigate = useNavigate();

    const parsedContent = useMemo(() => safeParseNoteContent(note.content), [note.content])

    const debouncedUpdate = useDebouncedCallback(updateUserNote, 500);

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
                suggestion: createSuggestion(subjects ?? [])
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
            className="p-4 bg-white dark:bg-neutral-900/40 shadow-none"
        >
            <div className='flex flex-col justify-between'>
                <div className='w-full h-full'>
                    <EditorContent editor={editor} />
                </div>
                <div className='flex justify-between'>
                    <p className='text-xs'>{format(note.updatedAt, 'dd/MM/yyyy HH:mm')}</p>
                    <Trash2 className='cursor-pointer' size={16} onClick={() => deleteUserNote(note.id)} />
                </div>
            </div>
        </Card>
    )
}

export default UserNote