import { GripVertical } from 'lucide-react'
import React, { forwardRef } from 'react'

const FocusTimerGridItem = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <div className='grid-stack-item' gs-id="focus-timer" gs-w="6" gs-h="8" ref={ref}>
            <div className='grid-stack-item-content bg-background flex flex-col border rounded-sm overflow-hidden'>
                <div className='flex items-center justify-between mb-0 p-3 gap-2'>
                    <div className='flex items-center gap-2'>
                        <GripVertical size={20} className='handle cursor-pointer' />
                        <h2 className="text-sm font-semibold uppercase tracking-wide">Foco</h2>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default FocusTimerGridItem