import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, XCircle, Loader2, Clock,
  Apple, Play, ExternalLink, ChevronDown, ChevronUp,
  RefreshCw, AlertTriangle, RotateCcw, Check, X,
  Minus, Send, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { appBuilds } from '../../data/appBuilds'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_META = {
  live:      { label: 'Live',       cls: 'badge-success', text: 'text-success', icon: CheckCircle2, spin: false },
  building:  { label: 'Building',   cls: 'badge-teal',    text: 'text-teal',    icon: Loader2,      spin: true  },
  in_review: { label: 'In Review',  cls: 'badge-warning', text: 'text-warning', icon: Clock,        spin: false },
  failed:    { label: 'Failed',     cls: 'badge-danger',  text: 'text-danger',  icon: XCircle,      spin: false },
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { label: status, cls: 'badge-gray', icon: null, spin: false }
  const Icon = m.icon
  return (
    <span className={`badge ${m.cls} inline-flex items-center gap-1`}>
      {Icon && <Icon size={11} className={m.spin ? 'animate-spin' : ''} />}
      {m.label}
    </span>
  )
}

// ── Build log step ────────────────────────────────────────────────────────────

function LogStep({ label, state, last = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10
          ${state === 'done'    ? 'bg-success'
          : state === 'active'  ? 'bg-teal'
          : state === 'failed'  ? 'bg-danger'
          : 'bg-surface border-2 border-border'}`}
        >
          {state === 'done'   && <CheckCircle2 size={11} className="text-white" />}
          {state === 'active' && <Loader2      size={11} className="text-white animate-spin" />}
          {state === 'failed' && <XCircle      size={11} className="text-white" />}
        </div>
        {!last && (
          <div className={`w-px flex-1 mt-1 mb-0 min-h-[16px]
            ${state === 'done' ? 'bg-success/40' : 'bg-border'}`} />
        )}
      </div>
      <p className={`text-sm pb-4 leading-tight pt-0.5
        ${state === 'done'    ? 'text-primary'
        : state === 'active'  ? 'text-teal font-medium'
        : state === 'failed'  ? 'text-danger font-medium'
        : 'text-secondary'}`}>
        {label}
        {state === 'active' && <span className="ml-1.5 text-xs opacity-70">⏳</span>}
      </p>
    </div>
  )
}

// ── Log generators ────────────────────────────────────────────────────────────

const IOS_STEPS = [
  'Build started',
  'Dependencies installed',
  'Assets bundled',
  'IPA generated',
  'Submitted to App Store Connect',
  'Under App Store review',
  'Approved & Live',
]

const ANDROID_STEPS = [
  'Build started',
  'Gradle build',
  'APK/AAB generated',
  'Submitted to Play Console',
  'Approved & Live',
]

function stepsFor(labels, status) {
  // How many steps are "done" for each status
  const doneMap = {
    live:      labels.length,       // all
    in_review: labels.length - 2,   // all except last two
    building:  2,
    failed:    2,
  }
  const done = doneMap[status] ?? 0

  return labels.map((label, i) => {
    if (i < done) return { label, state: 'done' }
    if (i === done && status !== 'live') {
      return { label, state: status === 'failed' ? 'failed' : 'active' }
    }
    return { label, state: 'pending' }
  })
}

// ── QA Checklist ──────────────────────────────────────────────────────────────

const SMOKE_ITEMS = [
  { id: 'login',    label: 'OTP login flow',               detail: 'Enter phone number, receive OTP, authenticate successfully' },
  { id: 'otp',      label: 'OTP delivery',                 detail: 'OTP SMS delivered within 30 seconds on Airtel, Jio, Vi' },
  { id: 'dash',     label: 'Dashboard loads',              detail: 'All KPI cards, charts, and stat tiles render without error' },
  { id: 'nav',      label: 'Navigation',                   detail: 'All sidebar links navigate correctly; no broken routes' },
  { id: 'brand',    label: 'Branding',                     detail: 'Logo, primary color, font, and splash screen match uploaded assets' },
  { id: 'members',  label: 'Member directory',             detail: 'Member list loads; search and filters work correctly' },
  { id: 'rsvp',     label: 'RSVP flow',                    detail: 'Member can RSVP to a meeting/event; confirmation notification sent' },
  { id: 'referral', label: 'Referral submit',              detail: 'Member can log a referral; receiver receives in-app notification within 60s' },
  { id: 'attend',   label: 'Attendance marking',           detail: 'Level Admin can mark Present/Absent; records saved correctly' },
  { id: 'push',     label: 'Push notifications',           detail: 'Push notification received on both iOS and Android test devices' },
  { id: 'csa',      label: 'CSA portal access',            detail: 'Community Super Admin can log in and view full community dashboard' },
  { id: 'la',       label: 'Level Admin portal access',    detail: 'Level Admin can log in and see only their assigned node' },
]

// result: 'pass' | 'fail' | 'skip' | null
function QAChecklist({ buildStatus }) {
  const [open, setOpen]     = useState(true)
  const [results, setResults] = useState(() => {
    // Pre-populate based on build status for demo purposes
    if (buildStatus === 'live') {
      return Object.fromEntries(SMOKE_ITEMS.map(i => [i.id, { result: 'pass', note: '' }]))
    }
    // First 8 pass, rest null for in_review / building
    return Object.fromEntries(SMOKE_ITEMS.map((i, idx) => [
      i.id,
      { result: buildStatus === 'in_review' && idx < 8 ? 'pass' : null, note: '' },
    ]))
  })
  const [submitted, setSubmitted] = useState(buildStatus === 'live')
  const [expandedNote, setExpandedNote] = useState(null)

  const setResult = (id, result) => {
    setResults(prev => ({ ...prev, [id]: { ...prev[id], result } }))
  }
  const setNote = (id, note) => {
    setResults(prev => ({ ...prev, [id]: { ...prev[id], note } }))
  }

  const passCount = Object.values(results).filter(r => r.result === 'pass').length
  const failCount = Object.values(results).filter(r => r.result === 'fail').length
  const skipCount = Object.values(results).filter(r => r.result === 'skip').length
  const total     = SMOKE_ITEMS.length
  const allDone   = passCount + failCount + skipCount === total

  const allPassed = passCount === total

  const handleMarkAll = () => {
    setResults(Object.fromEntries(SMOKE_ITEMS.map(i => [i.id, { result: 'pass', note: '' }])))
  }

  const handleSubmit = () => {
    if (!allDone) {
      toast.error('Complete all items before submitting smoke test results')
      return
    }
    setSubmitted(true)
    if (allPassed) {
      toast.success('Smoke test passed — all checks cleared ✓')
    } else {
      toast.error(`Smoke test submitted with ${failCount} failure${failCount > 1 ? 's' : ''} — review required`)
    }
  }

  const RESULT_BTN = [
    { value: 'pass', icon: Check, label: 'Pass', active: 'bg-success text-white', inactive: 'text-secondary hover:text-success hover:bg-success/8' },
    { value: 'fail', icon: X,     label: 'Fail', active: 'bg-danger text-white',  inactive: 'text-secondary hover:text-danger hover:bg-danger/8'  },
    { value: 'skip', icon: Minus, label: 'Skip', active: 'bg-border text-primary', inactive: 'text-secondary hover:text-primary hover:bg-surface'  },
  ]

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <CheckCircle2 size={16} className="text-teal" />
          <span className="text-sm font-semibold text-primary">Smoke Test</span>

          {/* Result pills */}
          <span className={`badge ${passCount === total ? 'badge-success' : passCount > 0 ? 'badge-teal' : 'badge-gray'}`}>
            {passCount} passed
          </span>
          {failCount > 0 && <span className="badge badge-danger">{failCount} failed</span>}
          {skipCount > 0 && <span className="badge badge-gray">{skipCount} skipped</span>}
          {!allDone && (
            <span className="badge badge-warning">{total - passCount - failCount - skipCount} pending</span>
          )}
          {submitted && (
            <span className={`badge ${allPassed ? 'badge-success' : 'badge-danger'} font-semibold`}>
              {allPassed ? 'Submitted — All Clear' : 'Submitted — Review Required'}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-secondary" /> : <ChevronDown size={15} className="text-secondary" />}
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Bulk actions */}
          {!submitted && (
            <div className="flex items-center justify-between px-5 py-3 bg-surface/50 border-b border-border">
              <p className="text-xs text-secondary">{total - passCount - failCount - skipCount} items remaining</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAll}
                  className="btn-ghost btn btn-sm text-xs border border-border hover:border-success/40 hover:text-success"
                >
                  <Check size={11} /> Mark All Passed
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allDone}
                  className={`btn btn-sm text-xs flex items-center gap-1.5 ${allDone ? 'btn-primary' : 'btn-ghost opacity-50 cursor-not-allowed border border-border'}`}
                >
                  <Send size={11} /> Submit Results
                </button>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="divide-y divide-border">
            {SMOKE_ITEMS.map(item => {
              const r = results[item.id]
              const noteOpen = expandedNote === item.id

              return (
                <div key={item.id} className={`px-5 py-3.5 transition-colors
                  ${r.result === 'fail' ? 'bg-danger/3' : r.result === 'pass' ? 'bg-success/3' : ''}`}>

                  <div className="flex items-start gap-3">
                    {/* Status indicator */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${r.result === 'pass' ? 'bg-success/15'
                      : r.result === 'fail' ? 'bg-danger/15'
                      : r.result === 'skip' ? 'bg-border'
                      : 'bg-surface border border-border'}`}
                    >
                      {r.result === 'pass' && <Check  size={11} className="text-success" />}
                      {r.result === 'fail' && <X      size={11} className="text-danger"  />}
                      {r.result === 'skip' && <Minus  size={11} className="text-secondary" />}
                      {!r.result          && <Clock  size={11} className="text-secondary" />}
                    </div>

                    {/* Label + detail */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight ${r.result === 'fail' ? 'text-danger' : 'text-primary'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-secondary mt-0.5 leading-snug">{item.detail}</p>

                      {/* Note (fail or explicit expand) */}
                      {(r.result === 'fail' || noteOpen) && !submitted && (
                        <textarea
                          className="input mt-2 text-xs"
                          style={{ height: 'auto', paddingTop: 6, paddingBottom: 6, resize: 'none', minHeight: 56 }}
                          rows={2}
                          placeholder={r.result === 'fail' ? 'Describe the failure…' : 'Add a note…'}
                          value={r.note}
                          onChange={e => setNote(item.id, e.target.value)}
                        />
                      )}
                      {r.note && submitted && (
                        <p className="text-xs text-secondary italic mt-1">"{r.note}"</p>
                      )}
                    </div>

                    {/* Pass/Fail/Skip buttons */}
                    {!submitted && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {RESULT_BTN.map(btn => {
                          const BtnIcon = btn.icon
                          const isActive = r.result === btn.value
                          return (
                            <button
                              key={btn.value}
                              onClick={() => {
                                setResult(item.id, isActive ? null : btn.value)
                                if (btn.value !== 'fail') setExpandedNote(null)
                              }}
                              title={btn.label}
                              className={`w-7 h-7 rounded-button flex items-center justify-center transition-colors text-xs font-semibold border
                                ${isActive ? `${btn.active} border-transparent` : `border-border ${btn.inactive}`}`}
                            >
                              <BtnIcon size={12} />
                            </button>
                          )
                        })}
                        {/* Note toggle for non-fail items */}
                        {r.result !== 'fail' && (
                          <button
                            onClick={() => setExpandedNote(noteOpen ? null : item.id)}
                            title="Add note"
                            className="w-7 h-7 rounded-button flex items-center justify-center border border-border text-secondary hover:text-primary hover:bg-surface transition-colors"
                          >
                            <span className="text-[10px] font-bold">+</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Submitted state icon */}
                    {submitted && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${r.result === 'pass' ? 'bg-success/15'
                        : r.result === 'fail' ? 'bg-danger/15'
                        : 'bg-surface'}`}
                      >
                        {r.result === 'pass' && <Check size={12} className="text-success" />}
                        {r.result === 'fail' && <X     size={12} className="text-danger"  />}
                        {r.result === 'skip' && <Minus size={12} className="text-secondary" />}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit bar (bottom) */}
          {!submitted && allDone && (
            <div className={`px-5 py-4 border-t border-border flex items-center justify-between
              ${failCount > 0 ? 'bg-danger/5' : 'bg-success/5'}`}>
              <div>
                <p className={`text-sm font-semibold ${failCount > 0 ? 'text-danger' : 'text-success'}`}>
                  {failCount > 0
                    ? `${failCount} failure${failCount > 1 ? 's' : ''} found — review before submitting`
                    : 'All checks complete — ready to submit'}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {passCount} passed · {failCount} failed · {skipCount} skipped
                </p>
              </div>
              <button onClick={handleSubmit} className={`btn btn-sm flex items-center gap-1.5 ${failCount > 0 ? 'btn-danger' : 'btn-primary'}`}>
                <Send size={13} /> Submit Results
              </button>
            </div>
          )}

          {/* Build complete success card */}
          {submitted && allPassed && (
            <div className="mx-5 mb-5 mt-3 rounded-card bg-success/8 border border-success/25 px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} className="text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-success">Build Complete — All Checks Passed</p>
                <p className="text-xs text-secondary mt-0.5">
                  {passCount} of {total} smoke test items cleared. The build is ready for store submission.
                </p>
              </div>
            </div>
          )}

          {submitted && failCount > 0 && (
            <div className="mx-5 mb-5 mt-3 rounded-card bg-danger/8 border border-danger/25 px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-danger/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-danger">{failCount} Check{failCount > 1 ? 's' : ''} Failed — Review Required</p>
                <p className="text-xs text-secondary mt-0.5">
                  Fix the failures above before proceeding to store submission.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Store Status Modal ────────────────────────────────────────────────────────

function StoreStatusModal({ open, onClose, platform, onConfirm }) {
  const [newStatus, setNewStatus] = useState(null)   // 'live' | 'rejected'
  const [reason,    setReason]    = useState('')
  const [resolution, setResolution] = useState('')

  const handleConfirm = () => {
    if (!newStatus) return
    onConfirm({ status: newStatus, reason, resolution })
    setNewStatus(null)
    setReason('')
    setResolution('')
    onClose()
  }

  const canConfirm = newStatus === 'live' || (newStatus === 'rejected' && reason.trim())

  return (
    <Modal open={open} onClose={onClose} title={`Update Store Status — ${platform}`} maxWidth={460}>
      <div className="p-6 space-y-5">

        {/* Status picker */}
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
            New Status
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'live',     label: 'Approved & Live', icon: CheckCircle2, color: 'text-success', border: 'border-success', bg: 'bg-success/5' },
              { value: 'rejected', label: 'Rejected',        icon: XCircle,      color: 'text-danger',  border: 'border-danger',  bg: 'bg-danger/5'  },
            ].map(({ value, label, icon: Icon, color, border, bg }) => {
              const active = newStatus === value
              return (
                <button
                  key={value}
                  onClick={() => setNewStatus(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-card border-2 transition-colors
                    ${active ? `${border} ${bg}` : 'border-border hover:border-border/70 hover:bg-surface'}`}
                >
                  <Icon size={22} className={active ? color : 'text-secondary'} />
                  <span className={`text-sm font-semibold ${active ? color : 'text-secondary'}`}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Rejection reason — shown only when rejected */}
        {newStatus === 'rejected' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Rejection Reason <span className="text-danger">*</span>
              </label>
              <textarea
                className="input"
                style={{ height: 'auto', paddingTop: 8, paddingBottom: 8, resize: 'none' }}
                rows={3}
                placeholder="e.g. Guideline 4.3 — Spam / Copycats: App appears to be a duplicate of an existing app…"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Resolution Plan <span className="font-normal text-secondary">(optional)</span>
              </label>
              <textarea
                className="input"
                style={{ height: 'auto', paddingTop: 8, paddingBottom: 8, resize: 'none' }}
                rows={2}
                placeholder="e.g. Update app description to highlight unique features, resubmit with updated metadata…"
                value={resolution}
                onChange={e => setResolution(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost btn btn-sm flex-1">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`btn btn-sm flex-1 flex items-center gap-1.5
              ${canConfirm
                ? newStatus === 'rejected' ? 'btn-danger' : 'btn-primary'
                : 'btn-ghost opacity-40 cursor-not-allowed border border-border'}`}
          >
            <Check size={13} /> Confirm Update
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Platform column ───────────────────────────────────────────────────────────

function PlatformColumn({ title, icon: Icon, iconClass, status, submittedAt, approvedAt, reviewDays, storeLink, storeLinkLabel, consoleLink, consoleLinkLabel, logSteps, rejection, onUpdateStatus }) {
  if (!status) {
    return (
      <div className="card p-5 flex items-center justify-center text-secondary text-sm">
        Not included in this build
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={iconClass} />
          <span className="text-sm font-bold text-primary">{title}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Meta info */}
      <div className="space-y-1.5 text-sm">
        {submittedAt && (
          <div className="flex gap-2">
            <span className="text-secondary w-28 flex-shrink-0">Submitted</span>
            <span className="text-primary font-medium">{fmtDate(submittedAt)}</span>
          </div>
        )}
        {approvedAt && (
          <div className="flex gap-2">
            <span className="text-secondary w-28 flex-shrink-0">Approved</span>
            <span className="text-success font-medium">{fmtDate(approvedAt)}</span>
          </div>
        )}
        {reviewDays && (
          <div className="flex gap-2">
            <span className="text-secondary w-28 flex-shrink-0">Review time</span>
            <span className="text-primary font-medium">{reviewDays} day{reviewDays !== 1 ? 's' : ''}</span>
          </div>
        )}
        {status === 'in_review' && (
          <div className="flex gap-2">
            <span className="text-secondary w-28 flex-shrink-0">Est. approval</span>
            <span className="text-amber-dark font-medium">7–14 days</span>
          </div>
        )}
      </div>

      {/* Rejection card */}
      {status === 'failed' && rejection?.reason && (
        <div className="bg-danger/5 border border-danger/20 rounded-card p-3 space-y-2">
          <p className="text-xs font-semibold text-danger flex items-center gap-1.5">
            <X size={12} /> Rejected by {title === 'iOS' ? 'App Store' : 'Play Store'}
          </p>
          <p className="text-xs text-primary leading-relaxed">{rejection.reason}</p>
          {rejection.resolution && (
            <>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mt-2">Resolution Plan</p>
              <p className="text-xs text-secondary leading-relaxed">{rejection.resolution}</p>
            </>
          )}
        </div>
      )}

      {/* Build log */}
      <div>
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">Build Log</p>
        <div>
          {logSteps.map((step, i) => (
            <LogStep
              key={step.label}
              label={step.label}
              state={step.state}
              last={i === logSteps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2 pt-1">
        {consoleLink && (
          <a
            href={consoleLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn btn-sm w-full border border-border hover:border-teal/40"
          >
            {consoleLinkLabel} <ExternalLink size={12} />
          </a>
        )}
        {storeLink && (
          <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn btn-sm w-full border border-border hover:border-teal/40"
          >
            {storeLinkLabel} <ExternalLink size={12} />
          </a>
        )}
        {/* Update status button — shown when in review */}
        {status === 'in_review' && onUpdateStatus && (
          <button
            onClick={onUpdateStatus}
            className="btn-ghost btn btn-sm w-full border border-teal/40 text-teal hover:bg-teal/5"
          >
            <RefreshCw size={12} /> Update Store Status
          </button>
        )}
        {/* Re-submit button — shown when rejected */}
        {status === 'failed' && onUpdateStatus && (
          <button
            onClick={onUpdateStatus}
            className="btn-ghost btn btn-sm w-full border border-danger/30 text-danger hover:bg-danger/5"
          >
            <RotateCcw size={12} /> Resubmit After Fix
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AppBuildDetailPage() {
  const { buildId }   = useParams()
  const { state }     = useLocation()
  const navigate      = useNavigate()

  const build = state?.build ?? appBuilds.find(b => b.id === buildId)

  const [platformStatuses, setPlatformStatuses] = useState({})   // { ios, android }
  const [rejections,       setRejections]       = useState({})   // { ios: { reason, resolution }, android: ... }
  const [statusModal,      setStatusModal]      = useState(null) // 'ios' | 'android' | null

  const iosStatus     = platformStatuses.ios     ?? build?.iosStatus
  const androidStatus = platformStatuses.android ?? build?.androidStatus

  const handleStatusConfirm = ({ status, reason, resolution }) => {
    const platform = statusModal
    setPlatformStatuses(prev => ({ ...prev, [platform]: status === 'rejected' ? 'failed' : status }))
    if (status === 'rejected') {
      setRejections(prev => ({ ...prev, [platform]: { reason, resolution } }))
      toast.error(`${platform === 'ios' ? 'iOS' : 'Android'} build rejected — review rejection reason`)
    } else {
      setRejections(prev => ({ ...prev, [platform]: null }))
      toast.success(`${platform === 'ios' ? 'iOS' : 'Android'} build marked as Live ✓`)
    }
    setStatusModal(null)
  }

  if (!build) {
    return (
      <div className="p-3 space-y-4">
        <button onClick={() => navigate('/admin/app-deployment')} className="btn-ghost btn btn-sm">
          ← Back to App Deployment
        </button>
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <XCircle size={32} className="text-danger mb-3" />
          <p className="text-base font-semibold text-primary">Build not found</p>
          <p className="text-secondary text-sm mt-1">Build ID: {buildId}</p>
        </div>
      </div>
    )
  }

  const overallMeta = STATUS_META[build.status] ?? STATUS_META.building
  const OverallIcon = overallMeta.icon

  const handleRetrigger = () => {
    navigate('/admin/app-deployment', { state: { retrigger: build.tenantId } })
  }

  const handleMarkFailed = () => {
    toast.error(`Build ${build.id} marked as failed`)
    navigate('/admin/app-deployment')
  }

  return (
    <div className="space-y-6 p-3">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <button onClick={() => navigate('/admin/app-deployment')} className="hover:text-teal transition-colors">
          App Deployment
        </button>
        <ChevronRight size={11} />
        <span className="text-primary font-medium">Build #{build.id}</span>
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[28px] font-bold text-primary">{build.communityName}</h1>
            <span className={`badge ${overallMeta.cls} text-sm px-3 py-1 flex items-center gap-1.5`}>
              <OverallIcon size={13} className={overallMeta.spin ? 'animate-spin' : ''} />
              {overallMeta.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="font-mono text-sm bg-surface border border-border rounded-button px-2.5 py-1 text-primary font-semibold">
              v{build.version}
            </span>
            <span className="text-xs text-secondary font-mono">{build.id.toUpperCase()}</span>
            <span className="text-xs text-secondary">Triggered {fmtDate(build.triggeredAt)}</span>
            {build.completedAt && (
              <span className="text-xs text-secondary">Completed {fmtDate(build.completedAt)}</span>
            )}
          </div>
          {build.buildNotes && (
            <p className="text-sm text-secondary mt-2">{build.buildNotes}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRetrigger}
            className="btn-ghost btn border border-border hover:border-teal/40"
          >
            <RotateCcw size={14} /> Re-trigger Build
          </button>
          <button
            onClick={handleMarkFailed}
            className="btn-ghost btn border border-danger/40 text-danger hover:bg-danger/5 hover:text-danger"
          >
            <AlertTriangle size={14} /> Mark as Failed
          </button>
        </div>
      </div>

      {/* ── Platform columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PlatformColumn
          title="iOS"
          icon={Apple}
          iconClass="text-navy"
          status={iosStatus}
          submittedAt={build.triggeredAt}
          approvedAt={iosStatus === 'live' && build.completedAt ? build.completedAt : null}
          reviewDays={build.iosReviewDays}
          logSteps={stepsFor(IOS_STEPS, iosStatus ?? 'building')}
          consoleLink={build.iosStatus ? 'https://appstoreconnect.apple.com' : null}
          consoleLinkLabel="View in App Store Connect"
          storeLink={build.iosLink}
          storeLinkLabel="App Store Link"
          rejection={rejections.ios}
          onUpdateStatus={() => setStatusModal('ios')}
        />
        <PlatformColumn
          title="Android"
          icon={Play}
          iconClass="text-success"
          status={androidStatus}
          submittedAt={build.triggeredAt}
          approvedAt={androidStatus === 'live' ? (() => {
            const d = new Date(build.triggeredAt)
            d.setDate(d.getDate() + (build.androidReviewDays ?? 1))
            return d.toISOString().slice(0, 10)
          })() : null}
          reviewDays={build.androidReviewDays}
          logSteps={stepsFor(ANDROID_STEPS, androidStatus ?? 'building')}
          consoleLink={build.androidStatus ? 'https://play.google.com/console' : null}
          consoleLinkLabel="View on Play Console"
          storeLink={build.androidLink}
          storeLinkLabel="Play Store Link"
          rejection={rejections.android}
          onUpdateStatus={() => setStatusModal('android')}
        />
      </div>

      {/* ── Smoke Test ── */}
      <QAChecklist buildStatus={build.status} />

      {/* ── Store Status Modal ── */}
      {statusModal && (
        <StoreStatusModal
          open
          onClose={() => setStatusModal(null)}
          platform={statusModal === 'ios' ? 'iOS' : 'Android'}
          onConfirm={handleStatusConfirm}
        />
      )}

    </div>
  )
}
