import { useState } from 'react'
import { Users, TrendingUp, AlertTriangle, Award, ArrowRight, X } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const memberGrowth = [
  { month: 'Jan', members: 192 },
  { month: 'Feb', members: 198 },
  { month: 'Mar', members: 205 },
  { month: 'Apr', members: 212 },
  { month: 'May', members: 228 },
  { month: 'Jun', members: 240 },
]

const referralsByChapter = [
  { name: 'Andheri',    referrals: 48 },
  { name: 'Bandra',     referrals: 36 },
  { name: 'Borivali',   referrals: 22 },
  { name: 'Dadar',      referrals: 18 },
  { name: 'Powai',      referrals: 52 },
  { name: 'Thane',      referrals: 41 },
  { name: 'Navi Mum.',  referrals: 28 },
  { name: 'Vashi',      referrals: 35 },
]

const chapterCards = [
  { id: 'c1', name: 'Andheri Chapter',     zone: 'Zone Alpha', la: 'Hardik Patel',  members: 32, referrals: 48, meetings: 4, attendance: 92, trend: [30,38,42,45,46,48], health: 'green'  },
  { id: 'c2', name: 'Bandra Chapter',      zone: 'Zone Alpha', la: 'Sneha Kapoor',  members: 28, referrals: 36, meetings: 4, attendance: 88, trend: [25,28,30,32,35,36], health: 'green'  },
  { id: 'c3', name: 'Borivali Chapter',    zone: 'Zone Alpha', la: null,            members: 30, referrals: 22, meetings: 3, attendance: 71, trend: [18,19,20,21,20,22], health: 'amber'  },
  { id: 'c4', name: 'Dadar Chapter',       zone: 'Zone Alpha', la: null,            members: 30, referrals: 18, meetings: 2, attendance: 68, trend: [22,20,18,17,17,18], health: 'red'    },
  { id: 'c5', name: 'Powai Chapter',       zone: 'Zone Beta',  la: 'Firoz Shaikh', members: 31, referrals: 52, meetings: 4, attendance: 94, trend: [35,40,44,47,50,52], health: 'green'  },
  { id: 'c6', name: 'Thane Chapter',       zone: 'Zone Beta',  la: 'Nandini Menon',members: 29, referrals: 41, meetings: 4, attendance: 89, trend: [30,33,36,38,40,41], health: 'green'  },
  { id: 'c7', name: 'Navi Mumbai Chapter', zone: 'Zone Beta',  la: null,            members: 30, referrals: 28, meetings: 3, attendance: 76, trend: [22,24,25,26,27,28], health: 'amber'  },
  { id: 'c8', name: 'Vashi Chapter',       zone: 'Zone Beta',  la: null,            members: 30, referrals: 35, meetings: 3, attendance: 80, trend: [28,30,32,33,34,35], health: 'amber'  },
]

const HEALTH_COLOR = { green: '#2E7D32', amber: '#C17900', red: '#BF360C' }
const HEALTH_LABEL = { green: 'Healthy', amber: 'Needs Attention', red: 'At Risk' }

function Sparkline({ data }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-0.5 h-6">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-teal/40"
          style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
        />
      ))}
    </div>
  )
}

function ChapterModal({ chapter, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-modal w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-primary">{chapter.name}</h3>
            <p className="text-2xs text-secondary mt-0.5">{chapter.zone}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-button hover:bg-surface text-secondary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Members',           value: chapter.members },
              { label: 'Meetings / Month',  value: chapter.meetings },
              { label: 'Referrals',         value: chapter.referrals },
              { label: 'Attendance Rate',   value: `${chapter.attendance}%` },
            ].map(s => (
              <div key={s.label} className="bg-surface rounded-button p-3">
                <p className="text-2xs text-secondary">{s.label}</p>
                <p className="text-xl font-bold text-primary mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-secondary mb-2">Level Admin</p>
            {chapter.la ? (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-teal">
                    {chapter.la.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{chapter.la}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-2xs text-secondary">Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber" />
                <p className="text-sm text-warning font-medium">No Level Admin Assigned</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-secondary mb-2">Activity Trend (Last 6 Months)</p>
            <Sparkline data={chapter.trend} />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: HEALTH_COLOR[chapter.health] }} />
            <span className="text-sm font-semibold" style={{ color: HEALTH_COLOR[chapter.health] }}>
              {HEALTH_LABEL[chapter.health]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CSADashboard() {
  const [selectedChapter, setSelectedChapter] = useState(null)

  const stats = [
    { label: 'Total Members',         value: 240,          sub: '↑12 this month',    iconBg: 'bg-teal/10',    iconColor: 'text-teal',    icon: Users        },
    { label: 'Active Members',        value: 180,          sub: '75% of total',       iconBg: 'bg-success/10', iconColor: 'text-success', icon: Users        },
    { label: 'Total Referrals',       value: 312,          sub: 'this month',         iconBg: 'bg-amber/10',   iconColor: 'text-amber',   icon: TrendingUp   },
    { label: 'Closed Business Value', value: '₹18,40,000', sub: 'this month',         iconBg: 'bg-navy/10',    iconColor: 'text-navy',    icon: Award        },
    { label: 'At-Risk Members',       value: 8,            sub: 'needs attention',    iconBg: 'bg-danger/10',  iconColor: 'text-danger',  icon: AlertTriangle, atRisk: true },
  ]

  return (
    <div className="p-3 space-y-6">
      {/* Community Banner */}
      <div
        className="rounded-card px-6 py-5"
        style={{ background: 'linear-gradient(135deg, #0F2347 0%, #1B3A6B 100%)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">BNI Mumbai Metro</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className="badge text-2xs font-semibold"
                style={{ background: 'rgba(2,128,144,0.25)', color: '#03A0B0' }}
              >
                Community Super Admin
              </span>
              <span className="text-white/65 text-sm">240 Members · 8 Chapters · 2 Zones</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-2xs">Active Rate</p>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-white text-sm font-semibold">75%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={`stat-card ${s.atRisk ? 'border-2 border-amber' : ''}`}
          >
            <div className={`stat-icon ${s.iconBg}`}>
              <s.icon size={18} className={s.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary">{s.label}</p>
              <p className="text-[22px] font-bold text-primary mt-0.5">{s.value}</p>
              <p className="text-2xs text-secondary mt-0.5">{s.sub}</p>
              {s.atRisk && (
                <a
                  href="/csa/members?filter=at-risk"
                  className="inline-flex items-center gap-0.5 text-2xs text-amber font-semibold mt-1 hover:underline"
                >
                  View Now <ArrowRight size={10} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area — Member Growth */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Member Growth (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={memberGrowth}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#028090" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#028090" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} domain={[180, 250]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }} />
              <Area type="monotone" dataKey="members" stroke="#028090" strokeWidth={2} fill="url(#tealGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar — Referrals by Chapter */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Referrals by Chapter</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={referralsByChapter} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #D0DCF0' }} />
              <Bar dataKey="referrals" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Community Health */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-primary">Community Health — All Chapters</h2>
          <p className="text-2xs text-secondary">Click a chapter for full details</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {chapterCards.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapter(ch)}
              className="card p-4 text-left hover:shadow-modal transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-primary">{ch.name}</p>
                  <span className="badge badge-navy mt-1 text-2xs">{ch.zone}</span>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                  style={{ background: HEALTH_COLOR[ch.health] }}
                />
              </div>

              <div className="flex items-center gap-1.5 mb-2.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ch.la ? 'bg-success' : 'bg-amber'}`} />
                <p className="text-2xs text-secondary truncate">{ch.la ?? 'No Level Admin'}</p>
              </div>

              <div className="grid grid-cols-3 gap-1 mb-3 text-left">
                <div>
                  <p className="text-2xs text-secondary">Members</p>
                  <p className="text-xs font-bold text-primary">{ch.members}</p>
                </div>
                <div>
                  <p className="text-2xs text-secondary">Referrals</p>
                  <p className="text-xs font-bold text-primary">{ch.referrals}</p>
                </div>
                <div>
                  <p className="text-2xs text-secondary">Attend.</p>
                  <p className="text-xs font-bold text-primary">{ch.attendance}%</p>
                </div>
              </div>

              <Sparkline data={ch.trend} />
            </button>
          ))}
        </div>
      </div>

      {selectedChapter && (
        <ChapterModal chapter={selectedChapter} onClose={() => setSelectedChapter(null)} />
      )}
    </div>
  )
}
