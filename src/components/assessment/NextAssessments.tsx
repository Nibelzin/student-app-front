import { getUserAssessments } from '@/api/userService'
import type { User } from '@/types/types'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Toggle } from '../ui/toggle'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import AssessmentItem from './AssessmentItem'
import { getAssessments } from '@/api/assessmentService'

interface NextActivitiesProps {
    user: User | undefined
}


const NextAssessments = ({ user }: NextActivitiesProps) => {
    const [isCompleted, setIsCompleted] = useState<boolean | undefined>(false)
    const [isOverdue, setIsOverdue] = useState<boolean | undefined>(undefined)


    const { data: assessmentsPage } = useQuery({
        queryKey: ['assessments', user?.id, isCompleted],
        queryFn: () => getAssessments({ 
            userId: user?.id,
            isCompleted: isCompleted
         }),
        enabled: !!user?.id
    })

    const assessments = assessmentsPage?.content || []
    const sortedAssessments = assessments.sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime())

    return (
        <div className='flex h-full flex-col'>
            <div className='flex gap-2 mb-2'>
                <Toggle
                    size="sm"
                    pressed = {isCompleted === true}
                    onPressedChange={(pressed) => {
                        setIsCompleted(pressed ? true : false)
                    }}
                    aria-label="Toggle pending"
                    className='text-xs h-7'
                >
                    <CheckCircle2 size={14} className="mr-1" /> Concluidas
                </Toggle>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {assessments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-8">
                        <CheckCircle2 size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Tudo certo por aqui 😃</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 pb-2">
                        {sortedAssessments.map((assessment) => (
                            <AssessmentItem key={assessment.id} assessment={assessment} />
                        ))}

                    </div>
                )}
            </div>
        </div>
    )
}

export default NextAssessments