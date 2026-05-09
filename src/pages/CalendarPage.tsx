import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addMonths, subMonths, format, isSameDay, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, BookOpen, ClipboardList, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarGrid, type CalendarEvent, type CalendarEventType } from '@/components/calendar/CalendarGrid'
import AddPlannerEventDialog from '@/components/calendar/AddPlannerEventDialog'
import AddActivityDialog from '@/components/activity/AddActivityDialog'
import AddAssessmentDialog from '@/components/assessment/AddAssessmentDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/use-user'
import { getUserPlannerEvents, getUserAssessments } from '@/api/userService'
import { getActivities } from '@/api/activitiyService'
import type { Activity, Assessment, PlannerEvent } from '@/types/types'
import { cn } from '@/lib/utils'

const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
    activity: 'Atividade',
    assessment: 'Prova',
    planner: 'Evento',
}

const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
    activity: 'bg-blue-500',
    assessment: 'bg-red-500',
    planner: 'bg-emerald-500',
}

const EVENT_TYPE_STYLES: Record<CalendarEventType, string> = {
    activity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    assessment: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    planner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
}

type DialogState =
    | { type: 'none' }
    | { type: 'dayDetail'; date: Date }
    | { type: 'plannerEvent'; plannerEvent?: PlannerEvent; defaultDate?: Date }
    | { type: 'activity'; activity?: Activity }
    | { type: 'assessment'; assessment?: Assessment }

