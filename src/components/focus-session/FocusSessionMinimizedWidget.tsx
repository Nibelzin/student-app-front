import React from 'react'
import { Timer, Maximize2 } from 'lucide-react'
import { useFocusSession } from '@/context/FocusSessionContext'

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

export default function FocusSessionMinimizedWidget() {
    const { isMinimized, remainingSeconds, selectedActivity, maximizePopup } = useFocusSession()

    if (!isMinimized) return null

    return (
        <button
            onClick={maximizePopup}
            className="fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-full bg-background border shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        >
            <Timer size={18} className="text-primary shrink-0" />
            <div className="flex flex-col items-start leading-none">
                <span className="font-mono font-bold text-sm tabular-nums">
                    {formatTime(remainingSeconds)}
                </span>
                {selectedActivity && (
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {selectedActivity.title}
                    </span>
                )}
            </div>
            <Maximize2 size={14} className="text-muted-foreground shrink-0" />
        </button>
    )
}
