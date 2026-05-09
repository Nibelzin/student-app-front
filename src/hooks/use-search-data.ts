import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from './use-user'
import { getUserSubjects } from '@/api/userService'
import { getUserNotes } from '@/api/userService'
import { getActivities } from '@/api/activitiyService'
import { getAssessments } from '@/api/assessmentService'
import type { Subject, Note, Activity, Assessment } from '@/types/types'

export interface SearchableData {
  subjects: Subject[]
  notes: Note[]
  activities: Activity[]
  assessments: Assessment[]
}

export function useSearchData(enabled: boolean) {
  const { data: user } = useCurrentUser()
  const userId = user?.id

  const subjects = useQuery({
    queryKey: ['search', 'subjects', userId],
    queryFn: () => getUserSubjects({ userId: userId!, size: 500 }),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const notes = useQuery({
    queryKey: ['search', 'notes', userId],
    queryFn: () => getUserNotes({ userId: userId!, size: 500 }),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const activities = useQuery({
    queryKey: ['search', 'activities', userId],
    queryFn: () => getActivities({ userId: userId!, size: 500 }),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const assessments = useQuery({
    queryKey: ['search', 'assessments', userId],
    queryFn: () => getAssessments({ userId: userId!, size: 500 }),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const isLoading =
    subjects.isLoading || notes.isLoading || activities.isLoading || assessments.isLoading

  const data: SearchableData = {
    subjects: subjects.data?.content ?? [],
    notes: notes.data?.content ?? [],
    activities: activities.data?.content ?? [],
    assessments: assessments.data?.content ?? [],
  }

  return { data, isLoading }
}
