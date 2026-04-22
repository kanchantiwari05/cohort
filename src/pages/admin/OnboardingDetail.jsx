import { useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  AlertTriangle, Check, ChevronRight, MessageSquare,
  Flag, ExternalLink, Clock, Lock, Send, Phone, Mail, MessageCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { onboardings } from '../../data/onboarding'
import { SendNudgeModal } from './Onboarding'
import Modal from '../../components/Modal'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(from, to = new Date()) {
  return Math.max(0, Math.floor((new Date(to) - new Date(from)) / 86400000))
}

// Normalize "step-1-tenant-001" → "step-1"
function baseId(id) {
  if (!id) return id
  const parts = id.split('-')
  return `${parts[0]}-${parts[1]}`
}

// Which base step IDs must be done before this step unlocks
const STEP_DEPS = {
  'step-2':  ['step-1'],
  'step-3':  ['step-2'],
  'step-4':  ['step-3'],
  'step-5':  ['step-4'],
  'step-6':  ['step-5'],
  'step-7':  ['step-5'],
  'step-8':  ['step-6', 'step-7'],
  'step-9':  ['step-8'],
  'step-10': ['step-9'],
}

function isStepLocked(stepId, steps) {
  const deps = STEP_DEPS[baseId(stepId)] ?? []
  return deps.some(dep => {
    const depStep = steps.find(s => baseId(s.id) === dep)
    return depStep && !depStep.done
  })
}

function blockerLabels(stepId, steps) {
  const deps = STEP_DEPS[baseId(stepId)] ?? []
  return deps
    .filter(dep => {
      const s = steps.find(s => baseId(s.id) === dep)
      return s && !s.done
    })
    .map(dep => steps.find(s => baseId(s.id) === dep)?.label ?? dep)
}

function stepAction(stepId, tenantId) {
  const map = {
    'step-1':  { label: 'View Tenant',            to: `/admin/tenants/${tenantId}` },
    'step-2':  { label: 'Go to Branding',          to: `/admin/branding/${tenantId}` },
    'step-3':  { label: 'Go to Hierarchy Builder', to: '/admin/hierarchy' },
    'step-4':  { label: 'Go to Hierarchy Builder', to: '/admin/hierarchy' },
    'step-6':  { label: 'Go to Modules',           to: `/admin/tenants/${tenantId}` },
    'step-8':  { label: 'Go to App Deployment',    to: '/admin/app-deployment' },
    'step-9':  { label: 'Go to App Deployment',    to: '/admin/app-deployment' },
    'step-10': { label: 'Go to Health Monitor',    to: '/admin/health' },
  }
  return map[baseId(stepId)] ?? null
}

// ── CSA Handover Modal ────────────────────────────────────────────────────────

const DELIVERY_METHODS = [
  { value: 'otp_invite',  label: 'OTP Invite',  Icon: Phone,         desc: 'System sends an OTP invitation directly to the CSA mobile number' },
  { value: 'whatsapp',    label: 'WhatsApp',    Icon: MessageCircle, desc: 'PA manually sends login details via WhatsApp' },
  { value: 'email',       label: 'Email',       Icon: Mail,          desc: 'PA manually sends login details via email' },
]

function CSAHandoverModal({ open, onClose, csaName, csaPhone, csaEmail, onConfirm }) {
  const [method, setMethod] = useState('otp_invite')
  const [notes, setNotes]   = useState('')

  const handleConfirm = () => {
    onConfirm({ method, notes, deliveredTo: method === 'email' ? csaEmail : `+91 ${csaPhone}` })
    setMethod('otp_invite')
    setNotes('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log CSA Credential Delivery" maxWidth={480}>
      <div className="p-6 space-y-5">

        {/* CSA info strip */}
        <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card">
          <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-teal">{csaName?.[0] ?? 'C'}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{csaName}</p>
            <p className="text-xs text-secondary mt-0.5">+91 {csaPhone} · {csaEmail}</p>
          </div>
        </div>

        {/* Delivery method */}
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
            How were credentials delivered?
          </p>
          <div className="space-y-2">
            {DELIVERY_METHODS.map(({ value, label, Icon, desc }) => {
              const active = method === value
              return (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={`w-full flex items-start gap-3 p-3 rounded-card border text-left transition-colors
                    ${active ? 'border-teal bg-teal/5' : 'border-border hover:border-teal/30 hover:bg-surface'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    ${active ? 'border-teal bg-teal' : 'border-border'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                      <Icon size={13} className={active ? 'text-teal' : 'text-secondary'} />
                      {label}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">{desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
            Notes <span className="font-normal text-secondary">(optional)</span>
          </label>
          <textarea
            className="input"
            style={{ height: 'auto', paddingTop: 8, paddingBottom: 8, resize: 'none' }}
            rows={2}
            placeholder="e.g. Confirmed receipt on call"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost btn btn-sm flex-1">Cancel</button>
          <button onClick={handleConfirm} className="btn-primary btn btn-sm flex-1">
            <Send size={13} /> Confirm Delivery
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Step item ─────────────────────────────────────────────────────────────────

function StepItem({ step, isOverdue, isLocked, lockedBy, tenantId, isLast, onMarkDone, onNudge, onCSAHandover }) {
  const [expanding, setExpanding] = useState(false)
  const [note, setNote]           = useState('')

  const isCSAStep = baseId(step.id) === 'step-5'
  const stalled   = !step.done && !isLocked && isOverdue
  const action    = stepAction(step.id, tenantId)

  const confirmMark = () => {
    if (isCSAStep) {
      onCSAHandover(step)
    } else {
      onMarkDone(step.id, note)
      toast.success('Step marked as complete ✓')
    }
    setExpanding(false)
    setNote('')
  }

  // ── Locked state ──
  if (isLocked) {
    return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
          <div className="w-6 h-6 rounded-full border-2 border-border bg-surface flex items-center justify-center z-10 flex-shrink-0">
            <Lock size={10} className="text-border" />
          </div>
          {!isLast && <div className="w-px flex-1 mt-1 min-h-[20px] bg-border" />}
        </div>
        <div className={`flex-1 pb-7 ${isLast ? 'pb-2' : ''}`}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="opacity-45">
              <p className="text-sm font-semibold text-primary leading-tight">{step.label}</p>
              <p className="text-xs text-secondary mt-0.5 leading-snug">{step.description}</p>
            </div>
            <span className="badge badge-gray flex-shrink-0 text-[10px]">Locked</span>
          </div>
          {lockedBy?.length > 0 && (
            <p className="text-xs text-secondary mt-1 flex items-center gap-1 opacity-60">
              <Lock size={9} />
              Complete first: {lockedBy.join(' · ')}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── Normal state ──
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0
          ${step.done
            ? 'bg-success border-success'
            : stalled
              ? 'bg-white border-amber animate-pulse'
              : 'bg-white border-border'}`}>
          {step.done
            ? <Check size={12} className="text-white" />
            : stalled
              ? <AlertTriangle size={10} className="text-amber" />
              : <div className="w-2 h-2 rounded-full bg-border" />
          }
        </div>
        {!isLast && (
          <div className={`w-px flex-1 mt-1 min-h-[20px] ${step.done ? 'bg-success/30' : 'bg-border'}`} />
        )}
      </div>

      <div className={`flex-1 pb-7 ${isLast ? 'pb-2' : ''}`}>
        {/* Label row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className={`text-sm font-semibold leading-tight ${stalled ? 'text-amber-dark' : 'text-primary'}`}>
              {step.label}
            </p>
            <p className="text-xs text-secondary mt-0.5 leading-snug">{step.description}</p>
          </div>
          {step.done && <span className="badge badge-success flex-shrink-0 text-[10px]">Done</span>}
          {stalled && !step.done && <span className="badge badge-warning flex-shrink-0 text-[10px]">Stalled</span>}
        </div>

        {/* Completion metadata */}
        {step.done && (
          <p className="text-xs text-secondary mt-1.5">
            Completed {fmtDate(step.completedAt)} · by Jatin Dudhat
            {step.deliveryMethod && (
              <> · via {step.deliveryMethod === 'otp_invite' ? 'OTP Invite' : step.deliveryMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}</>
            )}
          </p>
        )}

        {stalled && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-dark">
            <AlertTriangle size={11} className="flex-shrink-0" />
            <span>Stalled — past target go-live date</span>
          </div>
        )}

        {!step.done && !stalled && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-secondary">
            <Clock size={11} className="flex-shrink-0" />
            <span>Pending</span>
          </div>
        )}

        {/* Action buttons */}
        {!step.done && !expanding && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {stalled && (
              <button
                onClick={() => onNudge(step)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-button text-xs font-medium
                           border border-amber/40 text-amber-dark hover:bg-amber/8 transition-colors"
              >
                <MessageSquare size={12} /> Send Nudge to CSA
              </button>
            )}
            <button
              onClick={() => setExpanding(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-button text-xs font-medium
                         bg-teal/10 text-teal hover:bg-teal/20 transition-colors border border-teal/20"
            >
              <Check size={12} /> Mark as Done
            </button>
            {action && (
              <Link to={action.to} className="flex items-center gap-1 text-xs text-teal hover:underline">
                {action.label} <ChevronRight size={11} />
              </Link>
            )}
          </div>
        )}

        {/* View link when done */}
        {step.done && action && (
          <Link to={action.to} className="flex items-center gap-1 text-xs text-secondary hover:text-teal mt-1.5 w-fit">
            View Details <ExternalLink size={10} />
          </Link>
        )}

        {/* Inline confirm */}
        {expanding && (
          <div className="mt-3 bg-surface border border-border rounded-card p-4 space-y-3">
            <p className="text-sm font-semibold text-primary">
              Mark "{step.label}" as complete?
            </p>
            {isCSAStep ? (
              <p className="text-xs text-secondary leading-relaxed">
                This will open the credential delivery log so you can record how you sent the CSA login details.
              </p>
            ) : (
              <textarea
                className="input"
                style={{ height: 'auto', paddingTop: 8, paddingBottom: 8, resize: 'none' }}
                rows={2}
                placeholder="Add a note… (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setExpanding(false); setNote('') }}
                className="btn-ghost btn btn-sm flex-1"
              >
                Cancel
              </button>
              <button onClick={confirmMark} className="btn-primary btn btn-sm flex-1">
                {isCSAStep
                  ? <><Send size={13} /> Log Delivery</>
                  : <><Check size={13} /> Mark Done</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const STATUS_META = {
  completed:   { label: 'Completed',   cls: 'badge-success' },
  in_progress: { label: 'In Progress', cls: 'badge-teal'    },
  stalled:     { label: 'Stalled',     cls: 'badge-warning' },
}

export default function OnboardingDetailPage() {
  const { onboardingId } = useParams()
  const { state }        = useLocation()
  const navigate         = useNavigate()

  const seed = state?.onb ?? onboardings.find(o => o.id === onboardingId)

  const [steps,           setSteps]           = useState(seed?.completedSteps ?? [])
  const [status,          setStatus]          = useState(seed?.status ?? 'in_progress')
  const [nudgeTarget,     setNudgeTarget]     = useState(null)
  const [markingAll,      setMarkingAll]      = useState(false)
  const [csaHandoverStep, setCSAHandoverStep] = useState(null)

  if (!seed) {
    return (
      <div className="p-3 space-y-4">
        <button onClick={() => navigate('/admin/onboarding')} className="btn-ghost btn btn-sm">
          ← Back
        </button>
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle size={28} className="text-amber mb-3" />
          <p className="text-base font-semibold text-primary">Onboarding not found</p>
        </div>
      </div>
    )
  }

  const doneCount  = steps.filter(s => s.done).length
  const total      = steps.length
  const pct        = Math.round((doneCount / total) * 100)
  const isComplete = doneCount === total

  const overdue  = status !== 'completed' && seed.targetGoLive && new Date(seed.targetGoLive) < new Date()
  const daysPast = overdue ? daysBetween(seed.targetGoLive) : 0

  const effectiveStatus = status === 'completed' ? 'completed' : overdue ? 'stalled' : 'in_progress'
  const meta = STATUS_META[effectiveStatus]

  const handleMarkDone = (stepId, note, extra = {}) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId
        ? { ...s, done: true, completedAt: new Date().toISOString().slice(0, 10), note, ...extra }
        : s
    ))
  }

  const handleCSAHandoverConfirm = ({ method, notes, deliveredTo }) => {
    if (!csaHandoverStep) return
    handleMarkDone(csaHandoverStep.id, notes, { deliveryMethod: method, deliveredTo })
    setCSAHandoverStep(null)
    toast.success('CSA credentials logged ✓')
  }

  const handleMarkAllComplete = () => {
    setStatus('completed')
    setSteps(prev => prev.map(s =>
      s.done ? s : { ...s, done: true, completedAt: new Date().toISOString().slice(0, 10) }
    ))
    setMarkingAll(false)
    toast.success(`${seed.communityName} onboarding marked complete ✓`)
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <button onClick={() => navigate('/admin/onboarding')} className="hover:text-teal transition-colors">
          Launch Tracker
        </button>
        <ChevronRight size={11} />
        <span className="text-primary font-medium">{seed?.communityName ?? 'Detail'}</span>
      </div>

      {/* ── Header card ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-[26px] font-bold text-primary leading-tight">{seed.communityName}</h1>
              <span className={`badge ${meta.cls}`}>{meta.label}</span>
            </div>
            <p className="text-sm text-secondary">
              Contract: {fmtDate(seed.contractDate)}
              {' · '}
              Target go-live: {fmtDate(seed.targetGoLive)}
              {seed.actualGoLive && ` · Went live: ${fmtDate(seed.actualGoLive)}`}
            </p>
            <p className="text-xs text-secondary mt-0.5">CSA: {seed.csaName}</p>
            {overdue && (
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-dark">
                <AlertTriangle size={12} />
                <span>{daysPast} day{daysPast !== 1 ? 's' : ''} past target go-live date</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {status !== 'completed' && (
              <button
                onClick={() => setNudgeTarget(steps.find(s => !s.done) ?? steps[0])}
                className="btn-ghost btn border border-border hover:border-amber/40 hover:text-amber-dark"
              >
                <MessageSquare size={14} /> Send Reminder
              </button>
            )}
            {isComplete && status !== 'completed' && (
              <button onClick={() => setMarkingAll(true)} className="btn-primary btn">
                <Flag size={14} /> Mark Complete
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">{pct}% complete</span>
            <span className="text-xs text-secondary">{doneCount} / {total} steps</span>
          </div>
          <div className="h-2.5 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? '#2E7D32' : overdue ? '#E6A817' : '#028090',
              }}
            />
          </div>
        </div>

        {/* Mark all complete confirmation */}
        {markingAll && (
          <div className="bg-success/5 border border-success/20 rounded-card p-4 space-y-3">
            <p className="text-sm font-semibold text-primary">
              Mark onboarding for {seed.communityName} as complete?
            </p>
            <p className="text-xs text-secondary">
              All remaining steps will be marked done and the onboarding checklist will be closed.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setMarkingAll(false)} className="btn-ghost btn btn-sm flex-1">Cancel</button>
              <button onClick={handleMarkAllComplete} className="btn-primary btn btn-sm flex-1">
                <Check size={13} /> Confirm Complete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-primary mb-6">Onboarding Steps</h2>
        <div>
          {steps.map((step, i) => {
            const locked   = !step.done && isStepLocked(step.id, steps)
            const blockers = locked ? blockerLabels(step.id, steps) : []
            return (
              <StepItem
                key={step.id}
                step={step}
                isOverdue={overdue}
                isLocked={locked}
                lockedBy={blockers}
                tenantId={seed.tenantId}
                isLast={i === steps.length - 1}
                onMarkDone={handleMarkDone}
                onNudge={s => setNudgeTarget(s)}
                onCSAHandover={step => setCSAHandoverStep(step)}
              />
            )
          })}
        </div>
      </div>

      {/* ── Send nudge modal ── */}
      {nudgeTarget && (
        <SendNudgeModal
          open
          onClose={() => setNudgeTarget(null)}
          csaName={seed.csaName}
          csaPhone={seed.csaPhone}
          stepLabel={nudgeTarget.label}
        />
      )}

      {/* ── CSA Handover modal ── */}
      {csaHandoverStep && (
        <CSAHandoverModal
          open
          onClose={() => setCSAHandoverStep(null)}
          csaName={seed.csaName}
          csaPhone={seed.csaPhone}
          csaEmail={seed.csaEmail ?? 'csa@community.in'}
          onConfirm={handleCSAHandoverConfirm}
        />
      )}

    </div>
  )
}
