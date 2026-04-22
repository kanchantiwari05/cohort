import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom']

const KPIS = [
  { label: 'Referrals Given',        value: '312',     change: '+18%', up: true  },
  { label: 'Referrals Received',     value: '289',     change: '+14%', up: true  },
  { label: 'Closed Won',             value: '127',     change: '+9%',  up: true  },
  { label: 'Closed Business Value',  value: '₹18.4L',  change: '+22%', up: true  },
  { label: 'Meetings Held',          value: '32',      change: '-3%',  up: false },
  { label: 'Attendance Rate',        value: '82%',     change: '+2%',  up: true  },
]

const REFERRAL_TREND = [
  { month: 'Jan', given: 48,  received: 42 },
  { month: 'Feb', given: 52,  received: 47 },
  { month: 'Mar', given: 61,  received: 55 },
  { month: 'Apr', given: 58,  received: 53 },
  { month: 'May', given: 74,  received: 69 },
  { month: 'Jun', given: 89,  received: 82 },
]

const BIZ_BY_CHAPTER = [
  { name: 'Andheri',   value: 3.8 },
  { name: 'Bandra',    value: 2.9 },
  { name: 'Borivali',  value: 1.6 },
  { name: 'Dadar',     value: 1.2 },
  { name: 'Powai',     value: 4.2 },
  { name: 'Thane',     value: 3.1 },
  { name: 'Navi Mum.', value: 2.2 },
  { name: 'Vashi',     value: 2.6 },
]

const TOP_MEMBERS = [
  { name: 'Arjun Malhotra',  referrals: 25 },
  { name: 'Deepa Krishnan',  referrals: 22 },
  { name: 'Amit Shah',       referrals: 21 },
  { name: 'Vikram Desai',    referrals: 18 },
  { name: 'Rajan Verma',     referrals: 16 },
  { name: 'Rajesh Mehta',    referrals: 14 },
  { name: 'Nikhil Kulkarni', referrals: 12 },
  { name: 'Suresh Rao',      referrals: 11 },
  { name: 'Priya Nair',      referrals: 9  },
  { name: 'Rekha Bose',      referrals: 6  },
]

const TABLE_DATA = [
  { chapter: 'Andheri Chapter',     members: 32, referrals: 48, bizValue: 3.8, meetings: 4, attendance: 92, score: 91 },
  { chapter: 'Bandra Chapter',      members: 28, referrals: 36, bizValue: 2.9, meetings: 4, attendance: 88, score: 84 },
  { chapter: 'Borivali Chapter',    members: 30, referrals: 22, bizValue: 1.6, meetings: 3, attendance: 71, score: 62 },
  { chapter: 'Dadar Chapter',       members: 30, referrals: 18, bizValue: 1.2, meetings: 2, attendance: 68, score: 54 },
  { chapter: 'Powai Chapter',       members: 31, referrals: 52, bizValue: 4.2, meetings: 4, attendance: 94, score: 95 },
  { chapter: 'Thane Chapter',       members: 29, referrals: 41, bizValue: 3.1, meetings: 4, attendance: 89, score: 88 },
  { chapter: 'Navi Mumbai Chapter', members: 30, referrals: 28, bizValue: 2.2, meetings: 3, attendance: 76, score: 71 },
  { chapter: 'Vashi Chapter',       members: 30, referrals: 35, bizValue: 2.6, meetings: 3, attendance: 80, score: 76 },
]

const COLUMNS = [
  { key: 'chapter',    label: 'Chapter'     },
  { key: 'members',    label: 'Members'     },
  { key: 'referrals',  label: 'Referrals'   },
  { key: 'bizValue',   label: '₹ Business'  },
  { key: 'meetings',   label: 'Meetings'    },
  { key: 'attendance', label: 'Attend. %'   },
  { key: 'score',      label: 'Score'       },
]

