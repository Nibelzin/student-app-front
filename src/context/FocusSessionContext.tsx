import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Activity } from '@/types/types'
import { awardFocusSessionXP, createFocusSession, type FocusSessionResponse } from '@/api/focusSessionService'
import { getActivityById, updateActivity } from '@/api/activitiyService'
import { useFocusTimer } from '@/hooks/use-focus-timer'
import { useCurrentUser } from '@/hooks/use-user'
import confetti from 'canvas-confetti'

export type FocusPhase = 'idle' | 'running' | 'completed'

interface FocusSessionState {
    phase: FocusPhase
    isPopupOpen: boolean
    isMinimized: boolean
    totalSeconds: number
    elapsedSeconds: number
    selectedActivity: Activity | null
    midSessionCompleting: boolean
    lastSessionResult: FocusSessionResponse | null
}

interface FocusSessionContextValue extends FocusSessionState {
    remainingSeconds: number
    openPopup: () => void
    closePopup: () => void
    minimizePopup: () => void
    maximizePopup: () => void
    startSession: (minutes: number, activity: Activity | null) => void
    completeActivity: (clickOrigin: { x: number, y: number } | null) => void
    selectNewActivity: (activity: Activity | null) => void
    updateSelectedActivity: (activityId: string) => Promise<void>
    endSession: () => void
}

const FocusSessionContext = createContext<FocusSessionContextValue | null>(null)

const TIME_AWARD_INTERVAL = 180 // seconds

export function useFocusSession() {
    const ctx = useContext(FocusSessionContext)
    if (!ctx) throw new Error('useFocusSession must be used within FocusSessionProvider')
    return ctx
}

