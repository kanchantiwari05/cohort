import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RotateCcw, Save, Check, Smartphone, Monitor, Mail,
  AlertTriangle, Palette, Type, AtSign, Image, Tag,
  Layers, AppWindow, Info, Camera, FileText, ChevronDown,
  Pencil, Trash2, Search, Plus, CheckCircle2, ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { tenants } from '../../data/tenants'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

// ── Constants ─────────────────────────────────────────────────────────────────

const FONTS = [
  { value: 'Inter',   label: 'Inter',   url: null },
  { value: 'Poppins', label: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { value: 'Roboto',  label: 'Roboto',  url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { value: 'Lato',    label: 'Lato',    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { value: 'Nunito',  label: 'Nunito',  url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
]

const CNP_DEFAULTS = {
  primaryColor:   '#1B3A6B',
  secondaryColor: '#028090',
  fontFamily:     'Inter',
}

const EMAIL_TEMPLATE_TYPES = [
  { value: 'welcome',     label: 'Welcome'             },
  { value: 'meeting',     label: 'Meeting Reminder'    },
  { value: 'referral',    label: 'Referral Received'   },
  { value: 'renewal',     label: 'Renewal Reminder'    },
]

const EMAIL_TEMPLATE_DEFAULTS = {
  welcome: {
    subject: 'Welcome to {{community_name}}!',
    body: `Hi {{member_name}},

Welcome to {{community_name}}! Your account is now active.

Log in to start connecting with fellow members — exchange referrals, attend meetings, and grow your professional network.

See you inside,
{{sender_name}}`,
  },
  meeting: {
    subject: 'Reminder: {{meeting_title}} on {{meeting_date}}',
    body: `Hi {{member_name}},

This is a reminder that {{meeting_title}} is scheduled on {{meeting_date}} at {{meeting_time}}.

Location: {{meeting_location}}

Please confirm your attendance if you haven't already.

Best,
{{sender_name}}`,
  },
  referral: {
    subject: '{{giver_name}} sent you a referral!',
    body: `Hi {{member_name}},

{{giver_name}} has sent you a new referral on {{community_name}}.

Business Category: {{category}}
Details: {{description}}

Log in to view the full referral and update its status.

Best,
{{sender_name}}`,
  },
  renewal: {
    subject: 'Your {{community_name}} membership expires in {{days_left}} days',
    body: `Hi {{member_name}},

Your membership in {{community_name}} expires on {{expiry_date}}.

Renew early to keep uninterrupted access to your network, referrals, and community activity.

Contact your Level Admin or reply to this email to renew.

Regards,
{{sender_name}}`,
  },
}

function buildBranding(tenant) {
  if (!tenant) return {}
  const subdomain = tenant.domain?.split('.')[0] ?? tenant.id
  return {
    displayName:      tenant.name,
    tagline:          'Connect. Refer. Grow.',
    logo:             null,
    appIcon:          null,
    primaryColor:     CNP_DEFAULTS.primaryColor,
    secondaryColor:   CNP_DEFAULTS.secondaryColor,
    fontFamily:       CNP_DEFAULTS.fontFamily,
    splashScreen:     null,
    senderName:       tenant.name,
    replyToEmail:     `noreply@${subdomain}.cnp.app`,
    appStoreName:     tenant.name.slice(0, 30),
    shortDescription: `Official networking app for ${tenant.name} members.`.slice(0, 80),
    longDescription:  `${tenant.name} is a professional community powered by CNP. Connect with members, exchange referrals, attend events, and grow your network.`.slice(0, 500),
    emailTemplates:   Object.fromEntries(
      Object.entries(EMAIL_TEMPLATE_DEFAULTS).map(([k, v]) => [k, { ...v }])
    ),
  }
}

// ── Reusable form atoms ───────────────────────────────────────────────────────

function FormSection({ icon: Icon, title, children }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="w-6 h-6 rounded bg-teal/10 flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-teal" />
        </div>
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children, extra }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold text-secondary uppercase tracking-wide">
        {children}
      </label>
      {extra}
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  const ref = useRef(null)

  const handleHex = (e) => {
    const v = e.target.value
    if (/^#[0-9a-fA-F]{0,6}$/.test(v) || v === '#') onChange(v)
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <button
          className="w-10 h-10 rounded-full border-2 border-border shadow-sm flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
          style={{ background: value }}
          onClick={() => ref.current?.click()}
          title="Click to pick colour"
        />
        <input
          type="text"
          value={value}
          onChange={handleHex}
          className="input font-mono text-sm"
          style={{ maxWidth: 115 }}
          spellCheck={false}
          maxLength={7}
        />
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="sr-only"
        />
      </div>
    </div>
  )
}

function UploadBox({ value, onChange, onRemove, w, h, label, hint, accept = 'image/*', round = false }) {
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
    <div className="space-y-1.5">
      <input ref={ref} type="file" accept={accept} onChange={handleFile} className="sr-only" />

      {!value ? (
        <button
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed border-border hover:border-teal bg-surface
                      flex flex-col items-center justify-center gap-1.5 transition-colors ${shape}`}
          style={{ width: w, height: h }}
        >
          <Camera size={16} className="text-secondary" />
          <span className="text-[11px] text-secondary text-center leading-tight px-1">{label}</span>
        </button>
      ) : (
        <div>
          <div className={`border border-border overflow-hidden ${shape}`} style={{ width: w, height: h }}>
            <img src={value} alt="upload preview" className="w-full h-full object-contain bg-gray-50" />
          </div>
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => ref.current?.click()} className="btn-ghost btn btn-sm text-xs">
              Change
            </button>
            <button onClick={onRemove} className="btn-ghost btn btn-sm text-xs text-danger hover:text-danger">
              Remove
            </button>
          </div>
        </div>
      )}

      {hint && <p className="text-[11px] text-secondary leading-snug">{hint}</p>}
    </div>
  )
}

// ── Preview: Mobile ───────────────────────────────────────────────────────────

function MobilePreview({ b }) {
  const { primaryColor, secondaryColor, displayName, tagline, logo, fontFamily } = b
  const initial = displayName?.charAt(0)?.toUpperCase() || 'C'

  return (
    <div className="flex justify-center py-6">
      <div className="relative" style={{ width: 226, height: 456 }}>
        {/* Body */}
        <div
          className="absolute inset-0 rounded-[40px] shadow-2xl"
          style={{ background: '#1c1c1e', padding: '10px 8px 14px' }}
        >
          {/* Screen */}
          <div
            className="w-full h-full rounded-[32px] overflow-hidden flex flex-col"
            style={{ fontFamily: `'${fontFamily}', sans-serif` }}
          >
            {/* Status bar */}
            <div
              className="flex items-center justify-between px-4 pt-2 pb-1 text-white flex-shrink-0"
              style={{ background: primaryColor, fontSize: 9 }}
            >
              <span className="font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <span>▲▲▲</span>
                <span>WiFi</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Splash content */}
            <div
              className="flex-1 flex flex-col items-center justify-center gap-4 px-5 pb-2"
              style={{ background: `linear-gradient(155deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {logo ? (
                <img src={logo} alt="" style={{ height: 44, maxWidth: 130, objectFit: 'contain' }} />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  {initial}
                </div>
              )}

              <div className="text-center space-y-0.5">
                <p className="text-white font-bold text-sm">{displayName || 'Community Name'}</p>
                {tagline && (
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{tagline}</p>
                )}
              </div>

              {/* Login form */}
              <div className="w-full space-y-2 mt-1">
                <div
                  className="rounded-xl px-3 py-2 text-[10px]"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}
                >
                  +91 · Enter phone number
                </div>
                <div
                  className="rounded-xl px-3 py-2.5 text-white text-[11px] text-center font-semibold"
                  style={{ background: secondaryColor }}
                >
                  Get OTP →
                </div>
                <p className="text-center text-[9px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Powered by CNP Platform
                </p>
              </div>
            </div>

            {/* Bottom nav */}
            <div
              className="flex items-center justify-around px-2 py-2 flex-shrink-0"
              style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}
            >
              {[['🏠', 'Home'], ['👥', 'Members'], ['⭐', 'Refs'], ['📅', 'Events'], ['👤', 'Me']].map(
                ([ic, lb], i) => (
                  <div key={lb} className="flex flex-col items-center gap-0.5">
                    <span style={{ fontSize: 13 }}>{ic}</span>
                    <span style={{
                      fontSize: 7,
                      color: i === 0 ? primaryColor : '#bbb',
                      fontWeight: i === 0 ? 600 : 400,
                    }}>{lb}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Dynamic island / notch */}
        <div
          className="absolute top-[12px] left-1/2 -translate-x-1/2 rounded-full z-20"
          style={{ width: 72, height: 16, background: '#1c1c1e' }}
        />
        {/* Home indicator */}
        <div
          className="absolute bottom-[7px] left-1/2 -translate-x-1/2 rounded-full z-10"
          style={{ width: 52, height: 3, background: 'rgba(255,255,255,0.4)' }}
        />
      </div>
    </div>
  )
}

// ── Preview: Web ──────────────────────────────────────────────────────────────

function WebPreview({ b }) {
  const { primaryColor, secondaryColor, displayName, logo } = b
  const initial = displayName?.charAt(0)?.toUpperCase() || 'C'

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg w-full" style={{ maxWidth: 560 }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-gray-100 border-b border-gray-200 px-3 py-2">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded text-[11px] text-gray-400 px-3 py-0.5 max-w-[200px] w-full text-center border border-gray-200">
            app.cnp.app
          </div>
        </div>
        <div style={{ width: 42 }} />
      </div>

      <div className="flex" style={{ height: 296 }}>
        {/* Sidebar */}
        <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 148, background: primaryColor }}>
          {/* Brand */}
          <div className="flex items-center gap-2 px-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {logo ? (
              <img src={logo} alt="" style={{ height: 18, objectFit: 'contain', maxWidth: 86 }} />
            ) : (
              <>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: secondaryColor }}
                >
                  {initial}
                </div>
                <span className="text-white text-[10px] font-semibold truncate leading-tight">
                  {displayName || 'Community'}
                </span>
              </>
            )}
          </div>

          {['Dashboard', 'Members', 'Meetings', 'Referrals', 'Events', 'Settings'].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px]"
              style={{
                color:       i === 0 ? '#fff' : 'rgba(255,255,255,0.52)',
                background:  i === 0 ? 'rgba(255,255,255,0.13)' : 'transparent',
                borderLeft:  i === 0 ? `2px solid ${secondaryColor}` : '2px solid transparent',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0"
                   style={{ background: i === 0 ? secondaryColor : 'rgba(255,255,255,0.28)' }} />
              {item}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 bg-[#F4F8FF] p-3 space-y-2 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold" style={{ color: primaryColor }}>Dashboard</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <div className="w-5 h-5 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            {[['Members', '240'], ['Active', '180'], ['Refs', '48']].map(([k, v]) => (
              <div key={k} className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">{k}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: primaryColor }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Member Activity</div>
            <div className="flex items-end gap-1" style={{ height: 44 }}>
              {[38, 58, 48, 78, 62, 90, 68].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{ height: `${h}%`, background: i === 5 ? primaryColor : `${primaryColor}28` }}
                />
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Recent</div>
            {['Priya → Suresh  ₹50,000', 'Rajesh → Anand  ₹1,20,000'].map(r => (
              <div key={r} className="flex items-center gap-1.5 py-0.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: secondaryColor }} />
                <span className="text-[9px] text-gray-500 truncate">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Preview: Email ────────────────────────────────────────────────────────────

function EmailPreview({ b, templateType = 'welcome' }) {
  const { primaryColor, secondaryColor, displayName, logo, senderName, replyToEmail, emailTemplates } = b
  const tmpl = emailTemplates?.[templateType] ?? EMAIL_TEMPLATE_DEFAULTS[templateType]

  // Resolve template variables for preview
  const resolve = (str) =>
    (str ?? '')
      .replace(/\{\{community_name\}\}/g, displayName || 'Community')
      .replace(/\{\{member_name\}\}/g, 'Priya Sharma')
      .replace(/\{\{sender_name\}\}/g, senderName || displayName || 'Team')
      .replace(/\{\{meeting_title\}\}/g, 'Weekly Networking Meeting')
      .replace(/\{\{meeting_date\}\}/g, '24 Apr 2026')
      .replace(/\{\{meeting_time\}\}/g, '7:00 PM')
      .replace(/\{\{meeting_location\}\}/g, 'Hotel Courtyard, Mumbai')
      .replace(/\{\{giver_name\}\}/g, 'Rohit Shah')
      .replace(/\{\{category\}\}/g, 'IT Services')
      .replace(/\{\{description\}\}/g, 'Looking for a reliable cloud vendor.')
      .replace(/\{\{days_left\}\}/g, '14')
      .replace(/\{\{expiry_date\}\}/g, '1 May 2026')

  const resolvedSubject = resolve(tmpl.subject)
  const resolvedBody    = resolve(tmpl.body)

  return (
    <div className="max-w-[500px] mx-auto">
      {/* Client header */}
      <div className="bg-gray-100 border border-gray-200 rounded-t-xl px-4 py-3 space-y-0.5 text-[11px] text-gray-500">
        {[
          ['From',    `${senderName || displayName} <${replyToEmail}>`],
          ['To',      'member@example.com'],
          ['Subject', resolvedSubject],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="font-semibold w-14 flex-shrink-0">{k}:</span>
            <span className={k === 'Subject' ? 'font-medium text-gray-700' : ''}>{v}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden">
        {/* Header band */}
        <div
          className="flex items-center justify-center py-6 px-6"
          style={{ background: primaryColor }}
        >
          {logo ? (
            <img src={logo} alt="" style={{ height: 34, objectFit: 'contain', maxWidth: 180 }} />
          ) : (
            <span className="text-white font-bold text-lg tracking-wide">{displayName || 'Community'}</span>
          )}
        </div>

        {/* Content */}
        <div className="bg-white px-8 py-6">
          <pre
            className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-sans mb-5"
          >
            {resolvedBody}
          </pre>
          <div
            className="inline-block px-5 py-2.5 rounded-lg text-white text-sm font-semibold mb-6"
            style={{ background: secondaryColor }}
          >
            Open App →
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              You received this because you are a member of {displayName || 'the community'}.<br />
              Powered by <span className="font-medium">CNP Platform</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Email Templates Section ───────────────────────────────────────────────────

const TEMPLATE_VARIABLES = {
  welcome:  ['{{member_name}}', '{{community_name}}', '{{sender_name}}'],
  meeting:  ['{{member_name}}', '{{meeting_title}}', '{{meeting_date}}', '{{meeting_time}}', '{{meeting_location}}'],
  referral: ['{{member_name}}', '{{giver_name}}', '{{category}}', '{{description}}'],
  renewal:  ['{{member_name}}', '{{days_left}}', '{{expiry_date}}', '{{community_name}}'],
}

function EmailTemplatesSection({ templates, onChange }) {
  const [selected, setSelected] = useState('welcome')
  const [showVars, setShowVars] = useState(false)

  const tmpl = templates?.[selected] ?? EMAIL_TEMPLATE_DEFAULTS[selected]

  return (
    <FormSection icon={FileText} title="Email Templates">
      {/* Template type selector */}
      <div>
        <FieldLabel>Template</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {EMAIL_TEMPLATE_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelected(t.value)}
              className={`px-3 py-1.5 rounded-button text-xs font-medium border transition-colors
                ${selected === t.value
                  ? 'bg-teal text-white border-teal'
                  : 'bg-white text-secondary border-border hover:border-teal/40 hover:text-primary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <FieldLabel>Subject Line</FieldLabel>
        <input
          type="text"
          className="input"
          value={tmpl.subject}
          onChange={e => onChange(selected, 'subject', e.target.value)}
          placeholder="Enter subject…"
        />
      </div>

      {/* Body */}
      <div>
        <FieldLabel>Body</FieldLabel>
        <textarea
          className="input font-mono text-xs leading-relaxed"
          style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical', minHeight: 160 }}
          rows={8}
          value={tmpl.body}
          onChange={e => onChange(selected, 'body', e.target.value)}
          placeholder="Enter template body…"
          spellCheck={false}
        />
      </div>

      {/* Variable hints */}
      <div>
        <button
          onClick={() => setShowVars(v => !v)}
          className="flex items-center gap-1 text-xs text-secondary hover:text-teal transition-colors"
        >
          <ChevronDown size={12} className={`transition-transform ${showVars ? 'rotate-180' : ''}`} />
          Available variables for {EMAIL_TEMPLATE_TYPES.find(t => t.value === selected)?.label}
        </button>
        {showVars && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(TEMPLATE_VARIABLES[selected] ?? []).map(v => (
              <code
                key={v}
                className="text-[11px] px-2 py-0.5 bg-teal/8 border border-teal/20 rounded text-teal font-mono cursor-default select-all"
              >
                {v}
              </code>
            ))}
          </div>
        )}
      </div>
    </FormSection>
  )
}

// ── Right preview panel ───────────────────────────────────────────────────────

const TABS = [
  { id: 'mobile', label: 'Mobile App', icon: Smartphone },
  { id: 'web',    label: 'Web Portal', icon: Monitor },
  { id: 'email',  label: 'Email',      icon: Mail },
]

function PreviewPanel({ branding }) {
  const [tab, setTab]             = useState('mobile')
  const [emailTmplType, setEmailTmplType] = useState('welcome')

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-button border border-border mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium flex-1 justify-center transition-all
              ${tab === t.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-secondary hover:text-primary'}`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Email template picker */}
      {tab === 'email' && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-secondary">Preview template:</span>
          <Select
            value={emailTmplType}
            onChange={setEmailTmplType}
            options={EMAIL_TEMPLATE_TYPES}
            size="sm"
            className="w-[200px]"
          />
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {tab === 'mobile' && <MobilePreview b={branding} />}
        {tab === 'web'    && <WebPreview    b={branding} />}
        {tab === 'email'  && <EmailPreview  b={branding} templateType={emailTmplType} />}
      </div>
    </div>
  )
}

// ── Branding completeness helpers ─────────────────────────────────────────────

const BRANDING_CHECKS = [
  { id: 'logo',        label: 'Logo uploaded',      check: b => !!b.logo },
  { id: 'appIcon',     label: 'App icon uploaded',  check: b => !!b.appIcon },
  { id: 'primary',     label: 'Primary color set',  check: b => b.primaryColor !== CNP_DEFAULTS.primaryColor },
  { id: 'secondary',   label: 'Secondary color set', check: b => b.secondaryColor !== CNP_DEFAULTS.secondaryColor },
  { id: 'font',        label: 'Font selected',       check: b => b.fontFamily !== CNP_DEFAULTS.fontFamily },
  { id: 'splash',      label: 'Splash screen',       check: b => !!b.splashScreen },
]

function getBrandingStatus(b) {
  const passed = BRANDING_CHECKS.filter(c => c.check(b)).length
  if (passed === BRANDING_CHECKS.length) return 'complete'
  if (passed > 0)                        return 'in_progress'
  return 'not_started'
}

const STATUS_META_B = {
  complete:    { label: 'Complete',    cls: 'badge-success' },
  in_progress: { label: 'In Progress', cls: 'badge-teal'    },
  not_started: { label: 'Not Started', cls: 'badge-gray'    },
}

// ── Branding List ─────────────────────────────────────────────────────────────

function BrandingList({ savedBrandings, onEdit, onDelete, onAdd }) {
  const [search, setSearch]         = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = tenants.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 p-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Branding Configurations</h1>
          <p className="text-secondary text-sm mt-0.5">Manage white-label branding for every community tenant.</p>
        </div>
        <button onClick={onAdd} className="btn-primary btn">
          <Plus size={15} /> Add Branding
        </button>
      </div>

      {/* Search */}
      <div className="relative" style={{ maxWidth: 340 }}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
        <input
          className="input pl-8"
          placeholder="Search communities…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Total',       value: filtered.length,                                                                                             cls: 'bg-surface border border-border text-primary' },
          { label: 'Complete',    value: filtered.filter(t => getBrandingStatus(savedBrandings[t.id] ?? buildBranding(t)) === 'complete').length,    cls: 'bg-success/10 text-success' },
          { label: 'In Progress', value: filtered.filter(t => getBrandingStatus(savedBrandings[t.id] ?? buildBranding(t)) === 'in_progress').length, cls: 'bg-teal/10 text-teal' },
          { label: 'Not Started', value: filtered.filter(t => getBrandingStatus(savedBrandings[t.id] ?? buildBranding(t)) === 'not_started').length, cls: 'bg-surface border border-border text-secondary' },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-button text-sm font-medium ${p.cls}`}>
            <span className="font-bold">{p.value}</span>
            <span className="opacity-75 text-xs">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(tenant => {
          const b      = savedBrandings[tenant.id] ?? buildBranding(tenant)
          const status = getBrandingStatus(b)
          const meta   = STATUS_META_B[status]
          const passed = BRANDING_CHECKS.filter(c => c.check(b)).length
          const pct    = Math.round((passed / BRANDING_CHECKS.length) * 100)
          const isDeleteTarget = deleteTarget === tenant.id

          return (
            <div key={tenant.id} className="card p-5 space-y-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Color preview swatch */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-card overflow-hidden border border-border">
                    <div className="h-1/2 w-full" style={{ background: b.primaryColor }} />
                    <div className="h-1/2 w-full" style={{ background: b.secondaryColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{tenant.name}</p>
                    <p className="text-xs text-secondary font-mono">{b.primaryColor} · {b.secondaryColor}</p>
                  </div>
                </div>
                <span className={`badge ${meta.cls} flex-shrink-0`}>{meta.label}</span>
              </div>

              {/* Logo / icon preview */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 rounded border border-border bg-surface flex items-center justify-center overflow-hidden">
                  {b.logo
                    ? <img src={b.logo} alt="logo" className="max-h-full max-w-full object-contain" />
                    : <span className="text-[10px] text-secondary/60">No logo</span>}
                </div>
                <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                  {b.appIcon
                    ? <img src={b.appIcon} alt="icon" className="w-full h-full object-cover" />
                    : <span className="text-[10px] text-secondary/60 font-bold">{tenant.name[0]}</span>}
                </div>
                <div className="text-xs text-secondary">
                  <p className="font-medium text-primary">{b.fontFamily}</p>
                  <p>{b.displayName}</p>
                </div>
              </div>

              {/* Completion checklist */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-secondary">Completion</span>
                  <span className={`font-semibold ${pct === 100 ? 'text-success' : pct > 0 ? 'text-teal' : 'text-secondary'}`}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct === 100 ? '#2E7D32' : '#028090' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {BRANDING_CHECKS.map(chk => {
                    const done = chk.check(b)
                    return (
                      <div key={chk.id} className="flex items-center gap-1.5 text-[11px]">
                        {done
                          ? <CheckCircle2 size={11} className="text-success flex-shrink-0" />
                          : <div className="w-[11px] h-[11px] rounded-full border border-border flex-shrink-0" />}
                        <span className={done ? 'text-secondary' : 'text-secondary/60'}>{chk.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              {isDeleteTarget ? (
                <div className="border border-danger/25 bg-danger/5 rounded-card p-3 space-y-2">
                  <p className="text-xs font-medium text-danger">Reset branding for <strong>{tenant.name}</strong> to CNP defaults?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteTarget(null)} className="btn-ghost btn btn-sm flex-1">Cancel</button>
                    <button
                      onClick={() => { onDelete(tenant.id); setDeleteTarget(null); toast.success('Branding reset to defaults') }}
                      className="btn btn-sm flex-1 bg-danger text-white hover:bg-danger/90 rounded-button"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => onEdit(tenant.id)}
                    className="btn-primary btn btn-sm flex-1"
                  >
                    <Pencil size={12} /> Edit Branding
                  </button>
                  <button
                    onClick={() => setDeleteTarget(tenant.id)}
                    className="btn-ghost btn btn-sm border border-border hover:border-danger/40 hover:text-danger"
                    title="Reset to defaults"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrandingPage() {
  const { tenantId: paramTenantId } = useParams()
  const navigate = useNavigate()

  // page view: 'list' | 'editor'
  const [pageView,       setPageView]       = useState('list')
  const [editorTenantId, setEditorTenantId] = useState(paramTenantId ?? tenants[0]?.id)
  // Store saved brandings per tenant so list shows progress
  const [savedBrandings, setSavedBrandings] = useState({})

  const openEditor = (tid) => {
    setEditorTenantId(tid)
    setPageView('editor')
    navigate(`/admin/branding/${tid}`, { replace: true })
  }

  const handleDeleteBranding = (tid) => {
    setSavedBrandings(prev => {
      const next = { ...prev }
      delete next[tid]
      return next
    })
  }

  if (pageView === 'list') {
    return (
      <BrandingList
        savedBrandings={savedBrandings}
        onEdit={openEditor}
        onDelete={handleDeleteBranding}
        onAdd={() => openEditor(tenants[0]?.id)}
      />
    )
  }

  return (
    <BrandingEditor
      tenantId={editorTenantId}
      savedBrandings={savedBrandings}
      onSaved={(tid, b) => setSavedBrandings(prev => ({ ...prev, [tid]: b }))}
      onResetBranding={handleDeleteBranding}
      onBack={() => { setPageView('list'); navigate('/admin/branding', { replace: true }) }}
    />
  )
}

// ── Branding Editor (extracted from original BrandingPage) ────────────────────

function BrandingEditor({ tenantId: tenantIdProp, savedBrandings, onSaved, onResetBranding, onBack }) {
  const navigate = useNavigate()
  const { tenantId: paramTenantId } = useParams()
  const tenantId = tenantIdProp ?? paramTenantId

  const tenant = tenants.find(t => t.id === tenantId) ?? tenants[0]

  const [branding,    setBranding]    = useState(() => savedBrandings[tenantId] ?? buildBranding(tenant))
  const [saved,       setSaved]       = useState(() => savedBrandings[tenantId] ?? buildBranding(tenant))
  const [saving,      setSaving]      = useState(false)
  const [resetOpen,   setResetOpen]   = useState(false)

  // Reload form when tenant changes
  useEffect(() => {
    if (!tenant) return
    const b = savedBrandings[tenant.id] ?? buildBranding(tenant)
    setBranding(b)
    setSaved(b)
  }, [tenant?.id])  // eslint-disable-line

  // Dynamically load Google Font when selection changes
  useEffect(() => {
    const font = FONTS.find(f => f.value === branding.fontFamily)
    if (font?.url && !document.querySelector(`link[href="${font.url}"]`)) {
      const el = document.createElement('link')
      el.rel  = 'stylesheet'
      el.href = font.url
      document.head.appendChild(el)
    }
  }, [branding.fontFamily])

  const set  = (key) => (val) => setBranding(prev => ({ ...prev, [key]: val }))
  const isDirty = JSON.stringify(branding) !== JSON.stringify(saved)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaved({ ...branding })
    onSaved?.(tenant.id, { ...branding })
    setSaving(false)
    toast.success(`Branding saved for ${tenant.name} ✓`)
  }

  const handleReset = () => {
    const b = buildBranding(tenant)
    setBranding(b)
    setSaved(b)
    onResetBranding?.(tenant.id)
    setResetOpen(false)
    toast('Branding reset to CNP defaults', { icon: '🔄' })
  }

  if (!tenant) return null

  return (
    <div className="space-y-5 p-3">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-secondary hover:text-teal transition-colors mb-2"
            >
              <ArrowLeft size={13} /> All Branding
            </button>
          )}
          <h1 className="text-[28px] font-bold text-primary leading-tight">
            Branding
            <span className="font-normal text-secondary"> — {tenant.name}</span>
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            Customise how this community appears across all surfaces.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tenant selector */}
          <Select
            value={tenant.id}
            onChange={v => navigate(`/admin/branding/${v}`)}
            options={tenants.map(t => ({ value: t.id, label: t.name }))}
            searchable
            className="w-[220px]"
          />

          <button onClick={() => setResetOpen(true)} className="btn-ghost btn">
            <RotateCcw size={14} /> Reset to Default
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="btn-primary btn"
          >
            {saving
              ? <><Check size={14} className="animate-bounce" /> Saving…</>
              : <><Save size={14} /> Save Changes</>
            }
          </button>
        </div>
      </div>

      {/* Unsaved indicator */}
      {isDirty && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber/8 border border-amber/25
                        rounded-button text-xs font-medium text-amber-dark">
          <Info size={13} className="flex-shrink-0" />
          You have unsaved changes — click Save Changes to apply.
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT: Form ── */}
        <div className="space-y-4 flex-shrink-0" style={{ width: 420 }}>

          {/* Identity */}
          <FormSection icon={Tag} title="Identity">
            <div>
              <FieldLabel>Community Display Name</FieldLabel>
              <input
                type="text"
                className="input"
                value={branding.displayName}
                onChange={e => set('displayName')(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>
                Tagline
                <span className="font-normal normal-case text-secondary ml-1">(optional)</span>
              </FieldLabel>
              <input
                type="text"
                className="input"
                placeholder="Connect. Refer. Grow."
                value={branding.tagline}
                onChange={e => set('tagline')(e.target.value)}
              />
            </div>
          </FormSection>

          {/* Logo */}
          <FormSection icon={Image} title="Logo">
            <div>
              <FieldLabel>Logo</FieldLabel>
              <UploadBox
                value={branding.logo}
                onChange={set('logo')}
                onRemove={() => set('logo')(null)}
                w={200} h={80}
                label="Upload Logo"
                hint="PNG, JPG, SVG · Max 2 MB · Recommended 400×160 px, transparent background"
                accept="image/png,image/jpeg,image/svg+xml"
              />
            </div>

            <div>
              <FieldLabel>App Icon</FieldLabel>
              <UploadBox
                value={branding.appIcon}
                onChange={set('appIcon')}
                onRemove={() => set('appIcon')(null)}
                w={80} h={80}
                label="App Icon"
                hint="PNG only · Must be 1024×1024 px for App Store submission"
                accept="image/png"
                round
              />
            </div>
          </FormSection>

          {/* Colors */}
          <FormSection icon={Palette} title="Colors">
            <ColorField
              label="Primary Color"
              value={branding.primaryColor}
              onChange={set('primaryColor')}
            />
            <ColorField
              label="Secondary Color"
              value={branding.secondaryColor}
              onChange={set('secondaryColor')}
            />
            <p className="text-[11px] text-secondary flex items-center gap-1">
              <Info size={11} className="flex-shrink-0" />
              Changes update the Live Preview in real time.
            </p>
          </FormSection>

          {/* Typography */}
          <FormSection icon={Type} title="Typography">
            <div>
              <FieldLabel>Font Family</FieldLabel>
              <Select
                value={branding.fontFamily}
                onChange={v => set('fontFamily')(v)}
                options={FONTS.map(f => ({ value: f.value, label: f.label }))}
              />
              <p
                className="text-sm text-secondary mt-2.5"
                style={{ fontFamily: `'${branding.fontFamily}', sans-serif` }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </FormSection>

          {/* Splash */}
          <FormSection icon={Layers} title="Splash Screen">
            <UploadBox
              value={branding.splashScreen}
              onChange={set('splashScreen')}
              onRemove={() => set('splashScreen')(null)}
              w={90} h={160}
              label="Upload Splash"
              hint="Recommended: 1080×1920 px (9:16 ratio)"
              accept="image/png,image/jpeg"
            />
          </FormSection>

          {/* Email Sender */}
          <FormSection icon={AtSign} title="Email Sender">
            <div>
              <FieldLabel>Sender Name</FieldLabel>
              <input
                type="text"
                className="input"
                value={branding.senderName}
                onChange={e => set('senderName')(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Reply-to Email</FieldLabel>
              <input
                type="email"
                className="input"
                value={branding.replyToEmail}
                onChange={e => set('replyToEmail')(e.target.value)}
              />
            </div>
          </FormSection>

          {/* Email Templates */}
          <EmailTemplatesSection
            templates={branding.emailTemplates}
            onChange={(key, field, val) =>
              setBranding(prev => ({
                ...prev,
                emailTemplates: {
                  ...prev.emailTemplates,
                  [key]: { ...prev.emailTemplates[key], [field]: val },
                },
              }))
            }
          />

          {/* App Store */}
          <FormSection icon={Smartphone} title="App Store Details">
            <div>
              <FieldLabel
                extra={
                  <span className={`text-[11px] font-mono ${branding.appStoreName.length > 30 ? 'text-danger' : 'text-secondary'}`}>
                    {branding.appStoreName.length}/30
                  </span>
                }
              >
                App Store Name
              </FieldLabel>
              <input
                type="text"
                className={`input ${branding.appStoreName.length > 30 ? 'input-error' : ''}`}
                value={branding.appStoreName}
                onChange={e => set('appStoreName')(e.target.value)}
                maxLength={32}
              />
              <p className="text-[11px] text-secondary mt-1">Maximum 30 characters</p>
            </div>

            <div>
              <FieldLabel
                extra={
                  <span className={`text-[11px] font-mono ${branding.shortDescription.length > 80 ? 'text-danger' : 'text-secondary'}`}>
                    {branding.shortDescription.length}/80
                  </span>
                }
              >
                Short Description
              </FieldLabel>
              <textarea
                className="input"
                style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
                rows={2}
                value={branding.shortDescription}
                onChange={e => set('shortDescription')(e.target.value)}
                maxLength={80}
              />
            </div>

            <div>
              <FieldLabel
                extra={
                  <span className={`text-[11px] font-mono ${branding.longDescription.length > 500 ? 'text-danger' : 'text-secondary'}`}>
                    {branding.longDescription.length}/500
                  </span>
                }
              >
                Long Description
              </FieldLabel>
              <textarea
                className="input"
                style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
                rows={6}
                value={branding.longDescription}
                onChange={e => set('longDescription')(e.target.value)}
                maxLength={500}
              />
            </div>
          </FormSection>

        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="flex-1 sticky top-0 self-start">
          <div
            className="card p-5"
            style={{ maxHeight: 'calc(100vh - 130px)', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-primary">Live Preview</h3>
              <span className="badge badge-teal text-[10px]">Real-time</span>
            </div>
            <PreviewPanel branding={branding} />
          </div>
        </div>

      </div>

      {/* ── Reset Confirmation Modal ── */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset to Default" maxWidth={420}>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-amber" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Reset all branding to CNP defaults?</p>
              <p className="text-sm text-secondary mt-1 leading-relaxed">
                This will clear all custom colours, logos, fonts, and App Store copy for{' '}
                <span className="font-medium text-primary">{tenant.name}</span>.
                Any unsaved changes will be lost.
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setResetOpen(false)} className="btn-ghost btn flex-1">
              Cancel
            </button>
            <button onClick={handleReset} className="btn-danger btn flex-1">
              <RotateCcw size={14} /> Reset Branding
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
