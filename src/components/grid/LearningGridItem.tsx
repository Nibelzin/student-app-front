import { getActivities, updateActivity, deleteActivity, getMaterialsByActivity } from '@/api/activitiyService'
import { GripVertical, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ClockIcon, Plus, ExternalLink, Pencil, Trash2, Loader2, LinkIcon, FileIcon, CalendarIcon, Paperclip, X } from 'lucide-react'
import React, { forwardRef, useState } from 'react'
import { Card } from '../ui/card'
import type { User, Activity, Material, CheckListItem } from '@/types/types'
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import { Toggle } from '../ui/toggle'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../ui/button'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router'
import AddActivityPopup from '../activity/AddActivityPopup'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import NextActivities from '../activity/NextActivities'
import NextAssessments from '../assessment/NextAssessments'

interface LearningGridItemProps {
    user: User | undefined
    queryClient: QueryClient
}

const LearningGridItem = forwardRef<HTMLDivElement, LearningGridItemProps>(({ user, queryClient }, ref) => {
    const navigate = useNavigate()

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <AddActivityPopup
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                user={user}
            />
            <div className='grid-stack-item' gs-id="activities" gs-w="4" gs-min-w="2" gs-max-h="6" gs-h="4" ref={ref}>
                <div className='grid-stack-item-content bg-background rounded-sm shadow-none border flex flex-col p-3'>
                            <Tabs defaultValue='activities' className='w-full h-full gap-4'>
                                <div className='flex w-full items-center justify-between gap-2 border-accent'>
                                    <div className='flex items-center gap-2'>
                                        <GripVertical size={20} className='handle cursor-pointer text-neutral-400' />
                                        <TabsList variant="line" className='w-full p-0 m-0 h-fit gap-2'>
                                            <TabsTrigger value='activities' className='p-0 m-0 h-fit'>PRÓXIMAS ATIVIDADES</TabsTrigger>
                                            <TabsTrigger value='assessments' className='p-0 m-0 h-fit'>PRÓXIMAS AVALIAÇÕES</TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <div className='flex gap-4'>
                                            <Plus
                                                className='cursor-pointer hover:text-blue-500 transition-colors'
                                                size={20}
                                                onClick={() => setIsDialogOpen(true)}
                                            />
                                            <ExternalLink className='cursor-pointer hover:text-blue-500 transition-colors' size={20} onClick={() => navigate('/activities')} />
                                        </div>
                                    </div>
                                </div>
                                <TabsContent value='activities'>
                                    <NextActivities user={user} />
                                </TabsContent>
                                <TabsContent value='assessments'>
                                    <NextAssessments user={user} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
        </>
    )
})

export default LearningGridItem
