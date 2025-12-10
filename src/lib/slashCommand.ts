import { Extension, type Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance } from 'tippy.js'
import SlashCommandList from '@/components/notes/SlashCommandList'
import type { Editor } from '@tiptap/core'
import { Code, Heading1, Heading2, List, ListOrdered, Minus, Quote, Sparkles, Type } from 'lucide-react'
import type { SlashCommandItem } from '@/types/slashCommand'
import { generateText } from '@/api/aiService'
import 'tippy.js/animations/scale.css'

const COMMANDS: SlashCommandItem[] = [
    {
        title: '/ai',
        description: 'Gerar texto com IA a partir de um prompt',
        keywords: ['ai', 'assistente', 'gerar', 'ia'],
        icon: Sparkles,
        action: async ({ editor, range }) => {
            const prompt = window.prompt('Digite o texto para a IA gerar uma nota:')

            // Remove o texto do comando mesmo que o usuário cancele
            editor.chain().focus().deleteRange(range).run()

            if (!prompt || !prompt.trim()) {
                return
            }

            const loadingDoc = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        attrs: { class: 'ai-loading' },
                        content: [{ type: 'text', text: 'IA pensando...' }]
                    }
                ]
            }

            try {
                editor.chain().focus().setContent(loadingDoc).run()

                const { generatedContent } = await generateText(prompt.trim())
                const contentToInsert = (generatedContent as any)?.content ?? generatedContent

                editor.chain().focus().setContent(contentToInsert as any).run()
            } catch (error) {
                console.error(error)
                window.alert('Não foi possível gerar o texto. Tente novamente.')
                editor.chain().focus().setContent({ type: 'doc', content: [] }).run()
            }
        }
    },
    {
        title: 'Parágrafo',
        description: 'Texto padrão contínuo',
        keywords: ['texto', 'paragrafo', 'p'],
        icon: Type,
        action: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setParagraph().run()
        }
    },
    {
        title: 'Título 1',
        description: 'Cabeçalho principal da nota',
        keywords: ['h1', 'cabecalho', 'titulo'],
        icon: Heading1,
        action: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
        }
    },
    {
        title: 'Título 2',
        description: 'Subtítulo da seção',
        keywords: ['h2', 'subtitulo', 'heading'],
        icon: Heading2,
        action: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
        }
    },
    {
        title: 'Lista',
        description: 'Lista com marcadores',
        keywords: ['lista', 'bullet', 'ul'],
        icon: List,
        action: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run()
        }
    },
    {
        title: 'Separador',
        description: 'Inserir uma linha horizontal',
        keywords: ['linha', 'separador', 'divider'],
        icon: Minus,
        action: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        }
    }
]

const SlashCommand = Extension.create({
    name: 'slash-command',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                items: ({ query }: { query: string }) => {
                    const normalizedQuery = query.toLowerCase()

                    return COMMANDS.filter((item) =>
                        item.title.toLowerCase().includes(normalizedQuery) ||
                        item.keywords.some((keyword) => keyword.includes(normalizedQuery))
                    ).slice(0, 6)
                },
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
                    props.action({ editor, range })
                },
                render: () => {
                    let component: ReactRenderer
                    let popup: Instance[]

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(SlashCommandList, {
                                props,
                                editor: props.editor
                            })

                            if (!props.clientRect) {
                                return
                            }

                            popup = tippy('body', {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                                animation: 'scale'
                            })
                        },

                        onUpdate(props: any) {
                            component.updateProps(props)

                            if (!props.clientRect) {
                                return
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect
                            })
                        },

                        onKeyDown(props: any & { event: KeyboardEvent }) {
                            if (props.event.key === 'Escape') {
                                popup?.[0]?.hide()
                                return true
                            }

                            return (component.ref as any)?.onKeyDown(props)
                        },

                        onExit() {
                            popup?.[0]?.destroy()
                            component.destroy()
                        }
                    }
                }
            }
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion
            })
        ]
    }
})

export default SlashCommand
