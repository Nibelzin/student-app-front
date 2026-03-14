import type { User } from '@/types/types'
import React from 'react'
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'

interface FocusSessionPopupProps {
    isOpen: boolean
    onClose: () => void
    user?: User
}

const FocusSessionPopup = ({ isOpen, onClose, user }: FocusSessionPopupProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <h2 className="text-lg font-semibold">Sessão de Foco</h2>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default FocusSessionPopup