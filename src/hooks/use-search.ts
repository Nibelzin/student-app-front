import { useMemo } from 'react'
import { useDebounce } from './use-debounce'
import { safeParseNoteContent } from '@/lib/utils'
import type { SearchableData } from './use-search-data'
import type { Subject, Note, Activity, Assessment } from '@/types/types'

export type SearchResultType = 'subject' | 'note' | 'activity' | 'assessment'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  navigateTo: string
}

export interface SearchResults {
  subjects: SearchResult[]
  notes: SearchResult[]
  activities: SearchResult[]
  assessments: SearchResult[]
}

const EMPTY_RESULTS: SearchResults = {
  subjects: [],
  notes: [],
  activities: [],
  assessments: [],
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function extractNoteText(content: string): string {
  const doc = safeParseNoteContent(content)
  const texts: string[] = []

  function walk(node: any) {
    if (node.type === 'text' && node.text) {
      texts.push(node.text)
    }
    if (node.type === 'mention' && node.attrs?.label) {
      texts.push(node.attrs.label)
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk)
    }
  }

  walk(doc)
  return texts.join(' ')
}

function matchScore(text: string, query: string): number {
  const normText = normalize(text)
  const normQuery = normalize(query)
  if (normText.startsWith(normQuery)) return 2
  if (normText.includes(normQuery)) return 1
  return 0
}

function bestScore(fields: (string | undefined)[], query: string): number {
  let best = 0
  for (const field of fields) {
    if (!field) continue
    const score = matchScore(field, query)
    if (score === 2) return 2
    if (score > best) best = score
  }
  return best
}

function mapSubject(s: Subject): SearchResult {
  return {
    id: s.id,
    type: 'subject',
    title: s.name,
    subtitle: s.professor ? `Prof. ${s.professor}` : undefined,
    navigateTo: `/subject/${s.id}`,
  }
}

function mapNote(n: Note): SearchResult {
  const text = extractNoteText(n.content)
  const preview = text.length > 60 ? text.slice(0, 60) + '…' : text
  return {
    id: n.id,
    type: 'note',
    title: preview || 'Nota sem conteúdo',
    subtitle: undefined,
    navigateTo: '/notes',
  }
}

function mapActivity(a: Activity): SearchResult {
  return {
    id: a.id,
    type: 'activity',
    title: a.title,
    subtitle: a.subjectName,
    navigateTo: `/subject/${a.subjectId}`,
  }
}

function mapAssessment(a: Assessment): SearchResult {
  return {
    id: a.id,
    type: 'assessment',
    title: a.title,
    subtitle: a.subjectName,
    navigateTo: `/subject/${a.subjectId}`,
  }
}

export function useSearch(data: SearchableData, query: string) {
  const debouncedQuery = useDebounce(query.trim(), 250)

  const results = useMemo<SearchResults>(() => {
    if (!debouncedQuery) return EMPTY_RESULTS

    const scored = <T,>(
      items: T[],
      getFields: (item: T) => (string | undefined)[],
      mapFn: (item: T) => SearchResult,
    ) => {
      const matched: { score: number; result: SearchResult }[] = []
      for (const item of items) {
        const score = bestScore(getFields(item), debouncedQuery)
        if (score > 0) matched.push({ score, result: mapFn(item) })
      }
      matched.sort((a, b) => b.score - a.score)
      return matched.map((m) => m.result)
    }

    return {
      subjects: scored(
        data.subjects,
        (s) => [s.name, s.professor, s.classroom],
        mapSubject,
      ),
      notes: scored(
        data.notes,
        (n) => [extractNoteText(n.content)],
        mapNote,
      ),
      activities: scored(
        data.activities,
        (a) => [a.title, a.description, a.subjectName],
        mapActivity,
      ),
      assessments: scored(
        data.assessments,
        (a) => [a.title, a.subjectName],
        mapAssessment,
      ),
    }
  }, [data, debouncedQuery])

  const totalResults =
    results.subjects.length +
    results.notes.length +
    results.activities.length +
    results.assessments.length

  return { results, totalResults, debouncedQuery }
}
