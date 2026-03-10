import { getActivities, getMaterialsByActivity } from '@/api/activitiyService';
import { getSubjectMaterials } from '@/api/subjectService';
import type { Activity, Material, Subject } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronDown,
    ChevronRight,
    ExternalLink,
    File as FileIcon,
    FileText,
    Folder,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2
} from 'lucide-react';
import { useState } from 'react';

export const FileItem = ({ material }: { material: Material }) => {
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

export const ActivityFolder = ({ activity }: { activity: Activity }) => {
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

export const SubjectFolder = ({ subject, userId }: { subject: Subject; userId: string }) => {
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
