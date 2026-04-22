import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Copy, Check, ExternalLink, MoreVertical, Pencil, Search,
  AlertTriangle, ChevronRight, UserPlus, GitBranch, Smartphone,
  Globe, CheckCircle, Palette, TrendingUp, Plus, Lock, Download,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { tenants } from '../../data/tenants'
import { ALL_MODULES } from '../../data/tenants'
import { plans } from '../../data/billing'
import { members } from '../../data/members'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonCard, SkeletonRow, SkeletonLine } from '../../components/Skeleton'
import Modal from '../../components/Modal'

// ── Helpers ────────────────────────────────────────────────────────────────────
function typeBadgeClass(type) {
  return {
    professional_networking: 'badge-teal',
    alumni: 'badge-navy',
    trade_association: 'badge-amber',
  }[type] || 'badge-gray'
}

function typeLabel(type) {
  return {
    professional_networking: 'Professional Networking',
    alumni: 'Alumni Association',
    trade_association: 'Trade Association',
    religious: 'Religious Community',
    corporate: 'Corporate Internal',
    flat: 'Flat Community',
  }[type] || type
}

function statusBadge(status) {
  return {
    active: ['Active', 'badge-success'],
    pending_setup: ['Pending Setup', 'badge-amber'],
    suspended: ['Suspended', 'badge-danger'],
  }[status] || [status, 'badge-gray']
}

