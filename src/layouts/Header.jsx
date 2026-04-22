import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const roleLabels = {
  platform_admin: 'Platform Admin',
  super_admin:    'Community Super Admin',
  level_admin:    'Level Admin',
  member:         'Member',
}

const roleBadgeClass = {
  platform_admin: 'badge-red',
  super_admin:    'badge-blue',
  level_admin:    'badge-teal',
  member:         'badge-green',
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-button hover:bg-bg text-textSecondary transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm text-textSecondary hidden sm:block">
          BNI Mumbai Metro
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-button hover:bg-bg text-textSecondary transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-button hover:bg-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-textPrimary leading-tight">{user?.name}</p>
              <span className={`badge ${roleBadgeClass[user?.role] || 'badge-gray'} mt-0.5`}>
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-textSecondary" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-card shadow-modal border border-border z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-textPrimary">{user?.name}</p>
                <p className="text-xs text-textSecondary mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors rounded-b-card"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
