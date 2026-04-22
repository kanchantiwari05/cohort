import { useState, useMemo } from 'react'
import { Eye, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import SlideOver from '../../components/SlideOver'

const REFERRALS = [
  { id: 'lr001', from: 'Amit Desai',     to: 'Priyanka Shah',  category: 'IT Services',    status: 'closed_won',  value: 85000,  date: '2026-06-02', note: 'Website redesign project for Shah Jewellers' },
  { id: 'lr002', from: 'Ravi Krishnan',  to: 'Arjun Mehta',   category: 'Consulting',     status: 'in_progress', value: 120000, date: '2026-06-05', note: 'Export process optimisation' },
  { id: 'lr003', from: 'Sunita Patel',   to: 'Deepa Nair',    category: 'Healthcare',     status: 'pending',     value: 0,      date: '2026-06-08', note: 'Legal documentation for new clinic' },
  { id: 'lr004', from: 'Deepa Nair',     to: 'Amit Desai',    category: 'Legal Services', status: 'closed_won',  value: 42000,  date: '2026-05-28', note: 'IP registration for Desai Technologies' },
  { id: 'lr005', from: 'Arjun Mehta',    to: 'Rahul Bhatt',   category: 'Trading',        status: 'in_progress', value: 200000, date: '2026-06-01', note: 'Export insurance coverage — cargo to UAE' },
  { id: 'lr006', from: 'Rahul Bhatt',    to: 'Sanjay Verma',  category: 'Finance',        status: 'closed_won',  value: 350000, date: '2026-05-20', note: 'Project loan for residential complex' },
  { id: 'lr007', from: 'Priyanka Shah',  to: 'Nisha Agarwal', category: 'Retail',         status: 'pending',     value: 0,      date: '2026-06-10', note: 'Catering for jewellery showroom launch' },
  { id: 'lr008', from: 'Sanjay Verma',   to: 'Pooja Desai',   category: 'Real Estate',    status: 'in_progress', value: 55000,  date: '2026-06-03', note: 'Brand campaign for new residential project' },
  { id: 'lr009', from: 'Pooja Desai',    to: 'Ravi Krishnan', category: 'Marketing',      status: 'closed_won',  value: 38000,  date: '2026-05-25', note: 'Strategy consulting for PR firm' },
  { id: 'lr010', from: 'Nisha Agarwal',  to: 'Sunita Patel',  category: 'Food & Bev',     status: 'pending',     value: 0,      date: '2026-06-09', note: 'Corporate wellness package' },
  { id: 'lr011', from: 'Amit Desai',     to: 'Rahul Bhatt',   category: 'IT Services',    status: 'closed_won',  value: 68000,  date: '2026-05-15', note: 'Fintech software for insurance portal' },
  { id: 'lr012', from: 'Deepa Nair',     to: 'Sanjay Verma',  category: 'Legal Services', status: 'in_progress', value: 95000,  date: '2026-06-04', note: 'RERA compliance for builder project' },
  { id: 'lr013', from: 'Arjun Mehta',    to: 'Priyanka Shah', category: 'Trading',        status: 'closed_lost', value: 0,      date: '2026-05-18', note: 'Jewellery export deal — unsuccessful' },
  { id: 'lr014', from: 'Sunita Patel',   to: 'Ravi Krishnan', category: 'Healthcare',     status: 'in_progress', value: 75000,  date: '2026-06-06', note: 'Hospital operations consulting' },
  { id: 'lr015', from: 'Rahul Bhatt',    to: 'Pooja Desai',   category: 'Finance',        status: 'pending',     value: 0,      date: '2026-06-11', note: 'PR for insurance brand launch' },
]

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badge: 'badge-amber',   icon: Clock        },
  in_progress: { label: 'In Progress', badge: 'badge-navy',    icon: TrendingUp   },
  closed_won:  { label: 'Closed Won',  badge: 'badge-success', icon: CheckCircle  },
  closed_lost: { label: 'Closed Lost', badge: 'badge-danger',  icon: XCircle      },
}

const FILTER_TABS = ['All', 'Pending', 'In Progress', 'Closed']

