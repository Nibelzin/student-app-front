import type { User } from '@/types/types';
import type { QueryClient } from '@tanstack/react-query';
import { GripVertical } from 'lucide-react';
import React, { forwardRef } from 'react'

interface FilesGridItemProps {
  user: User | undefined
  queryClient: QueryClient
}

const FilesGridItem = forwardRef<HTMLDivElement, FilesGridItemProps>(({ user, queryClient }, ref) => {
    return (
        <div className='grid-stack-item' gs-id="files" gs-w="6" gs-h="4" ref={ref}>
            <div className='grid-stack-item-content bg-white p-4 rounded-md border'>
                <div className='flex items-center mb-4 gap-2'>
                    <GripVertical size={20} className='handle cursor-pointer' />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Arquivos</h2>
                </div>

            </div>
        </div>
    )
})

export default FilesGridItem