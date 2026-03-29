import { getUserAssessments } from '@/api/userService'
import type { User } from '@/types/types'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Toggle } from '../ui/toggle'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import AssessmentItem from './AssessmentItem'

interface NextActivitiesProps {
    user: User | undefined
}


const NextAssessments = ({ user }: NextActivitiesProps) => {
    const navigate = useNavigate()
    const [isCompleted, setIsCompleted] = useState<boolean | undefined>(false)
    const [isOverdue, setIsOverdue] = useState<boolean | undefined>(undefined)

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data: assessmentsPage } = useQuery({
        queryKey: ['assessments', user?.id, isCompleted, isOverdue],
        queryFn: () => getUserAssessments(user?.id!),
        enabled: !!user?.id
    })

    const assessments = assessmentsPage?.content || []

    return (
        <>
            <div className='flex gap-2 mb-2'>
                <Toggle
                    size="sm"
                    pressed={isCompleted === true}
                    onPressedChange={(pressed) => {
                        setIsCompleted(pressed ? true : false)
                    }}
                    aria-label="Toggle pending"
                    className='text-xs h-7'
                >
                    <CheckCircle2 size={14} className="mr-1" /> Concluidas
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={isOverdue === true}
                    onPressedChange={(pressed) => setIsOverdue(pressed ? true : undefined)}
                    aria-label="Toggle overdue"
                    className='text-xs h-7'
                >
                    <AlertCircle size={14} className="mr-1" /> Atrasadas
                </Toggle>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                {assessments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-8">
                        <CheckCircle2 size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Tudo certo por aqui 😃</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 pb-2">
                        {assessments.map((assessment) => (
                            <AssessmentItem key={assessment.id} assessment={assessment} />
                        ))}

                    </div>
                )}
            </div>
        </>
    )
}

export default NextAssessments