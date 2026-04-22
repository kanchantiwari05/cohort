import { useState } from 'react'
import { MessageSquare, Pencil, Eye, ChevronDown, ChevronRight, Lock, Loader2, Check, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import useMasterSettingsStore from '../../../store/masterSettingsStore'
import SlideOver from '../../../components/SlideOver'

// Variable definitions per template key
const TEMPLATE_VARIABLES = {
  otp: [
    { key: 'platformName', description: 'Platform short name (from Platform Identity)' },
    { key: 'otp', description: '6-digit OTP code' },
    { key: 'expiry', description: 'OTP validity duration in minutes' },
  ],
  welcomeMember: [
    { key: 'communityName', description: 'Name of the community' },
    { key: 'appLink', description: 'Deep link to the mobile app' },
  ],
  csaInvite: [
    { key: 'name', description: "Recipient's full name" },
    { key: 'communityName', description: 'Name of the community' },
    { key: 'portalLink', description: 'CSA portal login URL' },
  ],
  billingReminder: [
    { key: 'name', description: 'Billing contact name' },
    { key: 'amount', description: 'Invoice amount in INR' },
    { key: 'period', description: 'Billing period (e.g. April 2025)' },
    { key: 'dueDate', description: 'Invoice due date' },
  ],
  goLiveAlert: [
    { key: 'communityName', description: 'Name of the community' },
    { key: 'iosLink', description: 'App Store listing URL' },
    { key: 'androidLink', description: 'Play Store listing URL' },
  ],
  atRiskNudge: [
    { key: 'name', description: "Recipient's first name" },
    { key: 'communityName', description: 'Name of the community' },
    { key: 'appLink', description: 'Deep link to the mobile app' },
  ],
  weeklyDigest: [
    { key: 'name', description: "Recipient's first name" },
    { key: 'communityName', description: 'Name of the community' },
    { key: 'referralCount', description: 'Number of referrals logged this week' },
    { key: 'meetingCount', description: 'Number of meetings held this week' },
    { key: 'appLink', description: 'Deep link to the mobile app' },
  ],
  laChecklist: [
    { key: 'name', description: "CSA's name" },
    { key: 'stepName', description: 'Name of the stalled onboarding step' },
    { key: 'communityName', description: 'Name of the community' },
  ],
}

// Sample values for preview substitution
const SAMPLE_VALUES = {
  platformName: 'CNP',
  otp: '847291',
  expiry: '10',
  communityName: 'BNI Mumbai Metro',
  appLink: 'https://cnp.app/open',
  name: 'Rajesh Mehta',
  portalLink: 'https://app.cnp.app/csa',
  amount: '25,000',
  period: 'April 2025',
  dueDate: '30 Apr 2025',
  iosLink: 'https://apps.apple.com/in/app/cnp',
  androidLink: 'https://play.google.com/store/apps/cnp',
  referralCount: '12',
  meetingCount: '8',
  stepName: 'Level Admins Assigned',
}

function renderPreview(message) {
  return message.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_VALUES[key] ?? `[${key}]`)
}

// FIX 31: estimate char length with sample values substituted
function estimatedLength(message) {
  return renderPreview(message).length
}

// FIX 31: color for char count
function charCountCls(len) {
  if (len > 1024) return 'text-danger font-medium'
  if (len > 900)  return 'text-amber-dark'
  if (len > 700)  return 'text-amber-dark'
  return 'text-secondary'
}
function charCountLabel(len) {
  if (len > 1024) return 'Exceeds WhatsApp limit — shorten this template'
  if (len > 900)  return 'Near limit'
  if (len > 700)  return 'Getting long'
  return 'Safe'
}

