import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Plus, Globe, Shield, Zap, CheckCircle2, XCircle,
  Loader2, Copy, Check, AlertTriangle, Eye, Pencil, Trash2,
  ExternalLink, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { domains as initialDomains, takenSubdomains } from '../../data/domains'
import { tenants, COMMUNITY_TYPES } from '../../data/tenants'
import Modal from '../../components/Modal'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonRow } from '../../components/Skeleton'
import ViewToggle from '../../components/ViewToggle'
import Pagination from '../../components/Pagination'
import FilterBar from '../../components/FilterBar'
import Select from '../../components/Select'

const DOMAINS_PER_PAGE = 9

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  active:      'badge-success',
  pending_dns: 'badge-warning',
  suspended:   'badge-danger',
}
const STATUS_LABEL = {
  active:      'Active',
  pending_dns: 'Pending DNS',
  suspended:   'Suspended',
}
const PROVISION_STEPS = [
  'Registering subdomain…',
  'Configuring SSL certificate…',
  'Setting up CDN rules…',
  'Final verification…',
]
const PROVISION_DELAYS = [300, 500, 400, 300]  // ms per step

function typeLabel(type) {
  return COMMUNITY_TYPES.find(c => c.value === type)?.label ?? type
}

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SSLIcon({ status }) {
  if (status === 'active')
    return <CheckCircle2 size={15} className="text-success mx-auto" />
  if (status === 'pending')
    return <Loader2 size={15} className="text-warning animate-spin mx-auto" />
  return <XCircle size={15} className="text-danger mx-auto" />
}

function CDNIcon({ status }) {
  if (status === 'active')
    return <CheckCircle2 size={15} className="text-success mx-auto" />
  return <XCircle size={15} className="text-danger mx-auto" />
}

