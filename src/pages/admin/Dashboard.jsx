import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Building2, CheckCircle, Users, Activity, TrendingUp, Headphones,
  ArrowUpRight, ArrowDownRight, Plus, ChevronRight, ChevronDown,
  UserPlus, Smartphone, AlertCircle, CreditCard,
  Star, GitBranch, Globe, AlertTriangle, Clock, Zap,
} from 'lucide-react'
import {
  dashboardActivityFeed, topCommunitiesData,
} from '../../data/platform'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonRow } from '../../components/Skeleton'
import toast from 'react-hot-toast'

// ── Constants ─────────────────────────────────────────────────────────────────

const DATE_RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'All time']

const STATS = [
  {
    label: 'Total Tenants',
    rawValue: 12,
    format: v => String(Math.round(v)),
    trend: '↑ 2 this month',
    up: true,
    icon: Building2,
    iconBg: 'bg-teal/10',
    iconColor: 'text-teal',
    to: '/admin/tenants',
    secondary: '9 active · 2 pending · 1 suspended',
    secondaryColor: null,
  },
  {
    label: 'Active Communities',
    rawValue: 9,
    format: v => String(Math.round(v)),
    trend: '↑ 1 from last month',
    up: true,
    icon: CheckCircle,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    to: '/admin/tenants?status=active',
    secondary: '2 at risk of churn',
    secondaryColor: null,
  },
  {
    label: 'Total Members',
    rawValue: 1847,
    format: v => Math.round(v).toLocaleString('en-IN'),
    trend: '↑ 124 this month',
    up: true,
    icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    to: '/admin/tenants',
    secondary: '73% activation rate',
    secondaryColor: null,
  },
  {
    label: 'Platform Uptime',
    rawValue: 99.8,
    format: v => v.toFixed(1) + '%',
    trend: '↑ 0.1% from last month',
    up: true,
    icon: Activity,
    iconBg: 'bg-teal/10',
    iconColor: 'text-teal',
    to: '/admin/health',
    secondary: 'Last incident: 12 days ago',
    secondaryColor: null,
  },
  {
    label: 'Monthly Revenue (MRR)',
    rawValue: 240000,
    format: v => '₹' + Math.round(v).toLocaleString('en-IN'),
    trend: '↑ ₹20,000 from last month',
    up: true,
    icon: TrendingUp,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    to: '/admin/billing',
    secondary: '9 plans · Avg ₹26,667/tenant',
    secondaryColor: null,
  },
  {
    label: 'Open Support Tickets',
    rawValue: 3,
    format: v => String(Math.round(v)),
    trend: '↓ 2 from yesterday',
    up: false,
    icon: Headphones,
    iconBg: 'bg-amber/10',
    iconColor: 'text-amber',
    highlight: true,
    to: '/admin/support',
    secondary: '1 breaching SLA',
    secondaryColor: 'text-amber',
  },
]

const ACTIVITY_ICON_MAP = {
  members:   { Icon: UserPlus,      bg: 'bg-success/10',   color: 'text-success',    borderCls: 'border-success',  category: 'onboarding' },
  provision: { Icon: Building2,     bg: 'bg-teal/10',      color: 'text-teal',       borderCls: 'border-transparent', category: 'onboarding' },
  build:     { Icon: Smartphone,    bg: 'bg-navy/10',      color: 'text-navy',       borderCls: 'border-success',  category: 'builds'    },
  support:   { Icon: AlertCircle,   bg: 'bg-amber/10',     color: 'text-amber',      borderCls: 'border-danger',   category: 'urgent'    },
  billing:   { Icon: CreditCard,    bg: 'bg-success/10',   color: 'text-success',    borderCls: 'border-success',  category: 'billing'   },
  lead:      { Icon: Star,          bg: 'bg-teal/10',      color: 'text-teal',       borderCls: 'border-transparent', category: null       },
  hierarchy: { Icon: GitBranch,     bg: 'bg-purple-100',   color: 'text-purple-600', borderCls: 'border-transparent', category: null       },
  appstore:  { Icon: CheckCircle,   bg: 'bg-success/10',   color: 'text-success',    borderCls: 'border-success',  category: 'builds'    },
  alert:     { Icon: AlertTriangle, bg: 'bg-amber/10',     color: 'text-amber',      borderCls: 'border-amber',    category: 'urgent'    },
  domain:    { Icon: Globe,         bg: 'bg-navy/10',      color: 'text-navy',       borderCls: 'border-transparent', category: null       },
}

const HEALTH_SERVICES = [
  { name: 'API Server',      status: 'Online',     uptime: '99.8%', type: 'green' },
  { name: 'Database',        status: 'Online',     uptime: '100%',  type: 'green' },
  { name: 'OTP Service',     status: 'Online',     uptime: '98.4%', type: 'green' },
  { name: 'App Build Queue', status: '2 in queue', uptime: null,    type: 'amber' },
]

