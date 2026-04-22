import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Plus, Smartphone, CheckCircle2, XCircle, Loader2, Clock,
  Apple, Play, ExternalLink, ChevronRight, AlertTriangle,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { appBuilds as seedBuilds } from '../../data/appBuilds'
import { tenants }                  from '../../data/tenants'
import Modal                        from '../../components/Modal'
import { useLoading }               from '../../hooks/useLoading'
import { SkeletonRow, SkeletonCard } from '../../components/Skeleton'
import FilterBar                    from '../../components/FilterBar'
import Pagination                   from '../../components/Pagination'
import Select                       from '../../components/Select'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function nextVersion(lastVersion) {
  if (!lastVersion) return '1.0.0'
  const parts = lastVersion.split('.').map(Number)
  parts[2] = (parts[2] ?? 0) + 1
  return parts.join('.')
}

const STATUS_META = {
  live:      { label: 'Live',             cls: 'badge-success', cardCls: 'text-success', icon: CheckCircle2, spin: false },
  building:  { label: 'Building',         cls: 'badge-teal',    cardCls: 'text-teal',    icon: Loader2,      spin: true  },
  in_review: { label: 'In Review',        cls: 'badge-warning', cardCls: 'text-warning', icon: Clock,        spin: false },
  failed:    { label: 'Failed',           cls: 'badge-danger',  cardCls: 'text-danger',  icon: XCircle,      spin: false },
}

function StatusBadge({ status, size = 'md' }) {
  const m = STATUS_META[status] ?? { label: status, cls: 'badge-gray', icon: null, spin: false }
  const Icon = m.icon
  return (
    <span className={`badge ${m.cls} inline-flex items-center gap-1`}>
      {Icon && <Icon size={size === 'sm' ? 10 : 11} className={m.spin ? 'animate-spin' : ''} />}
      {m.label}
    </span>
  )
}

function PlatformBadge({ platform }) {
  const both = platform === 'both'
  return (
    <div className="flex items-center gap-1">
      {(both || platform === 'ios') && (
        <span className="badge badge-navy flex items-center gap-1">
          <Apple size={10} /> iOS
        </span>
      )}
      {(both || platform === 'android') && (
        <span className="badge badge-success flex items-center gap-1">
          <Play size={10} /> Android
        </span>
      )}
    </div>
  )
}

// Build checklist split into required (blocks trigger) and recommended (warning only)
function buildChecklist(tenant) {
  const active = tenant?.status === 'active'
  return {
    required: [
      { id: 'icon',     label: 'App icon uploaded (1024×1024)', passed: true },
      { id: 'name',     label: 'Community name set',            passed: true },
      { id: 'branding', label: 'Branding assets uploaded',      passed: true },
    ],
    recommended: [
      { id: 'admins',    label: 'All Level Admins assigned',  passed: false, warn: '3 nodes still unassigned — app will work but admins cannot manage those nodes' },
      { id: 'splash',    label: 'Splash screen uploaded',     passed: true,  warn: null },
      { id: 'hierarchy', label: 'Hierarchy fully configured', passed: active, warn: active ? null : 'Hierarchy not yet configured — app will work but navigation may be limited' },
    ],
  }
}

// Build stage info for in-progress builds
const BUILDING_STAGES = ['Installing dependencies', 'Bundling assets', 'Generating build', 'Signing & packaging', 'Preparing submission']

function getBuildStageInfo(build) {
  const isBuilding  = build.status === 'building'  || build.iosStatus === 'building'
  const isInReview  = build.status === 'in_review' || build.iosStatus === 'in_review'
  if (isBuilding)  return { type: 'building',   stage: 3, totalStages: 5, stageName: BUILDING_STAGES[2], startedAgo: '45 min ago', estRemaining: '~20 min remaining' }
  if (isInReview)  return { type: 'in_review',  reviewDay: 4, totalDays: 14, estApproval: '1–10 May 2024' }
  return null
}

// ── Trigger Build Modal ───────────────────────────────────────────────────────

