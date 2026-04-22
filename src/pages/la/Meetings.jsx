import { useState } from 'react'
import { Calendar, MapPin, Clock, Users, Edit2, Eye, Plus, X, Check, ArrowLeft, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const MEMBER_NAMES = [
  'Amit Desai','Priyanka Shah','Ravi Krishnan','Sunita Patel','Deepa Nair',
  'Arjun Mehta','Sanjay Verma','Nisha Agarwal','Rahul Bhatt','Pooja Desai',
  'Manish Gupta','Kavita Joshi',
]

const ATT_STATUS = {
  present: { label: 'Present', color: 'bg-success text-white',  short: 'P' },
  absent:  { label: 'Absent',  color: 'bg-danger/10 text-danger', short: 'A' },
  late:    { label: 'Late',    color: 'bg-amber/10 text-amber-dark', short: 'L' },
  excused: { label: 'Excused', color: 'bg-navy/10 text-navy',  short: 'E' },
}

const INITIAL_MEETINGS = [
  {
    id: 'lmt001', tab: 'upcoming',
    title: 'Weekly Networking Meeting',
    date: '2026-06-14', day: 'Friday',   dateLabel: '14 Jun 2026',
    startTime: '7:00 AM', endTime: '9:00 AM',
    venue: 'Taj Lands End, Mumbai', type: 'Regular', online: false,
    rsvps: 34, invited: 47, capacity: 50,
  },
  {
    id: 'lmt002', tab: 'upcoming',
    title: 'Monthly Strategy Session',
    date: '2026-06-18', day: 'Tuesday',  dateLabel: '18 Jun 2026',
    startTime: '6:00 PM', endTime: '8:00 PM',
    venue: 'Online — Zoom', type: 'Strategy', online: true,
    rsvps: 28, invited: 47, capacity: 40,
  },
  {
    id: 'lmt003', tab: 'upcoming',
    title: 'Visitor Introduction Day',
    date: '2026-06-22', day: 'Saturday', dateLabel: '22 Jun 2026',
    startTime: '10:00 AM', endTime: '12:00 PM',
    venue: 'Holiday Inn, Andheri', type: 'Visitor', online: false,
    rsvps: 15, invited: 47, capacity: 30,
  },
  {
    id: 'lmt004', tab: 'past',
    title: 'Weekly Chapter Meeting',
    date: '2026-04-15', day: 'Tuesday', dateLabel: '15 Apr 2026',
    startTime: '7:00 AM', endTime: '9:00 AM',
    venue: 'Hotel Kohinoor, Andheri', type: 'Regular', online: false,
    rsvps: 30, invited: 47, capacity: 50, attended: 28,
  },
  {
    id: 'lmt005', tab: 'past',
    title: 'Weekly Chapter Meeting',
    date: '2026-04-08', day: 'Tuesday', dateLabel: '8 Apr 2026',
    startTime: '7:00 AM', endTime: '9:00 AM',
    venue: 'Hotel Kohinoor, Andheri', type: 'Regular', online: false,
    rsvps: 32, invited: 47, capacity: 50, attended: 30,
  },
]

const TYPE_BADGE = { Regular: 'badge-navy', Strategy: 'badge-teal', Visitor: 'badge-amber' }

const EMPTY_FORM = {
  title: '', date: '', startTime: '', endTime: '',
  location: 'physical', address: '', meetingLink: '',
  capacity: '', rsvpDeadline: '', meetingType: 'Regular',
  mode: 'RSVP Only', recurring: 'None', description: '',
}

function initials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }

// ── Attendance View ──────────────────────────────────────────────────────────
function AttendanceView({ meeting, onBack }) {
  const [attendance, setAttendance] = useState(
    Object.fromEntries(MEMBER_NAMES.map(n => [n, 'absent']))
  )
  const [walkInSearch, setWalkInSearch] = useState('')
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [saved, setSaved] = useState(false)

  const markAll = (status) => {
    setAttendance(Object.fromEntries(MEMBER_NAMES.map(n => [n, status])))
  }

  const toggleStatus = (name, status) => {
    setAttendance(prev => ({ ...prev, [name]: status }))
  }

  const saveAttendance = () => {
    setSaved(true)
    const present = Object.values(attendance).filter(s => s === 'present').length
    toast.success(`Attendance saved — ${present}/${MEMBER_NAMES.length} present`, { style: { fontSize: 13 } })
    setTimeout(onBack, 1200)
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-button hover:bg-surface text-secondary transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[22px] font-bold text-primary">Mark Attendance</h1>
          <p className="text-secondary text-sm mt-0.5">{meeting.title} · {meeting.dateLabel}</p>
        </div>
      </div>

      {/* Meeting details strip */}
      <div className="card p-4 flex flex-wrap gap-4 text-sm text-secondary">
        <span className="flex items-center gap-1.5"><Clock size={13} /> {meeting.startTime} – {meeting.endTime}</span>
        <span className="flex items-center gap-1.5"><MapPin size={13} /> {meeting.venue}</span>
        <span className="flex items-center gap-1.5"><Users size={13} /> {meeting.rsvps} RSVPs invited</span>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-primary">Marked: {presentCount} present of {MEMBER_NAMES.length}</p>
          <span className="badge badge-teal">{Math.round(presentCount / MEMBER_NAMES.length * 100)}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-2 bg-teal rounded-full transition-all" style={{ width: `${presentCount / MEMBER_NAMES.length * 100}%` }} />
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => markAll('present')} className="btn-outline btn-sm">✓ Mark All Present</button>
        <button onClick={() => markAll('absent')}  className="btn-ghost btn-sm">✗ Mark All Absent</button>
        <button onClick={() => setShowWalkIn(true)} className="btn-ghost btn-sm ml-auto flex items-center gap-1.5">
          <Plus size={13} /> Add Walk-in
        </button>
      </div>

      {/* Member list */}
      <div className="card overflow-hidden divide-y divide-border">
        {MEMBER_NAMES.map(name => {
          const status = attendance[name]
          return (
            <div key={name} className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xs font-bold text-navy">{initials(name)}</span>
              </div>
              <p className="text-sm font-medium text-primary flex-1">{name}</p>
              <div className="flex gap-1">
                {Object.entries(ATT_STATUS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => toggleStatus(name, key)}
                    className={`w-8 h-8 rounded-button text-xs font-bold transition-all ${
                      status === key ? cfg.color : 'bg-surface text-secondary hover:bg-border'
                    }`}
                    title={cfg.label}
                  >
                    {cfg.short}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Walk-in search */}
      {showWalkIn && (
        <div className="card p-4 space-y-3 border-2 border-teal/30">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Add Walk-in Member</p>
            <button onClick={() => setShowWalkIn(false)} className="p-1 text-secondary hover:text-primary">
              <X size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search member name..."
              value={walkInSearch}
              onChange={e => setWalkInSearch(e.target.value)}
              className="input pl-9 text-sm"
              style={{ height: 40 }}
            />
          </div>
          <p className="text-2xs text-secondary">Walk-in attendance will be added to the records.</p>
        </div>
      )}

      {/* Sticky save */}
      <div className="sticky bottom-0 bg-surface border-t border-border pt-4 pb-2">
        <button onClick={saveAttendance} disabled={saved} className="btn-primary w-full">
          {saved ? '✓ Saved!' : 'Save Attendance'}
        </button>
      </div>
    </div>
  )
}

// ── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({ meeting, onMarkAttendance }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-button bg-navy/5 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-navy" />
          </div>
          <div>
            <p className="text-base font-semibold text-primary">{meeting.title}</p>
            <span className={`badge ${TYPE_BADGE[meeting.type] ?? 'badge-gray'} mt-1`}>{meeting.type}</span>
          </div>
        </div>
        {meeting.attended !== undefined && (
          <span className="badge badge-success whitespace-nowrap">{meeting.attended}/{meeting.invited} attended</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-2xs text-secondary mb-4">
        <span className="flex items-center gap-1.5">
          <Clock size={11} />
          {meeting.day}, {meeting.dateLabel} · {meeting.startTime}–{meeting.endTime}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={11} />
          <span className="truncate">{meeting.venue}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={11} />
          {meeting.rsvps} RSVPs · {meeting.invited} invited · Cap: {meeting.capacity}
        </span>
      </div>

      {meeting.tab === 'upcoming' && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
          <button onClick={() => onMarkAttendance(meeting)} className="btn-primary btn-sm">
            Mark Attendance
          </button>
          <button className="btn-ghost btn-sm flex items-center gap-1.5">
            <Edit2 size={12} /> Edit
          </button>
          <button className="btn-ghost btn-sm flex items-center gap-1.5">
            <Eye size={12} /> View RSVPs
          </button>
        </div>
      )}
      {meeting.tab === 'past' && (
        <div className="flex gap-2 pt-3 border-t border-border">
          <button className="btn-ghost btn-sm flex items-center gap-1.5">
            <Eye size={12} /> View Report
          </button>
        </div>
      )}
    </div>
  )
}

// ── Create Meeting Modal ─────────────────────────────────────────────────────
function CreateMeetingModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key, val) => { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.title.trim())     e.title     = 'Required'
    if (!form.date)             e.date      = 'Required'
    if (!form.startTime)        e.startTime = 'Required'
    if (!form.endTime)          e.endTime   = 'Required'
    if (!form.capacity)         e.capacity  = 'Required'
    return e
  }

  const submit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Meeting created successfully', { style: { fontSize: 13 } })
      onClose()
    }, 700)
  }

  const inp = (key, label, required, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-primary mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        className={`input ${errors[key] ? 'input-error' : ''}`}
      />
      {errors[key] && <p className="text-2xs text-danger mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="Create Meeting" maxWidth={600}>
      <div className="p-6 space-y-4">
        {inp('title', 'Meeting Title', true)}

        <div className="grid grid-cols-3 gap-3">
          {inp('date',      'Date',       true, 'date')}
          {inp('startTime', 'Start Time', true, 'time')}
          {inp('endTime',   'End Time',   true, 'time')}
        </div>

        {/* Location toggle */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-2">Location</label>
          <div className="flex gap-2 mb-2">
            {['physical', 'online'].map(l => (
              <button
                key={l}
                onClick={() => set('location', l)}
                className={`px-4 py-1.5 text-xs font-medium rounded-button border capitalize transition-colors ${
                  form.location === l ? 'bg-teal text-white border-teal' : 'bg-white text-secondary border-border'
                }`}
              >
                {l === 'physical' ? 'Physical' : 'Online'}
              </button>
            ))}
          </div>
          {form.location === 'physical'
            ? <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className="input" placeholder="Enter venue address..." />
            : <input type="text" value={form.meetingLink} onChange={e => set('meetingLink', e.target.value)} className="input" placeholder="Zoom / Meet link..." />
          }
        </div>

        <div className="grid grid-cols-2 gap-3">
          {inp('capacity', 'Capacity', true, 'number')}
          {inp('rsvpDeadline', 'RSVP Deadline', false, 'date')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Meeting Type"
            value={form.meetingType}
            onChange={v => set('meetingType', v)}
            options={['Regular', 'Strategy', 'Visitor'].map(t => ({ value: t, label: t }))}
          />
          <Select
            label="Mode"
            value={form.mode}
            onChange={v => set('mode', v)}
            options={['RSVP Only', 'RSVP + Attendance'].map(m => ({ value: m, label: m }))}
          />
        </div>

        {/* Recurring */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-2">Recurring</label>
          <div className="flex flex-wrap gap-2">
            {['None','Weekly','Bi-weekly','Monthly'].map(r => (
              <button
                key={r}
                onClick={() => set('recurring', r)}
                className={`px-3 py-1.5 text-xs rounded-button border transition-colors ${
                  form.recurring === r ? 'bg-navy text-white border-navy' : 'bg-white text-secondary border-border hover:border-navy'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Description <span className="text-secondary font-normal">(optional)</span></label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="input"
            style={{ height: 72, resize: 'none', paddingTop: 10 }}
            placeholder="Add any notes or agenda..."
          />
        </div>
      </div>

      <div className="flex gap-3 px-6 pb-6">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button onClick={submit} disabled={loading} className="btn-primary flex-1">
          {loading ? 'Creating...' : 'Create Meeting'}
        </button>
      </div>
    </Modal>
  )
}

// ── Main Meetings Page ───────────────────────────────────────────────────────
const TABS = ['Upcoming', 'Past', 'All']

export default function LAMeetingsPage() {
  const [meetings] = useState(INITIAL_MEETINGS)
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [attendanceMeeting, setAttendanceMeeting] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const visible = meetings.filter(m => {
    if (activeTab === 'All') return true
    return m.tab === activeTab.toLowerCase()
  })

  if (attendanceMeeting) {
    return (
      <AttendanceView
        meeting={attendanceMeeting}
        onBack={() => setAttendanceMeeting(null)}
      />
    )
  }

  return (
    <div className="space-y-6 p-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Meetings</h1>
          <p className="text-secondary text-sm mt-1">Andheri Chapter</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`relative px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t ? 'text-teal' : 'text-secondary hover:text-primary'
            }`}
          >
            {t}
            <span className="ml-1.5 text-2xs px-1.5 py-0.5 rounded-full bg-surface text-secondary">
              {t === 'All' ? meetings.length : meetings.filter(m => m.tab === t.toLowerCase()).length}
            </span>
            {activeTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t" />}
          </button>
        ))}
      </div>

      {/* Meeting cards */}
      <div className="space-y-4">
        {visible.map(m => (
          <MeetingCard key={m.id} meeting={m} onMarkAttendance={setAttendanceMeeting} />
        ))}
        {visible.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={32} className="text-secondary mb-3" />
            <p className="text-sm font-medium text-secondary">No meetings in this view</p>
          </div>
        )}
      </div>

      <CreateMeetingModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
