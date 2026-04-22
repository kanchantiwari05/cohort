import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Circle, Clock, AlertTriangle,
  ChevronRight, ChevronDown, MessageSquare, Check, X,
  Plus, Download, CalendarClock, Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { onboardings as seedData, checklistSteps } from '../../data/onboarding'
import { tenants } from '../../data/tenants'
import Modal from '../../components/Modal'
import { useLoading } from '../../hooks/useLoading'
import ViewToggle from '../../components/ViewToggle'
import Pagination from '../../components/Pagination'
import FilterBar from '../../components/FilterBar'

const CARD_PER_PAGE  = 9
const TABLE_PER_PAGE = 10

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(from, to = new Date()) {
  return Math.max(0, Math.floor((new Date(to) - new Date(from)) / 86400000))
}

function isOverdue(onb) {
  return (
    onb.status !== 'completed' &&
    onb.targetGoLive &&
    new Date(onb.targetGoLive) < new Date()
  )
}

function isStalled(onb) {
  return isOverdue(onb) && onb.completedSteps.some(s => !s.done)
}

// Live progress calculated from steps (used in cards)
function calcCompletion(steps) {
  const done = steps.filter(s => s.done).length
  return { done, total: steps.length, pct: Math.round((done / steps.length) * 100) }
}

const STATUS_META = {
  completed:   { label: 'Completed',   cls: 'badge-success' },
  in_progress: { label: 'In Progress', cls: 'badge-teal'    },
  stalled:     { label: 'Stalled',     cls: 'badge-warning' },
}

// ── Send Nudge Modal ──────────────────────────────────────────────────────────