export function FocusSessionProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const { data: user } = useCurrentUser()

    const [phase, setPhase] = useState<FocusPhase>('idle')
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [totalSeconds, setTotalSeconds] = useState(25 * 60)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
    const [midSessionCompleting, setMidSessionCompleting] = useState(false)
    const [lastSessionResult, setLastSessionResult] = useState<FocusSessionResponse | null>(null)


    // Refs so async callbacks always read current values
    const elapsedRef = useRef(0)
    const totalRef = useRef(totalSeconds)
    const selectedActivityRef = useRef<Activity | null>(null)
    const isCompletingRef = useRef(false) // prevent double-fire in StrictMode
    const clickOriginRef = useRef<{ x: number, y: number } | null>(null)

    useEffect(() => { totalRef.current = totalSeconds }, [totalSeconds])
    useEffect(() => { selectedActivityRef.current = selectedActivity }, [selectedActivity])

    const handleTimerComplete = useCallback(async () => {
        if (isCompletingRef.current) return
        isCompletingRef.current = true

        setPhase('idle')
        const total = totalRef.current
        const activity = selectedActivityRef.current

        try {
            const result = await createFocusSession({
                durationSeconds: total,
                isCompleted: true,
                userId: user!.id,
                activityId: activity?.id,
            })
            setLastSessionResult(result)
            toast.success(`Sessão concluída! +${result.xpEarned} XP`, {
                description: 'Continue assim para subir de nível!',
                duration: 5000,
            })
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
        } catch {
            toast.error('Erro ao salvar sessão')
        }

        setElapsedSeconds(0)
        elapsedRef.current = 0
        setIsMinimized(false)
        setIsPopupOpen(true)
        setPhase('completed')
        isCompletingRef.current = false
    }, [user, queryClient])

    // Tick: increment elapsed by 1 second
    const onTick = useCallback(() => {
        setElapsedSeconds(prev => {
            const next = prev + 1
            elapsedRef.current = next
            return next
        })
    }, [])

    // When elapsed reaches total while running, fire completion
    useEffect(() => {
        if (phase === 'running' && elapsedSeconds > 0 && elapsedSeconds >= totalSeconds) {
            handleTimerComplete()
        }
    }, [elapsedSeconds, totalSeconds, phase, handleTimerComplete])

    // Award XP every 3 minutes while running
    useEffect(() => {
        if (phase !== 'running' || elapsedSeconds === 0 || elapsedSeconds % TIME_AWARD_INTERVAL !== 0) return

        awardFocusSessionXP()
            .then(result => {
                toast.success(`+XP por manter o foco!`, {
                    description: `Continue assim! Nível ${result.currentLevel} · ${result.currentXp} XP`,
                    duration: 4000,
                })
            })
            .then(() => queryClient.invalidateQueries({ queryKey: ['user', 'me'] }))
            .catch(() => {/* silent */})
    }, [elapsedSeconds, phase])

    useFocusTimer({
        isRunning: phase === 'running' && elapsedSeconds < totalSeconds,
        onTick,
    })

    const openPopup = useCallback(() => {
        if (phase === 'completed') {
            setPhase('idle')
            setLastSessionResult(null)
            setElapsedSeconds(0)
            elapsedRef.current = 0
            setSelectedActivity(null)
        }
        setIsPopupOpen(true)
        setIsMinimized(false)
    }, [phase])

    const closePopup = useCallback(() => {
        setIsPopupOpen(false)
        setIsMinimized(false)
    }, [])

    const minimizePopup = useCallback(() => {
        setIsPopupOpen(false)
        setIsMinimized(true)
    }, [])

    const maximizePopup = useCallback(() => {
        setIsPopupOpen(true)
        setIsMinimized(false)
    }, [])

    const startSession = useCallback((minutes: number, activity: Activity | null) => {
        const secs = minutes * 60
        setTotalSeconds(secs)
        totalRef.current = secs
        setElapsedSeconds(0)
        elapsedRef.current = 0
        setSelectedActivity(activity)
        selectedActivityRef.current = activity
        setMidSessionCompleting(false)
        setLastSessionResult(null)
        isCompletingRef.current = false
        setPhase('running')
    }, [])

    const updateSelectedActivity = useCallback(async (activityId: string) => {
        const activity = await getActivityById(activityId)
        setSelectedActivity(activity)
        selectedActivityRef.current = activity
    }, [])

    const completeActivity = useCallback(async (clickOrigin: { x: number, y: number } | null) => {
        const activity = selectedActivityRef.current
        clickOriginRef.current = clickOrigin
        if (!activity) return

        try {
            await updateActivity({ id: activity.id, isCompleted: true })
            await createFocusSession({
                durationSeconds: elapsedRef.current,
                isCompleted: false,
                userId: user!.id,
                activityId: activity.id,
            })
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
            confetti({
                particleCount: 100,
                spread: 150,
                origin: clickOriginRef.current || { y: 0.6 }
            })
            toast.success('Atividade concluída!')
        } catch {
            toast.error('Erro ao salvar progresso da atividade')
        }

        setElapsedSeconds(0)
        elapsedRef.current = 0
        setMidSessionCompleting(true)
    }, [user, queryClient])

    const selectNewActivity = useCallback((activity: Activity | null) => {
        setSelectedActivity(activity)
        selectedActivityRef.current = activity
        setMidSessionCompleting(false)
    }, [])

    const endSession = useCallback(async () => {
        setPhase('idle')
        const elapsed = elapsedRef.current
        const activity = selectedActivityRef.current

        try {
            if (elapsed > 0) {
                await createFocusSession({
                    durationSeconds: elapsed,
                    isCompleted: false,
                    userId: user!.id,
                    activityId: activity?.id,
                })
            }
            toast.info('Sessão encerrada')
        } catch {
            toast.error('Erro ao salvar sessão')
        }

        setElapsedSeconds(0)
        elapsedRef.current = 0
        setSelectedActivity(null)
        setMidSessionCompleting(false)
        setIsPopupOpen(false)
        setIsMinimized(false)
    }, [user])

    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

    return (
        <FocusSessionContext.Provider value={{
            phase,
            isPopupOpen,
            isMinimized,
            totalSeconds,
            elapsedSeconds,
            selectedActivity,
            midSessionCompleting,
            lastSessionResult,
            remainingSeconds,
            openPopup,
            closePopup,
            minimizePopup,
            maximizePopup,
            startSession,
            completeActivity,
            selectNewActivity,
            updateSelectedActivity,
            endSession
        }}>
            {children}
        </FocusSessionContext.Provider>
    )
}
