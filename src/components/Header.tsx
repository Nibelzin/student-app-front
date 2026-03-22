import { Bell, Loader2, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { useSidebar } from './ui/sidebar'
import { useCurrentUser } from '@/hooks/use-user'



const Header = () => {
  const {setOpen, open, openMobile, setOpenMobile } = useSidebar()
  const { data: user, isPending: isUserLoading } = useCurrentUser();

  const handleOpenSidebar = () => {
    setOpen(!open)
    setOpenMobile(!openMobile)
    localStorage.setItem('sidebar:open', JSON.stringify(!open))
  }


  return (
    <header className='py-2 h-12 px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm'>
      <div className='flex gap-4 items-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleOpenSidebar}
          className='cursor-pointer'
        >
          <Menu className='size-5' />
          <span className='sr-only'>Abrir menu lateral</span>
        </Button>
      </div>
      <div className='flex gap-4 items-center'>
        {isUserLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className='text-sm font-medium'>Lvl {user?.currentLevel}</span>}
        <Bell size={18}/>
      </div>
    </header>
  )
}

export default Header