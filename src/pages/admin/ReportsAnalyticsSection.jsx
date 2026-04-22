import { useState, useMemo } from 'react'
import {
  Download, FileText, Users, Building2, TrendingUp,
  BarChart3, IndianRupee, Calendar, AlertTriangle,
  ChevronDown, Award, Activity, Zap,
} from 'lucide-react'
import Select from '../../components/Select'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import toast from 'react-hot-toast'
import { tenants, COMMUNITY_TYPES } from '../../data/tenants'
import { invoices, mrrHistory, planDistribution } from '../../data/billing'
import { useLoading } from '../../hooks/useLoading'

// ── Static Chart Data ─────────────────────────────────────────────────────────

const MEMBER_GROWTH_12 = [
  { month: 'Jul 23', members: 820  },
  { month: 'Aug 23', members: 960  },
  { month: 'Sep 23', members: 1100 },
  { month: 'Oct 23', members: 1240 },
  { month: 'Nov 23', members: 1380 },
  { month: 'Dec 23', members: 1480 },
  { month: 'Jan 24', members: 1560 },
  { month: 'Feb 24', members: 1685 },
  { month: 'Mar 24', members: 1820 },
  { month: 'Apr 24', members: 1920 },
  { month: 'May 24', members: 1985 },
  { month: 'Jun 24', members: 2027 },
]

const WEEKLY_REFERRALS = [
  { week: 'Apr W1', referrals: 82  },
  { week: 'Apr W2', referrals: 95  },
  { week: 'Apr W3', referrals: 108 },
  { week: 'Apr W4', referrals: 124 },
  { week: 'May W1', referrals: 142 },
  { week: 'May W2', referrals: 135 },
  { week: 'May W3', referrals: 158 },
  { week: 'Jun W1', referrals: 168 },
]

const MRR_12 = [
  { month: 'Jul 23', mrr: 75000  },
  { month: 'Aug 23', mrr: 90000  },
  { month: 'Sep 23', mrr: 108000 },
  { month: 'Oct 23', mrr: 128000 },
  { month: 'Nov 23', mrr: 145000 },
  { month: 'Dec 23', mrr: 158000 },
  ...mrrHistory.map(d => ({ month: `${d.month} 24`, mrr: d.mrr })),
]

const REV_BY_PLAN_12 = [
  { month: 'Jul 23', starter: 12000, professional: 35000, enterprise: 28000 },
  { month: 'Aug 23', starter: 12000, professional: 50000, enterprise: 28000 },
  { month: 'Sep 23', starter: 24000, professional: 56000, enterprise: 28000 },
  { month: 'Oct 23', starter: 24000, professional: 60000, enterprise: 44000 },
  { month: 'Nov 23', starter: 24000, professional: 75000, enterprise: 46000 },
  { month: 'Dec 23', starter: 24000, professional: 87000, enterprise: 47000 },
  { month: 'Jan 24', starter: 36000, professional: 50000, enterprise: 34000 },
  { month: 'Feb 24', starter: 36000, professional: 62000, enterprise: 47000 },
  { month: 'Mar 24', starter: 36000, professional: 75000, enterprise: 54000 },
  { month: 'Apr 24', starter: 36000, professional: 104000, enterprise: 55000 },
  { month: 'May 24', starter: 36000, professional: 124000, enterprise: 60000 },
  { month: 'Jun 24', starter: 36000, professional: 150000, enterprise: 54000 },
]

