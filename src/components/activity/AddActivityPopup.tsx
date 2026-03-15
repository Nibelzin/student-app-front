import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { format } from 'date-fns'
import { CalendarIcon, FileIcon, LinkIcon, Loader2, Paperclip, Plus, X } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import { Textarea } from '../ui/textarea'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMaterial, createMaterialWithFile } from '@/api/materialService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createActivity } from '@/api/activitiyService'
import { getUserSubjects } from '@/api/userService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'
import type { User } from '@/types/types'
    
const formSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório'),
    description: z.string().optional(),
    dueDate: z.date().min(1, 'A data de entrega é obrigatória'),
    type: z.string().optional(),
    subjectId: z.string().min(1, 'A matéria é obrigatória'),
    checkList: z.array(z.object({ description: z.string().min(1, 'Obrigatório'), isDone: z.boolean() })).optional()
})

interface AddActivityPopupProps {
    isOpen: boolean
    onClose: () => void
    user?: User
}

function AddActivityPopup({ isOpen, onClose, user }: AddActivityPopupProps) {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [pendingLinks, setPendingLinks] = useState<{ title: string, url: string }[]>([])
    const [newLinkTitle, setNewLinkTitle] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const queryClient = useQueryClient()

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

    const { mutateAsync: createActivityMutate } = useMutation({
        mutationFn: createActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        }
    })

    const { data: subjectsPage, isLoading: isSubjectsLoading } = useQuery({
        queryKey: ['userSubjects', user?.id],
        queryFn: () => getUserSubjects({ userId: user?.id! }),
        enabled: !!user?.id,
    })

    const { fields: checklistFields, append: appendChecklist, remove: removeChecklist } = useFieldArray({
        control: form.control,
        name: "checkList"
    });

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

            const activityData = {
                title: values.title,
                description: values.description,
                dueDate: values.dueDate,
                type: values.type,
                subjectId: values.subjectId,
                checkList: values.checkList?.filter(c => c.description.trim() !== '') || []
            }

            console.log("NEW ACTIVITY: ", activityData)

            const newActivity = await createActivityMutate({
                title: values.title,
                description: values.description,
                dueDate: values.dueDate,
                type: values.type,
                subjectId: values.subjectId,
                checklist: values.checkList?.filter(c => c.description.trim() !== '') || []
            })

            await handleAttachments(newActivity.id, values.subjectId)

            // reset entire state
            form.reset()
            setPendingFiles([])
            setPendingLinks([])
            onClose()

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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
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
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isSubjectsLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma matéria" />
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
                            <Button type="button" variant="outline" onClick={onClose}>
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
    )
}

export default AddActivityPopup