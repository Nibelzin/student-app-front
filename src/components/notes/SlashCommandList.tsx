import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { SlashCommandItem } from '@/types/slashCommand'

interface SlashCommandListProps extends SuggestionProps {
    items: SlashCommandItem[]
}

export interface SlashCommandListRef {
    onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command(item)
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (!props.items.length) {
                return false
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault()
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                event.preventDefault()
                enterHandler()
                return true
            }

            return false
        }
    }))

    return (
        <Command className="w-72 rounded-md border bg-background text-foreground shadow-lg">
            <CommandList>
                <CommandEmpty>Nenhum comando encontrado</CommandEmpty>
                <CommandGroup>
                    {props.items.map((item, index) => (
                        <CommandItem
                            key={item.title}
                            value={item.title}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onSelect={() => selectItem(index)}
                            className={`flex items-start gap-2 ${index === selectedIndex ? 'bg-accent text-accent-foreground' : ''}`}
                        >
                            <item.icon className="mt-1 h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-medium">{item.title}</span>
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
})

SlashCommandList.displayName = 'SlashCommandList'

export default SlashCommandList
