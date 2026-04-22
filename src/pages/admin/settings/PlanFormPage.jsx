import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, ChevronRight } from 'lucide-react'
import useMasterSettingsStore from '../../../store/masterSettingsStore'
import ModuleIcon from '../../../lib/moduleIcons'

const DEFAULT_PLAN_COLOR = '#546E7A'

function slugify(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
        disabled ? 'opacity-45 cursor-not-allowed bg-[#E0E0E0]' : checked ? 'bg-[#028090]' : 'bg-[#B0BEC5]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

export default function PlanFormPage() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const isEdit = !!planId

  const plans = useMasterSettingsStore(s => s.plans)
  const modules = useMasterSettingsStore(s => s.modules)
  const addPlan = useMasterSettingsStore(s => s.addPlan)
  const updatePlan = useMasterSettingsStore(s => s.updatePlan)

  const alwaysOnMods = modules.filter(m => m.alwaysOn)
  const enableableMods = modules.filter(m => !m.alwaysOn)

  const existingPlan = isEdit ? plans.find(p => p.id === planId) : null

  const [form, setForm] = useState(() => {
    if (existingPlan) {
      return {
        ...existingPlan,
        includeAllModules: existingPlan.allowedModuleIds === 'all',
        allowedModuleIds:
          existingPlan.allowedModuleIds === 'all'
            ? enableableMods.map(m => m.id)
            : [...existingPlan.allowedModuleIds].filter(id => enableableMods.some(m => m.id === id)),
        slugTouched: true,
      }
    }
    return {
      name: '',
      slug: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      trialDays: 0,
      maxMembers: 100,
      maxMembersUnlimited: false,
      maxNodes: 10,
      maxNodesUnlimited: false,
      maxLevels: 3,
      maxLevelsUnlimited: false,
      isRecommended: false,
      includeAllModules: false,
      allowedModuleIds: ['member_management', 'communication_hub', 'dashboard_analytics', 'automation', 'support_help'],
      slugTouched: false,
    }
  })

  // Redirect if plan not found in edit mode
  useEffect(() => {
    if (isEdit && !existingPlan) {
      navigate('/admin/settings/plans', { replace: true })
    }
  }, [isEdit, existingPlan, navigate])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const slugAuto = !isEdit && !form.slugTouched
  const computedSlug = slugify(form.name)

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Plan name is required')
      return
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug?.trim() || computedSlug,
      description: (form.description || '').slice(0, 100),
      color: DEFAULT_PLAN_COLOR,
      price: Number(form.price) || 0,
      billingCycle: form.billingCycle,
      trialDays: Number(form.trialDays) || 0,
      maxMembers: form.maxMembersUnlimited ? null : Number(form.maxMembers),
      maxMembersUnlimited: !!form.maxMembersUnlimited,
      maxNodes: form.maxNodesUnlimited ? null : Number(form.maxNodes),
      maxNodesUnlimited: !!form.maxNodesUnlimited,
      maxLevels: form.maxLevelsUnlimited ? null : Number(form.maxLevels),
      maxLevelsUnlimited: !!form.maxLevelsUnlimited,
      isRecommended: !!form.isRecommended,
      allowedModuleIds: form.includeAllModules ? 'all' : [...form.allowedModuleIds],
    }
    if (isEdit) {
      updatePlan(planId, payload)
      toast.success(`${payload.name} plan saved ✓`)
    } else {
      addPlan(payload)
      toast.success(`${payload.name} plan created ✓`)
    }
    navigate('/admin/settings/plans')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-0 md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-[#D0DCF0] px-5 py-4 flex-shrink-0">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#546E7A] mb-2">
          <Link to="/admin/settings/plans" className="hover:text-[#1B3A6B]">
            Subscription Plans
          </Link>
          <ChevronRight size={13} className="text-[#B0BEC5]" />
          <span className="text-[#1B3A6B] font-medium">
            {isEdit ? `Edit · ${existingPlan?.name ?? ''}` : 'New Plan'}
          </span>
        </nav>
        <h1 className="text-[17px] font-bold text-[#1A237E] leading-tight">
          {isEdit ? 'Edit Subscription Plan' : 'New Subscription Plan'}
        </h1>
        <p className="text-[12px] text-[#90A4AE] mt-0.5">
          {isEdit ? "Update this plan's details, pricing, and module access." : 'Create a plan and set pricing, limits, and modules.'}
        </p>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto bg-[#F4F8FF] p-5">
        <form id="plan-form" onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {isEdit && (existingPlan?.tenantsCount ?? 0) > 0 && (
            <div className="text-[12px] text-[#546E7A] bg-[#E3F2FD] border border-[#90CAF9] rounded-lg px-3 py-2">
              Changes apply to all {existingPlan.tenantsCount} existing tenants on this plan.
            </div>
          )}

          {/* Basic details */}
          <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Basic Details</h2>
            <label className="block text-[13px] font-medium text-[#1A237E]">
              Plan Name *
              <input
                className="mt-1 w-full input border-[#D0DCF0] rounded-[8px]"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Professional"
              />
            </label>
            <label className="block text-[13px] font-medium text-[#1A237E]">
              Slug
              <input
                className="mt-1 w-full input border-[#D0DCF0] rounded-[8px] font-mono text-sm"
                value={slugAuto ? computedSlug : form.slug}
                onChange={e => {
                  set('slugTouched', true)
                  set('slug', e.target.value)
                }}
              />
              <span className="text-[11px] text-[#90A4AE]">Used in code — lowercase, no spaces</span>
            </label>
            <label className="block text-[13px] font-medium text-[#1A237E]">
              Description
              <textarea
                className="mt-1 w-full input border-[#D0DCF0] rounded-[8px] min-h-[72px]"
                maxLength={100}
                value={form.description || ''}
                onChange={e => set('description', e.target.value)}
              />
              <span className="text-[11px] text-[#90A4AE]">{(form.description || '').length}/100</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.isRecommended}
                onChange={e => set('isRecommended', e.target.checked)}
              />
              Mark as Recommended Plan
            </label>
            <p className="text-[11px] text-[#90A4AE] -mt-2">Shows a recommended star in the plans list</p>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Pricing</h2>
            <label className="block text-[13px] font-medium text-[#1A237E]">
              Monthly Price *
              <div className="flex mt-1">
                <span className="inline-flex items-center px-2 border border-r-0 border-[#D0DCF0] rounded-l-[8px] bg-[#F4F8FF] text-[#546E7A]">
                  ₹
                </span>
                <input
                  type="number"
                  className="input rounded-l-none flex-1 border-[#D0DCF0]"
                  value={form.price ?? 0}
                  onChange={e => set('price', e.target.value)}
                />
              </div>
            </label>
            <div className="flex gap-4 text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.billingCycle === 'monthly'} onChange={() => set('billingCycle', 'monthly')} />
                Monthly
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.billingCycle === 'annual'} onChange={() => set('billingCycle', 'annual')} />
                Annual
              </label>
            </div>
            <label className="block text-[13px] font-medium text-[#1A237E]">
              Trial Period (days)
              <input
                type="number"
                className="mt-1 w-32 input border-[#D0DCF0] rounded-[8px]"
                value={form.trialDays ?? 0}
                onChange={e => set('trialDays', e.target.value)}
              />
              <span className="text-[11px] text-[#90A4AE] ml-2">0 = no trial</span>
            </label>
          </section>

          {/* Limits */}
          <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Limits</h2>
            {[
              ['maxMembers', 'maxMembersUnlimited', 'Max Members'],
              ['maxNodes', 'maxNodesUnlimited', 'Max Hierarchy Nodes'],
              ['maxLevels', 'maxLevelsUnlimited', 'Max Hierarchy Levels'],
            ].map(([numKey, unKey, label]) => (
              <div key={numKey} className="flex flex-wrap items-end gap-3">
                <label className="flex-1 min-w-[160px] text-[13px] font-medium text-[#1A237E]">
                  {label}
                  <input
                    type="number"
                    disabled={form[unKey]}
                    className="mt-1 w-full input border-[#D0DCF0] rounded-[8px] disabled:opacity-50"
                    value={form[numKey] ?? ''}
                    onChange={e => set(numKey, e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 text-[13px] pb-2 cursor-pointer">
                  <input type="checkbox" checked={!!form[unKey]} onChange={e => set(unKey, e.target.checked)} />
                  Unlimited
                </label>
              </div>
            ))}
          </section>

          {/* Module access */}
          <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Module Access</h2>
            <p className="text-[12px] text-[#546E7A]">
              Select which modules CSAs on this plan can enable for their communities.
            </p>
            <div className="space-y-2">
              <p className="text-[11px] uppercase text-[#90A4AE] font-semibold">Always included</p>
              {alwaysOnMods.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-[13px] text-[#546E7A]">
                  <span className="opacity-50"><Toggle checked disabled /></span>
                  <ModuleIcon name={m.icon} size={16} style={{ color: m.color }} />
                  {m.name}
                  <span className="text-[11px]">Always included</span>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-[#2E7D32] cursor-pointer py-2">
              <input
                type="checkbox"
                checked={form.includeAllModules}
                onChange={e => {
                  const on = e.target.checked
                  set('includeAllModules', on)
                  if (on) set('allowedModuleIds', enableableMods.map(m => m.id))
                }}
              />
              Include all modules (Enterprise)
            </label>
            {!form.includeAllModules && (
              <div className="grid grid-cols-1 gap-2">
                {enableableMods.map(m => {
                  const on = form.allowedModuleIds.includes(m.id)
                  return (
                    <div key={m.id} className="flex items-start gap-2 p-2 rounded-lg border border-[#D0DCF0]">
                      <Toggle
                        checked={on}
                        onChange={() =>
                          setForm(f => {
                            const has = f.allowedModuleIds.includes(m.id)
                            return {
                              ...f,
                              allowedModuleIds: has
                                ? f.allowedModuleIds.filter(x => x !== m.id)
                                : [...f.allowedModuleIds, m.id],
                            }
                          })
                        }
                      />
                      <ModuleIcon name={m.icon} size={16} style={{ color: m.color }} />
                      <div>
                        <p className="text-[13px] font-medium text-[#1A237E]">{m.name}</p>
                        <p className="text-[11px] text-[#546E7A]">{m.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </form>
      </div>

      {/* Sticky footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D0DCF0] bg-white flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate('/admin/settings/plans')}
          className="btn btn-outline btn-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="plan-form"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-[8px] bg-[#028090] text-white text-sm font-semibold hover:bg-[#026a76] transition-colors"
        >
          <Check size={16} /> {isEdit ? 'Save changes' : 'Create plan'}
        </button>
      </div>
    </div>
  )
}
