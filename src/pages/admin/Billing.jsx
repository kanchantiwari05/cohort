import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard, TrendingUp, AlertTriangle, CheckCircle2,
  Download, Send, Check, ChevronDown, X,
  FileText, RefreshCw, Bell, IndianRupee,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import toast from 'react-hot-toast'
import { plans, invoices as seedInvoices, mrrHistory, planDistribution } from '../../data/billing'
import { tenants } from '../../data/tenants'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import Select from '../../components/Select'

const INV_PER_PAGE = 10
import { useLoading } from '../../hooks/useLoading'

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Overdue Banner ────────────────────────────────────────────────────────────

function OverdueBanner({ invoices, onSendReminder }) {
  const overdue = invoices.filter(inv => inv.status === 'overdue')
  if (!overdue.length) return null

  const totalAmt = overdue.reduce((s, inv) => s + inv.amount, 0)

  return (
    <div className="rounded-card border border-danger/25 bg-danger/5 p-4 flex items-start gap-3">
      <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-danger">
          {overdue.length} overdue invoice{overdue.length > 1 ? 's' : ''} — ₹{totalAmt.toLocaleString('en-IN')} unpaid
        </p>
        <p className="text-xs text-danger/70 mt-0.5">
          {overdue.map(inv => `${inv.communityName} (${inv.overdueDays}d overdue)`).join(', ')}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onSendReminder(overdue[0])}
          className="btn-ghost btn btn-sm border border-danger/30 text-danger hover:bg-danger/8 text-xs"
        >
          <Bell size={12} /> Send Reminder
        </button>
      </div>
    </div>
  )
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend, trendType = 'neutral', icon: Icon, iconBg, iconColor }) {
  const trendColor = trendType === 'positive' ? 'text-success' : trendType === 'negative' ? 'text-danger' : 'text-amber-dark'
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-button flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{value}</p>
        {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
      )}
    </div>
  )
}

// ── MRR Chart ─────────────────────────────────────────────────────────────────

