import { useEffect, useRef } from 'react'

interface UseFocusTimerParams {
    isRunning: boolean
    onTick: () => void
}

export function useFocusTimer({ isRunning, onTick }: UseFocusTimerParams) {
    const onTickRef = useRef(onTick)

    useEffect(() => {
        onTickRef.current = onTick
    }, [onTick])

    useEffect(() => {
        if (!isRunning) return

        const interval = setInterval(() => {
            onTickRef.current()
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning])
}