function ScoreBadge({ score }) {
  if (score >= 85) return <span className="badge badge-success">{score}</span>
  if (score >= 70) return <span className="badge badge-teal">{score}</span>
  if (score >= 55) return <span className="badge badge-amber">{score}</span>
  return <span className="badge badge-danger">{score}</span>
}

const maxRef = Math.max(...TOP_MEMBERS.map(m => m.referrals))

export default function CSAAnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [sortKey, setSortKey]     = useState('score')
  const [sortDir, setSortDir]     = useState('desc')

  const handleSort = (key) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...TABLE_DATA].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    return sortDir === 'asc'
      ? (av > bv ? 1 : av < bv ? -1 : 0)
      : (av < bv ? 1 : av > bv ? -1 : 0)
  })

  const totals = {
    members:   TABLE_DATA.reduce((s, r) => s + r.members, 0),
    referrals: TABLE_DATA.reduce((s, r) => s + r.referrals, 0),
    bizValue:  TABLE_DATA.reduce((s, r) => s + r.bizValue, 0).toFixed(1),
    meetings:  TABLE_DATA.reduce((s, r) => s + r.meetings, 0),
    attendance: Math.round(TABLE_DATA.reduce((s, r) => s + r.attendance, 0) / TABLE_DATA.length),
  }

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Analytics</h1>
          <p className="text-secondary text-sm mt-1">Community performance — BNI Mumbai Metro</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DATE_RANGES.map(d => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-button border transition-colors ${
                dateRange === d
                  ? 'bg-teal text-white border-teal'
                  : 'bg-white text-secondary border-border hover:border-teal hover:text-teal'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map(k => (
          <div key={k.label} className="card p-4">
            <p className="text-2xs text-secondary leading-snug">{k.label}</p>
            <p className="text-xl font-bold text-primary mt-1.5">{k.value}</p>
            <p className={`text-2xs font-semibold mt-1 ${k.up ? 'text-success' : 'text-danger'}`}>
              {k.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrals Trend */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Referrals Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REFERRAL_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="given"    name="Given"    stroke="#028090" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="received" name="Received" stroke="#1B3A6B" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Business Value by Chapter */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Business Value by Chapter (₹ Lakhs)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BIZ_BY_CHAPTER} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} unit="L" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }}
                formatter={v => [`₹${v}L`, 'Value']}
              />
              <Bar dataKey="value" fill="#028090" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Members */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Top 10 Members by Referrals</h2>
        <div className="space-y-2.5">
          {TOP_MEMBERS.map((m, i) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="text-2xs text-secondary w-4 text-right flex-shrink-0">{i + 1}</span>
              <p className="text-xs font-medium text-primary w-36 flex-shrink-0 truncate">{m.name}</p>
              <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-teal transition-all duration-500"
                  style={{ width: `${(m.referrals / maxRef) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary w-6 text-right flex-shrink-0">{m.referrals}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Comparison Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-primary">Chapter Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-2xs font-semibold text-secondary uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp size={12} className="text-teal" />
                          : <ChevronDown size={12} className="text-teal" />
                        : <ChevronDown size={12} className="opacity-25" />
                      }
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map(row => (
                <tr key={row.chapter} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary whitespace-nowrap">{row.chapter}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{row.members}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{row.referrals}</td>
                  <td className="px-4 py-3 text-sm text-secondary">₹{row.bizValue}L</td>
                  <td className="px-4 py-3 text-sm text-secondary">{row.meetings}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{row.attendance}%</td>
                  <td className="px-4 py-3"><ScoreBadge score={row.score} /></td>
                </tr>
              ))}
              <tr className="bg-navy/[0.03] border-t-2 border-border">
                <td className="px-4 py-3 text-sm font-bold text-primary">Totals</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{totals.members}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{totals.referrals}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">₹{totals.bizValue}L</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{totals.meetings}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{totals.attendance}%</td>
                <td className="px-4 py-3 text-sm text-secondary">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
