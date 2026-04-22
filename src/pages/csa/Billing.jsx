import { useState } from 'react'
import {
  CreditCard, Users, Calendar, BarChart2, DollarSign,
  Lock, Download, CheckCircle, AlertTriangle, X,
  Zap, MessageSquare, UserCheck, Share2, LayoutGrid,
  ArrowUpRight, Check, Star, ChevronRight,
} from 'lucide-react'

// ── Mock Data ─────────────────────────────────────────────────────────────────

const CURRENT_PLAN = {
  name: 'Growth Plan',
  price: 4999,
  cycle: 'Monthly',
  renewalDate: '12 May 2026',
  status: 'active',
  membersLimit: 250,
  adminsLimit: 3,
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    yearlyPrice: 799,
    color: 'navy',
    features: ['Up to 50 Members', 'Member Directory', 'Announcements', '1 Admin'],
    cta: 'Choose Plan',
    current: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 4999,
    yearlyPrice: 3999,
    color: 'teal',
    features: ['Up to 250 Members', 'Events', 'Member Directory', 'Reports', '3 Admins'],
    cta: 'Current Plan',
    current: true,
    recommended: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9999,
    yearlyPrice: 7999,
    color: 'amber',
    features: ['Unlimited Members', 'Payments', 'Analytics', 'Custom Branding', 'API Access', 'Unlimited Admins'],
    cta: 'Upgrade',
    current: false,
  },
]

const MODULES = [
  { id: 'members',     icon: Users,        name: 'Members',     desc: 'Manage members and directory',  status: 'on'     },
  { id: 'events',      icon: Calendar,     name: 'Events',      desc: 'Create and manage events',      status: 'on'     },
  { id: 'reports',     icon: BarChart2,    name: 'Reports',     desc: 'Community insights and reports', status: 'on'     },
  { id: 'payments',    icon: DollarSign,   name: 'Payments',    desc: 'Collect membership fees',        status: 'locked' },
  { id: 'attendance',  icon: UserCheck,    name: 'Attendance',  desc: 'Track meeting attendance',       status: 'off'    },
  { id: 'referrals',   icon: Share2,       name: 'Referrals',   desc: 'Referral tracking system',       status: 'off'    },
  { id: 'discussions', icon: MessageSquare,name: 'Discussions', desc: 'Community discussion boards',    status: 'on'     },
  { id: 'automation',  icon: Zap,          name: 'Automation',  desc: 'Workflow automation tools',      status: 'locked' },
]

const USAGE = [
  { label: 'Members Used',          value: 138, max: 250, unit: '',    icon: Users,     warn: false },
  { label: 'Admins Used',           value: 2,   max: 3,   unit: '',    icon: UserCheck, warn: false },
  { label: 'Storage Used',          value: 12,  max: 50,  unit: ' GB', icon: LayoutGrid,warn: false },
  { label: 'Active Events',         value: 8,   max: null, unit: '',   icon: Calendar,  warn: false },
]

const USAGE_WARN = [
  { label: 'Members Used', value: 230, max: 250, unit: '', icon: Users, warn: true },
]

const INVOICES = [
  { id: 'INV-1001', date: '12 Apr 2026', amount: 4999, status: 'paid' },
  { id: 'INV-1002', date: '12 Mar 2026', amount: 4999, status: 'paid' },
  { id: 'INV-1003', date: '12 Feb 2026', amount: 4999, status: 'paid' },
  { id: 'INV-1004', date: '12 Jan 2026', amount: 4999, status: 'paid' },
  { id: 'INV-1005', date: '12 Dec 2025', amount: 4999, status: 'paid' },
]

