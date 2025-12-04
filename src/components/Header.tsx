import { Bell, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { useSidebar } from './ui/sidebar'



const Header = () => {
  const {setOpen, open, openMobile, setOpenMobile } = useSidebar()

  const handleOpenSidebar = () => {
    setOpen(!open)
    setOpenMobile(!openMobile)
    localStorage.setItem('sidebar:open', JSON.stringify(!open))
  }


  return (
    <header className='border-b p-2 flex items-center justify-between bg-white'>
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
      <div className='flex gap-2 items-center'>
        <Bell size={18}/>
      </div>
    </header>
  )
}

export default Header