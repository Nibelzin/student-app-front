import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import { Card } from '../ui/card'
import type { Note } from '@/types/types'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extensions'
import Mention from '@tiptap/extension-mention'
import suggestion from '../../lib/suggestion.ts'


const UserNote = (note: Note) => {

    const editor = useEditor({
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
        content: note.content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none dark:prose-invert min-h-36 max-h-96 overflow-auto'
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
                    <Trash2 className='cursor-pointer' size={16} />
                </div>
            </div>
        </Card>
    )
}

export default UserNote