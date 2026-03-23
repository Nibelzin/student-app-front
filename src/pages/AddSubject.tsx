import { createSubject, updateSubject, deleteSubject, getSubjectDetails } from '@/api/subjectService';
import { getUserPeriods } from '@/api/userService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    periodId: z.string().min(1, 'O período é obrigatório'),
    professor: z.string().optional(),
    classroom: z.string().optional(),
    color: z.string().min(1, 'A cor é obrigatória'),
    maxAbsencesAllowed: z.coerce.number().min(0, 'Deve ser 0 ou mais'),
});

const AddSubject = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: periods, isLoading: isPeriodsLoading } = useQuery({
        queryKey: ['periods', user?.id],
        queryFn: () => getUserPeriods({ userId: user?.id! }),
        enabled: !!user?.id,
    });

    const { data: subjectToEdit } = useQuery({
        queryKey: ['subjectDetails', editId],
        queryFn: () => getSubjectDetails(editId!),
        enabled: isEditMode,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            periodId: '',
            professor: '',
            classroom: '',
            color: '#3b82f6',
            maxAbsencesAllowed: 0,
        },
    });

    useEffect(() => {
        if (subjectToEdit) {
            form.reset({
                name: subjectToEdit.name,
                periodId: subjectToEdit.periodId,
                professor: subjectToEdit.professor ?? '',
                classroom: subjectToEdit.classroom ?? '',
                color: subjectToEdit.color,
                maxAbsencesAllowed: subjectToEdit.maxAbsencesAllowed,
            });
        }
    }, [subjectToEdit, form]);

    const { mutate: createSubjectMutate, isPending: isCreating } = useMutation({
        mutationFn: createSubject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userSubjects'] });
            navigate('/subjects');
        },
        onError: (error) => {
            setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro');
        },
    });

    const { mutate: updateSubjectMutate, isPending: isUpdating } = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => updateSubject(editId!, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userSubjects'] });
            queryClient.invalidateQueries({ queryKey: ['subjectDetails', editId] });
            navigate('/subjects');
        },
        onError: (error) => {
            setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro');
        },
    });

    const { mutate: deleteSubjectMutate, isPending: isDeleting } = useMutation({
        mutationFn: () => deleteSubject(editId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userSubjects'] });
            navigate('/subjects');
        },
        onError: (error) => {
            setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro');
        },
    });

    const isPending = isCreating || isUpdating;

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user?.id) return;
        if (isEditMode) {
            updateSubjectMutate(values);
        } else {
            createSubjectMutate({ userId: user.id, ...values });
        }
    }

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex gap-4 my-4 mb-8 items-center justify-between">
                <div className="flex gap-4 items-center">
                    <Button variant="outline" className='shadow-none' size="icon" onClick={() => navigate('/subjects')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-semibold">{isEditMode ? 'Editar Matéria' : 'Adicionar Matéria'}</h1>
                </div>
                {isEditMode && (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" /> Excluir Matéria
                    </Button>
                )}
            </header>

            <Card className="max-w-full mx-auto p-4 shadow-none">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Matéria</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Cálculo I" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="periodId"
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex justify-between items-center'>
                                        <FormLabel>Período</FormLabel>
                                        <Link to="/periods/new" className='text-sm text-blue-500 hover:text-blue-700'>Adicionar períodos</Link>
                                    </div>
                                    <FormControl>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                            disabled={isPeriodsLoading}
                                        >
                                            <option value="" disabled>Selecione um período</option>
                                            {periods?.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((period) => (
                                                <option key={period.id} value={period.id}>
                                                    {period.name} ({new Date(period.startDate).getUTCFullYear()})
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
                            name="professor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professor (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome do professor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="classroom"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sala (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Sala 304 / Bloco B" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxAbsencesAllowed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Máximo de Faltas Permitidas</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} placeholder="Ex: 8" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cor</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="color"
                                                className="w-12 h-10 p-1 cursor-pointer"
                                                {...field}
                                            />
                                            <span className="text-sm text-muted-foreground">{field.value}</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {errorMessage && (
                            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/subjects')}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </div>

                    </form>
                </Form>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Matéria</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Tem certeza que deseja excluir <strong>{subjectToEdit?.name}</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={() => deleteSubjectMutate()} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
};

export default AddSubject;
