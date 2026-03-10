import { getActivities, updateActivity, deleteActivity, getMaterialsByActivity, createActivity } from '@/api/activitiyService'
import { createMaterial, createMaterialWithFile } from '@/api/materialService'
import { getUserSubjects } from '@/api/userService'
import { GripVertical, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ClockIcon, Plus, ExternalLink, Pencil, Trash2, Loader2, LinkIcon, FileIcon, CalendarIcon, Paperclip, X } from 'lucide-react'
import React, { forwardRef, useState, useRef } from 'react'
import { Card } from '../ui/card'
import type { User, Activity, Material, CheckListItem } from '@/types/types'
import { useQuery, type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { Toggle } from '../ui/toggle'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../ui/button'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { cn } from '@/lib/utils'

const formSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório'),
    description: z.string().optional(),
    dueDate: z.date().min(1, 'A data de entrega é obrigatória'),
    type: z.string().optional(),
    subjectId: z.string().min(1, 'A matéria é obrigatória'),
    checkList: z.array(z.object({ description: z.string().min(1, 'Obrigatório'), isDone: z.boolean() })).optional()
})

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
    queryClient: QueryClient
}

const ActivitiesGridItem = forwardRef<HTMLDivElement, ActivitiesGridItemProps>(({ user }, ref) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined)
    const [isOverdue, setIsOverdue] = useState<boolean | undefined>(undefined)

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [pendingLinks, setPendingLinks] = useState<{ title: string, url: string }[]>([])
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
    const [newLinkTitle, setNewLinkTitle] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            dueDate: new Date(),
            type: '',
            subjectId: '',
            checkList: []
        },
    })

    const { fields: checklistFields, append: appendChecklist, remove: removeChecklist } = useFieldArray({
        control: form.control,
        name: "checkList"
    });

    const { data: subjectsPage, isLoading: isSubjectsLoading } = useQuery({
        queryKey: ['userSubjects', user?.id],
        queryFn: () => getUserSubjects({ userId: user?.id! }),
        enabled: !!user?.id,
    })

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

    const { mutateAsync: createActivityMutate } = useMutation({
        mutationFn: createActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        }
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const handleAddLink = () => {
        if (newLinkTitle && newLinkUrl) {
            setPendingLinks(prev => [...prev, { title: newLinkTitle, url: newLinkUrl }])
            setNewLinkTitle('')
            setNewLinkUrl('')
            setIsLinkPopoverOpen(false)
        }
    }

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index))
    }

    const removePendingLink = (index: number) => {
        setPendingLinks(prev => prev.filter((_, i) => i !== index))
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        setErrorMessage(null)

        const handleAttachments = async (activityId: string, subjectId: string) => {
            const uploadPromises = pendingFiles.map(file => {
                return createMaterialWithFile({
                    title: file.name,
                    type: 'file',
                    isFavorite: false,
                    activityId: activityId,
                    subjectId: subjectId,
                    file: file
                })
            })

            const linkPromises = pendingLinks.map(link =>
                createMaterial({
                    title: link.title,
                    type: 'link',
                    isFavorite: false,
                    activityId: activityId,
                    subjectId: subjectId,
                    externalUrl: link.url
                })
            )

            await Promise.all([...uploadPromises, ...linkPromises])
        }

        try {
            const newActivity = await createActivityMutate({
                title: values.title,
                description: values.description,
                dueDate: values.dueDate,
                type: values.type,
                subjectId: values.subjectId,
                checkList: values.checkList?.filter(c => c.description.trim() !== '') || []
            })

            await handleAttachments(newActivity.id, values.subjectId)

            // reset entire state
            form.reset()
            setPendingFiles([])
            setPendingLinks([])
            setIsDialogOpen(false)

        } catch (error) {
            console.error(error)
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage("Ocorreu um erro ao salvar a atividade.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Adicionar Atividade</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Estudar React" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="subjectId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matéria</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                    disabled={isSubjectsLoading}
                                                >
                                                    <option value="" disabled>Selecione uma matéria</option>
                                                    {subjectsPage?.content.map((subject) => (
                                                        <option key={subject.id} value={subject.id}>
                                                            {subject.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col flex-1 w-full justify-end">
                                            <FormLabel>Data de Entrega</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: ptBR })
                                                            ) : (
                                                                <span>Escolha uma data</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição (Opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detalhes adicionais..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Checklist Section */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="font-semibold text-base">Checklist</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendChecklist({ description: '', isDone: false })}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Adicionar Item
                                    </Button>
                                </div>
                                {checklistFields.map((field, index) => (
                                    <div key={field.id} className="flex flex-row items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`checkList.${index}.description`}
                                            render={({ field: inputField }) => (
                                                <FormItem className="flex-1 space-y-0">
                                                    <FormControl>
                                                        <Input placeholder="Item da tarefa" {...inputField} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeChecklist(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Attachments Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="font-semibold text-base">Anexos</FormLabel>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                        />
                                        <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Arquivo
                                        </Button>
                                        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant="secondary" size="sm">
                                                    <LinkIcon className="h-4 w-4 mr-2" />
                                                    Link
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80">
                                                <div className="space-y-4">
                                                    <h4 className="font-medium leading-none">Adicionar Link</h4>
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Título do link"
                                                            value={newLinkTitle}
                                                            onChange={(e) => setNewLinkTitle(e.target.value)}
                                                        />
                                                        <Input
                                                            placeholder="URL (https://...)"
                                                            value={newLinkUrl}
                                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                                        />
                                                        <Button type="button" onClick={handleAddLink} className="w-full">
                                                            Adicionar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {pendingFiles.map((file, index) => (
                                        <div key={`file-${index}`} className="flex items-center justify-between p-2 border rounded-md bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                                                <div className="flex flex-col truncate">
                                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removePendingFile(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {pendingLinks.map((link, index) => (
                                        <div key={`link-${index}`} className="flex items-center justify-between p-2 border rounded-md bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <LinkIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                                                <div className="flex flex-col truncate">
                                                    <span className="text-sm font-medium truncate">{link.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</span>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removePendingLink(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {errorMessage && (
                                <p className="text-sm text-red-600 text-center font-medium">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Atividade
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <div className='grid-stack-item' gs-id="activities" gs-w="4" gs-min-w="2" gs-max-h="6" gs-h="4" ref={ref}>
                <div className='grid-stack-item-content bg-background rounded-sm shadow-sm border border-accent flex flex-col'>
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
