import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import Home from './pages/Home.tsx'
import MainLayout from './layout/MainLayout.tsx'
import Subjects from './pages/Subjects.tsx'
import SubjectDetails from './pages/SubjectDetails.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/subjects",
        element: <Subjects/>
      },
      {
        path: "/subject/:id",
        element: <SubjectDetails/>
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
