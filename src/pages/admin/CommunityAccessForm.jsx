import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Check, ChevronRight, CheckCircle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import useCommunityAccessStore from '../../store/communityAccessStore'
import useMasterSettingsStore from '../../store/masterSettingsStore'
import ModuleIcon from '../../lib/moduleIcons'

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'bg-teal' : 'bg-border'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
        ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[13px] font-medium text-[#1A237E]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#90A4AE]">{hint}</p>}
    </div>
  )
}

export default function CommunityAccessForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const getCommunity = useCommunityAccessStore(s => s.getCommunity)
  const addCommunity = useCommunityAccessStore(s => s.addCommunity)
  const updateCommunity = useCommunityAccessStore(s => s.updateCommunity)

  const masterModules = useMasterSettingsStore(s => s.modules)
  const masterPlans = useMasterSettingsStore(s => s.plans)
  const communityTypes = useMasterSettingsStore(s => s.communityTypes)
  const isModuleAllowedForPlan = useMasterSettingsStore(s => s.isModuleAllowedForPlan)

  const existing = isEdit ? getCommunity(id) : null

  const activePlans = masterPlans.filter(p => p.isActive)
  const activeTypes = communityTypes.filter(c => c.isActive)
  const sortedModules = [...masterModules].sort((a, b) => a.sortOrder - b.sortOrder)

  const [form, setForm] = useState(() => {
    if (existing) {
      return {
        name: existing.name,
        type: existing.type,
        typeKey: existing.typeKey,
        csa: existing.csa,
        csaEmail: existing.csaEmail || '',
        planKey: existing.planKey,
        plan: existing.plan,
        membersLimit: existing.membersLimit,
        adminsLimit: existing.adminsLimit,
        storageLimit: existing.storageLimit,
        renewalDate: existing.renewalDate,
        status: existing.status,
        enabledModules: [...(existing.enabledModules || [])],
      }
    }
    const firstPlan = activePlans[0]
    return {
      name: '',
      type: activeTypes[0]?.name || 'Business Community',
      typeKey: activeTypes[0]?.slug || 'business',
      csa: '',
      csaEmail: '',
      planKey: firstPlan?.slug || 'starter',
      plan: firstPlan?.name || 'Starter',
      membersLimit: 100,
      adminsLimit: 5,
      storageLimit: 50,
      renewalDate: '',
      status: 'active',
      enabledModules: masterModules.filter(m => m.alwaysOn).map(m => m.id),
    }
  })

  useEffect(() => {
    if (isEdit && !existing) {
      navigate('/admin/community-access', { replace: true })
    }
  }, [isEdit, existing, navigate])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedPlanKey = form.planKey

  const toggleModule = modId => {
    setForm(f => {
      const has = f.enabledModules.includes(modId)
      return {
        ...f,
        enabledModules: has
          ? f.enabledModules.filter(x => x !== modId)
          : [...f.enabledModules, modId],
      }
    })
  }

  const handlePlanChange = slug => {
    const pl = activePlans.find(p => p.slug === slug)
    set('planKey', slug)
    set('plan', pl?.name || slug)
    // remove modules no longer allowed by new plan
    setForm(f => ({
      ...f,
      planKey: slug,
      plan: pl?.name || slug,
      enabledModules: f.enabledModules.filter(mid => {
        const mod = masterModules.find(m => m.id === mid)
        return mod?.alwaysOn || isModuleAllowedForPlan(slug, mid)
      }),
    }))
  }

  const handleTypeChange = slug => {
    const ct = activeTypes.find(t => t.slug === slug)
    setForm(f => ({ ...f, typeKey: slug, type: ct?.name || slug }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Community name is required'); return }
    if (!form.csa.trim())  { toast.error('CSA name is required'); return }
    if (isEdit) {
      updateCommunity(id, form)
      toast.success(`${form.name} updated ✓`)
    } else {
      addCommunity(form)
      toast.success(`${form.name} created ✓`)
    }
    navigate('/admin/community-access')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#D0DCF0] px-5 py-4 flex-shrink-0">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#546E7A] mb-2">
          <Link to="/admin/community-access" className="hover:text-[#1B3A6B]">Community Access</Link>
          <ChevronRight size={13} className="text-[#B0BEC5]" />
          <span className="text-[#1B3A6B] font-medium">{isEdit ? `Edit · ${existing?.name ?? ''}` : 'New Community'}</span>
        </nav>
        <h1 className="text-[17px] font-bold text-[#1A237E] leading-tight">
          {isEdit ? 'Edit Community' : 'Add Community'}
        </h1>
        <p className="text-[12px] text-[#90A4AE] mt-0.5">
          {isEdit ? 'Update community details, limits, and module access.' : 'Register a new community and configure its access settings.'}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-[#F4F8FF] p-5">
        <form id="ca-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 items-start">

          {/* Left */}
          <div className="space-y-5">

            {/* Basic info */}
            <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Basic Info</h2>

              <Field label="Community Name *">
                <input
                  className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Harvard Alumni"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Community Type">
                  <select
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.typeKey}
                    onChange={e => handleTypeChange(e.target.value)}
                  >
                    {activeTypes.map(ct => (
                      <option key={ct.id} value={ct.slug}>{ct.name}</option>
                    ))}
                    {activeTypes.length === 0 && (
                      <>
                        <option value="business">Business Community</option>
                        <option value="alumni">Alumni Community</option>
                        <option value="professional">Professional Community</option>
                        <option value="religious">Religious Community</option>
                      </>
                    )}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="CSA Name *">
                  <input
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.csa}
                    onChange={e => set('csa', e.target.value)}
                    placeholder="Dr. Anita Kapoor"
                  />
                </Field>
                <Field label="CSA Email">
                  <input
                    type="email"
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.csaEmail}
                    onChange={e => set('csaEmail', e.target.value)}
                    placeholder="anita@example.com"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Plan">
                  <select
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.planKey}
                    onChange={e => handlePlanChange(e.target.value)}
                  >
                    {activePlans.map(pl => (
                      <option key={pl.id} value={pl.slug}>{pl.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Renewal Date">
                  <input
                    type="text"
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.renewalDate}
                    onChange={e => set('renewalDate', e.target.value)}
                    placeholder="12 May 2026"
                  />
                </Field>
              </div>
            </section>

            {/* Limits */}
            <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Limits</h2>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Max Members">
                  <input
                    type="number" min={1}
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.membersLimit}
                    onChange={e => set('membersLimit', Number(e.target.value))}
                  />
                </Field>
                <Field label="Max Admins">
                  <input
                    type="number" min={1}
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.adminsLimit}
                    onChange={e => set('adminsLimit', Number(e.target.value))}
                  />
                </Field>
                <Field label="Storage (GB)">
                  <input
                    type="number" min={1}
                    className="w-full input rounded-[8px] border-[#D0DCF0] text-[13px]"
                    value={form.storageLimit}
                    onChange={e => set('storageLimit', Number(e.target.value))}
                  />
                </Field>
              </div>
            </section>
          </div>

          {/* Right — Module Access */}
          <div className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] overflow-hidden xl:sticky xl:top-5">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#D0DCF0] bg-[#F4F8FF]">
              <div>
                <p className="text-[13px] font-semibold text-[#1A237E]">Module Access</p>
                <p className="text-[11px] text-[#90A4AE] mt-0.5">Modules available to this community's Super Admin</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal/10 text-teal text-[11px] font-semibold">
                {form.enabledModules.length}/{sortedModules.length} on
              </span>
            </div>

            <div className="divide-y divide-[#D0DCF0]/60 max-h-[520px] overflow-y-auto">
              {sortedModules.map(mod => {
                const planOk = isModuleAllowedForPlan(selectedPlanKey, mod.id)
                const locked = !planOk
                const on = form.enabledModules.includes(mod.id)

                return (
                  <div
                    key={mod.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      locked ? 'bg-[#F5F5F5] opacity-80' : on ? 'bg-white' : 'bg-[#FAFCFF]'
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
                        <span className={`text-[13px] font-medium leading-tight ${on && !locked ? 'text-[#1A237E]' : 'text-[#546E7A]'}`}>
                          {mod.name}
                        </span>
                        {mod.alwaysOn && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#E8F5E9] text-[#2E7D32]">
                            <CheckCircle size={9} /> Core
                          </span>
                        )}
                        {locked && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#ECEFF1] text-[#546E7A]">
                            <Lock size={9} /> Plan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#90A4AE] mt-0.5 leading-snug">{mod.description}</p>
                    </div>
                    <Toggle
                      checked={on}
                      onChange={() => toggleModule(mod.id)}
                      disabled={locked || mod.alwaysOn}
                    />
                  </div>
                )
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-[#D0DCF0] bg-[#F4F8FF]">
              <p className="text-[11px] text-[#546E7A]">
                Modules locked by plan cannot be enabled. Change the plan to unlock more modules.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D0DCF0] bg-white flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate('/admin/community-access')}
          className="btn btn-outline btn-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="ca-form"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#028090] text-white text-sm font-semibold hover:bg-[#026a76] transition-colors"
        >
          <Check size={16} /> {isEdit ? 'Save changes' : 'Add community'}
        </button>
      </div>
    </div>
  )
}
