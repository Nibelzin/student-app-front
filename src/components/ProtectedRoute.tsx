import { Navigate, Outlet } from 'react-router'
import { isAuthenticated } from '@/api/authService'

export default function ProtectedRoute() {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
