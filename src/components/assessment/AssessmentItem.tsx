import { deleteAssessment, updateAssessment } from '@/api/assessmentService'
import type { Assessment, User } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '../ui/card';
import { format, isFuture } from 'date-fns';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar, Loader2, Pencil, Trash2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import AddAssessmentDialog from './AddAssessmentDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

interface AssessmentItemProps {
    assessment: Assessment
    user?: User
}

const AssessmentItem = ({ assessment, user }: AssessmentItemProps) => {
    const queryClient = useQueryClient()
    const [isGrading, setIsGrading] = useState(false)
    const [gradeInput, setGradeInput] = useState('')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const { mutate: saveGrade, isPending } = useMutation({
        mutationFn: () => updateAssessment({ id: assessment.id, grade: parseFloat(gradeInput) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAssessments'] })
            queryClient.invalidateQueries({ queryKey: ['assessments'] })
            setIsGrading(false)
            setGradeInput('')
        },
    })

    const { mutate: removeAssessment, isPending: isDeleting } = useMutation({
        mutationFn: () => deleteAssessment(assessment.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] })
            queryClient.invalidateQueries({ queryKey: ['userAssessments'] })
            setIsDeleteDialogOpen(false)
        },
    })

    return (
        <>
            <Card className="shadow-none rounded-sm py-0">
                <CardContent className="py-3 px-4 h-full flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 flex flex-col justify-between h-full gap-4">
                            <div>
                                <p className="font-medium text-sm">{assessment.title}</p>
                                <p className="text-xs text-neutral-500">{assessment.subjectName}</p>
                            </div>
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
                                    {!isFuture(new Date(assessment.assessmentDate)) ? (
                                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setIsGrading(true)}>
                                            Lançar nota
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Agendada
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsEditDialogOpen(true)}
                        >
                            <Pencil size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AddAssessmentDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                user={user}
                assessment={assessment}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Prova</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{assessment.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => removeAssessment()}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default AssessmentItem
