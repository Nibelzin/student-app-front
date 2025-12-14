import type { Activity, Subject } from '@/types/types';
import type { SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface SubjectsListProps extends SuggestionProps {
    items: (Subject | Activity)[]
}

export interface SubjectsListRef {
    onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const SubjectsList = forwardRef<SubjectsListRef, SubjectsListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const isSubject = (item: Subject | Activity): item is Subject => {
        return 'periodId' in item;
    }

    const getItemLabel = (item: Subject | Activity) => {
        if (isSubject(item)) {
            return item.name;
        }
        return item.title;
    }

    const getItemColor = (item: Subject | Activity) => {
        if (isSubject(item)) {
            return item.color;
        }
        // Return a default color or handle activity coloring if needed
        return '#6b7280'; // gray-500
    }

    const subjects = props.items.filter(isSubject);
    const activities = props.items.filter((item): item is Activity => !isSubject(item));
    const sortedItems = [...subjects, ...activities];

    const selectedItem = (index: number) => {
        const item = sortedItems[index];

        if (item) {
            props.command({
                id: item.id,
                label: getItemLabel(item),
                color: getItemColor(item)
            });
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + sortedItems.length - 1) % sortedItems.length);
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % sortedItems.length);
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
                <>
                    {subjects.length > 0 && (
                        <>
                            <p className='text-xs text-neutral-500 px-2 py-1'>Matérias</p>
                            {subjects.map((item: Subject, index) => (
                                <button
                                    className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
                                    key={item.id}
                                    onClick={() => selectedItem(index)}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full mr-2"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    {item.name}
                                </button>
                            ))}
                        </>
                    )}

                    {activities.length > 0 && (
                        <>
                            <p className='text-xs text-neutral-500 px-2 py-1 mt-2'>Atividades</p>
                            {activities.map((item, index) => {
                                const globalIndex = index + subjects.length;
                                return (
                                    <button
                                        className={`item ${globalIndex === selectedIndex ? 'is-selected' : ''}`}
                                        key={item.id}
                                        onClick={() => selectedItem(globalIndex)}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full mr-2 bg-gray-400"
                                        />
                                        {item.title}
                                    </button>
                                );
                            })}
                        </>
                    )}
                </>
            ) : (
                <div className="item">Nenhum resultado</div>
            )}
        </div>
    )
})

export default SubjectsList