const DAU_30 = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 1}`,
  dau: [312,298,334,356,320,288,295,342,368,381,360,344,355,372,365,378,390,382,370,365,358,348,374,388,395,402,390,381,376,384][i],
}))

const ENGAGEMENT_DIST = [
  { range: '0–20',  count: 45,  label: 'At risk'  },
  { range: '21–40', count: 120, label: 'Low'       },
  { range: '41–60', count: 285, label: 'Moderate'  },
  { range: '61–80', count: 520, label: 'Good'      },
  { range: '81–100',count: 310, label: 'Excellent' },
]

const MODULE_HEATMAP = [
  { module: 'Meetings',      pn: 95, al: 42, ta: 78, re: 88, co: 65, fl: 34 },
  { module: 'Attendance',    pn: 88, al: 38, ta: 72, re: 82, co: 60, fl: 28 },
  { module: 'Referrals',     pn: 92, al: 55, ta: 85, re: 60, co: 70, fl: 20 },
  { module: '1:1 Meetings',  pn: 78, al: 30, ta: 45, re: 35, co: 80, fl: 15 },
  { module: 'Events',        pn: 50, al: 88, ta: 75, re: 92, co: 55, fl: 45 },
  { module: 'Communication', pn: 82, al: 75, ta: 80, re: 78, co: 85, fl: 72 },
  { module: 'Activity Feed', pn: 68, al: 82, ta: 62, re: 70, co: 75, fl: 80 },
]

const HEATMAP_COLS = [
  { key: 'pn', label: 'Prof. Network' },
  { key: 'al', label: 'Alumni'        },
  { key: 'ta', label: 'Trade Assoc.'  },
  { key: 're', label: 'Religious'     },
  { key: 'co', label: 'Corporate'     },
  { key: 'fl', label: 'Flat Comm.'    },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtINR(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function parseValue(str) {
  return parseInt((str || '0').replace(/[₹, ]/g, '')) || 0
}

function heatColor(val) {
  if (val >= 80) return { bg: '#028090', color: 'white' }
  if (val >= 60) return { bg: '#B2EBF2', color: '#005F6A' }
  if (val >= 35) return { bg: '#E0F7FA', color: '#028090' }
  return { bg: '#ECEFF1', color: '#78909C' }
}

// Generic custom tooltip
function ChartTooltip({ active, payload, label, fmt = (v) => v?.toLocaleString('en-IN') }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-card shadow-modal px-3 py-2.5 min-w-[120px]">
      <p className="text-xs font-semibold text-primary mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: entry.color ?? entry.fill }} />
          <span className="text-secondary capitalize">{entry.name?.replace(/_/g, ' ')}</span>
          <span className="font-bold ml-auto" style={{ color: entry.color ?? entry.fill }}>{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// KPI card
function KPICard({ label, value, sub, trend, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="card p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-button flex items-center justify-center ${iconBg}`}>
          <Icon size={14} className={iconColor} />
        </div>
      </div>
      <p className="text-2xl font-bold text-primary leading-none">{value}</p>
      {sub   && <p className="text-xs text-secondary">{sub}</p>}
      {trend && <p className="text-xs font-medium text-success">{trend}</p>}
    </div>
  )
}

