import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance } from 'tippy.js'
import { SUBJECTS_PLACEHOLDER } from "./mock";
import SubjectsList from "@/components/notes/SubjectsList";
import type { SuggestionOptions } from "@tiptap/suggestion";
import 'tippy.js/animations/scale.css'

export const suggestion: Omit<SuggestionOptions, 'editor'> = {
    items: ({ query }: { query: string }) => {
        return SUBJECTS_PLACEHOLDER.filter(subject => subject.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
    },

    render: () => {
        let component: ReactRenderer;
        let popup: Instance[];

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(SubjectsList, {
                    props,
                    editor: props.editor
                })

                if (!props.clientRect){
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
                component.updateProps(props);

                if (!props.clientRect){
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect
                })
            },

            onKeyDown(props: any & { event: KeyboardEvent }) {
                if(props.event.key === 'Escape'){
                    popup[0].hide();
                    return true
                }

                return(component.ref as any)?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            }
        }
    }
}

export default suggestion;