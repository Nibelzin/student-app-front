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
import AddActivity from './pages/AddActivity.tsx'
import Login from './pages/auth/Login.tsx'
import Register from './pages/auth/Register.tsx'
import GamificationTest from './pages/GamificationTest.tsx'
import Files from './pages/Files.tsx'
import NotesPage from './pages/NotesPage.tsx'
import Activities from './pages/Activities.tsx'
import Settings from './pages/Settings.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/theme-provider.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

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
        path: "/activities",
        element: <Activities />
      },
      {
        path: "/activities/new",
        element: <AddActivity />
      },
      {
        path: "/subject/:id",
        element: <SubjectDetails />
      },
      {
        path: "/files",
        element: <Files />
      },
      {
        path: "/notes",
        element: <NotesPage />
      },
      {
        path: "/settings",
        element: <Settings />
      },
      {
        path: "/gamification",
        element: <GamificationTest />
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
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
