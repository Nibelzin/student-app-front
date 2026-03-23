import { forwardRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, isFuture } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExternalLink, GraduationCap, GripVertical, Plus } from 'lucide-react'
import { getUserAssessments } from '@/api/assessmentService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/types/types'
import { useNavigate } from 'react-router'

interface AssessmentsGridItemProps {
  user: User | undefined
}

const AssessmentsGridItem = forwardRef<HTMLDivElement, AssessmentsGridItemProps>(({ user }, ref) => {
  const navigate = useNavigate();

  const { data: assessmentsPage, isPending } = useQuery({
    queryKey: ['userAssessments', user?.id],
    queryFn: () => getUserAssessments(user!.id),
    enabled: !!user?.id,
  })

  const upcomingAssessments = assessmentsPage?.content
    .filter(a => isFuture(new Date(a.assessmentDate)))
    .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime())
    ?? []

  return (
    <div className='grid-stack-item' gs-id="assessments" gs-w="2" gs-h="4" ref={ref}>
      <Card className="grid-stack-item-content shadow-none rounded-sm h-full">
        <div className='flex items-center justify-between mb-0 p-3 gap-2'>
          <div className='flex items-center gap-2'>
            <GripVertical size={20} className='handle cursor-pointer' />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Próximas Provas</h2>
          </div>
          <div className='flex gap-2 items-center'>
            <div className='flex gap-4'>
              <Plus className='cursor-pointer hover:text-blue-500 transition-colors' size={20} />
              <ExternalLink className='cursor-pointer hover:text-blue-500 transition-colors' size={20} onClick={() => navigate('/files')} />
            </div>
          </div>
        </div>
        <CardContent className="space-y-2">
          {isPending ? (
            <>
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-sm" />)}
            </>
          ) : upcomingAssessments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma prova agendada.</p>
          ) : (
            upcomingAssessments.map(assessment => (
              <div
                key={assessment.id}
                className="flex items-center justify-between py-2 px-3 rounded-sm border bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{assessment.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{assessment.subjectName}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">
                  {format(new Date(assessment.assessmentDate), "dd 'de' MMM", { locale: ptBR })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
})

AssessmentsGridItem.displayName = 'AssessmentsGridItem'

export default AssessmentsGridItem