// ── Revoke Modal ──────────────────────────────────────────────────────────────
function RevokeModal({ domain, open, onClose, onConfirm }) {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  if (!domain) return null
  const match = typed === domain.fullDomain

  return (
    <Modal open={open} onClose={onClose} title="Revoke Domain" maxWidth={480}>
      <div className="p-6 space-y-5">
        {/* Warning block */}
        <div className="bg-danger/5 border border-danger/20 rounded-card p-4 flex gap-3">
          <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-danger">
              Revoke {domain.fullDomain}?
            </p>
            <p className="text-sm text-secondary mt-1">
              This will immediately make the domain inaccessible.
              All members of <span className="font-medium text-primary">{domain.communityName}</span> will
              lose access. <span className="font-semibold text-danger">This cannot be undone.</span>
            </p>
          </div>
        </div>

        {/* Type to confirm */}
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
            Type the domain to confirm
          </label>
          <input
            type="text"
            className="input font-mono"
            placeholder={domain.fullDomain}
            value={typed}
            onChange={e => setTyped(e.target.value)}
            spellCheck={false}
            autoFocus
          />
          {typed.length > 0 && !match && (
            <p className="text-xs text-danger mt-1.5">
              Doesn't match — type exactly: <span className="font-mono">{domain.fullDomain}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost btn flex-1">
            Cancel
          </button>
          <button
            disabled={!match}
            onClick={onConfirm}
            className="btn-danger btn flex-1"
          >
            <Trash2 size={15} /> Revoke Domain
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Provision Modal ───────────────────────────────────────────────────────────
function ProvisionModal({ open, onClose, takenTenantIds, onProvisioned }) {
  const [step,           setStep]           = useState(1)
  const [tenantId,       setTenantId]       = useState('')
  const [subdomain,      setSubdomain]      = useState('')
  const [checking,       setChecking]       = useState(false)
  const [availability,   setAvailability]   = useState(null)   // null | 'available' | 'taken'
  const [validationErr,  setValidationErr]  = useState('')
  const [useCustom,      setUseCustom]      = useState(false)
  const [customDomain,   setCustomDomain]   = useState('')
  const [copiedDNS,      setCopiedDNS]      = useState(false)
  const [provisioning,   setProvisioning]   = useState(false)
  const [doneSteps,      setDoneSteps]      = useState([])     // array of completed step indices
  const debounceRef = useRef(null)

  // Reset all on open/close
  useEffect(() => {
    if (!open) {
      setStep(1); setTenantId(''); setSubdomain('')
      setChecking(false); setAvailability(null); setValidationErr('')
      setUseCustom(false); setCustomDomain(''); setCopiedDNS(false)
      setProvisioning(false); setDoneSteps([])
    }
  }, [open])

  // Validation rules
  const validate = (val) => {
    if (!val) return ''
    if (val.length < 3)  return 'Minimum 3 characters'
    if (val.length > 50) return 'Maximum 50 characters'
    if (!/^[a-z0-9-]+$/.test(val)) return 'Only lowercase letters, numbers, hyphens'
    if (val.startsWith('-') || val.endsWith('-')) return 'Cannot start or end with hyphen'
    return ''
  }

  // Debounced availability check
  const checkAvailability = useCallback((value) => {
    clearTimeout(debounceRef.current)
    const err = validate(value)
    setValidationErr(err)
    if (!value || err) { setAvailability(null); setChecking(false); return }
    setChecking(true)
    setAvailability(null)
    debounceRef.current = setTimeout(() => {
      const taken = takenSubdomains.includes(value.toLowerCase())
      setAvailability(taken ? 'taken' : 'available')
      setChecking(false)
    }, 800)
  }, [])

  const handleSubdomainChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(clean)
    checkAvailability(clean)
  }

  const handleProvision = async () => {
    setProvisioning(true)
    for (let i = 0; i < PROVISION_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, PROVISION_DELAYS[i]))
      setDoneSteps(prev => [...prev, i])
    }
    await new Promise(r => setTimeout(r, 200))
    setStep('done')
    setProvisioning(false)
    onProvisioned?.({ tenantId, subdomain, customDomain: useCustom ? customDomain : null })
  }

  const copyDNS = () => {
    navigator.clipboard.writeText(`CNAME: ${customDomain || 'your-domain'} → cnp.app`)
    setCopiedDNS(true)
    setTimeout(() => setCopiedDNS(false), 2000)
    toast.success('DNS record copied!')
  }

  const selectedTenant = tenants.find(t => t.id === tenantId)
  const fullDomain = `${subdomain}.cnp.app`

  return (
    <Modal open={open} onClose={onClose} title="Provision New Domain" maxWidth={600}>
      {/* Step indicator */}
      {step !== 'done' && (
        <div className="px-6 pt-5">
          <div className="flex items-center gap-0">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${step > n
                      ? 'bg-success text-white'
                      : step === n
                        ? 'bg-teal text-white'
                        : 'bg-border text-secondary'}`}>
                    {step > n ? <Check size={13} /> : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block
                    ${step === n ? 'text-teal' : step > n ? 'text-success' : 'text-secondary'}`}>
                    {['Select Community', 'Choose Domain', 'Review & Provision'][n - 1]}
                  </span>
                </div>
                {n < 3 && (
                  <div className={`flex-1 h-px mx-3 ${step > n ? 'bg-success' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">

        {/* ── STEP 1: Community ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Select
                label="Which community is this domain for?"
                searchable
                value={tenantId}
                onChange={v => setTenantId(v)}
                placeholder="Select a community…"
                options={[
                  { value: '', label: 'Select a community…' },
                  ...tenants.map(t => {
                    const hasDomain = takenTenantIds.includes(t.id)
                    const existingDomain = hasDomain
                      ? initialDomains.find(d => d.tenantId === t.id)?.fullDomain
                      : null
                    return {
                      value: t.id,
                      label: `${t.name} — ${typeLabel(t.type)}${hasDomain ? ` (domain: ${existingDomain})` : ''}`,
                    }
                  }),
                ]}
              />
            </div>

            {selectedTenant && (
              <div className="bg-surface border border-border rounded-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-button bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <Globe size={18} className="text-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{selectedTenant.name}</p>
                  <p className="text-xs text-secondary mt-0.5">
                    {typeLabel(selectedTenant.type)} · {selectedTenant.memberCount} members
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={!tenantId}
              onClick={() => setStep(2)}
              className="btn-primary btn w-full"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: Domain input ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Subdomain bar */}
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-2">
                Choose a subdomain
              </label>
              <div
                className="flex items-center border-2 border-border rounded-button overflow-hidden
                           focus-within:border-teal transition-colors"
                style={{ height: 52 }}
              >
                <span className="px-3 text-secondary bg-surface border-r border-border h-full
                                 flex items-center select-none whitespace-nowrap text-sm">
                  https://
                </span>
                <input
                  type="text"
                  placeholder="your-community"
                  value={subdomain}
                  onChange={e => handleSubdomainChange(e.target.value)}
                  className="flex-1 px-3 text-xl font-medium text-primary outline-none bg-white h-full"
                  autoFocus
                  spellCheck={false}
                />
                <span className="px-3 text-secondary bg-surface border-l border-border h-full
                                 flex items-center select-none whitespace-nowrap text-sm">
                  .cnp.app
                </span>
              </div>

              {/* Validation / availability feedback */}
              <div className="mt-2 h-5 flex items-center gap-1.5">
                {validationErr && subdomain ? (
                  <>
                    <XCircle size={13} className="text-danger flex-shrink-0" />
                    <span className="text-xs text-danger">{validationErr}</span>
                  </>
                ) : checking ? (
                  <>
                    <Loader2 size={13} className="text-secondary animate-spin flex-shrink-0" />
                    <span className="text-xs text-secondary">Checking availability…</span>
                  </>
                ) : availability === 'available' ? (
                  <>
                    <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                    <span className="text-xs text-success font-medium">
                      <span className="font-bold">{subdomain}</span> is available
                    </span>
                  </>
                ) : availability === 'taken' ? (
                  <>
                    <XCircle size={13} className="text-danger flex-shrink-0" />
                    <span className="text-xs text-danger font-medium">
                      <span className="font-bold">{subdomain}</span> is already taken
                    </span>
                  </>
                ) : null}
              </div>

              {/* Rules */}
              <div className="mt-3 space-y-0.5">
                {[
                  '3–50 characters',
                  'Lowercase letters, numbers, hyphens only',
                  'Cannot start or end with hyphen',
                ].map(rule => (
                  <p key={rule} className="text-[11px] text-secondary flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-border inline-block flex-shrink-0" />
                    {rule}
                  </p>
                ))}
              </div>
            </div>

            {/* Custom domain toggle */}
            <div className="border border-border rounded-card p-4 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={e => setUseCustom(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal cursor-pointer"
                />
                <span className="text-sm font-medium text-primary">
                  I have a custom domain to use instead
                </span>
              </label>

              {useCustom && (
                <div className="space-y-3 pt-1">
                  <input
                    type="text"
                    className="input"
                    placeholder="alumni.iitb.ac.in"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value.toLowerCase())}
                    spellCheck={false}
                  />

                  {customDomain && (
                    <div className="bg-navy/5 border border-navy/15 rounded-card p-3">
                      <p className="text-xs text-secondary mb-2">
                        Add this CNAME record to your DNS:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono bg-white border border-border
                                         rounded px-3 py-2 text-primary overflow-x-auto whitespace-nowrap">
                          CNAME:&nbsp;&nbsp;{customDomain}&nbsp; →&nbsp; cnp.app
                        </code>
                        <button
                          onClick={copyDNS}
                          className="p-2 rounded-button text-secondary hover:bg-teal/10 hover:text-teal
                                     transition-colors flex-shrink-0"
                          title="Copy DNS record"
                        >
                          {copiedDNS ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-ghost btn btn-sm">← Back</button>
              <button
                disabled={availability !== 'available'}
                onClick={() => setStep(3)}
                className="btn-primary btn flex-1"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review + provision ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Preview card */}
            <div className="bg-navy/5 border border-navy/15 rounded-card p-5">
              <p className="text-xs text-secondary text-center mb-2">Your domain will be</p>
              <p className="text-xl font-bold text-primary text-center">
                https://{useCustom && customDomain ? customDomain : fullDomain}
              </p>
            </div>

            {/* Details grid */}
            <div className="space-y-1">
              {[
                {
                  icon: Globe,
                  label: 'Domain',
                  value: useCustom && customDomain ? customDomain : fullDomain,
                },
                { icon: Globe,    label: 'For',    value: selectedTenant?.name },
                { icon: Shield,   label: 'SSL',    value: 'Auto-provisioned' },
                { icon: Zap,      label: 'CDN',    value: 'Cloudflare' },
                { icon: CheckCircle2, label: 'Backup', value: 'Daily' },
              ].map(row => (
                <div key={row.label}
                     className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-button bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <row.icon size={14} className="text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-secondary">{row.label}</p>
                    <p className="text-sm font-medium text-primary truncate">{row.value}</p>
                  </div>
                  <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Provision progress */}
            {provisioning && (
              <div className="bg-surface border border-border rounded-card p-4 space-y-3">
                {PROVISION_STEPS.map((label, i) => {
                  const done    = doneSteps.includes(i)
                  const current = !done && doneSteps.length === i
                  return (
                    <div key={label} className="flex items-center gap-2.5">
                      {done
                        ? <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                        : current
                          ? <Loader2 size={15} className="text-teal animate-spin flex-shrink-0" />
                          : <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                      }
                      <span className={`text-sm ${done ? 'text-success' : current ? 'text-primary' : 'text-secondary'}`}>
                        {label}
                      </span>
                      {done && <span className="text-xs text-success ml-auto font-medium">✓</span>}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-2">
              {!provisioning && (
                <button onClick={() => setStep(2)} className="btn-ghost btn btn-sm">← Back</button>
              )}
              <button
                disabled={provisioning}
                onClick={handleProvision}
                className="btn-primary btn flex-1"
              >
                {provisioning
                  ? <><Loader2 size={15} className="animate-spin" /> Provisioning…</>
                  : 'Provision Domain'
                }
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-5">
            {/* Sparkle animation */}
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    background: ['#028090','#E6A817','#2E7D32','#1B3A6B'][i % 4],
                    top:  `${50 + 46 * Math.sin(i * Math.PI / 4)}%`,
                    left: `${50 + 46 * Math.cos(i * Math.PI / 4)}%`,
                    transform: 'translate(-50%,-50%)',
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: '1.2s',
                  }}
                />
              ))}
            </div>

            <div>
              <h3 className="text-xl font-bold text-primary">Domain is Live! 🎉</h3>
              <p className="text-success font-semibold mt-1">
                https://{useCustom && customDomain ? customDomain : fullDomain}
              </p>
              <p className="text-secondary text-sm mt-2">
                SSL secured · Served via Cloudflare · DNS propagating (2–10 min)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://${useCustom && customDomain ? customDomain : fullDomain}`
                  )
                  toast.success('Link copied!')
                }}
                className="btn-outline btn flex-1"
              >
                <Copy size={14} /> Copy Link
              </button>
              <button
                onClick={() => {
                  toast('Opening tenant…', { icon: '↗' })
                  onClose()
                }}
                className="btn-ghost btn flex-1"
              >
                <ExternalLink size={14} /> Go to Tenant
              </button>
            </div>
            <button
              onClick={() => {
                setStep(1); setTenantId(''); setSubdomain('')
                setChecking(false); setAvailability(null); setValidationErr('')
                setUseCustom(false); setCustomDomain(''); setDoneSteps([])
                setProvisioning(false)
              }}
              className="btn-primary btn w-full"
            >
              Provision Another
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Domain Card ───────────────────────────────────────────────────────────────
function DomainCard({ d, copiedId, onCopy, onRevoke }) {
  const [dnsOpen, setDnsOpen] = useState(false)
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-button bg-teal/10 flex items-center justify-center flex-shrink-0">
            <Globe size={16} className="text-teal" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary text-sm truncate">{d.communityName}</p>
            <p className="font-mono text-xs text-secondary truncate">{d.fullDomain}</p>
          </div>
        </div>
        <span className={`badge ${STATUS_BADGE[d.status]} flex-shrink-0`}>{STATUS_LABEL[d.status]}</span>
      </div>

      {d.customDomain && (
        <div className="space-y-1">
          <button
            onClick={() => setDnsOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors w-full"
          >
            <ChevronDown size={12} className={`transition-transform ${dnsOpen ? 'rotate-180' : ''}`} />
            <span className="font-mono truncate flex-1 text-left">{d.customDomain}</span>
            <span className="text-2xs text-secondary/60">DNS</span>
          </button>
          {dnsOpen && (
            <div className="bg-navy/5 border border-navy/15 rounded px-3 py-2 space-y-1">
              <p className="text-2xs text-secondary font-medium uppercase tracking-wide mb-1.5">DNS Records Required</p>
              {[
                { type: 'CNAME', name: d.customDomain, value: 'cnp.app' },
                { type: 'TXT',   name: `_verify.${d.customDomain}`, value: `cnp-verify=${d.id}` },
              ].map(rec => (
                <div key={rec.type} className="flex items-center gap-2 text-2xs font-mono">
                  <span className="badge badge-gray text-2xs flex-shrink-0">{rec.type}</span>
                  <span className="text-secondary truncate">{rec.name}</span>
                  <span className="text-secondary">→</span>
                  <span className="text-primary truncate">{rec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-secondary">
        <span className="flex items-center gap-1">
          <SSLIcon status={d.ssl} /> SSL
        </span>
        <span className="flex items-center gap-1">
          <CDNIcon status={d.cdn} /> CDN
        </span>
        <span className="ml-auto">{fmtDate(d.createdAt)}</span>
      </div>

      <div className="flex items-center gap-1 pt-1 border-t border-border">
        <button
          onClick={() => onCopy(d)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-secondary hover:text-teal hover:bg-teal/5 rounded-button transition-colors"
        >
          {copiedId === d.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          Copy
        </button>
        <button
          onClick={() => toast(`Editing ${d.fullDomain}`, { icon: '✏️' })}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => onRevoke(d)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-danger/70 hover:text-danger hover:bg-danger/5 rounded-button transition-colors"
        >
          <Trash2 size={12} /> Revoke
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DomainsPage() {
  const loading = useLoading(220)

  const [domainList, setDomainList] = useState(initialDomains)
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState([])
  const [copiedId,   setCopiedId]   = useState(null)
  const [view,       setView]       = useState('table')
  const [page,       setPage]       = useState(1)

  // Modal state
  const [provisionOpen, setProvisionOpen] = useState(false)
  const [revokeTarget,  setRevokeTarget]  = useState(null)  // domain object | null

  // Tenants that already have a domain
  const takenTenantIds = domainList.map(d => d.tenantId)

  // Filtered rows
  const filtered = domainList.filter(d => {
    const q = search.toLowerCase()
    const matchesSearch =
      d.communityName.toLowerCase().includes(q) ||
      d.fullDomain.toLowerCase().includes(q) ||
      (d.customDomain && d.customDomain.toLowerCase().includes(q))
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(d.status)
    return matchesSearch && matchesStatus
  })

  const perPage = view === 'card' ? DOMAINS_PER_PAGE : 10
  const paged   = filtered.slice((page - 1) * perPage, page * perPage)

  const copyDomain = (d) => {
    navigator.clipboard.writeText(`https://${d.fullDomain}`)
    setCopiedId(d.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Domain copied!')
  }

  const handleRevoke = () => {
    setDomainList(prev => prev.filter(d => d.id !== revokeTarget.id))
    toast.error(`${revokeTarget.fullDomain} revoked`)
    setRevokeTarget(null)
  }

  const handleProvisioned = ({ tenantId, subdomain, customDomain }) => {
    const tenant = tenants.find(t => t.id === tenantId)
    const newDomain = {
      id:            `dom-${Date.now()}`,
      tenantId,
      communityName: tenant?.name ?? 'Unknown',
      subdomain,
      fullDomain:    `${subdomain}.cnp.app`,
      customDomain:  customDomain || null,
      status:        'active',
      ssl:           'active',
      cdn:           'active',
      createdAt:     new Date().toISOString().slice(0, 10),
      activatedAt:   new Date().toISOString().slice(0, 10),
    }
    setDomainList(prev => [...prev, newDomain])
  }

  const statusOptions = [
    { value: 'active',      label: 'Active' },
    { value: 'pending_dns', label: 'Pending DNS' },
    { value: 'suspended',   label: 'Suspended' },
  ]

  return (
    <div className="p-3 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Domain Manager</h1>
          <p className="text-secondary text-sm mt-0.5">{domainList.length} domains provisioned</p>
        </div>
        <button
          onClick={() => setProvisionOpen(true)}
          className="btn-primary btn flex items-center gap-2"
        >
          <Plus size={16} /> Provision New Domain
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search domains or communities…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
        </div>
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: v => { setStatusFilter(v); setPage(1) },
              multi: true,
              options: statusOptions,
            },
          ]}
        />
        <div className="ml-auto">
          <ViewToggle value={view} onChange={v => { setView(v); setPage(1) }} />
        </div>
      </div>

      {/* ── Card View ── */}
      {view === 'card' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-button bg-gray-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-14 text-center">
              <Globe size={24} className="text-secondary mb-3" />
              <p className="text-secondary text-sm">No domains match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paged.map(d => (
                <DomainCard
                  key={d.id}
                  d={d}
                  copiedId={copiedId}
                  onCopy={copyDomain}
                  onRevoke={setRevokeTarget}
                />
              ))}
            </div>
          )}
          <Pagination page={page} total={filtered.length} perPage={DOMAINS_PER_PAGE} onChange={setPage} />
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
                    <th className="th text-left">Domain</th>
                    <th className="th text-left">Custom Domain</th>
                    <th className="th text-center">Status</th>
                    <th className="th text-center">SSL</th>
                    <th className="th text-center">CDN</th>
                    <th className="th text-left">Created</th>
                    <th className="th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={8} />)
                  ) : paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="td text-center text-secondary py-10">
                        No domains match your filters.
                      </td>
                    </tr>
                  ) : (
                    paged.map(d => (
                      <tr key={d.id} className="tr">
                        <td className="td px-4">
                          <span className="font-semibold text-primary">{d.communityName}</span>
                        </td>
                        <td className="td px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm text-secondary">{d.fullDomain}</span>
                            <button
                              onClick={() => copyDomain(d)}
                              className="p-1 rounded text-secondary/60 hover:text-teal hover:bg-teal/10 transition-colors"
                            >
                              {copiedId === d.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                        <td className="td px-4">
                          {d.customDomain
                            ? <span className="font-mono text-sm text-primary">{d.customDomain}</span>
                            : <span className="text-secondary">—</span>}
                        </td>
                        <td className="td px-4 text-center">
                          <span className={`badge ${STATUS_BADGE[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                        </td>
                        <td className="td px-4 text-center"><SSLIcon status={d.ssl} /></td>
                        <td className="td px-4 text-center"><CDNIcon status={d.cdn} /></td>
                        <td className="td px-4 text-secondary text-sm whitespace-nowrap">{fmtDate(d.createdAt)}</td>
                        <td className="td px-4">
                          <div className="flex items-center gap-1 justify-center">
                            <button onClick={() => toast(`Editing ${d.fullDomain}`, { icon: '✏️' })}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-secondary hover:bg-surface hover:text-primary transition-colors">
                              <Pencil size={13} /> Edit
                            </button>
                            <button onClick={() => setRevokeTarget(d)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-danger/70 hover:bg-danger/8 hover:text-danger transition-colors">
                              <Trash2 size={13} /> Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={filtered.length} perPage={10} onChange={setPage} />
        </>
      )}

      {/* ── Modals ── */}
      <ProvisionModal
        open={provisionOpen}
        onClose={() => setProvisionOpen(false)}
        takenTenantIds={takenTenantIds}
        onProvisioned={handleProvisioned}
      />

      <RevokeModal
        domain={revokeTarget}
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
      />
    </div>
  )
}
