import { createSubject } from '@/api/subjectService';
import { getUserPeriods } from '@/api/userService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    periodId: z.string().min(1, 'O período é obrigatório'),
    professor: z.string().optional(),
    classroom: z.string().optional(),
    color: z.string().min(1, 'A cor é obrigatória'),
});

const AddSubject = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    const { data: periods, isLoading: isPeriodsLoading } = useQuery({
        queryKey: ['periods', user?.id],
        queryFn: () => getUserPeriods({ userId: user?.id! }),
        enabled: !!user?.id,
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            periodId: '',
            professor: '',
            classroom: '',
            color: '#3b82f6', // Default blue
        },
    });

    const { mutate: createSubjectMutate, isPending } = useMutation({
        mutationFn: createSubject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userSubjects'] });
            navigate('/subjects');
        },
        onError: (error) => {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage("An error occurred")
            }
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user?.id) return;

        createSubjectMutate({
            userId: user.id,
            ...values,
        });
    }

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex gap-4 my-4 mb-8 items-center">
                <Button variant="outline" className='shadow-none' size="icon" onClick={() => navigate('/subjects')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold">Adicionar Matéria</h1>
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
                                                    {period.name}
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
                            <p className="text-sm text-red-600 text-center">
                                {errorMessage}
                            </p>
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
        </main>
    );
};

export default AddSubject;