const QUICK_STATS = [
  { label: 'New Members Today',        value: 7   },
  { label: 'Referrals Logged Today',   value: 23  },
  { label: 'OTP Verifications Today',  value: 142 },
  { label: 'Meetings Held Today',      value: 4   },
  { label: 'Support Tickets Opened',   value: 2   },
]

const CHART_METRICS = {
  tenants: {
    label: 'Tenants',
    data: [
      { month: 'Nov', actual: 6,  target: 9  },
      { month: 'Dec', actual: 7,  target: 10 },
      { month: 'Jan', actual: 8,  target: 11 },
      { month: 'Feb', actual: 9,  target: 12 },
      { month: 'Mar', actual: 11, target: 14 },
      { month: 'Apr', actual: 12, target: 15 },
    ],
    yMax: 16,
    formatTick: v => String(v),
  },
  mrr: {
    label: 'MRR',
    data: [
      { month: 'Nov', actual: 150000, target: 200000 },
      { month: 'Dec', actual: 175000, target: 210000 },
      { month: 'Jan', actual: 190000, target: 220000 },
      { month: 'Feb', actual: 210000, target: 230000 },
      { month: 'Mar', actual: 225000, target: 240000 },
      { month: 'Apr', actual: 240000, target: 250000 },
    ],
    yMax: 280000,
    formatTick: v => `₹${(v / 1000).toFixed(0)}K`,
  },
  members: {
    label: 'Members',
    data: [
      { month: 'Nov', actual: 850,  target: 1000 },
      { month: 'Dec', actual: 1100, target: 1200 },
      { month: 'Jan', actual: 1280, target: 1400 },
      { month: 'Feb', actual: 1450, target: 1600 },
      { month: 'Mar', actual: 1620, target: 1800 },
      { month: 'Apr', actual: 1847, target: 2100 },
    ],
    yMax: 2200,
    formatTick: v => String(v),
  },
}

const REVENUE_BY_TYPE = [
  { type: 'Professional', amount: 125000, pct: 52, color: '#1B3A6B' },
  { type: 'Alumni',       amount: 70000,  pct: 29, color: '#028090' },
  { type: 'Trade Body',   amount: 45000,  pct: 19, color: '#E6A817' },
]

const HEALTH_BY_TYPE = [
  { type: 'Alumni',       avg: 91 },
  { type: 'Professional', avg: 88 },
  { type: 'Trade Body',   avg: 51 },
]

const ATTENTION_ITEMS = [
  {
    id: 'att-1', severity: 'red',
    tenantName: 'Entrepreneurs Club',
    title: 'Tenant Suspended',
    detail: 'Suspended for 8 days — no resolution or contact',
    action: 'View Tenant', to: '/admin/tenants/tenant-008',
  },
  {
    id: 'att-2', severity: 'red',
    tenantName: 'BNI Pune',
    title: 'Invoice Overdue',
    detail: '₹25,000 overdue by 6 days — June 2024',
    action: 'Send Reminder', to: '/admin/billing',
  },
  {
    id: 'att-3', severity: 'amber',
    tenantName: 'FICCI Gujarat',
    title: 'Onboarding Stalled',
    detail: 'Day 21 of 21 — only 50% complete, target go-live passed',
    action: 'Open Checklist', to: '/admin/onboarding/onb-002',
  },
  {
    id: 'att-4', severity: 'amber',
    tenantName: 'Alumni VJTI',
    title: '3 Nodes Unassigned',
    detail: '3 hierarchy nodes have no Level Admin assigned',
    action: 'Assign LA', to: '/admin/tenants/tenant-006',
  },
  {
    id: 'att-5', severity: 'amber',
    tenantName: 'FICCI Gujarat',
    title: 'SLA Approaching',
    detail: 'Ticket #tkt-002 breaches SLA in 2 hours',
    action: 'View Ticket', to: '/admin/support',
  },
]

const ONBOARDING_ITEMS = [
  {
    id: 'onb-002', communityName: 'FICCI Gujarat', type: 'Trade Body', typeColor: '#E6A817',
    progress: 50, stepsComplete: 5, totalSteps: 10, status: 'overdue',
    dayNumber: 21, totalDays: 21, nextStep: 'Level Admins to be assigned',
  },
  {
    id: 'onb-003', communityName: 'BNI Delhi', type: 'Professional', typeColor: '#1B3A6B',
    progress: 30, stepsComplete: 3, totalSteps: 10, status: 'stalled',
    dayNumber: 8, totalDays: 21, nextStep: 'Branding assets to be uploaded',
  },
]