const COMPARE_ROWS = [
  { label: 'Members Limit',   starter: '50',  growth: '250', pro: 'Unlimited' },
  { label: 'Events',          starter: false, growth: true,  pro: true        },
  { label: 'Payments',        starter: false, growth: false, pro: true        },
  { label: 'Reports',         starter: false, growth: true,  pro: true        },
  { label: 'Custom Branding', starter: false, growth: false, pro: true        },
  { label: 'API Access',      starter: false, growth: false, pro: true        },
  { label: 'Admins',          starter: '1',   growth: '3',   pro: 'Unlimited' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(value, max) {
  if (!max) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

function barColor(p) {
  if (p >= 90) return 'bg-danger'
  if (p >= 70) return 'bg-amber'
  return 'bg-teal'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      style={{ background: enabled ? '#028090' : '#CBD5E1' }}
      className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal/30 cursor-pointer"
    >
      <span
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function PlanBadge({ plan }) {
  const map = { starter: 'badge-navy', growth: 'badge-teal', pro: 'badge-amber' }
  return <span className={`badge ${map[plan] || 'badge-gray'}`}>{plan}</span>
}

// ── TAB 1: Billing ────────────────────────────────────────────────────────────

function BillingTab({ onUpgrade, yearly, setYearly }) {
  const [cancelOpen, setCancelOpen] = useState(false)

  return (
    <div className="space-y-8">

      {/* Current plan card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Current Plan</p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-navy">{CURRENT_PLAN.name}</h2>
              <span className="badge badge-success">Active</span>
            </div>
            <p className="text-3xl font-bold text-teal mt-1">
              ₹{(yearly ? Math.round(CURRENT_PLAN.price * 0.8) : CURRENT_PLAN.price).toLocaleString('en-IN')}
              <span className="text-sm font-normal text-secondary ml-1">/ month</span>
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-sm min-w-[200px]">
            <div className="flex items-center justify-between gap-6">
              <span className="text-secondary">Billing Cycle</span>
              <span className="font-medium text-primary">{yearly ? 'Yearly' : 'Monthly'}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-secondary">Renewal Date</span>
              <span className="font-medium text-primary">{CURRENT_PLAN.renewalDate}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-secondary">Members</span>
              <span className="font-medium text-primary">Up to {CURRENT_PLAN.membersLimit}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-border">
          <button
            onClick={onUpgrade}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <ArrowUpRight size={14} />
            Upgrade Plan
          </button>
          <button
            onClick={() => setYearly(v => !v)}
            className="btn btn-outline btn-sm"
          >
            {yearly ? 'Switch to Monthly' : 'Switch to Yearly'}
            {!yearly && <span className="ml-1.5 text-2xs bg-success/15 text-success font-semibold px-1.5 py-0.5 rounded">Save 20%</span>}
          </button>
          <button
            onClick={() => setCancelOpen(true)}
            className="btn btn-ghost btn-sm text-danger hover:bg-danger/8 ml-auto"
          >
            Cancel Plan
          </button>
        </div>
      </div>

      {/* Pricing plans */}
      <div>
        <h3 className="text-base font-semibold text-primary mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`card p-6 flex flex-col relative transition-shadow hover:shadow-modal
                ${plan.current ? 'ring-2 ring-teal' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-teal text-white text-2xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={9} fill="white" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1
                  ${plan.color === 'teal' ? 'text-teal' : plan.color === 'amber' ? 'text-amber' : 'text-navy'}`}>
                  {plan.name}
                </p>
                <p className="text-3xl font-bold text-primary">
                  ₹{(yearly ? plan.yearlyPrice : plan.price).toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-secondary ml-1">/ mo</span>
                </p>
                {yearly && (
                  <p className="text-xs text-secondary line-through mt-0.5">
                    ₹{plan.price.toLocaleString('en-IN')}/mo
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                    <Check size={14} className="text-success flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.id === 'pro' ? onUpgrade : undefined}
                className={`btn btn-sm w-full ${
                  plan.current
                    ? 'btn-outline opacity-60 cursor-default'
                    : plan.id === 'pro'
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
                disabled={plan.current}
              >
                {plan.current ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle size={13} /> Current Plan
                  </span>
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel modal */}
      {cancelOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-modal w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold text-primary">Cancel Plan?</h3>
              <button onClick={() => setCancelOpen(false)} className="btn btn-ghost btn-sm p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-card">
                <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary">
                  Your community will lose access to all paid features on <strong className="text-primary">12 May 2026</strong>. This cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button className="btn btn-outline btn-sm" onClick={() => setCancelOpen(false)}>Keep Plan</button>
                <button className="btn btn-danger btn-sm" onClick={() => setCancelOpen(false)}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── TAB 2: Modules ────────────────────────────────────────────────────────────

function ModulesTab({ onUpgrade }) {
  const [moduleStates, setModuleStates] = useState(
    Object.fromEntries(MODULES.map(m => [m.id, m.status === 'on']))
  )

  const toggle = (id) => {
    setModuleStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-primary">Feature Modules</h3>
        <p className="text-sm text-secondary mt-0.5">Enable or disable features for your community.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon
          const isLocked = mod.status === 'locked'
          const isOn = moduleStates[mod.id]

          return (
            <div
              key={mod.id}
              className={`card p-5 flex items-start gap-4 transition-all
                ${isLocked ? 'opacity-80' : 'hover:shadow-modal'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${isLocked
                  ? 'bg-secondary/10'
                  : isOn
                  ? 'bg-teal/10'
                  : 'bg-surface'}`}
              >
                {isLocked
                  ? <Lock size={18} className="text-secondary" />
                  : <Icon size={18} className={isOn ? 'text-teal' : 'text-secondary'} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-primary">{mod.name}</p>
                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{mod.desc}</p>
                  </div>
                  {!isLocked && (
                    <Toggle enabled={isOn} onChange={() => toggle(mod.id)} />
                  )}
                </div>

                {isLocked ? (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="badge badge-amber">
                      <Lock size={9} /> Upgrade to Pro
                    </span>
                    <button
                      onClick={onUpgrade}
                      className="text-xs text-teal font-medium hover:underline flex items-center gap-0.5"
                    >
                      Upgrade <ChevronRight size={11} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <span className={`text-2xs font-semibold ${isOn ? 'text-success' : 'text-secondary'}`}>
                      {isOn ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── TAB 3: Usage ──────────────────────────────────────────────────────────────

function UsageTab() {
  const allUsage = [...USAGE_WARN, ...USAGE]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-primary">Resource Usage</h3>
        <p className="text-sm text-secondary mt-0.5">Monitor your community's plan usage and limits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {allUsage.map((item, i) => {
          const Icon = item.icon
          const p = pct(item.value, item.max)
          const color = barColor(p)

          return (
            <div key={i} className={`card p-5 space-y-3 ${item.warn ? 'ring-2 ring-amber/40' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${item.warn ? 'bg-amber/10' : 'bg-teal/10'}`}>
                    <Icon size={15} className={item.warn ? 'text-amber' : 'text-teal'} />
                  </div>
                  <p className="text-xs font-semibold text-secondary">{item.label}</p>
                </div>
                {item.warn && (
                  <span className="badge badge-amber flex items-center gap-1">
                    <AlertTriangle size={9} /> Almost Full
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-end justify-between mb-1.5">
                  <p className="text-2xl font-bold text-primary">
                    {item.value}{item.unit}
                  </p>
                  {item.max && (
                    <p className="text-xs text-secondary mb-0.5">
                      of {item.max}{item.unit}
                    </p>
                  )}
                </div>

                {item.max ? (
                  <div className="space-y-1">
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <p className={`text-2xs font-medium ${p >= 90 ? 'text-danger' : p >= 70 ? 'text-amber' : 'text-secondary'}`}>
                      {p}% used
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-secondary">This month</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Usage breakdown detail */}
      <div className="card p-6">
        <h4 className="text-sm font-semibold text-primary mb-5">Plan Limits Overview</h4>
        <div className="space-y-5">
          {[
            { label: 'Members',  value: 138, max: 250, unit: '' },
            { label: 'Storage',  value: 12,  max: 50,  unit: ' GB' },
            { label: 'Admins',   value: 2,   max: 3,   unit: '' },
          ].map((item, i) => {
            const p = pct(item.value, item.max)
            const color = barColor(p)
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-primary">{item.label}</span>
                  <span className="text-secondary">{item.value}{item.unit} / {item.max}{item.unit}</span>
                </div>
                <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── TAB 4: Invoices ───────────────────────────────────────────────────────────

function InvoicesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-primary">Invoice History</h3>
          <p className="text-sm text-secondary mt-0.5">Download your past billing statements.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left px-5 py-3 text-xs font-semibold text-secondary">Invoice ID</th>
                <th className="th text-left px-5 py-3 text-xs font-semibold text-secondary">Date</th>
                <th className="th text-left px-5 py-3 text-xs font-semibold text-secondary">Amount</th>
                <th className="th text-left px-5 py-3 text-xs font-semibold text-secondary">Plan</th>
                <th className="th text-left px-5 py-3 text-xs font-semibold text-secondary">Status</th>
                <th className="th text-left px-5 py-3 text-xs font-semibold text-secondary">Download</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-border last:border-0 hover:bg-surface/60 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/30'}`}>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-navy font-mono">{inv.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-secondary">{inv.date}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-primary">₹{inv.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4">
                    <PlanBadge plan="growth" />
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge badge-success flex items-center gap-1 w-fit">
                      <CheckCircle size={10} /> Paid
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs text-teal hover:bg-teal/8"
                      onClick={() => {}}
                    >
                      <Download size={13} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ open, onClose, yearly }) {
  if (!open) return null

  const CellVal = ({ val }) => {
    if (val === true)  return <Check size={16} className="text-success mx-auto" />
    if (val === false) return <span className="text-border text-lg leading-none">—</span>
    return <span className="text-sm font-semibold text-primary">{val}</span>
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-navy">Compare Plans</h3>
            <p className="text-sm text-secondary mt-0.5">Choose the right plan for your community.</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan headers */}
          <div className="grid grid-cols-4 gap-3">
            <div />
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`text-center p-4 rounded-card border-2 ${plan.current ? 'border-teal bg-teal/4' : 'border-border'}`}
              >
                <p className={`text-sm font-bold ${plan.current ? 'text-teal' : 'text-primary'}`}>{plan.name}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  ₹{(yearly ? plan.yearlyPrice : plan.price).toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-secondary">/mo</span>
                </p>
                {plan.current && <span className="badge badge-teal mt-1">Current</span>}
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="rounded-card border border-border overflow-hidden">
            {COMPARE_ROWS.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-3 items-center px-4 py-3 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-surface/50'
                }`}
              >
                <p className="text-sm text-secondary font-medium">{row.label}</p>
                <div className="text-center"><CellVal val={row.starter} /></div>
                <div className="text-center"><CellVal val={row.growth} /></div>
                <div className="text-center"><CellVal val={row.pro} /></div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              onClick={onClose}
            >
              <ArrowUpRight size={16} />
              Upgrade to Pro — ₹{(yearly ? 7999 : 9999).toLocaleString('en-IN')}/mo
            </button>
            <p className="text-xs text-secondary">No lock-in. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'billing',  label: 'Billing',  icon: CreditCard  },
  { id: 'modules',  label: 'Modules',  icon: LayoutGrid  },
  { id: 'usage',    label: 'Usage',    icon: BarChart2   },
  { id: 'invoices', label: 'Invoices', icon: Download    },
]

export default function CSABillingPage() {
  const [activeTab, setActiveTab] = useState('billing')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [yearly, setYearly] = useState(false)

  return (
    <div className="p-3 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-navy">Billing & Modules</h1>
          <p className="text-secondary text-sm mt-1">Manage your subscription, features, and usage.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            Active · Growth Plan
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface border border-border rounded-card p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-button text-sm font-medium transition-all
                ${active
                  ? 'bg-white text-navy shadow-card'
                  : 'text-secondary hover:text-primary'
                }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'billing'  && <BillingTab  onUpgrade={() => setUpgradeOpen(true)} yearly={yearly} setYearly={setYearly} />}
      {activeTab === 'modules'  && <ModulesTab  onUpgrade={() => setUpgradeOpen(true)} />}
      {activeTab === 'usage'    && <UsageTab />}
      {activeTab === 'invoices' && <InvoicesTab />}

      {/* Upgrade Modal */}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} yearly={yearly} />
    </div>
  )
}