export function SendNudgeModal({ open, onClose, csaName, csaPhone, stepLabel }) {
  const [msg, setMsg] = useState(
    `Hi ${csaName}, this is a reminder to complete "${stepLabel}" for your CNP community setup. Your community is almost ready to go live! Please complete this step at your earliest convenience.\n\n— CNP Platform Team`
  )
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    const url = `https://wa.me/91${csaPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onClose()
      toast.success('Reminder sent via WhatsApp ✓')
    }, 800)
  }

  // Reset message when target changes
  const defaultMsg = `Hi ${csaName}, this is a reminder to complete "${stepLabel}" for your CNP community setup. Your community is almost ready to go live! Please complete this step at your earliest convenience.\n\n— CNP Platform Team`

  return (
    <Modal open={open} onClose={onClose} title="Send Reminder to CSA" maxWidth={480}>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-card text-sm">
          <MessageSquare size={15} className="text-teal flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-primary">{csaName}</p>
            <p className="text-secondary text-xs mt-0.5">+91 {csaPhone}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
            WhatsApp Message
          </label>
          <textarea
            className="input"
            style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
            rows={6}
            value={msg}
            onChange={e => setMsg(e.target.value)}
          />
          <p className="text-[11px] text-secondary mt-1">You can edit the message before sending.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost btn flex-1">Cancel</button>
          <button
            onClick={handleSend}
            disabled={sent}
            className="btn-primary btn flex-1"
            style={{ background: sent ? '#2E7D32' : undefined }}
          >
            {sent
              ? <><Check size={14} /> Sent!</>
              : <><MessageSquare size={14} /> Send via WhatsApp</>
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Create Onboarding Modal ───────────────────────────────────────────────────

function CreateOnboardingModal({ open, onClose, prefillTenantId, eligibleTenants, onCreate }) {
  const [tenantId,    setTenantId]    = useState(prefillTenantId ?? '')
  const [contractDate, setContractDate] = useState('')
  const [targetDate,  setTargetDate]  = useState('')
  const [notes,       setNotes]       = useState('')

  // Reset when prefill changes
  const handleOpen = () => { setTenantId(prefillTenantId ?? ''); setContractDate(''); setTargetDate(''); setNotes('') }

  const canSubmit = tenantId && contractDate && targetDate

  const handleCreate = () => {
    if (!canSubmit) return
    const tenant = eligibleTenants.find(t => t.id === tenantId)
    const newOnb = {
      id: `onb-${Date.now()}`,
      tenantId,
      communityName: tenant?.name ?? tenantId,
      csaName:  tenant?.csaName  ?? '—',
      csaPhone: tenant?.csaPhone ?? '',
      contractDate,
      targetGoLive: targetDate,
      actualGoLive: null,
      status: 'in_progress',
      notes,
      completedSteps: checklistSteps.map(s => ({ ...s, done: false })),
      completion: 0,
    }
    onCreate(newOnb)
    toast.success(`Onboarding created for ${tenant?.name} ✓`)
    onClose()
    handleOpen()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Onboarding" maxWidth={520}>
      <div className="p-6 space-y-5">

        {/* 1 — Tenant */}
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
            Tenant <span className="text-danger">*</span>
          </label>
          <select
            className="input"
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
          >
            <option value="">— Select a tenant —</option>
            {eligibleTenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {eligibleTenants.length === 0 && (
            <p className="text-xs text-secondary mt-1">All active tenants already have an onboarding checklist.</p>
          )}
        </div>

        {/* 2 — Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
              Contract Date <span className="text-danger">*</span>
            </label>
            <input type="date" className="input" value={contractDate} onChange={e => setContractDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
              Target Go-Live <span className="text-danger">*</span>
            </label>
            <input type="date" className="input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        </div>

        {/* 3 — Checklist preview */}
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Standard Checklist <span className="font-normal text-secondary">(10 steps)</span>
          </p>
          <div className="bg-surface border border-border rounded-card p-3 space-y-1.5 max-h-36 overflow-y-auto">
            {checklistSteps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 text-xs text-secondary">
                <span className="w-4 h-4 rounded-full border border-border flex items-center justify-center text-[9px] font-semibold flex-shrink-0 text-secondary">{i + 1}</span>
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* 4 — Notes */}
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
            Notes <span className="font-normal text-secondary">(optional)</span>
          </label>
          <textarea
            className="input"
            style={{ height: 'auto', paddingTop: 8, paddingBottom: 8, resize: 'none' }}
            rows={2}
            placeholder="Any special instructions or context for this onboarding…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost btn flex-1">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!canSubmit}
            className="btn-primary btn flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Create Onboarding
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Onboarding Card ───────────────────────────────────────────────────────────

function OnboardingCard({ onb, onViewChecklist, onSendReminder }) {
  const { done, total, pct } = calcCompletion(onb.completedSteps)
  const overdue   = isOverdue(onb)
  const stalled   = isStalled(onb)
  const daysSince = daysBetween(onb.contractDate)
  const daysPast  = overdue ? daysBetween(onb.targetGoLive) : 0

  const effectiveStatus = stalled ? 'stalled' : onb.status
  const meta = STATUS_META[effectiveStatus] ?? STATUS_META.in_progress

  const pendingSteps = onb.completedSteps.filter(s => !s.done)

  return (
    <div className="card p-5 space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-bold text-primary truncate">{onb.communityName}</p>
          <p className="text-xs text-secondary mt-0.5">
            Target: {fmtDate(onb.targetGoLive)}
            {onb.actualGoLive && ` · Went live: ${fmtDate(onb.actualGoLive)}`}
          </p>
        </div>
        <span className={`badge ${meta.cls} flex-shrink-0`}>{meta.label}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">{pct}% complete</span>
          <span className="text-xs text-secondary">{done} of {total} steps done</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#2E7D32' : stalled ? '#E6A817' : '#028090',
            }}
          />
        </div>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {onb.completedSteps.map(step => {
          const stepStalled = !step.done && overdue
          return (
            <div key={step.id} className="flex items-center gap-1.5 min-w-0">
              {step.done ? (
                <CheckCircle2 size={13} className="text-success flex-shrink-0" />
              ) : stepStalled ? (
                <Circle size={13} className="text-amber flex-shrink-0" />
              ) : (
                <Circle size={13} className="text-border flex-shrink-0" />
              )}
              <span className={`text-[11px] truncate leading-tight
                ${step.done ? 'text-secondary line-through' : stepStalled ? 'text-amber-dark font-medium' : 'text-secondary'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-1 border-t border-border space-y-2">
        <div className="flex items-center gap-3 text-xs text-secondary">
          <span>{daysSince} days since contract</span>
          {overdue && (
            <span className="flex items-center gap-1 text-amber-dark font-medium">
              <AlertTriangle size={11} /> {daysPast} days past target
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewChecklist(onb)}
            className="btn-ghost btn btn-sm flex-1 border border-border hover:border-teal/40 text-xs"
          >
            View Checklist <ChevronRight size={12} />
          </button>
          {pendingSteps.length > 0 && (
            <button
              onClick={() => onSendReminder(onb)}
              className="btn-ghost btn btn-sm border border-amber/40 text-amber-dark hover:bg-amber/8 text-xs"
            >
              <MessageSquare size={12} /> Send Reminder
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const SUMMARY = { total: 12, completed: 9, in_progress: 2, stalled: 1 }

const STATUS_OPTIONS = [
  { value: 'completed',   label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'stalled',     label: 'Stalled' },
]

const COMMUNITY_TYPE_OPTIONS = [
  { value: 'professional_networking', label: 'Professional Networking' },
  { value: 'sports_recreation',       label: 'Sports & Recreation' },
  { value: 'cultural_social',         label: 'Cultural & Social' },
  { value: 'alumni_educational',      label: 'Alumni & Educational' },
]

// FIX 5 — context-aware days label
function daysSinceContractLabel(onb) {
  const days = daysBetween(onb.contractDate)
  if (onb.status === 'completed' && onb.actualGoLive) {
    const took = daysBetween(onb.contractDate, onb.actualGoLive)
    return { text: `${took}d to complete`, cls: 'text-success font-medium' }
  }
  if (isOverdue(onb)) return { text: `${days}d  · overdue`, cls: 'text-danger font-medium' }
  if (days > 60)      return { text: `${days}d`, cls: 'text-danger font-medium' }
  if (days > 30)      return { text: `${days}d`, cls: 'text-amber-dark font-medium' }
  return { text: `${days}d`, cls: 'text-secondary' }
}

export default function OnboardingPage() {
  const loading  = useLoading(220)
  const navigate = useNavigate()

  const [onboardings, setOnboardings] = useState(seedData)
  const [statusFilter, setStatusFilter] = useState([])
  const [typeFilter,   setTypeFilter]   = useState([])
  const [overdueOnly,  setOverdueOnly]  = useState(false)
  const [nudgeTarget,  setNudgeTarget]  = useState(null)
  const [view,         setView]         = useState('table')
  const [page,         setPage]         = useState(1)
  const [newOnbOpen,   setNewOnbOpen]   = useState(false)
  const [prefillTenantId, setPrefillTenantId] = useState('')
  const [noOnbOpen,    setNoOnbOpen]    = useState(false) // "without onboarding" section
  const progressTipRef = useRef(null)
  const [progressTip,  setProgressTip]  = useState(null) // { onb, rect }

  const tenantsWithoutOnboarding = tenants.filter(
    t => t.status === 'active' && !onboardings.find(o => o.tenantId === t.id)
  )

  const filtered = onboardings.filter(onb => {
    if (overdueOnly && !isOverdue(onb)) return false
    if (statusFilter.length > 0) {
      if (statusFilter.includes('stalled') && isStalled(onb)) { /* pass */ }
      else if (!statusFilter.some(s => s !== 'stalled' && onb.status === s)) return false
    }
    if (typeFilter.length > 0) {
      const t = tenants.find(t => t.id === onb.tenantId)
      if (!t || !typeFilter.includes(t.type)) return false
    }
    return true
  })

  const perPage = view === 'card' ? CARD_PER_PAGE : TABLE_PER_PAGE
  const paged   = filtered.slice((page - 1) * perPage, page * perPage)

  const handleViewChecklist = (onb) => {
    navigate(`/admin/onboarding/${onb.id}`, { state: { onb } })
  }

  const handleSendReminder = (onb) => {
    // Open nudge for first pending stalled step, or just first pending
    const pendingSteps = onb.completedSteps.filter(s => !s.done)
    const step = pendingSteps[0]
    setNudgeTarget({ onb, step })
  }

  const PILL_ITEMS = [
    { label: 'Total',       value: SUMMARY.total,       cls: 'bg-surface border border-border text-primary' },
    { label: 'Completed',   value: SUMMARY.completed,   cls: 'bg-success/10 text-success' },
    { label: 'In Progress', value: SUMMARY.in_progress, cls: 'bg-teal/10 text-teal' },
    { label: 'Stalled',     value: SUMMARY.stalled,     cls: 'bg-amber/10 text-amber-dark' },
  ]

  return (
    <div className="p-3 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Launch Tracker</h1>
          <p className="text-secondary text-sm mt-0.5">Monitor CSA handoff progress — first login, level admins, members & go-live.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PILL_ITEMS.map(p => (
            <div key={p.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-button text-sm font-medium ${p.cls}`}>
              <span className="font-bold">{p.value}</span>
              <span className="opacity-75 text-xs">{p.label}</span>
            </div>
          ))}
          <button
            onClick={() => { setPrefillTenantId(''); setNewOnbOpen(true) }}
            disabled={tenantsWithoutOnboarding.length === 0}
            className="btn-primary btn btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title={tenantsWithoutOnboarding.length === 0 ? 'All active tenants already have an onboarding checklist' : undefined}
          >
            <Plus size={14} /> New Onboarding
          </button>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: v => { setStatusFilter(v); setPage(1) },
              multi: true,
              options: STATUS_OPTIONS,
            },
            {
              key: 'type',
              label: 'Community Type',
              value: typeFilter,
              onChange: v => { setTypeFilter(v); setPage(1) },
              multi: true,
              options: COMMUNITY_TYPE_OPTIONS,
            },
          ]}
        />
        {/* Overdue toggle pill */}
        <button
          onClick={() => { setOverdueOnly(v => !v); setPage(1) }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-medium border transition-colors
            ${overdueOnly
              ? 'bg-danger/10 border-danger/30 text-danger'
              : 'bg-surface border-border text-secondary hover:border-danger/30 hover:text-danger'}`}
        >
          <AlertTriangle size={12} />
          Overdue Only
        </button>
        <p className="text-sm text-secondary">
          Showing {filtered.length} of {onboardings.length} onboardings
        </p>
        <div className="ml-auto">
          <ViewToggle value={view} onChange={v => { setView(v); setPage(1) }} />
        </div>
      </div>

      {/* ── Card View ── */}
      {view === 'card' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2].map(i => (
                <div key={i} className="card p-5 space-y-3 animate-pulse">
                  <div className="h-5 w-40 bg-gray-100 rounded" />
                  <div className="h-2 w-full bg-gray-100 rounded-full" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array(10).fill(0).map((_, j) => <div key={j} className="h-3 bg-gray-100 rounded" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={32} className="text-success mb-3" />
              <p className="text-base font-semibold text-primary">No onboardings match this filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {paged.map(onb => (
                <OnboardingCard
                  key={onb.id}
                  onb={onb}
                  onViewChecklist={handleViewChecklist}
                  onSendReminder={handleSendReminder}
                />
              ))}
            </div>
          )}
          <Pagination page={page} total={filtered.length} perPage={CARD_PER_PAGE} onChange={setPage} />
        </>
      )}

      {/* ── Table View ── */}
      {view === 'table' && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="th text-left">Community</th>
                    <th className="th text-left">CSA</th>
                    <th className="th text-left">Status</th>
                    <th className="th text-left">Progress</th>
                    <th className="th text-left">Target Go-Live</th>
                    <th className="th text-left">Days Since Contract</th>
                    <th className="th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j} className="td"><div className="h-3 bg-gray-100 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : paged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="td text-center text-secondary py-10">No onboardings match this filter.</td>
                    </tr>
                  ) : paged.map(onb => {
                    const { done, total, pct } = calcCompletion(onb.completedSteps)
                    const overdue = isOverdue(onb)
                    const stalled = isStalled(onb)
                    const effectiveStatus = stalled ? 'stalled' : onb.status
                    const meta = STATUS_META[effectiveStatus] ?? STATUS_META.in_progress
                    const daysLabel = daysSinceContractLabel(onb)
                    // FIX 4 — progress tooltip data
                    const lastDone   = [...onb.completedSteps].reverse().find(s => s.done)
                    const nextPending = onb.completedSteps.find(s => !s.done)
                    return (
                      <tr key={onb.id} className="tr">
                        <td className="td">
                          <p className="font-semibold text-primary text-sm">{onb.communityName}</p>
                        </td>
                        <td className="td">
                          <p className="text-sm text-primary">{onb.csaName}</p>
                          <p className="text-xs text-secondary">+91 {onb.csaPhone}</p>
                        </td>
                        <td className="td">
                          <span className={`badge ${meta.cls}`}>{meta.label}</span>
                        </td>
                        {/* FIX 4 — progress bar with hover tooltip */}
                        <td className="td">
                          <div
                            className="flex items-center gap-2 min-w-[120px] relative group"
                            onMouseEnter={e => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setProgressTip({ onb, rect })
                            }}
                            onMouseLeave={() => setProgressTip(null)}
                          >
                            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden border border-border cursor-default">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: pct === 100 ? '#2E7D32' : stalled ? '#E6A817' : '#028090' }}
                              />
                            </div>
                            <span className="text-xs text-secondary whitespace-nowrap">{done}/{total}</span>
                          </div>
                        </td>
                        <td className="td">
                          <span className={`text-xs ${overdue ? 'text-danger font-medium' : 'text-secondary'}`}>
                            {fmtDate(onb.targetGoLive)}
                            {overdue && <span className="block text-[10px]">{daysBetween(onb.targetGoLive)}d overdue</span>}
                          </span>
                        </td>
                        {/* FIX 5 — context-aware days label */}
                        <td className="td">
                          <span className={`text-xs ${daysLabel.cls}`}>{daysLabel.text}</span>
                        </td>
                        {/* FIX 3 — context-aware actions */}
                        <td className="td">
                          <div className="flex items-center gap-1 justify-center flex-wrap">
                            <button
                              onClick={() => handleViewChecklist(onb)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-secondary hover:bg-surface hover:text-primary transition-colors"
                            >
                              View
                            </button>
                            {onb.status === 'completed' && (
                              <button
                                onClick={() => toast.success('Report downloaded ✓')}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-secondary hover:bg-surface transition-colors"
                              >
                                <Download size={11} /> Report
                              </button>
                            )}
                            {onb.status === 'in_progress' && !overdue && (
                              <button
                                onClick={() => handleSendReminder(onb)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-teal hover:bg-teal/8 transition-colors"
                              >
                                <MessageSquare size={11} /> Nudge CSA
                              </button>
                            )}
                            {(stalled || overdue) && (
                              <>
                                <button
                                  onClick={() => handleSendReminder(onb)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-danger hover:bg-danger/8 transition-colors"
                                >
                                  <MessageSquare size={11} /> Nudge!
                                </button>
                                <button
                                  onClick={() => toast('Extend deadline — coming soon')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-secondary hover:bg-surface transition-colors"
                                >
                                  <CalendarClock size={11} /> Extend
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={filtered.length} perPage={TABLE_PER_PAGE} onChange={setPage} />
        </>
      )}

      {/* FIX 7 — Tenants Without Onboarding */}
      {tenantsWithoutOnboarding.length > 0 && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setNoOnbOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users size={15} className="text-secondary" />
              <span className="text-sm font-semibold text-primary">
                Tenants Without Onboarding
              </span>
              <span className="badge badge-warning">{tenantsWithoutOnboarding.length}</span>
            </div>
            <ChevronDown
              size={15}
              className={`text-secondary transition-transform ${noOnbOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {noOnbOpen && (
            <div className="border-t border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="th text-left">Tenant</th>
                    <th className="th text-left">Plan</th>
                    <th className="th text-left">Members</th>
                    <th className="th text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantsWithoutOnboarding.map(t => (
                    <tr key={t.id} className="tr">
                      <td className="td">
                        <p className="text-sm font-semibold text-primary">{t.name}</p>
                        <p className="text-xs text-secondary">{t.domain}</p>
                      </td>
                      <td className="td">
                        <span className="text-xs text-secondary capitalize">{t.plan}</span>
                      </td>
                      <td className="td">
                        <span className="text-xs text-secondary">{t.memberCount}</span>
                      </td>
                      <td className="td text-center">
                        <button
                          onClick={() => { setPrefillTenantId(t.id); setNewOnbOpen(true) }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-teal hover:bg-teal/8 transition-colors mx-auto"
                        >
                          <Plus size={11} /> Create Onboarding
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Send Nudge Modal ── */}
      {nudgeTarget && (
        <SendNudgeModal
          open
          onClose={() => setNudgeTarget(null)}
          csaName={nudgeTarget.onb.csaName}
          csaPhone={nudgeTarget.onb.csaPhone}
          stepLabel={nudgeTarget.step?.label ?? 'pending steps'}
        />
      )}

      {/* ── Create Onboarding Modal ── */}
      <CreateOnboardingModal
        open={newOnbOpen}
        onClose={() => setNewOnbOpen(false)}
        prefillTenantId={prefillTenantId}
        eligibleTenants={tenantsWithoutOnboarding}
        onCreate={newOnb => setOnboardings(prev => [newOnb, ...prev])}
      />

      {/* ── Progress Tooltip Portal ── */}
      {progressTip && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top:  progressTip.rect.bottom + window.scrollY + 6,
            left: Math.min(progressTip.rect.left + window.scrollX, window.innerWidth - 240),
          }}
        >
          <div className="bg-navy text-white text-xs rounded-card shadow-lg px-3 py-2.5 space-y-1 w-56">
            {progressTip.onb.completedSteps.filter(s => s.done).length > 0 ? (
              <p className="text-[11px] text-white/70">
                Last done: <span className="text-white font-medium">
                  {[...progressTip.onb.completedSteps].reverse().find(s => s.done)?.label}
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-white/70">No steps completed yet</p>
            )}
            {progressTip.onb.completedSteps.find(s => !s.done) && (
              <p className="text-[11px] text-white/70">
                Stuck on: <span className="text-amber font-medium">
                  {progressTip.onb.completedSteps.find(s => !s.done)?.label}
                </span>
              </p>
            )}
            <p className="text-[11px] text-white/70">
              Next owner: <span className="text-white font-medium">CSA — {progressTip.onb.csaName}</span>
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
