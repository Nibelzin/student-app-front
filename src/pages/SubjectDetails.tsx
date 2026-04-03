import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, isFuture, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BookOpen, Calendar, CheckCircle2, ChevronDown, ChevronUp, Circle,
  ClipboardList, ExternalLink, FileIcon, GraduationCap, Loader2, Pencil, Plus, TrendingUp, UserX,
} from 'lucide-react'
import { getSubjectDetails, getSubjectAbsenceLogs, getSubjectAssessments, getSubjectMaterials } from '@/api/subjectService'
import { getActivities, updateActivity } from '@/api/activitiyService'
import { createAbsenceLog } from '@/api/absenceLogService'
import { createAssessment, getAssessments, updateAssessment } from '@/api/assessmentService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { Activity, Assessment, Material } from '@/types/types'

const ActivityRow = ({ activity, subjectId }: { activity: Activity; subjectId: string }) => {
  const queryClient = useQueryClient()
  const isOverdue = isPast(new Date(activity.dueDate)) && !activity.isCompleted
  const statusLabel = activity.isCompleted ? 'Concluída' : isOverdue ? 'Atrasada' : 'Pendente'
  const statusClass = activity.isCompleted
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : isOverdue
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: () => updateActivity({ ...activity, isCompleted: !activity.isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectActivities', subjectId] })
    },
  })

  return (
    <Card className="shadow-none rounded-sm">
      <CardContent className="py-3 px-4 flex items-center gap-3 justify-between">
        <button
          onClick={() => toggle()}
          disabled={isPending}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPending
            ? <Loader2 className="size-4 animate-spin" />
            : activity.isCompleted
            ? <CheckCircle2 className="size-4 text-green-500" />
            : <Circle className="size-4" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${activity.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {activity.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activity.type && <span className="capitalize">{activity.type} · </span>}
            Entrega: {format(new Date(activity.dueDate), 'dd/MM/yyyy')}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </CardContent>
    </Card>
  )
}

