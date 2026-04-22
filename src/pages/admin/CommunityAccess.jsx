import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  Shield, Search, Building2, Users, Settings2,
  CheckCircle, XCircle, ChevronRight, Pencil,
} from 'lucide-react'
import useCommunityAccessStore from '../../store/communityAccessStore'

// ── Helpers ────────────────────────────────────────────────────────────────────
const PLAN_STYLE = {
  Starter:      { bg: 'bg-teal/10',    text: 'text-teal'       },
  Professional: { bg: 'bg-navy/10',    text: 'text-navy'       },
  Enterprise:   { bg: 'bg-amber/10',   text: 'text-amber-dark' },
}

const STATUS_STYLE = {
  active:    { dot: '#2E7D32', label: 'Active',    cls: 'text-success' },
  suspended: { dot: '#BF360C', label: 'Suspended', cls: 'text-danger'  },
}

const TYPE_STYLE = {
  alumni:       'bg-navy/8 text-navy',
  business:     'bg-teal/8 text-teal',
  religious:    'bg-amber/8 text-amber-dark',
  professional: 'bg-success/8 text-success',
}

const PER_PAGE = 8

// Always-on core module IDs (same set as TenantDetail)
const ALWAYS_ON_MODULE_IDS = ['member_management', 'dashboard_analytics', 'communication_hub', 'meeting_management', 'attendance_management']

// Renewal date urgency helper
function renewalCls(dateStr) {
  if (!dateStr) return { cls: 'text-secondary', suffix: '' }
  const d = new Date(dateStr)
  if (isNaN(d)) return { cls: 'text-secondary', suffix: '' }
  const days = Math.floor((d - Date.now()) / 86400000)
  if (days < 0)  return { cls: 'text-danger  font-medium', suffix: ' — Overdue' }
  if (days <= 7) return { cls: 'text-amber-dark font-medium', suffix: ` — Due in ${days} days` }
  if (days <= 30) return { cls: 'text-amber-dark', suffix: '' }
  return { cls: 'text-secondary', suffix: '' }
}

// Member capacity bar color
function capacityBarCls(pct) {
  if (pct > 80) return 'bg-danger'
  if (pct > 60) return 'bg-amber'
  return 'bg-teal/60'
}

// ── Modules tooltip (portal-based) ────────────────────────────────────────────
const ALL_MODULE_LABELS = {
  member_management:   'Member Management',
  dashboard_analytics: 'Dashboard Analytics',
  communication_hub:   'Communication Hub',
  meeting_management:  'Meeting Management',
  attendance_management: 'Attendance',
  event_management:    'Event Management',
  referral_business:   'Referral & Business',
  networking_groups:   'Networking & Groups',
  activity_feed:       'Activity Feed',
  automation:          'Automation',
  support_help:        'Support & Help',
}

function ModulesTooltip({ community, anchor, onClose }) {
  const ref = useRef(null)
  const alwaysOn = ALWAYS_ON_MODULE_IDS
  const csaEnabled = (community.enabledModules || []).filter(m => !ALWAYS_ON_MODULE_IDS.includes(m))
  const allKnown   = Object.keys(ALL_MODULE_LABELS)
  const planLocked = allKnown.filter(m => !ALWAYS_ON_MODULE_IDS.includes(m) && !(community.enabledModules || []).includes(m))

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target) && !anchor?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchor, onClose])

  if (!anchor) return null
  const rect = anchor.getBoundingClientRect()
  const top  = rect.bottom + window.scrollY + 4
  const left = Math.min(rect.left + window.scrollX, window.innerWidth - 296)

  return createPortal(
    <div
      ref={ref}
      className="absolute z-[9999] bg-white border border-border rounded-card shadow-modal p-3 text-xs"
      style={{ top, left, width: 280 }}
    >
      <p className="font-semibold text-primary mb-1.5">{community.name} — Modules</p>
      <div className="border-t border-border mb-2" />
      {[
        { title: `Always On (${alwaysOn.length})`, items: alwaysOn, prefix: '✓', cls: 'text-success' },
        { title: `Enabled by CSA (${csaEnabled.length})`, items: csaEnabled, prefix: '✓', cls: 'text-teal' },
        { title: `Locked by Plan (${planLocked.length})`, items: planLocked, prefix: '⊘', cls: 'text-secondary' },
      ].map(sec => (
        <div key={sec.title} className="mb-2">
          <p className="text-[10px] font-semibold text-secondary uppercase tracking-wide mb-1">{sec.title}</p>
          <div className="space-y-0.5">
            {sec.items.slice(0, 5).map(id => (
              <p key={id} className={sec.cls}>{sec.prefix} {ALL_MODULE_LABELS[id] || id}</p>
            ))}
            {sec.items.length === 0 && <p className="text-secondary italic">None</p>}
          </div>
        </div>
      ))}
      {planLocked.length > 0 && <p className="text-[10px] text-secondary italic mb-1.5">Upgrade plan to unlock</p>}
      <a href={`/admin/community-access/${community.id}`} className="text-xs font-medium text-teal hover:underline">
        View Module Settings →
      </a>
    </div>,
    document.body
  )
}

