import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, TrendingUp, Calendar, UserCheck, AlertTriangle,
  ArrowRight, MapPin, Clock, CheckCircle, UserPlus,
  Star, ClipboardCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

const UPCOMING = [
  { id: 'lmt001', title: 'Weekly Networking Meeting', day: 'Friday',   date: '14 Jun 2026', time: '7:00 AM',  venue: 'Taj Lands End, Mumbai',  rsvps: 34, invited: 47 },
  { id: 'lmt002', title: 'Monthly Strategy Session',  day: 'Tuesday',  date: '18 Jun 2026', time: '6:00 PM',  venue: 'Online — Zoom',          rsvps: 28, invited: 47 },
  { id: 'lmt003', title: 'Visitor Introduction Day',  day: 'Saturday', date: '22 Jun 2026', time: '10:00 AM', venue: 'Holiday Inn, Andheri',   rsvps: 15, invited: 47 },
]

const ACTIVITY = [
  { id: 1, icon: UserPlus,      text: 'Vivek Kapoor registered as visitor',                     time: '2m ago',   color: 'text-teal'    },
  { id: 2, icon: TrendingUp,    text: 'Amit Desai logged referral to Priyanka Shah',             time: '1h ago',   color: 'text-amber'   },
  { id: 3, icon: Calendar,      text: 'Rahul Bhatt RSVP\'d for Weekly Networking',               time: '2h ago',   color: 'text-navy'    },
  { id: 4, icon: AlertTriangle, text: 'Manish Gupta missed last 2 meetings',                     time: '1 day ago', color: 'text-danger'  },
  { id: 5, icon: Users,         text: 'Pooja Desai joined the community',                        time: '2 days ago', color: 'text-success' },
  { id: 6, icon: CheckCircle,   text: 'Referral closed: Rahul Bhatt → Sanjay Verma ₹3.5L',     time: '3 days ago', color: 'text-success' },
  { id: 7, icon: ClipboardCheck,text: 'Attendance marked for Apr 8 meeting (30/32)',             time: '3 days ago', color: 'text-teal'    },
  { id: 8, icon: AlertTriangle, text: 'Kavita Joshi\'s engagement score dropped to 15',          time: '4 days ago', color: 'text-danger'  },
]

const AT_RISK = [
  { id: 'lm005', name: 'Manish Gupta',  business: 'MG Architects',   score: 23, lastActive: '18 days ago', phone: '+91 98765 40005' },
  { id: 'lm008', name: 'Kavita Joshi',  business: 'Joshi Academy',   score: 15, lastActive: '25 days ago', phone: '+91 98765 40008' },
  { id: 'lm010', name: 'Nisha Agarwal', business: 'Agarwal Catering', score: 55, lastActive: '12 days ago', phone: '+91 98765 40010' },
]

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function LADashboard() {
  const navigate = useNavigate()
  const [nudgeSent, setNudgeSent] = useState({})

  const stats = [
    { label: 'My Members',         value: 47,    sub: '↑3 this month',    iconBg: 'bg-teal/10',    iconColor: 'text-teal',    icon: Users        },
    { label: 'Referrals This Month', value: 38,  sub: 'from this chapter', iconBg: 'bg-amber/10',   iconColor: 'text-amber',   icon: TrendingUp   },
    { label: 'Meetings This Month', value: 4,    sub: 'completed',         iconBg: 'bg-navy/10',    iconColor: 'text-navy',    icon: Calendar     },
    { label: 'Attendance Rate',     value: '78%', sub: 'chapter average',  iconBg: 'bg-success/10', iconColor: 'text-success', icon: UserCheck    },
    { label: 'At-Risk Members',     value: 3,    sub: 'needs attention',   iconBg: 'bg-danger/10',  iconColor: 'text-danger',  icon: AlertTriangle, atRisk: true },
  ]

  const sendNudge = (member) => {
    setNudgeSent(prev => ({ ...prev, [member.id]: true }))
    toast.success(`Nudge sent to ${member.name}`, { style: { fontSize: 13 } })
  }

  return (
    <div className="p-3 space-y-6">
      {/* Node banner */}
      <div>
        <h1 className="text-[28px] font-bold text-primary">Chapter Dashboard</h1>
        <p className="text-secondary text-sm mt-1">Your Node — 47 Members · North Zone</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.atRisk ? 'border-2 border-amber' : ''}`}>
            <div className={`stat-icon ${s.iconBg}`}>
              <s.icon size={18} className={s.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary">{s.label}</p>
              <p className="text-[22px] font-bold text-primary mt-0.5">{s.value}</p>
              <p className="text-2xs text-secondary mt-0.5">{s.sub}</p>
              {s.atRisk && (
                <button
                  onClick={() => navigate('/la/members?filter=at-risk')}
                  className="inline-flex items-center gap-0.5 text-2xs text-amber font-semibold mt-1 hover:underline"
                >
                  View <ArrowRight size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">Upcoming Meetings</h2>
            <button
              onClick={() => navigate('/la/meetings')}
              className="text-2xs text-teal font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {UPCOMING.map(m => (
              <div key={m.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-button bg-navy/5 flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary">{m.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-2xs text-secondary">
                      <Clock size={10} />
                      <span>{m.day}, {m.date} · {m.time}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-2xs text-secondary">
                      <MapPin size={10} />
                      <span className="truncate">{m.venue}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-2xs text-secondary">{m.rsvps} RSVPs · {m.invited} invited</span>
                      <button
                        onClick={() => navigate('/la/meetings')}
                        className="btn-primary btn-sm text-xs"
                        style={{ height: 28, padding: '0 10px', fontSize: 11 }}
                      >
                        Mark Attendance
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-primary">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border/60">
            {ACTIVITY.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-button bg-surface flex items-center justify-center flex-shrink-0 mt-0.5">
                  <a.icon size={13} className={a.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary leading-snug">{a.text}</p>
                  <p className="text-2xs text-secondary mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Members */}
      <div className="card overflow-hidden" style={{ borderColor: '#E6A817', borderWidth: 1 }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2" style={{ background: 'rgba(230,168,23,0.05)' }}>
          <AlertTriangle size={16} className="text-amber flex-shrink-0" />
          <h2 className="text-base font-semibold text-primary">At-Risk Members</h2>
          <span className="ml-auto badge badge-amber">3 members</span>
        </div>
        <div className="divide-y divide-border">
          {AT_RISK.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-danger">{initials(m.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary">{m.name}</p>
                <p className="text-2xs text-secondary">{m.business}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xs text-secondary">Last active: {m.lastActive}</span>
                  <span className="text-2xs font-semibold" style={{ color: m.score < 30 ? '#BF360C' : '#C17900' }}>
                    Score: {m.score}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => sendNudge(m)}
                  disabled={nudgeSent[m.id]}
                  className={`btn-sm btn text-xs ${nudgeSent[m.id] ? 'btn-ghost opacity-60' : 'btn-outline'}`}
                  style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                >
                  {nudgeSent[m.id] ? '✓ Sent' : 'Send Nudge'}
                </button>
                <a
                  href={`tel:${m.phone}`}
                  className="btn-ghost btn-sm flex items-center gap-1"
                  style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                >
                  Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
