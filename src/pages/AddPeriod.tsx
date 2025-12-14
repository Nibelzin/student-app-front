import { createPeriod } from '@/api/periodService';
import { getUserPeriods } from '@/api/userService';
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
import { useCurrentUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    startDate: z.date().min(1, 'A data de início é obrigatória'),
    endDate: z.date().min(1, 'A data de término é obrigatória'),
    isCurrent: z.boolean().default(false),
});

const AddPeriod = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data: periods } = useQuery({
        queryKey: ['periods', user?.id],
        queryFn: () => getUserPeriods({ userId: user?.id! }),
        enabled: !!user?.id,
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            startDate: new Date(),
            endDate: new Date(),
            isCurrent: false,
        },
    });

    const { mutate: createPeriodMutate, isPending } = useMutation({
        mutationFn: createPeriod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['periods'] });
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

        createPeriodMutate({
            userId: user.id,
            name: values.name,
            startDate: values.startDate,
            endDate: values.endDate,
            isCurrent: values.isCurrent,
        });
    }

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex gap-4 my-4 mb-8 items-center">
                <Button variant="outline" className='shadow-none' size="icon" onClick={() => navigate('/subjects/new')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold">Adicionar Período</h1>
            </header>

            <Card className="max-w-full mx-auto p-4 shadow-none">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Período</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 1º Semestre" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Início</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Término</FormLabel>
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
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {(() => {
                                const currentYear = new Date().getFullYear();
                                const suggestions = [
                                    { name: '1º Semestre', start: new Date(currentYear, 0, 1), end: new Date(currentYear, 5, 30) },
                                    { name: '2º Semestre', start: new Date(currentYear, 6, 1), end: new Date(currentYear, 11, 31) },
                                    { name: '1º Trimestre', start: new Date(currentYear, 0, 1), end: new Date(currentYear, 2, 31) },
                                    { name: '2º Trimestre', start: new Date(currentYear, 3, 1), end: new Date(currentYear, 5, 30) },
                                    { name: '3º Trimestre', start: new Date(currentYear, 6, 1), end: new Date(currentYear, 8, 30) },
                                    { name: '4º Trimestre', start: new Date(currentYear, 9, 1), end: new Date(currentYear, 11, 31) },
                                ];

                                const availableSuggestions = suggestions.filter(suggestion => {
                                    // Check if suggestion overlaps with any existing period
                                    const hasOverlap = periods?.some(existing => {
                                        const existingStart = new Date(existing.startDate);
                                        const existingEnd = new Date(existing.endDate);
                                        // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
                                        return suggestion.start <= existingEnd && suggestion.end >= existingStart;
                                    });
                                    return !hasOverlap;
                                });

                                if (availableSuggestions.length === 0) return null;

                                return (
                                    <div className="w-full">
                                        <p className="text-sm text-muted-foreground mb-2">Sugestões Rápidas ({currentYear}):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSuggestions.map((suggestion) => (
                                                <Button
                                                    key={suggestion.name}
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        form.setValue('name', suggestion.name);
                                                        form.setValue('startDate', suggestion.start);
                                                        form.setValue('endDate', suggestion.end);
                                                    }}
                                                >
                                                    {suggestion.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        {errorMessage && (
                            <p className="text-sm text-red-600 text-center">
                                {errorMessage}
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/subjects/new')}>
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

            <div className='mt-8 max-w-full mx-auto'>
                <h3 className='text-lg font-semibold mb-4'>Períodos Existentes</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {periods?.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((period) => (
                        <Card key={period.id} className='p-4 shadow-none flex flex-col justify-between'>
                            <div>
                                <div className='flex items-center justify-between'>
                                    <h4 className='font-medium'>{period.name} ({new Date(period.startDate).getUTCFullYear()})</h4>
                                    {new Date() >= new Date(period.startDate) && new Date() <= new Date(period.endDate) && (
                                        <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit mt-2'>Atual</span>
                                    )}
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                    {new Date(period.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - {new Date(period.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                </p>
                            </div>
                        </Card>
                    ))}
                    {periods?.length === 0 && (
                        <p className='text-muted-foreground col-span-full'>Nenhum período cadastrado.</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AddPeriod;
