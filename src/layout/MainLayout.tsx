import { AppSidebar } from '@/components/AppSidebar'
import Header from '@/components/Header'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { useMemo, useState } from 'react'
import { Outlet } from 'react-router'

const MainLayout = () => {

  const [defaultOpen, setDefaultOpen] = useState(false);

  useMemo(() => {
    const stored = localStorage.getItem('sidebar:open')
    setDefaultOpen(stored ? JSON.parse(stored) : false)
  }, [])

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className='w-full h-screen overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100'>
        <Header />
        <div className='h-full flex-1 overflow-auto'>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout