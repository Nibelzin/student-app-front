import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusSession } from '@/context/FocusSessionContext'
import { updateActivity, getActivities } from '@/api/activitiyService'
import { useCurrentUser } from '@/hooks/use-user'
import type { Activity, CheckListItem } from '@/types/types'
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

export default function FocusSessionTimer() {
    const { remainingSeconds, totalSeconds, selectedActivity, completeActivity, endSession, updateSelectedActivity, selectNewActivity } = useFocusSession()
    const queryClient = useQueryClient()
    const { data: user } = useCurrentUser()
    const [pickedActivityId, setPickedActivityId] = useState<string>('none')

    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id, 'pending'],
        queryFn: () => getActivities({ userId: user!.id, isCompleted: false, page: 0, size: 50 }),
        enabled: !!user?.id && !selectedActivity,
    })
    const activities = activitiesPage?.content ?? []

    function handleAttachActivity() {
        const activity = activities.find((a: Activity) => a.id === pickedActivityId) ?? null
        selectNewActivity(activity)
    }

    const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    const { mutate: toggleCheckItem } = useMutation({
        mutationFn: ({ index, isDone }: { index: number; isDone: boolean }) => {
            if (!selectedActivity?.checklist) return Promise.reject(new Error('No checklist found'))
            const updated: CheckListItem[] = selectedActivity.checklist.map((item, i) =>
                i === index ? { ...item, isDone } : item
            )
            return updateActivity({ id: selectedActivity.id, checklist: updated })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            if (selectedActivity) {
                updateSelectedActivity(selectedActivity.id)
            }
        },
    })

    return (
        <div className="flex flex-col gap-5">
            {/* Circular timer */}
            <div className="flex justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-secondary"
                        />
                        <circle
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="text-primary transition-all duration-1000"
                        />
                    </svg>
                    <span className="text-3xl font-mono font-bold tabular-nums">
                        {formatTime(remainingSeconds)}
                    </span>
                </div>
            </div>

            {/* Attach activity (when none selected) */}
            {!selectedActivity && activities.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Vincular atividade</span>
                    <div className="flex gap-2">
                        <Select value={pickedActivityId} onValueChange={setPickedActivityId}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecionar atividade..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {activities.map((a: Activity) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        <span className="truncate max-w-[220px]">{a.title}</span>
                                        {a.subjectName && (
                                            <span className="text-muted-foreground ml-2 text-xs">{a.subjectName}</span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            disabled={pickedActivityId === 'none'}
                            onClick={handleAttachActivity}
                        >
                            Vincular
                        </Button>
                    </div>
                </div>
            )}

            {/* Activity card */}
            {selectedActivity && (
                <div className="border rounded-lg p-4 flex flex-col gap-3 bg-muted/30">
                    <div>
                        <p className="font-semibold text-sm">{selectedActivity.title}</p>
                        {selectedActivity.subjectName && (
                            <p className="text-xs text-muted-foreground">{selectedActivity.subjectName}</p>
                        )}
                        {selectedActivity.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {selectedActivity.description}
                            </p>
                        )}
                    </div>

                    {/* Checklist */}
                    {selectedActivity.checklist && selectedActivity.checklist.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            {selectedActivity.checklist.map((item, i) => (
                                <button
                                    key={i}
                                    className="flex items-center gap-2 text-left text-sm hover:opacity-80 transition-opacity"
                                    onClick={() => toggleCheckItem({ index: i, isDone: !item.isDone })}
                                >
                                    {item.isDone
                                        ? <CheckSquare size={16} className="text-primary shrink-0" />
                                        : <Square size={16} className="text-muted-foreground shrink-0" />
                                    }
                                    <span className={item.isDone ? 'line-through text-muted-foreground' : ''}>
                                        {item.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = (rect.left + rect.width / 2) / window.innerWidth
                            const y = (rect.top + rect.height / 2) / window.innerHeight
                            completeActivity({ x, y})
                        }}
                    >
                        Concluir Atividade
                    </Button>
                </div>
            )}

            <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={() => endSession()}
            >
                <X size={14} className="mr-1" />
                Encerrar Sessão
            </Button>
        </div>
    )
}
