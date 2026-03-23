import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Toggle } from '../ui/toggle'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActivities } from '@/api/activitiyService'
import type { Activity, Page, User } from '@/types/types'
import ActivityItem from './ActivityItem'

interface NextActivitiesProps {
    user: User | undefined
}

const NextActivities = ({ user }: NextActivitiesProps) => {
    const navigate = useNavigate()
    const [isCompleted, setIsCompleted] = useState<boolean | undefined>(false)
    const [isOverdue, setIsOverdue] = useState<boolean | undefined>(undefined)

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id, isCompleted, isOverdue],
        queryFn: () => getActivities({
            userId: user?.id,
            isCompleted: isCompleted,
            isOverdue: isOverdue,
            size: 5
        }),
        enabled: !!user?.id
    })

    const activities = activitiesPage?.content || []

    return (
        <>
            <div className='flex gap-2 mb-2'>
                <Toggle
                    size="sm"
                    pressed={isCompleted === true}
                    onPressedChange={(pressed) => {
                        setIsCompleted(pressed ? true : false)
                    }}
                    aria-label="Toggle pending"
                    className='text-xs h-7'
                >
                    <CheckCircle2 size={14} className="mr-1" /> Concluidas
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={isOverdue === true}
                    onPressedChange={(pressed) => setIsOverdue(pressed ? true : undefined)}
                    aria-label="Toggle overdue"
                    className='text-xs h-7'
                >
                    <AlertCircle size={14} className="mr-1" /> Atrasadas
                </Toggle>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-8">
                        <CheckCircle2 size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Tudo certo por aqui 😃</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 pb-2">
                        {activities.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(activity => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default NextActivities