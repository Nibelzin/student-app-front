import { getActivities, getMaterialsByActivity } from '@/api/activitiyService';
import { getSubjectMaterials } from '@/api/subjectService';
import { getUserSubjects } from '@/api/userService';
import type { Activity, Material, Page, Subject, User } from '@/types/types';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronDown,
    ChevronRight,
    ExternalLink,
    File as FileIcon,
    FileText,
    Folder,
    GripVertical,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    Plus
} from 'lucide-react';
import React, { forwardRef, useState } from 'react';

interface FilesGridItemProps {
    user: User | undefined
    queryClient: QueryClient
}

const FileItem = ({ material }: { material: Material }) => {
    const handleClick = () => {
        if (material.fileUrl) {
            window.open(material.fileUrl, '_blank');
        } else if (material.externalUrl) {
            window.open(material.externalUrl, '_blank');
        }
    };

    const getIcon = () => {
        if (material.type === 'link' || material.externalUrl) return <LinkIcon size={16} className="text-blue-500" />;
        if (material.type?.includes('image')) return <ImageIcon size={16} className="text-purple-500" />;
        if (material.type?.includes('pdf')) return <FileText size={16} className="text-red-500" />;
        return <FileIcon size={16} className="text-gray-500" />;
    };

    return (
        <div
            className="flex items-center gap-2 py-1 px-2 hover:bg-blue-50 cursor-pointer rounded text-sm text-neutral-700 ml-6"
            onClick={handleClick}
        >
            {getIcon()}
            <span className="truncate">{material.title}</span>
            {material.externalUrl && <ExternalLink size={12} className="opacity-50 ml-auto" />}
        </div>
    );
};

const ActivityFolder = ({ activity }: { activity: Activity }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: materials, isLoading } = useQuery({
        queryKey: ['materials', 'activity', activity.id],
        queryFn: () => getMaterialsByActivity(activity.id),
        enabled: isOpen,
    });

    return (
        <div className="ml-4">
            <div
                className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded text-sm text-neutral-800"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                <Folder size={16} className="text-blue-400 fill-blue-100" />
                <span className="truncate">{activity.title}</span>
            </div>
            {isOpen && (
                <div className="border-l border-gray-100 ml-2 pl-1">
                    {isLoading ? (
                        <div className="py-1 px-6 text-xs text-gray-400 flex items-center gap-2">
                            <Loader2 size={10} className="animate-spin" /> Carregando...
                        </div>
                    ) : (
                        <>
                            {materials?.length === 0 && (
                                <div className="py-1 px-6 text-xs text-gray-400 italic">Vazio</div>
                            )}
                            {materials?.map(material => (
                                <FileItem key={material.id} material={material} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const SubjectFolder = ({ subject, userId }: { subject: Subject; userId: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: activities, isLoading: isLoadingActivities } = useQuery({
        queryKey: ['activities', 'subject', subject.id],
        queryFn: async () => {
            const result = await getActivities({ userId, subjectId: subject.id, size: 100 });
            return result.content;
        },
        enabled: isOpen,
    });

    const { data: materials, isLoading: isLoadingMaterials } = useQuery({
        queryKey: ['materials', 'subject', subject.id],
        queryFn: async () => {
            const result = await getSubjectMaterials(subject.id);
            // Handle both pagination (Page<Material>) and list (Material[])
            const list = Array.isArray(result) ? result : (result as any).content || [];
            return list as Material[];
        },
        enabled: isOpen,
    });

    const isLoading = isLoadingActivities || isLoadingMaterials;

    return (
        <div>
            <div
                className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded text-sm font-medium text-neutral-800"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                <Folder size={16} className="text-yellow-500 fill-yellow-100" style={{ color: subject.color, fill: `${subject.color}20` }} />
                <span className="truncate">{subject.name}</span>
            </div>
            {isOpen && (
                <div className="border-l border-gray-100 ml-2 pl-1">
                    {isLoading ? (
                        <div className="py-1 px-6 text-xs text-gray-400 flex items-center gap-2">
                            <Loader2 size={10} className="animate-spin" /> Carregando...
                        </div>
                    ) : (
                        <>
                            {(activities?.length === 0 && materials?.length === 0) && (
                                <div className="py-1 px-6 text-xs text-gray-400 italic">Vazio</div>
                            )}
                            {/* Materials first? Or Activities? Usually folders first. */}
                            {activities?.map(activity => (
                                <ActivityFolder key={activity.id} activity={activity} />
                            ))}
                            {materials?.map(material => (
                                (!material.activityId) && <FileItem key={material.id} material={material} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const FilesGridItem = forwardRef<HTMLDivElement, FilesGridItemProps>(({ user, queryClient }, ref) => {
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
            <div className='grid-stack-item-content bg-white flex flex-col rounded-md shadow-sm border border-neutral-200 overflow-hidden'>
                <div className='flex items-center justify-between mb-0 p-3 gap-2 border-b border-neutral-100'>
                    <div className='flex items-center gap-2'>
                        <GripVertical size={20} className='handle cursor-pointer text-neutral-400' />
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Arquivos</h2>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <div className='flex gap-4'>
                            <Plus className='cursor-pointer hover:text-blue-500 transition-colors' size={20} />
                            <ExternalLink className='cursor-pointer hover:text-blue-500 transition-colors' size={20} />
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