const UPCOMING_DEADLINES = [
  { id: 'ud-1', severity: 'red',   text: 'BNI Pune — app build overdue',              daysLeft: -1 },
  { id: 'ud-2', severity: 'amber', text: 'CII Maharashtra — invoice due in 2 days',   daysLeft: 2  },
  { id: 'ud-3', severity: 'blue',  text: 'BNI Delhi — target go-live in 5 days',      daysLeft: 5  },
  { id: 'ud-4', severity: 'blue',  text: 'Alumni IIT Bombay — renewal in 7 days',     daysLeft: 7  },
]

const APP_BUILD_QUEUE = [
  { community: 'BNI Delhi',     platform: 'iOS',  status: 'Building', timeInQueue: '45 min'  },
  { community: 'FICCI Gujarat', platform: 'Both', status: 'Queued',   timeInQueue: '2h 15m'  },
]

const TABLE_ISSUES = {
  'Entrepreneurs Club': { issue: 'Tenant suspended',          fix: 'View Tenant',    to: '/admin/tenants/tenant-008' },
  'FICCI Gujarat':      { issue: 'Onboarding stalled',        fix: 'View Onboarding', to: '/admin/onboarding/onb-002' },
  'Mumbai Realtors':    { issue: 'No meetings in 14 days',    fix: 'View Meetings',  to: '/admin/tenants/tenant-004' },
  'Alumni VJTI':        { issue: '18% member activation',     fix: 'Assign LA',      to: '/admin/tenants/tenant-006' },
  'BNI Pune':           { issue: 'Invoice overdue',           fix: 'Send Invoice',   to: '/admin/billing' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatCurrentDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getSystemStatus() {
  const down = HEALTH_SERVICES.filter(s => s.type === 'red')
  const degraded = HEALTH_SERVICES.filter(s => s.type === 'amber')
  if (down.length > 0) return { text: 'System issues detected', cls: 'text-danger' }
  if (degraded.length > 0) return { text: `${degraded.length} service degraded`, cls: 'text-amber' }
  return { text: 'All systems operational', cls: 'text-success' }
}

function healthBadgeClass(score) {
  if (score >= 90) return 'badge-success'
  if (score >= 70) return 'badge-amber'
  if (score >= 50) return 'bg-orange-100 text-orange-700 border border-orange-200'
  return 'badge-danger'
}

function severityDot(sev) {
  if (sev === 'red') return 'bg-danger'
  if (sev === 'amber') return 'bg-amber'
  return 'bg-blue-500'
}

// ── AnimatedNumber ────────────────────────────────────────────────────────────

function AnimatedNumber({ target, format, active }) {
  const [val, setVal] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) { setVal(0); return }
    const start = performance.now()
    const duration = 600

    function step(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(target * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setVal(target)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, active])

  return <>{format(val)}</>
}

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function ChartSkeleton({ height = 220 }) {
  return <div className="animate-pulse bg-gray-100 rounded-button" style={{ height }} />
}

function ActivitySkeletonRow() {
  return (
    <div className="px-6 py-3.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
      <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

function HealthSkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-3 h-3 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
      <div className="w-12 h-4 bg-gray-100 rounded animate-pulse" />
      <div className="w-10 h-4 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const actual = payload.find(p => p.dataKey === 'actual')
  const target = payload.find(p => p.dataKey === 'target')
  const gap = actual && target ? target.value - actual.value : null
  return (
    <div className="card py-2 px-3 shadow-modal text-xs space-y-0.5">
      <p className="font-semibold text-primary">{label}</p>
      {actual && <p className="text-teal font-medium">Actual: {actual.value}</p>}
      {target && <p className="text-secondary">Target: {target.value}</p>}
      {gap !== null && (
        <p className={gap > 0 ? 'text-danger' : 'text-success'}>
          {gap > 0 ? `${gap} behind target` : `${Math.abs(gap)} ahead of target`}
        </p>
      )}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="card p-3 sm:p-4 flex flex-col gap-2 min-h-[7.5rem]">
      <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="h-3 w-24 max-w-full bg-gray-100 rounded animate-pulse" />
      <div className="h-7 w-16 max-w-full bg-gray-100 rounded animate-pulse mt-1" />
      <div className="h-2.5 w-full max-w-[10rem] bg-gray-100 rounded animate-pulse mt-auto" />
    </div>
  )
}

function StatCard({ stat, loading, animateActive }) {
  if (loading) return <StatCardSkeleton />
  const { label, rawValue, format, trend, up, icon: Icon, iconBg, iconColor, highlight, to, secondary, secondaryColor } = stat
  return (
    <Link
      to={to}
      className={`card p-3 sm:p-4 flex flex-col gap-2 min-h-0 min-w-0 overflow-hidden hover:shadow-modal hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${highlight ? 'ring-1 ring-amber' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={17} className={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div className="min-w-0 flex flex-col flex-1 gap-0.5">
        <p className="text-[11px] sm:text-xs font-medium text-secondary leading-snug pr-0.5">{label}</p>
        <p className="min-w-0 text-lg sm:text-xl lg:text-2xl font-bold text-primary leading-tight tabular-nums tracking-tight [overflow-wrap:anywhere]">
          <AnimatedNumber target={rawValue} format={format} active={animateActive} />
        </p>
        <div className={`flex items-start gap-1 pt-1 text-[10px] sm:text-xs font-medium leading-snug min-w-0 ${up ? 'text-success' : 'text-danger'}`}>
          <span className="flex-shrink-0 mt-px">{up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}</span>
          <span className="min-w-0 [overflow-wrap:anywhere]">{trend}</span>
        </div>
        {secondary && (
          <p className={`text-[10px] leading-snug mt-0.5 ${secondaryColor || 'text-secondary'}`}>{secondary}</p>
        )}
      </div>
    </Link>
  )
}

// ── NeedsAttentionSection ─────────────────────────────────────────────────────

function NeedsAttentionSection({ items, navigate }) {
  const visible = items.slice(0, 5)
  const extra = items.length - 5

  if (items.length === 0) {
    return (
      <div className="flex justify-start">
        <span className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-full">
          ✓ All clear — nothing needs attention today
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-card overflow-hidden" style={{ borderLeft: '4px solid #BF360C' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
        <span className="text-sm font-bold text-navy flex items-center gap-1.5">
          <Zap size={13} className="text-danger flex-shrink-0" />
          Needs Your Attention
        </span>
        <span className="text-xs font-bold bg-danger text-white px-1.5 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="divide-y divide-border">
        {visible.map(item => (
          <div key={item.id} className="px-4 py-2.5 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${severityDot(item.severity)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-navy truncate">{item.tenantName} — {item.title}</p>
              <p className="text-[11px] text-secondary truncate">{item.detail}</p>
            </div>
            <button
              onClick={() => navigate(item.to)}
              className="btn btn-outline btn-sm text-xs flex-shrink-0"
              style={{ height: 32 }}
            >
              {item.action}
            </button>
          </div>
        ))}
      </div>
      {extra > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <Link to="/admin/support" className="text-xs font-medium text-teal hover:underline">+ {extra} more items</Link>
        </div>
      )}
    </div>
  )
}

// ── QuickStatsRibbon ──────────────────────────────────────────────────────────

function QuickStatsRibbon() {
  return (
    <div
      className="flex items-center overflow-x-auto"
      style={{ background: '#F4F8FF', borderBottom: '1px solid #D0DCF0', height: 40, paddingLeft: 16, paddingRight: 16 }}
    >
      {QUICK_STATS.map((s, i) => (
        <div key={s.label} className="flex items-center flex-shrink-0">
          {i > 0 && <span className="mx-4 text-border text-xs select-none">|</span>}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 11 }} className="text-secondary whitespace-nowrap">{s.label}:</span>
            <span style={{ fontSize: 13 }} className="font-bold text-navy">{s.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── OnboardingWidget ──────────────────────────────────────────────────────────

function OnboardingWidget({ items, navigate }) {
  function statusBadge(status) {
    if (status === 'overdue') return <span className="badge badge-danger text-[10px]">Overdue 🔴</span>
    if (status === 'stalled') return <span className="badge badge-amber text-[10px]">Stalled ⚠</span>
    return <span className="badge badge-success text-[10px]">On Track</span>
  }

  if (items.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center gap-2">
        <CheckCircle size={28} className="text-success" />
        <p className="text-sm text-secondary">No active onboardings — all tenants are live ✓</p>
      </div>
    )
  }

  const sorted = [...items].sort((a, b) => {
    const order = { overdue: 0, stalled: 1, on_track: 2 }
    return (order[a.status] ?? 2) - (order[b.status] ?? 2)
  })

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-navy">Onboarding in Progress</h2>
        <Link to="/admin/onboarding" className="text-xs font-medium text-teal hover:underline">View All →</Link>
      </div>
      <div className="divide-y divide-border">
        {sorted.slice(0, 3).map(item => (
          <div key={item.id} className="px-5 py-3 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-primary">{item.communityName}</span>
                <span className="badge text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: item.typeColor + '20', color: item.typeColor }}>{item.type}</span>
              </div>
              <div style={{ width: 200 }}>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-teal rounded-full" style={{ width: `${item.progress}%`, transition: 'width 0.5s ease' }} />
                </div>
                <p className="text-[11px] text-secondary mt-0.5">{item.progress}% · {item.stepsComplete} of {item.totalSteps} steps done</p>
              </div>
            </div>
            <div className="flex-shrink-0">{statusBadge(item.status)}</div>
            <div className="flex-shrink-0 text-xs text-secondary whitespace-nowrap">Day {item.dayNumber} of {item.totalDays}</div>
            <div className="flex-shrink-0">
              {item.status === 'overdue' && (
                <button onClick={() => navigate(`/admin/onboarding/${item.id}`)} className="btn btn-sm text-danger border border-danger hover:bg-danger/5 text-xs" style={{ height: 32 }}>View Now</button>
              )}
              {item.status === 'stalled' && (
                <button onClick={() => navigate(`/admin/onboarding/${item.id}`)} className="btn btn-sm text-amber border border-amber hover:bg-amber/5 text-xs" style={{ height: 32 }}>Nudge CSA</button>
              )}
              {item.status === 'on_track' && (
                <button onClick={() => navigate(`/admin/onboarding/${item.id}`)} className="btn btn-ghost btn-sm text-xs" style={{ height: 32 }}>View →</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── UpcomingDeadlinesWidget ───────────────────────────────────────────────────

function UpcomingDeadlinesWidget() {
  const items = UPCOMING_DEADLINES

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-bold text-navy">Upcoming This Week</h2>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-4 text-xs text-secondary text-center">No deadlines this week ✓</div>
      ) : (
        <div className="divide-y divide-border">
          {items.map(item => {
            const dotCls = item.severity === 'red' ? 'bg-danger' : item.severity === 'amber' ? 'bg-amber' : 'bg-blue-500'
            const daysCls = item.severity === 'red' ? 'text-danger' : item.severity === 'amber' ? 'text-amber' : 'text-blue-600'
            const daysText = item.daysLeft < 0 ? 'Overdue' : `${item.daysLeft} day${item.daysLeft === 1 ? '' : 's'}`
            return (
              <div key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
                <p className="text-xs text-primary flex-1">{item.text}</p>
                <span className={`text-xs font-bold whitespace-nowrap ${daysCls}`}>{daysText}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.currentUser)
  const loading = useLoading(800)
  const [dateRange, setDateRange] = useState('Last 7 days')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [allRead, setAllRead] = useState(false)
  const [sortKey, setSortKey] = useState('healthScore')
  const [sortDir, setSortDir] = useState('desc')
  const [chartMetric, setChartMetric] = useState('tenants')
  const [rightChartTab, setRightChartTab] = useState('revenue')
  const [activityFilter, setActivityFilter] = useState('all')
  const [tableMode, setTableMode] = useState('needs_attention')
  const [buildQueueExpanded, setBuildQueueExpanded] = useState(false)
  const [lastChecked, setLastChecked] = useState(0) // seconds ago
  const rangeRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) setRangeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Auto-update "last checked" timestamp
  useEffect(() => {
    const interval = setInterval(() => setLastChecked(s => s + 30), 30000)
    return () => clearInterval(interval)
  }, [])

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedCommunities = [...topCommunitiesData].sort((a, b) => {
    let aVal = a[sortKey]
    let bVal = b[sortKey]
    if (typeof aVal === 'string' && aVal.startsWith('₹')) {
      aVal = parseFloat(aVal.replace(/[^0-9.]/g, ''))
      bVal = parseFloat(bVal.replace(/[^0-9.]/g, ''))
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    if (typeof aVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  // For needs-attention mode: lowest health score first
  const needsAttentionCommunities = [...topCommunitiesData].sort((a, b) => a.healthScore - b.healthScore)

  const tableData = tableMode === 'best' ? sortedCommunities.slice(0, 5) : needsAttentionCommunities.slice(0, 5)

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronDown size={11} className="text-secondary/40 ml-1 inline" />
    return sortDir === 'asc'
      ? <ArrowUpRight size={11} className="text-teal ml-1 inline" />
      : <ArrowDownRight size={11} className="text-teal ml-1 inline" />
  }

  // Activity filter
  const filteredActivity = dashboardActivityFeed.filter(item => {
    if (activityFilter === 'all') return true
    const meta = ACTIVITY_ICON_MAP[item.type] ?? ACTIVITY_ICON_MAP.domain
    return meta.category === activityFilter
  })

  const systemStatus = getSystemStatus()
  const currentMetric = CHART_METRICS[chartMetric]
  const lastCheckedText = lastChecked === 0 ? 'Updated just now' : `Updated ${lastChecked} seconds ago`

  // Tenant ID map for navigation
  function tenantRoute(name) {
    const map = {
      'BNI Mumbai Metro': 'tenant-001', 'Alumni IIT Bombay': 'tenant-002',
      'FICCI Gujarat': 'tenant-003', 'Mumbai Realtors Club': 'tenant-004',
      'CII Maharashtra': 'tenant-005', 'Alumni VJTI': 'tenant-006',
      'BNI Pune': 'tenant-007', 'Entrepreneurs Club': 'tenant-008',
      'Mumbai Realtors': 'tenant-004',
    }
    return `/admin/tenants/${map[name] || name.toLowerCase().replace(/\s+/g, '-')}`
  }

  return (
    <div className="space-y-6 p-3">

      {/* ── Degraded service banner ───────────────────────────────────────── */}
      {HEALTH_SERVICES.some(s => s.type !== 'green') && (
        <Link to="/admin/health" className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-button px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100 transition-colors">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          <span className="font-medium">Service degraded:</span>
          <span>{HEALTH_SERVICES.filter(s => s.type !== 'green').map(s => s.name).join(', ')}</span>
          <span className="ml-auto text-xs text-amber-600 font-medium">View Health →</span>
        </Link>
      )}

      {/* ── Needs Your Attention ──────────────────────────────────────────── */}
      {!loading && <NeedsAttentionSection items={ATTENTION_ITEMS} navigate={navigate} />}

      {/* ── Section 1: Page Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-primary">
              {getGreeting()}, {currentUser?.name?.split(' ')[0] ?? 'Admin'} 👋
            </h1>
            <span className={`text-sm font-medium ${systemStatus.cls}`}>· {systemStatus.text}</span>
          </div>
          <p className="text-xs text-secondary mt-0.5">{formatCurrentDate()}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => navigate('/admin/tenants/new')} className="btn btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={14} /> New Tenant
          </button>
          <div className="relative" ref={rangeRef}>
            <button
              onClick={() => setRangeOpen(o => !o)}
              className="btn btn-outline flex items-center gap-2 text-sm"
            >
              {dateRange}
              <ChevronDown size={14} className={`transition-transform duration-150 ${rangeOpen ? 'rotate-180' : ''}`} />
            </button>
            {rangeOpen && (
              <div className="absolute right-0 mt-1 w-44 card shadow-modal py-1 z-20">
                {DATE_RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => { setDateRange(r); setRangeOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors ${dateRange === r ? 'text-teal font-semibold' : 'text-primary'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Stats Ribbon ─────────────────────────────────────────────── */}
      <QuickStatsRibbon />

      {/* ── Section 2: Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {STATS.map(s => (
          <StatCard key={s.label} stat={s} loading={loading} animateActive={!loading} />
        ))}
      </div>

      {/* ── Section 3: Charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Area chart — 60% */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">Tenant Growth</h2>
            {/* Metric toggle */}
            <div className="flex gap-1">
              {Object.entries(CHART_METRICS).map(([key, m]) => (
                <button
                  key={key}
                  onClick={() => setChartMetric(key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${chartMetric === key ? 'bg-teal text-white' : 'bg-white text-secondary border border-border hover:border-teal/40'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? <ChartSkeleton height={224} /> : (
            <ResponsiveContainer width="100%" height={224}>
              <ComposedChart data={currentMetric.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#028090" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#028090" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#546E7A' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#546E7A' }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                  domain={[0, currentMetric.yMax]}
                  tickFormatter={currentMetric.formatTick}
                />
                <Tooltip content={<AreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#028090"
                  strokeWidth={2}
                  fill="url(#tealGrad)"
                  dot={{ fill: '#028090', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#028090' }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#C17900"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          {!loading && (
            <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-teal inline-block rounded-full" />Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-px border-t-2 border-dashed border-[#C17900] inline-block" />Target</span>
            </div>
          )}
        </div>

        {/* Revenue / Health by Type — 40% */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">
              {rightChartTab === 'revenue' ? 'Revenue by Type' : 'Health by Type'}
            </h2>
            <div className="flex gap-1">
              {[{ id: 'revenue', label: 'Revenue' }, { id: 'health', label: 'Health' }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRightChartTab(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${rightChartTab === tab.id ? 'bg-teal text-white' : 'bg-white text-secondary border border-border hover:border-teal/40'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? <ChartSkeleton height={200} /> : (
            <div className="space-y-3">
              {rightChartTab === 'revenue' ? (
                REVENUE_BY_TYPE.map(row => (
                  <div key={row.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-primary">{row.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-secondary">₹{(row.amount / 1000).toFixed(0)}K</span>
                        <span className="font-semibold text-primary">{row.pct}%</span>
                      </div>
                    </div>
                    <div className="h-4 bg-surface rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                  </div>
                ))
              ) : (
                HEALTH_BY_TYPE.map(row => {
                  const barColor = row.avg >= 80 ? '#2E7D32' : row.avg >= 60 ? '#C17900' : '#BF360C'
                  return (
                    <div key={row.type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-primary">{row.type}</span>
                        <span className="font-semibold" style={{ color: barColor }}>{row.avg} avg</span>
                      </div>
                      <div className="h-4 bg-surface rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm" style={{ width: `${row.avg}%`, background: barColor }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 3.5: Onboarding In Progress ───────────────────────────── */}
      {!loading && <OnboardingWidget items={ONBOARDING_ITEMS} navigate={navigate} />}

      {/* ── Section 4: Activity + Health ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">

        {/* Activity Feed — col-span-5 */}
        <div className="card overflow-hidden lg:col-span-5">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">Recent Platform Activity</h2>
            {!loading && (
              <button
                onClick={() => { setAllRead(true); toast.success('All activity marked as read') }}
                className="text-xs font-medium text-teal hover:text-teal-dark transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter chips */}
          {!loading && (
            <div className="px-6 pt-3 pb-2 flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all',        label: 'All'        },
                { id: 'urgent',     label: 'Urgent'     },
                { id: 'billing',    label: 'Billing'    },
                { id: 'onboarding', label: 'Onboarding' },
                { id: 'builds',     label: 'Builds'     },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setActivityFilter(chip.id)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border ${activityFilter === chip.id ? 'bg-teal text-white border-teal' : 'bg-white text-secondary border-border hover:border-teal/40'}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => <ActivitySkeletonRow key={i} />)}
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {filteredActivity.slice(0, 8).map(item => {
                  const { Icon, bg, color, borderCls } = ACTIVITY_ICON_MAP[item.type] ?? ACTIVITY_ICON_MAP.domain
                  const unread = item.unread && !allRead
                  const appliedBorder = unread ? 'border-navy' : (borderCls || 'border-transparent')
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate('/admin/support')}
                      className={`w-full text-left px-6 py-3 flex items-center gap-3 hover:bg-surface transition-colors group border-l-2 ${appliedBorder}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon size={14} className={color} />
                      </div>
                      <p className={`text-sm flex-1 ${unread ? 'font-medium text-primary' : 'text-secondary'}`}>
                        {item.text}
                      </p>
                      <span className="text-xs text-secondary whitespace-nowrap">{item.time}</span>
                      <ChevronRight size={13} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
              <div className="px-6 py-3 border-t border-border">
                <Link to="/admin/support" className="text-xs font-medium text-teal hover:underline transition-colors">
                  View all activity →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Right column: System Status + Upcoming Deadlines */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* System Status card */}
          <div className="card overflow-hidden flex-1">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-primary">System Status</h2>
            </div>
            {loading ? (
              <div className="px-6 py-4 space-y-1">
                <div className="h-9 bg-gray-100 rounded-button animate-pulse mb-3" />
                {Array.from({ length: 4 }).map((_, i) => <HealthSkeletonRow key={i} />)}
              </div>
            ) : (
              <>
                <div className="px-6 pt-4">
                  <div className="flex items-center gap-2 bg-success/10 px-4 py-2.5 rounded-button">
                    <CheckCircle size={15} className="text-success flex-shrink-0" />
                    <span className="text-sm font-semibold text-success">All Systems Operational</span>
                  </div>
                </div>
                <div className="px-6 pb-2 divide-y divide-border">
                  {HEALTH_SERVICES.map(svc => {
                    const isQueue = svc.name === 'App Build Queue'
                    return (
                      <div key={svc.name}>
                        <button
                          className="w-full flex items-center gap-3 py-3 hover:bg-surface/60 transition-colors group text-left"
                          onClick={() => {
                            if (isQueue) setBuildQueueExpanded(v => !v)
                            else navigate('/admin/health')
                          }}
                        >
                          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${svc.type === 'green' ? 'bg-success' : 'bg-amber'}`} />
                            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${svc.type === 'green' ? 'bg-success' : 'bg-amber'}`} />
                          </span>
                          <span className="text-sm text-primary flex-1 text-left">{svc.name}</span>
                          <span className={`text-xs font-medium ${svc.type === 'green' ? 'text-success' : 'text-amber'}`}>
                            {svc.status}
                          </span>
                          {svc.uptime && (
                            <span className="text-xs text-secondary w-10 text-right">{svc.uptime}</span>
                          )}
                          {isQueue ? (
                            <ChevronDown size={13} className={`text-secondary transition-transform ${buildQueueExpanded ? 'rotate-180' : ''}`} />
                          ) : (
                            <ChevronRight size={13} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                        {isQueue && buildQueueExpanded && (
                          <div className="pb-2 pl-5 space-y-1.5">
                            {APP_BUILD_QUEUE.map((b, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-secondary bg-surface rounded px-2.5 py-1.5">
                                <span className="font-medium text-primary flex-1">{b.community}</span>
                                <span className="badge badge-gray text-[10px]">{b.platform}</span>
                                <span className={b.status === 'Building' ? 'text-teal font-medium' : 'text-secondary'}>{b.status}</span>
                                <span className="text-secondary">{b.timeInQueue}</span>
                              </div>
                            ))}
                            <Link to="/admin/app-deployment" className="text-xs text-teal font-medium hover:underline pl-2.5 block">View All Builds →</Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="px-6 py-2 border-t border-border flex items-center justify-between">
                  <Link to="/admin/health" className="text-xs font-medium text-teal hover:text-teal-dark transition-colors">
                    View detailed health →
                  </Link>
                  <span className="text-[10px] text-secondary flex items-center gap-1"><Clock size={10} />{lastCheckedText}</span>
                </div>
              </>
            )}
          </div>

          {/* Upcoming Deadlines */}
          {!loading && <UpcomingDeadlinesWidget />}
        </div>
      </div>

      {/* ── Section 5: Top Communities Table ──────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">
              {tableMode === 'best' ? 'Top Performing Communities' : 'Communities Needing Attention'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary">Showing top 5</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTableMode('best')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${tableMode === 'best' ? 'bg-navy text-white border-navy' : 'bg-white text-secondary border-border hover:border-navy/40'}`}
                >
                  ⬆ Best
                </button>
                <button
                  onClick={() => setTableMode('needs_attention')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${tableMode === 'needs_attention' ? 'bg-navy text-white border-navy' : 'bg-white text-secondary border-border hover:border-navy/40'}`}
                >
                  ⬇ Needs Attention
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {[
                  { key: 'name',        label: 'Community'    },
                  { key: 'members',     label: 'Members'      },
                  { key: 'referrals',   label: 'Referrals'    },
                  { key: 'revenue',     label: '₹ Business'   },
                  { key: 'meetings',    label: 'Meetings'     },
                  ...(tableMode === 'needs_attention' ? [{ key: 'issue', label: 'Issue' }] : []),
                  { key: 'healthScore', label: 'Health Score' },
                  ...(tableMode === 'needs_attention' ? [{ key: 'fix', label: 'Fix' }] : []),
                ].map(col => (
                  <th
                    key={col.key}
                    className={`th px-6 py-3 whitespace-nowrap ${['name','members','referrals','revenue','meetings','healthScore'].includes(col.key) ? 'cursor-pointer hover:text-teal select-none' : ''}`}
                    onClick={() => !loading && ['name','members','referrals','revenue','meetings','healthScore'].includes(col.key) && handleSort(col.key)}
                  >
                    {col.label}
                    {!loading && ['name','members','referrals','revenue','meetings','healthScore'].includes(col.key) && <SortIcon col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={tableMode === 'needs_attention' ? 8 : 6} />)
                : tableData.map(c => {
                    const issueData = TABLE_ISSUES[c.name]
                    return (
                      <tr
                        key={c.name}
                        className="tr hover:bg-surface cursor-pointer"
                      >
                        <td className="td px-6 py-3.5">
                          <Link
                            to={tenantRoute(c.name)}
                            className="font-medium text-primary whitespace-nowrap hover:text-teal transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="td px-6 py-3.5">{c.members.toLocaleString('en-IN')}</td>
                        <td className="td px-6 py-3.5">{c.referrals}</td>
                        <td className="td px-6 py-3.5">{c.revenue}</td>
                        <td className="td px-6 py-3.5">{c.meetings}</td>
                        {tableMode === 'needs_attention' && (
                          <td className="td px-6 py-3.5 text-xs text-secondary">
                            {issueData?.issue ?? '—'}
                          </td>
                        )}
                        <td className="td px-6 py-3.5">
                          <div className="group relative inline-block">
                            <span
                              className={`badge ${healthBadgeClass(c.healthScore)} cursor-pointer`}
                              onClick={() => navigate(tenantRoute(c.name))}
                            >
                              {c.healthScore}
                            </span>
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 pointer-events-none">
                              <div className="bg-white border border-border rounded-card shadow-modal px-2.5 py-1.5 text-xs text-secondary whitespace-nowrap">
                                Score breakdown available in tenant detail
                              </div>
                            </div>
                          </div>
                        </td>
                        {tableMode === 'needs_attention' && (
                          <td className="td px-6 py-3.5">
                            {issueData ? (
                              <button
                                onClick={() => navigate(issueData.to)}
                                className="btn btn-ghost btn-sm text-xs border border-border"
                                style={{ height: 30 }}
                              >
                                {issueData.fix}
                              </button>
                            ) : <span className="text-secondary text-xs">—</span>}
                          </td>
                        )}
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border">
          <Link to="/admin/tenants" className="text-xs font-medium text-teal hover:underline transition-colors">
            View All Tenants →
          </Link>
        </div>
      </div>

    </div>
  )
}
