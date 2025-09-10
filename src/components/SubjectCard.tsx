import { generateAcronym } from '@/lib/utils'
import type { Subject } from '@/types/types'

interface SubjectCardProps {
    subject?: Subject
    period?: string
    color?: string
}

const SubjectCard = ({ subject, period, color }: SubjectCardProps) => {

    const acronym = subject ? generateAcronym(subject.name) : 'MT'

    return (
        <a className='w-full md:w-52 h-30 md:h-52 flex justify-center items-center bg-white border rounded-md cursor-pointer hover:shadow-md transition-shadow' href={`/subject/${subject?.id}`}>
            <div className='p-4 md:p-2 flex md:flex-col items-center w-full gap-4'>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white ${color ? `bg-gray-500` : 'bg-gray-500'}`}>{acronym}</div>
                <div className='flex flex-col items-start md:items-center'>
                    <span className='text-center text-ellipsis'>{subject?.name}</span>
                    <span className='text-gray-500 text-sm'>{period}</span>
                </div>
            </div>
        </a>
    )
}

export default SubjectCard