import { useRef, useState } from 'react'
import { Check, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import useMasterSettingsStore from '../../../store/masterSettingsStore'

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'America/New_York',
  'Europe/London', 'Asia/Singapore', 'Australia/Sydney', 'UTC',
]

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
]

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[12px] font-semibold text-[#1A237E]">{label}</label>
      {children}
      {hint && <p className="text-[10.5px] text-[#90A4AE]">{hint}</p>}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[10.5px] font-semibold uppercase tracking-widest text-[#90A4AE]">{children}</span>
      <span className="flex-1 h-px bg-[#E8EDF5]" />
    </div>
  )
}

export default function PlatformIdentityTab() {
  const platformIdentity = useMasterSettingsStore(s => s.platformIdentity)
  const updatePlatformIdentity = useMasterSettingsStore(s => s.updatePlatformIdentity)
  const markClean = useMasterSettingsStore(s => s.markClean)

  const [tzFilter, setTzFilter] = useState('')
  const [tzOpen, setTzOpen] = useState(false)
  const fileRef = useRef(null)

  const filteredTz = TIMEZONES.filter(t => t.toLowerCase().includes(tzFilter.toLowerCase()))
  const pi = platformIdentity

  const save = () => {
    markClean()
    toast.success('Platform identity saved ✓')
  }

  const onLogo = e => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => updatePlatformIdentity({ logoUrl: reader.result })
    reader.readAsDataURL(f)
  }

  return (
    <div className="p-3 max-w-[600px] space-y-5 p-5">
      {/* Page heading */}
      <div>
        <h2 className="text-[15px] font-bold text-[#1B3A6B]">Platform Identity</h2>
        <p className="text-[12px] text-[#90A4AE] mt-0.5">
          Shown in PA console, emails, and support comms. Changes apply platform-wide.
        </p>
      </div>

      <div className="rounded-[10px] border border-[#D0DCF0] bg-white shadow-[0_2px_8px_rgba(27,58,107,0.06)] divide-y divide-[#EEF2FA]">

        {/* ── Basic details ── */}
        <div className="p-5 space-y-4">
          <SectionHeading>Basic details</SectionHeading>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Platform name *" hint="Shown in browser tab and PA console">
              <input
                className="w-full input rounded-[8px] text-[13px]"
                value={pi.name}
                onChange={e => updatePlatformIdentity({ name: e.target.value })}
                placeholder="Community Networking Platform"
              />
            </Field>
            <Field label="Short name *" hint={`${(pi.shortName || '').length}/6 · Used in sidebar`}>
              <input
                className="w-full input rounded-[8px] text-[13px]"
                maxLength={6}
                value={pi.shortName || ''}
                onChange={e => updatePlatformIdentity({ shortName: e.target.value })}
                placeholder="CNP"
              />
            </Field>
          </div>

          <Field label="Tagline" hint="Shown on login pages and splash screens">
            <input
              className="w-full input rounded-[8px] text-[13px]"
              value={pi.tagline || ''}
              onChange={e => updatePlatformIdentity({ tagline: e.target.value })}
              placeholder="Connect. Measure. Grow."
            />
          </Field>
        </div>

        {/* ── Support contact ── */}
        <div className="p-5 space-y-4">
          <SectionHeading>Support contact</SectionHeading>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Support email *">
              <input
                type="email"
                className="w-full input rounded-[8px] text-[13px]"
                value={pi.supportEmail || ''}
                onChange={e => updatePlatformIdentity({ supportEmail: e.target.value })}
                placeholder="support@yourplatform.com"
              />
            </Field>
            <Field label="Support WhatsApp *">
              <input
                className="w-full input rounded-[8px] text-[13px]"
                value={pi.supportWhatsApp || ''}
                onChange={e => updatePlatformIdentity({ supportWhatsApp: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>
        </div>

        {/* ── Regional defaults ── */}
        <div className="p-5 space-y-4">
          <SectionHeading>Regional defaults</SectionHeading>
          <div className="grid grid-cols-2 gap-4">
            {/* Timezone */}
            <div className="relative">
              <Field label="Timezone *">
                <input
                  className="w-full input rounded-[8px] text-[13px]"
                  placeholder="Search timezones…"
                  value={tzOpen ? tzFilter : pi.timezone || ''}
                  onFocus={() => { setTzOpen(true); setTzFilter(pi.timezone || '') }}
                  onChange={e => { setTzFilter(e.target.value); setTzOpen(true) }}
                  onBlur={() => setTimeout(() => setTzOpen(false), 180)}
                />
              </Field>
              {tzOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-44 overflow-y-auto bg-white border border-[#D0DCF0] rounded-[8px] shadow-lg">
                  {filteredTz.length === 0 && (
                    <p className="px-3 py-2 text-[12px] text-[#90A4AE]">No match</p>
                  )}
                  {filteredTz.map(tz => (
                    <button
                      key={tz}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-[12.5px] hover:bg-[#F4F8FF] ${pi.timezone === tz ? 'text-[#028090] font-medium' : 'text-[#1A237E]'}`}
                      onMouseDown={e => {
                        e.preventDefault()
                        updatePlatformIdentity({ timezone: tz })
                        setTzOpen(false)
                      }}
                    >
                      {tz}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency */}
            <Field label="Currency *">
              <select
                className="w-full input rounded-[8px] text-[13px]"
                value={pi.currency || 'INR'}
                onChange={e => {
                  const c = CURRENCIES.find(x => x.code === e.target.value)
                  updatePlatformIdentity({ currency: e.target.value, currencySymbol: c?.symbol || '₹' })
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.symbol} {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* ── Logo ── */}
        <div className="p-5 space-y-3">
          <SectionHeading>Platform logo</SectionHeading>
          <div className="flex items-start gap-4">
            {/* Logo preview area */}
            <div
              className="w-[200px] h-[72px] flex-shrink-0 border-2 border-dashed border-[#D0DCF0] rounded-[10px] flex items-center justify-center bg-[#FAFBFF] overflow-hidden cursor-pointer hover:border-[#028090]/50 transition-colors"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
              {pi.logoUrl ? (
                <img src={pi.logoUrl} alt="Platform logo" className="max-h-[60px] max-w-[180px] object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-[#90A4AE]">
                  <Upload size={18} />
                  <span className="text-[11px]">Click to upload</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-[12px] font-semibold text-[#1A237E]">
                {pi.logoUrl ? 'Logo uploaded' : 'No logo yet'}
              </p>
              <p className="text-[11px] text-[#90A4AE]">PNG or SVG · Transparent bg · 400×160px recommended</p>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-[12px] text-[#028090] font-semibold hover:underline"
                >
                  {pi.logoUrl ? 'Change' : 'Upload'}
                </button>
                {pi.logoUrl && (
                  <button
                    type="button"
                    onClick={() => updatePlatformIdentity({ logoUrl: null })}
                    className="text-[12px] text-[#BF360C] hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
        </div>
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={save}
        className="inline-flex items-center gap-2 h-[38px] px-6 rounded-[8px] bg-[#028090] text-white text-[13px] font-semibold hover:bg-[#026a76] transition-colors shadow-sm"
      >
        <Check size={15} /> Save Platform Identity
      </button>
    </div>
  )
}
