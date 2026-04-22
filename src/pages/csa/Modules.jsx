import { useState } from 'react'
import {
  Users, BarChart3, MessageCircle, Zap, Headphones,
  Calendar, ClipboardCheck, Star, TrendingUp, Users2,
  LayoutGrid, Network, Check, X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const ALWAYS_ON = [
  { id: 'member-mgmt',   name: 'Member Management',    icon: Users,          iconColor: '#028090', description: 'Profiles, directory, visitor pipeline, digital member ID' },
  { id: 'dashboard',     name: 'Dashboard & Analytics', icon: BarChart3,      iconColor: '#1B3A6B', description: 'Personal KPIs, node dashboards, community analytics' },
  { id: 'communication', name: 'Communication Hub',     icon: MessageCircle,  iconColor: '#028090', description: 'Announcements, forums, WhatsApp templates, notifications' },
  { id: 'automation',    name: 'Automation',            icon: Zap,            iconColor: '#2E7D32', description: 'Engagement nudges, renewal reminders, lifecycle automation' },
  { id: 'support',       name: 'Support & Help',        icon: Headphones,     iconColor: '#C17900', description: 'FAQ library, member tickets, escalation pipeline' },
]

const ENABLEABLE = [
  { id: 'meetings',    name: 'Meeting Management',        icon: Calendar,       iconColor: '#1E88E5', description: 'Create meetings, RSVP, recurring schedules, attendance tracking',       default: true  },
  { id: 'attendance',  name: 'Attendance Management',     icon: ClipboardCheck, iconColor: '#7B1FA2', description: 'Mark attendance, QR check-in, reports, at-risk attendance alerts',        default: true  },
  { id: 'events',      name: 'Event Management',          icon: Star,           iconColor: '#E64A19', description: 'Create events, RSVP, participation tracking, post-event analytics',        default: true  },
  { id: 'referrals',   name: 'Referral & Business Tracking', icon: TrendingUp,  iconColor: '#C17900', description: 'Referral pipeline, TYFCB, business value tracking, leaderboards',         default: true  },
  { id: 'one-on-one',  name: 'One-to-One Meetings',       icon: Users2,         iconColor: '#1565C0', description: 'Log 1:1 meetings, partner confirmation, monthly targets',                  default: true  },
  { id: 'feed',        name: 'Activity Feed & Moderation',icon: LayoutGrid,     iconColor: '#6A1B9A', description: 'Social feed, member posts, moderation queue, announcements',               default: false },
  { id: 'networking',  name: 'Networking & Groups',       icon: Network,        iconColor: '#2E7D32', description: 'Member connections, sub-groups, group leaders, cross-node search',         default: false },
]

const TEMPLATES = [
  { id: 'professional', name: 'Professional Networking Setup', borderClass: 'border-l-teal',  modules: ['meetings','attendance','referrals','one-on-one'] },
  { id: 'alumni',       name: 'Alumni Association Setup',      borderClass: 'border-l-navy',  modules: ['events','feed','networking']                    },
  { id: 'trade',        name: 'Trade Body Setup',              borderClass: 'border-l-amber', modules: ['meetings','referrals','events']                  },
]

export default function CSAModulesPage() {
  const [enabled, setEnabled] = useState(
    Object.fromEntries(ENABLEABLE.map(m => [m.id, m.default]))
  )
  const [confirm, setConfirm] = useState(null) // { moduleId, action }

  const enabledCount   = Object.values(enabled).filter(Boolean).length
  const totalModules   = ALWAYS_ON.length + ENABLEABLE.length
  const configuredCount = ALWAYS_ON.length + enabledCount
  const progress       = Math.round((configuredCount / totalModules) * 100)

  const confirmMod = confirm ? ENABLEABLE.find(m => m.id === confirm.moduleId) : null

  const requestToggle = (id) => {
    setConfirm({ moduleId: id, action: enabled[id] ? 'disable' : 'enable' })
  }

  const doToggle = () => {
    if (!confirm || !confirmMod) return
    const newVal = confirm.action === 'enable'
    setEnabled(prev => ({ ...prev, [confirm.moduleId]: newVal }))
    toast.success(
      `${confirmMod.name} ${newVal ? 'enabled' : 'disabled'} for all members`,
      { style: { fontSize: 13 } }
    )
    setConfirm(null)
  }

  const applyTemplate = (tpl) => {
    const next = Object.fromEntries(ENABLEABLE.map(m => [m.id, tpl.modules.includes(m.id)]))
    setEnabled(next)
    toast.success(`"${tpl.name}" applied`, { style: { fontSize: 13 } })
  }

  return (
    <div className="p-3 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-primary">Module Configuration</h1>
        <p className="text-secondary text-sm mt-1">
          Enable the modules your community needs. Disabled modules are completely hidden from all members.
        </p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-primary">{configuredCount} of {totalModules} modules configured</p>
          <p className="text-sm text-teal font-semibold">{progress}%</p>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Always On */}
      <section>
        <h2 className="text-base font-semibold text-primary mb-1">Always On</h2>
        <p className="text-sm text-secondary mb-4">These core modules are always active and cannot be disabled.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ALWAYS_ON.map(mod => (
            <div
              key={mod.id}
              className="relative rounded-card p-4 border border-border"
              style={{ background: 'rgba(27,58,107,0.025)' }}
            >
              <span className="absolute top-3 right-3 badge badge-navy text-2xs">Always On</span>
              <div className="flex items-start gap-3 pr-20">
                <div
                  className="w-10 h-10 rounded-button flex items-center justify-center flex-shrink-0"
                  style={{ background: `${mod.iconColor}1A` }}
                >
                  <mod.icon size={18} style={{ color: mod.iconColor }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{mod.name}</p>
                  <p className="text-2xs text-secondary mt-1 leading-relaxed">{mod.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enableable */}
      <section>
        <h2 className="text-base font-semibold text-primary mb-1">Enableable Modules</h2>
        <p className="text-sm text-secondary mb-4">Toggle on what your community needs.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ENABLEABLE.map(mod => {
            const on = enabled[mod.id]
            return (
              <div
                key={mod.id}
                className="relative rounded-card p-4 border-2 transition-all duration-200"
                style={{
                  background:     on ? '#F0FAFB' : '#FFFFFF',
                  borderColor:    on ? '#028090' : '#D0DCF0',
                  borderLeftWidth: on ? '4px' : '2px',
                }}
              >
                {/* Toggle */}
                <button
                  onClick={() => requestToggle(mod.id)}
                  className="absolute top-3 right-3 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
                  style={{ background: on ? '#028090' : '#CBD5E1' }}
                  aria-label={on ? 'Disable module' : 'Enable module'}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>

                <div className="flex items-start gap-3 pr-14">
                  <div
                    className="w-10 h-10 rounded-button flex items-center justify-center flex-shrink-0"
                    style={{ background: `${mod.iconColor}1A` }}
                  >
                    <mod.icon size={18} style={{ color: mod.iconColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{mod.name}</p>
                    <p className="text-2xs text-secondary mt-1 leading-relaxed">{mod.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60">
                  {on
                    ? <span className="badge badge-success text-2xs">Active</span>
                    : <span className="badge badge-gray text-2xs">Disabled</span>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Preset Templates */}
      <section>
        <h2 className="text-base font-semibold text-primary mb-1">Preset Templates</h2>
        <p className="text-sm text-secondary mb-4">Quickly configure modules for your community type.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEMPLATES.map(tpl => {
            const names = tpl.modules.map(id => ENABLEABLE.find(m => m.id === id)?.name).filter(Boolean)
            return (
              <div key={tpl.id} className={`card p-4 border-l-4 ${tpl.borderClass}`}>
                <p className="text-sm font-semibold text-primary mb-2">{tpl.name}</p>
                <div className="space-y-1 mb-4">
                  {names.map(n => (
                    <div key={n} className="flex items-center gap-1.5">
                      <Check size={11} className="text-success flex-shrink-0" />
                      <span className="text-2xs text-secondary">{n}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => applyTemplate(tpl)} className="btn-outline btn-sm w-full">
                  Apply Template
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Confirmation Dialog */}
      {confirm && confirmMod && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-modal w-full max-w-sm">
            <div className="p-6">
              <div
                className="w-12 h-12 rounded-card flex items-center justify-center mb-4"
                style={{ background: confirm.action === 'enable' ? '#02809018' : '#BF360C18' }}
              >
                {confirm.action === 'enable'
                  ? <Check size={20} className="text-teal" />
                  : <X size={20} className="text-danger" />
                }
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">
                {confirm.action === 'enable' ? 'Enable' : 'Disable'} {confirmMod.name}?
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                {confirm.action === 'enable'
                  ? `This will immediately make ${confirmMod.name} visible to all 240 members of BNI Mumbai Metro.`
                  : `This will immediately hide ${confirmMod.name} from all members. Existing data will be preserved.`
                }
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">Cancel</button>
              {confirm.action === 'enable'
                ? <button onClick={doToggle} className="btn-primary flex-1">Enable</button>
                : <button
                    onClick={doToggle}
                    className="btn flex-1 bg-white text-danger border-2 border-danger hover:bg-danger/5 active:scale-95"
                  >
                    Disable
                  </button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
