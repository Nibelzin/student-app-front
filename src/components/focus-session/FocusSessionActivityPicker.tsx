import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession } from '@/context/FocusSessionContext'
import { getActivities } from '@/api/activitiyService'
import { useCurrentUser } from '@/hooks/use-user'
import type { Activity } from '@/types/types'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

export default function FocusSessionActivityPicker() {
    const { remainingSeconds, selectNewActivity } = useFocusSession()
    const { data: user } = useCurrentUser()
    const [selectedActivityId, setSelectedActivityId] = useState<string>('none')

    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id, 'pending'],
        queryFn: () => getActivities({ userId: user!.id, isCompleted: false, page: 0, size: 50 }),
        enabled: !!user?.id,
    })

    const activities = activitiesPage?.content ?? []
    const selectedActivity = activities.find((a: Activity) => a.id === selectedActivityId) ?? null

    function handleConfirm() {
        selectNewActivity(selectedActivity)
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Completion feedback */}
            <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle2 size={40} className="text-primary" />
                <p className="font-semibold">Atividade concluída!</p>
                <p className="text-sm text-muted-foreground">
                    Timer: <span className="font-mono font-bold">{formatTime(remainingSeconds)}</span> restando
                </p>
            </div>

            {/* New activity picker */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                    Adicionar outra atividade?
                </span>
                <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecionar atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Continuar sem atividade</SelectItem>
                        {activities.map((activity: Activity) => (
                            <SelectItem key={activity.id} value={activity.id}>
                                <span className="truncate max-w-[300px]">{activity.title}</span>
                                {activity.subjectName && (
                                    <span className="text-muted-foreground ml-2 text-xs">
                                        {activity.subjectName}
                                    </span>
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleConfirm} className="w-full">
                Continuar
            </Button>
        </div>
    )
}
