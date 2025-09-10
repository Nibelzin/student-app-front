import Combobox from '@/components/Combobox'
import SubjectCard from '@/components/SubjectCard'
import { SUBJECTS_PLACEHOLDER } from '@/lib/mock'
import { Plus } from 'lucide-react'

const Subjects = () => {
  return (
    <main className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32">
      <header className="flex gap-4 m-4 mb-12">
        <Combobox label='Matéria' />
        <Combobox label='Bimestre' />
      </header>
      <div className="flex justify-center">
        <div className='w-full md:w-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
          {
            SUBJECTS_PLACEHOLDER.map((subject, index) => (
              <SubjectCard 
                key={index}
                subject={subject}
                period="1º Bimestre"
                color={subject.color}
              />
            ))}
          <div className='w-full md:w-52 h-30 md:h-52 flex justify-center items-center bg-white border rounded-md cursor-pointer hover:shadow-md transition-shadow'>
            <Plus/>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Subjects