function planLabel(plan) {
  return { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' }[plan] || plan
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysAgo(dateStr) {
  if (!dateStr) return null
  const ms = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(ms / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Health Gauge ───────────────────────────────────────────────────────────────
function HealthGauge({ score }) {
  const size = 88, sw = 8, r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const color = score >= 90 ? '#2E7D32' : score >= 70 ? '#E6A817' : '#BF360C'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#D0DCF0" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-primary">{score}</p>
        <p className="text-2xs text-secondary">/100</p>
      </div>
    </div>
  )
}

// ── Activity icon map ──────────────────────────────────────────────────────────
function ActivityIcon({ icon, color }) {
  const colorMap = {
    teal: 'bg-teal/10 text-teal',
    navy: 'bg-navy/10 text-navy',
    success: 'bg-success/10 text-success',
    amber: 'bg-amber/10 text-amber',
  }
  const Icon = {
    plus: Plus,
    'user-plus': UserPlus,
    'git-branch': GitBranch,
    smartphone: Smartphone,
    globe: Globe,
    'check-circle': CheckCircle,
    palette: Palette,
    'trending-up': TrendingUp,
  }[icon] || Plus
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.teal}`}>
      <Icon size={15} />
    </div>
  )
}

// ── Member activity dummy data ─────────────────────────────────────────────────
const ACTIVITY_LINE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  active: Math.floor(130 + Math.sin(i * 0.4) * 30 + Math.random() * 20),
}))

const REFERRAL_BAR_DATA = [
  { week: 'W1', count: 68 },
  { week: 'W2', count: 82 },
  { week: 'W3', count: 74 },
  { week: 'W4', count: 88 },
]

// ── Custom tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-card shadow-modal px-3 py-2 text-xs">
      <p className="text-secondary mb-0.5">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value}</p>
    </div>
  )
}

// ── Toggle component (interactive) ────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal/30
        ${enabled ? 'bg-success' : 'bg-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
        ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview'     },
  { id: 'members',    label: 'Members'      },
  { id: 'hierarchy',  label: 'Hierarchy'    },
  { id: 'modules',    label: 'Modules'      },
  { id: 'activity',   label: 'Activity Log' },
]

const ALWAYS_ON_MODULE_IDS = [
  'member_management', 'dashboard_analytics', 'communication_hub',
  'meeting_management', 'attendance_management',
]

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const loading = useLoading(800)

  const [activeTab, setActiveTab] = useState('overview')
  const [tenantData, setTenantData] = useState(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [moduleOverrides, setModuleOverrides] = useState(null) // null = not yet overridden (uses tenant defaults)
  const [changePlanModal, setChangePlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const moreRef = useRef(null)

  useEffect(() => {
    const t = tenants.find(x => x.id === id)
    setTenantData(t || null)
  }, [id])

  // Close more dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpen])

  const handleCopy = () => {
    if (!tenantData) return
    navigator.clipboard.writeText(tenantData.domain)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleConfirmPlanChange = () => {
    const plan = plans.find(p => p.id === selectedPlan)
    if (!plan) return
    setModuleOverrides(plan.features)
    setTenantData(d => ({ ...d, plan: plan.id, monthlyAmount: plan.price }))
    toast.success(`Plan changed to ${plan.name} — modules updated`)
    setChangePlanModal(false)
  }

  const handleSuspend = () => {
    setTenantData(d => ({ ...d, status: 'suspended', suspendedReason: suspendReason }))
    toast.error(`${tenantData.name} has been suspended`)
    setSuspendOpen(false)
    setSuspendReason('')
    setMoreOpen(false)
  }

  const handleReactivate = () => {
    setTenantData(d => ({ ...d, status: 'active', suspendedReason: undefined }))
    toast.success(`${tenantData.name} has been reactivated`)
    setReactivateOpen(false)
    setMoreOpen(false)
  }

  const handleDelete = () => {
    toast.success(`${tenantData.name} deleted`)
    setDeleteOpen(false)
    navigate('/admin/tenants')
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-3 space-y-5">
        <div className="flex items-center gap-1.5 text-sm">
          <SkeletonLine w="w-16" h="h-4" />
          <SkeletonLine w="w-32" h="h-4" />
        </div>
        <SkeletonCard />
        <div className="flex gap-4 border-b border-border pb-0">
          {TABS.map(t => <SkeletonLine key={t.id} w="w-16" h="h-6" />)}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // Not found
  if (!tenantData) {
    return (
      <div className="card">
        <div className="card-body py-16 flex flex-col items-center gap-4">
          <AlertTriangle size={40} className="text-secondary" />
          <p className="text-lg font-semibold text-primary">Tenant not found</p>
          <p className="text-sm text-secondary">No tenant exists with id: {id}</p>
          <Link to="/admin/tenants" className="btn btn-outline btn-sm">
            ← Back to Tenants
          </Link>
        </div>
      </div>
    )
  }

  const [statusLabel, statusCls] = statusBadge(tenantData.status)

  const ACTIVITY_ITEMS = [
    { action: 'Tenant provisioned', date: '15 Feb 2024', actor: 'Jatin Dudhat (PA)', icon: 'plus', color: 'teal' },
    { action: `CSA invited: ${tenantData.csaName}`, date: '15 Feb 2024', actor: 'Jatin Dudhat (PA)', icon: 'user-plus', color: 'teal' },
    { action: 'Hierarchy configured', date: '22 Feb 2024', actor: `${tenantData.csaName} (CSA)`, icon: 'git-branch', color: 'navy' },
    { action: 'App build triggered', date: '25 Feb 2024', actor: 'Jatin Dudhat (PA)', icon: 'smartphone', color: 'navy' },
    { action: `Domain provisioned: ${tenantData.domain}`, date: '01 Mar 2024', actor: 'System', icon: 'globe', color: 'success' },
    { action: 'App live on App Store & Play Store', date: tenantData.goLiveDate ? formatDate(tenantData.goLiveDate) : 'Pending', actor: 'System', icon: 'check-circle', color: 'success' },
    { action: 'Branding updated', date: '10 Mar 2024', actor: `${tenantData.csaName} (CSA)`, icon: 'palette', color: 'teal' },
    { action: `Plan: ${planLabel(tenantData.plan)} active`, date: '15 Apr 2024', actor: 'Jatin Dudhat (PA)', icon: 'trending-up', color: 'success' },
  ]

  const filteredMembers = members.filter(m =>
    !memberSearch || m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.chapter?.toLowerCase().includes(memberSearch.toLowerCase())
  )

  return (
    <div className="space-y-5 p-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-secondary">
        <Link to="/admin/tenants" className="hover:text-teal transition-colors">Tenants</Link>
        <ChevronRight size={14} />
        <span className="text-primary font-medium">{tenantData.name}</span>
      </div>

      {/* Hero card */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Left */}
            <div className="space-y-3 flex-1 min-w-0">
              <h1 className="text-[28px] font-bold text-navy leading-tight">{tenantData.name}</h1>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${typeBadgeClass(tenantData.type)}`}>{typeLabel(tenantData.type)}</span>
                <span className={`badge ${statusCls}`}>{statusLabel}</span>
              </div>

              {/* Domain row */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-secondary">{tenantData.domain}</span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-secondary hover:text-teal transition-colors"
                  title="Copy domain"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
                <a
                  href={`https://${tenantData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-secondary hover:text-teal transition-colors"
                  title="Open domain"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Go live date */}
              <p className="text-xs text-secondary">
                {tenantData.goLiveDate
                  ? <>Go live: <span className="text-primary font-medium">{formatDate(tenantData.goLiveDate)}</span> · {daysAgo(tenantData.goLiveDate)}</>
                  : 'Not yet live'}
              </p>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <HealthGauge score={tenantData.healthScore} />
                <p className="text-2xs text-secondary">Health Score</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-outline btn-sm flex items-center gap-1.5"
                  onClick={() => navigate(`/admin/tenants/${id}/edit`)}
                >
                  <Pencil size={13} /> Edit Tenant
                </button>

                <div className="relative" ref={moreRef}>
                  <button
                    className="btn btn-outline btn-sm flex items-center gap-1.5 w-full"
                    onClick={() => setMoreOpen(v => !v)}
                  >
                    <MoreVertical size={13} /> More actions
                  </button>

                  {moreOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-card shadow-modal z-20 py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => { navigate(`/admin/tenants/${id}/edit`); setMoreOpen(false) }}
                      >
                        <Pencil size={13} /> Edit Tenant
                      </button>
                      {tenantData.status !== 'suspended' ? (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                          onClick={() => { setSuspendOpen(true); setMoreOpen(false) }}
                        >
                          Suspend Tenant
                        </button>
                      ) : (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                          onClick={() => { setReactivateOpen(true); setMoreOpen(false) }}
                        >
                          Reactivate Tenant
                        </button>
                      )}
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                        onClick={() => { window.open('/csa/dashboard', '_blank'); setMoreOpen(false) }}
                      >
                        View as CSA
                      </button>
                      <div className="border-t border-border my-1" />
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                        onClick={() => { setDeleteOpen(true); setDeleteStep(1); setDeleteConfirm(''); setMoreOpen(false) }}
                      >
                        Delete Tenant
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 pb-3 pt-1 text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'text-teal border-b-2 border-teal'
                  : 'text-secondary hover:text-primary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Two-column layout: left 40% / right 60% */}
          <div className="grid grid-cols-5 gap-5">

            {/* ── Left column (2/5) ── */}
            <div className="col-span-2 space-y-4">

              {/* Health gauge + factor breakdown */}
              <div className="card">
                <div className="card-body space-y-4">
                  <div className="flex items-center gap-4">
                    <HealthGauge score={tenantData.healthScore} />
                    <div>
                      <p className="text-sm font-semibold text-primary">Health Score</p>
                      <p className="text-xs text-secondary mt-0.5">
                        {tenantData.healthScore >= 90 ? 'Excellent' : tenantData.healthScore >= 70 ? 'Good' : 'Needs Attention'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Engagement',   score: Math.min(100, Math.round(tenantData.healthScore * 1.05)) },
                      { label: 'Retention',    score: Math.max(50,  Math.round(tenantData.healthScore * 0.92)) },
                      { label: 'Billing',      score: 100 },
                      { label: 'App Activity', score: Math.max(40,  Math.round(tenantData.healthScore * 0.88)) },
                    ].map(f => (
                      <div key={f.label}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-secondary">{f.label}</span>
                          <span className="text-xs font-medium text-primary">{f.score}</span>
                        </div>
                        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${f.score >= 80 ? 'bg-success' : f.score >= 60 ? 'bg-amber' : 'bg-danger'}`}
                            style={{ width: `${f.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plan & Billing card */}
              <div className="card">
                <div className="card-body space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">Plan & Billing</h3>
                    <button
                      className="btn btn-outline btn-xs text-xs"
                      onClick={() => { setSelectedPlan(tenantData.plan); setChangePlanModal(true) }}
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-navy">{planLabel(tenantData.plan)}</span>
                    <span className="text-teal text-sm font-semibold">₹{tenantData.monthlyAmount?.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Next billing</span>
                      <span className="text-primary font-medium">15 Jul 2024</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Status</span>
                      <span className="text-success font-medium flex items-center gap-1"><Check size={11} /> Paid</span>
                    </div>
                  </div>
                  <Link to="/admin/billing" className="text-xs font-medium text-teal hover:underline">
                    View invoices →
                  </Link>
                </div>
              </div>

              {/* CSA card */}
              <div className="card">
                <div className="card-body space-y-3">
                  <h3 className="text-sm font-semibold text-primary">Community Super Admin</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{initials(tenantData.csaName)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{tenantData.csaName}</p>
                      <p className="text-xs text-secondary">{tenantData.csaEmail}</p>
                      <p className="text-xs text-secondary">{tenantData.csaPhone}</p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">Last login: Today, 9:42 AM</p>
                </div>
              </div>
            </div>

            {/* ── Right column (3/5) ── */}
            <div className="col-span-3 space-y-4">

              {/* Onboarding progress — always visible */}
              <div className="card">
                <div className="card-body space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">Onboarding Progress</h3>
                    <span className="text-xs text-secondary">
                      {[!!tenantData.logo, !!tenantData.subdomain, (tenantData.hierarchyLevels || 0) > 0, tenantData.appStatus === 'live' || tenantData.appStatus === 'building', !!tenantData.csaLastLogin].filter(Boolean).length} of 5 complete
                    </span>
                  </div>
                  {[
                    { label: 'Branding configured',  done: !!tenantData.logo,                                                    to: `/admin/branding/${id}` },
                    { label: 'Domain provisioned',    done: !!tenantData.subdomain,                                               to: '/admin/domains' },
                    { label: 'Hierarchy configured',  done: (tenantData.hierarchyLevels || 0) > 0,                               to: '/admin/hierarchy' },
                    { label: 'App build triggered',   done: tenantData.appStatus === 'live' || tenantData.appStatus === 'building', to: '/admin/app-deployment' },
                    { label: 'CSA first login',       done: !!tenantData.csaLastLogin,                                           to: null },
                  ].map(step => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-success/15' : 'bg-border'}`}>
                        {step.done ? <Check size={10} className="text-success" /> : <div className="w-2 h-2 rounded-full bg-border-dark" />}
                      </div>
                      <span className={`text-xs flex-1 ${step.done ? 'text-secondary line-through' : 'text-primary'}`}>{step.label}</span>
                      {!step.done && step.to && (
                        <Link to={step.to} className="text-xs text-teal hover:underline font-medium">Go →</Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* App status */}
              <div className="card">
                <div className="card-body space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">App Status</h3>
                    {tenantData.appStatus === 'building' && <span className="badge badge-amber">Build in Progress</span>}
                    {tenantData.appStatus === 'live'     && <span className="badge badge-success">Live</span>}
                    {tenantData.appStatus === 'suspended' && <span className="badge badge-danger">Suspended</span>}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">iOS</span>
                      {tenantData.iosLink
                        ? <a href={tenantData.iosLink} target="_blank" rel="noopener noreferrer" className="text-teal text-xs hover:underline flex items-center gap-1">App Store <ExternalLink size={11} /></a>
                        : <span className="text-secondary text-xs">Not available</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Android</span>
                      {tenantData.androidLink
                        ? <a href={tenantData.androidLink} target="_blank" rel="noopener noreferrer" className="text-teal text-xs hover:underline flex items-center gap-1">Play Store <ExternalLink size={11} /></a>
                        : <span className="text-secondary text-xs">Not available</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Build Version</span>
                      <span className="text-primary font-mono text-xs">{tenantData.buildVersion || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Last Build</span>
                      <span className="text-primary text-xs">{tenantData.lastBuild ? formatDate(tenantData.lastBuild) : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Domain card */}
              <div className="card">
                <div className="card-body space-y-3">
                  <h3 className="text-sm font-semibold text-primary">Domain</h3>
                  <div className="flex items-center gap-2 font-mono text-sm bg-surface border border-border rounded-button px-3 py-2">
                    <Globe size={14} className="text-secondary flex-shrink-0" />
                    <span className="flex-1 text-primary truncate">{tenantData.domain}</span>
                    <button onClick={handleCopy} className="p-1 text-secondary hover:text-teal transition-colors" title="Copy">
                      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                    <a href={`https://${tenantData.domain}`} target="_blank" rel="noopener noreferrer" className="p-1 text-secondary hover:text-teal transition-colors" title="Open">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <p className="text-xs text-secondary">
                    {tenantData.goLiveDate
                      ? <>Go live: <span className="text-primary font-medium">{formatDate(tenantData.goLiveDate)}</span> · {daysAgo(tenantData.goLiveDate)}</>
                      : 'Not yet live'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', value: tenantData.memberCount, sub: `${tenantData.activeMembers} active (${Math.round(tenantData.activeMembers / tenantData.memberCount * 100)}%)` },
              { label: 'Referrals This Month', value: tenantData.referralsThisMonth, sub: null },
              { label: 'Business Value', value: tenantData.businessValue, sub: null },
              { label: 'Meetings Held', value: tenantData.meetingsHeld, sub: null },
            ].map(card => (
              <div key={card.label} className="card">
                <div className="card-body">
                  <p className="text-xs text-secondary font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-navy mt-1">{card.value}</p>
                  {card.sub && <p className="text-xs text-secondary mt-0.5">{card.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <div className="card-body space-y-3">
                <h3 className="text-sm font-semibold text-primary">Member Activity (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={ACTIVITY_LINE_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#546E7A' }} tickFormatter={(v, i) => i % 5 === 0 ? v : ''} />
                    <YAxis tick={{ fontSize: 10, fill: '#546E7A' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="active" stroke="#028090" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-body space-y-3">
                <h3 className="text-sm font-semibold text-primary">Referrals by Week</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={REFERRAL_BAR_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#546E7A' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#546E7A' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#028090" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MEMBERS ── */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search members..."
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="th text-left">Name</th>
                    <th className="th text-left">Chapter</th>
                    <th className="th text-left">Status</th>
                    <th className="th text-left">Score</th>
                    <th className="th text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="tr">
                      <td className="td px-4">
                        <div>
                          <p className="font-semibold text-primary text-sm">{m.name}</p>
                          <p className="text-xs text-secondary">{m.business}</p>
                        </div>
                      </td>
                      <td className="td px-4 text-sm text-secondary">{m.chapter}</td>
                      <td className="td px-4">
                        <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {m.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="td px-4 text-sm text-primary">{m.attendance}</td>
                      <td className="td px-4 text-xs text-secondary">{formatDate(m.joinDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: HIERARCHY ── */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Nodes', value: tenantData.totalNodes },
              { label: 'Assigned', value: Math.round(tenantData.totalNodes * 0.8) },
              { label: 'Unassigned', value: Math.round(tenantData.totalNodes * 0.2) },
            ].map(c => (
              <div key={c.label} className="card">
                <div className="card-body">
                  <p className="text-xs text-secondary">{c.label}</p>
                  <p className="text-2xl font-bold text-navy mt-1">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary">Hierarchy Structure</h3>
                <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface px-3 py-1.5 rounded-button border border-border">
                  Viewing in read-only mode
                </div>
              </div>

              {/* Visual tree */}
              <div className="space-y-3">
                {Array.from({ length: tenantData.hierarchyLevels }, (_, i) => {
                  const levelNames = ['Zone', 'Chapter', 'Group', 'Sub-Group']
                  const colors = ['bg-teal/10 text-teal border-teal/20', 'bg-navy/10 text-navy border-navy/20', 'bg-amber/10 text-amber border-amber/20', 'bg-secondary/10 text-secondary border-secondary/20']
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 text-xs text-secondary font-medium text-right flex-shrink-0">L{i + 1}</div>
                      <div className={`flex flex-wrap gap-2`}>
                        {Array.from({ length: Math.max(1, Math.floor(tenantData.totalNodes / tenantData.hierarchyLevels)) }, (_, j) => (
                          <span key={j} className={`badge border ${colors[i % colors.length]}`}>
                            {levelNames[i] || `Level ${i + 1}`} {j + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate(`/admin/hierarchy`)}
                >
                  Go to Hierarchy Builder →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MODULES ── */}
      {activeTab === 'modules' && (() => {
        // Effective module set: PA overrides take precedence over CSA settings
        const effectiveModules = moduleOverrides ?? (tenantData.enabledModules ?? [])
        const hasOverride = moduleOverrides !== null

        const handleToggle = (modId, newVal) => {
          const base = moduleOverrides ?? (tenantData.enabledModules ?? [])
          const next = newVal ? [...new Set([...base, modId])] : base.filter(m => m !== modId)
          setModuleOverrides(next)
          toast.success(`${ALL_MODULES.find(m => m.id === modId)?.label} ${newVal ? 'enabled' : 'disabled'} ✓`)
        }

        const handleResetOverrides = () => {
          setModuleOverrides(null)
          toast('Module overrides cleared — reverted to CSA settings', { icon: '↩️' })
        }

        return (
          <div className="space-y-4">
            <p className="text-xs text-secondary">Active for this tenant — overrides community defaults</p>
            {/* Info banner */}
            <div className={`flex items-start justify-between gap-3 p-4 rounded-card border
              ${hasOverride
                ? 'bg-amber/5 border-amber/25'
                : 'bg-surface border-border'}`}>
              <div>
                <p className="text-sm font-medium text-primary">
                  {hasOverride ? 'Platform Admin overrides active' : 'Platform Admin module control'}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {hasOverride
                    ? 'Your overrides take precedence over CSA settings. Changes apply immediately.'
                    : 'Toggle modules to override CSA settings for this tenant. Changes apply immediately.'}
                </p>
              </div>
              {hasOverride && (
                <button
                  onClick={handleResetOverrides}
                  className="btn-ghost btn btn-sm flex-shrink-0 border border-amber/30 text-amber-dark hover:bg-amber/8 text-xs"
                >
                  Reset to CSA Settings
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_MODULES.map(mod => {
                const enabled = effectiveModules.includes(mod.id)
                const csaEnabled = tenantData.enabledModules?.includes(mod.id) ?? false
                const isOverridden = hasOverride && enabled !== csaEnabled

                return (
                  <div key={mod.id} className={`bg-white border rounded-card p-4 flex items-center justify-between transition-colors
                    ${isOverridden ? 'border-amber/40 bg-amber/3' : 'border-border'}`}>
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-medium text-primary leading-tight">{mod.label}</p>
                      {isOverridden && (
                        <span className="text-[10px] text-amber-dark font-medium">PA override</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Toggle enabled={enabled} onChange={(val) => handleToggle(mod.id, val)} />
                      <span className={`text-2xs font-medium ${enabled ? 'text-success' : 'text-secondary'}`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}


      {/* ── TAB: ACTIVITY ── */}
      {activeTab === 'activity' && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-semibold text-primary mb-5">Activity Timeline</h3>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
              <div className="space-y-5">
                {ACTIVITY_ITEMS.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <ActivityIcon icon={item.icon} color={item.color} />
                    <div className="flex-1 pb-1">
                      <p className="text-sm font-semibold text-primary">{item.action}</p>
                      <p className="text-xs text-secondary mt-0.5">
                        {item.date} · {item.actor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}

      {/* Change Plan */}
      <Modal
        open={changePlanModal}
        onClose={() => setChangePlanModal(false)}
        title="Change Subscription Plan"
      >
        <div className="p-6 space-y-5">
          {/* Plan cards */}
          <div className="grid grid-cols-3 gap-3">
            {plans.map(plan => {
              const isSelected = selectedPlan === plan.id
              const isCurrent = tenantData.plan === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`text-left p-4 rounded-card border-2 transition-colors ${
                    isSelected
                      ? 'border-teal bg-teal/5'
                      : 'border-border bg-white hover:border-teal/40'
                  }`}
                >
                  <p className="text-sm font-semibold text-primary">{plan.name}</p>
                  <p className="text-xs text-teal font-medium mt-0.5">
                    ₹{plan.price.toLocaleString('en-IN')}/mo
                  </p>
                  {isCurrent && (
                    <span className="mt-1.5 inline-block text-[10px] font-medium bg-navy/10 text-navy px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Module diff preview */}
          {selectedPlan && (() => {
            const currentModules = moduleOverrides ?? (tenantData.enabledModules ?? [])
            const newPlanModules = plans.find(p => p.id === selectedPlan)?.features ?? []
            const toAdd    = newPlanModules.filter(m => !currentModules.includes(m))
            const toRemove = currentModules.filter(m => !newPlanModules.includes(m))
            const unchanged = newPlanModules.filter(m => currentModules.includes(m))
            const hasChanges = toAdd.length > 0 || toRemove.length > 0

            return (
              <div className="border border-border rounded-card overflow-hidden">
                <div className="px-4 py-2.5 bg-surface border-b border-border">
                  <p className="text-xs font-semibold text-primary">Module Changes Preview</p>
                </div>
                {!hasChanges ? (
                  <p className="text-xs text-secondary px-4 py-3">
                    No module changes — same as current configuration.
                  </p>
                ) : (
                  <div className="p-4 space-y-3">
                    {toAdd.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-success uppercase tracking-wide mb-1.5">
                          Will be enabled ({toAdd.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {toAdd.map(id => (
                            <span key={id} className="text-xs bg-success/10 text-success font-medium px-2 py-0.5 rounded-full">
                              + {ALL_MODULES.find(m => m.id === id)?.label ?? id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {toRemove.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-danger uppercase tracking-wide mb-1.5">
                          Will be disabled ({toRemove.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {toRemove.map(id => (
                            <span key={id} className="text-xs bg-danger/10 text-danger font-medium px-2 py-0.5 rounded-full">
                              − {ALL_MODULES.find(m => m.id === id)?.label ?? id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {unchanged.length > 0 && (
                      <p className="text-[10px] text-secondary">{unchanged.length} module(s) unchanged</p>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button className="btn btn-outline" onClick={() => setChangePlanModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmPlanChange}
              disabled={!selectedPlan || selectedPlan === tenantData.plan}
            >
              Confirm Plan Change
            </button>
          </div>
        </div>
      </Modal>

      {/* Suspend */}
      <Modal
        open={suspendOpen}
        onClose={() => { setSuspendOpen(false); setSuspendReason('') }}
        title={`Suspend ${tenantData.name}?`}
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-secondary">
            This will immediately block access for <strong className="text-primary">{tenantData.memberCount}</strong> members and the CSA.
          </p>
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Suspension Reason <span className="text-danger">*</span>
            </label>
            <textarea
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="Enter reason for suspension..."
              className="input h-20 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="btn btn-outline" onClick={() => { setSuspendOpen(false); setSuspendReason('') }}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleSuspend}
              disabled={!suspendReason.trim()}
            >
              Suspend Tenant
            </button>
          </div>
        </div>
      </Modal>

      {/* Reactivate */}
      <Modal
        open={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        title={`Reactivate ${tenantData.name}?`}
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-secondary">
            Members will regain full access immediately.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="btn btn-outline" onClick={() => setReactivateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleReactivate}>
              Reactivate
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteStep(1); setDeleteConfirm('') }}
        title={deleteStep === 1 ? `Delete ${tenantData.name}?` : 'Confirm deletion'}
      >
        <div className="p-6 space-y-4">
          {deleteStep === 1 ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-card">
                <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary">
                  Are you sure you want to delete <strong className="text-primary">{tenantData.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="btn btn-outline" onClick={() => { setDeleteOpen(false); setDeleteStep(1) }}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => setDeleteStep(2)}>
                  Yes, Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-secondary">Type the community name to confirm:</p>
              <p className="text-xs font-semibold text-primary bg-surface border border-border rounded-button px-3 py-2">
                {tenantData.name}
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Type community name..."
                className="input"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="btn btn-outline" onClick={() => { setDeleteOpen(false); setDeleteStep(1); setDeleteConfirm('') }}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteConfirm !== tenantData.name}
                >
                  Delete Forever
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
