import { Bell, Menu, Notebook } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { SidebarTrigger } from './ui/sidebar'

const Header = () => {
  return (
    <div className='border-b p-2 flex items-center justify-between'>
      <div className='flex gap-4 items-center'>
        <SidebarTrigger/>
      </div>
      <div className='flex gap-2 items-center'>
        <Bell size={18}/>
      </div>
    </div>
  )
}

export default Header