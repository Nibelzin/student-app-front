import { Bell, Notebook } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Header = () => {
  return (
    <div className='border-b h-14 p-6 flex items-center justify-between'>
      <Notebook />
      <div className='flex gap-2 items-center'>
        <Button size="sm" variant="ghost">
          Home
        </Button>
        <Button size="sm" variant="ghost">
          Matérias
        </Button>
        <Button size="sm" variant="ghost">
          Agenda
        </Button>
        <div className='flex gap-2 items-center mr-16'>
          <Avatar>
            <AvatarImage src='https://github.com/shadcn.png'/>
            <AvatarFallback>
              LH
            </AvatarFallback>
          </Avatar>
          <div className='text-neutral-500'>
            <p className='text-sm font-bold'>Luan Henrique</p>
            <p className='text-sm'>ADS</p>
          </div>
        </div>
        <Bell />
      </div>
    </div>
  )
}

export default Header