// Variable tooltips (FIX 29)
const VAR_DESCRIPTIONS = {
  platformName:  'Platform short name (e.g. CNP)',
  otp:           '6-digit verification code',
  expiry:        'OTP expiry in minutes (default: 10)',
  communityName: "The community's display name (e.g. BNI Mumbai Metro)",
  appLink:       'Community app download URL',
  name:          "Recipient's full name",
  portalLink:    'CSA portal login URL',
  amount:        'Invoice amount in ₹',
  period:        'Billing period (e.g. April 2025)',
  dueDate:       'Invoice due date',
  iosLink:       'App Store listing URL',
  androidLink:   'Play Store listing URL',
  referralCount: 'Referrals logged this week',
  meetingCount:  'Meetings held this week',
  stepName:      'Name of the stalled onboarding step',
}

// FIX 27: toggle component
function TemplateToggle({ tplKey, enabled, onChange }) {
  const isOtp = tplKey === 'otp'
  return (
    <div className="relative group/tog flex-shrink-0">
      <button
        type="button"
        disabled={isOtp}
        onClick={() => !isOtp && onChange(!enabled)}
        className={`relative h-5 w-9 rounded-full transition-colors flex-shrink-0 ${
          isOtp ? 'opacity-60 cursor-not-allowed' : ''
        } ${enabled ? 'bg-[#028090]' : 'bg-[#B0BEC5]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : ''}`} />
      </button>
      {isOtp && (
        <div className="hidden group-hover/tog:block absolute bottom-full left-0 mb-1 z-10 bg-white border border-border rounded-card shadow-modal px-2 py-1.5 text-[11px] w-52">
          <div className="flex items-center gap-1 mb-0.5"><Lock size={10} className="text-secondary" /><span className="font-medium text-primary">Cannot disable</span></div>
          <p className="text-secondary">OTP verification is required for login</p>
        </div>
      )}
    </div>
  )
}

// FIX 28: Test Send modal
function TestSendModal({ template, onClose }) {
  const [phone,   setPhone]   = useState('+91 ')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSend = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    setSending(false); setSent(true)
    toast.success('Test message sent ✓')
  }

  if (!template) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[rgba(27,58,107,0.45)]">
      <div className="bg-white rounded-[12px] shadow-xl max-w-[400px] w-full p-5 space-y-4">
        <h3 className="text-[15px] font-bold text-primary">Test {template.name}</h3>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-1.5">Phone Number</label>
          <input
            type="tel"
            className="input"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
        {sent ? (
          <div className="flex items-center gap-2 text-success text-sm font-medium">
            <Check size={15} /> Message sent to {phone}
          </div>
        ) : (
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Test Message</>}
          </button>
        )}
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm w-full">Close</button>
      </div>
    </div>
  )
}