// ── Table Row ──────────────────────────────────────────────────────────────────
function CommunityRow({ c, onManage, onEdit }) {
  const st      = STATUS_STYLE[c.status] || STATUS_STYLE.active
  const plan    = PLAN_STYLE[c.plan] || PLAN_STYLE.Starter
  const type    = TYPE_STYLE[c.typeKey] || 'bg-surface text-secondary'
  const pct     = Math.round((c.memberCount / c.membersLimit) * 100)
  const isSuspended = c.status === 'suspended'
  const renewal = renewalCls(c.renewalDate)
  const [moduleTipOpen, setModuleTipOpen] = useState(false)
  const modAnchorRef = useRef(null)

  // Renewal days for context-aware actions
  const renewDays = (() => {
    const d = new Date(c.renewalDate)
    return isNaN(d) ? 999 : Math.floor((d - Date.now()) / 86400000)
  })()

  const rowBg = isSuspended ? 'bg-[#FFF5F5]' : 'hover:bg-surface/50'

  return (
    <tr className={`group transition-colors ${rowBg}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs ${isSuspended ? 'bg-gray-100 text-secondary' : 'bg-navy/10 text-navy'}`}>
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className={`text-sm leading-tight ${isSuspended ? 'text-secondary' : 'font-semibold text-primary'}`}>{c.name}</p>
            <p className="text-2xs text-secondary">{c.csa}</p>
            {isSuspended && (
              <p className="text-[11px] text-danger mt-0.5">{c.memberCount} members locked out</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium ${type}`}>
          {c.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-primary">
          <span className="font-medium">{c.memberCount.toLocaleString('en-IN')}</span>
          <span className="text-border">/</span>
          <span className="text-secondary text-xs">{c.membersLimit.toLocaleString('en-IN')}</span>
        </div>
        <div className="relative group/bar mt-1">
          <div className="h-1 w-16 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${capacityBarCls(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          {pct > 80 && (
            <div className="hidden group-hover/bar:block absolute bottom-full left-0 mb-1 z-10 bg-white border border-border rounded-card shadow-modal px-2 py-1.5 text-[11px] w-44">
              <p className="font-medium text-danger">Near plan limit</p>
              <p className="text-secondary">Consider upgrading to {c.plan === 'Starter' ? 'Professional' : 'Enterprise'}</p>
              <a href={`/admin/community-access/${c.id}`} className="text-teal font-medium hover:underline">Upgrade →</a>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold ${plan.bg} ${plan.text}`}>
          {c.plan}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          ref={modAnchorRef}
          onClick={() => setModuleTipOpen(v => !v)}
          className="flex items-center gap-2 hover:text-teal transition-colors"
        >
          <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-teal rounded-full" style={{ width: `${Math.round((c.enabledModules.length / 11) * 100)}%` }} />
          </div>
          <span className="text-xs text-secondary tabular-nums">{c.enabledModules.length}/11</span>
        </button>
        {moduleTipOpen && (
          <ModulesTooltip
            community={c}
            anchor={modAnchorRef.current}
            onClose={() => setModuleTipOpen(false)}
          />
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
          <span className={`text-xs font-medium ${st.cls}`}>{st.label}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-xs ${renewal.cls}`}>{c.renewalDate}{renewal.suffix}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(c.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-button border border-[#D0DCF0] text-[#546E7A] text-xs font-medium hover:bg-[#F4F8FF] transition-colors"
          >
            <Pencil size={11} /> Edit
          </button>
          {isSuspended ? (
            <button
              onClick={() => onManage(c.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-success text-success text-xs font-medium hover:bg-success/5 transition-colors"
            >
              Reactivate
            </button>
          ) : (
            <>
              <button
                onClick={() => onManage(c.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-teal text-white text-xs font-medium hover:bg-teal-dark transition-colors"
              >
                <Settings2 size={12} /> Manage
              </button>
              {renewDays <= 14 && renewDays >= 0 && (
                <button
                  onClick={() => alert(`Send renewal reminder to ${c.csa}`)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-button text-xs font-medium text-secondary border border-[#D0DCF0] hover:bg-[#F4F8FF] transition-colors"
                  title="Send renewal reminder"
                >
                  Remind
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function CommunityAccessPage() {
  const navigate = useNavigate()
  const communities = useCommunityAccessStore(s => s.communities)

  const [search,          setSearch]          = useState('')
  const [statusFilter,    setStatusFilter]    = useState('all')
  const [planFilter,      setPlanFilter]      = useState('all')
  const [activeStatCard,  setActiveStatCard]  = useState(null)
  const [page,            setPage]            = useState(1)

  const applyStatFilter = (key) => {
    if (key === 'all')       { setStatusFilter('all');       setActiveStatCard('all') }
    if (key === 'active')    { setStatusFilter('active');    setActiveStatCard('active') }
    if (key === 'suspended') { setStatusFilter('suspended'); setActiveStatCard('suspended') }
    setPage(1)
  }

  const filtered = communities.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.name.toLowerCase().includes(q) || c.csa.toLowerCase().includes(q)) &&
      (statusFilter === 'all' || c.status === statusFilter) &&
      (planFilter === 'all' || c.plan.toLowerCase() === planFilter)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const active    = communities.filter(c => c.status === 'active').length
  const suspended = communities.filter(c => c.status === 'suspended').length
  const members   = communities.reduce((s, c) => s + c.memberCount, 0)

  return (
    <div className="space-y-4 p-3 pb-8">

      {/* Header — FIX 8: removed Add Community button, added info note */}
      <div>
        <div className="flex items-center gap-1.5 text-2xs text-secondary mb-1">
          <span>Platform Admin</span>
          <ChevronRight size={10} />
          <span className="text-primary font-medium">Community Access</span>
        </div>
        <h1 className="text-base font-bold text-primary flex items-center gap-2">
          <Shield size={16} className="text-teal" />
          Community Access Control
        </h1>
        <p className="text-[13px] text-secondary mt-0.5">
          Communities are created in All Tenants. Module access is auto-configured on tenant creation.
        </p>
      </div>

      {/* Stats Strip — FIX 12: clickable filter shortcuts */}
      <div className="grid grid-cols-4 divide-x divide-border border border-border rounded-xl bg-white overflow-hidden">
        {[
          { key: 'all',       label: 'Communities',   value: communities.length,              icon: Building2,   color: 'text-navy'    },
          { key: 'active',    label: 'Active',        value: active,                          icon: CheckCircle, color: 'text-success' },
          { key: 'suspended', label: 'Suspended',     value: suspended,                       icon: XCircle,     color: 'text-danger'  },
          { key: 'members',   label: 'Total Members', value: members.toLocaleString('en-IN'), icon: Users,       color: 'text-teal'    },
        ].map(s => {
          const isActive = activeStatCard === s.key
          return (
            <button
              key={s.key}
              onClick={() => s.key === 'members' ? navigate('/admin/tenants') : applyStatFilter(s.key)}
              className={`flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface/60 ${isActive ? 'ring-2 ring-inset ring-teal' : ''}`}
            >
              <s.icon size={16} className={`${s.color} flex-shrink-0`} />
              <div>
                <p className="text-base font-bold text-primary leading-tight">{s.value}</p>
                <p className="text-2xs text-secondary">{s.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input
            className="input pl-8 text-xs h-9"
            placeholder="Search communities…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="input text-xs h-9 w-auto pr-8" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setActiveStatCard(null); setPage(1) }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="input text-xs h-9 w-auto pr-8" value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}>
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
       
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                {['Community', 'Type', 'Members', 'Plan', 'Modules', 'Status', 'Renewal', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-2xs font-semibold text-secondary uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-secondary text-sm">
                    No communities match your filters.
                  </td>
                </tr>
              ) : paginated.map(c => (
                <CommunityRow
                  key={c.id}
                  c={c}
                  onManage={id => navigate(`/admin/community-access/${id}`)}
                  onEdit={id => navigate(`/admin/community-access/${id}/edit`)}
                />

              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination — always shown */}
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between bg-surface/30">
          <span className="text-2xs text-secondary">
            {filtered.length === 0
              ? 'No results'
              : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium border border-border text-secondary hover:bg-surface disabled:opacity-40 transition-colors bg-white"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-7 w-7 rounded-[6px] text-[12px] font-medium border transition-colors ${
                  n === page
                    ? 'bg-[#028090] text-white border-[#028090]'
                    : 'border-border text-secondary hover:bg-surface bg-white'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium border border-border text-secondary hover:bg-surface disabled:opacity-40 transition-colors bg-white"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

     
    </div>
  )
}
