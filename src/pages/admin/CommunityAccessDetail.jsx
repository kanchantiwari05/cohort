import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Shield, ChevronRight, CheckCircle, AlertTriangle, Save, Trash2,
  Info, Building2, ArrowLeft, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useCommunityAccessStore from '../../store/communityAccessStore'
import useMasterSettingsStore from '../../store/masterSettingsStore'
import ModuleIcon from '../../lib/moduleIcons'

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      title={disabled ? 'Cannot change' : checked ? 'Disable module' : 'Enable module'}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-150 focus:outline-none
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'bg-teal' : 'bg-border'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-150
        ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, body, danger }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(27,58,107,0.4)' }}>
      <div className="bg-white rounded-card shadow-modal w-full max-w-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-danger/10' : 'bg-amber/10'}`}>
            <AlertTriangle size={18} className={danger ? 'text-danger' : 'text-amber'} />
          </div>
          <div>
            <p className="font-semibold text-primary text-sm">{title}</p>
            <p className="text-xs text-secondary mt-1 leading-relaxed">{body}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-navy'}`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function CommunityAccessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const community = useCommunityAccessStore(s => s.communities.find(c => c.id === id))
  const masterModules = useMasterSettingsStore(s => s.modules)
  const isModuleAllowedForPlan = useMasterSettingsStore(s => s.isModuleAllowedForPlan)
  const allModules = useMemo(
    () => [...masterModules].sort((a, b) => a.sortOrder - b.sortOrder),
    [masterModules]
  )

  const [enabledModules, setEnabledModules] = useState(new Set(community?.enabledModules || []))
  const [maxMembers, setMaxMembers]          = useState(community?.membersLimit || 500)
  const [maxAdmins, setMaxAdmins]            = useState(community?.adminsLimit || 5)
  const [storage, setStorage]                = useState(community?.storageLimit || 50)
  const [communityStatus, setCommunityStatus]= useState(community?.status || 'active')
  const [confirmModal, setConfirmModal]      = useState(null)

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Building2 size={36} className="text-border" />
        <p className="text-secondary text-sm">Community not found.</p>
        <Link to="/admin/community-access" className="btn btn-outline btn-sm">Back</Link>
      </div>
    )
  }

  const toggleModule = id => {
    setEnabledModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    toast.success('Saved successfully!', { style: { fontSize: 13 } })
  }

  const suspend = () => setConfirmModal({
    title: 'Suspend Community',
    body: `Suspend "${community.name}"? Members lose access immediately.`,
    danger: true,
    action: () => { setCommunityStatus('suspended'); toast.error('Community suspended.', { style: { fontSize: 13 } }); setConfirmModal(null) },
  })

  const activate = () => setConfirmModal({
    title: 'Activate Community',
    body: `Reactivate "${community.name}"?`,
    danger: false,
    action: () => { setCommunityStatus('active'); toast.success('Community activated.', { style: { fontSize: 13 } }); setConfirmModal(null) },
  })

  const planSlug = community.planKey

  const remove = () => setConfirmModal({
    title: 'Delete Community',
    body: `This is permanent and cannot be undone.`,
    danger: true,
    action: () => { toast.error('Deletion disabled in demo.', { style: { fontSize: 13 } }); setConfirmModal(null) },
  })

  const storagePct = Math.min((community.storageUsed / storage) * 100, 100)
  const memberPct  = Math.min((community.memberCount / maxMembers) * 100, 100)
  const planColor  = { Starter: 'text-teal', Premium: 'text-navy', Enterprise: 'text-amber-dark' }[community.plan] || 'text-secondary'

  return (
    <>
      <div className="space-y-4 p-3 pb-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-2xs text-secondary mb-1">
              <button onClick={() => navigate('/admin/community-access')}
                className="hover:text-teal transition-colors flex items-center gap-1">
                <ArrowLeft size={10} /> Community Access
              </button>
              <ChevronRight size={10} />
              <span className="text-primary font-medium">{community.name}</span>
            </div>
            <h1 className="text-base font-bold text-primary flex items-center gap-2">
              <Shield size={16} className="text-teal" />
              Community Access Control
            </h1>
          </div>
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-teal text-white text-xs font-medium hover:bg-teal-dark transition-colors">
            <Save size={13} /> Save Changes
          </button>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-4 items-start">

          {/* ── LEFT: Community Info + Limits + Controls ── */}
          <div className="w-64 flex-shrink-0 space-y-3">

            {/* Info card */}
            <div className="bg-white border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center text-navy font-bold text-xs flex-shrink-0">
                  {community.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary leading-tight truncate">{community.name}</p>
                  <p className="text-2xs text-secondary truncate">{community.type}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'Plan', value: community.plan, cls: planColor },
                  { label: 'CSA',  value: community.csa },
                  { label: 'Renewal', value: community.renewalDate },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between gap-2">
                    <span className="text-2xs text-secondary">{r.label}</span>
                    <span className={`text-2xs font-semibold ${r.cls || 'text-primary'} truncate`}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${communityStatus === 'active' ? 'bg-success' : 'bg-danger'}`} />
                <span className={`text-xs font-semibold ${communityStatus === 'active' ? 'text-success' : 'text-danger'}`}>
                  {communityStatus === 'active' ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            {/* Suspended banner */}
            {communityStatus === 'suspended' && (
              <div className="flex items-start gap-2 bg-danger/6 border border-danger/20 rounded-xl px-3 py-2.5">
                <AlertTriangle size={13} className="text-danger mt-0.5 flex-shrink-0" />
                <p className="text-2xs text-danger leading-snug">Community suspended. Members cannot log in.</p>
              </div>
            )}

            {/* Usage */}
            <div className="bg-white border border-border rounded-xl p-4 space-y-3">
              <p className="text-2xs font-semibold text-secondary uppercase tracking-wide">Usage</p>

              {[
                { label: 'Members', current: community.memberCount, max: maxMembers, pct: memberPct, color: '#028090' },
                { label: 'Storage', current: community.storageUsed, max: storage, unit: 'GB', pct: storagePct, color: storagePct > 80 ? '#BF360C' : '#028090' },
              ].map(u => (
                <div key={u.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-2xs text-secondary">{u.label}</span>
                    <span className="text-2xs font-semibold text-primary">
                      {u.current.toLocaleString('en-IN')}/{u.max.toLocaleString('en-IN')}{u.unit || ''}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${u.pct}%`, background: u.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Limits */}
            <div className="bg-white border border-border rounded-xl p-4 space-y-3">
              <p className="text-2xs font-semibold text-secondary uppercase tracking-wide">Limits</p>
              {[
                { label: 'Max Members', value: maxMembers, onChange: setMaxMembers },
                { label: 'Max Admins',  value: maxAdmins,  onChange: setMaxAdmins  },
                { label: 'Storage (GB)',value: storage,    onChange: setStorage    },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-2xs text-secondary block mb-1">{f.label}</label>
                  <input
                    type="number"
                    min={1}
                    className="input text-sm font-semibold h-8 text-primary"
                    value={f.value}
                    onChange={e => f.onChange(Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            {/* Status controls */}
            <div className="bg-white border border-border rounded-xl p-4 space-y-2">
              <p className="text-2xs font-semibold text-secondary uppercase tracking-wide mb-3">Actions</p>
              <button onClick={handleSave}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-button bg-teal text-white text-xs font-medium hover:bg-teal-dark transition-colors">
                <Save size={12} /> Save Changes
              </button>
              {communityStatus === 'active' ? (
                <button onClick={suspend}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-button border border-amber/40 text-amber-dark text-xs font-medium hover:bg-amber/8 transition-colors">
                  <AlertTriangle size={12} /> Suspend Community
                </button>
              ) : (
                <button onClick={activate}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-button border border-success/40 text-success text-xs font-medium hover:bg-success/8 transition-colors">
                  <CheckCircle size={12} /> Activate Community
                </button>
              )}
              <button onClick={remove}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-button border border-danger/30 text-danger text-xs font-medium hover:bg-danger/8 transition-colors">
                <Trash2 size={12} /> Delete Community
              </button>
            </div>
          </div>

          {/* ── RIGHT: Module Access ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-border rounded-xl overflow-hidden">

              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/40">
                <div>
                  <p className="text-sm font-semibold text-primary">Module Access</p>
                  <p className="text-2xs text-secondary mt-0.5">Toggle modules available to this community's Super Admin.</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal/10 text-teal text-2xs font-semibold">
                  {enabledModules.size}/{allModules.length} on
                </span>
              </div>

              {/* Module rows */}
              <div className="divide-y divide-border/60">
                {allModules.map(mod => {
                  const planOk = isModuleAllowedForPlan(planSlug, mod.id)
                  const lockedByPlan = !planOk
                  const on = enabledModules.has(mod.id)

                  return (
                    <div
                      key={mod.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        lockedByPlan ? 'bg-[#F5F5F5] opacity-90' : on ? 'bg-white' : 'bg-surface/30'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${mod.color}15` }}
                      >
                        <ModuleIcon name={mod.icon} size={14} style={{ color: mod.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-medium leading-tight ${on && !lockedByPlan ? 'text-primary' : 'text-secondary'}`}>
                            {mod.name}
                          </span>
                          {mod.alwaysOn && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-2xs font-medium bg-success/10 text-success">
                              <CheckCircle size={9} /> Core
                            </span>
                          )}
                          {lockedByPlan && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-2xs font-medium bg-border text-secondary">
                              <Lock size={9} /> Plan
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-secondary mt-0.5 leading-snug">{mod.description}</p>
                        {lockedByPlan && (
                          <p className="text-2xs text-secondary mt-1">
                            Not available on {community.plan} plan.{' '}
                            <Link to="/admin/settings/plans" className="text-teal font-medium hover:underline">
                              Upgrade Plan →
                            </Link>
                          </p>
                        )}
                      </div>

                      <Toggle
                        checked={on}
                        onChange={() => toggleModule(mod.id)}
                        disabled={lockedByPlan || mod.alwaysOn}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Footer hint */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border bg-navy/4">
                <Info size={12} className="text-navy flex-shrink-0" />
                <p className="text-2xs text-navy">
                  Disabled modules are hidden from the community's sidebar and role permission matrix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        body={confirmModal?.body}
        danger={confirmModal?.danger}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.action}
      />
    </>
  )
}
