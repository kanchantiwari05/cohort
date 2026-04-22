import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Search, Plus, Eye, Pencil, MoreVertical,
  Copy, Check, ChevronDown, ChevronLeft, ChevronRight,
  Download, AlertTriangle, X, CheckCircle, LayoutGrid, List,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { tenants as TENANTS_DATA } from '../../data/tenants'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonRow } from '../../components/Skeleton'
import Modal from '../../components/Modal'
import FilterBar from '../../components/FilterBar'

// ── Setup steps ───────────────────────────────────────────────────────────────
function getSetupSteps(t) {
  return [
    { label: 'Provisioned', done: !!t.createdAt },
    { label: 'Hierarchy',   done: t.hierarchyLevels > 0 && t.totalNodes > 1 },
    { label: 'Modules',     done: Array.isArray(t.enabledModules) && t.enabledModules.length > 0 },
    { label: 'App Build',   done: !!t.lastBuild },
    { label: 'Go Live',     done: !!t.goLiveDate && t.status === 'active' },
  ]
}

function SetupDot({ tenant }) {
  const steps = getSetupSteps(tenant)
  const doneCount = steps.filter(s => s.done).length
  const pct = Math.round((doneCount / steps.length) * 100)
  const allDone = doneCount === steps.length
  const dotColor = allDone ? 'bg-success' : pct >= 60 ? 'bg-amber' : 'bg-danger'
  const accentCls = allDone ? 'text-success' : pct >= 60 ? 'text-amber' : 'text-danger'

  const dotRef = useRef(null)
  const [pos, setPos] = useState(null)

  function handleMouseEnter() {
    const r = dotRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 8, left: r.left })
  }

  return (
    <>
      <div
        ref={dotRef}
        className="flex items-center justify-center cursor-default"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
      </div>

      {pos && createPortal(
        <div
          className="fixed w-44 bg-white border border-border rounded-card shadow-modal p-3 z-[9999] pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary">{doneCount}/{steps.length} steps</p>
            <span className={`text-xs font-bold ${accentCls}`}>{pct}%</span>
          </div>
          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {step.done
                  ? <CheckCircle size={11} className="text-success flex-shrink-0" />
                  : <X size={11} className="text-danger/60 flex-shrink-0" />
                }
                <span className={`text-xs leading-none ${step.done ? 'text-primary' : 'text-secondary'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${allDone ? 'bg-success' : pct >= 60 ? 'bg-amber' : 'bg-danger'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Health Score Tooltip ───────────────────────────────────────────────────────
function HealthTooltip({ tenant, to }) {
  const navigate = useNavigate()
  const ref = useRef(null)
  const [pos, setPos] = useState(null)
  const score = tenant.healthScore

  function buildFactors() {
    const factors = []
    if (tenant.status === 'suspended') factors.push({ pts: -40, text: 'Suspended — no member access' })
    const activePct = tenant.memberCount > 0 ? Math.round((tenant.activeMembers / tenant.memberCount) * 100) : 0
    if (activePct < 50) factors.push({ pts: -22, text: `${activePct}% member activation rate` })
    if (!tenant.meetingsHeld || tenant.meetingsHeld === 0) factors.push({ pts: -10, text: 'No meetings recorded' })
    if (tenant.appStatus !== 'live') factors.push({ pts: -8, text: 'App not yet live' })
    if (tenant.appStatus === 'live') factors.push({ pts: 5, text: 'App live on both stores' })
    if (activePct >= 70) factors.push({ pts: 8, text: 'Strong member activation' })
    return factors.slice(0, 5)
  }

  const factors = buildFactors()

  return (
    <>
      <span
        ref={ref}
        className={`badge cursor-pointer ${score >= 90 ? 'badge-success' : score >= 70 ? 'badge-amber' : score >= 50 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'badge-danger'}`}
        onMouseEnter={() => {
          const r = ref.current?.getBoundingClientRect()
          if (r) setPos({ top: r.bottom + 6, left: r.left })
        }}
        onMouseLeave={() => setPos(null)}
        onClick={() => navigate(to)}
      >
        {score}
      </span>
      {pos && createPortal(
        <div
          className="fixed w-56 bg-white border border-border rounded-card shadow-modal p-3 z-[9999] pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          <p className="text-xs font-bold text-primary mb-2">Health Score: {score}</p>
          <div className="space-y-1.5">
            {factors.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-xs font-medium flex-shrink-0 ${f.pts > 0 ? 'text-success' : 'text-danger'}`}>
                  {f.pts > 0 ? `↑ ${f.pts}pts` : `↓ ${Math.abs(f.pts)}pts`}
                </span>
                <span className="text-xs text-secondary leading-snug">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <span className="text-xs text-teal font-medium">View full health report →</span>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Activation Bar ────────────────────────────────────────────────────────────
function ActivationBar({ total, active }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0
  const barColor = pct >= 70 ? 'bg-teal' : pct >= 50 ? 'bg-amber' : 'bg-danger'
  return (
    <div className="mt-1 h-1 rounded-full bg-border overflow-hidden" style={{ width: '100%' }}>
      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function typeBadge(type) {
  const map = {
    professional_networking: ['Professional', 'badge-teal'],
    alumni: ['Alumni', 'badge-navy'],
    trade_association: ['Trade Body', 'badge-amber'],
  }
  return map[type] || [type, 'badge-gray']
}

function statusBadge(status) {
  const map = {
    active: ['Active', 'badge-success'],
    pending_setup: ['Pending Setup', 'badge-amber'],
    suspended: ['Suspended', 'badge-danger'],
  }
  return map[status] || [status, 'badge-gray']
}

function statusColor(status) {
  if (status === 'suspended') return 'bg-[#FFF5F5]'
  if (status === 'pending_setup') return 'bg-[#FFFBF0]'
  return ''
}

function lastActiveDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const PER_PAGE = 10

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TenantsPage() {
  const navigate = useNavigate()
  const loading = useLoading(800)

  // Data
  const [tenants, setTenants] = useState(TENANTS_DATA)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState([])
  const [statusFilter, setStatusFilter] = useState([])
  const [planFilter, setPlanFilter] = useState([])

  // Sort
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  // Pagination
  const [page, setPage] = useState(1)

  // View mode
  const [viewMode, setViewMode] = useState('table') // 'table' | 'card'

  // Row dropdown
  const [moreOpenId, setMoreOpenId] = useState(null)
  const dropdownRef = useRef(null)

  // Copy state
  const [copiedId, setCopiedId] = useState(null)

  // Bulk select
  const [selected, setSelected] = useState(new Set())

  // Modals
  const [suspendTarget, setSuspendTarget] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [reactivateTarget, setReactivateTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteStep, setDeleteStep] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpenId) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpenId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpenId])

  // Sort toggle
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  // Filtering
  const filtered = tenants.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.domain.includes(search.toLowerCase())) return false
    if (typeFilter.length > 0 && !typeFilter.includes(t.type)) return false
    if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false
    if (planFilter.length > 0 && !planFilter.includes(t.plan)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'lastActivity') {
      const av = a.lastActivity || '1970-01-01'
      const bv = b.lastActivity || '1970-01-01'
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    const av = a[sortKey], bv = b[sortKey]
    if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Stats
  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    pending: tenants.filter(t => t.status === 'pending_setup').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
  }

  // Active filters
  const hasActiveFilters = typeFilter.length > 0 || statusFilter.length > 0 || planFilter.length > 0

  // Copy domain
  const copyDomain = (tenant) => {
    navigator.clipboard.writeText(tenant.domain)
    setCopiedId(tenant.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Export CSV
  const exportCSV = () => {
    const headers = ['Name', 'Type', 'Domain', 'Members', 'Active Members', 'Plan', 'Status', 'Health Score', 'Created']
    const rows = sorted.map(t => [
      t.name, t.type, t.domain, t.memberCount, t.activeMembers, t.plan, t.status, t.healthScore, t.createdAt,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tenants.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // Export selected CSV
  const exportSelected = () => {
    const selectedTenants = sorted.filter(t => selected.has(t.id))
    const headers = ['Name', 'Type', 'Domain', 'Members', 'Plan', 'Status', 'Health Score']
    const rows = selectedTenants.map(t => [t.name, t.type, t.domain, t.memberCount, t.plan, t.status, t.healthScore])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'selected-tenants.csv'; a.click()
    URL.revokeObjectURL(url)
    setSelected(new Set())
  }

  // Clear filters
  const clearFilters = () => {
    setSearch(''); setTypeFilter([]); setStatusFilter([]); setPlanFilter([]); setPage(1)
  }

  // Bulk select helpers
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paginated.map(t => t.id)))
    }
  }
  const allSelected = paginated.length > 0 && paginated.every(t => selected.has(t.id))
  const allSelectedActive = paginated.filter(t => selected.has(t.id)).every(t => t.status === 'active')

  // Sort header helper
  const SortTh = ({ label, sortable, colKey, className = '' }) => (
    <th
      className={`th text-left ${sortable ? 'cursor-pointer select-none hover:bg-surface/80' : ''} ${className}`}
      onClick={sortable ? () => toggleSort(colKey) : undefined}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortable && sortKey === colKey && (
          <ChevronDown size={12} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
        )}
      </span>
    </th>
  )

  // Suspend confirm
  const confirmSuspend = () => {
    setTenants(prev => prev.map(t =>
      t.id === suspendTarget.id ? { ...t, status: 'suspended', suspendedReason: suspendReason } : t
    ))
    toast.error(`${suspendTarget.name} has been suspended`)
    setSuspendTarget(null)
    setSuspendReason('')
  }

  // Reactivate confirm
  const confirmReactivate = () => {
    setTenants(prev => prev.map(t =>
      t.id === reactivateTarget.id ? { ...t, status: 'active', suspendedReason: undefined } : t
    ))
    toast.success(`${reactivateTarget.name} has been reactivated`)
    setReactivateTarget(null)
  }

  // Delete confirm
  const confirmDelete = () => {
    const name = deleteTarget.name
    setTenants(prev => prev.filter(t => t.id !== deleteTarget.id))
    toast.success(`${name} deleted`)
    setDeleteTarget(null)
    setDeleteStep(1)
    setDeleteConfirm('')
    navigate('/admin/tenants')
  }

  // Filter label helpers
  function filterLabel(key, value, options) {
    if (value.length === 0) return key
    if (value.length === 1) {
      const opt = options.find(o => o.value === value[0])
      return `${key}: ${opt?.label ?? value[0]}`
    }
    return `${key}: ${value.length} selected`
  }

  const typeOptions = [
    { value: 'professional_networking', label: 'Professional Networking' },
    { value: 'alumni',                  label: 'Alumni' },
    { value: 'trade_association',        label: 'Trade Association' },
    { value: 'religious',               label: 'Religious' },
    { value: 'corporate',               label: 'Corporate' },
    { value: 'flat',                    label: 'Flat' },
  ]
  const statusOptions = [
    { value: 'active',        label: 'Active' },
    { value: 'pending_setup', label: 'Pending Setup' },
    { value: 'suspended',     label: 'Suspended' },
  ]
  const planOptions = [
    { value: 'starter',      label: 'Starter' },
    { value: 'professional', label: 'Professional' },
    { value: 'enterprise',   label: 'Enterprise' },
  ]

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-navy">Tenants</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {[['Total', stats.total], ['Active', stats.active], ['Pending', stats.pending], ['Suspended', stats.suspended]].map(([label, count]) => (
              <span key={label} className="text-xs text-secondary">
                <span className="font-semibold text-primary">{count}</span> {label}
              </span>
            ))}
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/tenants/new')}
        >
          <Plus size={14} /> New Tenant
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-8"
            disabled={loading}
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'type',
              label: filterLabel('Type', typeFilter, typeOptions),
              activeLabel: typeFilter.length > 0,
              value: typeFilter,
              onChange: v => { setTypeFilter(v); setPage(1) },
              multi: true,
              options: typeOptions,
            },
            {
              key: 'status',
              label: filterLabel('Status', statusFilter, statusOptions),
              activeLabel: statusFilter.length > 0,
              value: statusFilter,
              onChange: v => { setStatusFilter(v); setPage(1) },
              multi: true,
              options: statusOptions,
            },
            {
              key: 'plan',
              label: filterLabel('Plan', planFilter, planOptions),
              activeLabel: planFilter.length > 0,
              value: planFilter,
              onChange: v => { setPlanFilter(v); setPage(1) },
              multi: true,
              options: planOptions,
            },
          ]}
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs font-medium text-teal hover:underline flex-shrink-0">
            Clear all filters
          </button>
        )}

        {/* View toggle */}
        <div className="flex gap-0.5 ml-auto border border-border rounded-button overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 ${viewMode === 'table' ? 'bg-navy text-white' : 'bg-white text-secondary hover:bg-surface'} transition-colors`}
            title="Table view"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-1.5 ${viewMode === 'card' ? 'bg-navy text-white' : 'bg-white text-secondary hover:bg-surface'} transition-colors`}
            title="Card view"
          >
            <LayoutGrid size={14} />
          </button>
        </div>

        <button
          onClick={exportCSV}
          className="btn btn-outline btn-sm"
          disabled={loading}
        >
          <Download size={13} /> Export
        </button>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-navy/5 border border-navy/20 rounded-button text-sm">
          <span className="font-semibold text-primary">{selected.size} tenant{selected.size > 1 ? 's' : ''} selected</span>
          <button onClick={exportSelected} className="btn btn-ghost btn-sm text-xs border border-border">Export Selected</button>
          <button className="btn btn-ghost btn-sm text-xs border border-border">Send Health Report</button>
          {allSelectedActive && (
            <button
              onClick={() => {
                setSelected(new Set())
                toast.error('Selected tenants suspended')
              }}
              className="btn btn-sm text-xs text-danger border border-danger hover:bg-danger/5"
            >
              Suspend Selected
            </button>
          )}
          <button onClick={() => setSelected(new Set())} className="btn btn-ghost btn-sm text-xs ml-auto">
            × Clear selection
          </button>
        </div>
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="th w-8 px-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 accent-teal cursor-pointer"
                    />
                  </th>
                  <th className="th text-left w-10">#</th>
                  <th className="th text-left w-10"></th>
                  <SortTh label="Community" sortable colKey="name" />
                  <th className="th text-left">Type</th>
                  <SortTh label="Members" sortable colKey="memberCount" />
                  <th className="th text-left">Plan</th>
                  <SortTh label="Status" sortable colKey="status" />
                  <SortTh label="Health" sortable colKey="healthScore" />
                  <th className="th text-left">Domain</th>
                  <SortTh label="Last Active" sortable colKey="lastActivity" />
                  <th className="th text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} cols={12} />)
                  : paginated.length > 0
                    ? paginated.map((t, idx) => {
                        const [typeLabel, typeCls] = typeBadge(t.type)
                        const [statusLabel, statusCls] = statusBadge(t.status)
                        const planLabel = t.plan.charAt(0).toUpperCase() + t.plan.slice(1)
                        const lastActive = lastActiveDate(t.lastActivity)
                        const rowBg = statusColor(t.status)
                        return (
                          <tr
                            key={t.id}
                            className={`tr cursor-pointer hover:bg-surface/80 group relative ${rowBg}`}
                            onClick={() => navigate(`/admin/tenants/${t.id}`)}
                          >
                            <td className="td px-3" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selected.has(t.id)}
                                onChange={() => toggleSelect(t.id)}
                                className="w-3.5 h-3.5 accent-teal cursor-pointer"
                              />
                            </td>
                            <td className="td px-4 text-secondary text-sm">
                              {(page - 1) * PER_PAGE + idx + 1}
                            </td>
                            <td className="td px-3">
                              <SetupDot tenant={t} />
                            </td>
                            <td className="td px-4">
                              <p className="font-semibold text-primary text-sm">{t.name}</p>
                            </td>
                            <td className="td px-4">
                              <span className={`badge ${typeCls}`}>{typeLabel}</span>
                            </td>
                            <td className="td px-4">
                              <div>
                                <p className="text-sm text-primary">{t.memberCount} / <span className="text-secondary">{t.activeMembers} active</span></p>
                                <ActivationBar total={t.memberCount} active={t.activeMembers} />
                              </div>
                            </td>
                            <td className="td px-4">
                              <span className="badge badge-gray">{planLabel}</span>
                            </td>
                            <td className="td px-4">
                              <span className={`badge ${statusCls}`}>{statusLabel}</span>
                            </td>
                            <td className="td px-4" onClick={e => e.stopPropagation()}>
                              <HealthTooltip tenant={t} to={`/admin/tenants/${t.id}`} />
                            </td>
                            <td className="td px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-secondary font-mono">{t.domain}</span>
                                <button
                                  onClick={e => { e.stopPropagation(); copyDomain(t) }}
                                  className="p-1 rounded text-secondary hover:text-teal transition-colors flex-shrink-0"
                                  title="Copy domain"
                                >
                                  {copiedId === t.id
                                    ? <Check size={13} className="text-success" />
                                    : <Copy size={13} />}
                                </button>
                              </div>
                            </td>
                            <td className="td px-4">
                              <span className="text-xs whitespace-nowrap text-secondary">{lastActive}</span>
                            </td>
                            <td className="td px-4" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1" ref={moreOpenId === t.id ? dropdownRef : null}>
                                {/* Context-aware action buttons */}
                                <button
                                  className="btn btn-ghost btn-sm flex items-center gap-1"
                                  onClick={() => navigate(`/admin/tenants/${t.id}`)}
                                  title="View"
                                >
                                  <Eye size={14} />
                                </button>

                                {t.status === 'active' && (
                                  <button
                                    className="btn btn-ghost btn-sm flex items-center gap-1"
                                    onClick={() => navigate(`/admin/tenants/${t.id}/edit`)}
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                {t.status === 'suspended' && (
                                  <button
                                    className="btn btn-ghost btn-sm text-xs text-success flex items-center gap-1"
                                    onClick={() => setReactivateTarget(t)}
                                    title="Reactivate"
                                  >
                                    Reactivate
                                  </button>
                                )}
                                {t.status === 'pending_setup' && (
                                  <button
                                    className="btn btn-ghost btn-sm text-xs text-teal flex items-center gap-1"
                                    onClick={() => navigate(`/admin/onboarding/${t.id}`)}
                                    title="Continue Setup"
                                  >
                                    Continue →
                                  </button>
                                )}

                                <div className="relative">
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setMoreOpenId(prev => prev === t.id ? null : t.id)}
                                    title="More"
                                  >
                                    <MoreVertical size={14} />
                                  </button>
                                  {moreOpenId === t.id && (
                                    <div
                                      ref={dropdownRef}
                                      className="absolute right-0 top-full mt-1 w-44 bg-white border border-border rounded-card shadow-modal z-20 py-1"
                                    >
                                      {t.status === 'active' && (
                                        <button
                                          className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                                          onClick={() => { setSuspendTarget(t); setSuspendReason(''); setMoreOpenId(null) }}
                                        >
                                          Suspend Tenant
                                        </button>
                                      )}
                                      {t.status === 'suspended' && (
                                        <>
                                          <button
                                            className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                                            onClick={() => { navigate(`/admin/tenants/${t.id}/edit`); setMoreOpenId(null) }}
                                          >
                                            Edit
                                          </button>
                                        </>
                                      )}
                                      {t.status === 'pending_setup' && (
                                        <>
                                          <button
                                            className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                                            onClick={() => { navigate(`/admin/tenants/${t.id}/edit`); setMoreOpenId(null) }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                                            onClick={() => { setSuspendTarget(t); setSuspendReason(''); setMoreOpenId(null) }}
                                          >
                                            Suspend Tenant
                                          </button>
                                        </>
                                      )}
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                                        onClick={() => { window.open('/csa/dashboard', '_blank'); setMoreOpenId(null) }}
                                      >
                                        View as CSA
                                      </button>
                                      <div className="border-t border-border my-1" />
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                                        onClick={() => { setDeleteTarget(t); setDeleteStep(1); setDeleteConfirm(''); setMoreOpenId(null) }}
                                      >
                                        Delete Tenant
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    : (
                      <tr>
                        <td colSpan={12} className="td px-4 py-10 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center">
                              <Building2 size={24} className="text-teal" />
                            </div>
                            <p className="font-semibold text-primary">No tenants found</p>
                            <p className="text-sm text-secondary">Try adjusting your search or filters</p>
                            <button className="btn btn-outline btn-sm mt-1" onClick={clearFilters}>
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface">
              <p className="text-xs text-secondary">
                Showing {sorted.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, sorted.length)} of {sorted.length} results
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="btn btn-ghost btn-sm flex items-center gap-1"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`btn btn-sm w-8 h-8 flex items-center justify-center rounded-button text-xs font-medium transition-colors
                      ${page === p ? 'bg-teal text-white' : 'btn-ghost'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-ghost btn-sm flex items-center gap-1"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card view */}
      {viewMode === 'card' && (
        <div>
          {loading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-4 space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {paginated.map(t => {
                const [typeLabel, typeCls] = typeBadge(t.type)
                const [statusLabel, statusCls] = statusBadge(t.status)
                const planLabel = t.plan.charAt(0).toUpperCase() + t.plan.slice(1)
                const statusBorderColor = t.status === 'active' ? '#028090' : t.status === 'suspended' ? '#BF360C' : '#E6A817'
                return (
                  <div
                    key={t.id}
                    className="bg-white border border-border rounded-card overflow-hidden hover:shadow-modal transition-all cursor-pointer group"
                    style={{ borderLeft: `4px solid ${statusBorderColor}` }}
                    onClick={() => navigate(`/admin/tenants/${t.id}`)}
                  >
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <p className="font-bold text-primary text-sm">{t.name}</p>
                          <span className={`badge ${statusCls} text-[10px]`}>{statusLabel}</span>
                          <span className={`badge ${t.healthScore >= 90 ? 'badge-success' : t.healthScore >= 70 ? 'badge-amber' : 'badge-danger'} text-[10px]`}>{t.healthScore}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${typeCls} text-[10px]`}>{typeLabel}</span>
                        <span className="badge badge-gray text-[10px]">{planLabel}</span>
                      </div>
                      <div>
                        <p className="text-xs text-secondary">{t.memberCount} members · {t.activeMembers} active</p>
                        <ActivationBar total={t.memberCount} active={t.activeMembers} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-secondary font-mono flex-1 truncate">{t.domain}</span>
                        <button
                          onClick={e => { e.stopPropagation(); copyDomain(t) }}
                          className="p-1 rounded text-secondary hover:text-teal transition-colors flex-shrink-0"
                        >
                          {copiedId === t.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2.5 border-t border-border bg-surface flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/tenants/${t.id}`) }}
                        className="btn btn-ghost btn-sm text-xs flex-1 justify-center"
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/tenants/${t.id}/edit`) }}
                        className="btn btn-ghost btn-sm text-xs flex-1 justify-center"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Suspend Modal */}
      <Modal
        open={!!suspendTarget}
        onClose={() => { setSuspendTarget(null); setSuspendReason('') }}
        title={`Suspend ${suspendTarget?.name ?? ''}?`}
      >
        <div className="p-4 space-y-3">
          <p className="text-sm text-secondary">
            This will immediately block access for <strong className="text-primary">{suspendTarget?.memberCount}</strong> members and the CSA.
          </p>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">
              Suspension Reason <span className="text-danger">*</span>
            </label>
            <textarea
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="Enter reason for suspension..."
              className="input h-16 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              className="btn btn-outline"
              onClick={() => { setSuspendTarget(null); setSuspendReason('') }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmSuspend}
              disabled={!suspendReason.trim()}
            >
              Suspend Tenant
            </button>
          </div>
        </div>
      </Modal>

      {/* Reactivate Modal */}
      <Modal
        open={!!reactivateTarget}
        onClose={() => setReactivateTarget(null)}
        title={`Reactivate ${reactivateTarget?.name ?? ''}?`}
      >
        <div className="p-4 space-y-3">
          <p className="text-sm text-secondary">
            Members will regain full access immediately.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button className="btn btn-outline" onClick={() => setReactivateTarget(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={confirmReactivate}>
              Reactivate
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteStep(1); setDeleteConfirm('') }}
        title={deleteStep === 1 ? `Delete ${deleteTarget?.name ?? ''}?` : 'Confirm deletion'}
      >
        <div className="p-4 space-y-3">
          {deleteStep === 1 ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-card">
                <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary">
                  Are you sure you want to delete <strong className="text-primary">{deleteTarget?.name}</strong>? This cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  className="btn btn-outline"
                  onClick={() => { setDeleteTarget(null); setDeleteStep(1); setDeleteConfirm('') }}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => setDeleteStep(2)}>
                  Yes, Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-secondary">
                Type the community name to confirm:
              </p>
              <p className="text-xs font-semibold text-primary bg-surface border border-border rounded-button px-3 py-2">
                {deleteTarget?.name}
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Type community name..."
                className="input"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  className="btn btn-outline"
                  onClick={() => { setDeleteTarget(null); setDeleteStep(1); setDeleteConfirm('') }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={deleteConfirm !== deleteTarget?.name}
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
