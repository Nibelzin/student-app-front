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
import coverImage from '../assets/fundo-espaco.jpg'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Home = () => {
    const queryClient = useQueryClient();

    const { data: user, isPending: isUserLoading } = useCurrentUser();
    const { data: userPreferences, isPending: isPreferencesLoading } = useUserPreferences(user?.id);

    const notesRef = useRef<HTMLDivElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);
    const activitiesRef = useRef<HTMLDivElement>(null);

    const xpToNextLevel = user?.currentLevel! * 100;
    const currentLevelProgressPercentage = Math.min(user?.currentXp!, xpToNextLevel) / xpToNextLevel * 100;

    return (
        <div className="flex flex-col w-full pb-16">
            {/* Notion-style Cover Image */}
            <div className="w-full h-48 md:h-48 lg:h-48 relative group">
                <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-12 lg:px-12 xl:px-24 2xl:px-0 relative">
                {/* Greeting / Profile Area */}
                <header className="flex mb-8 flex-col items-start pt-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center text-4xl md:text-5xl border-4 border-white dark:border-neutral-900 -mt-16 md:-mt-20 mb-4 overflow-hidden z-10">
                        🎓
                    </div>
                    <div className='w-full flex flex-col items-center'>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Olá, {user?.name ? user.name.split(' ')[0] : 'Estudante'}
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1 dark:text-neutral-400 text-center">
                            Hoje é {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>
                </header>
                <div className='flex flex-col space-y-2'>
                    <Card className="shadow-none border-dashed rounded-sm bg-background mx-2">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span>Progresso para Nível {user?.currentLevel! + 1}</span>
                                <span className="text-sm font-normal text-muted-foreground">{user?.currentXp!} / {xpToNextLevel} XP</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 dark:bg-white transition-all duration-500 ease-out"
                                    style={{ width: `${currentLevelProgressPercentage}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                Complete tarefas ou use o timer de foco para ganhar XP.
                            </p>
                        </CardContent>
                    </Card>
                    <HomeGrid userPreferences={userPreferences} isLoading={isPreferencesLoading || isUserLoading}>
                        <ActivitiesGridItem user={user} queryClient={queryClient} ref={activitiesRef} />
                        <NotesGridItem user={user} queryClient={queryClient} ref={notesRef} />
                        <FilesGridItem user={user} queryClient={queryClient} ref={filesRef} />
                    </HomeGrid>
                </div>
            </main>
        </div>
    )
}

export default Home
