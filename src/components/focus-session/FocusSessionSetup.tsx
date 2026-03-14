import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
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

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60]

function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`
    return `${minutes / 60}h`
}

export default function FocusSessionSetup() {
    const { startSession } = useFocusSession()
    const { data: user } = useCurrentUser()
    const [durationIndex, setDurationIndex] = useState(4) // 25 min default
    const [selectedActivityId, setSelectedActivityId] = useState<string>('none')

    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id, 'pending'],
        queryFn: () => getActivities({ userId: user!.id, isCompleted: false, page: 0, size: 50 }),
        enabled: !!user?.id,
    })

    const activities = activitiesPage?.content ?? []
    const selectedMinutes = DURATION_OPTIONS[durationIndex]
    const selectedActivity = activities.find((a: Activity) => a.id === selectedActivityId) ?? null

    function handleStart() {
        startSession(selectedMinutes, selectedActivity)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Duration picker */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Duração</span>
                    <span className="text-2xl font-bold">{formatDuration(selectedMinutes)}</span>
                </div>
                <Slider
                    min={0}
                    max={DURATION_OPTIONS.length - 1}
                    step={1}
                    value={[durationIndex]}
                    onValueChange={([val]) => setDurationIndex(val)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(DURATION_OPTIONS[0])}</span>
                    <span>{formatDuration(DURATION_OPTIONS[Math.floor(DURATION_OPTIONS.length / 2)])}</span>
                    <span>{formatDuration(DURATION_OPTIONS[DURATION_OPTIONS.length - 1])}</span>
                </div>
            </div>

            {/* Activity picker */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">Atividade (opcional)</span>
                <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecionar atividade..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhuma atividade</SelectItem>
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

            <Button onClick={handleStart} className="w-full gap-2">
                <Play size={16} />
                Iniciar Sessão
            </Button>
        </div>
    )
}
