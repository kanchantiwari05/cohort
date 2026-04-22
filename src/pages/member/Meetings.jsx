import { useState } from 'react'
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_MEETINGS = {
  upcoming: [
    {
      id: 'mu1',
      title: 'Weekly Networking Meeting',
      date: 'Sat, 21 Jun 2026',
      time: '7:30 AM – 9:00 AM',
      location: 'The Leela Hotel, Andheri',
      type: 'In-Person',
      attendees: 38,
      rsvp: false,
    },
    {
      id: 'mu2',
      title: 'Visitor Introduction Day',
      date: 'Sun, 22 Jun 2026',
      time: '8:00 AM – 10:00 AM',
      location: 'Online — Zoom',
      type: 'Online',
      attendees: 22,
      rsvp: false,
    },
    {
      id: 'mu3',
      title: 'Monthly Chapter Review',
      date: 'Sat, 28 Jun 2026',
      time: '7:00 AM – 8:30 AM',
      location: 'Novotel Mumbai',
      type: 'In-Person',
      attendees: 45,
      rsvp: true,
    },
  ],
  past: [
    {
      id: 'mp1',
      title: 'Weekly Networking Meeting',
      date: 'Sat, 14 Jun 2026',
      time: '7:30 AM – 9:00 AM',
      location: 'The Leela Hotel, Andheri',
      type: 'In-Person',
      attendees: 41,
      attended: true,
    },
    {
      id: 'mp2',
      title: 'Weekly Networking Meeting',
      date: 'Sat, 7 Jun 2026',
      time: '7:30 AM – 9:00 AM',
      location: 'The Leela Hotel, Andheri',
      type: 'In-Person',
      attendees: 39,
      attended: false,
    },
    {
      id: 'mp3',
      title: 'Business Development Workshop',
      date: 'Mon, 2 Jun 2026',
      time: '6:00 PM – 8:00 PM',
      location: 'Online — Google Meet',
      type: 'Online',
      attendees: 18,
      attended: true,
    },
    {
      id: 'mp4',
      title: 'Weekly Networking Meeting',
      date: 'Sat, 31 May 2026',
      time: '7:30 AM – 9:00 AM',
      location: 'The Leela Hotel, Andheri',
      type: 'In-Person',
      attendees: 44,
      attended: true,
    },
  ],
}

function TypeBadge({ type }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
      type === 'Online' ? 'bg-teal/10 text-teal' : 'bg-navy/10 text-navy'
    }`}>{type}</span>
  )
}

export default function MemberMeetings() {
  const [tab, setTab] = useState('upcoming')
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS)

  const toggleRsvp = (id) => {
    setMeetings(prev => ({
      ...prev,
      upcoming: prev.upcoming.map(m => {
        if (m.id !== id) return m
        const going = !m.rsvp
        toast.success(going ? "You're going! See you there." : 'RSVP cancelled', { style: { fontSize: 13 } })
        return { ...m, rsvp: going }
      }),
    }))
  }

  // Attendance streak
  const pastList = meetings.past
  const attendedCount = pastList.filter(m => m.attended).length
  const streakPct = Math.round((attendedCount / pastList.length) * 100)

  return (
    <div className="p-3">
      {/* Header */}
      <div className="px-4 pt-12 pb-5" style={{ background: '#1B3A6B' }}>
        <h1 className="text-xl font-bold text-white mb-4">My Meetings</h1>
        {/* Attendance summary */}
        <div className="rounded-[14px] p-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/70 text-xs">Attendance Rate (Last 4)</p>
            <p className="text-white font-bold text-sm">{streakPct}%</p>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-1.5 rounded-full bg-teal" style={{ width: `${streakPct}%` }} />
          </div>
          <div className="flex gap-2 mt-3">
            {pastList.map(m => (
              <div
                key={m.id}
                className="flex-1 h-6 rounded-md flex items-center justify-center"
                style={{ background: m.attended ? 'rgba(46,125,50,0.35)' : 'rgba(191,54,12,0.35)' }}
                title={m.date}
              >
                {m.attended
                  ? <CheckCircle size={12} className="text-green-300" />
                  : <span className="text-red-300 text-[10px] font-bold">A</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white">
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past',     label: 'Past'     },
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

      {/* Meeting cards */}
      <div className="px-4 py-4 space-y-3">
        {tab === 'upcoming' && meetings.upcoming.map(m => (
          <div key={m.id} className="rounded-[14px] border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-primary leading-snug flex-1">{m.title}</p>
              <TypeBadge type={m.type} />
            </div>
            <div className="space-y-1 text-xs text-secondary mb-3">
              <p className="flex items-center gap-1.5"><Calendar size={11} /> {m.date}</p>
              <p className="flex items-center gap-1.5"><Clock size={11} /> {m.time}</p>
              <p className="flex items-center gap-1.5"><MapPin size={11} /> {m.location}</p>
              <p className="flex items-center gap-1.5"><Users size={11} /> {m.attendees} attending</p>
            </div>
            {m.rsvp ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-success flex items-center gap-1">
                  <CheckCircle size={13} /> You're going
                </span>
                <button
                  onClick={() => toggleRsvp(m.id)}
                  className="text-xs text-secondary underline"
                >
                  Cancel RSVP
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleRsvp(m.id)}
                className="w-full py-2.5 rounded-[10px] text-sm font-semibold text-white active:scale-95 transition-transform"
                style={{ background: '#028090' }}
              >
                RSVP Now
              </button>
            )}
          </div>
        ))}

        {tab === 'past' && meetings.past.map(m => (
          <div key={m.id} className="rounded-[14px] border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-primary leading-snug flex-1">{m.title}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                m.attended ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
                {m.attended ? 'Present' : 'Absent'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-secondary">
              <p className="flex items-center gap-1.5"><Calendar size={11} /> {m.date}</p>
              <p className="flex items-center gap-1.5"><MapPin size={11} /> {m.location}</p>
              <p className="flex items-center gap-1.5"><Users size={11} /> {m.attendees} attended</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
