import Header from '@/components/Header'
import { Outlet } from 'react-router'

const MainLayout = () => {
  return (
    <div>
        <Header/>
        <Outlet/>
    </div>
  )
}

export default MainLayout