import { useMemo } from 'react'
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday, format
} from 'date-fns'
import { cn } from '@/lib/utils'

export type CalendarEventType = 'activity' | 'assessment' | 'planner'

export type CalendarEvent = {
    id: string
    title: string
    date: Date
    endDate?: Date
    type: CalendarEventType
    color?: string
    subjectName?: string
}

const EVENT_STYLES: Record<CalendarEventType, string> = {
    activity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    assessment: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    planner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
}

const EVENT_DOT_STYLES: Record<CalendarEventType, string> = {
    activity: 'bg-blue-500',
    assessment: 'bg-red-500',
    planner: 'bg-emerald-500',
}

interface CalendarGridProps {
    currentDate: Date
    events: CalendarEvent[]
    selectedDate?: Date | null
    onDayClick: (date: Date) => void
    onEventClick: (event: CalendarEvent) => void
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MAX_VISIBLE_EVENTS = 2

export function CalendarGrid({ currentDate, events, selectedDate, onDayClick, onEventClick }: CalendarGridProps) {
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
        return eachDayOfInterval({ start: calStart, end: calEnd })
    }, [currentDate])

    const eventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        for (const event of events) {
            const key = format(new Date(event.date), 'yyyy-MM-dd')
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(event)
        }
        return map
    }, [events])

    return (
        <div className="bg-card rounded-lg border overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b bg-muted/30">
                {WEEKDAY_LABELS.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = eventsByDay.get(dayKey) || []
                    const isCurrentMonth = isSameMonth(day, currentDate)
                    const isCurrentDay = isToday(day)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const overflow = dayEvents.length - MAX_VISIBLE_EVENTS

                    return (
                        <div
                            key={dayKey}
                            className={cn(
                                "min-h-[110px] border-b border-r p-1.5 cursor-pointer transition-colors hover:bg-accent/50",
                                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                                isSelected && "bg-accent/70 ring-2 ring-primary/30 ring-inset",
                            )}
                            onClick={() => onDayClick(day)}
                        >
                            <div className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-full text-sm mb-1",
                                isCurrentDay && "bg-primary text-primary-foreground font-semibold",
                            )}>
                                {format(day, 'd')}
                            </div>

                            {/* Desktop: event pills */}
                            <div className="hidden sm:block space-y-0.5">
                                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                                    <button
                                        key={`${event.type}-${event.id}`}
                                        className={cn(
                                            "w-full text-left text-xs px-1.5 py-0.5 rounded truncate block font-medium",
                                            event.type === 'planner' && event.color
                                                ? 'rounded'
                                                : EVENT_STYLES[event.type],
                                        )}
                                        style={
                                            event.type === 'planner' && event.color
                                                ? { backgroundColor: event.color + '20', color: event.color }
                                                : undefined
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onEventClick(event)
                                        }}
                                    >
                                        {event.title}
                                    </button>
                                ))}
                                {overflow > 0 && (
                                    <span className="text-xs text-muted-foreground pl-1.5">
                                        +{overflow} mais
                                    </span>
                                )}
                            </div>

                            {/* Mobile: colored dots */}
                            <div className="sm:hidden flex gap-0.5 flex-wrap">
                                {dayEvents.slice(0, 4).map((event) => (
                                    <div
                                        key={`${event.type}-${event.id}`}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            event.type === 'planner' && event.color
                                                ? ''
                                                : EVENT_DOT_STYLES[event.type],
                                        )}
                                        style={
                                            event.type === 'planner' && event.color
                                                ? { backgroundColor: event.color }
                                                : undefined
                                        }
                                    />
                                ))}
                                {dayEvents.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground leading-none">
                                        +{dayEvents.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
