import { useState } from 'react'
import { ClipboardCheck, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MEMBERS = [
  { id: 'lm001', name: 'Amit Desai',     rate: 92, attended: 23, total: 25, risk: false },
  { id: 'lm002', name: 'Priyanka Shah',  rate: 82, attended: 20, total: 25, risk: false },
  { id: 'lm003', name: 'Ravi Krishnan',  rate: 77, attended: 19, total: 25, risk: false },
  { id: 'lm004', name: 'Sunita Patel',   rate: 96, attended: 24, total: 25, risk: false },
  { id: 'lm005', name: 'Manish Gupta',   rate: 42, attended: 10, total: 25, risk: true  },
  { id: 'lm006', name: 'Deepa Nair',     rate: 86, attended: 21, total: 25, risk: false },
  { id: 'lm007', name: 'Arjun Mehta',    rate: 90, attended: 22, total: 25, risk: false },
  { id: 'lm008', name: 'Kavita Joshi',   rate: 25, attended:  6, total: 25, risk: true  },
  { id: 'lm009', name: 'Sanjay Verma',   rate: 74, attended: 18, total: 25, risk: false },
  { id: 'lm010', name: 'Nisha Agarwal',  rate: 65, attended: 16, total: 25, risk: false },
  { id: 'lm011', name: 'Rahul Bhatt',    rate: 88, attended: 22, total: 25, risk: false },
  { id: 'lm012', name: 'Pooja Desai',    rate: 80, attended: 20, total: 25, risk: false },
]

const MONTHLY_TREND = [
  { month: 'Jan', rate: 88 },
  { month: 'Feb', rate: 85 },
  { month: 'Mar', rate: 90 },
  { month: 'Apr', rate: 82 },
  { month: 'May', rate: 86 },
  { month: 'Jun', rate: 78 },
]

function rateColor(r) {
  if (r >= 80) return 'text-success'
  if (r >= 60) return 'text-warning'
  return 'text-danger'
}

function RateBar({ rate }) {
  const color = rate >= 80 ? '#2E7D32' : rate >= 60 ? '#C17900' : '#BF360C'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${rate}%`, background: color }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${rateColor(rate)}`}>{rate}%</span>
    </div>
  )
}

export default function LAAttendancePage() {
  const [filter, setFilter] = useState('All')

  const avgRate  = Math.round(MEMBERS.reduce((s, m) => s + m.rate, 0) / MEMBERS.length)
  const atRisk   = MEMBERS.filter(m => m.risk)
  const filtered = MEMBERS.filter(m => {
    if (filter === 'At Risk') return m.risk
    if (filter === 'Good')    return m.rate >= 80 && !m.risk
    return true
  })

  return (
    <div className="p-3 space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-primary">Attendance</h1>
        <p className="text-secondary text-sm mt-1">Andheri Chapter — attendance tracker</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Chapter Avg',    value: `${avgRate}%`,        color: avgRate >= 80 ? 'text-success' : 'text-warning' },
          { label: 'Total Members',  value: MEMBERS.length,       color: 'text-primary' },
          { label: 'At-Risk (< 60%)', value: atRisk.length,      color: 'text-danger'  },
          { label: 'Meetings Tracked', value: 25,                 color: 'text-navy'   },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-2xs text-secondary">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Chapter Attendance Rate — Last 6 Months</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MONTHLY_TREND} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} domain={[60, 100]} unit="%" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }} formatter={v => [`${v}%`, 'Attendance']} />
            <Bar dataKey="rate" fill="#028090" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* At-risk alert */}
      {atRisk.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-card border border-amber bg-amber/5">
          <AlertTriangle size={16} className="text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary">
              {atRisk.length} member{atRisk.length > 1 ? 's' : ''} below attendance threshold
            </p>
            <p className="text-2xs text-secondary mt-0.5">
              {atRisk.map(m => m.name).join(', ')} — consider sending a nudge or scheduling a 1:1 call.
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {['All', 'At Risk', 'Good'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-button border transition-colors ${
              filter === f ? 'bg-teal text-white border-teal' : 'bg-white text-secondary border-border hover:border-teal hover:text-teal'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Member attendance table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left">Member</th>
                <th className="th text-right">Attended</th>
                <th className="th text-left" style={{ minWidth: 160 }}>Rate</th>
                <th className="th text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xs font-bold text-navy">
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary">{m.name}</p>
                    </div>
                  </td>
                  <td className="td text-right text-sm text-secondary">{m.attended}/{m.total}</td>
                  <td className="td" style={{ minWidth: 160 }}>
                    <RateBar rate={m.rate} />
                  </td>
                  <td className="td">
                    {m.risk
                      ? <span className="badge badge-danger">At Risk</span>
                      : m.rate >= 80
                        ? <span className="badge badge-success">Good</span>
                        : <span className="badge badge-amber">Fair</span>
                    }
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
