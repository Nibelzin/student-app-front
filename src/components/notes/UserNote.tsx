import { useEditor, EditorContent } from '@tiptap/react'
import { Card } from '../ui/card'
import type { Note } from '@/types/types'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extensions'
import Mention from '@tiptap/extension-mention'
import suggestion from '../../lib/suggestion.ts'

interface UserNoteProps {
    note: Note
    notes: Note[]
    setUserNotes: (notes: Note[]) => void
    deleteUserNote: (noteId: string) => void
}


const UserNote = ({ note, setUserNotes, notes, deleteUserNote }: UserNoteProps) => {

    const updateNote = (content: any) => {
        const newNotes = notes.map(oldNote => {
            if (oldNote.id === note.id) {
                return { ...note, content: JSON.stringify(content) }
            }
            return oldNote
        })

        setUserNotes(newNotes)
    }

    const editor = useEditor({
        onUpdate: ({ editor }) => {
            updateNote(editor.getJSON())
            console.log(editor.getText())
        },
        extensions: [
            StarterKit,
            Highlight,
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
                    return ['span', { class: 'mention' }, `@${node.attrs.label ?? node.attrs.id}`]
                },
                suggestion
            })
        ],
        content: JSON.parse(note.content),
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none dark:prose-invert min-h-36 max-h-96 overflow-hidden hover:overflow-y-auto'
            },
        }
    })

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
                    <p className='text-xs'>{format(note.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                    <Trash2 className='cursor-pointer' size={16} onClick={() => deleteUserNote(note.id)} />
                </div>
            </div>
        </Card>
    )
}

export default UserNote