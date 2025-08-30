import { AppSidebar } from '@/components/AppSidebar'
import Header from '@/components/Header'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Outlet } from 'react-router'

const MainLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='w-full h-screen overflow-hidden'>
        <Header />
        <div className='h-full flex-1 overflow-auto'>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout