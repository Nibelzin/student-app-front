import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
  Search,
  Clock,
  X,
} from 'lucide-react'
import { useSearchData } from '@/hooks/use-search-data'
import { useSearch, type SearchResult, type SearchResultType } from '@/hooks/use-search'
import { useSearchHistory } from '@/hooks/use-search-history'
import { cn } from '@/lib/utils'

const GROUP_CONFIG: Record<
  SearchResultType,
  { label: string; icon: React.ElementType; color: string }
> = {
  subject: { label: 'Matérias', icon: BookOpen, color: 'text-purple-500' },
  note: { label: 'Notas', icon: FileText, color: 'text-amber-500' },
  activity: { label: 'Atividades', icon: ClipboardList, color: 'text-blue-500' },
  assessment: { label: 'Provas', icon: GraduationCap, color: 'text-red-500' },
}

const GROUPS: SearchResultType[] = ['subject', 'note', 'activity', 'assessment']

function getGroupKey(type: SearchResultType) {
  return type === 'subject' ? 'subjects' : type === 'note' ? 'notes' : type === 'activity' ? 'activities' : 'assessments'
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)

  const { data, isLoading } = useSearchData(true)
  const { results, totalResults, debouncedQuery } = useSearch(data, query)
  const { history, addTerm, removeTerm } = useSearchHistory()

  // Sync query param
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed) {
      setSearchParams({ q: trimmed }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [query, setSearchParams])

  // // Save to history on debounced query change
  // useEffect(() => {
  //   if (debouncedQuery) addTerm(debouncedQuery)
  // }, [debouncedQuery, addTerm])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      if (debouncedQuery) addTerm(debouncedQuery)

      navigate(result.navigateTo)
    },
    [navigate, addTerm, debouncedQuery],
  )

  const handleHistoryClick = useCallback((term: string) => {
    setQuery(term)
    inputRef.current?.focus()
  }, [])

  const showEmpty = !query.trim()
  const showNoResults = !!debouncedQuery && totalResults === 0 && !isLoading
  const showResults = !!debouncedQuery && totalResults > 0

  return (
    <main className="mx-auto w-full max-w-screen-lg p-4 sm:p-6 md:p-8 mb-16">
      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar matérias, notas, atividades e provas..."
          className="h-14 pl-12 pr-4 text-lg rounded-xl"
        />
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state: recent searches + hint */}
      {showEmpty && !isLoading && (
        <div className="space-y-6">
          {history.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Buscas recentes
              </h2>
              <div className="flex flex-wrap gap-2">
                {history.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleHistoryClick(term)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                  >
                    <span>{term}</span>
                    <span
                      role="button"
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-background transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTerm(term)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Pesquise por matérias, notas, atividades e provas
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Dica: use <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Ctrl+K</kbd> para busca rápida em qualquer tela
            </p>
          </div>
        </div>
      )}

      {/* No results */}
      {showNoResults && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg text-muted-foreground">
            Nenhum resultado para "<span className="font-medium text-foreground">{debouncedQuery}</span>"
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Tente buscar com termos diferentes
          </p>
        </div>
      )}

      {/* Results grouped by section */}
      {showResults && (
        <div className="space-y-8">
          {GROUPS.map((type) => {
            const items = results[getGroupKey(type)]
            if (items.length === 0) return null

            const config = GROUP_CONFIG[type]
            const Icon = config.icon

            return (
              <section key={type}>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', config.color)} />
                  {config.label}
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {items.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors flex items-center gap-3"
                    >
                      <Icon className={cn('h-5 w-5 shrink-0', config.color)} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default SearchPage
