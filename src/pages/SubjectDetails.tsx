import { PERIOD_PLACEHOLDER, SUBJECTS_PLACEHOLDER } from '@/lib/mock';
import React from 'react'
import { useParams } from 'react-router'

const SubjectDetails = () => {

  const { id: subjectId } = useParams();

  const subject = SUBJECTS_PLACEHOLDER.find(subj => subj.id === subjectId)
  const period = subject ? PERIOD_PLACEHOLDER.find(per => per.id === subject.periodId) : null

  return (
    <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
      <header className="m-4">
        <h1 className="text-2xl tracking-tight text-balance font-semibold">{subject?.name}</h1>
        <p className="text-sm text-neutral-600">{period?.name}</p>
      </header>
    </main>
  )
}

export default SubjectDetails