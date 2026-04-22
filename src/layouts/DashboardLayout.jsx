import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, CreditCard,
  BarChart3, Activity, Settings, Calendar, UserCheck, Star,
  Globe, MessageSquare, Rss, Shield, Bell, Menu, X,
  LogOut, ChevronDown, Network, Smartphone, Headphones,
  ToggleRight, Zap, Users2, UserPlus, FileBarChart2,
  PanelLeftClose, PanelLeftOpen, KeyRound,
  Package, Building, ClipboardList, ScrollText,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useMasterSettingsStore from '../store/masterSettingsStore'

/** Master Settings sub-pages — main sidebar only (no in-page nav) */
const MASTER_SETTINGS_SIDEBAR = [
  { label: 'Subscription Plans',     icon: Package,     to: '/admin/settings/plans' },
  { label: 'Community Types',        icon: Users,       to: '/admin/settings/communityTypes' },
  { label: 'Platform Identity',      icon: Building,    to: '/admin/settings/identity' },
  { label: 'Notification Templates', icon: Bell,        to: '/admin/settings/notifications' },
]

// ── Nav config per role ──────────────────────────────────────────────────────
const navConfig = {
  platform_admin: [
    { section: 'Overview' },
    { label: 'Dashboard',         icon: LayoutDashboard, to: '/admin/dashboard'     },
    { section: 'Tenants' },
    { label: 'All Tenants',       icon: Building2,       to: '/admin/tenants'       },
    { label: 'Launch Tracker',     icon: ClipboardList,   to: '/admin/onboarding'    },
    { section: 'Configuration' },
    { label: 'Domains',           icon: Globe,           to: '/admin/domains'       },
    { label: 'App Deployment',    icon: Smartphone,      to: '/admin/app-deployment'},
    { section: 'Operations' },
    { label: 'Billing',           icon: CreditCard,      to: '/admin/billing'       },
    { label: 'Health Monitor',    icon: Activity,        to: '/admin/health'        },
    { label: 'Support Queue',     icon: Headphones,      to: '/admin/support'       },
    { label: 'Audit Logs',        icon: ScrollText,      to: '/admin/audit-logs'    },
    { section: 'Access' },
    { label: 'Community Access',  icon: KeyRound,        to: '/admin/community-access' },
    { section: 'Master' },
    ...MASTER_SETTINGS_SIDEBAR,
  ],
  community_super_admin: [
    { section: 'Overview' },
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/csa/dashboard'     },
    { label: 'Hierarchy View',  icon: Network,         to: '/csa/hierarchy'     },
    { section: 'Management' },
    { label: 'Module Settings', icon: ToggleRight,     to: '/csa/modules'       },
    { label: 'Level Admins',    icon: Shield,          to: '/csa/level-admins'  },
    { label: 'Members',         icon: Users,           to: '/csa/members'       },
    { section: 'Insights' },
    { label: 'Analytics',       icon: BarChart3,       to: '/csa/analytics'     },
    { section: 'Engagement' },
    { label: 'Communication',   icon: MessageSquare,   to: '/csa/communication' },
    { label: 'Automation',      icon: Zap,             to: '/csa/automation'    },
    { section: 'Account' },
    { label: 'Billing & Modules', icon: CreditCard,    to: '/csa/billing'       },
    { section: 'Access Control' },
    { label: 'Roles & Permissions', icon: KeyRound,    to: '/csa/roles'         },
    { section: 'System' },
    { label: 'Settings',          icon: Settings,      to: '/csa/settings'      },
  ],
  level_admin: [
    { section: 'My Node' },
    { label: 'Dashboard',    icon: LayoutDashboard, to: '/la/dashboard'  },
    { label: 'Members',      icon: Users,           to: '/la/members'    },
    { section: 'Activity' },
    { label: 'Meetings',     icon: Calendar,        to: '/la/meetings'   },
    { label: 'Attendance',   icon: UserCheck,       to: '/la/attendance' },
    { label: 'Events',       icon: Globe,           to: '/la/events'     },
    { label: 'Referrals',    icon: Star,            to: '/la/referrals'  },
    { label: '1:1 Meetings', icon: Users2,          to: '/la/one-on-one' },
    { section: 'Management' },
    { label: 'Visitors',     icon: UserPlus,        to: '/la/visitors'   },
    { label: 'Reports',      icon: FileBarChart2,   to: '/la/reports'    },
  ],
  member: [
    { section: 'My Space' },
    { label: 'Dashboard',  icon: LayoutDashboard, to: '/member/dashboard'  },
    { label: 'Referrals',  icon: Star,            to: '/member/referrals'  },
    { label: 'Meetings',   icon: Calendar,        to: '/member/meetings'   },
    { section: 'Community' },
    { label: 'Events',     icon: Globe,           to: '/member/events'     },
    { label: '1-on-1s',    icon: MessageSquare,   to: '/member/one-on-one' },
    { label: 'Feed',       icon: Rss,             to: '/member/feed'       },
    { section: 'Account' },
    { label: 'My Profile', icon: Users,           to: '/member/profile'    },
  ],
}

