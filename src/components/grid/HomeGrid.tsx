import { useGridStack } from '@/hooks/use-gridstack'
import type { UserPreferences } from '@/types/types'
import { type ReactNode } from 'react'

interface HomeGridProps {
    userPreferences?: UserPreferences
    isLoading: boolean
    children: ReactNode
}

const HomeGrid = ({ userPreferences, isLoading, children }: HomeGridProps) => {
    const { isReady: isGridReady } = useGridStack(userPreferences, isLoading);

    return (
        <div className={` grid-stack ${isGridReady ? 'grid-ready' : ''}`}>
            {children}
        </div>
    )
}

export default HomeGrid