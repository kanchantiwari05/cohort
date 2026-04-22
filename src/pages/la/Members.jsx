import { useState, useMemo } from 'react'
import { Search, UserPlus, X, ChevronDown, Phone, Mail, Star, Calendar, ClipboardCheck, Rss } from 'lucide-react'
import toast from 'react-hot-toast'
import SlideOver from '../../components/SlideOver'
import Select from '../../components/Select'

const CATEGORIES = ['IT Services','Retail','Management','Healthcare','Architecture','Legal Services','Trading','Education','Real Estate','Food & Bev','Finance','Marketing']

const INITIAL_MEMBERS = [
  { id: 'lm001', name: 'Amit Desai',      business: 'Desai Technologies',  category: 'IT Services',    phone: '+91 98765 40001', email: 'amit@desaitech.com',      status: 'active',   score: 87, joined: '2024-03-01', referrals: 14, meetings: 18, attendance: 92 },
  { id: 'lm002', name: 'Priyanka Shah',   business: 'Shah Jewellers',      category: 'Retail',         phone: '+91 98765 40002', email: 'priyanka@shahjewels.com', status: 'active',   score: 72, joined: '2024-04-10', referrals: 8,  meetings: 15, attendance: 82 },
  { id: 'lm003', name: 'Ravi Krishnan',   business: 'RK Consulting',       category: 'Management',     phone: '+91 98765 40003', email: 'ravi@rkconsult.com',      status: 'active',   score: 65, joined: '2024-02-18', referrals: 6,  meetings: 14, attendance: 77 },
  { id: 'lm004', name: 'Sunita Patel',    business: 'Patel Pharma',        category: 'Healthcare',     phone: '+91 98765 40004', email: 'sunita@patelpharma.com',  status: 'active',   score: 91, joined: '2023-11-05', referrals: 19, meetings: 20, attendance: 96 },
  { id: 'lm005', name: 'Manish Gupta',    business: 'MG Architects',       category: 'Architecture',   phone: '+91 98765 40005', email: 'manish@mgarch.com',       status: 'at_risk',  score: 23, joined: '2024-01-20', referrals: 1,  meetings: 5,  attendance: 42 },
  { id: 'lm006', name: 'Deepa Nair',      business: 'Nair Legal',          category: 'Legal Services', phone: '+91 98765 40006', email: 'deepa@nairlegal.com',     status: 'active',   score: 78, joined: '2024-03-22', referrals: 11, meetings: 16, attendance: 86 },
  { id: 'lm007', name: 'Arjun Mehta',     business: 'Mehta Exports',       category: 'Trading',        phone: '+91 98765 40007', email: 'arjun@mehtaexports.com',  status: 'active',   score: 84, joined: '2023-12-14', referrals: 15, meetings: 18, attendance: 90 },
  { id: 'lm008', name: 'Kavita Joshi',    business: 'Joshi Academy',       category: 'Education',      phone: '+91 98765 40008', email: 'kavita@joshiacademy.com', status: 'inactive', score: 15, joined: '2024-05-03', referrals: 0,  meetings: 3,  attendance: 25 },
  { id: 'lm009', name: 'Sanjay Verma',    business: 'Verma Builders',      category: 'Real Estate',    phone: '+91 98765 40009', email: 'sanjay@vermabuilders.com',status: 'active',   score: 69, joined: '2024-02-28', referrals: 7,  meetings: 13, attendance: 74 },
  { id: 'lm010', name: 'Nisha Agarwal',   business: 'Agarwal Catering',    category: 'Food & Bev',     phone: '+91 98765 40010', email: 'nisha@agarwalcatering.com',status: 'active',  score: 55, joined: '2024-04-17', referrals: 4,  meetings: 11, attendance: 65 },
  { id: 'lm011', name: 'Rahul Bhatt',     business: 'Bhatt Insurance',     category: 'Finance',        phone: '+91 98765 40011', email: 'rahul@bhattinsure.com',   status: 'active',   score: 82, joined: '2024-01-08', referrals: 13, meetings: 17, attendance: 88 },
  { id: 'lm012', name: 'Pooja Desai',     business: 'Desai PR',            category: 'Marketing',      phone: '+91 98765 40012', email: 'pooja@desaipr.com',       status: 'active',   score: 74, joined: '2024-03-30', referrals: 9,  meetings: 14, attendance: 80 },
]

const STATUS_BADGE = {
  active:   'badge-success',
  inactive: 'badge-gray',
  at_risk:  'badge-danger',
}
const STATUS_LABEL = { active: 'Active', inactive: 'Inactive', at_risk: 'At Risk' }

const FILTER_OPTIONS = ['All', 'Active', 'Inactive', 'At Risk']

function initials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }
function scoreColor(s)  { return s >= 70 ? '#2E7D32' : s >= 40 ? '#C17900' : '#BF360C' }

function ScoreGauge({ score }) {
  const r = 26, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)
  return (
    <div className="relative w-14 h-14">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#D0DCF0" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 28 28)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-primary">{score}</span>
      </div>
    </div>
  )
}

