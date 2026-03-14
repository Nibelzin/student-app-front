import { AppSidebar } from '@/components/AppSidebar'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import { FocusSessionProvider } from '@/context/FocusSessionContext'
import FocusSessionPopup from '@/components/focus-session/FocusSessionPopup'
import FocusSessionMinimizedWidget from '@/components/focus-session/FocusSessionMinimizedWidget'

const MainLayout = () => {

  const [defaultOpen, setDefaultOpen] = useState(false);

  useMemo(() => {
    const stored = localStorage.getItem('sidebar:open')
    setDefaultOpen(stored ? JSON.parse(stored) : false)
  }, [])

  return (
    <FocusSessionProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className='w-full h-screen overflow-hidden'>
          <Header />
          <div className='h-full overflow-auto'>
            <ProtectedRoute />
          </div>
        </div>
        <FocusSessionPopup />
        <FocusSessionMinimizedWidget />
      </SidebarProvider>
    </FocusSessionProvider>
  )
}

export default MainLayout