// Section card wrapper
function Section({ title, sub, action, children }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Tab 1 — Platform Overview ─────────────────────────────────────────────────

function PlatformOverviewTab() {
  const [sortBy, setSortBy] = useState('referrals')

  const totalMembers   = tenants.reduce((s, t) => s + t.memberCount, 0)
  const activeComms    = tenants.filter(t => t.status === 'active').length
  const totalReferrals = tenants.reduce((s, t) => s + t.referralsThisMonth, 0)
  const totalValue     = tenants.reduce((s, t) => s + parseValue(t.businessValue), 0)
  const totalMeetings  = tenants.reduce((s, t) => s + t.meetingsHeld, 0)

  // Community type donut
  const typeMap = {}
  tenants.forEach(t => {
    const label = COMMUNITY_TYPES.find(ct => ct.value === t.type)?.label ?? t.type
    typeMap[label] = (typeMap[label] ?? 0) + 1
  })
  const typeData = Object.entries(typeMap).map(([name, count], i) => ({
    name, count,
    color: ['#028090', '#1B3A6B', '#C17900', '#2E7D32', '#6A1B9A', '#E65100'][i],
  }))

  // Top 5
  const top5 = [...tenants].sort((a, b) => {
    if (sortBy === 'referrals') return b.referralsThisMonth - a.referralsThisMonth
    if (sortBy === 'members')   return b.memberCount - a.memberCount
    if (sortBy === 'value')     return parseValue(b.businessValue) - parseValue(a.businessValue)
    if (sortBy === 'health')    return b.healthScore - a.healthScore
    return 0
  }).slice(0, 5)

  const SORT_OPTIONS = [
    { value: 'referrals', label: 'Referrals' },
    { value: 'members',   label: 'Members'   },
    { value: 'value',     label: '₹ Value'   },
    { value: 'health',    label: 'Health'    },
  ]

  const KPIS = [
    { label: 'Total Tenants',       value: tenants.length,              sub: `${activeComms} active`,              icon: Building2,     iconBg: 'bg-navy/8',     iconColor: 'text-navy'    },
    { label: 'Active Communities',  value: activeComms,                 sub: `${tenants.length - activeComms} inactive`, icon: Zap,       iconBg: 'bg-teal/10',    iconColor: 'text-teal'    },
    { label: 'Total Members',       value: totalMembers.toLocaleString('en-IN'), sub: 'Across all communities',    icon: Users,         iconBg: 'bg-success/10', iconColor: 'text-success' },
    { label: 'Referrals This Month',value: totalReferrals.toLocaleString('en-IN'), sub: 'Logged across platform', icon: TrendingUp,    iconBg: 'bg-teal/10',    iconColor: 'text-teal'    },
    { label: '₹ Business Value',    value: fmtINR(totalValue),          sub: 'Total this month',                   icon: IndianRupee,   iconBg: 'bg-amber/10',   iconColor: 'text-amber-dark' },
    { label: 'Meetings Held',       value: totalMeetings,               sub: 'This month',                        icon: Calendar,      iconBg: 'bg-purple-50',  iconColor: 'text-purple-600' },
  ]

  const RADIAN = Math.PI / 180
  const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{Math.round(percent * 100)}%</text>
  }

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="Member Growth" sub="12 months across all tenants" action={null} >
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MEMBER_GROWTH_12} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#028090" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#028090" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={38} tickFormatter={v => v >= 1000 ? `${v/1000}K` : v} />
              <ReTooltip content={<ChartTooltip fmt={v => `${v?.toLocaleString('en-IN')} members`} />} />
              <Area type="monotone" dataKey="members" stroke="#028090" strokeWidth={2} fill="url(#mgGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Community Type Distribution" sub="By number of tenants" action={null}>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="count" labelLine={false} label={pieLabel}>
                {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {typeData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-secondary">{d.name}</span>
                </div>
                <span className="font-semibold text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Referrals bar chart */}
      <Section title="Weekly Referrals" sub="Last 8 weeks across all communities">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={WEEKLY_REFERRALS} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={32} />
            <ReTooltip content={<ChartTooltip fmt={v => `${v} referrals`} />} />
            <Bar dataKey="referrals" fill="#028090" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Top 5 table */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-primary">Top Communities</p>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS.map(o => ({ value: o.value, label: `By ${o.label}` }))}
            size="sm"
            className="w-[130px]"
          />
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th w-8">Rank</th>
              <th className="th">Community</th>
              <th className="th text-right">Members</th>
              <th className="th text-right">Referrals</th>
              <th className="th text-right">₹ Value</th>
              <th className="th text-right">Health</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((t, i) => (
              <tr key={t.id} className="tr">
                <td className="td">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i === 0 ? 'bg-amber/20 text-amber-dark' : 'bg-surface text-secondary'}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="td">
                  <p className="text-sm font-semibold text-primary">{t.name}</p>
                  <p className="text-xs text-secondary">{COMMUNITY_TYPES.find(ct => ct.value === t.type)?.label}</p>
                </td>
                <td className="td text-right text-sm font-medium text-primary">{t.memberCount}</td>
                <td className="td text-right text-sm font-semibold text-teal">{t.referralsThisMonth}</td>
                <td className="td text-right text-sm text-primary">{t.businessValue}</td>
                <td className="td text-right">
                  <span className={`text-sm font-bold ${t.healthScore >= 80 ? 'text-success' : t.healthScore >= 60 ? 'text-amber-dark' : 'text-danger'}`}>
                    {t.healthScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab 2 — Tenant Reports ─────────────────────────────────────────────────────

function genTenantTrend(base, months = 6) {
  return Array.from({ length: months }, (_, i) => {
    const factor = 0.7 + (i / months) * 0.3 + (Math.sin(i * 1.5) * 0.05)
    return { month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i] + ' 24', value: Math.round(base * factor) }
  })
}

function TenantReportsTab() {
  const [tenantId, setTenantId] = useState(tenants[0].id)
  const tenant = tenants.find(t => t.id === tenantId) ?? tenants[0]

  const memberTrend = useMemo(() => genTenantTrend(tenant.memberCount), [tenantId])
  const referralTrend = useMemo(() => genTenantTrend(tenant.referralsThisMonth, 6).map(d => ({ ...d, value: Math.round(d.value * 0.25) })), [tenantId])
  const meetingTrend  = useMemo(() => genTenantTrend(tenant.meetingsHeld, 6).map(d => ({ ...d, value: Math.round(d.value * 0.9) })), [tenantId])

  const KPIS = [
    { label: 'Members',         value: tenant.memberCount,                icon: Users,       iconBg: 'bg-teal/10',    iconColor: 'text-teal'    },
    { label: 'Active Members',  value: tenant.activeMembers,              icon: Activity,    iconBg: 'bg-success/10', iconColor: 'text-success' },
    { label: 'Referrals / mo',  value: tenant.referralsThisMonth,         icon: TrendingUp,  iconBg: 'bg-navy/8',     iconColor: 'text-navy'    },
    { label: 'Health Score',    value: `${tenant.healthScore}/100`,       icon: Award,       iconBg: tenant.healthScore >= 80 ? 'bg-success/10' : tenant.healthScore >= 60 ? 'bg-amber/10' : 'bg-danger/10', iconColor: tenant.healthScore >= 80 ? 'text-success' : tenant.healthScore >= 60 ? 'text-amber-dark' : 'text-danger' },
  ]

  const enabledModules = tenant.enabledModules.length > 0 ? tenant.enabledModules : ['—']
  const allModules = ['meetings', 'attendance', 'referrals', 'one_to_one', 'events', 'communication', 'activity_feed']

  return (
    <div className="space-y-5">
      {/* Selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Select
            label="Community"
            value={tenantId}
            onChange={setTenantId}
            options={tenants.map(t => ({ value: t.id, label: t.name }))}
            className="w-[220px]"
          />
          <span className={`badge ${tenant.status === 'active' ? 'badge-success' : tenant.status === 'suspended' ? 'badge-danger' : 'badge-warning'} text-[10px]`}>
            {tenant.status.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={() => toast.success('PDF report generation coming soon')}
          className="btn-ghost btn btn-sm"
        >
          <Download size={13} /> Download Tenant Report PDF
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="Member Growth" sub="6 months">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={memberTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#028090" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#028090" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={30} />
              <ReTooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" name="members" stroke="#028090" strokeWidth={2} fill="url(#tGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Referrals / Week" sub="6 months">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={referralTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
              <ReTooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="referrals" fill="#1B3A6B" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Meetings Held" sub="6 months">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={meetingTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
              <ReTooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" name="meetings" stroke="#C17900" strokeWidth={2} dot={{ r: 3, fill: '#C17900' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Module usage */}
      <Section title="Module Usage" sub={`${enabledModules.filter(m => m !== '—').length} of ${allModules.length} modules enabled`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {allModules.map(mod => {
            const active = tenant.enabledModules.includes(mod)
            return (
              <div
                key={mod}
                className={`flex items-center gap-2 px-3 py-2 rounded-button border text-xs font-medium
                  ${active ? 'bg-teal/8 border-teal/20 text-teal' : 'bg-surface border-border text-secondary'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-teal' : 'bg-border'}`} />
                <span className="capitalize">{mod.replace(/_/g, ' ')}</span>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

// ── Tab 3 — Engagement ────────────────────────────────────────────────────────

function EngagementTab() {
  const totalMembers  = tenants.reduce((s, t) => s + t.memberCount, 0)
  const activeMembers = tenants.reduce((s, t) => s + t.activeMembers, 0)
  const atRisk        = tenants.reduce((s, t) => s + Math.max(0, t.memberCount - t.activeMembers), 0)
  const activationPct = Math.round((activeMembers / totalMembers) * 100)
  const avgDAU        = Math.round(DAU_30.reduce((s, d) => s + d.dau, 0) / DAU_30.length)

  const engColors = ['#BF360C', '#E65100', '#C17900', '#028090', '#2E7D32']

  const KPIS = [
    { label: 'Activation Rate',   value: `${activationPct}%`,       sub: `${activeMembers.toLocaleString()} of ${totalMembers.toLocaleString()} members logged in`, icon: Zap,           iconBg: 'bg-teal/10',    iconColor: 'text-teal'    },
    { label: 'Avg Daily Active',  value: avgDAU.toLocaleString(),    sub: 'Users per day (last 30 days)',                                                          icon: Activity,      iconBg: 'bg-success/10', iconColor: 'text-success' },
    { label: 'At-risk Members',   value: atRisk.toLocaleString(),    sub: 'Not active in 30+ days',                                                               icon: AlertTriangle, iconBg: 'bg-danger/10',  iconColor: 'text-danger'  },
  ]

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KPIS.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* DAU line chart */}
      <Section title="Daily Active Users" sub="Last 30 days">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={DAU_30} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#028090" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#028090" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={36} domain={[200, 450]} />
            <ReTooltip content={<ChartTooltip fmt={v => `${v} users`} />} />
            <Line type="monotone" dataKey="dau" name="DAU" stroke="#028090" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      {/* Engagement distribution + Module heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Engagement Score Distribution" sub="All members across platform">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ENGAGEMENT_DIST} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={32} />
              <ReTooltip content={<ChartTooltip fmt={v => `${v} members`} />} />
              <Bar dataKey="count" name="members" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {ENGAGEMENT_DIST.map((entry, i) => <Cell key={i} fill={engColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 flex-wrap pt-1">
            {ENGAGEMENT_DIST.map((d, i) => (
              <div key={d.range} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-sm" style={{ background: engColors[i] }} />
                <span className="text-secondary">{d.label}</span>
                <span className="font-semibold text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Module Usage Heatmap" sub="Usage intensity by community type">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ minWidth: 380 }}>
              <thead>
                <tr>
                  <th className="text-left text-secondary font-medium py-1 pr-3 w-28">Module</th>
                  {HEATMAP_COLS.map(c => (
                    <th key={c.key} className="text-center font-medium text-secondary py-1 px-1">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULE_HEATMAP.map(row => (
                  <tr key={row.module}>
                    <td className="py-1 pr-3 text-xs text-primary font-medium whitespace-nowrap">{row.module}</td>
                    {HEATMAP_COLS.map(c => {
                      const val = row[c.key]
                      const style = heatColor(val)
                      return (
                        <td key={c.key} className="py-1 px-1 text-center">
                          <div
                            className="rounded text-[10px] font-semibold w-full py-1"
                            style={{ background: style.bg, color: style.color, minWidth: 36 }}
                          >
                            {val}%
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border">
            {[{ bg: '#ECEFF1', color: '#78909C', label: '< 35%' }, { bg: '#E0F7FA', color: '#028090', label: '35–59%' }, { bg: '#B2EBF2', color: '#005F6A', label: '60–79%' }, { bg: '#028090', color: 'white', label: '80%+' }].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-4 h-3 rounded" style={{ background: s.bg, border: `1px solid ${s.bg === 'white' ? '#E5E7EB' : s.bg}` }} />
                <span className="text-secondary">{s.label}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

// ── Tab 4 — Revenue ───────────────────────────────────────────────────────────

function RevenueTab() {
  const mrr    = mrrHistory[mrrHistory.length - 1].mrr
  const arr    = mrr * 12
  const paidInvoices  = invoices.filter(i => i.status === 'paid')
  const totalInvoices = invoices.length
  const paymentRate   = Math.round((paidInvoices.length / totalInvoices) * 100)
  const churned       = tenants.filter(t => t.status === 'suspended').length

  // Revenue by community type
  const typeRevMap = {}
  tenants.filter(t => t.status === 'active').forEach(t => {
    const label = COMMUNITY_TYPES.find(ct => ct.value === t.type)?.label ?? t.type
    typeRevMap[label] = (typeRevMap[label] ?? 0) + t.monthlyAmount
  })
  const typeRevData = Object.entries(typeRevMap).map(([name, value], i) => ({
    name, value,
    color: ['#028090', '#1B3A6B', '#C17900', '#2E7D32', '#6A1B9A', '#E65100'][i],
  }))

  const RADIAN = Math.PI / 180
  const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{Math.round(percent * 100)}%</text>
  }

  const KPIS = [
    { label: 'MRR',         value: `₹${mrr.toLocaleString('en-IN')}`,  sub: 'Monthly recurring revenue',     icon: IndianRupee, iconBg: 'bg-teal/10',    iconColor: 'text-teal'       },
    { label: 'ARR',         value: `₹${(arr / 100000).toFixed(1)}L`,   sub: 'Annual run rate',               icon: TrendingUp,  iconBg: 'bg-navy/8',     iconColor: 'text-navy'       },
    { label: 'Payment Rate',value: `${paymentRate}%`,                   sub: 'Invoices paid on time',         icon: Award,       iconBg: 'bg-success/10', iconColor: 'text-success'    },
    { label: 'Churned',     value: String(churned),                     sub: 'Suspended tenants',             icon: AlertTriangle, iconBg: churned > 0 ? 'bg-danger/10' : 'bg-success/10', iconColor: churned > 0 ? 'text-danger' : 'text-success' },
  ]

  return (
    <div className="space-y-5">
      {/* Header action */}
      <div className="flex justify-end">
        <button
          onClick={() => toast.success('PDF revenue report coming soon')}
          className="btn-ghost btn btn-sm"
        >
          <Download size={13} /> Download Revenue Report
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* MRR 12mo area chart */}
      <Section title="Monthly Recurring Revenue" sub="12-month trend">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MRR_12} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGrad12" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#028090" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#028090" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={46} tickFormatter={v => `₹${v / 1000}K`} />
            <ReTooltip content={<ChartTooltip fmt={v => `₹${v?.toLocaleString('en-IN')}`} />} />
            <Area type="monotone" dataKey="mrr" name="MRR" stroke="#028090" strokeWidth={2} fill="url(#mrrGrad12)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {/* Stacked bar + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="Revenue by Plan" sub="Monthly breakdown" action={null} >
          <div style={{ marginLeft: -8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REV_BY_PLAN_12.slice(-6)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={44} tickFormatter={v => `₹${v/1000}K`} />
                <ReTooltip content={<ChartTooltip fmt={v => `₹${v?.toLocaleString('en-IN')}`} />} />
                <Bar dataKey="starter"      name="Starter"       stackId="a" fill="#546E7A" />
                <Bar dataKey="professional" name="Professional"  stackId="a" fill="#028090" />
                <Bar dataKey="enterprise"   name="Enterprise"    stackId="a" fill="#1B3A6B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 pt-1">
            {[['#546E7A', 'Starter'], ['#028090', 'Professional'], ['#1B3A6B', 'Enterprise']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Revenue by Community Type" sub="Current month, active tenants">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={typeRevData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" labelLine={false} label={pieLabel}>
                {typeRevData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {typeRevData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-secondary">{d.name}</span>
                </div>
                <span className="font-semibold text-primary">₹{d.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Churn indicator */}
      {churned > 0 && (
        <div className="rounded-card border border-danger/20 bg-danger/5 p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-danger">{churned} suspended tenant{churned > 1 ? 's' : ''}</p>
            <p className="text-xs text-danger/70 mt-0.5">
              {tenants.filter(t => t.status === 'suspended').map(t => `${t.name} (${t.suspendedReason ?? 'suspended'})`).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',   label: 'Platform Overview' },
  { id: 'tenant',     label: 'Tenant Reports'    },
  { id: 'engagement', label: 'Engagement'        },
  { id: 'revenue',    label: 'Revenue'           },
]

const DATE_RANGES = [
  { value: '7d',  label: 'Last 7 days'  },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
]

export default function ReportsAnalyticsSection() {
  const loading  = useLoading(260)
  const [tab,       setTab]       = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  return (
    <div id="reports-analytics" className="p-3 space-y-6 scroll-mt-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-primary">Reports & Analytics</h2>
          <p className="text-secondary text-sm mt-0.5">Platform-wide insights and community performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={DATE_RANGES}
            className="w-[170px]"
          />
          <button
            onClick={() => toast.success('PDF export coming soon')}
            className="btn-ghost btn flex items-center gap-1.5"
          >
            <FileText size={14} /> Export All as PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${tab === t.id ? 'border-teal text-teal' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="space-y-5 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card p-4 h-24 bg-gray-50" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 card p-5 h-52 bg-gray-50" />
            <div className="card p-5 h-52 bg-gray-50" />
          </div>
        </div>
      ) : (
        <>
          {tab === 'overview'   && <PlatformOverviewTab />}
          {tab === 'tenant'     && <TenantReportsTab />}
          {tab === 'engagement' && <EngagementTab />}
          {tab === 'revenue'    && <RevenueTab />}
        </>
      )}
    </div>
  )
}
