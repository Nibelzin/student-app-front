import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import Home from './pages/Home.tsx'
import MainLayout from './layout/MainLayout.tsx'
import Subjects from './pages/Subjects.tsx'
import SubjectDetails from './pages/SubjectDetails.tsx'
import AddSubject from './pages/AddSubject.tsx'
import AddPeriod from './pages/AddPeriod.tsx'
import Login from './pages/auth/Login.tsx'
import Register from './pages/auth/Register.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2
    }
  }
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/subjects",
        element: <Subjects />
      },
      {
        path: "/subjects/new",
        element: <AddSubject />
      },
      {
        path: "/periods/new",
        element: <AddPeriod />
      },
      {
        path: "/subject/:id",
        element: <SubjectDetails />
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
