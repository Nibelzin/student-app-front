import { getActivities, updateActivity, deleteActivity, getMaterialsByActivity } from '@/api/activitiyService'
import { GripVertical, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ClockIcon, Plus, ExternalLink, Pencil, Trash2, Loader2, LinkIcon, FileIcon, CalendarIcon, Paperclip, X } from 'lucide-react'
import React, { forwardRef, useState } from 'react'
import { Card } from '../ui/card'
import type { User, Activity, Material, CheckListItem } from '@/types/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Toggle } from '../ui/toggle'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../ui/button'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router'
import AddActivityPopup from '../activity/AddActivityPopup'

interface ActivityItemProps {
    activity: Activity
}

export const ActivityItem = ({ activity }: ActivityItemProps) => {
    const [showDetails, setShowDetails] = useState(false)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const clickOriginRef = React.useRef<{ x: number, y: number } | null>(null)

    const { data: materials } = useQuery({
        queryKey: ['materials', activity.id],
        queryFn: () => getMaterialsByActivity(activity.id)
    })

    const downloadMaterial = (material: Material) => {
        if (material.type === 'link') {
            window.open(material.externalUrl, '_blank');
        } else {
            window.open(material.fileUrl, '_blank');
        }
    };

    const { mutate: toggleCompletion, isPending } = useMutation({
        mutationFn: () => updateActivity({
            ...activity,
            isCompleted: !activity.isCompleted
        }),
        onSuccess: () => {
            if (!activity.isCompleted) {
                confetti({
                    particleCount: 100,
                    spread: 150,
                    origin: clickOriginRef.current || { y: 0.6 }
                })
            }
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
        }
    })

    const { mutate: removeActivity, isPending: isDeleting } = useMutation({
        mutationFn: () => deleteActivity(activity.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        }
    })

    const handleEdit = () => {
        navigate(`/activities/new?edit=${activity.id}`)
    }

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            removeActivity()
        }
    }

    const { mutate: toggleChecklistItem } = useMutation({
        mutationFn: (updatedCheckList: CheckListItem[]) => updateActivity({ ...activity, checkList: updatedCheckList }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        }
    })

    const handleChecklistItemToggle = (index: number) => {
        if (!activity.checkList) return;
        const newChecklist = [...activity.checkList];
        newChecklist[index].isDone = !newChecklist[index].isDone;
        toggleChecklistItem(newChecklist);
    }

    const detailsIcon = showDetails ? <ChevronUp size={16} onClick={() => setShowDetails(!showDetails)} /> : <ChevronDown size={16} onClick={() => setShowDetails(!showDetails)} />

    const allChecklistDone = activity.checkList && activity.checkList.length > 0 && activity.checkList.every(item => item.isDone);

    return (
        <Card
            className="p-3 dark:bg-neutral-900/40 hover:shadow-md shadow-none transition-shadow border-l-4 rounded-sm"
            style={{ borderLeftColor: activity.isCompleted || allChecklistDone ? '#22c55e' : (new Date(activity.dueDate) < new Date() ? '#ef4444' : '#3b82f6') }}
        >
            <div className='flex flex-col justify-between'>
                <div className="flex justify-between items-start">
                    <div className='space-y-1'>
                        <p className={`font-medium text-sm leading-none ${(activity.isCompleted || allChecklistDone) ? 'line-through text-neutral-500' : ''}`}>{activity.title}</p>
                        <p className='text-xs text-neutral-500'>{activity.subjectName}</p>
                    </div>
                    <div className="text-right flex flex-col items-end justify-end gap-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${activity.isCompleted || allChecklistDone
                            ? 'bg-green-100 text-green-700'
                            : new Date(activity.dueDate) < new Date()
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                            {format(new Date(activity.dueDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        {showDetails && (
                            <div className={`flex items-center gap-1 text-xs`}>
                                <div className={`flex items-center gap-1 text-xs ${activity.isCompleted || allChecklistDone ? 'text-green-700' : new Date(activity.dueDate) < new Date() ? 'text-red-700' : 'text-blue-700'}`}>
                                    {activity.isCompleted || allChecklistDone ? <CheckCircle2 size={12} /> : new Date(activity.dueDate) < new Date() ? <AlertCircle size={12} /> : <ClockIcon size={12} />}
                                </div>
                                {activity.isCompleted || allChecklistDone ? 'Concluído' : new Date(activity.dueDate) < new Date() ? 'Atrasado' : 'Pendente'}
                            </div>

                        )}
                    </div>
                </div>
                {
                    showDetails && ((activity.description || activity.checkList?.length || (materials && materials.length > 0)) != null) && (
                        <>
                            <div className="flex justify-between items-start mt-2 mb-4">
                                <div className='text-xs text-neutral-500 whitespace-pre-wrap'>
                                    {activity.description}
                                </div>
                            </div>

                            {
                                activity.checkList && activity.checkList.length > 0 && (
                                    <div className="flex flex-col gap-2 mb-4">
                                        {activity.checkList.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 cursor-pointer" onClick={() => handleChecklistItemToggle(idx)}>
                                                <div className={`w-4 h-4 min-w-[16px] rounded border flex items-center justify-center transition-colors ${item.isDone ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
                                                    {item.isDone && <CheckCircle2 size={12} />}
                                                </div>
                                                <span className={`text-xs ${item.isDone ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{item.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                            {
                                materials && materials?.length > 0 && (
                                    <>
                                        <p className="text-xs font-semibold mb-2">Anexos</p>
                                        <div className="flex flex-col gap-2 mb-4">
                                            {materials.map(material => (
                                                <div key={material.id} className="flex items-center justify-between p-2 border rounded-md bg-neutral-50 dark:bg-neutral-900 h-12 cursor-pointer" onClick={() => downloadMaterial(material)}>
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {material.type === 'link' ? <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" /> : <FileIcon className="h-4 w-4 shrink-0 text-orange-500" />}
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-sm font-medium truncate">{material.title}</span>
                                                            {material.type === 'link' && material.externalUrl && <a href={material.externalUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground truncate">{material.externalUrl}</a>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )
                            }
                        </>
                    )
                }
                <div className='flex justify-end gap-2 mt-2'>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleEdit}
                    >
                        <Pencil size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = (rect.left + rect.width / 2) / window.innerWidth
                            const y = (rect.top + rect.height / 2) / window.innerHeight
                            clickOriginRef.current = { x, y }
                            toggleCompletion()
                        }}
                    >
                        {activity.isCompleted || allChecklistDone ? 'Desfazer Conclusão' : 'Concluir'}
                    </Button>
                </div>
                <div className='flex justify-center mt-2'>
                    {detailsIcon}
                </div>
            </div>
        </Card>
    )
}


interface ActivitiesGridItemProps {
    user: User | undefined
}

const ActivitiesGridItem = forwardRef<HTMLDivElement, ActivitiesGridItemProps>(({ user }, ref) => {
    const navigate = useNavigate()
    const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined)
    const [isOverdue, setIsOverdue] = useState<boolean | undefined>(undefined)

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false)


    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id, isCompleted, isOverdue],
        queryFn: () => getActivities({
            userId: user?.id,
            isCompleted: isCompleted,
            isOverdue: isOverdue,
            size: 5
        }),
        enabled: !!user?.id
    })

    const activities = activitiesPage?.content || []

    return (
        <>
            <AddActivityPopup
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                user={user}
            />
            <div className='grid-stack-item' gs-id="activities" gs-w="4" gs-min-w="2" gs-max-h="6" gs-h="4" ref={ref}>
                <div className='grid-stack-item-content bg-background rounded-sm shadow-none border flex flex-col'>
                    <div className='flex items-center justify-between gap-2 border-accent p-3 mb-2'>
                        <div className='flex items-center gap-2'>
                            <GripVertical size={20} className='handle cursor-pointer text-neutral-400' />
                            <h2 className="text-sm font-semibold uppercase tracking-wide">Próximas atividades</h2>
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
                    <div className='flex gap-2 px-3 mb-2'>
                        <Toggle
                            size="sm"
                            pressed={isCompleted === true}
                            onPressedChange={(pressed) => {
                                setIsCompleted(pressed ? true : undefined)
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
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-3">
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-8">
                                <CheckCircle2 size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">Tudo certo por aqui 😃</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pb-2">
                                {activities.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(activity => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
})

export default ActivitiesGridItem