function formatValue(v) {
  if (!v) return '—'
  return `₹${v.toLocaleString('en-IN')}`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Referral Timeline ────────────────────────────────────────────────────────
function ReferralTimeline({ referral }) {
  const { status } = referral
  const stages = [
    { key: 'given',       label: 'Referral Given',      done: true,   who: referral.from,  when: formatDate(referral.date) },
    { key: 'acknowledged',label: 'Acknowledged',         done: status !== 'pending',        who: referral.to,   when: status !== 'pending' ? '1 day later' : null },
    { key: 'in_progress', label: 'In Progress',          done: ['in_progress','closed_won','closed_lost'].includes(status), who: referral.to, when: ['in_progress','closed_won','closed_lost'].includes(status) ? '3 days later' : null },
    { key: 'closed',      label: status === 'closed_won' ? 'Closed Won' : status === 'closed_lost' ? 'Closed Lost' : 'Awaiting Close',
      done: ['closed_won','closed_lost'].includes(status),
      who: ['closed_won','closed_lost'].includes(status) ? referral.from : null,
      when: ['closed_won','closed_lost'].includes(status) ? '2 weeks later' : null,
    },
  ]

  return (
    <div className="space-y-0">
      {stages.map((s, i) => (
        <div key={s.key} className="flex gap-4">
          {/* Connector */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              s.done ? 'bg-teal text-white' : 'bg-surface border-2 border-border text-secondary'
            }`}>
              {s.done ? <CheckCircle size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
            </div>
            {i < stages.length - 1 && (
              <div className={`w-0.5 flex-1 mt-1 mb-1 ${s.done ? 'bg-teal' : 'bg-border'}`} style={{ minHeight: 24 }} />
            )}
          </div>
          {/* Content */}
          <div className={`pb-4 flex-1 ${i < stages.length - 1 ? '' : ''}`}>
            <p className={`text-sm font-semibold ${s.done ? 'text-primary' : 'text-secondary'}`}>{s.label}</p>
            {s.who && <p className="text-2xs text-secondary mt-0.5">{s.who}</p>}
            {s.when && <p className="text-2xs text-secondary">{s.when}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Referral Detail SlideOver ────────────────────────────────────────────────
function ReferralDetail({ referral }) {
  const cfg = STATUS_CONFIG[referral.status]
  return (
    <div className="p-6 space-y-6">
      {/* Status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-button ${
        referral.status === 'closed_won' ? 'bg-success/5 border border-success/20' :
        referral.status === 'closed_lost' ? 'bg-danger/5 border border-danger/20' :
        referral.status === 'in_progress' ? 'bg-navy/5 border border-navy/20' :
        'bg-amber/5 border border-amber/20'
      }`}>
        <cfg.icon size={18} className={
          referral.status === 'closed_won' ? 'text-success' :
          referral.status === 'closed_lost' ? 'text-danger' :
          referral.status === 'in_progress' ? 'text-navy' : 'text-amber'
        } />
        <div>
          <p className="text-sm font-semibold text-primary">{cfg.label}</p>
          <p className="text-2xs text-secondary">{formatDate(referral.date)}</p>
        </div>
        {referral.value > 0 && (
          <p className="ml-auto text-base font-bold text-primary">{formatValue(referral.value)}</p>
        )}
      </div>

      {/* Parties */}
      <div>
        <p className="text-xs font-semibold text-secondary mb-3">Referral Flow</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center p-3 bg-surface rounded-button">
            <p className="text-2xs text-secondary mb-1">From</p>
            <p className="text-sm font-bold text-primary">{referral.from}</p>
          </div>
          <ArrowRight size={16} className="text-secondary flex-shrink-0" />
          <div className="flex-1 text-center p-3 bg-surface rounded-button">
            <p className="text-2xs text-secondary mb-1">To</p>
            <p className="text-sm font-bold text-primary">{referral.to}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {[
          { label: 'Category', value: referral.category },
          { label: 'Date',     value: formatDate(referral.date) },
          { label: 'Note',     value: referral.note },
        ].map(r => (
          <div key={r.label} className="flex gap-3 text-sm">
            <span className="text-secondary w-20 flex-shrink-0">{r.label}</span>
            <span className="text-primary">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs font-semibold text-secondary mb-4">Progress Timeline</p>
        <ReferralTimeline referral={referral} />
      </div>
    </div>
  )
}

// ── Main Referrals Page ──────────────────────────────────────────────────────
export default function LAReferralsPage() {
  const [filter, setFilter]     = useState('All')
  const [detail, setDetail]     = useState(null)

  const filtered = useMemo(() => {
    return REFERRALS.filter(r => {
      if (filter === 'All')         return true
      if (filter === 'Pending')     return r.status === 'pending'
      if (filter === 'In Progress') return r.status === 'in_progress'
      if (filter === 'Closed')      return r.status === 'closed_won' || r.status === 'closed_lost'
      return true
    })
  }, [filter])

  const summary = {
    given:       REFERRALS.length,
    received:    REFERRALS.filter(r => r.to === 'Amit Desai').length + 5,
    inProgress:  REFERRALS.filter(r => r.status === 'in_progress').length,
    closedWon:   REFERRALS.filter(r => r.status === 'closed_won').length,
    totalValue:  REFERRALS.filter(r => r.status === 'closed_won').reduce((s, r) => s + r.value, 0),
  }

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-primary">Referrals</h1>
        <p className="text-secondary text-sm mt-1">Andheri Chapter referral pipeline</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Given',        value: summary.given,      color: 'text-navy'    },
          { label: 'Received',     value: summary.received,   color: 'text-teal'    },
          { label: 'In Progress',  value: summary.inProgress, color: 'text-navy'    },
          { label: 'Closed Won',   value: summary.closedWon,  color: 'text-success' },
          { label: '₹ Value',      value: `₹${(summary.totalValue / 100000).toFixed(1)}L`, color: 'text-amber' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-2xs text-secondary">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-border">
        {FILTER_TABS.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              filter === t ? 'text-teal' : 'text-secondary hover:text-primary'
            }`}
          >
            {t}
            {filter === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t" />}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left">From</th>
                <th className="th text-left">To</th>
                <th className="th text-left">Category</th>
                <th className="th text-left">Status</th>
                <th className="th text-right">Value</th>
                <th className="th text-left">Date</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const cfg = STATUS_CONFIG[r.status]
                return (
                  <tr key={r.id} className="tr">
                    <td className="td font-medium text-sm">{r.from}</td>
                    <td className="td text-sm text-secondary">{r.to}</td>
                    <td className="td text-sm text-secondary">{r.category}</td>
                    <td className="td">
                      <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                    </td>
                    <td className="td text-right text-sm font-semibold text-primary">{formatValue(r.value)}</td>
                    <td className="td text-sm text-secondary whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="td text-right">
                      <button onClick={() => setDetail(r)} className="btn-ghost btn-sm flex items-center gap-1.5 ml-auto">
                        <Eye size={13} /> Details
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="td text-center py-8 text-secondary">No referrals match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail SlideOver */}
      <SlideOver
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.from} → ${detail.to}` : ''}
        width={480}
      >
        {detail && <ReferralDetail referral={detail} />}
      </SlideOver>
    </div>
  )
}
