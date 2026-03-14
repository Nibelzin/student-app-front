import { GripVertical, Timer } from 'lucide-react'
import React, { forwardRef } from 'react'
import { Button } from '../ui/button'
import { useFocusSession } from '@/context/FocusSessionContext'

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

const FocusTimerGridItem = forwardRef<HTMLDivElement>((_, ref) => {
    const { phase, remainingSeconds, selectedActivity, openPopup } = useFocusSession()
    const isRunning = phase === 'running'

    return (
        <div className='grid-stack-item' gs-id="focus-timer" gs-w="6" gs-h="8" ref={ref}>
            <div className='grid-stack-item-content bg-background flex flex-col border rounded-sm overflow-hidden'>
                <div className='flex items-center justify-between mb-0 p-3 gap-2'>
                    <div className='flex items-center gap-2'>
                        <GripVertical size={20} className='handle cursor-pointer' />
                        <h2 className="text-sm font-semibold uppercase tracking-wide">Foco</h2>
                    </div>
                </div>
                <div className='p-3 pb-10 flex-1 flex flex-col justify-between'>
                    <div className='w-full flex h-full justify-center items-center flex-col gap-2'>
                        {isRunning ? (
                            <>
                                <span className="text-4xl font-mono font-bold tabular-nums">
                                    {formatTime(remainingSeconds)}
                                </span>
                                {selectedActivity && (
                                    <span className="text-xs text-muted-foreground truncate max-w-full px-2 text-center">
                                        {selectedActivity.title}
                                    </span>
                                )}
                            </>
                        ) : (
                            <Timer size={64} />
                        )}
                    </div>
                    <div>
                        {isRunning ? (
                            <Button
                                variant="outline"
                                className='w-full cursor-pointer'
                                onClick={openPopup}
                            >
                                Ver Sessão
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className='w-full cursor-pointer'
                                onClick={openPopup}
                            >
                                Iniciar Sessão de Foco
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})

export default FocusTimerGridItem
