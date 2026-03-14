import React from 'react'
import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useFocusSession } from '@/context/FocusSessionContext'
import FocusSessionSetup from './FocusSessionSetup'
import FocusSessionTimer from './FocusSessionTimer'
import FocusSessionActivityPicker from './FocusSessionActivityPicker'
import { Button } from '../ui/button'

function CompletionScreen() {
    const { lastSessionResult, openPopup } = useFocusSession()

    return (
        <div className="flex flex-col items-center gap-4 text-center py-4">
            <Star size={48} className="text-yellow-400 fill-yellow-400" />
            <div>
                <p className="text-xl font-bold">Sessão concluída!</p>
                {lastSessionResult && (
                    <p className="text-muted-foreground mt-1">
                        Você ganhou{' '}
                        <span className="text-primary font-semibold">
                            +{lastSessionResult.xpEarned} XP
                        </span>
                    </p>
                )}
            </div>
            <Button className="w-full" onClick={() => openPopup()}>
                Nova Sessão
            </Button>
        </div>
    )
}

function titleFor(phase: string, midSessionCompleting: boolean) {
    if (phase === 'completed') return 'Parabéns!'
    if (phase === 'running' && midSessionCompleting) return 'Atividade concluída'
    if (phase === 'running') return 'Sessão de Foco'
    return 'Iniciar Sessão'
}

export default function FocusSessionPopup() {
    const { isPopupOpen, phase, midSessionCompleting, minimizePopup, closePopup } = useFocusSession()

    function handleInteractOutside(e: Event) {
        // While running: minimize instead of close
        if (phase === 'running') {
            e.preventDefault()
            minimizePopup()
        }
        // If idle or completed: allow normal close
    }

    function handleOpenChange(open: boolean) {
        if (!open && phase !== 'running') {
            closePopup()
        }
    }

    return (
        <Dialog open={isPopupOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                showCloseButton={phase !== 'running'}
                onInteractOutside={handleInteractOutside}
                className="sm:max-w-md"
            >
                <DialogHeader>
                    <DialogTitle>{titleFor(phase, midSessionCompleting)}</DialogTitle>
                </DialogHeader>

                {phase === 'idle' && <FocusSessionSetup />}
                {phase === 'running' && !midSessionCompleting && <FocusSessionTimer />}
                {phase === 'running' && midSessionCompleting && <FocusSessionActivityPicker />}
                {phase === 'completed' && <CompletionScreen />}
            </DialogContent>
        </Dialog>
    )
}
