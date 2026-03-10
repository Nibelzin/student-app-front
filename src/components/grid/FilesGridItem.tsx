import { getUserSubjects } from '@/api/userService';
import type { Page, Subject, User } from '@/types/types';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import {
    ExternalLink,
    GripVertical,
    Loader2,
    Plus
} from 'lucide-react';
import { forwardRef } from 'react';
import { SubjectFolder } from '../files/FileExplorerItem';

import { useNavigate } from 'react-router';

interface FilesGridItemProps {
    user: User | undefined
    queryClient: QueryClient
}

const FilesGridItem = forwardRef<HTMLDivElement, FilesGridItemProps>(({ user, queryClient }, ref) => {
    const navigate = useNavigate();
    const { data: subjects, isLoading } = useQuery({
        queryKey: ['subjects', user?.id],
        queryFn: () => {
            if (!user) return Promise.resolve(null as unknown as Page<Subject>);
            return getUserSubjects({ userId: user.id, size: 100 });
        },
        enabled: !!user,
    });

    return (
        <div className='grid-stack-item' gs-id="files" gs-w="6" gs-h="8" ref={ref}>
            <div className='grid-stack-item-content bg-background flex flex-col border rounded-sm overflow-hidden'>
                <div className='flex items-center justify-between mb-0 p-3 gap-2'>
                    <div className='flex items-center gap-2'>
                        <GripVertical size={20} className='handle cursor-pointer' />
                        <h2 className="text-sm font-semibold uppercase tracking-wide">Arquivos</h2>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <div className='flex gap-4'>
                            <Plus className='cursor-pointer hover:text-blue-500 transition-colors' size={20} />
                            <ExternalLink className='cursor-pointer hover:text-blue-500 transition-colors' size={20} onClick={() => navigate('/files')} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-neutral-400">
                            <Loader2 className="animate-spin mr-2" /> Carregando...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {subjects?.content.map(subject => (
                                <SubjectFolder key={subject.id} subject={subject} userId={user?.id || ''} />
                            ))}
                            {subjects?.content.length === 0 && (
                                <div className="text-center text-sm text-neutral-400 mt-10">
                                    Nenhuma matéria encontrada
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})

export default FilesGridItem