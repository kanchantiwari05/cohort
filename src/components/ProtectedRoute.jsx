import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore, { roleRedirectMap } from '../store/authStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    const correctPath = roleRedirectMap[currentUser?.role] || '/login'
    return <Navigate to={correctPath} replace />
  }

  return children
}
