import React from 'react'
import { useParams } from 'react-router'

const SubjectDetails = () => {

  const { id: subjectId } = useParams();

  return (
     <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
      <h1>{subjectId}</h1>
     </main>
  )
}

export default SubjectDetails