import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Check, ChevronRight, Lock, AlertTriangle, AlertCircle,
  Camera, Layers, Monitor, Smartphone, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { tenants as TENANTS_DATA, PLANS, COMMUNITY_TYPES } from '../../data/tenants'
import useMasterSettingsStore from '../../store/masterSettingsStore'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonLine } from '../../components/Skeleton'
import Select from '../../components/Select'
import CommunityTypeHierarchyBuilder from './settings/CommunityTypeHierarchyBuilder'

// ── Branding helpers (mirrors TenantNew) ──────────────────────────────────────
const FONTS = [
  { value: 'Inter',   label: 'Inter'   },
  { value: 'Poppins', label: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { value: 'Roboto',  label: 'Roboto',  url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { value: 'Lato',    label: 'Lato',    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { value: 'Nunito',  label: 'Nunito',  url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
]

const PREVIEW_COLORS = ['#028090', '#1B3A6B', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']

function BrandColorField({ label, value, onChange }) {
  const ref = useRef(null)
  return (
    <div>
      <p className="text-xs font-medium text-primary mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => ref.current?.click()}
          className="w-8 h-8 rounded-full border-2 border-border shadow-sm flex-shrink-0 hover:scale-110 transition-transform"
          style={{ background: value }} />
        <input type="text" value={value}
          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '#') onChange(e.target.value) }}
          className="input font-mono text-xs" style={{ maxWidth: 96 }} maxLength={7} spellCheck={false} />
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
              <span className="font-semibold">9:41</span><span>▲▲ WiFi 🔋</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4"
              style={{ background: `linear-gradient(155deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {logo
                ? <img src={logo} alt="" style={{ height: 36, maxWidth: 100, objectFit: 'contain' }} />
                : <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white"
                    style={{ background: 'rgba(255,255,255,0.18)' }}>{initial}</div>}
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
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" />
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
              : <><div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ background: secondaryColor }}>{initial}</div>
                  <span className="text-white text-[9px] font-semibold truncate">{displayName || 'Community'}</span></>}
          </div>
          {['Dashboard','Members','Meetings','Referrals','Events','Settings'].map((item, i) => (
            <div key={item} className="flex items-center gap-1.5 px-2.5 py-1 text-[9px]"
              style={{ color: i===0 ? '#fff' : 'rgba(255,255,255,0.52)', background: i===0 ? 'rgba(255,255,255,0.13)' : 'transparent', borderLeft: i===0 ? `2px solid ${secondaryColor}` : '2px solid transparent' }}>
              <div className="w-1 h-1 rounded-sm flex-shrink-0" style={{ background: i===0 ? secondaryColor : 'rgba(255,255,255,0.28)' }} />{item}
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
                      style={{ background: 'rgba(255,255,255,0.18)' }}>{initial}</div>}
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
    <div className="flex-shrink-0 sticky top-5" style={{ width: tab === 'web' ? 340 : 208 }}>
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
              <Icon size={10} />{label}
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

// ── Step meta ─────────────────────────────────────────────────────────────────
const STEP_META = [
  { label: 'Community Details', desc: 'Name, type, CSA & plan'  },
  { label: 'Domain',            desc: 'Domain & SSL settings'   },
  { label: 'Branding',          desc: 'Logo, colors & identity' },
  { label: 'Hierarchy',         desc: 'Org structure & levels'  },
  { label: 'App Build',         desc: 'iOS & Android settings'  },
  { label: 'Review & Save',     desc: 'Confirm your changes'    },
]

// ── Main component ─────────────────────────────────────────────────────────────
export default function TenantEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const loading = useLoading(800)

  const getActivePlans = useMasterSettingsStore(s => s.getActivePlans)
  const getActiveCommunityTypes = useMasterSettingsStore(s => s.getActiveCommunityTypes)
  const communityTypesList = getActiveCommunityTypes()
  const activePlans = getActivePlans()

  const originalTenant = TENANTS_DATA.find(t => t.id === id)

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // ── Step 1: Community details ───────────────────────────────────────────────
  const [formData, setFormData] = useState(() => {
    if (!originalTenant) return {}
    return {
      name:          originalTenant.name,
      type:          originalTenant.type,
      description:   originalTenant.description || '',
      csaName:       originalTenant.csaName,
      csaEmail:      originalTenant.csaEmail,
      csaPhone:      originalTenant.csaPhone,
      plan:          originalTenant.plan,
      status:        originalTenant.status,
      suspendReason: originalTenant.suspendedReason || '',
    }
  })

  const showSuspensionFields =
    formData.status === 'suspended' && originalTenant?.status !== 'suspended'

  const set = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }))
  }

  // ── Step 2: Domain ──────────────────────────────────────────────────────────
  const [useCustomDomain, setUseCustomDomain] = useState(false)
  const [customDomain, setCustomDomain] = useState('')

  // ── Step 3: Branding ────────────────────────────────────────────────────────
  const [branding, setBranding] = useState({
    displayName:    originalTenant?.name || '',
    tagline:        '',
    logo:           null,
    appIcon:        null,
    splashScreen:   null,
    primaryColor:   '#1B3A6B',
    secondaryColor: '#028090',
    fontFamily:     'Inter',
  })
  const setBrand = key => val => setBranding(prev => ({ ...prev, [key]: val }))

  useEffect(() => {
    const font = FONTS.find(f => f.value === branding.fontFamily)
    if (font?.url && !document.querySelector(`link[href="${font.url}"]`)) {
      const el = document.createElement('link')
      el.rel = 'stylesheet'; el.href = font.url
      document.head.appendChild(el)
    }
  }, [branding.fontFamily])

  // ── Step 4: Hierarchy ───────────────────────────────────────────────────────
  const getDefaultHierarchyForType = (typeSlug) => {
    const ct = communityTypesList.find(c => c.slug === typeSlug)
    const levels = (ct?.defaultHierarchyPreset?.levels || []).map((level, idx) => ({
      id: level?.id || `l${idx + 1}`,
      name: (level?.name || '').trim() || `Level ${idx + 1}`,
      color: level?.color || PREVIEW_COLORS[idx] || '#546E7A',
    }))
    return { levels, nodes: ct?.defaultHierarchyPreset?.nodes || [] }
  }

  const [hierarchyTemplate, setHierarchyTemplate] = useState(() =>
    getDefaultHierarchyForType(originalTenant?.type || 'professional_networking')
  )
  const [hierarchyBuilderVersion, setHierarchyBuilderVersion] = useState(1)

  useEffect(() => {
    setHierarchyTemplate(getDefaultHierarchyForType(formData.type))
    setHierarchyBuilderVersion(v => v + 1)
  }, [formData.type])

  // ── Step 5: App Build ───────────────────────────────────────────────────────
  const [appBuild, setAppBuild] = useState({
    platforms:   ['ios', 'android'],
    triggerNow:  false,
  })

  // ── Plan cards ──────────────────────────────────────────────────────────────
  const planCards = activePlans.map(p => ({
    value:       p.slug,
    label:       p.name,
    price:       `₹${Number(p.price).toLocaleString('en-IN')}/${p.billingCycle === 'annual' ? 'yr' : 'mo'}`,
    description: p.description,
    recommended: p.isRecommended,
  }))

  // Fall back to static PLANS if masterSettings returns nothing
  const plansToShow = planCards.length > 0 ? planCards : PLANS.map(p => ({
    value: p.value, label: p.label, price: p.price, description: p.description, recommended: p.recommended,
  }))

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {}
    if (!formData.name?.trim())  e.name     = true
    if (!formData.type)          e.type     = true
    if (!formData.csaName?.trim())  e.csaName  = true
    if (!formData.csaEmail?.trim()) e.csaEmail = true
    if (!formData.csaPhone?.trim()) e.csaPhone = true
    if (!formData.plan)          e.plan     = true
    if (!formData.status)        e.status   = true
    if (showSuspensionFields && !formData.suspendReason?.trim()) e.suspendReason = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    setStep(s => Math.min(s + 1, STEP_META.length))
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    toast.success('Tenant updated successfully ✓')
    navigate(`/admin/tenants/${id}`)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const communityType  = communityTypesList.find(c => c.slug === formData.type)
  const selectedPlan   = plansToShow.find(p => p.value === formData.plan)
  const hierarchyLevels = (hierarchyTemplate?.levels || []).map(l => l?.name).filter(Boolean)

  const appBuildPrereqs = [
    { label: 'Logo uploaded',        met: !!branding.logo         },
    { label: 'App icon uploaded',    met: !!branding.appIcon      },
    { label: 'Brand colors set',     met: !!(branding.primaryColor && branding.secondaryColor) },
    { label: 'Hierarchy configured', met: (hierarchyTemplate?.levels?.length || 0) > 0 },
  ]

  // ── Loading / not found ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-3 space-y-6">
        <SkeletonLine w="w-48" h="h-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            {Array(5).fill(0).map((_, i) => <div key={i} className="space-y-1.5"><SkeletonLine w="w-24" h="h-3" /><SkeletonLine w="w-full" h="h-10" /></div>)}
          </div>
        </div>
      </div>
    )
  }

  if (!originalTenant) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg font-semibold text-primary">Tenant not found</p>
        <Link to="/admin/tenants" className="btn btn-outline btn-sm">Back to Tenants</Link>
      </div>
    )
  }

  return (
    <div className="p-3 flex flex-col bg-surface" style={{ minHeight: 'calc(100vh - 44px)' }}>

      {/* ── Page header ── */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <Link to="/admin/tenants" className="hover:text-teal transition-colors">Tenants</Link>
          <ChevronRight size={11} />
          <Link to={`/admin/tenants/${id}`} className="hover:text-teal transition-colors">{originalTenant.name}</Link>
          <ChevronRight size={11} />
          <span className="text-primary font-medium">Edit</span>
        </div>
        <span className="text-border text-xs mx-0.5">|</span>
        <h1 className="text-sm font-bold text-navy">Edit Tenant</h1>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-border flex flex-col">
          <div className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            <p className="text-2xs font-semibold uppercase tracking-widest text-secondary/50 px-3 pt-2 pb-3">Edit Steps</p>
            {STEP_META.map((s, i) => {
              const num    = i + 1
              const done   = num < step
              const active = num === step
              return (
                <button
                  key={s.label}
                  type="button"
                  disabled={num > step}
                  onClick={() => done && setStep(num)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-left transition-all
                    ${active ? 'bg-teal/10 text-teal' : done ? 'text-secondary hover:bg-surface' : 'text-secondary/40 cursor-default'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all
                    ${active ? 'bg-teal border-teal text-white' : done ? 'bg-teal border-teal text-white' : 'bg-white border-border text-secondary/40'}`}>
                    {done ? <Check size={11} /> : num}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${active ? 'text-teal' : ''}`}>{s.label}</p>
                    <p className="text-[10px] text-secondary/60 leading-tight mt-0.5 truncate">{s.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Progress */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex items-center justify-between text-[10px] text-secondary mb-1.5">
              <span>Progress</span>
              <span className="font-semibold">{Math.round(((step - 1) / STEP_META.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / STEP_META.length) * 100}%` }} />
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 max-w-4xl">

            {/* ── STEP 1: Community Details ── */}
            {step === 1 && (
              <div className="card">
                <div className="card-body space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-primary mb-1">
                        Community Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" value={formData.name} onChange={e => set('name', e.target.value)}
                        placeholder="e.g. BNI Mumbai Metro"
                        className={`input ${errors.name ? 'border-danger ring-1 ring-danger/30' : ''}`} />
                      {errors.name && <p className="text-xs text-danger mt-0.5">Required</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-primary mb-1">
                        Community Type <span className="text-danger">*</span>
                      </label>
                      <Select value={formData.type} onChange={v => set('type', v)} size="sm"
                        options={
                          communityTypesList.length > 0
                            ? communityTypesList.map(ct => ({ value: ct.slug, label: `${ct.name} — ${ct.examples}` }))
                            : COMMUNITY_TYPES.map(ct => ({ value: ct.value, label: `${ct.emoji} ${ct.label}` }))
                        }
                        error={errors.type ? 'Required' : undefined} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-primary mb-1">
                      Description <span className="text-secondary font-normal">(optional)</span>
                    </label>
                    <textarea value={formData.description} onChange={e => set('description', e.target.value)}
                      placeholder="Brief description of this community..." className="input h-14 resize-none pt-2" />
                  </div>

                  {/* CSA */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2.5">Community Super Admin (CSA)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-primary mb-1">Full Name <span className="text-danger">*</span></label>
                        <input type="text" value={formData.csaName} onChange={e => set('csaName', e.target.value)}
                          placeholder="Full name" className={`input ${errors.csaName ? 'border-danger ring-1 ring-danger/30' : ''}`} />
                        {errors.csaName && <p className="text-xs text-danger mt-0.5">Required</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-primary mb-1">Email <span className="text-danger">*</span></label>
                        <input type="email" value={formData.csaEmail} onChange={e => set('csaEmail', e.target.value)}
                          placeholder="email@example.com" className={`input ${errors.csaEmail ? 'border-danger ring-1 ring-danger/30' : ''}`} />
                        {errors.csaEmail && <p className="text-xs text-danger mt-0.5">Required</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-primary mb-1">Phone <span className="text-danger">*</span></label>
                        <div className={`flex h-[34px] rounded-button border overflow-hidden transition-colors
                          ${errors.csaPhone ? 'border-danger ring-1 ring-danger/20' : 'border-border focus-within:border-teal focus-within:ring-1 focus-within:ring-teal/20'}`}>
                          <span className="flex items-center px-2.5 bg-surface border-r border-border text-secondary text-xs flex-shrink-0 select-none">+91</span>
                          <input type="text" value={formData.csaPhone} onChange={e => set('csaPhone', e.target.value.replace(/\D/g, ''))}
                            placeholder="10-digit number" maxLength={10}
                            className="flex-1 h-full px-2.5 text-sm outline-none bg-white text-primary placeholder:text-secondary" />
                        </div>
                        {errors.csaPhone && <p className="text-xs text-danger mt-0.5">Required</p>}
                      </div>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2.5">
                      Subscription Plan <span className="text-danger normal-case font-normal">*</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {plansToShow.map(plan => {
                        const selected = formData.plan === plan.value
                        return (
                          <label key={plan.value}
                            className={`relative cursor-pointer rounded-card border-2 p-3 transition-all
                              ${selected ? 'border-teal bg-teal/5' : 'border-border bg-white hover:border-teal/40'}`}>
                            <input type="radio" name="plan" value={plan.value} checked={selected}
                              onChange={() => set('plan', plan.value)} className="sr-only" />
                            {plan.recommended && <span className="badge badge-teal text-2xs absolute top-2.5 right-2.5">Recommended</span>}
                            {selected && <div className="absolute top-2.5 left-2.5"><Check size={12} className="text-teal" /></div>}
                            <p className={`font-bold text-sm ${selected ? 'text-teal' : 'text-primary'} ${plan.recommended ? 'pr-24' : ''}`}>{plan.label}</p>
                            <p className="text-teal font-bold text-sm mt-0.5">{plan.price}</p>
                            <p className="text-xs text-secondary mt-1 leading-snug">{plan.description}</p>
                          </label>
                        )
                      })}
                    </div>
                    {errors.plan && <p className="text-xs text-danger mt-1">Select a plan</p>}
                  </div>

                  {/* Status */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2.5">Status</p>
                    <Select value={formData.status} onChange={v => set('status', v)} size="sm"
                      options={[
                        { value: 'active',        label: 'Active'        },
                        { value: 'pending_setup', label: 'Pending Setup' },
                        { value: 'suspended',     label: 'Suspended'     },
                      ]}
                      error={errors.status ? 'Required' : undefined} />
                    {showSuspensionFields && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-start gap-3 p-3 bg-amber/10 border border-amber/30 rounded-card">
                          <AlertTriangle size={14} className="text-amber flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-secondary">
                            This will immediately block all <strong className="text-primary">{originalTenant.memberCount}</strong> members.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-primary mb-1">
                            Suspension Reason <span className="text-danger">*</span>
                          </label>
                          <textarea value={formData.suspendReason} onChange={e => set('suspendReason', e.target.value)}
                            placeholder="Enter reason for suspension..."
                            className={`input h-16 resize-none ${errors.suspendReason ? 'border-danger ring-1 ring-danger/30' : ''}`} />
                          {errors.suspendReason && <p className="text-xs text-danger mt-0.5">Required</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Domain ── */}
            {step === 2 && (
              <div className="card">
                <div className="card-body space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-primary">Domain Settings</h2>
                    <p className="text-xs text-secondary mt-0.5">Subdomain is locked after provisioning. Contact support to change it.</p>
                  </div>

                  {/* Locked subdomain */}
                  <div>
                    <label className="block text-xs font-medium text-primary mb-1">Subdomain</label>
                    <div className="relative">
                      <input type="text" value={originalTenant.domain} disabled
                        className="input bg-surface text-secondary cursor-not-allowed opacity-70 pr-9" />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50" />
                    </div>
                    <p className="text-xs text-secondary mt-1">SSL auto-provisioned · Cloudflare CDN ✓</p>
                  </div>

                  {/* Custom domain */}
                  <div className="border-t border-border pt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <button type="button" role="switch" aria-checked={useCustomDomain}
                        onClick={() => setUseCustomDomain(v => !v)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${useCustomDomain ? 'bg-teal' : 'bg-border'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${useCustomDomain ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <span className="text-xs font-medium text-primary">Use custom domain</span>
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
            )}

            {/* ── STEP 3: Branding ── */}
            {step === 3 && (
              <div className="flex gap-5 items-start">
                <div className="flex-1 space-y-4 min-w-0">
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
                        <BrandColorField label="Primary Color"   value={branding.primaryColor}   onChange={setBrand('primaryColor')}   />
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

                  <div className="card">
                    <div className="card-body space-y-3">
                      <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Splash Screen</p>
                      <div className="flex gap-6 items-start">
                        <BrandUploadBox value={branding.splashScreen} onChange={setBrand('splashScreen')} onRemove={() => setBrand('splashScreen')(null)}
                          w={90} h={160} label="Upload Splash" hint="1080×1920 px recommended (9:16)" accept="image/png,image/jpeg" />
                        <p className="text-[11px] text-secondary leading-snug mt-1">
                          If left blank, the app auto-generates a splash using your logo and brand colors.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <BrandPreviewPanel branding={branding} />
              </div>
            )}

            {/* ── STEP 4: Hierarchy ── */}
            {step === 4 && (
              <div className="card p-0 overflow-hidden">
                <div className="h-[760px]">
                  <CommunityTypeHierarchyBuilder
                    key={`edit-${formData.type}-${hierarchyBuilderVersion}`}
                    title={formData.name?.trim() || originalTenant.name}
                    initialTemplate={hierarchyTemplate}
                    onChange={setHierarchyTemplate}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 5: App Build ── */}
            {step === 5 && (
              <div className="card">
                <div className="card-body space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-primary">App Build</h2>
                    <p className="text-xs text-secondary mt-0.5">
                      Current status: <span className="font-medium text-primary capitalize">{originalTenant.appStatus || 'Unknown'}</span>
                      {originalTenant.buildVersion && <span className="text-secondary"> · v{originalTenant.buildVersion}</span>}
                    </p>
                  </div>

                  <div>
                    <p className="text-2xs font-semibold text-secondary uppercase tracking-wide mb-2">Build Prerequisites</p>
                    <div className="space-y-1.5">
                      {appBuildPrereqs.map(req => (
                        <div key={req.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${req.met ? 'bg-success/15' : 'bg-danger/10'}`}>
                            {req.met ? <Check size={9} className="text-success" /> : <X size={9} className="text-danger" />}
                          </div>
                          <span className={`text-xs ${req.met ? 'text-primary' : 'text-danger'}`}>{req.label}</span>
                          {!req.met && <span className="text-[10px] text-secondary italic">— go back to fill this in</span>}
                        </div>
                      ))}
                    </div>
                    {appBuildPrereqs.some(r => !r.met) && (
                      <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-button px-3 py-2">
                        <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">Some prerequisites are incomplete. You can still trigger the build later from App Deployment.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-2xs font-semibold text-secondary uppercase tracking-wide mb-2">Platforms</p>
                    <div className="flex gap-3">
                      {[{ id: 'ios', label: 'iOS', icon: '🍎' }, { id: 'android', label: 'Android', icon: '🤖' }].map(p => {
                        const selected = appBuild.platforms.includes(p.id)
                        return (
                          <button key={p.id} type="button"
                            onClick={() => setAppBuild(prev => ({
                              ...prev,
                              platforms: selected ? prev.platforms.filter(x => x !== p.id) : [...prev.platforms, p.id],
                            }))}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-button border-2 text-sm font-medium transition-all
                              ${selected ? 'border-teal bg-teal/5 text-teal' : 'border-border bg-white text-secondary hover:border-teal/40'}`}>
                            <span>{p.icon}</span>{p.label}
                            {selected && <Check size={12} className="text-teal" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-primary">Trigger rebuild after saving</p>
                      <p className="text-[11px] text-secondary mt-0.5">If off, you can trigger manually from App Deployment</p>
                    </div>
                    <button type="button" role="switch" aria-checked={appBuild.triggerNow}
                      onClick={() => setAppBuild(prev => ({ ...prev, triggerNow: !prev.triggerNow }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${appBuild.triggerNow ? 'bg-teal' : 'bg-border'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${appBuild.triggerNow ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 6: Review & Save ── */}
            {step === 6 && (
              <div className="space-y-3">
                <div className="card">
                  <div className="card-body space-y-4">
                    <h2 className="text-sm font-semibold text-primary">Review Changes</h2>

                    <div className="space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Community</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><p className="text-secondary text-xs mb-0.5">Name</p><p className="font-semibold text-primary">{formData.name}</p></div>
                        <div><p className="text-secondary text-xs mb-0.5">Type</p><p className="font-medium text-primary">{communityType?.name || formData.type}</p></div>
                        <div><p className="text-secondary text-xs mb-0.5">Status</p><p className="font-medium text-primary capitalize">{formData.status?.replace('_', ' ')}</p></div>
                        {formData.description && (
                          <div className="col-span-2"><p className="text-secondary text-xs mb-0.5">Description</p><p className="text-primary text-sm">{formData.description}</p></div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Domain</h3>
                      <p className="text-sm font-mono text-teal font-medium">{originalTenant.domain}</p>
                      {useCustomDomain && customDomain && (
                        <p className="text-xs text-secondary">Custom: <span className="font-mono text-primary">{customDomain}</span></p>
                      )}
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Branding</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-5 h-5 rounded-full border border-border" style={{ background: branding.primaryColor }} />
                          <div className="w-5 h-5 rounded-full border border-border" style={{ background: branding.secondaryColor }} />
                        </div>
                        {branding.logo
                          ? <img src={branding.logo} alt="logo" className="h-5 object-contain" />
                          : <span className="text-xs text-secondary italic">No logo uploaded</span>}
                        <span className="text-xs text-secondary">{branding.fontFamily}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Community Super Admin</h3>
                      <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
                        <div><p className="text-secondary text-xs mb-0.5">Name</p><p className="font-medium text-primary">{formData.csaName}</p></div>
                        <div><p className="text-secondary text-xs mb-0.5">Email</p><p className="font-medium text-primary">{formData.csaEmail}</p></div>
                        <div><p className="text-secondary text-xs mb-0.5">Phone</p><p className="font-medium text-primary">+91 {formData.csaPhone}</p></div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Plan</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">{selectedPlan?.label}</span>
                        <span className="text-teal font-semibold text-sm">{selectedPlan?.price}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">Hierarchy</h3>
                      {hierarchyLevels.length > 0
                        ? <div className="flex flex-wrap gap-1">{hierarchyLevels.map(lvl => <span key={lvl} className="badge badge-gray">{lvl}</span>)}</div>
                        : <p className="text-xs text-secondary italic">No levels configured</p>}
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <h3 className="text-2xs font-semibold text-secondary uppercase tracking-wide">App Build</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          {appBuild.platforms.includes('ios') && <span className="badge badge-gray">🍎 iOS</span>}
                          {appBuild.platforms.includes('android') && <span className="badge badge-gray">🤖 Android</span>}
                          {appBuild.platforms.length === 0 && <span className="text-xs text-secondary italic">No rebuild scheduled</span>}
                        </div>
                        {appBuild.platforms.length > 0 && (
                          <span className={`text-xs ${appBuild.triggerNow ? 'text-success' : 'text-secondary'}`}>
                            {appBuild.triggerNow ? '· Triggers on save' : '· Trigger manually later'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Sticky footer ── */}
      <div className="flex-shrink-0 border-t border-border bg-white px-5 py-3 flex items-center justify-between">
        <button className="btn btn-outline"
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/admin/tenants')}>
          ← {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < STEP_META.length ? (
          <button className="btn btn-primary" onClick={handleNext}>Next →</button>
        ) : (
          <button className="btn btn-primary flex items-center gap-2 min-w-[130px] justify-center" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>Saving...</>
            ) : 'Save Changes'}
          </button>
        )}
      </div>

    </div>
  )
}
