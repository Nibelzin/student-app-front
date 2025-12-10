import { NEXT_ACTIVITIES_PLACEHOLDER } from '@/lib/mock'
import { GripVertical } from 'lucide-react'
import React, { forwardRef } from 'react'
import { Card } from '../ui/card'
import type { User } from '@/types/types'
import type { QueryClient } from '@tanstack/react-query'

interface ActivitiesGridItemProps {
    user: User | undefined
    queryClient: QueryClient
}

const ActivitiesGridItem = forwardRef<HTMLDivElement, ActivitiesGridItemProps>(({ user, queryClient }, ref) => {
    return (
        <div className='grid-stack-item' gs-id="activities" gs-w="4" gs-min-w="2" gs-max-h="6" gs-h="4" ref={ref}>
            <div className='grid-stack-item-content bg-white p-4 rounded-md border'>
                <div className='flex items-center mb-4 gap-2'>
                    <GripVertical size={20} className='handle cursor-pointer' />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Próximas atividades</h2>
                </div>
                {NEXT_ACTIVITIES_PLACEHOLDER.length === 0 ? (
                    <div className="lg:col-span-2">
                        <Card className="flex items-center justify-center h-64 bg-neutral-50 p-4 text-center text-neutral-500 dark:bg-neutral-900/40">
                            Nenhuma atividade próxima
                        </Card>
                    </div>
                ) : (
                    <div className="lg:col-span-2">
                        <div className="flex flex-col gap-3">
                            {NEXT_ACTIVITIES_PLACEHOLDER.map(activity => (
                                <Card
                                    key={activity.id}
                                    className="flex flex-col p-4 dark:bg-neutral-900/40 shadow-none"
                                >
                                    <p className=''>{activity.title}</p>
                                    <p className='text-lg'>{activity.description}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})

export default ActivitiesGridItem