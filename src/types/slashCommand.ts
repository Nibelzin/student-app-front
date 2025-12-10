import type { Editor, Range } from '@tiptap/core'
import type { LucideIcon } from 'lucide-react'

export interface SlashCommandItem {
    title: string
    description: string
    keywords: string[]
    icon: LucideIcon
    action: ({ editor, range }: { editor: Editor; range: Range }) => void | Promise<void>
}
