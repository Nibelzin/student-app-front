import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'search-history'
const MAX_ITEMS = 8

let listeners: (() => void)[] = []
let cachedRaw: string | null = null
let cachedParsed: string[] = []

const EMPTY: string[] = []

function emitChange() {
  // Invalidate cache so next getSnapshot() re-parses
  cachedRaw = null
  for (const listener of listeners) listener()
}

function getSnapshot(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedParsed
  cachedRaw = raw
  try {
    cachedParsed = raw ? JSON.parse(raw) : EMPTY
  } catch {
    cachedParsed = EMPTY
  }
  return cachedParsed
}

function getServerSnapshot(): string[] {
  return EMPTY
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function useSearchHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addTerm = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    const current = getSnapshot()
    const next = [trimmed, ...current.filter((t) => t !== trimmed)].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    emitChange()
  }, [])

  const removeTerm = useCallback((term: string) => {
    const current = getSnapshot()
    const next = current.filter((t) => t !== term)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    emitChange()
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    emitChange()
  }, [])

  return { history, addTerm, removeTerm, clear }
}
