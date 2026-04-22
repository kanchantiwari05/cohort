import { BarChart3, TrendingUp, Users, UserCheck, Star, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const MONTHLY = [
  { month: 'Jan', referrals: 28, meetings: 4, newMembers: 1 },
  { month: 'Feb', referrals: 32, meetings: 4, newMembers: 2 },
  { month: 'Mar', referrals: 35, meetings: 4, newMembers: 1 },
  { month: 'Apr', referrals: 30, meetings: 4, newMembers: 0 },
  { month: 'May', referrals: 41, meetings: 5, newMembers: 3 },
  { month: 'Jun', referrals: 38, meetings: 4, newMembers: 2 },
]

const TOP_REFERRERS = [
  { name: 'Sunita Patel',   referrals: 19 },
  { name: 'Arjun Mehta',    referrals: 15 },
  { name: 'Amit Desai',     referrals: 14 },
  { name: 'Deepa Nair',     referrals: 11 },
  { name: 'Rahul Bhatt',    referrals: 13 },
  { name: 'Pooja Desai',    referrals: 9  },
  { name: 'Priyanka Shah',  referrals: 8  },
  { name: 'Ravi Krishnan',  referrals: 6  },
]

const maxRef = Math.max(...TOP_REFERRERS.map(m => m.referrals))

export default function LAReportsPage() {
  return (
    <div className="p-3 space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-primary">Reports</h1>
        <p className="text-secondary text-sm mt-1">Andheri Chapter — performance summary</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Members',    value: 47,    icon: Users,      color: 'text-teal'    },
          { label: 'Active Members',   value: 43,    icon: UserCheck,  color: 'text-success' },
          { label: 'Referrals (YTD)',  value: 204,   icon: TrendingUp, color: 'text-amber'   },
          { label: 'Meetings (YTD)',   value: 25,    icon: Calendar,   color: 'text-navy'    },
          { label: 'Avg Attendance',   value: '82%', icon: UserCheck,  color: 'text-success' },
          { label: '₹ Business (YTD)', value: '₹21.4L', icon: Star,   color: 'text-amber'   },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <k.icon size={16} className={`${k.color} mb-2`} />
            <p className="text-xl font-bold text-primary">{k.value}</p>
            <p className="text-2xs text-secondary mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Referrals */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Monthly Referrals</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }} />
              <Bar dataKey="referrals" fill="#028090" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Meetings + New Members */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Meetings & New Members</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }} />
              <Bar dataKey="meetings"   name="Meetings"    fill="#1B3A6B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="newMembers" name="New Members" fill="#028090" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top referrers */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Top Referrers — This Year</h2>
        <div className="space-y-2.5">
          {TOP_REFERRERS.sort((a, b) => b.referrals - a.referrals).map((m, i) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="text-2xs text-secondary w-4 text-right flex-shrink-0">{i + 1}</span>
              <p className="text-xs font-medium text-primary w-32 flex-shrink-0">{m.name}</p>
              <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-teal" style={{ width: `${(m.referrals / maxRef) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-primary w-6 text-right flex-shrink-0">{m.referrals}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-primary">Monthly Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left">Month</th>
                <th className="th text-right">Meetings</th>
                <th className="th text-right">Avg Attendance</th>
                <th className="th text-right">At-Risk Flagged</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY.map(row => (
                <tr key={row.month} className="tr">
                  <td className="td font-medium">{row.month} 2026</td>
                  <td className="td text-right text-secondary">{row.meetings}</td>
                  <td className="td text-right">
                    <span className="text-success font-semibold">
                      {75 + Math.floor(Math.random() * 15)}%
                    </span>
                  </td>
                  <td className="td text-right">
                    <span className="badge badge-amber">{Math.floor(Math.random() * 4)}</span>
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
