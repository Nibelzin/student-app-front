import type { Subject } from '@/types/types';
import type { SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface SubjectsListProps extends SuggestionProps {
    items: Subject[]
}

export interface SubjectsListRef {
    onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const SubjectsList = forwardRef<SubjectsListRef, SubjectsListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedItem = (index: number) => {
        const item = props.items[index];

        if (item) {
            props.command({ id: item.id, label: item.name, color: item.color });
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    }

    const enterHandler = () => {
        selectedItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true
            }

            return false
        }
    }))

    return (
        <div className="items">
            {props.items.length ? (
                props.items.map((item: Subject, index: number) => (
                    <button
                        className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
                        key={index}
                        onClick={() => selectedItem(index)}
                    >
                        {item.name}
                    </button>
                ))
            ) : (
                <div className="item">Nenhum resultado</div>
            )}
        </div>
    )
})

export default SubjectsList