// ── Member Detail SlideOver ──────────────────────────────────────────────────
const DETAIL_TABS = ['Overview', 'Referrals', 'Meetings', 'Attendance', 'Activity']

function MemberDetail({ member, onClose, onStatusChange }) {
  const [tab, setTab] = useState('Overview')
  const [status, setStatus] = useState(member.status)
  const [showStatusDD, setShowStatusDD] = useState(false)

  const changeStatus = (newStatus) => {
    setStatus(newStatus)
    setShowStatusDD(false)
    onStatusChange(member.id, newStatus)
    toast.success(`${member.name} status updated to ${STATUS_LABEL[newStatus]}`, { style: { fontSize: 13 } })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Profile header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-navy">{initials(member.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-primary">{member.name}</h3>
            <p className="text-sm text-secondary mt-0.5">{member.business}</p>
            <p className="text-2xs text-secondary">{member.category}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative">
                <button
                  onClick={() => setShowStatusDD(!showStatusDD)}
                  className={`badge ${STATUS_BADGE[status]} flex items-center gap-1 cursor-pointer`}
                >
                  {STATUS_LABEL[status]} <ChevronDown size={10} />
                </button>
                {showStatusDD && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-card shadow-modal border border-border z-10 w-32">
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => changeStatus(k)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-surface transition-colors ${k === status ? 'font-semibold text-teal' : 'text-primary'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ScoreGauge score={member.score} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-2xs text-secondary">
          <div className="flex items-center gap-1.5"><Phone size={11} /> {member.phone}</div>
          <div className="flex items-center gap-1.5"><Mail size={11} /> <span className="truncate">{member.email}</span></div>
        </div>
        <p className="text-2xs text-secondary mt-1">Member since {new Date(member.joined).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        {DETAIL_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-xs font-medium relative transition-colors ${tab === t ? 'text-teal' : 'text-secondary hover:text-primary'}`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Referrals Given', value: member.referrals, icon: Star,          color: 'text-amber'   },
                { label: 'Meetings',        value: member.meetings,  icon: Calendar,      color: 'text-navy'    },
                { label: 'Attendance',      value: `${member.attendance}%`, icon: ClipboardCheck, color: 'text-success' },
              ].map(s => (
                <div key={s.label} className="bg-surface rounded-button p-3 text-center">
                  <s.icon size={16} className={`${s.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold text-primary">{s.value}</p>
                  <p className="text-2xs text-secondary">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold text-secondary mb-2">Engagement Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${member.score}%`, background: scoreColor(member.score) }} />
                </div>
                <span className="text-sm font-bold" style={{ color: scoreColor(member.score) }}>{member.score}/100</span>
              </div>
              <p className="text-2xs text-secondary mt-2">
                {member.score >= 70 ? 'Highly engaged member' : member.score >= 40 ? 'Moderate engagement — nudge recommended' : 'Low engagement — urgent attention needed'}
              </p>
            </div>
          </div>
        )}

        {tab === 'Referrals' && (
          <div className="space-y-3">
            {[...Array(member.referrals > 0 ? Math.min(member.referrals, 4) : 0)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-button">
                <div>
                  <p className="text-xs font-medium text-primary">Business Referral #{i + 1}</p>
                  <p className="text-2xs text-secondary">To: {['Priyanka Shah','Ravi Krishnan','Rahul Bhatt','Sanjay Verma'][i % 4]}</p>
                </div>
                <span className="badge badge-success text-2xs">Closed Won</span>
              </div>
            ))}
            {member.referrals === 0 && <p className="text-sm text-secondary text-center py-6">No referrals yet</p>}
          </div>
        )}

        {tab === 'Meetings' && (
          <div className="space-y-3">
            {['Weekly Networking — Apr 15', 'Monthly Strategy — Mar 18', 'Weekly Networking — Apr 8', 'Visitor Day — Mar 22'].slice(0, Math.min(4, member.meetings)).map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-button">
                <p className="text-xs font-medium text-primary">{m}</p>
                <span className={`badge text-2xs ${i < 3 ? 'badge-success' : 'badge-gray'}`}>{i < 3 ? 'Present' : 'Absent'}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Attendance' && (
          <div className="space-y-3">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-primary">{member.attendance}%</p>
              <p className="text-sm text-secondary mt-1">Overall Attendance Rate</p>
              <p className="text-2xs text-secondary mt-1">{member.meetings} of {Math.round(member.meetings / (member.attendance / 100))} meetings attended</p>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`h-6 rounded ${i < Math.floor(20 * member.attendance / 100) ? 'bg-success' : 'bg-surface border border-border'}`} />
              ))}
            </div>
            <p className="text-2xs text-secondary text-center">Each block = 1 meeting (last 20)</p>
          </div>
        )}

        {tab === 'Activity' && (
          <div className="space-y-3">
            {[
              `Referred Priyanka Shah for IT project`,
              `Attended Weekly Networking Meeting`,
              `Received referral from Rahul Bhatt`,
              `RSVP'd for Monthly Strategy Session`,
              `Logged 1:1 meeting with Deepa Nair`,
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-button">
                <Rss size={13} className="text-teal mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-primary">{a}</p>
                  <p className="text-2xs text-secondary mt-0.5">{i + 1} day{i > 0 ? 's' : ''} ago</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add Member SlideOver ─────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', phone: '', email: '', business: '', category: '' }

function AddMemberForm({ onClose }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Full name is required'
    if (!form.phone.trim())    e.phone    = 'Mobile number is required'
    if (!form.business.trim()) e.business = 'Business name is required'
    if (!form.category)        e.category = 'Category is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success(`OTP invite sent to ${form.name} at ${form.phone}`, { duration: 4000, style: { fontSize: 13 } })
      onClose()
    }, 800)
  }

  const field = (key, label, required, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-primary mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })) }}
        className={`input ${errors[key] ? 'input-error' : ''}`}
        placeholder={placeholder}
      />
      {errors[key] && <p className="text-2xs text-danger mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {field('name',     'Full Name',     true,  'text',  'e.g. Raj Kumar')}
        {field('phone',    'Mobile Number', true,  'tel',   '+91 XXXXX XXXXX')}
        {field('email',    'Email Address', false, 'email', 'Optional')}
        {field('business', 'Business Name', true,  'text',  'e.g. Kumar Textiles')}
        <div>
          <Select
            label={<>Category<span className="text-danger ml-0.5">*</span></>}
            value={form.category}
            onChange={v => { setForm(p => ({ ...p, category: v })); setErrors(p => ({ ...p, category: '' })) }}
            placeholder="Select category..."
            options={[
              { value: '', label: 'Select category...' },
              ...CATEGORIES.map(c => ({ value: c, label: c })),
            ]}
            error={errors.category || undefined}
          />
        </div>

        <div className="p-4 bg-teal/5 rounded-button border border-teal/20">
          <p className="text-2xs text-secondary leading-relaxed">
            An OTP invite will be sent to the member's mobile number. They can log in immediately after verification.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Sending...' : 'Create & Send Invite'}
        </button>
      </div>
    </div>
  )
}

