import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Calendar, Users, Activity, Bell, ChevronRight, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const SCORE = 87

function CircleGauge({ score }) {
  const r = 48
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#028090" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 60 60)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-[11px] text-white/70 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Log Referral', to: '/member/referrals', bg: 'bg-teal/10',  color: 'text-teal'  },
  { icon: Calendar, label: 'My Meetings',  to: '/member/meetings',  bg: 'bg-navy/10',  color: 'text-navy'  },
  { icon: Users,    label: 'Directory',    to: '/member/directory', bg: 'bg-amber/10', color: 'text-amber' },
  { icon: Activity, label: 'My Stats',     to: '/member/my-stats',  bg: 'bg-teal/10',  color: 'text-teal'  },
]

const INITIAL_MEETINGS = [
  {
    id: 'm1',
    title: 'Weekly Networking Meeting',
    date: 'Sat, 21 Jun 2026',
    time: '7:30 AM – 9:00 AM',
    location: 'The Leela Hotel, Andheri',
    rsvp: false,
  },
  {
    id: 'm2',
    title: 'Visitor Introduction Day',
    date: 'Sun, 22 Jun 2026',
    time: '8:00 AM – 10:00 AM',
    location: 'Online — Zoom',
    rsvp: false,
  },
]

const ACTIVITY = [
  { text: 'Ravi Krishnan gave you a referral — Consulting',   time: '2h ago' },
  { text: 'Your referral to Priyanka Shah was Closed Won',     time: '1d ago' },
  { text: 'Sunita Patel invited you to connect',               time: '2d ago' },
  { text: 'Attendance marked for Weekly Meeting — 14 Jun',     time: '3d ago' },
]

export default function MemberDashboard() {
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS)

  const toggleRsvp = (id) => {
    setMeetings(prev => prev.map(m => {
      if (m.id !== id) return m
      const going = !m.rsvp
      toast.success(going ? "You're going! See you there." : 'RSVP cancelled', { style: { fontSize: 13 } })
      return { ...m, rsvp: going }
    }))
  }

  return (
    <div className="p-3">
      {/* Navy header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0D2444 100%)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white/60 text-sm">Good morning,</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Amit Desai 👋</h1>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center relative">
            <Bell size={18} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber" />
          </button>
        </div>

        {/* Engagement score card */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-5">
            <CircleGauge score={SCORE} />
            <div className="flex-1">
              <p className="text-white/60 text-xs mb-1">Engagement Score</p>
              <p className="text-white text-lg font-bold mb-3">Excellent</p>
              <div className="space-y-2">
                {[
                  { label: 'Attendance', val: 92 },
                  { label: 'Referrals',  val: 85 },
                  { label: 'Meetings',   val: 80 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
                      <span>{item.label}</span><span>{item.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <div className="h-1.5 rounded-full bg-teal" style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Quick actions */}
        {/* <div>
          <p className="text-xs font-semibold text-secondary mb-3 uppercase tracking-wide">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="flex items-center gap-3 p-3.5 rounded-[14px] bg-white border border-border hover:border-teal/40 transition-colors text-left active:scale-95"
              >
                <div className={`w-9 h-9 rounded-full ${a.bg} flex items-center justify-center flex-shrink-0`}>
                  <a.icon size={16} className={a.color} />
                </div>
                <span className="text-sm font-medium text-primary leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* Upcoming meetings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Upcoming Meetings</p>
            <button onClick={() => navigate('/member/meetings')} className="text-xs text-teal font-medium flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {meetings.map(m => (
              <div key={m.id} className="rounded-[14px] border border-border bg-white p-4">
                <p className="text-sm font-semibold text-primary">{m.title}</p>
                <div className="mt-2 space-y-1 text-xs text-secondary">
                  <p className="flex items-center gap-1.5"><Calendar size={11} /> {m.date} · {m.time}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={11} /> {m.location}</p>
                </div>
                <div className="mt-3">
                  {m.rsvp ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-success flex items-center gap-1">✓ You're going</span>
                      <button onClick={() => toggleRsvp(m.id)} className="text-xs text-secondary underline">Cancel RSVP</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleRsvp(m.id)}
                      className="w-full py-2 rounded-[10px] text-sm font-semibold text-white transition-colors active:scale-95"
                      style={{ background: '#028090' }}
                    >
                      RSVP Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <p className="text-xs font-semibold text-secondary mb-3 uppercase tracking-wide">Recent Activity</p>
          <div className="rounded-[14px] border border-border bg-white overflow-hidden">
            {ACTIVITY.map((a, i) => (
              <div key={i} className={`px-4 py-3 flex items-start gap-3 ${i < ACTIVITY.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary leading-snug">{a.text}</p>
                  <p className="text-[10px] text-secondary mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
