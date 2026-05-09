import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import {
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
  Clock,
  X,
  ArrowRight,
} from 'lucide-react'
import { useSearchData } from '@/hooks/use-search-data'
import { useSearch, type SearchResult, type SearchResultType } from '@/hooks/use-search'
import { useSearchHistory } from '@/hooks/use-search-history'

const GROUP_CONFIG: Record<
  SearchResultType,
  { label: string; icon: React.ElementType }
> = {
  subject: { label: 'Matérias', icon: BookOpen },
  note: { label: 'Notas', icon: FileText },
  activity: { label: 'Atividades', icon: ClipboardList },
  assessment: { label: 'Provas', icon: GraduationCap },
}

const MAX_PER_GROUP = 5

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const hasOpened = useRef(false)

  // Only fetch data after the palette has been opened at least once
  if (open && !hasOpened.current) hasOpened.current = true
  const { data, isLoading } = useSearchData(hasOpened.current)
  const { results, totalResults, debouncedQuery } = useSearch(data, query)
  const { history, addTerm, removeTerm } = useSearchHistory()

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (query.trim()) addTerm(query.trim())
      setOpen(false)
      setQuery('')
      navigate(result.navigateTo)
    },
    [navigate, addTerm, query],
  )

  const handleViewAll = useCallback(() => {
    if (query.trim()) addTerm(query.trim())
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }, [navigate, addTerm, query])

  const handleHistorySelect = useCallback(
    (term: string) => {
      setQuery(term)
    },
    [],
  )

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setQuery('')
  }

  const showHistory = !debouncedQuery && history.length > 0
  const showResults = !!debouncedQuery
  const groups = (['subject', 'note', 'activity', 'assessment'] as const).filter(
    (type) => results[`${type === 'subject' ? 'subjects' : type === 'note' ? 'notes' : type === 'activity' ? 'activities' : 'assessments'}`].length > 0,
  )

  const getGroupResults = (type: SearchResultType): SearchResult[] => {
    const key = type === 'subject' ? 'subjects' : type === 'note' ? 'notes' : type === 'activity' ? 'activities' : 'assessments'
    return results[key]
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Busca"
      description="Pesquise por matérias, notas, atividades e provas"
    >
      <CommandInput
        placeholder="Pesquisar..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {showResults && totalResults === 0 && (
          <CommandEmpty>
            Nenhum resultado para "{debouncedQuery}"
          </CommandEmpty>
        )}

        {showHistory && (
          <CommandGroup heading="Buscas recentes">
            {history.map((term) => (
              <CommandItem
                key={term}
                value={`history-${term}`}
                onSelect={() => handleHistorySelect(term)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{term}</span>
                </div>
                <button
                  className="opacity-0 group-data-[selected=true]:opacity-100 hover:opacity-100 p-0.5 rounded-sm hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTerm(term)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {showResults &&
          groups.map((type, i) => {
            const config = GROUP_CONFIG[type]
            const Icon = config.icon
            const items = getGroupResults(type)
            const capped = items.slice(0, MAX_PER_GROUP)
            const hasMore = items.length > MAX_PER_GROUP

            return (
              <div key={type}>
                {i > 0 && <CommandSeparator />}
                <CommandGroup heading={config.label}>
                  {capped.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.type}-${result.id}-${result.title}`}
                      onSelect={() => handleSelect(result)}
                    >
                      <Icon className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {hasMore && (
                    <CommandItem
                      value={`view-all-${type}`}
                      onSelect={handleViewAll}
                      className="text-muted-foreground"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Ver todos os resultados
                    </CommandItem>
                  )}
                </CommandGroup>
              </div>
            )
          })}

        {showResults && totalResults > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="view-all-results"
                onSelect={handleViewAll}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ver todos os resultados para "{debouncedQuery}"
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!showResults && !showHistory && !isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Pesquise por matérias, notas, atividades e provas
          </div>
        )}
      </CommandList>
    </CommandDialog>
  )
}