const roleLabel = {
  platform_admin:        'Platform Admin',
  community_super_admin: 'Super Admin',
  level_admin:           'Level Admin',
  member:                'Member',
}

const roleBadge = {
  platform_admin:        'badge-danger',
  community_super_admin: 'badge-navy',
  level_admin:           'badge-teal',
  member:                'badge-success',
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function collapsedNavFlyoutHandlers(collapsed, label, setFlyout) {
  if (!collapsed) return {}
  return {
    onMouseEnter: (e) => {
      const r = e.currentTarget.getBoundingClientRect()
      setFlyout({ label, top: r.top + r.height / 2, left: r.right + 8 })
    },
    onMouseLeave: () => setFlyout(null),
    onFocus: (e) => {
      const r = e.currentTarget.getBoundingClientRect()
      setFlyout({ label, top: r.top + r.height / 2, left: r.right + 8 })
    },
    onBlur: () => setFlyout(null),
  }
}

function Sidebar({ open, onClose, collapsed, onToggleCollapse, user, communityName }) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const platformIdentity = useMasterSettingsStore(s => s.platformIdentity)
  const items = navConfig[user?.role] || []
  const [navFlyout, setNavFlyout] = useState(null)

  useEffect(() => {
    if (!collapsed) setNavFlyout(null)
  }, [collapsed])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile/tablet overlay — only below md */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col flex-shrink-0
          transition-all duration-200 ease-in-out
          md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-14' : 'w-[240px]'}
        `}
        style={{ background: 'linear-gradient(180deg, #0F2347 0%, #1B3A6B 100%)' }}
      >
        {/* Brand */}
        <div className={`flex items-center h-12 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          {collapsed ? (
            /* Collapsed: show only logo, clicking it expands */
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 bg-teal rounded-button flex items-center justify-center flex-shrink-0 hover:bg-teal/80 transition-colors overflow-hidden"
              title="Expand sidebar"
            >
              {user?.role === 'platform_admin' && platformIdentity.logoUrl ? (
                <img src={platformIdentity.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.role === 'platform_admin' ? (platformIdentity.shortName || 'C').charAt(0) : 'C'}
                </span>
              )}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-teal rounded-button flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user?.role === 'platform_admin' && platformIdentity.logoUrl ? (
                    <img src={platformIdentity.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {user?.role === 'platform_admin' ? (platformIdentity.shortName || 'CNP').slice(0, 2) : 'C'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-base leading-none truncate max-w-[140px]">
                    {user?.role === 'platform_admin' ? platformIdentity.shortName || 'CNP' : 'CNP'}
                  </p>
                  {communityName && (
                    <p className="text-teal-light text-[11px] leading-tight mt-0.5 truncate max-w-[140px]">
                      {communityName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Collapse toggle — desktop only */}
                <button
                  onClick={onToggleCollapse}
                  className="hidden md:flex text-white/50 hover:text-white p-1.5 rounded-button hover:bg-white/10 transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose size={15} />
                </button>
                {/* Close button — mobile only */}
                <button
                  onClick={onClose}
                  className="md:hidden text-white/50 hover:text-white p-1.5 rounded-button hover:bg-white/10 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Node context — Level Admin only, hidden when collapsed */}
        {!collapsed && user?.role === 'level_admin' && (
          <div className="px-4 py-3 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {user.nodeName || 'Andheri Chapter'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#03A0B0' }}>Zone: North Zone</p>
            <p className="text-white/45 text-[11px] mt-0.5">47 Members</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pb-3 pr-2">
          {items.map((item, i) =>
            item.section ? (
              /* Section headers hidden when collapsed */
              collapsed ? null : (
                <p
                  key={i}
                  className={`nav-section ${item.section === 'Master' ? '!text-white/50' : ''}`}
                >
                  {item.section}
                </p>
              )
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 768) onClose()
                }}
                title={collapsed ? item.label : undefined}
                {...collapsedNavFlyoutHandlers(collapsed, item.label, setNavFlyout)}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                }
              >
                <item.icon size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          )}
        </nav>

        {navFlyout && collapsed && (
          <div
            className="fixed z-[100] px-2.5 py-1.5 rounded-button text-xs font-medium text-white shadow-modal border border-white/15 whitespace-nowrap pointer-events-none"
            style={{
              left: navFlyout.left,
              top: navFlyout.top,
              transform: 'translateY(-50%)',
              background: 'linear-gradient(180deg, #0F2347 0%, #1B3A6B 100%)',
            }}
            role="tooltip"
          >
            {navFlyout.label}
          </div>
        )}

        {/* Expand button when collapsed — desktop only */}
        {collapsed && (
          <div className="px-2 pb-2 flex-shrink-0 border-t border-white/10 pt-2 hidden md:flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-button text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={15} />
            </button>
          </div>
        )}

        {/* Logout shortcut at bottom */}
        <div className={`px-2 pb-3 flex-shrink-0 border-t border-white/10 pt-2 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : undefined}
            {...collapsedNavFlyoutHandlers(collapsed, 'Sign out', setNavFlyout)}
            className={`nav-link text-white/50 hover:text-white/90 ${collapsed ? 'justify-center px-0 w-auto' : 'w-full text-left'}`}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({ onMenuClick, user, pageTitle }) {
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate                      = useNavigate()
  const { logout }                    = useAuthStore()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close dropdowns on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { setNotifOpen(false); setProfileOpen(false) }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <header className="h-11 bg-white border-b border-border flex items-center justify-between px-3 md:px-5 lg:px-6 flex-shrink-0 gap-3">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors md:hidden flex-shrink-0"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-primary truncate">{pageTitle}</h1>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-0.5 flex-shrink-0">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
            className="relative p-2 rounded-button text-secondary hover:bg-surface transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full border border-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-[300px] max-w-[calc(100vw-1rem)] bg-white rounded-card shadow-modal border border-border z-50">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">Notifications</p>
                <span className="badge badge-amber">3 new</span>
              </div>
              {[
                { text: 'New member Suresh Rao joined Andheri Chapter', time: '2m ago' },
                { text: 'Referral from Rajesh Mehta is awaiting approval', time: '1h ago' },
                { text: 'Chapter meeting tomorrow at 7:00 AM', time: '3h ago' },
              ].map((n, i) => (
                <div key={i} className="px-4 py-2 border-b border-border last:border-0 hover:bg-surface transition-colors cursor-pointer">
                  <p className="text-sm text-primary leading-snug">{n.text}</p>
                  <p className="text-2xs text-secondary mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
            className="flex items-center gap-2 px-1.5 py-1 rounded-button hover:bg-surface transition-colors"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-primary leading-tight">{user?.name?.split(' ')[0]}</p>
              <p className="text-2xs text-secondary">{roleLabel[user?.role]}</p>
            </div>
            <ChevronDown size={13} className="text-secondary hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 max-w-[calc(100vw-1rem)] bg-white rounded-card shadow-modal border border-border z-50">
              <div className="p-2.5 border-b border-border">
                <p className="text-sm font-semibold text-primary">{user?.name}</p>
                <p className="text-2xs text-secondary mt-0.5">{user?.email}</p>
                <span className={`badge ${roleBadge[user?.role]} mt-1.5`}>
                  {roleLabel[user?.role]}
                </span>
              </div>
              <button
                onClick={() => { logout(); navigate('/login', { replace: true }) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors rounded-b-card"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Layout wrapper ────────────────────────────────────────────────────────────
export default function DashboardLayout({ pageTitle = 'Dashboard' }) {
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { currentUser } = useAuthStore()

  const communityName = currentUser?.communityName ||
    (currentUser?.role === 'platform_admin' ? 'CNP Platform' : '')

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        user={currentUser}
        communityName={communityName}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
