import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Users, Plus, Activity, User, FileText, Calendar, Coffee, Zap, X } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/member/dashboard',  icon: Home,     label: 'Home'     },
  { to: '/member/directory',  icon: Users,    label: 'Members'  },
  { to: null,                 icon: Plus,     label: 'Quick'    }, // FAB slot
  { to: '/member/my-stats',   icon: Activity, label: 'My Stats' },
  { to: '/member/profile',    icon: User,     label: 'Profile'  },
]

const FAB_ACTIONS = [
  { icon: FileText, label: 'Log Referral',  to: '/member/referrals',  color: 'bg-teal'  },
  { icon: Calendar, label: 'RSVP Meeting',  to: '/member/meetings',   color: 'bg-navy'  },
  { icon: Coffee,   label: 'Log 1:1',       to: '/member/meetings',   color: 'bg-amber' },
  { icon: Zap,      label: 'Log Event',     to: '/member/meetings',   color: 'bg-navy'  },
]

export default function MemberLayout() {
  const [fabOpen, setFabOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleFabAction = (to) => {
    setFabOpen(false)
    navigate(to)
  }

  return (
    <div className="h-screen flex justify-center overflow-hidden" style={{ background: '#CBD5E1' }}>
      {/* Mobile shell */}
      <div className="w-full max-w-[430px] h-full flex flex-col bg-white relative"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.18)' }}>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: 68 }}>
          <Outlet />
        </div>

        {/* FAB overlay backdrop */}
        {fabOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30"
            onClick={() => setFabOpen(false)}
          />
        )}

        {/* FAB action sheet */}
        {fabOpen && (
          <div className="fixed bottom-20 z-40 w-full max-w-[430px] left-1/2 -translate-x-1/2 px-4">
            <div className="bg-white rounded-[20px] shadow-modal overflow-hidden">
              {FAB_ACTIONS.map((a, i) => (
                <button
                  key={a.label}
                  onClick={() => handleFabAction(a.to)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface transition-colors ${
                    i < FAB_ACTIONS.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${a.color} flex items-center justify-center flex-shrink-0`}>
                    <a.icon size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-primary">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom navigation bar */}
        <div
          className="flex-shrink-0 bg-white border-t border-border flex items-center"
          style={{ height: 68, position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}
        >
          {NAV_ITEMS.map((item) => {
            if (!item.to) {
              // FAB slot
              return (
                <div key="fab" className="flex-1 flex justify-center items-center">
                  <button
                    onClick={() => setFabOpen(v => !v)}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 -mt-7"
                    style={{ background: fabOpen ? '#014049' : '#1B3A6B', boxShadow: '0 4px 16px rgba(27,58,107,0.35)' }}
                  >
                    <div className="transition-transform duration-200" style={{ transform: fabOpen ? 'rotate(45deg)' : 'none' }}>
                      <Plus size={24} className="text-white" />
                    </div>
                  </button>
                </div>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                    isActive ? 'text-teal' : 'text-secondary'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}
