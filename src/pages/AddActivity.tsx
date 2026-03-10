import { createActivity, updateActivity, getActivities, getMaterialsByActivity } from '@/api/activitiyService';
import { createMaterial, createMaterialWithFile, deleteMaterial, updateMaterial } from '@/api/materialService';
import { getSubjectMaterials } from '@/api/subjectService';
import { getUserSubjects } from '@/api/userService';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import type { Material } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CalendarIcon, Loader2, Paperclip, Link as LinkIcon, FileIcon, X, Trash2, Download, ExternalLink, Plus } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const formSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório'),
    description: z.string().optional(),
    dueDate: z.date().min(1, 'A data de entrega é obrigatória'),
    type: z.string().optional(),
    subjectId: z.string().min(1, 'A matéria é obrigatória'),
});

const AddActivity = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data: subjectsPage, isLoading: isSubjectsLoading } = useQuery({
        queryKey: ['userSubjects', user?.id],
        queryFn: () => getUserSubjects({ userId: user?.id! }),
        enabled: !!user?.id,
    });

    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id],
        queryFn: () => getActivities({ userId: user?.id }),
        enabled: !!user?.id && isEditMode,
    });

    const activityToEdit = activitiesPage?.content.find(a => a.id === editId);

    const { data: existingMaterials, refetch: refetchMaterials } = useQuery({
        queryKey: ['activityMaterials', editId],
        queryFn: () => getMaterialsByActivity(editId!),
        enabled: !!editId
    });

    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [pendingLinks, setPendingLinks] = useState<{ title: string, url: string }[]>([]);
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    // State for existing subject materials selection
    const [selectedSubjectMaterials, setSelectedSubjectMaterials] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            dueDate: new Date(),
            type: '',
            subjectId: '',
        },
    });

    const selectedSubjectId = form.watch('subjectId');

    const { data: subjectMaterials } = useQuery({
        queryKey: ['subjectMaterials', selectedSubjectId],
        queryFn: async () => {
            const res = await getSubjectMaterials(selectedSubjectId);
            const list = Array.isArray(res) ? res : (res as any).content || [];
            return list as Material[];
        },
        enabled: !!selectedSubjectId
    });

    // Filter materials that are NOT attached to any activity
    const availableSubjectMaterials = subjectMaterials?.filter(m => !m.activityId) || [];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleAddLink = () => {
        if (newLinkTitle && newLinkUrl) {
            setPendingLinks(prev => [...prev, { title: newLinkTitle, url: newLinkUrl }]);
            setNewLinkTitle('');
            setNewLinkUrl('');
            setIsLinkPopoverOpen(false);
        }
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removePendingLink = (index: number) => {
        setPendingLinks(prev => prev.filter((_, i) => i !== index));
    };

    const toggleSubjectMaterialSelection = (materialId: string) => {
        setSelectedSubjectMaterials(prev =>
            prev.includes(materialId)
                ? prev.filter(id => id !== materialId)
                : [...prev, materialId]
        );
    };

    const { mutate: deleteMaterialMutate } = useMutation({
        mutationFn: deleteMaterial,
        onSuccess: () => {
            refetchMaterials();
        }
    });

    const downloadMaterial = (material: Material) => {
        if (material.type === 'link') {
            window.open(material.externalUrl, '_blank');
        } else {
            window.open(material.fileUrl, '_blank');
        }
    };

    useEffect(() => {
        if (activityToEdit) {
            form.reset({
                title: activityToEdit.title,
                description: activityToEdit.description || '',
                dueDate: new Date(activityToEdit.dueDate),
                type: activityToEdit.type || '',
                subjectId: activityToEdit.subjectId,
            });
        }
    }, [activityToEdit, form]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutateAsync: createActivityMutate } = useMutation({
        mutationFn: createActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
    });

    const { mutateAsync: updateActivityMutate } = useMutation({
        mutationFn: updateActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        setErrorMessage(null);

        const handleAttachments = async (activityId: string, subjectId: string) => {
            console.log('Starting handleAttachments', { activityId, subjectId, pendingFiles: pendingFiles.length, pendingLinks: pendingLinks.length });
            const uploadPromises = pendingFiles.map(file => {
                console.log('Uploading file:', file.name);
                return createMaterialWithFile({
                    title: file.name,
                    type: 'file',
                    isFavorite: false,
                    activityId: activityId,
                    subjectId: subjectId,
                    file: file
                });
            });

            const linkPromises = pendingLinks.map(link =>
                createMaterial({
                    title: link.title,
                    type: 'link',
                    isFavorite: false,
                    activityId: activityId,
                    subjectId: subjectId,
                    externalUrl: link.url
                })
            );

            // Handle attaching existing subject materials
            const attachExistingPromises = selectedSubjectMaterials.map(materialId =>
                updateMaterial(materialId, { activityId })
            );

            await Promise.all([...uploadPromises, ...linkPromises, ...attachExistingPromises]);
            console.log('All attachments handled');
        };

        try {
            if (isEditMode && editId) {
                await updateActivityMutate({
                    id: editId,
                    title: values.title,
                    description: values.description,
                    dueDate: values.dueDate,
                    isCompleted: false
                });
                console.log('Activity updated, handling attachments...');
                await handleAttachments(editId, values.subjectId);
            } else {
                const newActivity = await createActivityMutate({
                    title: values.title,
                    description: values.description,
                    dueDate: values.dueDate,
                    type: values.type,
                    subjectId: values.subjectId,
                });
                console.log('Activity created, handling attachments...', newActivity);
                await handleAttachments(newActivity.id, values.subjectId);
            }
            navigate('/');
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Ocorreu um erro ao salvar a atividade ou anexos.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex gap-4 mb-8 items-center">
                <Button variant="outline" className='shadow-none' size="icon" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold">
                    {isEditMode ? 'Editar Atividade' : 'Adicionar Atividade'}
                </h1>
            </header>

            <Card className="max-w-full mx-auto p-4 shadow-none">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título da Atividade</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Trabalho de Cálculo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva os detalhes da atividade..."
                                            className=""
                                            {...field}

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            disabled={isSubjectsLoading || isEditMode}
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo (Opcional)</FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                            disabled={isEditMode}
                                        >
                                            <option value="">Selecione um tipo</option>
                                            <option value="homework">Trabalho</option>
                                            <option value="exam">Prova</option>
                                            <option value="project">Projeto</option>
                                            <option value="reading">Leitura</option>
                                            <option value="other">Outro</option>
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
                                <FormItem>
                                    <FormLabel>Data de Entrega</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: ptBR })
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={new Date(field.value)}
                                                    onSelect={(event) => {
                                                        field.onChange(event)
                                                    }}
                                                    captionLayout='dropdown'
                                                    disabled={field.disabled}
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Attachments Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel>Anexos</FormLabel>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        Adicionar Arquivo
                                    </Button>
                                    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm">
                                                    <LinkIcon className="h-4 w-4 mr-2" />
                                                    Adicionar Link
                                                </Button>
                                            </div>
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
                                {/* Attached Existing Materials */}
                                {existingMaterials?.map((material) => (
                                    <div key={material.id} className="flex items-center justify-between p-3 border rounded-md bg-neutral-50 dark:bg-neutral-900">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {material.type === 'link' ? <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" /> : <FileIcon className="h-4 w-4 shrink-0 text-orange-500" />}
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-medium truncate">{material.title}</span>
                                                {material.type === 'link' && material.externalUrl && <a href={material.externalUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground truncate hover:underline">{material.externalUrl}</a>}
                                            </div>
                                        </div>
                                        <div>
                                            <Button type="button" variant="ghost" size="icon" className='text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer' onClick={() => downloadMaterial(material)}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" className='text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer' onClick={() => deleteMaterialMutate(material.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Pending Files */}
                                {pendingFiles.map((file, index) => (
                                    <div key={`file-${index}`} className="flex items-center justify-between p-3 border rounded-md bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-medium truncate">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB (Pendente)</span>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePendingFile(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {/* Pending Links */}
                                {pendingLinks.map((link, index) => (
                                    <div key={`link-${index}`} className="flex items-center justify-between p-3 border rounded-md bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <LinkIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-medium truncate">{link.title}</span>
                                                <span className="text-xs text-muted-foreground">{link.url} (Pendente)</span>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePendingLink(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {/* Select Available Subject Materials */}
                                {availableSubjectMaterials.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <FormLabel className="mb-2 block">Vincular arquivos existentes da matéria</FormLabel>
                                        <div className="space-y-2">
                                            {availableSubjectMaterials.map((material) => (
                                                <div
                                                    key={material.id}
                                                    className={cn(
                                                        "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                        selectedSubjectMaterials.includes(material.id)
                                                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                                            : "bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                                                    )}
                                                    onClick={() => toggleSubjectMaterialSelection(material.id)}
                                                >
                                                    <div className={cn("w-4 h-4 rounded border mr-3 flex items-center justify-center", selectedSubjectMaterials.includes(material.id) ? "bg-blue-500 border-blue-500" : "border-gray-300")}>
                                                        {selectedSubjectMaterials.includes(material.id) && <Plus className="h-3 w-3 text-white" />}
                                                    </div>
                                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                        {material.type === 'link' ? <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" /> : <FileIcon className="h-4 w-4 shrink-0 text-orange-500" />}
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-sm font-medium truncate">{material.title}</span>
                                                            {material.type === 'link' && <span className="text-xs text-muted-foreground truncate">{material.externalUrl}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="text-sm text-red-600 text-center">
                                {errorMessage}
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/')}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? 'Salvar Alterações' : 'Criar Atividade'}
                            </Button>
                        </div>

                    </form>
                </Form>
            </Card>
        </main>
    );
};

export default AddActivity;
