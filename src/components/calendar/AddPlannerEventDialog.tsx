import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPlannerEvent, updatePlannerEvent, deletePlannerEvent } from '@/api/plannerEventService'
import { getUserSubjects } from '@/api/userService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'
import { Toggle } from '../ui/toggle'
import type { PlannerEvent, User } from '@/types/types'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog'

const PRESET_COLORS = [
    { value: '#10b981', label: 'Verde' },
    { value: '#3b82f6', label: 'Azul' },
    { value: '#8b5cf6', label: 'Violeta' },
    { value: '#f59e0b', label: 'Amarelo' },
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#84cc16', label: 'Lima' },
]

const formSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório'),
    startDate: z.date({ required_error: 'A data de início é obrigatória' }),
    startTime: z.string().optional(),
    endDate: z.date({ required_error: 'A data de término é obrigatória' }),
    endTime: z.string().optional(),
    allDay: z.boolean(),
    color: z.string().optional(),
    subjectId: z.string().optional(),
}).refine((data) => {
    const start = combineDateAndTime(data.startDate, data.allDay ? undefined : data.startTime)
    const end = combineDateAndTime(data.endDate, data.allDay ? undefined : data.endTime)
    return end >= start
}, {
    message: 'A data de término deve ser igual ou posterior à data de início',
    path: ['endDate'],
})

function combineDateAndTime(date: Date, time?: string): Date {
    const result = new Date(date)
    if (time) {
        const [hours, minutes] = time.split(':').map(Number)
        result.setHours(hours, minutes, 0, 0)
    } else {
        result.setHours(0, 0, 0, 0)
    }
    return result
}

interface AddPlannerEventDialogProps {
    isOpen: boolean
    onClose: () => void
    user?: User
    plannerEvent?: PlannerEvent
    defaultDate?: Date
}

function AddPlannerEventDialog({ isOpen, onClose, user, plannerEvent, defaultDate }: AddPlannerEventDialogProps) {
    const isEditMode = !!plannerEvent
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            startDate: defaultDate ?? new Date(),
            startTime: '08:00',
            endDate: defaultDate ?? new Date(),
            endTime: '09:00',
            allDay: false,
            color: PRESET_COLORS[0].value,
            subjectId: '',
        },
    })

    const allDay = form.watch('allDay')

    useEffect(() => {
        if (plannerEvent) {
            const start = new Date(plannerEvent.startAt)
            const end = new Date(plannerEvent.endAt)
            form.reset({
                title: plannerEvent.title,
                startDate: start,
                startTime: format(start, 'HH:mm'),
                endDate: end,
                endTime: format(end, 'HH:mm'),
                allDay: plannerEvent.allDay,
                color: plannerEvent.color || PRESET_COLORS[0].value,
                subjectId: plannerEvent.subjectId || '',
            })
        } else {
            form.reset({
                title: '',
                startDate: defaultDate ?? new Date(),
                startTime: '08:00',
                endDate: defaultDate ?? new Date(),
                endTime: '09:00',
                allDay: false,
                color: PRESET_COLORS[0].value,
                subjectId: '',
            })
        }
    }, [plannerEvent, defaultDate, form])

    const { mutateAsync: createMutate } = useMutation({
        mutationFn: createPlannerEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plannerEvents'] })
            queryClient.invalidateQueries({ queryKey: ['userPlannerEvents'] })
        },
    })

    const { mutateAsync: updateMutate } = useMutation({
        mutationFn: ({ id, params }: { id: string; params: Parameters<typeof updatePlannerEvent>[1] }) =>
            updatePlannerEvent(id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plannerEvents'] })
            queryClient.invalidateQueries({ queryKey: ['userPlannerEvents'] })
        },
    })

    const { mutateAsync: deleteMutate } = useMutation({
        mutationFn: deletePlannerEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plannerEvents'] })
            queryClient.invalidateQueries({ queryKey: ['userPlannerEvents'] })
        },
    })

    const { data: subjectsPage, isLoading: isSubjectsLoading } = useQuery({
        queryKey: ['userSubjects', user?.id],
        queryFn: () => getUserSubjects({ userId: user?.id! }),
        enabled: !!user?.id,
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return
        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            const startAt = combineDateAndTime(values.startDate, values.allDay ? undefined : values.startTime)
            const endAt = combineDateAndTime(values.endDate, values.allDay ? undefined : values.endTime)

            if (values.allDay) {
                endAt.setHours(23, 59, 59, 999)
            }

            const params = {
                title: values.title,
                startAt,
                endAt,
                allDay: values.allDay,
                color: values.color || undefined,
                subjectId: values.subjectId || undefined,
            }

            if (isEditMode) {
                await updateMutate({ id: plannerEvent.id, params })
            } else {
                await createMutate({ ...params, userId: user.id })
            }

            form.reset()
            onClose()
        } catch (error) {
            console.error(error)
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage('Ocorreu um erro ao salvar o evento.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete() {
        if (!plannerEvent) return
        setIsDeleting(true)
        try {
            await deleteMutate(plannerEvent.id)
            setShowDeleteConfirm(false)
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
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
                                            <Input placeholder="Ex: Reunião de estudos" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* All day toggle */}
                            <FormField
                                control={form.control}
                                name="allDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <Toggle
                                                variant="outline"
                                                size="sm"
                                                pressed={field.value}
                                                onPressedChange={field.onChange}
                                            >
                                                Dia inteiro
                                            </Toggle>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Start date + time */}
                            <div className="flex gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Início</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal rounded-md",
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
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {!allDay && (
                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel>Hora</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* End date + time */}
                            <div className="flex gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Término</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal rounded-md",
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
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {!allDay && (
                                    <FormField
                                        control={form.control}
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel>Hora</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Color selector */}
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cor</FormLabel>
                                        <div className="flex gap-2 flex-wrap">
                                            {PRESET_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 transition-all",
                                                        field.value === color.value
                                                            ? "border-foreground scale-110"
                                                            : "border-transparent hover:scale-105"
                                                    )}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.label}
                                                    onClick={() => field.onChange(color.value)}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Subject selector (optional) */}
                            <FormField
                                control={form.control}
                                name="subjectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Matéria (opcional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isSubjectsLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Nenhuma matéria" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subjectsPage?.content.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {errorMessage && (
                                <p className="text-sm text-red-600 text-center font-medium">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="flex justify-between gap-2 pt-4 border-t mt-4">
                                <div>
                                    {isEditMode && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setShowDeleteConfirm(true)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={onClose}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isEditMode ? 'Salvar Alterações' : 'Criar Evento'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir evento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{plannerEvent?.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default AddPlannerEventDialog
