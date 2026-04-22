import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import useAuthStore, { roleRedirectMap } from '../store/authStore'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuthStore()

  const handleHome = () => {
    if (isAuthenticated && currentUser) {
      navigate(roleRedirectMap[currentUser.role] || '/login')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-warning/10 rounded-card flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-warning" />
        </div>
        <h1 className="text-[28px] font-bold text-primary">Page not found</h1>
        <p className="text-secondary text-sm mt-2 mb-6">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <button onClick={handleHome} className="btn-primary btn">
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
