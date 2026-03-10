import { AppSidebar } from '@/components/AppSidebar'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
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
      <div className='w-full h-screen overflow-hidden'>
        <Header />
        <div className='h-full overflow-auto'>
          <ProtectedRoute />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout