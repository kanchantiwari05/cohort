import { Fragment, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { Star, Copy, Pencil, ChevronDown, ChevronRight } from 'lucide-react'
import useMasterSettingsStore from '../../../store/masterSettingsStore'
import ModuleIcon from '../../../lib/moduleIcons'

// ── FIX 18: Modules column hover tooltip ──────────────────────────────────────
function PlanModulesTooltip({ plan, modules, getAllowedModulesForPlan, anchor, onClose }) {
  const ref = useRef(null)
  const allowed  = getAllowedModulesForPlan(plan.slug)
  const alwaysOn = modules.filter(m => m.alwaysOn)
  const enableable = modules.filter(m => !m.alwaysOn)
  const included = enableable.filter(m => plan.allowedModuleIds === 'all' || allowed.includes(m.id))
  const locked   = enableable.filter(m => plan.allowedModuleIds !== 'all' && !allowed.includes(m.id))

  if (!anchor) return null
  const rect = anchor.getBoundingClientRect()
  const top  = rect.bottom + window.scrollY + 4
  const left = Math.min(rect.left + window.scrollX, window.innerWidth - 296)

  const handleDoc = (e) => { if (ref.current && !ref.current.contains(e.target) && !anchor.contains(e.target)) onClose() }
  // attach once (portal unmounts when onClose fires)
  if (typeof document !== 'undefined') {
    setTimeout(() => document.addEventListener('mousedown', handleDoc, { once: true }), 0)
  }

  return createPortal(
    <div
      ref={ref}
      className="absolute z-[9999] bg-white border border-[#D0DCF0] rounded-[10px] shadow-[0_4px_16px_rgba(27,58,107,0.12)] p-3 text-xs"
      style={{ top, left, width: 280 }}
    >
      <p className="font-semibold text-[#1A237E] mb-1">{plan.name} — Module Access</p>
      <div className="border-t border-[#D0DCF0] mb-2" />
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#90A4AE] mb-1">
          Available on plan ({included.length + alwaysOn.length})
        </p>
        {alwaysOn.map(m => <p key={m.id} className="text-[#2E7D32]">✓ {m.shortName}</p>)}
        {included.map(m => <p key={m.id} className="text-[#028090]">✓ {m.shortName}</p>)}
        {included.length + alwaysOn.length === 0 && <p className="text-[#90A4AE] italic">None</p>}
      </div>
      {locked.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#90A4AE] mb-1">
            Locked from this plan ({locked.length})
          </p>
          {locked.map(m => <p key={m.id} className="text-[#90A4AE]">⊘ {m.shortName}</p>)}
        </div>
      )}
      <p className="text-[10px] text-[#90A4AE] italic mt-1">CSA enables/disables from the available modules</p>
    </div>,
    document.body
  )
}

function fmtMoney(n, sym) {
  if (n == null) return '—'
  return `${sym}${Number(n).toLocaleString('en-IN')}`
}

function fmtLimit(v, unlimited) {
  if (unlimited) return '∞'
  if (v == null) return '—'
  return String(v)
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

export default function PlansTab() {
  const navigate = useNavigate()
  const plans = useMasterSettingsStore(s => s.plans)
  const modules = useMasterSettingsStore(s => s.modules)
  const deactivatePlan = useMasterSettingsStore(s => s.deactivatePlan)
  const reactivatePlan = useMasterSettingsStore(s => s.reactivatePlan)
  const clonePlan = useMasterSettingsStore(s => s.clonePlan)
  const toggleModuleInPlan = useMasterSettingsStore(s => s.toggleModuleInPlan)
  const getAllowedModulesForPlan = useMasterSettingsStore(s => s.getAllowedModulesForPlan)

  const totalTenants = useMemo(() => plans.reduce((a, p) => a + (p.tenantsCount || 0), 0), [plans])
  const activeCount = useMemo(() => plans.filter(p => p.isActive).length, [plans])

  const [deactivateCtx,   setDeactivateCtx]   = useState(null)
  const [expandedPlanId,  setExpandedPlanId]  = useState(null)
  const [moduleTipPlan,   setModuleTipPlan]   = useState(null)
  const [moduleTipAnchor, setModuleTipAnchor] = useState(null)
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(plans.length / PAGE_SIZE))
  const pagePlans = plans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const alwaysOnMods = modules.filter(m => m.alwaysOn)
  const enableableMods = modules.filter(m => !m.alwaysOn)

  const handleDeactivate = plan => {
    if (plan.tenantsCount > 0) {
      setDeactivateCtx(plan)
      return
    }
    setDeactivateCtx(plan)
  }

  const confirmHeavyDeactivate = () => {
    if (!deactivateCtx) return
    deactivatePlan(deactivateCtx.id)
    toast.success('Plan deactivated')
    setDeactivateCtx(null)
  }

  return (
    <div className="p-3 space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#1B3A6B]">Subscription Plans</h2>
          <p className="text-[12px] text-[#90A4AE] mt-0.5">
            {activeCount} active · {totalTenants} tenants subscribed · Controls module access per tenant
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/settings/plans/new')}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[8px] bg-[#028090] text-white text-[12.5px] font-semibold hover:bg-[#026a76] transition-colors shadow-sm flex-shrink-0"
        >
          + Add Plan
        </button>
      </div>

      <div className="rounded-[12px] bg-white shadow-[0_2px_8px_rgba(27,58,107,0.08)] border border-[#D0DCF0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FF] border-b border-[#D0DCF0]">
                <th className="w-10 px-2 py-3" aria-label="Expand" />
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Plan</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Price</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Trial</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">
                  Members
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">
                  Nodes
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">
                  Levels
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-center">
                  Modules
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">
                  Tenants
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Status</th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagePlans.map(plan => {
                const isEnterprise = plan.allowedModuleIds === 'all'
                const allowed = getAllowedModulesForPlan(plan.slug)
                const enableableCount = enableableMods.filter(m => allowed.includes(m.id)).length
                const expanded = expandedPlanId === plan.id

                return (
                  <Fragment key={plan.id}>
                    <tr
                      className={`border-b border-[#D0DCF0]/80 hover:bg-[#FAFCFF]/80 ${
                        !plan.isActive ? 'bg-[#FAFAFA]/90' : ''
                      }`}
                    >
                      <td className="px-2 py-2.5 align-middle">
                        <button
                          type="button"
                          onClick={() => setExpandedPlanId(expanded ? null : plan.id)}
                          className="p-1 rounded-md text-[#546E7A] hover:bg-[#E3F2FD] hover:text-[#1B3A6B]"
                          title={expanded ? 'Hide modules' : 'Show modules'}
                        >
                          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[13px] font-semibold text-[#1A237E]">{plan.name}</span>
                              {plan.isRecommended && plan.isActive && (
                                <Star size={11} className="text-[#C17900] flex-shrink-0" fill="currentColor" />
                              )}
                            </div>
                            {plan.description && (
                              <p className="text-[11px] text-[#90A4AE] line-clamp-1 max-w-[200px]" title={plan.description}>
                                {plan.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[13px] text-[#1A237E]">
                        {fmtMoney(plan.price, '₹')}
                        <span className="text-[#90A4AE]">/{plan.billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                      </td>
                      <td className="px-3 py-2.5 align-middle text-[13px] text-[#546E7A]">
                        {plan.trialDays ? `${plan.trialDays}d` : '—'}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right text-[13px] font-medium text-[#1A237E] tabular-nums">
                        {fmtLimit(plan.maxMembers, plan.maxMembersUnlimited)}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right text-[13px] font-medium text-[#1A237E] tabular-nums">
                        {fmtLimit(plan.maxNodes, plan.maxNodesUnlimited)}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right text-[13px] font-medium text-[#1A237E] tabular-nums">
                        {fmtLimit(plan.maxLevels, plan.maxLevelsUnlimited)}
                      </td>
                      {/* FIX 18: modules cell with hover tooltip */}
                      <td className="px-3 py-2.5 align-middle text-center">
                        <button
                          type="button"
                          onClick={e => {
                            setModuleTipPlan(moduleTipPlan?.id === plan.id ? null : plan)
                            setModuleTipAnchor(moduleTipPlan?.id === plan.id ? null : e.currentTarget)
                          }}
                          className="hover:text-[#028090] transition-colors"
                          title="View module breakdown"
                        >
                          {isEnterprise ? (
                            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                              All {modules.length}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#546E7A] underline decoration-dotted underline-offset-2">
                              {enableableCount}/{enableableMods.length}
                            </span>
                          )}
                        </button>
                      </td>
                      {/* FIX 19: tenant count clickable link */}
                      <td className="px-3 py-2.5 align-middle text-right tabular-nums">
                        {(plan.tenantsCount ?? 0) > 0 ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/tenants?plan=${plan.slug}`)}
                            className="text-[13px] text-[#028090] underline decoration-dotted underline-offset-2 hover:text-[#026a76] transition-colors"
                            title={`View ${plan.tenantsCount} tenants on ${plan.name}`}
                          >
                            {plan.tenantsCount}
                          </button>
                        ) : (
                          <span className="text-[13px] text-[#546E7A]">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        {plan.isActive ? (
                          <span className="inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#BF360C]">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {plan.isActive ? (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/settings/plans/${plan.id}/edit`)}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#1B3A6B] border border-[#D0DCF0] hover:bg-[#F4F8FF]"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const c = clonePlan(plan.id)
                                  if (c) {
                                    toast.success(`${c.name} created. Edit to customize.`)
                                    navigate(`/admin/settings/plans/${c.id}/edit`)
                                  }
                                }}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#546E7A] border border-[#D0DCF0] hover:bg-[#F4F8FF]"
                              >
                                <Copy size={12} />
                              </button>
                              <div className="relative group/deact">
                                <button
                                  type="button"
                                  disabled={(plan.tenantsCount ?? 0) > 0}
                                  onClick={() => handleDeactivate(plan)}
                                  className="inline-flex items-center px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#BF360C] border border-[#BF360C]/30 hover:bg-[#BF360C]/08 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Deactivate plan"
                                >
                                  Deactivate
                                </button>
                                {(plan.tenantsCount ?? 0) > 0 && (
                                  <div className="hidden group-hover/deact:block absolute bottom-full right-0 mb-1 z-20 bg-white border border-[#D0DCF0] rounded-[8px] shadow-lg p-2 text-[11px] w-52 text-left">
                                    <p className="font-medium text-[#1A237E]">{plan.tenantsCount} tenants are on this plan.</p>
                                    <p className="text-[#546E7A] mt-0.5">Migrate all tenants to another plan before deactivating.</p>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                reactivatePlan(plan.id)
                                toast.success('Plan reactivated')
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#2E7D32] border border-[#2E7D32]/40 hover:bg-[#2E7D32]/08"
                              title="Reactivate plan"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${plan.id}-modules`} className="bg-[#FAFCFF] border-b border-[#D0DCF0]">
                        <td colSpan={12} className="px-4 py-4">
                          {!plan.isActive && (
                            <p className="text-[12px] text-[#BF360C] mb-3">
                              New tenants cannot be assigned this plan. Reactivate to edit modules.
                            </p>
                          )}
                          <p className="text-[12px] font-semibold text-[#1A237E] mb-2">Modules on this plan</p>
                          <p className="text-[11px] uppercase tracking-wide text-[#90A4AE] font-semibold mb-1">Always on</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {alwaysOnMods.map(m => (
                              <span
                                key={m.id}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-[#ECEFF1] text-[#546E7A]"
                              >
                                {m.shortName}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] uppercase tracking-wide text-[#028090] font-semibold mb-2">
                            CSA can enable
                          </p>
                          {isEnterprise ? (
                            <div className="rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/30 px-3 py-2 text-[13px] text-[#2E7D32] font-medium inline-block">
                              ✓ All {modules.length} modules included
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-5xl">
                              {enableableMods.map(m => {
                                const on = allowed.includes(m.id)
                                return (
                                  <div
                                    key={m.id}
                                    className="flex items-start gap-2 p-2 rounded-lg border border-[#D0DCF0]/80 bg-white"
                                  >
                                    <Toggle
                                      checked={on}
                                      onChange={() => plan.isActive && toggleModuleInPlan(plan.id, m.id)}
                                      disabled={!plan.isActive}
                                    />
                                    <ModuleIcon
                                      name={m.icon}
                                      size={16}
                                      className="mt-0.5 flex-shrink-0"
                                      style={{ color: m.color }}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-medium text-[#1A237E] leading-tight">{m.name}</p>
                                      <p className="text-[11px] text-[#546E7A] line-clamp-2">{m.description}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#D0DCF0]/80 text-[12px] text-[#546E7A]">
                            <span>
                              {plan.tenantsCount > 0
                                ? `${plan.tenantsCount} tenants on this plan`
                                : 'No tenants yet'}
                            </span>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/tenants?plan=${plan.id}`)}
                              className="text-[#028090] font-medium hover:underline text-[12px]"
                            >
                              View tenants on this plan →
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#D0DCF0] bg-white">
          <span className="text-[12px] text-[#546E7A]">
            {plans.length === 0
              ? 'No plans'
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, plans.length)} of ${plans.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium border border-[#D0DCF0] text-[#546E7A] hover:bg-[#F4F8FF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`h-7 w-7 rounded-[6px] text-[12px] font-medium border transition-colors ${
                  n === page
                    ? 'bg-[#028090] text-white border-[#028090]'
                    : 'border-[#D0DCF0] text-[#546E7A] hover:bg-[#F4F8FF]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium border border-[#D0DCF0] text-[#546E7A] hover:bg-[#F4F8FF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* FIX 18: modules tooltip portal */}
      {moduleTipPlan && moduleTipAnchor && (
        <PlanModulesTooltip
          plan={moduleTipPlan}
          modules={modules}
          getAllowedModulesForPlan={getAllowedModulesForPlan}
          anchor={moduleTipAnchor}
          onClose={() => { setModuleTipPlan(null); setModuleTipAnchor(null) }}
        />
      )}

      {/* FIX 20: Deactivate modal — differentiated by tenant count */}
      {deactivateCtx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,58,107,0.45)]">
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(27,58,107,0.08)] max-w-md w-full p-5">
            <h3 className="text-[16px] font-bold text-[#1A237E]">Deactivate {deactivateCtx.name}?</h3>
            <p className="text-[13px] text-[#546E7A] mt-2">
              {(deactivateCtx.tenantsCount ?? 0) > 0
                ? `This plan has ${deactivateCtx.tenantsCount} tenant(s). Deactivating hides it from new tenant creation. Existing tenants are unaffected.`
                : 'This will hide it from new tenant creation. Existing tenants are unaffected.'}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeactivateCtx(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 rounded-[8px] bg-[#BF360C] text-white text-sm font-medium"
                onClick={confirmHeavyDeactivate}
              >
                Deactivate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

