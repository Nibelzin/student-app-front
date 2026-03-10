import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, Trophy, Target, Zap, Clock, Play, Pause, RotateCcw, Medal } from "lucide-react"

export default function GamificationTest() {
    // ---- XP e Nível State ----
    const [xp, setXp] = useState(350)
    const xpParaProximoNivel = 500
    const nivel = Math.floor(xp / 500) + 1
    const progressoNivel = (xp % 500) / 500 * 100

    // ---- Ofensiva (Streaks) State ----
    const [streak, setStreak] = useState(3)

    // ---- Moedas/Pontos State ----
    const [coins, setCoins] = useState(120)

    // ---- Pomodoro/Focus Timer State ----
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutos em segundos
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((timeLeft) => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer acabou, ganha recompensa!
            setIsActive(false)
            setXp(prev => prev + 50)
            setCoins(prev => prev + 10)
            setTimeLeft(25 * 60)
            alert("Sessão de foco concluída! Você ganhou 50 XP e 10 Moedas!")
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(25 * 60)
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Ações simuladas
    const completarAtividade = () => {
        setXp(prev => prev + 100)
        setCoins(prev => prev + 5)
    }

    const aumentarOfensiva = () => {
        setStreak(prev => prev + 1)
    }

    return (
        <div className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Laboratório de Gamificação 🎮</h1>
                <p className="text-muted-foreground mt-2">
                    Brinque com essas mecânicas para ver como o aplicativo pode se tornar mais viciante (no bom sentido).
                </p>
            </div>

            {/* Top Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-none bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-500 text-white rounded-xl">
                            <Flame size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Ofensiva</p>
                            <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">{streak} dias</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/10 border-yellow-200 dark:border-yellow-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-500 text-white rounded-xl">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Nível Atual</p>
                            <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">Nv. {nivel}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-xl">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total XP</p>
                            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{xp}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500 text-white rounded-xl">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Moedas</p>
                            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{coins}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna 1 & 2: Progresso e Ações */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Barra de Progresso de XP */}
                    <Card className="shadow-none border-dashed bg-card/50">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span>Progresso para Nível {nivel + 1}</span>
                                <span className="text-sm font-normal text-muted-foreground">{xp % xpParaProximoNivel} / {xpParaProximoNivel} XP</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min(progressoNivel, 100)}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                Complete tarefas ou use o timer de foco para ganhar XP.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Simulador de Ações */}
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Painel do Simulador</CardTitle>
                            <CardDescription>
                                Clique nos botões para simular ações no aplicativo e ver as recompensas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button onClick={completarAtividade} className="gap-2">
                                <Medal size={16} /> Completar Atividade (+100 XP, +5 Moedas)
                            </Button>
                            <Button onClick={aumentarOfensiva} variant="outline" className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950">
                                <Flame size={16} /> Entrar Hoje (+1 Dia Ofensiva)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna 3: Timer de Foco */}
                <div>
                    <Card className="shadow-2xl shadow-primary/10 border-primary/20 text-center relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                                <Clock className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle>Modo Foco</CardTitle>
                            <CardDescription>
                                Concentre-se por 25min para ganhar 50 XP e 10 Moedas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-6xl font-black text-primary tracking-tighter font-mono">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="flex justify-center gap-4">
                                <Button
                                    size="lg"
                                    className={isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary text-primary-foreground"}
                                    onClick={toggleTimer}
                                >
                                    {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                                    {isActive ? "Pausar" : "Começar"}
                                </Button>
                                <Button size="lg" variant="outline" onClick={resetTimer}>
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <h3 className="font-bold flex items-center gap-2 mb-2"><Trophy className="w-5 h-5" /> Sugestões de Recompensas Furturas</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Usar "Moedas" para comprar customizações de perfil (novos avatares, fundos diferentes para as matérias).</li>
                    <li>Ganhar "Insígnias" por marcos (ex: "Semana Perfeita", "Mestre em Cálculo").</li>
                    <li>Pequenos animais virtuais que crescem conforme você ganha XP.</li>
                </ul>
            </div>
        </div>
    )
}