function EditDrawer({ templateKey, template, onClose }) {
  const updateWhatsAppTemplate = useMasterSettingsStore(s => s.updateWhatsAppTemplate)
  const [body, setBody] = useState(template?.message ?? '')
  const [tab,  setTab]  = useState('edit')

  const variables = TEMPLATE_VARIABLES[templateKey] ?? []
  const MAX = 4096

  const handleSave = () => {
    updateWhatsAppTemplate(templateKey, body)
    toast.success('Template saved')
    onClose()
  }

  return (
    <SlideOver open={!!template} onClose={onClose} title={template?.name ?? 'Edit Template'} width={500}>
      {template && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Channel + trigger */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-success flex items-center gap-1">
                <MessageSquare size={10} /> WhatsApp
              </span>
              <span className="text-xs text-secondary">{template.trigger}</span>
            </div>

            {/* Template name (read-only) */}
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-1.5">
                BSP Template Name <span className="font-normal normal-case text-secondary">(read-only)</span>
              </label>
              <input
                type="text"
                className="input bg-surface cursor-not-allowed text-secondary"
                value={template.name}
                readOnly
              />
            </div>

            {/* Edit / Preview tabs */}
            <div>
              <div className="flex items-center gap-0 border-b border-border mb-3">
                {[
                  { id: 'edit',    label: 'Edit', icon: Pencil },
                  { id: 'preview', label: 'Preview', icon: Eye },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px
                      ${tab === id
                        ? 'border-teal text-teal'
                        : 'border-transparent text-secondary hover:text-primary'}`}
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>

              {tab === 'edit' ? (
                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wide block mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    className="input font-mono text-sm leading-relaxed"
                    style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical', minHeight: 140 }}
                    rows={6}
                    maxLength={MAX}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-[11px] text-secondary">Use {'{{variable}}'} for dynamic values</p>
                    <p className={`text-[11px] font-mono ${body.length > MAX * 0.9 ? 'text-amber-dark' : 'text-secondary'}`}>
                      {body.length} / {MAX}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                    Preview with sample data
                  </p>
                  <div className="bg-[#ECF8F0] border border-[#25D366]/20 rounded-card p-4">
                    <div className="bg-white rounded-[12px] rounded-tl-none p-3 shadow-sm max-w-[280px]">
                      <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed">
                        {renderPreview(body)}
                      </p>
                      <p className="text-[10px] text-secondary mt-1.5 text-right">Now ✓✓</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Variable legend */}
            {variables.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                  Available Variables
                </p>
                <div className="space-y-1.5">
                  {variables.map(v => (
                    <div key={v.key} className="flex items-start gap-2.5">
                      <code className="text-[11px] bg-surface border border-border rounded px-1.5 py-0.5 font-mono text-teal flex-shrink-0">
                        {`{{${v.key}}}`}
                      </code>
                      <p className="text-xs text-secondary leading-snug pt-0.5">{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2 flex-shrink-0 bg-white">
            <button type="button" onClick={onClose} className="btn-ghost btn btn-sm">Cancel</button>
            <button type="button" onClick={handleSave} className="btn-primary btn btn-sm">Save Template</button>
          </div>
        </div>
      )}
    </SlideOver>
  )
}

// FIX 30: Email subject lines state
const DEFAULT_EMAIL_SUBJECTS = {
  welcome:   'Welcome to {{communityName}} — Get Started',
  invoice:   'Invoice #{{invoiceNumber}} — {{period}}',
  reminder:  'Payment Reminder — ₹{{amount}} due {{dueDate}}',
  csaInvite: 'Your community {{communityName}} is ready!',
}

export default function NotificationTemplatesTab() {
  const waTemplates            = useMasterSettingsStore(s => s.notificationTemplates.whatsapp)
  const updateWhatsAppTemplate = useMasterSettingsStore(s => s.updateWhatsAppTemplate)

  const [editKey,      setEditKey]      = useState(null)
  const [expandedKey,  setExpandedKey]  = useState(null)
  const [disabledKeys, setDisabledKeys] = useState(new Set())
  const [disableCtx,   setDisableCtx]   = useState(null) // key pending confirmation
  const [testSendTpl,  setTestSendTpl]  = useState(null)
  const [expandedVars, setExpandedVars] = useState(new Set())
  const [emailSubjects, setEmailSubjects] = useState(DEFAULT_EMAIL_SUBJECTS)
  const [emailSaved,   setEmailSaved]   = useState(false)

  const templateList = Object.entries(waTemplates).map(([key, tpl]) => ({ key, ...tpl }))
  const editTemplate = editKey ? waTemplates[editKey] : null

  const toggleExpand = (key) => setExpandedKey(prev => prev === key ? null : key)

  const handleToggleTemplate = (key, currentlyEnabled) => {
    if (!currentlyEnabled) {
      // re-enabling — no confirmation needed
      setDisabledKeys(prev => { const s = new Set(prev); s.delete(key); return s })
      toast.success('Template re-enabled')
      return
    }
    setDisableCtx(key)
  }

  const confirmDisable = () => {
    if (!disableCtx) return
    setDisabledKeys(prev => new Set([...prev, disableCtx]))
    toast.success('Template disabled')
    setDisableCtx(null)
  }

  const saveEmailSubjects = () => {
    setEmailSaved(true)
    toast.success('Email subject lines saved')
    setTimeout(() => setEmailSaved(false), 2000)
  }

  return (
    <div className="p-5 space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
          {templateList.length} templates · All sent via WhatsApp Business API
        </p>
        <span className="badge badge-success flex items-center gap-1 text-xs">
          <MessageSquare size={11} /> WhatsApp
        </span>
      </div>

      {/* FIX 26 + 27 + 29 + 31: Expandable accordion table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="th text-left w-8" />
              <th className="th text-left w-8" />
              <th className="th text-left">Template</th>
              <th className="th text-left">Trigger Event</th>
              <th className="th text-left hidden md:table-cell">Variables</th>
            </tr>
          </thead>
          <tbody>
            {templateList.map(tpl => {
              const vars        = TEMPLATE_VARIABLES[tpl.key] ?? []
              const isExpanded  = expandedKey === tpl.key
              const isEnabled   = !disabledKeys.has(tpl.key)
              const estLen      = estimatedLength(tpl.message)
              const varsExpanded = expandedVars.has(tpl.key)
              const SHOW_MAX    = 3

              return (
                <>
                  <tr
                    key={tpl.key}
                    className={`border-b border-border/60 transition-colors cursor-pointer ${
                      !isEnabled ? 'bg-[#FAFAFA] opacity-70' : 'hover:bg-surface/40'
                    }`}
                    onClick={e => { if (!e.defaultPrevented) toggleExpand(tpl.key) }}
                  >
                    {/* FIX 26: expand chevron */}
                    <td className="td px-2 text-center" onClick={e => e.preventDefault()}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(tpl.key)}
                        className="p-1 text-secondary hover:text-primary transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    {/* FIX 27: toggle */}
                    <td className="td px-2" onClick={e => e.preventDefault()}>
                      <TemplateToggle
                        tplKey={tpl.key}
                        enabled={isEnabled}
                        onChange={enabled => handleToggleTemplate(tpl.key, enabled)}
                      />
                    </td>
                    <td className="td px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-button bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={13} className="text-[#25D366]" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold text-primary ${!isEnabled ? 'line-through' : ''}`}>{tpl.name}</p>
                          <p className="text-xs text-secondary truncate max-w-[200px]">{tpl.message.slice(0, 55)}{tpl.message.length > 55 ? '…' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td px-4">
                      <p className="text-xs text-secondary">{tpl.trigger}</p>
                    </td>
                    {/* FIX 29: variable chips with "+N more" expand */}
                    <td className="td px-4 hidden md:table-cell" onClick={e => e.preventDefault()}>
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {(varsExpanded ? vars : vars.slice(0, SHOW_MAX)).map(v => (
                          <div key={v.key} className="relative group/chip">
                            <code className="text-[10px] bg-surface border border-border rounded px-1.5 py-0.5 font-mono text-teal cursor-default">
                              {`{{${v.key}}}`}
                            </code>
                            <div className="hidden group-hover/chip:block absolute bottom-full left-0 mb-1 z-10 bg-white border border-border rounded-card shadow-modal px-2 py-1.5 text-[11px] w-48 leading-snug">
                              <p className="font-mono text-teal text-[10px]">{`{{${v.key}}}`}</p>
                              <p className="text-secondary mt-0.5">{VAR_DESCRIPTIONS[v.key] || v.description}</p>
                            </div>
                          </div>
                        ))}
                        {!varsExpanded && vars.length > SHOW_MAX && (
                          <button
                            type="button"
                            onClick={() => setExpandedVars(prev => new Set([...prev, tpl.key]))}
                            className="text-[10px] text-teal hover:underline px-1"
                          >
                            +{vars.length - SHOW_MAX} more
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* FIX 26: expanded row content */}
                  {isExpanded && (
                    <tr key={`${tpl.key}-exp`} className="border-b border-border bg-[#F4F8FF]/60">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="space-y-4 max-w-2xl">
                          {/* Section A: Full message with teal variables */}
                          <div>
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Message</p>
                            <div className="bg-[#F4F8FF] border border-border rounded-card p-3 text-[13px] font-mono leading-relaxed text-navy whitespace-pre-wrap">
                              {tpl.message.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
                                /^\{\{[^}]+\}\}$/.test(part)
                                  ? <span key={i} className="text-teal">{part}</span>
                                  : part
                              )}
                            </div>
                          </div>

                          {/* Section B: WhatsApp preview bubble */}
                          <div>
                            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Preview with sample data</p>
                            <div className="bg-[#E8F5E9] border border-[#25D366]/20 rounded-card p-4 max-w-xs">
                              <div className="bg-white rounded-[12px] rounded-tl-none p-3 shadow-sm">
                                <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed">
                                  {renderPreview(tpl.message)}
                                </p>
                                <p className="text-[10px] text-secondary mt-1.5 text-right">Now ✓✓</p>
                              </div>
                            </div>
                          </div>

                          {/* FIX 31: char counter */}
                          <p className={`text-xs ${charCountCls(estLen)}`}>
                            ~{estLen} characters (with sample values) · {charCountLabel(estLen)}
                          </p>

                          {/* Section C: action buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setEditKey(tpl.key) }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-teal hover:bg-teal/8 border border-border transition-colors"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            {/* FIX 28: Test Send */}
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setTestSendTpl(tpl) }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-secondary hover:bg-surface border border-border transition-colors"
                            >
                              <Send size={11} /> Test Send
                            </button>
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); toast('Template reset to default', { icon: '↩️' }) }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-button text-xs font-medium text-secondary hover:bg-surface border border-border transition-colors"
                            >
                              Reset to Default
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* FIX 27: disable confirmation */}
      {disableCtx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,58,107,0.45)]">
          <div className="bg-white rounded-[12px] shadow-xl max-w-sm w-full p-5 space-y-3">
            <h3 className="text-[15px] font-bold text-primary">
              Disable {waTemplates[disableCtx]?.name}?
            </h3>
            <p className="text-sm text-secondary">
              Recipients will no longer receive this message. You can re-enable at any time.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDisableCtx(null)}>Cancel</button>
              <button type="button" onClick={confirmDisable} className="inline-flex items-center px-3 py-1.5 rounded-[8px] border border-danger text-danger text-sm font-medium hover:bg-danger/5">Disable</button>
            </div>
          </div>
        </div>
      )}

      {/* FIX 28: Test Send modal */}
      {testSendTpl && (
        <TestSendModal template={testSendTpl} onClose={() => setTestSendTpl(null)} />
      )}

      {/* FIX 30: Email subject lines — editable */}
      <div className="card">
        <div className="card-body space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Email Templates</h3>
            <p className="text-xs text-secondary mt-0.5">Subject lines only — email bodies are managed via your ESP (SendGrid).</p>
          </div>
          {[
            { key: 'welcome',   label: 'Welcome Email',      helper: 'Sent when CSA first logs in'           },
            { key: 'invoice',   label: 'Invoice Email',      helper: 'Sent with each invoice'                },
            { key: 'reminder',  label: 'Payment Reminder',   helper: 'Sent 7 days before due date'           },
            { key: 'csaInvite', label: 'CSA Invite',         helper: 'Sent when CSA credentials are delivered' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-primary mb-1 block">{f.label}</label>
              <input
                type="text"
                className="input text-sm"
                value={emailSubjects[f.key]}
                onChange={e => setEmailSubjects(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
              <p className="text-[11px] text-secondary mt-0.5">{f.helper}</p>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={saveEmailSubjects} className="btn btn-primary btn-sm">
              {emailSaved ? <><Check size={13} /> Saved</> : 'Save Email Subject Lines'}
            </button>
            <p className="text-[11px] text-secondary">Auto-saves on change is not enabled — click Save to apply.</p>
          </div>
        </div>
      </div>

      <EditDrawer
        templateKey={editKey}
        template={editTemplate}
        onClose={() => setEditKey(null)}
      />
    </div>
  )
}
