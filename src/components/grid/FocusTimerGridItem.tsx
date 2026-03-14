import { GripVertical, Timer } from 'lucide-react'
import React, { forwardRef, useState } from 'react'
import { Button } from '../ui/button'
import type { User } from '@/types/types'
import type { QueryClient } from '@tanstack/react-query'
import FocusSessionPopup from '../focus-session/FocusSessionPopup'

interface FocusTimerGridItemProps {
    user: User | undefined
    queryClient: QueryClient
}

const FocusTimerGridItem = forwardRef<HTMLDivElement, FocusTimerGridItemProps>(({ user, queryClient }, ref) => {

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <FocusSessionPopup isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} user={user} />
            <div className='grid-stack-item' gs-id="focus-timer" gs-w="6" gs-h="8" ref={ref}>
                <div className='grid-stack-item-content bg-background flex flex-col border rounded-sm overflow-hidden'>
                    <div className='flex items-center justify-between mb-0 p-3 gap-2'>
                        <div className='flex items-center gap-2'>
                            <GripVertical size={20} className='handle cursor-pointer' />
                            <h2 className="text-sm font-semibold uppercase tracking-wide">Foco</h2>
                        </div>
                    </div>
                    <div className='p-3 pb-10 flex-1 flex flex-col justify-between'>
                        <div className='w-full flex h-full justify-center items-center'>
                            <Timer size={64} />
                        </div>
                        <div>
                            <Button variant="outline" className='w-full cursor-pointer' onClick={() => setIsDialogOpen(true)}>
                                Iniciar Sessão de Foco
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

export default FocusTimerGridItem