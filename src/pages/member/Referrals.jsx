import { useState } from 'react'
import { Plus, X, CheckCircle, Clock, TrendingUp, XCircle, ChevronRight, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Select from '../../components/Select'

const MY_REFERRALS = [
  { id: 'r001', to: 'Priyanka Shah',   category: 'IT Services',    status: 'closed_won',  value: 85000,  date: '2 Jun 2026', note: 'Website redesign for Shah Jewellers' },
  { id: 'r002', to: 'Rahul Bhatt',     category: 'IT Services',    status: 'closed_won',  value: 68000,  date: '15 May 2026', note: 'Fintech software for insurance portal' },
  { id: 'r003', to: 'Deepa Nair',      category: 'Legal Services', status: 'in_progress', value: 0,      date: '4 Jun 2026', note: 'RERA compliance for builder project' },
]

const GIVEN_TO_ME = [
  { id: 'r004', from: 'Ravi Krishnan', category: 'Consulting',     status: 'in_progress', value: 120000, date: '5 Jun 2026', note: 'Export process optimisation' },
  { id: 'r005', from: 'Deepa Nair',    category: 'Legal Services', status: 'closed_won',  value: 42000,  date: '28 May 2026', note: 'IP registration for Desai Technologies' },
]

const MEMBERS = ['Priyanka Shah', 'Ravi Krishnan', 'Sunita Patel', 'Deepa Nair', 'Arjun Mehta', 'Kavita Joshi', 'Sanjay Verma', 'Nisha Agarwal', 'Rahul Bhatt', 'Pooja Desai', 'Manish Gupta']
const CATEGORIES = ['IT Services', 'Consulting', 'Healthcare', 'Legal Services', 'Finance', 'Real Estate', 'Marketing', 'Trading', 'Food & Bev', 'Retail', 'Events', 'Logistics']

const STATUS = {
  pending:     { label: 'Pending',     cls: 'badge-amber',   icon: Clock       },
  in_progress: { label: 'In Progress', cls: 'badge-navy',    icon: TrendingUp  },
  closed_won:  { label: 'Closed Won',  cls: 'badge-success', icon: CheckCircle },
  closed_lost: { label: 'Closed Lost', cls: 'badge-danger',  icon: XCircle     },
}

function formatValue(v) { return v ? `₹${v.toLocaleString('en-IN')}` : '—' }

// 3-step bottom sheet
function LogReferralSheet({ onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [receiver, setReceiver] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [value, setValue] = useState('')
  const [success, setSuccess] = useState(false)

  const canStep1 = receiver !== ''
  const canStep2 = category !== '' && note.trim().length > 3

  const handleSubmit = () => {
    setSuccess(true)
    setTimeout(() => { onSubmit({ receiver, category, note, value }); onClose() }, 1800)
  }

  if (success) {
    return (
      <div className="px-6 py-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h3 className="text-lg font-bold text-primary">Referral Logged!</h3>
        <p className="text-sm text-secondary mt-2">Your referral to <strong>{receiver}</strong> has been submitted.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Sheet header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-primary">Log a Referral</h3>
          <p className="text-xs text-secondary mt-0.5">Step {step} of 3</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
          <X size={15} className="text-secondary" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 px-5 pt-4 pb-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1 rounded-full transition-colors" style={{ background: s <= step ? '#028090' : '#D0DCF0' }} />
        ))}
      </div>

      <div className="px-5 pb-6 pt-4">
        {/* Step 1 — Select receiver */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary mb-3">Who are you referring?</p>
            {MEMBERS.map(m => (
              <button
                key={m}
                onClick={() => setReceiver(m)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] border text-sm transition-colors ${
                  receiver === m ? 'border-teal bg-teal/5 text-teal font-semibold' : 'border-border text-primary'
                }`}
              >
                {m}
                {receiver === m && <CheckCircle size={16} className="text-teal" />}
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Fill details */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">Referral to <span className="text-teal">{receiver}</span></p>
            <div>
              <Select
                label="Category"
                value={category}
                onChange={v => setCategory(v)}
                placeholder="Select category…"
                options={[
                  { value: '', label: 'Select category…' },
                  ...CATEGORIES.map(c => ({ value: c, label: c })),
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">Referral Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Briefly describe the opportunity…"
                className="input w-full resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">Estimated Value (₹) — optional</label>
              <input
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="e.g. 50000"
                className="input w-full"
              />
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary mb-2">Review & Submit</p>
            <div className="rounded-[14px] border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center p-2 bg-surface rounded-[10px]">
                  <p className="text-[10px] text-secondary mb-0.5">From</p>
                  <p className="text-xs font-bold text-primary">You (Amit Desai)</p>
                </div>
                <ArrowRight size={14} className="text-secondary flex-shrink-0" />
                <div className="flex-1 text-center p-2 bg-surface rounded-[10px]">
                  <p className="text-[10px] text-secondary mb-0.5">To</p>
                  <p className="text-xs font-bold text-primary">{receiver}</p>
                </div>
              </div>
              {[
                { label: 'Category', value: category },
                { label: 'Note',     value: note },
                { label: 'Value',    value: value ? `₹${parseInt(value).toLocaleString('en-IN')}` : 'Not specified' },
              ].map(r => (
                <div key={r.label} className="flex gap-3 text-sm">
                  <span className="text-secondary w-20 flex-shrink-0 text-xs">{r.label}</span>
                  <span className="text-primary text-xs font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">Back</button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canStep1 : !canStep2}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary flex-1">Submit Referral</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MemberReferrals() {
  const [tab, setTab] = useState('given')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [myRefs, setMyRefs] = useState(MY_REFERRALS)

  const onSubmit = ({ receiver, category, note, value }) => {
    const newRef = {
      id: `r${Date.now()}`,
      to: receiver, category, note,
      status: 'pending',
      value: value ? parseInt(value) : 0,
      date: 'Today',
    }
    setMyRefs(prev => [newRef, ...prev])
    toast.success('Referral logged successfully!', { style: { fontSize: 13 } })
  }

  const list = tab === 'given' ? myRefs : GIVEN_TO_ME

  return (
    <div className="p-3">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: '#1B3A6B' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Referrals</h1>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Plus size={15} /> Log New
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 mt-4">
          {[
            { label: 'Given',     value: myRefs.length,                                     color: 'bg-white/10' },
            { label: 'Closed Won', value: myRefs.filter(r => r.status === 'closed_won').length, color: 'bg-success/30' },
            { label: '₹ Value',   value: `₹${(myRefs.filter(r => r.status === 'closed_won').reduce((s, r) => s + r.value, 0) / 100000).toFixed(1)}L`, color: 'bg-amber/30' },
          ].map(s => (
            <div key={s.label} className={`flex-1 ${s.color} rounded-[10px] p-2.5 text-center`}>
              <p className="text-white text-base font-bold">{s.value}</p>
              <p className="text-white/60 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white">
        {[
          { key: 'given',    label: 'Given by Me'  },
          { key: 'received', label: 'Given to Me'  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 relative py-3 text-sm font-medium transition-colors ${
              tab === t.key ? 'text-teal' : 'text-secondary'
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-3">
        {list.map(r => {
          const cfg = STATUS[r.status]
          return (
            <div key={r.id} className="rounded-[14px] border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-primary">{tab === 'given' ? r.to : r.from}</p>
                  <p className="text-xs text-secondary">{r.category}</p>
                </div>
                <span className={`badge ${cfg.cls} flex-shrink-0`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-secondary leading-snug mb-3">{r.note}</p>
              <div className="flex items-center justify-between text-xs text-secondary">
                <span>{r.date}</span>
                {r.value > 0 && <span className="font-semibold text-primary">{formatValue(r.value)}</span>}
              </div>
            </div>
          )
        })}

        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-secondary">No referrals yet</p>
          </div>
        )}
      </div>

      {/* Bottom sheet backdrop */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSheetOpen(false)} />
      )}

      {/* Bottom sheet */}
      {sheetOpen && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-[24px] overflow-hidden"
          style={{ maxHeight: '90vh' }}>
          <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <LogReferralSheet onClose={() => setSheetOpen(false)} onSubmit={onSubmit} />
          </div>
        </div>
      )}
    </div>
  )
}