// ── Main Members Page ────────────────────────────────────────────────────────
export default function LAMembersPage() {
  const [members, setMembers]   = useState(INITIAL_MEMBERS)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [openMember, setOpenMember] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.business.toLowerCase().includes(search.toLowerCase()) ||
                          m.category.toLowerCase().includes(search.toLowerCase())
      const matchFilter =
        filter === 'All'      ? true :
        filter === 'Active'   ? m.status === 'active'   :
        filter === 'Inactive' ? m.status === 'inactive' :
        filter === 'At Risk'  ? m.status === 'at_risk'  : true
      return matchSearch && matchFilter
    })
  }, [members, search, filter])

  const updateStatus = (id, newStatus) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
  }

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Members</h1>
          <p className="text-secondary text-sm mt-1">Andheri Chapter — {members.length} members</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search members, business, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-button border transition-colors ${
                filter === f
                  ? 'bg-teal text-white border-teal'
                  : 'bg-white text-secondary border-border hover:border-teal hover:text-teal'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left">Member</th>
                <th className="th text-left">Category</th>
                <th className="th text-left">Phone</th>
                <th className="th text-left">Status</th>
                <th className="th text-right">Engagement</th>
                <th className="th text-right">Referrals</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xs font-bold text-navy">{initials(m.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{m.name}</p>
                        <p className="text-2xs text-secondary truncate max-w-[140px]">{m.business}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td text-secondary text-sm">{m.category}</td>
                  <td className="td text-secondary text-sm">{m.phone}</td>
                  <td className="td">
                    <span className={`badge ${STATUS_BADGE[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                  </td>
                  <td className="td text-right">
                    <span className="text-sm font-semibold" style={{ color: scoreColor(m.score) }}>{m.score}</span>
                  </td>
                  <td className="td text-right text-sm text-secondary">{m.referrals}</td>
                  <td className="td text-right">
                    <button
                      onClick={() => setOpenMember(m)}
                      className="btn-ghost btn-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="td text-center py-8 text-secondary">No members match your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail SlideOver */}
      <SlideOver
        open={!!openMember}
        onClose={() => setOpenMember(null)}
        title={openMember?.name ?? ''}
        width={520}
      >
        {openMember && (
          <MemberDetail
            member={members.find(m => m.id === openMember.id) ?? openMember}
            onClose={() => setOpenMember(null)}
            onStatusChange={updateStatus}
          />
        )}
      </SlideOver>

      {/* Add Member SlideOver */}
      <SlideOver open={showAdd} onClose={() => setShowAdd(false)} title="Add New Member" width={480}>
        <AddMemberForm onClose={() => setShowAdd(false)} />
      </SlideOver>
    </div>
  )
}