function TriggerModal({ open, onClose, onTriggered, builds, prefillTenantId = null }) {
  const [step,       setStep]       = useState(1)
  const [tenantId,   setTenantId]   = useState(prefillTenantId ?? '')
  const [version,    setVersion]    = useState('')
  const [platform,   setPlatform]   = useState('both')
  const [notes,      setNotes]      = useState('')
  const [triggering, setTriggering] = useState(false)

  // Reset on open
  useEffect(() => {
    if (!open) {
      setStep(1); setTenantId(prefillTenantId ?? '')
      setVersion(''); setPlatform('both'); setNotes(''); setTriggering(false)
    }
  }, [open, prefillTenantId])

  // Auto-set version when tenant changes
  useEffect(() => {
    if (!tenantId) { setVersion(''); return }
    const last = builds
      .filter(b => b.tenantId === tenantId)
      .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt))[0]
    setVersion(nextVersion(last?.version))
  }, [tenantId, builds])

  const tenant    = tenants.find(t => t.id === tenantId)
  const checklist = tenant ? buildChecklist(tenant) : { required: [], recommended: [] }
  const requiredFails = checklist.required.filter(c => !c.passed)
  const recommendedWarns = checklist.recommended.filter(c => !c.passed && c.warn)
  const warnCount = requiredFails.length + recommendedWarns.length
  const lastBuild = builds.filter(b => b.tenantId === tenantId)
    .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt))[0]

  const handleTrigger = async () => {
    setTriggering(true)
    await new Promise(r => setTimeout(r, 900))
    const newBuild = {
      id:            `build-${Date.now()}`,
      tenantId,
      communityName: tenant.name,
      version,
      platform,
      status:        'building',
      iosStatus:     platform === 'android' ? null : 'building',
      androidStatus: platform === 'ios'     ? null : 'building',
      triggeredAt:   new Date().toISOString().slice(0, 10),
      completedAt:   null,
      iosReviewDays:     null,
      androidReviewDays: null,
      iosLink:     null,
      androidLink: null,
      buildNotes:  notes,
      triggeredBy: 'pa-001',
    }
    onTriggered(newBuild)
    setTriggering(false)
    onClose()
    toast.success(`Build triggered for ${tenant.name} ✓`)
  }

  const PLATFORMS = [
    { id: 'both',    label: 'Both iOS & Android', sub: 'Recommended' },
    { id: 'ios',     label: 'iOS only',            sub: null },
    { id: 'android', label: 'Android only',        sub: null },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Trigger New Build" maxWidth={560}>
      {/* Step indicator */}
      <div className="px-6 pt-5">
        <div className="flex items-center">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${step > n ? 'bg-success text-white' : step === n ? 'bg-teal text-white' : 'bg-border text-secondary'}`}>
                  {step > n ? <Check size={13} /> : n}
                </div>
                <span className={`text-xs font-medium hidden sm:block
                  ${step === n ? 'text-teal' : step > n ? 'text-success' : 'text-secondary'}`}>
                  {['Select Community', 'Configure Build', 'Review & Trigger'][n - 1]}
                </span>
              </div>
              {n < 3 && <div className={`flex-1 h-px mx-3 ${step > n ? 'bg-success' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Select Community
              </label>
              <Select
                value={tenantId}
                onChange={v => setTenantId(v)}
                placeholder="Choose a community…"
                searchable
                options={tenants.map(t => {
                  const lb = builds.filter(b => b.tenantId === t.id)
                    .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt))[0]
                  return {
                    value: t.id,
                    label: `${t.name} · ${t.appStatus ?? t.status} · Last: ${lb ? fmtDate(lb.triggeredAt) : 'Never'}`,
                  }
                })}
              />
            </div>

            {tenant && (
              <div className="bg-surface border border-border rounded-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary">{tenant.name}</p>
                  <StatusBadge status={tenant.appStatus ?? 'live'} />
                </div>
                <div className="flex items-center gap-4 text-xs text-secondary">
                  <span>{tenant.memberCount} members</span>
                  {lastBuild && <span>Last build: v{lastBuild.version} · {fmtDate(lastBuild.triggeredAt)}</span>}
                </div>
              </div>
            )}

            <button disabled={!tenantId} onClick={() => setStep(2)} className="btn-primary btn w-full">
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Version */}
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Version Number
              </label>
              <input
                type="text"
                className="input font-mono"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
              {lastBuild && (
                <p className="text-[11px] text-secondary mt-1">
                  Auto-incremented from v{lastBuild.version}
                </p>
              )}
            </div>

            {/* Platform */}
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Platform
              </label>
              <div className="space-y-2">
                {PLATFORMS.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-card cursor-pointer transition-colors
                      ${platform === p.id ? 'border-teal bg-teal/5' : 'border-border hover:border-teal/40'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${platform === p.id ? 'border-teal' : 'border-border'}`}>
                      {platform === p.id && <div className="w-2 h-2 rounded-full bg-teal" />}
                    </div>
                    <input
                      type="radio"
                      name="platform"
                      value={p.id}
                      checked={platform === p.id}
                      onChange={() => setPlatform(p.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{p.label}</p>
                      {p.sub && <p className="text-[11px] text-teal font-medium">{p.sub}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Build Notes <span className="font-normal normal-case">(optional)</span>
              </label>
              <textarea
                className="input"
                style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
                rows={3}
                maxLength={500}
                placeholder="What changed in this version?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-secondary">Internal reference only — not submitted to App Store. Note branding changes, new modules, or config updates.</p>
                <p className={`text-[11px] font-mono flex-shrink-0 ml-2 ${notes.length >= 480 ? 'text-danger' : notes.length >= 400 ? 'text-amber-dark' : 'text-secondary'}`}>
                  {notes.length} / 500
                </p>
              </div>
            </div>

            {/* Pre-build checklist — tiered */}
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                Pre-build Checklist
              </p>
              {/* Required items */}
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#BF360C' }}>Required</p>
              <div className="space-y-1.5 mb-3">
                {checklist.required.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${item.passed ? 'bg-success/10' : 'bg-danger/10'}`}>
                      {item.passed ? <Check size={10} className="text-success" /> : <XCircle size={10} className="text-danger" />}
                    </div>
                    <span className="text-sm text-primary">{item.label}</span>
                  </div>
                ))}
              </div>
              {/* Recommended items */}
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#C17900' }}>Recommended</p>
              <div className="space-y-1.5">
                {checklist.recommended.map(item => (
                  <div key={item.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${item.passed ? 'bg-success/10' : 'bg-amber/10'}`}>
                        {item.passed ? <Check size={10} className="text-success" /> : <AlertTriangle size={10} className="text-amber" />}
                      </div>
                      <span className="text-sm text-primary">{item.label}</span>
                    </div>
                    {item.warn && !item.passed && (
                      <p className="text-[11px] text-amber-dark ml-6 mt-0.5 leading-snug">{item.warn}</p>
                    )}
                  </div>
                ))}
              </div>
              {requiredFails.length > 0 && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-danger/5 border border-danger/20 rounded-card">
                  <XCircle size={13} className="text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">Complete required items to trigger build</p>
                </div>
              )}
              {requiredFails.length === 0 && recommendedWarns.length > 0 && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber/8 border border-amber/20 rounded-card">
                  <AlertTriangle size={13} className="text-amber flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-dark">
                    {recommendedWarns.length} recommended item{recommendedWarns.length > 1 ? 's' : ''} incomplete. Build will proceed but may have limited functionality.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-ghost btn btn-sm">← Back</button>
              <button
                disabled={!version || requiredFails.length > 0}
                onClick={() => setStep(3)}
                className="btn-primary btn flex-1"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Summary card */}
            <div className="bg-surface border border-border rounded-card divide-y divide-border">
              {[
                { label: 'Community',  value: tenant?.name },
                { label: 'Version',    value: `v${version}` },
                { label: 'Platform',   value: { both: 'iOS & Android', ios: 'iOS only', android: 'Android only' }[platform] },
                { label: 'Build Notes', value: notes || '—' },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-4 px-4 py-3">
                  <span className="text-xs text-secondary w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-sm font-medium text-primary">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Estimated timeline */}
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
                Estimated Timeline
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(platform === 'both' || platform === 'android') && (
                  <div className="bg-surface border border-border rounded-card p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Play size={13} className="text-success" />
                      <span className="text-xs font-semibold text-primary">Android</span>
                    </div>
                    <p className="text-lg font-bold text-success">1–3</p>
                    <p className="text-[11px] text-secondary">business days</p>
                  </div>
                )}
                {(platform === 'both' || platform === 'ios') && (
                  <div className="bg-surface border border-border rounded-card p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Apple size={13} className="text-navy" />
                      <span className="text-xs font-semibold text-primary">iOS</span>
                    </div>
                    <p className="text-lg font-bold text-navy">7–14</p>
                    <p className="text-[11px] text-secondary">business days</p>
                  </div>
                )}
              </div>
            </div>

            {/* FIX 5: Carry warning from Step 2 */}
            {recommendedWarns.length > 0 && (
              <div className="flex items-start gap-2.5 p-3 bg-amber/6 border border-amber/20 rounded-card">
                <AlertTriangle size={13} className="text-amber flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-dark">⚠ {recommendedWarns.length} pre-build note{recommendedWarns.length > 1 ? 's' : ''}</p>
                  {recommendedWarns.map(w => (
                    <p key={w.id} className="text-secondary mt-0.5 leading-snug">{w.warn}</p>
                  ))}
                  <a href="/admin/hierarchy" className="text-teal font-medium hover:underline text-[11px] mt-1 block">
                    Go to Hierarchy Builder →
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!triggering && (
                <button onClick={() => setStep(2)} className="btn-ghost btn btn-sm">← Back</button>
              )}
              <div className="flex-1 space-y-1.5">
                <button
                  disabled={triggering}
                  onClick={handleTrigger}
                  className="btn-primary btn w-full"
                >
                  {triggering
                    ? <><Loader2 size={15} className="animate-spin" /> Triggering…</>
                    : <><Smartphone size={15} /> Trigger Build</>
                  }
                </button>
                {/* FIX 7: Consequence text */}
                <p className="text-[11px] text-secondary text-center leading-snug">
                  Triggering starts the build pipeline immediately. You will be notified when iOS and Android builds are ready for store submission.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Build Status Card ─────────────────────────────────────────────────────────

function BuildCard({ build, onViewDetails, onRetrigger }) {
  const isFailed   = build.status === 'failed' || build.iosStatus === 'failed' || build.androidStatus === 'failed'
  const stageInfo  = getBuildStageInfo(build)

  return (
    <div className={`card p-5 space-y-3 border-l-4 ${isFailed ? 'border-l-danger' : stageInfo ? 'border-l-teal' : 'border-l-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-primary leading-tight">{build.communityName}</p>
        <PlatformBadge platform={build.platform} />
      </div>

      {isFailed ? (
        <>
          <span className="badge badge-danger inline-flex items-center gap-1">
            <XCircle size={10} /> Build Failed
          </span>
          <div className="flex items-center gap-4 text-xs text-secondary">
            <span className="font-mono font-semibold text-primary">v{build.version}</span>
            <span>Failed: {fmtDate(build.completedAt || build.triggeredAt)}</span>
          </div>
          <p className="text-xs text-secondary">Triggered: {fmtDate(build.triggeredAt)}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onRetrigger?.(build)}
              className="btn btn-sm border border-danger text-danger hover:bg-danger/5 flex-1 text-xs"
            >
              Re-trigger Build
            </button>
            <button
              onClick={() => onViewDetails(build)}
              className="btn-ghost btn btn-sm border border-border hover:border-teal/40"
            >
              View Details
            </button>
          </div>
        </>
      ) : stageInfo ? (
        <>
          <div>
            <p className="text-sm font-semibold text-teal">
              {stageInfo.type === 'building'
                ? `Building — Step ${stageInfo.stage} of ${stageInfo.totalStages}: ${stageInfo.stageName}`
                : `In App Store Review — Day ${stageInfo.reviewDay} of ${stageInfo.totalDays}`}
            </p>
            <p className="text-xs text-secondary mt-0.5">
              {stageInfo.type === 'building'
                ? `Started ${stageInfo.startedAgo} · Est. ${stageInfo.estRemaining}`
                : `Est. approval ${stageInfo.estApproval}`}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-secondary">
            <span className="font-mono font-semibold text-primary">v{build.version}</span>
            <span>Triggered {fmtDate(build.triggeredAt)}</span>
          </div>
          <button
            onClick={() => onViewDetails(build)}
            className="btn-ghost btn btn-sm w-full border border-border hover:border-teal/40"
          >
            View Details <ChevronRight size={13} />
          </button>
        </>
      ) : (
        <>
          <div className={`flex items-center gap-2 ${STATUS_META[build.status]?.cardCls ?? 'text-success'}`}>
            {(() => { const Icon = STATUS_META[build.status]?.icon ?? CheckCircle2; const spin = STATUS_META[build.status]?.spin; return <Icon size={15} className={`flex-shrink-0 ${spin ? 'animate-spin' : ''}`} /> })()}
            <span className="text-sm font-semibold">Live on App Store</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-secondary">
            <span className="font-mono font-semibold text-primary">v{build.version}</span>
            <span>Triggered {fmtDate(build.triggeredAt)}</span>
          </div>
          <button
            onClick={() => onViewDetails(build)}
            className="btn-ghost btn btn-sm w-full border border-border hover:border-teal/40"
          >
            View Details <ChevronRight size={13} />
          </button>
        </>
      )}
    </div>
  )
}

// Card for tenants with no build triggered
function NoBuildCard({ tenant, onTrigger }) {
  const daysSinceCreated = tenant.createdAt
    ? Math.floor((Date.now() - new Date(tenant.createdAt).getTime()) / 86400000)
    : null

  return (
    <div className="card p-5 space-y-3 border-l-4 border-l-amber">
      <p className="text-sm font-bold text-primary leading-tight">{tenant.name}</p>
      <span className="badge badge-amber inline-block">No Build Triggered</span>
      <div className="text-xs text-secondary space-y-0.5">
        <p>{tenant.type ?? 'Community'} · {tenant.plan ?? 'Starter'}</p>
        {daysSinceCreated !== null
          ? <p>Created {daysSinceCreated} days ago — no app yet</p>
          : <p>No app build triggered yet</p>}
      </div>
      <button
        onClick={() => onTrigger(tenant.id)}
        className="btn btn-primary btn-sm w-full text-xs"
      >
        Trigger Build →
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AppDeploymentPage() {
  const loading          = useLoading(220)
  const navigate         = useNavigate()
  const location         = useLocation()

  const [builds,       setBuilds]       = useState(seedBuilds)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [statusFilter, setStatusFilter] = useState([])
  const [tenantFilter, setTenantFilter] = useState('all')
  const [prefillTenant, setPrefillTenant] = useState(null)
  const [page,         setPage]         = useState(1)

  const BUILDS_PER_PAGE = 10

  // Support re-trigger from detail page
  useEffect(() => {
    if (location.state?.retrigger) {
      setPrefillTenant(location.state.retrigger)
      setModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const STATUS_OPTIONS = [
    { value: 'live',          label: 'Live' },
    { value: 'building',      label: 'Building' },
    { value: 'in_review',     label: 'In Review' },
    { value: 'failed',        label: 'Failed' },
    { value: 'not_triggered', label: 'Not Triggered' },
  ]

  // Tenants with no build at all
  const tenantsWithNoBuilds = tenants.filter(t => !builds.find(b => b.tenantId === t.id))

  const isNotTriggeredOnly = statusFilter.length === 1 && statusFilter.includes('not_triggered')

  const filteredBuilds = isNotTriggeredOnly ? [] : builds.filter(b => {
    const okStatus = statusFilter.length === 0 || statusFilter.every(s => s === 'not_triggered') ||
      statusFilter.filter(s => s !== 'not_triggered').some(s =>
        b.status === s || b.iosStatus === s || b.androidStatus === s
      ) || (statusFilter.filter(s => s !== 'not_triggered').length === 0)
    const okTenant = tenantFilter === 'all' || b.tenantId === tenantFilter
    return okStatus && okTenant
  })

  const pagedBuilds = filteredBuilds.slice((page - 1) * BUILDS_PER_PAGE, page * BUILDS_PER_PAGE)

  // Attention cards: failed > building/in_review > no build (priority order, max 3)
  const failedBuilds    = builds.filter(b => b.status === 'failed' || b.iosStatus === 'failed' || b.androidStatus === 'failed')
  const inProgressBuilds = builds.filter(b => {
    const isFailed = b.status === 'failed' || b.iosStatus === 'failed' || b.androidStatus === 'failed'
    return !isFailed && (b.status === 'building' || b.status === 'in_review' || b.iosStatus === 'building' || b.iosStatus === 'in_review')
  })
  const attentionItems = [
    ...failedBuilds.map(b => ({ type: 'build', data: b })),
    ...inProgressBuilds.map(b => ({ type: 'build', data: b })),
    ...tenantsWithNoBuilds.map(t => ({ type: 'no_build', data: t })),
  ].slice(0, 3)
  const allHealthy = attentionItems.length === 0
  const liveCount  = builds.filter(b => b.status === 'live').length

  const handleViewDetails = (build) => {
    navigate(`/admin/app-deployment/${build.id}`, { state: { build } })
  }

  return (
    <div className="p-3 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-primary">App Deployment</h1>
          <p className="text-secondary text-sm mt-0.5">{builds.length} builds total</p>
        </div>
        <button onClick={() => { setPrefillTenant(null); setModalOpen(true) }} className="btn-primary btn">
          <Plus size={16} /> Trigger New Build
        </button>
      </div>

      {/* ── Attention cards / Healthy banner ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : allHealthy ? (
        <div className="flex items-center gap-3 h-10 px-5 bg-success text-white text-sm font-semibold rounded-card">
          <CheckCircle2 size={15} />
          All builds healthy — {liveCount} live, 0 failed, 0 pending
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attentionItems.map((item, i) =>
            item.type === 'build'
              ? <BuildCard
                  key={item.data.id}
                  build={item.data}
                  onViewDetails={handleViewDetails}
                  onRetrigger={b => { setPrefillTenant(b.tenantId); setModalOpen(true) }}
                />
              : <NoBuildCard
                  key={item.data.id}
                  tenant={item.data}
                  onTrigger={id => { setPrefillTenant(id); setModalOpen(true) }}
                />
          )}
        </div>
      )}

      {/* ── Filters ── */}
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
            key: 'tenant',
            label: 'Community',
            value: tenantFilter,
            onChange: v => { setTenantFilter(v); setPage(1) },
            options: [
              { value: 'all', label: 'All Communities' },
              ...tenants.map(t => ({ value: t.id, label: t.name })),
            ],
          },
        ]}
      />

      {/* ── All builds table ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-primary">All Builds</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left">Community</th>
                <th className="th text-left">Version</th>
                <th className="th text-center">iOS Status</th>
                <th className="th text-center">Android Status</th>
                <th className="th text-left">Triggered</th>
                <th className="th text-left">Completed</th>
                <th className="th text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : filteredBuilds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td text-center text-secondary py-10">
                    No builds match your filters.
                  </td>
                </tr>
              ) : isNotTriggeredOnly ? (
                tenantsWithNoBuilds.length === 0 ? (
                  <tr><td colSpan={7} className="td text-center text-secondary py-10">All tenants have builds triggered.</td></tr>
                ) : tenantsWithNoBuilds.map(t => (
                  <tr key={t.id} className="tr bg-amber/5">
                    <td className="td px-4 font-semibold text-primary">{t.name}</td>
                    <td className="td px-4"><span className="badge badge-gray text-xs">{t.type ?? '—'}</span></td>
                    <td className="td px-4 text-center" colSpan={2}><span className="badge badge-teal text-xs">{t.plan ?? 'Starter'}</span></td>
                    <td className="td px-4 text-secondary text-sm">{t.createdAt ? fmtDate(t.createdAt) : '—'}</td>
                    <td className="td px-4"><span className="badge badge-amber text-xs">No build</span></td>
                    <td className="td px-4 text-center">
                      <button
                        onClick={() => { setPrefillTenant(t.id); setModalOpen(true) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-teal hover:bg-teal/8 transition-colors mx-auto"
                      >
                        Trigger Build → <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                pagedBuilds.map(b => (
                  <tr key={b.id} className="tr">
                    <td className="td px-4 font-semibold">{b.communityName}</td>
                    <td className="td px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">v{b.version}</span>
                        <PlatformBadge platform={b.platform} />
                      </div>
                    </td>
                    <td className="td px-4 text-center">
                      {b.iosStatus
                        ? <StatusBadge status={b.iosStatus} size="sm" />
                        : <span className="text-secondary text-xs">—</span>}
                    </td>
                    <td className="td px-4 text-center">
                      {b.androidStatus
                        ? <StatusBadge status={b.androidStatus} size="sm" />
                        : <span className="text-secondary text-xs">—</span>}
                    </td>
                    <td className="td px-4 text-secondary text-sm whitespace-nowrap">
                      {fmtDate(b.triggeredAt)}
                    </td>
                    <td className="td px-4 text-sm whitespace-nowrap">
                      {b.completedAt ? (
                        <span className="text-secondary">{fmtDate(b.completedAt)}</span>
                      ) : (() => {
                        const si = getBuildStageInfo(b)
                        if (si?.type === 'building')  return <span className="text-teal text-xs">Est. {si.estRemaining}</span>
                        if (si?.type === 'in_review') return <span className="text-teal text-xs">Est. {si.estApproval}</span>
                        return <span className="flex items-center gap-1 text-teal"><Loader2 size={12} className="animate-spin" /> In progress</span>
                      })()}
                    </td>
                    <td className="td px-4 text-center">
                      <button
                        onClick={() => handleViewDetails(b)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium
                                   text-teal hover:bg-teal/8 transition-colors mx-auto"
                      >
                        View Details <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBuilds.length > BUILDS_PER_PAGE && (
        <Pagination page={page} total={filteredBuilds.length} perPage={BUILDS_PER_PAGE} onChange={setPage} />
      )}

      {/* ── Trigger Modal ── */}
      <TriggerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPrefillTenant(null) }}
        onTriggered={(b) => setBuilds(prev => [b, ...prev])}
        builds={builds}
        prefillTenantId={prefillTenant}
      />
    </div>
  )
}
