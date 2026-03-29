import { updateAssessment } from '@/api/assessmentService'
import type { Assessment } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card';
import { format, isFuture } from 'date-fns';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar, Loader2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';

const AssessmentItem = ({ assessment }: { assessment: Assessment }) => {
    const queryClient = useQueryClient()
    const [isGrading, setIsGrading] = useState(false)
    const [gradeInput, setGradeInput] = useState('')

    const { mutate: saveGrade, isPending } = useMutation({
        mutationFn: () => updateAssessment({ id: assessment.id, grade: parseFloat(gradeInput) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAssessments'] })
            setIsGrading(false)
            setGradeInput('')
        },
    })

    return (
        <Card className="shadow-none rounded-sm">
            <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{assessment.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3" />
                        {format(new Date(assessment.assessmentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                    {assessment.grade != null ? (
                        <span className="text-sm font-semibold">
                            {assessment.grade}{assessment.maxGrade != null ? ` / ${assessment.maxGrade}` : ''}
                        </span>
                    ) : isGrading ? (
                        <>
                            <Input
                                type="number"
                                className="w-20 h-7 text-sm"
                                placeholder="Nota"
                                value={gradeInput}
                                onChange={e => setGradeInput(e.target.value)}
                                autoFocus
                            />
                            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => saveGrade()} disabled={isPending || !gradeInput}>
                                {isPending ? <Loader2 className="size-3 animate-spin" /> : 'Salvar'}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setIsGrading(false)}>
                                Cancelar
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="text-xs text-muted-foreground">
                                {isFuture(new Date(assessment.assessmentDate)) ? 'Agendada' : 'Sem nota'}
                            </span>
                            {!isFuture(new Date(assessment.assessmentDate)) && (
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setIsGrading(true)}>
                                    Lançar nota
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default AssessmentItem