function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [dialogState, setDialogState] = useState<DialogState>({ type: 'none' })

    const { data: user } = useCurrentUser()

    const { data: activitiesPage, isLoading: isLoadingActivities } = useQuery({
        queryKey: ['activities', user?.id, 'calendar'],
        queryFn: () => getActivities({ userId: user?.id, size: 500 }),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    const { data: assessmentsPage, isLoading: isLoadingAssessments } = useQuery({
        queryKey: ['userAssessments', user?.id, 'calendar'],
        queryFn: () => getUserAssessments(user!.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    const { data: plannerEventsPage, isLoading: isLoadingPlannerEvents } = useQuery({
        queryKey: ['userPlannerEvents', user?.id],
        queryFn: () => getUserPlannerEvents(user!.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    const isLoading = isLoadingActivities || isLoadingAssessments || isLoadingPlannerEvents

    const calendarEvents: CalendarEvent[] = useMemo(() => {
        const events: CalendarEvent[] = []

        for (const activity of activitiesPage?.content ?? []) {
            events.push({
                id: activity.id,
                title: activity.title,
                date: new Date(activity.dueDate),
                type: 'activity',
                subjectName: activity.subjectName,
            })
        }

        for (const assessment of assessmentsPage?.content ?? []) {
            events.push({
                id: assessment.id,
                title: assessment.title,
                date: new Date(assessment.assessmentDate),
                type: 'assessment',
                subjectName: assessment.subjectName,
            })
        }

        for (const plannerEvent of plannerEventsPage?.content ?? []) {
            events.push({
                id: plannerEvent.id,
                title: plannerEvent.title,
                date: new Date(plannerEvent.startAt),
                endDate: new Date(plannerEvent.endAt),
                type: 'planner',
                color: plannerEvent.color,
                subjectName: plannerEvent.subjectName,
            })
        }

        return events
    }, [activitiesPage, assessmentsPage, plannerEventsPage])

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return []
        return calendarEvents.filter((e) => isSameDay(new Date(e.date), selectedDate))
    }, [calendarEvents, selectedDate])

    function handlePrevMonth() {
        setCurrentDate((prev) => subMonths(prev, 1))
    }

    function handleNextMonth() {
        setCurrentDate((prev) => addMonths(prev, 1))
    }

    function handleToday() {
        setCurrentDate(new Date())
    }

    function handleDayClick(date: Date) {
        setSelectedDate(date)
        setDialogState({ type: 'dayDetail', date })
    }

    function handleEventClick(event: CalendarEvent) {
        if (event.type === 'activity') {
            const activity = activitiesPage?.content.find((a) => a.id === event.id)
            if (activity) setDialogState({ type: 'activity', activity })
        } else if (event.type === 'assessment') {
            const assessment = assessmentsPage?.content.find((a) => a.id === event.id)
            if (assessment) setDialogState({ type: 'assessment', assessment })
        } else if (event.type === 'planner') {
            const plannerEvent = plannerEventsPage?.content.find((e) => e.id === event.id)
            if (plannerEvent) setDialogState({ type: 'plannerEvent', plannerEvent })
        }
    }

    function closeDialog() {
        setDialogState({ type: 'none' })
    }

    function handleCreateFromDay(eventType: CalendarEventType) {
        const date = dialogState.type === 'dayDetail' ? dialogState.date : new Date()
        setDialogState(
            eventType === 'planner'
                ? { type: 'plannerEvent', defaultDate: date }
                : eventType === 'activity'
                ? { type: 'activity' }
                : { type: 'assessment' }
        )
    }

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 md:p-8 mb-16">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-semibold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h1>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                        Hoje
                    </Button>
                </div>

                <Button onClick={() => setDialogState({ type: 'plannerEvent', defaultDate: new Date() })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Evento
                </Button>
            </header>

            {/* Legend */}
            <div className="flex gap-4 mb-4 flex-wrap">
                {(['activity', 'assessment', 'planner'] as CalendarEventType[]).map((type) => (
                    <div key={type} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <div className={cn("w-3 h-3 rounded-full", EVENT_TYPE_COLORS[type])} />
                        {EVENT_TYPE_LABELS[type]}
                    </div>
                ))}
            </div>

            {/* Calendar */}
            {isLoading ? (
                <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-md" />
                        ))}
                    </div>
                </div>
            ) : (
                <CalendarGrid
                    currentDate={currentDate}
                    events={calendarEvents}
                    selectedDate={selectedDate}
                    onDayClick={handleDayClick}
                    onEventClick={handleEventClick}
                />
            )}

            {/* Day Detail Dialog */}
            <Dialog
                open={dialogState.type === 'dayDetail'}
                onOpenChange={(open) => { if (!open) closeDialog() }}
            >
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogState.type === 'dayDetail' &&
                                format(dialogState.date, "d 'de' MMMM, EEEE", { locale: ptBR })
                            }
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDayEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Nenhum evento neste dia
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {selectedDayEvents.map((event) => (
                                <button
                                    key={`${event.type}-${event.id}`}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg transition-colors hover:opacity-80",
                                        event.type === 'planner' && event.color
                                            ? ''
                                            : EVENT_TYPE_STYLES[event.type],
                                    )}
                                    style={
                                        event.type === 'planner' && event.color
                                            ? { backgroundColor: event.color + '15', color: event.color }
                                            : undefined
                                    }
                                    onClick={() => handleEventClick(event)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "w-2 h-2 rounded-full shrink-0",
                                                event.type === 'planner' && event.color
                                                    ? ''
                                                    : EVENT_TYPE_COLORS[event.type],
                                            )}
                                            style={
                                                event.type === 'planner' && event.color
                                                    ? { backgroundColor: event.color }
                                                    : undefined
                                            }
                                        />
                                        <span className="font-medium text-sm">{event.title}</span>
                                    </div>
                                    {event.subjectName && (
                                        <p className="text-xs opacity-70 ml-4 mt-0.5">
                                            {event.subjectName}
                                        </p>
                                    )}
                                    <span className="text-xs opacity-60 ml-4">
                                        {EVENT_TYPE_LABELS[event.type]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-4 mt-2">
                        <p className="text-xs text-muted-foreground mb-2">Adicionar neste dia:</p>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateFromDay('planner')}
                            >
                                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                                Evento
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateFromDay('activity')}
                            >
                                <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                                Atividade
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateFromDay('assessment')}
                            >
                                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                                Prova
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Planner Event Dialog */}
            <AddPlannerEventDialog
                isOpen={dialogState.type === 'plannerEvent'}
                onClose={closeDialog}
                user={user}
                plannerEvent={dialogState.type === 'plannerEvent' ? dialogState.plannerEvent : undefined}
                defaultDate={dialogState.type === 'plannerEvent' ? dialogState.defaultDate : undefined}
            />

            {/* Activity Dialog (reusing existing) */}
            <AddActivityDialog
                isOpen={dialogState.type === 'activity'}
                onClose={closeDialog}
                user={user}
                activity={dialogState.type === 'activity' ? dialogState.activity : undefined}
            />

            {/* Assessment Dialog (reusing existing) */}
            <AddAssessmentDialog
                isOpen={dialogState.type === 'assessment'}
                onClose={closeDialog}
                user={user}
                assessment={dialogState.type === 'assessment' ? dialogState.assessment : undefined}
            />
        </main>
    )
}

export default CalendarPage
