import { getActivities } from '@/api/activitiyService';
import { useCurrentUser } from '@/hooks/use-user';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ActivityItem } from '@/components/grid/ActivitiesGridItem'; // I might need to export ActivityItem from ActivitiesGridItem or duplicate it. 
// It wasn't exported in the previous view, so I'll need to export it or copy it.
// Checking previous view of ActivitiesGridItem: line 19 "const ActivityItem = ..." - not exported.
// I will start by modifying ActivitiesGridItem to export ActivityItem so I can reuse it.

const Activities = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined);
    const [isOverdue, setIsOverdue] = useState<boolean | undefined>(undefined);

    const { data: activitiesPage } = useQuery({
        queryKey: ['activities', user?.id, isCompleted, isOverdue],
        queryFn: () => getActivities({
            userId: user?.id,
            isCompleted: isCompleted,
            isOverdue: isOverdue,
            // No size limit or larger size
            size: 100
        }),
        enabled: !!user?.id
    });

    const activities = activitiesPage?.content || [];

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-semibold">Todas as Atividades</h1>
                </div>
                <Button onClick={() => navigate('/activities/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Atividade
                </Button>
            </header>

            <div className='bg-white h-full p-4 rounded-md border'>
                <div className="mb-6 flex gap-2">
                    <Toggle
                        pressed={isCompleted === true}
                        onPressedChange={(pressed) => {
                            setIsCompleted(pressed ? true : undefined)
                        }}
                        aria-label="Toggle completed"
                    >
                        <CheckCircle2 size={16} className="mr-2" /> Concluídas
                    </Toggle>
                    <Toggle
                        pressed={isOverdue === true}
                        onPressedChange={(pressed) => setIsOverdue(pressed ? true : undefined)}
                        aria-label="Toggle overdue"
                    >
                        <AlertCircle size={16} className="mr-2" /> Atrasadas
                    </Toggle>
                </div>

                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                        <CheckCircle2 size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">Nenhuma atividade encontrada</p>
                        <p className="text-sm">Tente ajustar os filtros ou crie uma nova atividade.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activities.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(activity => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Activities;