const AssessmentCard = ({ assessment, subjectId }: { assessment: Assessment; subjectId: string }) => {
  const queryClient = useQueryClient()
  const [isGrading, setIsGrading] = useState(false)
  const [gradeInput, setGradeInput] = useState('')

  const { mutate: saveGrade, isPending } = useMutation({
    mutationFn: () => updateAssessment({ id: assessment.id, grade: parseFloat(gradeInput) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectAssessments', subjectId] })
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

const MaterialCard = ({ material }: { material: Material }) => (
  <Card className="shadow-none rounded-sm hover:bg-muted/50 transition-colors">
    <CardContent className="py-3 px-4">
      <div className="flex items-start gap-2">
        <FileIcon className="size-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{material.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{material.type}</p>
        </div>
      </div>
      {(material.fileUrl || material.externalUrl) && (
        <a
          href={material.fileUrl ?? material.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 mt-2 hover:underline"
        >
          <ExternalLink className="size-3" /> Abrir
        </a>
      )}
    </CardContent>
  </Card>
)

const SubjectDetails = () => {
  const { id: subjectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false)
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false)
  const [showCompletedActivities, setShowCompletedActivities] = useState(false)

  const [absenceDate, setAbsenceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [absenceNotes, setAbsenceNotes] = useState('')

  const [assessmentTitle, setAssessmentTitle] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [assessmentMaxGrade, setAssessmentMaxGrade] = useState('')
  const [assessmentWeight, setAssessmentWeight] = useState('')

  const { data: subject, isPending: isSubjectLoading } = useQuery({
    queryKey: ['subjectDetails', subjectId],
    queryFn: () => getSubjectDetails(subjectId!),
    enabled: !!subjectId,
  })

  const { data: absenceLogs, isPending: isAbsencesLoading } = useQuery({
    queryKey: ['subjectAbsences', subjectId],
    queryFn: () => getSubjectAbsenceLogs(subjectId!),
    enabled: !!subjectId,
  })

  const { data: assessments, isPending: isAssessmentsLoading } = useQuery({
    queryKey: ['subjectAssessments', subjectId],
    queryFn: () => getAssessments({ subjectId: subjectId!, size: 20 }),
    enabled: !!subjectId,
  })

  const { data: pendingActivities, isPending: isPendingActivitiesLoading } = useQuery({
    queryKey: ['subjectActivities', subjectId, 'pending'],
    queryFn: () => getActivities({ subjectId: subjectId!, isCompleted: false, size: 20 }),
    enabled: !!subjectId,
  })

  const { data: completedActivities, isPending: isCompletedActivitiesLoading } = useQuery({
    queryKey: ['subjectActivities', subjectId, 'completed'],
    queryFn: () => getActivities({ subjectId: subjectId!, isCompleted: true, size: 20 }),
    enabled: !!subjectId,
  })

  const { data: materials, isPending: isMaterialsLoading } = useQuery({
    queryKey: ['subjectMaterials', subjectId],
    queryFn: () => getSubjectMaterials(subjectId!),
    enabled: !!subjectId,
  })

  const absenceMutation = useMutation({
    mutationFn: createAbsenceLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectAbsences', subjectId] })
      setAbsenceDialogOpen(false)
      setAbsenceDate(format(new Date(), 'yyyy-MM-dd'))
      setAbsenceNotes('')
    },
  })

  const assessmentMutation = useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectAssessments', subjectId] })
      setAssessmentDialogOpen(false)
      setAssessmentTitle('')
      setAssessmentDate('')
      setAssessmentMaxGrade('')
      setAssessmentWeight('')
    },
  })

  const absenceCount = absenceLogs?.totalElements ?? 0
  const maxAbsences = subject?.maxAbsencesAllowed ?? 0
  const absencePercentage = maxAbsences > 0 ? (absenceCount / maxAbsences) * 100 : 0
  const absenceBarColor = absencePercentage < 50 ? 'bg-green-500' : absencePercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
  const absenceTextColor = absencePercentage < 50
    ? 'text-green-600 dark:text-green-400'
    : absencePercentage < 80
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'

  const nextAssessment = assessments?.content
    .filter(a => isFuture(new Date(a.assessmentDate)))
    .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime())[0]

  const gradedAssessments = assessments?.content.filter(a => a.grade != null) ?? []
  const avgGrade = gradedAssessments.length > 0
    ? gradedAssessments.reduce((sum, a) => sum + a.grade! * (a.weight ?? 1), 0)
      / gradedAssessments.reduce((sum, a) => sum + (a.weight ?? 1), 0)
    : null

  const handleAbsenceSubmit = () => {
    if (!absenceDate || !subjectId) return
    absenceMutation.mutate({
      absenceDate: new Date(absenceDate),
      notes: absenceNotes || undefined,
      subjectId,
    })
  }

  const handleAssessmentSubmit = () => {
    if (!assessmentTitle || !assessmentDate || !subjectId) return
    assessmentMutation.mutate({
      title: assessmentTitle,
      assessmentDate: new Date(assessmentDate),
      maxGrade: assessmentMaxGrade ? parseFloat(assessmentMaxGrade) : undefined,
      weight: assessmentWeight ? parseFloat(assessmentWeight) : undefined,
      subjectId,
    })
  }

  return (
    <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
      {/* Header */}
      <header className="mb-8">
        <div className='flex items-center justify-between'>
          {isSubjectLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subject?.color }} />
                <h1 className="text-2xl tracking-tight font-bold">{subject?.name}</h1>
              </div>
              <div className="flex flex-wrap gap-x-3 text-sm text-neutral-500 dark:text-neutral-400 ml-6">
                {subject?.periodName && <span>{subject.periodName}</span>}
                {subject?.professor && <span>· {subject.professor}</span>}
                {subject?.classroom && <span>· {subject.classroom}</span>}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/subjects/new?edit=${subjectId}`)}
          >
            <Pencil size={14} />
          </Button>
        </div>
      </header>

      {/* Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <Card className="shadow-none rounded-sm col-span-2 md:col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
              <UserX className="size-3" /> Frequência
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isAbsencesLoading || isSubjectLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <p className={`text-2xl font-bold ${absenceTextColor}`}>
                  {absenceCount}
                  <span className="text-sm font-normal text-muted-foreground"> / {maxAbsences} faltas</span>
                </p>
                <div className="mt-2 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${absenceBarColor} transition-all duration-500`}
                    style={{ width: `${Math.min(absencePercentage, 100)}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none rounded-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="size-3" /> Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isCompletedActivitiesLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{completedActivities?.totalElements ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none rounded-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
              <ClipboardList className="size-3" /> Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isPendingActivitiesLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{pendingActivities?.totalElements ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none rounded-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="size-3" /> Média
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isAssessmentsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">
                {avgGrade != null ? avgGrade.toFixed(1) : <span className="text-muted-foreground text-lg">—</span>}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none rounded-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen className="size-3" /> Semestre
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isSubjectLoading ? (
              <Skeleton className="h-6 w-28" />
            ) : (
              <p className="text-sm font-semibold leading-snug">{subject?.periodName ?? '—'}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none rounded-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
              <GraduationCap className="size-3" /> Próximo Exame
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isAssessmentsLoading ? (
              <Skeleton className="h-6 w-28" />
            ) : nextAssessment ? (
              <>
                <p className="text-sm font-semibold leading-snug truncate">{nextAssessment.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(nextAssessment.assessmentDate), "dd 'de' MMM", { locale: ptBR })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-10">
        <Button variant="outline" size="sm" onClick={() => setAbsenceDialogOpen(true)} className="gap-1.5">
          <UserX className="size-4" /> Registrar Ausência
        </Button>
      </div>

      {/* Activities Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="size-5" /> Atividades
        </h2>
        {isPendingActivitiesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-sm" />)}
          </div>
        ) : pendingActivities?.content.length === 0 && completedActivities?.content.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma atividade cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {pendingActivities?.content.map(activity => (
              <ActivityRow key={activity.id} activity={activity} subjectId={subjectId!} />
            ))}
            {(completedActivities?.totalElements ?? 0) > 0 && (
              <>
                <button
                  onClick={() => setShowCompletedActivities(prev => !prev)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  {showCompletedActivities ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  {completedActivities?.totalElements} concluída{completedActivities?.totalElements !== 1 ? 's' : ''}
                </button>
                {showCompletedActivities && !isCompletedActivitiesLoading && (
                  <div className="space-y-2">
                    {completedActivities?.content.map(activity => (
                      <ActivityRow key={activity.id} activity={activity} subjectId={subjectId!} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* Assessments Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="size-5" /> Provas
          </h2>
          <Button variant="outline" size="sm" onClick={() => setAssessmentDialogOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Nova Prova
          </Button>
        </div>
        {isAssessmentsLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-sm" />)}
          </div>
        ) : assessments?.content.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma prova cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {assessments?.content
              .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime())
              .map(assessment => (
                <AssessmentCard key={assessment.id} assessment={assessment} subjectId={subjectId!} />
              ))}
          </div>
        )}
      </section>

      {/* Materials Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileIcon className="size-5" /> Arquivos
        </h2>
        {isMaterialsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-sm" />)}
          </div>
        ) : !materials || materials.content.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum arquivo cadastrado.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {materials.content.map(material => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </section>

      {/* Absence Dialog */}
      <Dialog open={absenceDialogOpen} onOpenChange={setAbsenceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Ausência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="absence-date">Data da falta</Label>
              <Input
                id="absence-date"
                type="date"
                value={absenceDate}
                onChange={e => setAbsenceDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="absence-notes">Observações (opcional)</Label>
              <Textarea
                id="absence-notes"
                placeholder="Ex: Faltei por motivo de saúde"
                value={absenceNotes}
                onChange={e => setAbsenceNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAbsenceDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAbsenceSubmit} disabled={absenceMutation.isPending || !absenceDate}>
                {absenceMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Prova</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="assessment-title">Título</Label>
              <Input
                id="assessment-title"
                placeholder="Ex: P1 de Cálculo"
                value={assessmentTitle}
                onChange={e => setAssessmentTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assessment-date">Data</Label>
              <Input
                id="assessment-date"
                type="date"
                value={assessmentDate}
                onChange={e => setAssessmentDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="assessment-max-grade">Nota máxima</Label>
                <Input
                  id="assessment-max-grade"
                  type="number"
                  placeholder="10"
                  value={assessmentMaxGrade}
                  onChange={e => setAssessmentMaxGrade(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assessment-weight">Peso</Label>
                <Input
                  id="assessment-weight"
                  type="number"
                  placeholder="1"
                  value={assessmentWeight}
                  onChange={e => setAssessmentWeight(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssessmentDialogOpen(false)}>Cancelar</Button>
              <Button
                onClick={handleAssessmentSubmit}
                disabled={assessmentMutation.isPending || !assessmentTitle || !assessmentDate}
              >
                {assessmentMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default SubjectDetails