function MrrChart() {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-border rounded-card shadow-modal px-3 py-2">
        <p className="text-xs font-semibold text-primary mb-1">{label} 2024</p>
        <p className="text-sm font-bold text-teal">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-primary">Monthly Recurring Revenue</p>
          <p className="text-xs text-secondary mt-0.5">6-month trend</p>
        </div>
        <span className="badge badge-teal text-[10px]">+100% YoY</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={mrrHistory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#028090" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#028090" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `₹${v / 1000}K`}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <ReTooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#028090"
            strokeWidth={2}
            fill="url(#mrrGrad)"
            dot={{ fill: '#028090', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#028090' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Plan Distribution ─────────────────────────────────────────────────────────

function PlanDistributionChart() {
  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.1) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${Math.round(percent * 100)}%`}
      </text>
    )
  }

  return (
    <div className="card p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-primary">Plan Distribution</p>
        <p className="text-xs text-secondary mt-0.5">Active subscriptions by plan</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={planDistribution}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {planDistribution.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-1">
        {planDistribution.map(p => (
          <div key={p.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
              <span className="text-secondary">{p.name}</span>
              <span className="text-primary font-medium">{p.count} clients</span>
            </div>
            <span className="font-semibold text-primary">₹{p.value.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Generate Invoice Modal ────────────────────────────────────────────────────

function GenerateInvoiceModal({ open, onClose, onGenerate }) {
  const [tenantId,  setTenantId]  = useState('')
  const [month,     setMonth]     = useState(() => new Date().toISOString().slice(0, 7))
  const [planId,    setPlanId]    = useState('')
  const [amount,    setAmount]    = useState('')
  const [dueDate,   setDueDate]   = useState('2024-07-15')
  const [loading,   setLoading]   = useState(false)

  const tenant = tenants.find(t => t.id === tenantId)

  // Auto-fill plan + amount when tenant changes
  const handleTenantChange = (id) => {
    setTenantId(id)
    const t = tenants.find(t => t.id === id)
    if (t) {
      setPlanId(t.plan)
      setAmount(String(t.monthlyAmount))
    }
  }

  const selectedPlan = plans.find(p => p.id === planId)

  const handleGenerate = () => {
    if (!tenantId || !month || !amount) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onGenerate({
        tenantId,
        communityName: tenant?.name,
        plan: planId,
        amount: Number(amount),
        period: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        dueDate,
        status: 'pending',
      })
      toast.success('Invoice generated & sent ✓')
      onClose()
    }, 1200)
  }

  const previewNum = `CNP-2024-${String(Math.floor(Math.random() * 40) + 60).padStart(4, '0')}`
  const monthLabel = month ? new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''

  return (
    <Modal open={open} onClose={onClose} title="Generate Invoice" maxWidth={520}>
      <div className="p-6 space-y-5">

        {/* Community */}
        <div>
          <Select
            label="Community *"
            value={tenantId}
            onChange={v => handleTenantChange(v)}
            placeholder="Select community…"
            options={tenants
              .filter(t => t.status === 'active' || t.status === 'pending_setup')
              .map(t => ({ value: t.id, label: t.name }))}
          />
        </div>

        {/* Month + Plan row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
              Billing Month <span className="text-danger">*</span>
            </label>
            <input
              type="month"
              className="input"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Plan"
              value={planId}
              onChange={v => {
                setPlanId(v)
                const p = plans.find(p => p.id === v)
                if (p) setAmount(String(p.price))
              }}
              placeholder="—"
              options={plans.map(p => ({ value: p.id, label: p.name }))}
            />
          </div>
        </div>

        {/* Amount + Due Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
              Amount (₹) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="25000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Preview card */}
        {tenantId && amount && (
          <div className="bg-surface border border-border rounded-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Invoice Preview</p>
              <span className="text-xs font-mono text-secondary">{previewNum}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">{tenant?.name}</p>
                <p className="text-xs text-secondary">{selectedPlan?.name} Plan · {monthLabel}</p>
              </div>
              <p className="text-lg font-bold text-primary">₹{Number(amount).toLocaleString('en-IN')}</p>
            </div>
            <p className="text-xs text-secondary">Due: {fmtDate(dueDate)}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost btn flex-1">Cancel</button>
          <button
            onClick={handleGenerate}
            disabled={loading || !tenantId || !amount}
            className="btn-primary btn flex-1"
          >
            {loading
              ? <><RefreshCw size={14} className="animate-spin" /> Generating…</>
              : <><FileText size={14} /> Generate & Send</>
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Change Plan Modal ─────────────────────────────────────────────────────────

function ChangePlanModal({ open, onClose, invoice, onConfirm }) {
  const currentPlan = invoice?.plan ?? 'professional'
  const [selected, setSelected] = useState(currentPlan)

  const selectedPlanData  = plans.find(p => p.id === selected)
  const currentPlanData   = plans.find(p => p.id === currentPlan)
  const diff = selectedPlanData && currentPlanData
    ? selectedPlanData.price - currentPlanData.price
    : 0

  const handleConfirm = () => {
    onConfirm(selected)
    toast.success(`Plan changed to ${selectedPlanData?.name} ✓`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Change Plan" maxWidth={520}>
      <div className="p-6 space-y-4">
        <p className="text-sm text-secondary">
          Changing plan for <span className="font-semibold text-primary">{invoice?.communityName}</span>.
          Changes take effect on the next billing cycle.
        </p>

        <div className="space-y-3">
          {plans.map(plan => {
            const isCurrent  = plan.id === currentPlan
            const isSelected = plan.id === selected
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left rounded-card border-2 p-4 transition-all
                  ${isSelected
                    ? 'border-teal bg-teal/5'
                    : 'border-border hover:border-teal/40 bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-teal' : 'border-border'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-teal" />}
                    </div>
                    <p className="text-sm font-semibold text-primary">{plan.name}</p>
                    {isCurrent && <span className="badge badge-teal text-[10px]">Current</span>}
                  </div>
                  <p className="text-sm font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-secondary">/mo</span></p>
                </div>
                <div className="mt-2 ml-6 text-xs text-secondary space-y-0.5">
                  {plan.maxMembers
                    ? <p>Up to {plan.maxMembers.toLocaleString()} members · {plan.maxNodes} nodes</p>
                    : <p>Unlimited members & nodes</p>
                  }
                  <p className="capitalize">
                    {plan.features.includes('all') ? 'All features included' : plan.features.join(', ')}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Change summary */}
        {selected !== currentPlan && (
          <div className={`rounded-card border p-3 text-sm
            ${diff > 0 ? 'border-teal/20 bg-teal/5' : 'border-amber/20 bg-amber/5'}`}>
            <p className="font-semibold text-primary">
              {diff > 0 ? 'Upgrade' : 'Downgrade'} summary
            </p>
            <p className={`text-xs mt-1 ${diff > 0 ? 'text-teal' : 'text-amber-dark'}`}>
              {diff > 0
                ? `+₹${Math.abs(diff).toLocaleString('en-IN')}/mo starting next cycle`
                : `-₹${Math.abs(diff).toLocaleString('en-IN')}/mo starting next cycle`
              }
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost btn flex-1">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={selected === currentPlan}
            className="btn-primary btn flex-1"
          >
            <Check size={14} /> Confirm Change
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Send Reminder Modal ───────────────────────────────────────────────────────

function SendReminderModal({ open, onClose, invoice }) {
  const [channel, setChannel] = useState('both')
  const [msg, setMsg] = useState(
    invoice
      ? `Dear ${invoice.communityName} Team,\n\nThis is a reminder that invoice ${invoice.invoiceNumber} for ₹${invoice.amount?.toLocaleString('en-IN')} (${invoice.period}) is due${invoice.status === 'overdue' ? ' and is now overdue' : ''} on ${fmtDate(invoice.dueDate)}.\n\nPlease make the payment at your earliest convenience.\n\n— CNP Platform Team`
      : ''
  )
  const [sent, setSent] = useState(false)

  const CHANNELS = [
    { value: 'email',    label: 'Email only' },
    { value: 'whatsapp', label: 'WhatsApp only' },
    { value: 'both',     label: 'Email + WhatsApp' },
  ]

  const handleSend = () => {
    setSent(true)
    setTimeout(() => {
      setSent(false)
      toast.success('Payment reminder sent ✓')
      onClose()
    }, 800)
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Payment Reminder" maxWidth={500}>
      <div className="p-6 space-y-4">
        {invoice && (
          <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card text-sm">
            <FileText size={15} className="text-teal flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">{invoice.communityName}</p>
              <p className="text-xs text-secondary mt-0.5">
                {invoice.invoiceNumber} · ₹{invoice.amount?.toLocaleString('en-IN')} due {fmtDate(invoice.dueDate)}
              </p>
            </div>
            <span className={`badge ml-auto flex-shrink-0
              ${invoice.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
              {invoice.status === 'overdue' ? 'Overdue' : 'Pending'}
            </span>
          </div>
        )}

        {/* Channel */}
        <div>
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Send via
          </label>
          <div className="flex gap-2">
            {CHANNELS.map(c => (
              <button
                key={c.value}
                onClick={() => setChannel(c.value)}
                className={`flex-1 py-2 px-3 rounded-button border text-xs font-medium transition-all
                  ${channel === c.value
                    ? 'border-teal bg-teal/8 text-teal'
                    : 'border-border text-secondary hover:border-teal/40'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
            Message
          </label>
          <textarea
            className="input"
            style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
            rows={6}
            value={msg}
            onChange={e => setMsg(e.target.value)}
          />
          <p className="text-[11px] text-secondary mt-1">You can edit before sending.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost btn flex-1">Cancel</button>
          <button
            onClick={handleSend}
            disabled={sent}
            className="btn-primary btn flex-1"
            style={{ background: sent ? '#2E7D32' : undefined }}
          >
            {sent
              ? <><Check size={14} /> Sent!</>
              : <><Send size={14} /> Send Reminder</>
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Mark as Paid Modal ────────────────────────────────────────────────────────

function MarkAsPaidModal({ open, onClose, invoice, onConfirm }) {
  const today = new Date().toISOString().slice(0, 10)
  const [paidDate,  setPaidDate]  = useState(today)
  const [method,    setMethod]    = useState('bank_transfer')
  const [reference, setReference] = useState('')
  const [loading,   setLoading]   = useState(false)

  const METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi',           label: 'UPI' },
    { value: 'cheque',        label: 'Cheque' },
    { value: 'card',          label: 'Card' },
    { value: 'other',         label: 'Other' },
  ]

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onConfirm(invoice.id, { paidDate, method, reference })
      toast.success(`Invoice ${invoice.invoiceNumber} marked as paid ✓`)
      onClose()
    }, 800)
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark Invoice as Paid" maxWidth={460}>
      <div className="p-6 space-y-4">
        {invoice && (
          <div className="bg-surface border border-border rounded-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{invoice.communityName}</p>
              <p className="text-xs text-secondary mt-0.5">{invoice.invoiceNumber} · {invoice.period}</p>
            </div>
            <p className="text-lg font-bold text-primary">₹{invoice.amount?.toLocaleString('en-IN')}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
              Payment Date
            </label>
            <input
              type="date"
              className="input"
              value={paidDate}
              onChange={e => setPaidDate(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Payment Method"
              value={method}
              onChange={v => setMethod(v)}
              options={METHODS}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
            Reference / Transaction ID <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            className="input"
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="UTR number, cheque no., etc."
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost btn flex-1">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn flex-1 text-white font-medium rounded-button transition-colors"
            style={{ background: loading ? '#2E7D32' : '#2E7D32' }}
          >
            {loading
              ? <><RefreshCw size={14} className="animate-spin" /> Saving…</>
              : <><CheckCircle2 size={14} /> Mark as Paid</>
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Invoice Table ─────────────────────────────────────────────────────────────

const TAB_OPTIONS = [
  { value: 'all',     label: 'All' },
  { value: 'paid',    label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

const STATUS_META = {
  paid:    { cls: 'badge-success', label: 'Paid' },
  pending: { cls: 'badge-warning', label: 'Pending' },
  overdue: { cls: 'badge-danger',  label: 'Overdue' },
}

function InvoiceTable({ invoices, onSendReminder, onMarkPaid, onChangePlan }) {
  const [tab,  setTab]  = useState('all')
  const [page, setPage] = useState(1)

  const counts = useMemo(() => ({
    all:     invoices.length,
    paid:    invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  }), [invoices])

  const filtered = tab === 'all' ? invoices : invoices.filter(i => i.status === tab)
  const paged    = filtered.slice((page - 1) * INV_PER_PAGE, page * INV_PER_PAGE)

  const plan = (id) => plans.find(p => p.id === id)

  return (
    <div className="card">
      {/* Tabs */}
      <div className="flex border-b border-border px-5 pt-4 gap-1">
        {TAB_OPTIONS.map(t => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(1) }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-button border-b-2 transition-colors
              ${tab === t.value
                ? 'border-teal text-teal'
                : 'border-transparent text-secondary hover:text-primary'}`}
          >
            {t.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
              ${tab === t.value ? 'bg-teal/12 text-teal' : 'bg-surface text-secondary'}`}>
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Invoice #</th>
              <th className="th">Community</th>
              <th className="th">Plan</th>
              <th className="th">Amount</th>
              <th className="th">Period</th>
              <th className="th">Due Date</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="td text-center py-12 text-secondary text-sm">
                  No invoices match this filter
                </td>
              </tr>
            ) : paged.map(inv => {
              const meta = STATUS_META[inv.status]
              const planData = plan(inv.plan)
              return (
                <tr key={inv.id} className="tr">
                  <td className="td font-mono text-xs text-secondary">{inv.invoiceNumber}</td>
                  <td className="td">
                    <Link
                      to={`/admin/tenants/${inv.tenantId}`}
                      className="text-sm font-medium text-primary hover:text-teal transition-colors"
                    >
                      {inv.communityName}
                    </Link>
                  </td>
                  <td className="td">
                    <span className="text-xs font-medium text-secondary capitalize">{planData?.name ?? inv.plan}</span>
                  </td>
                  <td className="td">
                    <span className="text-sm font-semibold text-primary">₹{inv.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="td text-xs text-secondary">{inv.period}</td>
                  <td className="td text-xs text-secondary">
                    {fmtDate(inv.dueDate)}
                    {inv.status === 'overdue' && (
                      <p className="text-danger text-[10px] font-medium mt-0.5">{inv.overdueDays}d overdue</p>
                    )}
                  </td>
                  <td className="td">
                    <span className={`badge ${meta.cls} text-[10px]`}>{meta.label}</span>
                    {inv.paidDate && (
                      <p className="text-[10px] text-secondary mt-0.5">Paid {fmtDate(inv.paidDate)}</p>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      {/* Download PDF — always */}
                      <button
                        onClick={() => toast.success('PDF download started ✓')}
                        className="p-1.5 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors"
                        title="Download PDF"
                      >
                        <Download size={13} />
                      </button>
                      {/* Resend Invoice — always */}
                      <button
                        onClick={() => toast.success(`Invoice ${inv.invoiceNumber} resent to ${inv.communityName} ✓`)}
                        className="p-1.5 rounded-button text-secondary hover:bg-surface hover:text-teal transition-colors"
                        title="Resend Invoice"
                      >
                        <Send size={13} />
                      </button>
                      {/* Change plan — always */}
                      <button
                        onClick={() => onChangePlan(inv)}
                        className="p-1.5 rounded-button text-secondary hover:bg-surface hover:text-teal transition-colors"
                        title="Change Plan"
                      >
                        <RefreshCw size={13} />
                      </button>
                      {/* Send reminder — pending/overdue */}
                      {(inv.status === 'pending' || inv.status === 'overdue') && (
                        <button
                          onClick={() => onSendReminder(inv)}
                          className="p-1.5 rounded-button text-amber-dark hover:bg-amber/8 transition-colors"
                          title="Send Reminder"
                        >
                          <Bell size={13} />
                        </button>
                      )}
                      {/* Mark as paid — pending/overdue */}
                      {(inv.status === 'pending' || inv.status === 'overdue') && (
                        <button
                          onClick={() => onMarkPaid(inv)}
                          className="p-1.5 rounded-button text-success hover:bg-success/8 transition-colors"
                          title="Mark as Paid"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4">
        <Pagination page={page} total={filtered.length} perPage={INV_PER_PAGE} onChange={setPage} />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const loading = useLoading(240)

  const [invoices, setInvoices] = useState(seedInvoices)

  // Modal state
  const [generateOpen,  setGenerateOpen]  = useState(false)
  const [reminderInv,   setReminderInv]   = useState(null)
  const [changePlanInv, setChangePlanInv] = useState(null)
  const [markPaidInv,   setMarkPaidInv]   = useState(null)

  const mrr      = mrrHistory[mrrHistory.length - 1].mrr
  const prevMrr  = mrrHistory[mrrHistory.length - 2].mrr
  const mrrDiff  = mrr - prevMrr
  const arr      = mrr * 12
  const paidThis = invoices.filter(i => i.status === 'paid')
  const overdueList = invoices.filter(i => i.status === 'overdue')

  const handleGenerate = (data) => {
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `CNP-2024-${String(Date.now()).slice(-4)}`,
      overdueDays: 0,
      paidDate: null,
      ...data,
    }
    setInvoices(prev => [newInv, ...prev])
  }

  const handleMarkPaid = (invId, paymentData) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invId
        ? { ...inv, status: 'paid', paidDate: paymentData.paidDate, overdueDays: 0 }
        : inv
    ))
  }

  const handleChangePlan = (newPlanId) => {
    if (!changePlanInv) return
    setInvoices(prev => prev.map(inv =>
      inv.id === changePlanInv.id ? { ...inv, plan: newPlanId } : inv
    ))
  }

  const STATS = [
    {
      label:     'MRR',
      value:     `₹${mrr.toLocaleString('en-IN')}`,
      sub:       'Monthly Recurring Revenue',
      trend:     `+₹${mrrDiff.toLocaleString('en-IN')} vs last month`,
      trendType: 'positive',
      icon:      TrendingUp,
      iconBg:    'bg-teal/10',
      iconColor: 'text-teal',
    },
    {
      label:     'ARR',
      value:     fmtINR(arr),
      sub:       'Annual Recurring Revenue',
      trend:     'Based on current MRR',
      trendType: 'neutral',
      icon:      IndianRupee,
      iconBg:    'bg-navy/8',
      iconColor: 'text-navy',
    },
    {
      label:     'Paid This Month',
      value:     String(paidThis.length),
      sub:       `₹${paidThis.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')} collected`,
      trend:     `${paidThis.length} invoice${paidThis.length !== 1 ? 's' : ''} settled`,
      trendType: 'positive',
      icon:      CheckCircle2,
      iconBg:    'bg-success/10',
      iconColor: 'text-success',
    },
    {
      label:     'Overdue',
      value:     String(overdueList.length),
      sub:       `₹${overdueList.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')} outstanding`,
      trend:     overdueList.length > 0 ? 'Action required' : 'All clear',
      trendType: overdueList.length > 0 ? 'negative' : 'positive',
      icon:      AlertTriangle,
      iconBg:    overdueList.length > 0 ? 'bg-danger/10' : 'bg-success/10',
      iconColor: overdueList.length > 0 ? 'text-danger' : 'text-success',
    },
  ]

  return (
    <div className="p-3 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Billing & Subscriptions</h1>
          <p className="text-secondary text-sm mt-0.5">Manage plans, invoices, and revenue.</p>
        </div>
        <button
          onClick={() => setGenerateOpen(true)}
          className="btn-primary btn"
        >
          <FileText size={15} /> Generate Invoice
        </button>
      </div>

      {/* ── Overdue Banner ── */}
      <OverdueBanner
        invoices={invoices}
        onSendReminder={(inv) => setReminderInv(inv)}
      />

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 space-y-3 animate-pulse">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-7 w-28 bg-gray-100 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* ── Charts Row ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card p-5 animate-pulse" style={{ height: 280 }}>
            <div className="h-4 w-40 bg-gray-100 rounded mb-4" />
            <div className="h-full bg-gray-50 rounded" />
          </div>
          <div className="card p-5 animate-pulse" style={{ height: 280 }}>
            <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
            <div className="h-full bg-gray-50 rounded" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <MrrChart />
          </div>
          <PlanDistributionChart />
        </div>
      )}

      {/* ── Invoice Table ── */}
      {loading ? (
        <div className="card p-5 animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-28 bg-gray-100 rounded" />
              <div className="h-4 w-36 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <InvoiceTable
          invoices={invoices}
          onSendReminder={(inv) => setReminderInv(inv)}
          onMarkPaid={(inv) => setMarkPaidInv(inv)}
          onChangePlan={(inv) => setChangePlanInv(inv)}
        />
      )}

      {/* ── Modals ── */}
      <GenerateInvoiceModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
      />

      {reminderInv && (
        <SendReminderModal
          open
          onClose={() => setReminderInv(null)}
          invoice={reminderInv}
        />
      )}

      {changePlanInv && (
        <ChangePlanModal
          open
          onClose={() => setChangePlanInv(null)}
          invoice={changePlanInv}
          onConfirm={handleChangePlan}
        />
      )}

      {markPaidInv && (
        <MarkAsPaidModal
          open
          onClose={() => setMarkPaidInv(null)}
          invoice={markPaidInv}
          onConfirm={handleMarkPaid}
        />
      )}
    </div>
  )
}
