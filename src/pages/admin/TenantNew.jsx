import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Check, ChevronRight, Loader2, X, Shield, Globe,
  CheckCircle, Camera, Layers, Monitor, Smartphone, AlertTriangle,
} from 'lucide-react'
import { takenSubdomains } from '../../data/tenants'
import useMasterSettingsStore from '../../store/masterSettingsStore'
import useTenantChecklistStore from '../../store/tenantChecklistStore'
import Select from '../../components/Select'
import HierarchyWizardStep from './HierarchyWizardStep'

const DRAFT_KEY = 'cnp-new-tenant-draft'
const PREVIEW_COLORS = ['#1B3A6B', '#028090', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']

// ── Branding helpers ──────────────────────────────────────────────────────────
const FONTS = [
  { value: 'Inter',   label: 'Inter'   },
  { value: 'Poppins', label: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { value: 'Roboto',  label: 'Roboto',  url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { value: 'Lato',    label: 'Lato',    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { value: 'Nunito',  label: 'Nunito',  url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
]

function BrandColorField({ label, value, onChange }) {
  const ref = useRef(null)
  return (
    <div>
      <p className="text-xs font-medium text-primary mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-8 h-8 rounded-full border-2 border-border shadow-sm flex-shrink-0 hover:scale-110 transition-transform"
          style={{ background: value }}
        />
        <input
          type="text" value={value}
          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '#') onChange(e.target.value) }}
          className="input font-mono text-xs" style={{ maxWidth: 96 }} maxLength={7} spellCheck={false}
        />
        <input ref={ref} type="color" value={value} onChange={e => onChange(e.target.value)} className="sr-only" />
      </div>
    </div>
  )
}

function BrandUploadBox({ value, onChange, onRemove, w, h, label, hint, accept = 'image/*', round = false }) {
  const ref = useRef(null)
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  const shape = round ? 'rounded-full' : 'rounded-card'
  return (
    <div className="space-y-1">
      <input ref={ref} type="file" accept={accept} onChange={handleFile} className="sr-only" />
      {!value ? (
        <button type="button" onClick={() => ref.current?.click()}
          className={`border-2 border-dashed border-border hover:border-teal bg-surface flex flex-col items-center justify-center gap-1 transition-colors ${shape}`}
          style={{ width: w, height: h }}>
          <Camera size={14} className="text-secondary" />
          <span className="text-[10px] text-secondary text-center leading-tight px-1">{label}</span>
        </button>
      ) : (
        <div>
          <div className={`border border-border overflow-hidden ${shape}`} style={{ width: w, height: h }}>
            <img src={value} alt="" className="w-full h-full object-contain bg-gray-50" />
          </div>
          <div className="flex gap-1.5 mt-1.5">
            <button type="button" onClick={() => ref.current?.click()} className="btn btn-ghost btn-sm text-xs">Change</button>
            <button type="button" onClick={onRemove} className="btn btn-ghost btn-sm text-xs text-danger">Remove</button>
          </div>
        </div>
      )}
      {hint && <p className="text-[10px] text-secondary leading-snug">{hint}</p>}
    </div>
  )
}

function BrandMobilePreview({ b }) {
  const { primaryColor = '#1B3A6B', secondaryColor = '#028090', displayName, tagline, logo, fontFamily = 'Inter' } = b
  const initial = displayName?.charAt(0)?.toUpperCase() || 'C'
  return (
    <div className="flex justify-center py-4">
      <div className="relative" style={{ width: 180, height: 364 }}>
        <div className="absolute inset-0 rounded-[32px] shadow-2xl" style={{ background: '#1c1c1e', padding: '8px 6px 10px' }}>
          <div className="w-full h-full rounded-[26px] overflow-hidden flex flex-col" style={{ fontFamily: `'${fontFamily}', sans-serif` }}>
            <div className="flex items-center justify-between px-3 pt-1.5 pb-1 text-white flex-shrink-0" style={{ background: primaryColor, fontSize: 8 }}>
              <span className="font-semibold">9:41</span>
              <span>▲▲ WiFi 🔋</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4"
              style={{ background: `linear-gradient(155deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {logo
                ? <img src={logo} alt="" style={{ height: 36, maxWidth: 100, objectFit: 'contain' }} />
                : <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white"
                    style={{ background: 'rgba(255,255,255,0.18)' }}>{initial}</div>
              }
              <div className="text-center">
                <p className="text-white font-bold text-xs">{displayName || 'Community Name'}</p>
                {tagline && <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{tagline}</p>}
              </div>
              <div className="w-full space-y-1.5 mt-1">
                <div className="rounded-lg px-2.5 py-1.5 text-[9px]" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>+91 · Enter phone number</div>
                <div className="rounded-lg px-2.5 py-2 text-white text-[10px] text-center font-semibold" style={{ background: secondaryColor }}>Get OTP →</div>
              </div>
            </div>
            <div className="flex items-center justify-around px-2 py-1.5 flex-shrink-0" style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              {[['🏠','Home'],['👥','Members'],['⭐','Refs'],['📅','Events'],['👤','Me']].map(([ic, lb], i) => (
                <div key={lb} className="flex flex-col items-center gap-0.5">
                  <span style={{ fontSize: 10 }}>{ic}</span>
                  <span style={{ fontSize: 6, color: i === 0 ? primaryColor : '#bbb', fontWeight: i === 0 ? 600 : 400 }}>{lb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 rounded-full z-20" style={{ width: 56, height: 12, background: '#1c1c1e' }} />
      </div>
    </div>
  )
}

function BrandWebPreview({ b }) {
  const { primaryColor = '#1B3A6B', secondaryColor = '#028090', displayName, logo } = b
  const initial = displayName?.charAt(0)?.toUpperCase() || 'C'
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg w-full">
      <div className="flex items-center gap-2 bg-gray-100 border-b border-gray-200 px-3 py-1.5">
        <div className="flex gap-1 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded text-[10px] text-gray-400 px-2 py-0.5 max-w-[160px] w-full text-center border border-gray-200">app.cnp.app</div>
        </div>
        <div style={{ width: 36 }} />
      </div>
      <div className="flex" style={{ height: 240 }}>
        <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 120, background: primaryColor }}>
          <div className="flex items-center gap-1.5 px-2.5 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {logo
              ? <img src={logo} alt="" style={{ height: 14, objectFit: 'contain', maxWidth: 70 }} />
              : <>
                  <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ background: secondaryColor }}>{initial}</div>
                  <span className="text-white text-[9px] font-semibold truncate">{displayName || 'Community'}</span>
                </>
            }
          </div>
          {['Dashboard','Members','Meetings','Referrals','Events','Settings'].map((item, i) => (
            <div key={item} className="flex items-center gap-1.5 px-2.5 py-1 text-[9px]"
              style={{ color: i===0 ? '#fff' : 'rgba(255,255,255,0.52)', background: i===0 ? 'rgba(255,255,255,0.13)' : 'transparent', borderLeft: i===0 ? `2px solid ${secondaryColor}` : '2px solid transparent' }}>
              <div className="w-1 h-1 rounded-sm flex-shrink-0" style={{ background: i===0 ? secondaryColor : 'rgba(255,255,255,0.28)' }} />
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 bg-[#F4F8FF] p-2.5 space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold" style={{ color: primaryColor }}>Dashboard</span>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" /><div className="w-4 h-4 rounded-full bg-gray-300" /></div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[['Members','240'],['Active','180'],['Refs','48']].map(([k,v]) => (
              <div key={k} className="bg-white rounded p-1.5 border border-gray-100 shadow-sm">
                <div className="text-[7px] text-gray-400 uppercase tracking-wide">{k}</div>
                <div className="text-xs font-bold" style={{ color: primaryColor }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded p-2 border border-gray-100">
            <div className="text-[7px] font-semibold text-gray-400 uppercase mb-1">Activity</div>
            <div className="flex items-end gap-0.5" style={{ height: 36 }}>
              {[38,58,48,78,62,90,68].map((h,i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height:`${h}%`, background: i===5 ? primaryColor : `${primaryColor}28` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandSplashPreview({ b }) {
  const { primaryColor = '#1B3A6B', secondaryColor = '#028090', displayName, logo, splashScreen } = b
  const initial = displayName?.charAt(0)?.toUpperCase() || 'C'
  return (
    <div className="flex justify-center py-4">
      <div className="relative" style={{ width: 180, height: 364 }}>
        <div className="absolute inset-0 rounded-[32px] shadow-2xl" style={{ background: '#1c1c1e', padding: '8px 6px 10px' }}>
          <div className="w-full h-full rounded-[26px] overflow-hidden flex flex-col">
            {splashScreen ? (
              <img src={splashScreen} alt="Splash" className="w-full h-full object-cover" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3"
                style={{ background: `linear-gradient(155deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
                {logo
                  ? <img src={logo} alt="" style={{ height: 44, maxWidth: 120, objectFit: 'contain' }} />
                  : <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
                      style={{ background: 'rgba(255,255,255,0.18)' }}>{initial}</div>
                }
                <p className="text-white font-bold text-sm">{displayName || 'Community Name'}</p>
                <div className="w-10 h-1 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.3)' }} />
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 rounded-full z-20" style={{ width: 56, height: 12, background: '#1c1c1e' }} />
      </div>
    </div>
  )
}

function BrandPreviewPanel({ branding }) {
  const [tab, setTab] = useState('app')
  const TABS = [
    { id: 'app',    label: 'App',    Icon: Smartphone },
    { id: 'web',    label: 'Web',    Icon: Monitor    },
    { id: 'splash', label: 'Splash', Icon: Layers     },
  ]
  return (
    <div className="flex-shrink-0 sticky top-5" style={{ width: 340 }}>
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-primary">Live Preview</p>
          <span className="badge badge-teal text-[10px]">Real-time</span>
        </div>
        <div className="flex gap-1 mb-3 bg-surface rounded-button p-0.5">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium transition-all
                ${tab === id ? 'bg-white shadow text-primary' : 'text-secondary hover:text-primary'}`}>
              <Icon size={10} />
              {label}
            </button>
          ))}
        </div>
        {tab === 'app'    && <BrandMobilePreview b={branding} />}
        {tab === 'web'    && <BrandWebPreview    b={branding} />}
        {tab === 'splash' && <BrandSplashPreview b={branding} />}
      </div>
    </div>
  )
}

// ── Slug helper ────────────────────────────────────────────────────────────────
function slugify(name) {
  const stopWords = new Set(['the', 'and', 'of', 'for', 'a', 'an', 'in', 'at', 'to'])
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !stopWords.has(w))
    .join('-')
    .slice(0, 20)
    .replace(/-+$/, '')
}

// ── Dummy CSA registry for duplicate check ────────────────────────────────────
const EXISTING_USERS = [
  { phone: '9823456789', email: 'rajesh@bnimumbai.com', role: 'Community Super Admin', community: 'BNI Mumbai Metro' },
  { phone: '9812345670', email: 'anand@iitb.ac.in',     role: 'Community Super Admin', community: 'Alumni IIT Bombay' },
  { phone: '9867891234', email: 'haresh@ficciguj.org',  role: 'Community Super Admin', community: 'FICCI Gujarat'   },
]

// ── Main component ─────────────────────────────────────────────────────────────
export default function TenantNew() {
  const navigate = useNavigate()

  const getActivePlans = useMasterSettingsStore(s => s.getActivePlans)
  const getActiveCommunityTypes = useMasterSettingsStore(s => s.getActiveCommunityTypes)
  const getActiveChecklistSteps = useMasterSettingsStore(s => s.getActiveChecklistSteps)
  const modulesCatalog = useMasterSettingsStore(s => s.modules)

  const activePlans = getActivePlans()
  const communityTypesList = getActiveCommunityTypes()

  const planCards = activePlans.map(p => ({
    value: p.slug,
    label: p.name,
    price: `₹${Number(p.price).toLocaleString('en-IN')}/${p.billingCycle === 'annual' ? 'yr' : 'mo'}`,
    description: p.description,
    recommended: p.isRecommended,
    moduleIds:
      p.allowedModuleIds === 'all'
        ? modulesCatalog.map(m => m.id)
        : Array.isArray(p.allowedModuleIds)
          ? p.allowedModuleIds
          : [],
    maxMembers: p.maxMembersUnlimited ? null : p.maxMembers,
    maxNodes: p.maxNodesUnlimited ? null : p.maxNodes,
  }))

  const STEP_META = [
    { label: 'Community Details', desc: 'Name, type, CSA & plan' },
    { label: 'Domain + Branding', desc: 'Subdomain, colors & identity' },
    { label: 'Hierarchy (optional)', desc: 'Template, preview & customize' },
    { label: 'Review & Create',   desc: 'Confirm and provision' },
  ]

  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})

  // Draft restore state
  const [draftBanner, setDraftBanner] = useState(null) // null | { name, step }

  const [formData, setFormData] = useState({
    name: '',
    type: 'professional_networking',
    description: '',
    csaName: '',
    csaEmail: '',
    csaPhone: '',
    plan: 'professional',
  })
  const [subdomain, setSubdomain] = useState('')
  const [domainStatus, setDomainStatus] = useState(null)
  const [useCustomDomain, setUseCustomDomain] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [branding, setBranding] = useState({
    displayName: '', tagline: '', logo: null, appIcon: null, splashScreen: null,
    primaryColor: '#1B3A6B', secondaryColor: '#028090', fontFamily: 'Inter',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createSteps, setCreateSteps] = useState([])
  const [success, setSuccess] = useState(false)
  const [newTenantId] = useState(`tenant-00${Math.floor(Math.random() * 90) + 10}`)
  const [hierarchySource, setHierarchySource] = useState('template') // template | scratch
  const [selectedHierarchyTemplate, setSelectedHierarchyTemplate] = useState('professional_networking')
  const [hierarchyTemplate, setHierarchyTemplate] = useState({ levels: [], nodes: [] })
  const [hierarchyBuilderVersion, setHierarchyBuilderVersion] = useState(1)
  const [hierarchySkipped, setHierarchySkipped] = useState(false)
  const [hierarchyStatus, setHierarchyStatus] = useState({ state: 'B', canProceed: true, requiresConfirm: false })
  const [showProceedDialog, setShowProceedDialog] = useState(false)

  // CSA duplicate check
  const [csaEmailStatus, setCsaEmailStatus] = useState('idle') // idle | checking | ok | error
  const [csaEmailError, setCsaEmailError] = useState('')
  const [csaPhoneStatus, setCsaPhoneStatus] = useState('idle')
  const [csaPhoneError, setCsaPhoneError] = useState('')

  const debounceRef = useRef(null)
  const setBrand = (key) => (val) => setBranding(prev => ({ ...prev, [key]: val }))

  // ── Draft autosave ───────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const existing = localStorage.getItem(DRAFT_KEY)
      if (existing) {
        const draft = JSON.parse(existing)
        if (draft.formData?.name) {
          setDraftBanner({ name: draft.formData.name, step: draft.step || 1 })
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (success) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        formData,
        subdomain,
        step,
        hierarchySource,
        selectedHierarchyTemplate,
        hierarchyTemplate,
        branding: { ...branding, logo: null, appIcon: null, splashScreen: null },
      }))
    } catch {}
  }, [formData, subdomain, step, hierarchySource, selectedHierarchyTemplate, hierarchyTemplate, branding, success])

  function continueDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft.formData) setFormData(draft.formData)
      if (draft.subdomain) setSubdomain(draft.subdomain)
      if (draft.step) setStep(draft.step)
      if (draft.hierarchySource) setHierarchySource(draft.hierarchySource)
      if (draft.selectedHierarchyTemplate) setSelectedHierarchyTemplate(draft.selectedHierarchyTemplate)
      if (draft.hierarchyTemplate) setHierarchyTemplate(draft.hierarchyTemplate)
    } catch {}
    setHierarchyBuilderVersion(v => v + 1)
    setDraftBanner(null)
  }

  function startFresh() {
    localStorage.removeItem(DRAFT_KEY)
    setDraftBanner(null)
  }

  // ── Sync displayName ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (formData.name) setBranding(prev => ({ ...prev, displayName: formData.name }))
  }, [formData.name])

  // ── Load Google Font ─────────────────────────────────────────────────────────
  useEffect(() => {
    const font = FONTS.find(f => f.value === branding.fontFamily)
    if (font?.url && !document.querySelector(`link[href="${font.url}"]`)) {
      const el = document.createElement('link')
      el.rel = 'stylesheet'; el.href = font.url
      document.head.appendChild(el)
    }
  }, [branding.fontFamily])

  // ── Domain debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!subdomain.trim()) { setDomainStatus(null); return }
    setDomainStatus('checking')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const taken = takenSubdomains.includes(subdomain.trim().toLowerCase())
      setDomainStatus(taken ? 'taken' : 'available')
    }, 800)
    return () => clearTimeout(debounceRef.current)
  }, [subdomain])

  // ── Domain auto-suggest from community name ──────────────────────────────────
  function handleNameBlur() {
    if (!subdomain && formData.name.trim()) {
      const slug = slugify(formData.name)
      if (slug) setSubdomain(slug)
    }
  }

  // ── CSA duplicate check ──────────────────────────────────────────────────────
  function checkCsaPhone(phone) {
    if (phone.length !== 10) { setCsaPhoneStatus('idle'); setCsaPhoneError(''); return }
    setCsaPhoneStatus('checking')
    setTimeout(() => {
      const match = EXISTING_USERS.find(u => u.phone === phone)
      if (match) {
        setCsaPhoneStatus('error')
        setCsaPhoneError(`Already registered as ${match.role} for ${match.community}`)
      } else {
        setCsaPhoneStatus('ok')
        setCsaPhoneError('')
      }
    }, 600)
  }

  function checkCsaEmail(email) {
    if (!email.includes('@')) { setCsaEmailStatus('idle'); setCsaEmailError(''); return }
    setCsaEmailStatus('checking')
    setTimeout(() => {
      const match = EXISTING_USERS.find(u => u.email === email.toLowerCase())
      if (match) {
        setCsaEmailStatus('error')
        setCsaEmailError(`Already registered as ${match.role} for ${match.community}`)
      } else {
        setCsaEmailStatus('ok')
        setCsaEmailError('')
      }
    }, 600)
  }

  const setField = (key, val) => {
    setFormData(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: false }))
  }

  function getDefaultHierarchyForType(typeSlug) {
    const ct = communityTypesList.find(c => c.slug === typeSlug)
    const levels = (ct?.defaultHierarchyPreset?.levels || []).map((level, idx) => ({
      id: level?.id || `l${idx + 1}`,
      name: (level?.name || '').trim() || `Level ${idx + 1}`,
      color: level?.color || PREVIEW_COLORS[idx] || '#546E7A',
    }))
    return { levels, nodes: ct?.defaultHierarchyPreset?.nodes || [] }
  }

  function getScratchHierarchy() {
    return {
      levels: [{ id: 'l1', name: 'Level 1', color: '#028090' }],
      nodes: [],
    }
  }

  useEffect(() => {
    if (hierarchySource === 'template') {
      setSelectedHierarchyTemplate(formData.type)
      setHierarchyTemplate(getDefaultHierarchyForType(formData.type))
      setHierarchyBuilderVersion(v => v + 1)
    }
  }, [formData.type])

  // ── Step validations ─────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {}
    if (!formData.name.trim()) e.name = true
    if (!formData.type) e.type = true
    if (!formData.csaName.trim()) e.csaName = true
    if (!formData.csaEmail.trim()) e.csaEmail = true
    if (!formData.csaPhone.trim()) e.csaPhone = true
    if (!formData.plan) e.plan = true
    if (csaPhoneStatus === 'error') e.csaPhone = true
    if (csaEmailStatus === 'error') e.csaEmail = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    if (!subdomain.trim()) e.subdomain = true
    if (domainStatus === 'taken') e.subdomainTaken = true
    if (domainStatus !== 'available') e.subdomainNotReady = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3) {
      if (!hierarchyStatus.canProceed) return
      if (hierarchyStatus.requiresConfirm && !hierarchySkipped) {
        setShowProceedDialog(true)
        return
      }
    }
    setStep(s => Math.min(s + 1, STEP_META.length))
  }

  // ── Create flow ──────────────────────────────────────────────────────────────
  const CREATE_STEPS_LABELS = [
    'Creating tenant record...',
    'Provisioning subdomain...',
    'Setting up data environment...',
    'Sending CSA invitation...',
    'Generating onboarding checklist...',
  ]

  const handleCreate = async () => {
    setIsCreating(true)
    setCreateSteps([])
    for (let i = 0; i < CREATE_STEPS_LABELS.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setCreateSteps(prev => [...prev, i])
    }
    await new Promise(r => setTimeout(r, 300))

    const templateSteps = getActiveChecklistSteps()
    const tenantChecklist = templateSteps.map(s => ({
      ...s,
      id: `${s.id}-${newTenantId}`,
      tenantId: newTenantId,
      done: s.autoCompleteTrigger === 'on_tenant_created',
      completedAt: s.autoCompleteTrigger === 'on_tenant_created' ? new Date().toISOString() : null,
    }))
    useTenantChecklistStore.getState().setChecklist(newTenantId, tenantChecklist)

    localStorage.removeItem(DRAFT_KEY)
    setSuccess(true)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const communityType = communityTypesList.find(c => c.slug === formData.type)
  const selectedPlan = planCards.find(p => p.value === formData.plan)
  const domainDisplay = useCustomDomain && customDomain.trim()
    ? customDomain.trim()
    : subdomain.trim() ? `${subdomain.trim().toLowerCase()}.cnp.app` : ''

  // Determine what selecting a type auto-configures
  function getTypeAutoConfig(typeSlug) {
    const ct = communityTypesList.find(c => c.slug === typeSlug)
    if (!ct) return null
    const levels = (ct.defaultHierarchyPreset?.levels || []).map(l => l.name || l).filter(Boolean)
    return {
      hierarchyPreset: levels.length > 0 ? levels.join(' → ') : 'Custom (configure after setup)',
      suggestedPlan: ct.suggestedPlan || 'professional',
    }
  }

  function getModuleLabel(id) {
    return modulesCatalog.find(m => m.id === id)?.shortName || id
  }

  const typeAutoConfig = getTypeAutoConfig(formData.type)
  const hierarchyLevels = (hierarchyTemplate?.levels || []).map(l => l?.name).filter(Boolean)

  return (
    <div className="p-3 flex flex-col bg-surface" style={{ minHeight: 'calc(100vh - 44px)' }}>

      <div className="sticky top-0 z-30 bg-white">
        {/* ── Page header ── */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-border flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-secondary">
            <Link to="/admin/tenants" className="hover:text-teal transition-colors">Tenants</Link>
            <ChevronRight size={11} />
            <span className="text-primary font-medium">New Tenant</span>
          </div>
          <span className="text-border text-xs mx-0.5">|</span>
          <h1 className="text-sm font-bold text-navy">New Tenant</h1>
        </div>

        {!isCreating && !success && (
          <div className="bg-white border-b border-border px-5 py-2.5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-2xs font-semibold uppercase tracking-widest text-secondary/60">Setup Steps</p>
              <span className="text-2xs text-secondary">
                Step {step} of {STEP_META.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {STEP_META.map((s, i) => {
                const num = i + 1
                const done = num < step
                const active = num === step
                return (
                  <button
                    key={s.label}
                    type="button"
                    disabled={num > step}
                    onClick={() => done && setStep(num)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-button border text-left whitespace-nowrap transition-all
                      ${active
                        ? 'border-teal bg-teal/10'
                        : done
                        ? 'border-border hover:border-teal/30 hover:bg-surface'
                        : 'border-border/60 opacity-60 cursor-default'}`}
                  >
                    <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold
                      ${active || done ? 'bg-teal text-white' : 'bg-white border border-border text-secondary/70'}`}>
                      {done ? <Check size={10} /> : num}
                    </span>
                    <span className={`text-xs font-medium ${active ? 'text-teal' : 'text-secondary'}`}>{s.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / STEP_META.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-5 w-full">

            {/* Draft restore banner */}
            {!isCreating && !success && draftBanner && step === 1 && (
              <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-navy/5 border border-navy/20 rounded-card">
                <div>
                  <p className="text-sm font-semibold text-primary">You have an unsaved draft</p>
                  <p className="text-xs text-secondary mt-0.5">{draftBanner.name} — Step {draftBanner.step} of {STEP_META.length}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={continueDraft} className="btn btn-primary btn-sm text-xs">Continue Draft</button>
                  <button onClick={startFresh} className="btn btn-outline btn-sm text-xs">Start Fresh</button>
                </div>
              </div>
            )}

            {/* Creating / Success state */}
            {(isCreating || success) ? (
              <div className="card">
                <div className="card-body py-10">
                  {!success ? (
                    <div className="max-w-sm mx-auto space-y-5">
                      <h2 className="text-xl font-bold text-navy text-center mb-6">Provisioning Tenant...</h2>
                      {CREATE_STEPS_LABELS.map((label, i) => {
                        const done = createSteps.includes(i)
                        const active = createSteps.length === i
                        return (
                          <div key={label} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                              {done
                                ? <CheckCircle size={22} className="text-success" />
                                : active
                                ? <Loader2 size={22} className="animate-spin text-teal" />
                                : <div className="w-5 h-5 rounded-full border-2 border-border" />
                              }
                            </div>
                            <span className={`text-sm font-medium ${done ? 'text-success' : active ? 'text-primary' : 'text-secondary'}`}>
                              {label}
                            </span>
                            {done && <Check size={14} className="ml-auto text-success" />}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    /* ── Success screen ── */
                    <div className="max-w-lg mx-auto flex flex-col items-center gap-5 py-4">
                      {/* Animated checkmark */}
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center"
                        style={{ animation: 'scaleIn 0.5s ease forwards' }}>
                        <CheckCircle size={40} className="text-success" style={{ animation: 'drawIn 0.5s ease forwards' }} />
                      </div>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-navy">{formData.name} is ready! 🎉</h2>
                        <p className="text-sm text-secondary mt-1">
                          Tenant created at{' '}
                          <span className="font-mono text-teal">{domainDisplay || `${subdomain}.cnp.app`}</span>
                        </p>
                        <p className="text-xs text-secondary/60 font-mono mt-0.5">{newTenantId}</p>
                      </div>

                      {/* What happens next */}
                      <div className="w-full bg-surface border border-border rounded-card p-4 space-y-2">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">What happens next?</p>
                        {[
                          { done: true,  label: 'Tenant provisioned' },
                          { done: false, label: 'Upload full branding assets' },
                          { done: false, label: 'Configure hierarchy in builder' },
                          { done: false, label: 'Deliver CSA credentials' },
                          { done: false, label: 'Trigger app build' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-success/15' : 'bg-border'}`}>
                              {item.done ? <Check size={9} className="text-success" /> : <span className="w-1.5 h-1.5 rounded-full bg-secondary/40" />}
                            </span>
                            <span className={`text-xs ${item.done ? 'text-success font-medium' : 'text-secondary'}`}>{item.label}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-secondary/60 pt-1">These steps are tracked in your onboarding checklist.</p>
                      </div>

                      {/* Action buttons */}
                      <div className="w-full space-y-2">
                        <button
                          className="btn btn-primary w-full"
                          onClick={() => navigate(`/admin/onboarding/${newTenantId}`)}
                        >
                          Open Onboarding Checklist
                        </button>
                        <button
                          className="btn btn-outline w-full"
                          onClick={() => navigate(`/admin/hierarchy`)}
                        >
                          Go to Hierarchy Builder
                        </button>
                        <button
                          className="btn btn-ghost w-full border border-border"
                          onClick={() => navigate(`/admin/tenants/${newTenantId}`)}
                        >
                          View Tenant Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* ── STEP 1: Community Details ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="card">
                      <div className="card-body space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-primary mb-1">
                              Community Name <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={e => setField('name', e.target.value)}
                              onBlur={handleNameBlur}
                              placeholder="e.g. BNI Delhi Metro"
                              className={`input ${errors.name ? 'border-danger ring-1 ring-danger/30' : ''}`}
                            />
                            {errors.name && <p className="text-xs text-danger mt-0.5">Required</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-primary mb-1">
                              Description <span className="text-secondary font-normal">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={formData.description}
                              onChange={e => setField('description', e.target.value)}
                              placeholder="Brief description..."
                              className="input"
                            />
                          </div>
                        </div>

                        {/* Community Type — visual cards */}
                        <div>
                          <label className="block text-xs font-medium text-primary mb-2">
                            Community Type <span className="text-danger">*</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {communityTypesList.map(ct => {
                              const selected = formData.type === ct.slug
                              return (
                                <button
                                  key={ct.slug}
                                  type="button"
                                  onClick={() => setField('type', ct.slug)}
                                  className={`relative text-left rounded-card border-2 p-3 transition-all ${selected ? 'border-teal bg-teal/5' : 'border-border bg-white hover:border-teal/40'}`}
                                >
                                  {selected && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-teal rounded-full flex items-center justify-center">
                                      <Check size={9} className="text-white" />
                                    </span>
                                  )}
                                  <p className={`text-xs font-bold ${selected ? 'text-teal' : 'text-primary'}`}>{ct.name}</p>
                                  {ct.examples && (
                                    <p className="text-[10px] text-secondary italic mt-0.5 leading-snug">{ct.examples}</p>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                          {errors.type && <p className="text-xs text-danger mt-1">Select a community type</p>}

                          {/* Auto-configure preview */}
                          {typeAutoConfig && (
                            <div className="mt-3 bg-teal/5 border border-teal/20 rounded-card p-3 space-y-1.5">
                              <p className="text-[10px] font-semibold text-teal uppercase tracking-wide">What this auto-configures</p>
                              <div className="flex items-start gap-2">
                                <Check size={11} className="text-teal flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-secondary">Hierarchy preset: <span className="text-primary font-medium">{typeAutoConfig.hierarchyPreset}</span></p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Check size={11} className="text-teal flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-secondary">Suggested plan: <span className="text-primary font-medium">{selectedPlan?.label || 'Professional'}</span></p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CSA section */}
                    <div className="card">
                      <div className="card-body space-y-3">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Community Super Admin (CSA)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-primary mb-1">Full Name <span className="text-danger">*</span></label>
                            <input type="text" value={formData.csaName} onChange={e => setField('csaName', e.target.value)}
                              placeholder="Full name" className={`input ${errors.csaName ? 'border-danger ring-1 ring-danger/30' : ''}`} />
                            {errors.csaName && <p className="text-xs text-danger mt-0.5">Required</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-primary mb-1">Email <span className="text-danger">*</span></label>
                            <input type="email" value={formData.csaEmail}
                              onChange={e => { setField('csaEmail', e.target.value); setCsaEmailStatus('idle') }}
                              onBlur={e => checkCsaEmail(e.target.value)}
                              placeholder="email@example.com"
                              className={`input ${errors.csaEmail || csaEmailStatus === 'error' ? 'border-danger ring-1 ring-danger/30' : csaEmailStatus === 'ok' ? 'border-success' : ''}`} />
                            {csaEmailStatus === 'error' && <p className="text-xs text-danger mt-0.5">{csaEmailError}</p>}
                            {csaEmailStatus === 'ok' && <p className="text-xs text-success mt-0.5">✓ Available</p>}
                            {errors.csaEmail && csaEmailStatus !== 'error' && <p className="text-xs text-danger mt-0.5">Required</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-primary mb-1">Phone <span className="text-danger">*</span></label>
                            <div className={`flex h-[34px] rounded-button border overflow-hidden transition-colors
                              ${errors.csaPhone || csaPhoneStatus === 'error' ? 'border-danger ring-1 ring-danger/20' : csaPhoneStatus === 'ok' ? 'border-success' : 'border-border focus-within:border-teal focus-within:ring-1 focus-within:ring-teal/20'}`}>
                              <span className="flex items-center px-2.5 bg-surface border-r border-border text-secondary text-xs flex-shrink-0 select-none">+91</span>
                              <input type="text" value={formData.csaPhone}
                                onChange={e => { setField('csaPhone', e.target.value.replace(/\D/g, '')); setCsaPhoneStatus('idle') }}
                                onBlur={e => checkCsaPhone(e.target.value)}
                                placeholder="10-digit number" maxLength={10}
                                className="flex-1 h-full px-2.5 text-sm outline-none bg-white text-primary placeholder:text-secondary" />
                            </div>
                            {csaPhoneStatus === 'error' && <p className="text-xs text-danger mt-0.5">{csaPhoneError}</p>}
                            {csaPhoneStatus === 'ok' && <p className="text-xs text-success mt-0.5">✓ Available</p>}
                            {errors.csaPhone && csaPhoneStatus !== 'error' && <p className="text-xs text-danger mt-0.5">Required</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plan section */}
                    <div className="card">
                      <div className="card-body space-y-3">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
                          Subscription Plan <span className="text-danger normal-case font-normal">*</span>
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {planCards.map(plan => {
                            const selected = formData.plan === plan.value
                            const planModules = plan.moduleIds.slice(0, 4)
                            const extra = plan.moduleIds.length - 4
                            return (
                              <label key={plan.value}
                                className={`relative cursor-pointer rounded-card border-2 p-3 transition-all
                                  ${selected ? 'border-teal bg-teal/5' : 'border-border bg-white hover:border-teal/40'}`}>
                                <input type="radio" name="plan" value={plan.value} checked={selected}
                                  onChange={() => setField('plan', plan.value)} className="sr-only" />
                                {plan.recommended && <span className="badge badge-teal text-2xs absolute top-2.5 right-2.5">Recommended</span>}
                                {selected && <div className="absolute top-2.5 left-2.5"><Check size={12} className="text-teal" /></div>}
                                <p className={`font-bold text-sm ${selected ? 'text-teal' : 'text-primary'} ${plan.recommended ? 'pr-24' : ''}`}>{plan.label}</p>
                                <p className="text-teal font-bold text-sm mt-0.5">{plan.price}</p>
                                <p className="text-xs text-secondary mt-1 leading-snug">{plan.description}</p>
                                <p className="text-xs text-secondary mt-1">
                                  {plan.maxMembers ? `Up to ${plan.maxMembers} members` : 'Unlimited members'} · {plan.maxNodes ? `${plan.maxNodes} nodes` : 'Unlimited nodes'}
                                </p>
                                <div className="mt-2 border-t border-border/50 pt-2">
                                  <p className="text-[10px] text-secondary/70 font-semibold uppercase tracking-wide mb-1">Includes:</p>
                                  <div className="space-y-0.5">
                                    {planModules.map(id => (
                                      <div key={id} className="flex items-center gap-1.5">
                                        <Check size={9} className="text-success flex-shrink-0" />
                                        <span className="text-[10px] text-secondary">{getModuleLabel(id)}</span>
                                      </div>
                                    ))}
                                    {extra > 0 && <p className="text-[10px] text-secondary/60">+ {extra} more</p>}
                                  </div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                        {errors.plan && <p className="text-xs text-danger mt-1">Select a plan</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Domain + Branding ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    {/* Domain */}
                    <div className="card">
                      <div className="card-body space-y-3">
                        <div>
                          <h2 className="text-sm font-semibold text-primary">Domain Setup</h2>
                          <p className="text-xs text-secondary mt-0.5">Choose a subdomain for this community</p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-primary mb-1">Subdomain <span className="text-danger">*</span></label>
                          <div className={`flex rounded-button border overflow-hidden transition-colors
                            ${errors.subdomain || errors.subdomainTaken
                              ? 'border-danger ring-1 ring-danger/20'
                              : 'border-border focus-within:border-teal focus-within:ring-1 focus-within:ring-teal/20'}`}>
                            <span className="flex items-center px-3 bg-surface border-r border-border text-secondary text-sm flex-shrink-0 select-none">https://</span>
                            <input type="text" value={subdomain}
                              onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                              placeholder="subdomain"
                              className="flex-1 px-3 py-2 text-sm outline-none bg-white text-primary placeholder:text-secondary" />
                            <span className="flex items-center px-3 bg-surface border-l border-border text-secondary text-sm flex-shrink-0 select-none">.cnp.app</span>
                          </div>
                          <div className="mt-1.5 h-4">
                            {domainStatus === 'checking'   && <span className="flex items-center gap-1 text-secondary text-xs"><Loader2 size={12} className="animate-spin" /> Checking...</span>}
                            {domainStatus === 'available'  && <span className="flex items-center gap-1 text-success text-xs"><Check size={12} /> Available</span>}
                            {domainStatus === 'taken'      && <span className="flex items-center gap-1 text-danger text-xs"><X size={12} /> Subdomain taken</span>}
                          </div>
                          {errors.subdomainNotReady && domainStatus !== 'available' && domainStatus !== 'checking' && (
                            <p className="text-xs text-danger">Choose an available subdomain to continue</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 pt-1">
                          <div className="flex items-center gap-2 text-xs text-secondary"><Shield size={12} className="flex-shrink-0" /> SSL auto-provisioned by Cloudflare ✓</div>
                          <div className="flex items-center gap-2 text-xs text-secondary"><Globe size={12} className="flex-shrink-0" /> Cloudflare CDN ✓</div>
                        </div>

                        <div className="border-t border-border pt-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <button type="button" role="switch" aria-checked={useCustomDomain}
                              onClick={() => setUseCustomDomain(v => !v)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${useCustomDomain ? 'bg-teal' : 'bg-border'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${useCustomDomain ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className="text-xs font-medium text-primary">Use custom domain instead</span>
                          </div>
                          {useCustomDomain && (
                            <div>
                              <label className="block text-xs font-medium text-primary mb-1">Custom Domain</label>
                              <input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)}
                                placeholder="app.yourdomain.com" className="input" />
                              <p className="text-xs text-secondary mt-1">Point your CNAME to <span className="font-mono text-primary">cnp.app</span> before saving</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Branding — optional */}
                    <div className="flex gap-5 items-start">
                      <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-primary">Branding</h2>
                          <span className="text-xs text-secondary font-normal">(optional — can complete later)</span>
                        </div>

                        <div className="card">
                          <div className="card-body space-y-3">
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Identity</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-primary mb-1">Display Name</label>
                                <input type="text" value={branding.displayName} onChange={e => setBrand('displayName')(e.target.value)}
                                  placeholder="Shown in app & emails" className="input" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-primary mb-1">Tagline <span className="text-secondary font-normal">(optional)</span></label>
                                <input type="text" value={branding.tagline} onChange={e => setBrand('tagline')(e.target.value)}
                                  placeholder="Connect. Refer. Grow." className="input" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="card-body space-y-3">
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Logo & App Icon</p>
                            <div className="flex gap-6 flex-wrap">
                              <div>
                                <p className="text-xs font-medium text-primary mb-1.5">Logo</p>
                                <BrandUploadBox value={branding.logo} onChange={setBrand('logo')} onRemove={() => setBrand('logo')(null)}
                                  w={160} h={64} label="Upload Logo" hint="PNG/SVG · max 2MB · transparent bg" accept="image/png,image/jpeg,image/svg+xml" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-primary mb-1.5">App Icon</p>
                                <BrandUploadBox value={branding.appIcon} onChange={setBrand('appIcon')} onRemove={() => setBrand('appIcon')(null)}
                                  w={64} h={64} label="Icon" hint="PNG · 1024×1024 px" accept="image/png" round />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="card-body space-y-3">
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Colors</p>
                            <div className="grid grid-cols-2 gap-4">
                              <BrandColorField label="Primary Color" value={branding.primaryColor} onChange={setBrand('primaryColor')} />
                              <BrandColorField label="Secondary Color" value={branding.secondaryColor} onChange={setBrand('secondaryColor')} />
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="card-body space-y-3">
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Typography</p>
                            <div>
                              <label className="block text-xs font-medium text-primary mb-1">Font Family</label>
                              <Select value={branding.fontFamily} onChange={setBrand('fontFamily')} size="sm"
                                options={FONTS.map(f => ({ value: f.value, label: f.label }))} />
                              <p className="text-sm text-secondary mt-2" style={{ fontFamily: `'${branding.fontFamily}', sans-serif` }}>
                                The quick brown fox jumps over the lazy dog
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <BrandPreviewPanel branding={branding} />
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Hierarchy ── */}
                {step === 3 && (
                  <HierarchyWizardStep
                    communityName={formData.name}
                    communityType={communityTypesList.find(c => c.slug === formData.type)}
                    csaName={formData.csaName}
                    isEditMode={false}
                    hierarchyTemplate={hierarchyTemplate}
                    onChange={setHierarchyTemplate}
                    onSkip={() => { setHierarchySkipped(true); setStep(4) }}
                    hierarchySkipped={hierarchySkipped}
                    onStatusChange={setHierarchyStatus}
                    getDefaultHierarchyForType={getDefaultHierarchyForType}
                    getScratchHierarchy={getScratchHierarchy}
                    builderKey={`new-${formData.type}-${hierarchyBuilderVersion}`}
                  />
                )}

                {/* ── STEP 4: Review + Create ── */}
                {step === 4 && (
                  <div className="space-y-3">
                    <div className="card">
                      <div className="card-body space-y-4">
                        <h2 className="text-sm font-semibold text-primary">Review & Create</h2>

                        {/* Community */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Community</h3>
                            <button onClick={() => setStep(1)} className="text-xs text-teal hover:underline">[Edit]</button>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div><p className="text-secondary text-xs mb-0.5">Name</p><p className="font-semibold text-primary">{formData.name}</p></div>
                            <div><p className="text-secondary text-xs mb-0.5">Type</p><p className="font-medium text-primary">{communityType?.name}</p></div>
                            {formData.description && (
                              <div className="col-span-2"><p className="text-secondary text-xs mb-0.5">Description</p><p className="text-primary text-sm">{formData.description}</p></div>
                            )}
                          </div>
                        </div>

                        {/* Domain */}
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Domain</h3>
                            <button onClick={() => setStep(2)} className="text-xs text-teal hover:underline">[Edit]</button>
                          </div>
                          <p className="text-sm font-mono text-teal font-medium">{domainDisplay || '(not set)'}</p>
                        </div>

                        {/* Branding */}
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Branding</h3>
                            <button onClick={() => setStep(2)} className="text-xs text-teal hover:underline">[Edit]</button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-5 h-5 rounded-full border border-border" style={{ background: branding.primaryColor }} />
                              <div className="w-5 h-5 rounded-full border border-border" style={{ background: branding.secondaryColor }} />
                            </div>
                            {branding.logo
                              ? <img src={branding.logo} alt="logo" className="h-5 object-contain" />
                              : <span className="text-xs text-secondary italic">No logo (upload after setup)</span>}
                            <span className="text-xs text-secondary">{branding.fontFamily}</span>
                          </div>
                        </div>

                        {/* Hierarchy */}
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Hierarchy</h3>
                            <button onClick={() => setStep(3)} className="text-xs text-teal hover:underline">[Edit]</button>
                          </div>
                          {hierarchySkipped ? (
                            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-button">
                              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700">
                                Hierarchy not configured. You can set it up after creation in /admin/hierarchy
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs text-secondary">
                              {hierarchyLevels.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {hierarchyLevels.map(level => <span key={level} className="badge badge-gray">{level}</span>)}
                                </div>
                              ) : (
                                <p className="italic">No levels configured</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* CSA */}
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Community Super Admin</h3>
                            <button onClick={() => setStep(1)} className="text-xs text-teal hover:underline">[Edit]</button>
                          </div>
                          <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
                            <div><p className="text-secondary text-xs mb-0.5">Name</p><p className="font-medium text-primary">{formData.csaName}</p></div>
                            <div><p className="text-secondary text-xs mb-0.5">Email</p><p className="font-medium text-primary">{formData.csaEmail}</p></div>
                            <div><p className="text-secondary text-xs mb-0.5">Phone</p><p className="font-medium text-primary">+91 {formData.csaPhone}</p></div>
                          </div>
                        </div>

                        {/* Plan */}
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Plan</h3>
                            <button onClick={() => setStep(1)} className="text-xs text-teal hover:underline">[Edit]</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary text-sm">{selectedPlan?.label}</span>
                            <span className="text-teal font-semibold text-sm">{selectedPlan?.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Proceed without nodes dialog ── */}
      {showProceedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-sm font-bold text-primary mb-2">Proceed without nodes?</h3>
            <p className="text-xs text-secondary mb-4">
              You have defined {hierarchyTemplate?.levels?.length || 0} level{hierarchyTemplate?.levels?.length !== 1 ? 's' : ''} but no nodes yet.
              You can add nodes after tenant creation in the Hierarchy Builder at /admin/hierarchy.
              The tenant will be created with an empty hierarchy.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowProceedDialog(false)} className="btn btn-outline text-xs">
                Go Back and Add Nodes
              </button>
              <button
                onClick={() => { setShowProceedDialog(false); setStep(s => s + 1) }}
                className="btn btn-primary text-xs"
              >
                Proceed Anyway — Add Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky footer ── */}
      {!isCreating && !success && (
        <div className="sticky bottom-0 z-30 flex-shrink-0 border-t border-border bg-white">
          {/* Hierarchy status bar */}
          {step === 3 && (
            <div className={`px-5 py-2 flex items-center justify-between text-xs border-b
              ${hierarchyStatus.state === 'A' ? 'bg-red-50 border-red-100' : ''}
              ${hierarchyStatus.state === 'B' ? 'bg-[#FFF8E1] border-amber-100' : ''}
              ${hierarchyStatus.state === 'C' ? 'bg-white border-border' : ''}
            `}>
              <span className={`font-medium
                ${hierarchyStatus.state === 'A' ? 'text-danger' : ''}
                ${hierarchyStatus.state === 'B' ? 'text-amber-700' : ''}
                ${hierarchyStatus.state === 'C' ? 'text-secondary' : ''}
              `}>
                {hierarchyStatus.state === 'A' && '⚠ Define at least one hierarchy level before proceeding'}
                {hierarchyStatus.state === 'B' && '⚠ No nodes created yet. You can proceed and add nodes later in Hierarchy Builder, or add them now.'}
                {hierarchyStatus.state === 'C' && (
                  <>
                    {formData.name || 'Community'} · {hierarchyTemplate?.levels?.length || 0} level{hierarchyTemplate?.levels?.length !== 1 ? 's' : ''} · {hierarchyTemplate?.nodes?.length || 0} nodes created ·{' '}
                    <span className="italic text-secondary/70 font-normal">Level Admins assigned after creation</span>
                  </>
                )}
              </span>
              {hierarchyStatus.state === 'C' && (
                <span className="text-success font-medium">Auto-saved ✓</span>
              )}
            </div>
          )}

          <div className="px-5 py-3 flex items-center justify-between">
            <button
              className="btn btn-outline"
              onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/admin/tenants')}
            >
              ← {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < STEP_META.length ? (
              <button
                className={`btn ${step === 3 && !hierarchyStatus.canProceed ? 'btn-outline opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                onClick={handleNext}
                disabled={step === 3 && !hierarchyStatus.canProceed}
              >
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleCreate}>Create Tenant</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
