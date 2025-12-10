import { useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCurrentUser, useUserPreferences } from '@/hooks/use-user'
import { useQueryClient } from '@tanstack/react-query'
import { generateText } from '@/api/aiService'
import NotesGridItem from '@/components/grid/NotesGridItem'
import HomeGrid from '@/components/grid/HomeGrid'
import ActivitiesGridItem from '@/components/grid/ActivitiesGridItem'
import FilesGridItem from '@/components/grid/FilesGridItem'

const Home = () => {
    const queryClient = useQueryClient();

    const { data: user, isPending: isUserLoading } = useCurrentUser();
    const { data: userPreferences, isPending: isPreferencesLoading } = useUserPreferences(user?.id);

    const notesRef = useRef<HTMLDivElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);
    const activitiesRef = useRef<HTMLDivElement>(null);


    return (
        <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
            {/* Greeting */}
            <header className="m-4">
                <h1 className="text-2xl tracking-tight text-balance font-semibold">Olá, {user?.name.split(' ')[0]}</h1>
                <p className="text-sm text-neutral-600">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </header>

            <HomeGrid userPreferences={userPreferences} isLoading={isPreferencesLoading || isUserLoading}>
                <ActivitiesGridItem user={user} queryClient={queryClient} ref={activitiesRef} />
                <NotesGridItem user={user} queryClient={queryClient} ref={notesRef} />
                <FilesGridItem user={user} queryClient={queryClient} ref={filesRef} />
            </HomeGrid>
        </main>
    )
}

export default Home
