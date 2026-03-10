import { getUserSubjects } from '@/api/userService';
import { SubjectFolder } from '@/components/files/FileExplorerItem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-user';
import type { Page, Subject } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, FolderOpen, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

const Files = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();

    const { data: subjects, isLoading } = useQuery({
        queryKey: ['subjects', user?.id],
        queryFn: () => {
            if (!user) return Promise.resolve(null as unknown as Page<Subject>);
            return getUserSubjects({ userId: user.id, size: 100 });
        },
        enabled: !!user,
    });

    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-semibold">Meus Arquivos</h1>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Novo Arquivo
                </Button>
            </header>

            <Card className="min-h-[500px] p-4 shadow-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-neutral-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p>Carregando arquivos...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {subjects?.content.map(subject => (
                            <SubjectFolder key={subject.id} subject={subject} userId={user?.id || ''} />
                        ))}
                        {subjects?.content.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[400px] text-neutral-500">
                                <FolderOpen size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
                                <p className="text-sm">Seus arquivos organizados por matéria aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </main>
    );
};

export default Files;
