import { useState, useMemo } from 'react'
import {
  Search, Filter, AlertTriangle, Clock, CheckCircle2,
  CircleDot, Loader2, UserCheck, MessageSquare, X,
  ChevronDown, Copy, AlertCircle, MoreHorizontal, Plus,
} from 'lucide-react'
import { tickets as seedTickets, PA_TEAM, TICKET_CATEGORIES, SLA_CONFIG } from '../../data/support'

import useAuthStore from '../../store/authStore'
import ViewToggle from '../../components/ViewToggle'
import Pagination from '../../components/Pagination'
import FilterBar from '../../components/FilterBar'
import Select from '../../components/Select'

// ── SLA helpers ───────────────────────────────────────────────────────────────
function getSlaStatus(ticket) {
  if (ticket.status === 'resolved') return { label: 'Resolved', color: 'text-success', bg: 'bg-success/10', breached: false }
  const created  = new Date(ticket.createdAt).getTime()
  const now      = Date.now()
  const limitMs  = SLA_CONFIG[ticket.priority] * 3_600_000
  const elapsedH = (now - created) / 3_600_000
  const remainH  = SLA_CONFIG[ticket.priority] - elapsedH
  if (remainH < 0) {
    const over = Math.abs(Math.round(remainH))
    return { label: `Breached ${over}h ago`, color: 'text-danger', bg: 'bg-danger/10', breached: true }
  }
  if (remainH < SLA_CONFIG[ticket.priority] * 0.25) {
    return { label: `${Math.round(remainH)}h left`, color: 'text-warning', bg: 'bg-warning/10', breached: false }
  }
  return { label: `${Math.round(remainH)}h left`, color: 'text-secondary', bg: 'bg-surface', breached: false }
}

// ── Priority config ───────────────────────────────────────────────────────────
const PRIORITY = {
  critical: { label: 'Critical', badge: 'badge-danger'  },
  high:     { label: 'High',     badge: 'badge-warning' },
  medium:   { label: 'Medium',   badge: 'badge-amber'   },
  low:      { label: 'Low',      badge: 'badge-gray'    },
}

const STATUS = {
  open:        { label: 'Open',        badge: 'badge-danger',  icon: CircleDot    },
  in_progress: { label: 'In Progress', badge: 'badge-navy',    icon: Loader2      },
  resolved:    { label: 'Resolved',    badge: 'badge-success', icon: CheckCircle2 },
}

function statusBadge(status) {
  const s = STATUS[status] || {}
  return <span className={`badge ${s.badge}`}>{s.label}</span>
}
function priorityBadge(priority) {
  const p = PRIORITY[priority] || {}
  return <span className={`badge ${p.badge}`}>{p.label}</span>
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── SLA Banner ────────────────────────────────────────────────────────────────
function SLABanner({ tickets }) {
  const breached = tickets.filter(t => t.status !== 'resolved' && getSlaStatus(t).breached)
  if (!breached.length) return null
  return (
    <div className="flex items-center gap-3 bg-danger/8 border border-danger/25 rounded-card px-4 py-2.5 text-sm">
      <AlertTriangle size={15} className="text-danger flex-shrink-0" />
      <span className="font-medium text-danger">{breached.length} ticket{breached.length > 1 ? 's' : ''} have breached SLA</span>
      <span className="text-danger/70">— {breached.map(t => t.id).join(', ')}</span>
    </div>
  )
}

// ── Ticket Modal ──────────────────────────────────────────────────────────────
function TicketModal({ ticket, onClose, onUpdate }) {
  const [mode,       setMode]       = useState('view')   // 'view' | 'assign' | 'note' | 'resolve'
  const [assignee,   setAssignee]   = useState(ticket.assignedTo || '')
  const [noteText,   setNoteText]   = useState('')
  const [resolution, setResolution] = useState('')
  const sla = getSlaStatus(ticket)

  const save = () => {
    if (mode === 'assign') {
      onUpdate({ ...ticket, assignedTo: assignee, status: 'in_progress', updatedAt: new Date().toISOString() })
    } else if (mode === 'note') {
      if (!noteText.trim()) return
      const note = {
        id:        `note-${Date.now()}`,
        author:    'Jatin Dudhat',
        text:      noteText.trim(),
        createdAt: new Date().toISOString(),
      }
      onUpdate({ ...ticket, notes: [...ticket.notes, note], updatedAt: new Date().toISOString() })
      setNoteText('')
      setMode('view')
      return
    } else if (mode === 'resolve') {
      if (!resolution.trim()) return
      const note = {
        id:        `note-${Date.now()}`,
        author:    'Jatin Dudhat',
        text:      `[RESOLVED] ${resolution.trim()}`,
        createdAt: new Date().toISOString(),
      }
      const now = new Date().toISOString()
      onUpdate({ ...ticket, status: 'resolved', resolvedAt: now, updatedAt: now, notes: [...ticket.notes, note] })
      onClose()
      return
    }
    setMode('view')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
      <div className="w-full max-w-[560px] h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-secondary">{ticket.id}</span>
              {statusBadge(ticket.status)}
              {priorityBadge(ticket.priority)}
            </div>
            <h2 className="font-semibold text-primary text-sm leading-snug">{ticket.title}</h2>
            <p className="text-xs text-secondary mt-0.5">{ticket.communityName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-button hover:bg-surface text-secondary">
            <X size={16} />
          </button>
        </div>

        {/* SLA strip */}
        <div className={`px-5 py-2 flex items-center gap-2 text-xs ${sla.bg} flex-shrink-0`}>
          <Clock size={12} className={sla.color} />
          <span className={`font-medium ${sla.color}`}>SLA: {sla.label}</span>
          <span className="text-secondary ml-auto">Opened {fmtDate(ticket.createdAt)}</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-primary leading-relaxed">{ticket.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Reported by',  ticket.reportedBy],
              ['Role',         ticket.reportedByRole.replace(/_/g,' ')],
              ['Category',     ticket.category.replace(/_/g,' ')],
              ['Assigned to',  ticket.assignedTo || 'Unassigned'],
              ['Updated',      fmtDate(ticket.updatedAt)],
              ['Resolved',     fmtDate(ticket.resolvedAt)],
            ].map(([k,v]) => (
              <div key={k}>
                <p className="text-secondary mb-0.5">{k}</p>
                <p className="font-medium text-primary capitalize">{v}</p>
              </div>
            ))}
          </div>

          {/* Action panel */}
          {ticket.status !== 'resolved' && (
            <div className="border border-border rounded-card p-4 space-y-3">
              {mode === 'view' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setMode('assign')} className="btn btn-sm btn-outline gap-1.5">
                    <UserCheck size={13} /> Assign
                  </button>
                  <button onClick={() => setMode('note')} className="btn btn-sm btn-ghost gap-1.5">
                    <MessageSquare size={13} /> Add Note
                  </button>
                  <button onClick={() => setMode('resolve')} className="btn btn-sm bg-success/10 text-success hover:bg-success/20 rounded-button text-xs font-medium px-3 h-8 gap-1.5">
                    <CheckCircle2 size={13} /> Resolve
                  </button>
                </div>
              )}

              {mode === 'assign' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-secondary">Assign Ticket</p>
                  <Select
                    value={assignee}
                    onChange={setAssignee}
                    options={[
                      { value: '', label: '— Select agent —' },
                      ...PA_TEAM.map(a => ({ value: a, label: a })),
                    ]}
                  />
                  <div className="flex gap-2">
                    <button onClick={save} className="btn btn-sm btn-primary">Save</button>
                    <button onClick={() => setMode('view')} className="btn btn-sm btn-ghost">Cancel</button>
                  </div>
                </div>
              )}

              {mode === 'note' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-secondary">Add Internal Note</p>
                  <textarea
                    className="input h-24 py-2 resize-none"
                    placeholder="Write a note visible only to the support team…"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={save} className="btn btn-sm btn-primary">Post Note</button>
                    <button onClick={() => setMode('view')} className="btn btn-sm btn-ghost">Cancel</button>
                  </div>
                </div>
              )}

              {mode === 'resolve' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-secondary">Resolution Summary</p>
                  <textarea
                    className="input h-20 py-2 resize-none"
                    placeholder="Describe how the issue was resolved…"
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={save} className="btn btn-sm bg-success text-white hover:bg-success/90 rounded-button text-xs font-medium px-3 h-8">Mark Resolved</button>
                    <button onClick={() => setMode('view')} className="btn btn-sm btn-ghost">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes / Activity */}
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Activity Log</p>
            {ticket.notes.length === 0 ? (
              <p className="text-xs text-secondary italic">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {ticket.notes.map(note => (
                  <div key={note.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-2xs font-semibold text-navy">
                        {note.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">{note.author}</span>
                        <span className="text-2xs text-secondary">{fmtDate(note.createdAt)}</span>
                      </div>
                      <p className="text-xs text-secondary mt-0.5 leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ticket Card (card view) ───────────────────────────────────────────────────
function TicketCard({ ticket, onClick }) {
  const sla = getSlaStatus(ticket)
  const StatusIcon = STATUS[ticket.status]?.icon || CircleDot
  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-mono text-2xs text-secondary">{ticket.id}</span>
            {priorityBadge(ticket.priority)}
          </div>
          <p className="text-sm font-medium text-primary leading-snug line-clamp-2">{ticket.title}</p>
        </div>
        {statusBadge(ticket.status)}
      </div>

      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">{ticket.description}</p>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <div className="w-5 h-5 rounded-full bg-navy/10 flex items-center justify-center">
            <span className="text-2xs font-semibold text-navy">
              {ticket.communityName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <span className="truncate max-w-[120px]">{ticket.communityName}</span>
        </div>
        <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${sla.bg} ${sla.color}`}>
          {sla.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-2xs text-secondary">
        <span>{ticket.assignedTo ? `→ ${ticket.assignedTo.split(' ')[0]}` : 'Unassigned'}</span>
        <span className="badge badge-gray text-2xs">{ticket.category.replace(/_/g, ' ')}</span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const CARD_PER_PAGE  = 9
const TABLE_PER_PAGE = 10

export default function SupportPage() {
  const currentUser = useAuthStore(s => s.currentUser)
  const MY_AGENT = currentUser?.name ?? 'Jatin Dudhat'

  const [tickets,       setTickets]       = useState(seedTickets)
  const [view,          setView]          = useState('table')
  const [page,          setPage]          = useState(1)
  const [search,        setSearch]        = useState('')
  const [status,        setStatus]        = useState('all')
  const [priority,      setPriority]      = useState([])
  const [category,      setCategory]      = useState([])
  const [selected,      setSelected]      = useState(null)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [newForm,       setNewForm]       = useState({ title: '', priority: 'medium', community: '', category: '' })

  const filtered = useMemo(() => {
    return tickets
      .filter(t => {
        const q = search.toLowerCase()
        if (q && !t.title.toLowerCase().includes(q) &&
                 !t.communityName.toLowerCase().includes(q) &&
                 !t.id.includes(q)) return false
        if (status === 'my_assigned') {
          if (t.assignedTo !== MY_AGENT) return false
        } else if (status !== 'all' && t.status !== status) return false
        if (priority.length > 0 && !priority.includes(t.priority)) return false
        if (category.length > 0 && !category.includes(t.category)) return false
        return true
      })
      .sort((a, b) => {
        const aBreached = getSlaStatus(a).breached ? 0 : 1
        const bBreached = getSlaStatus(b).breached ? 0 : 1
        return aBreached - bBreached
      })
  }, [tickets, search, status, priority, category])

  // reset page when filters or view changes
  useMemo(() => setPage(1), [filtered.length, view])

  const perPage = view === 'card' ? CARD_PER_PAGE : TABLE_PER_PAGE
  const paged   = filtered.slice((page - 1) * perPage, page * perPage)

  const counts = useMemo(() => ({
    all:         tickets.length,
    open:        tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved:    tickets.filter(t => t.status === 'resolved').length,
    my_assigned: tickets.filter(t => t.assignedTo === MY_AGENT).length,
  }), [tickets])

  const handleUpdate = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelected(updated)
  }

  const handleCreateTicket = () => {
    if (!newForm.title.trim() || !newForm.community.trim() || !newForm.category) return
    const ticket = {
      id:             `TKT-${String(tickets.length + 1).padStart(4, '0')}`,
      title:          newForm.title.trim(),
      description:    '',
      communityName:  newForm.community.trim(),
      priority:       newForm.priority,
      status:         'open',
      category:       newForm.category,
      reportedBy:     MY_AGENT,
      reportedByRole: 'platform_admin',
      assignedTo:     null,
      notes:          [],
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
      resolvedAt:     null,
    }
    setTickets(prev => [ticket, ...prev])
    setNewForm({ title: '', priority: 'medium', community: '', category: '' })
    setNewTicketOpen(false)
  }

  return (
    <div className="p-3 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Support Queue</h1>
          <p className="text-secondary text-sm mt-0.5">Manage and resolve tenant support tickets</p>
        </div>
        <button
          onClick={() => setNewTicketOpen(true)}
          className="btn btn-primary btn-sm flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus size={14} /> New Ticket
        </button>
      </div>

      {/* SLA Banner */}
      <SLABanner tickets={tickets} />

      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all',         label: `All (${counts.all})`                   },
          { key: 'open',        label: `Open (${counts.open})`                 },
          { key: 'in_progress', label: `In Progress (${counts.in_progress})`   },
          { key: 'resolved',    label: `Resolved (${counts.resolved})`         },
          { key: 'my_assigned', label: `My Assigned (${counts.my_assigned})`   },
        ].map(pill => (
          <button
            key={pill.key}
            onClick={() => { setStatus(pill.key); setPage(1) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              status === pill.key
                ? 'bg-navy text-white'
                : 'bg-white border border-border text-secondary hover:bg-surface'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input
            className="input pl-8 text-xs"
            placeholder="Search tickets…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <FilterBar
          filters={[
            {
              key: 'priority',
              label: 'Priority',
              value: priority,
              onChange: v => { setPriority(v); setPage(1) },
              multi: true,
              options: Object.entries(PRIORITY).map(([k, v]) => ({ value: k, label: v.label })),
            },
            {
              key: 'category',
              label: 'Category',
              value: category,
              onChange: v => { setCategory(v); setPage(1) },
              multi: true,
              options: TICKET_CATEGORIES.filter(c => c.value !== 'all'),
            },
          ]}
        />

        <div className="ml-auto">
          <ViewToggle value={view} onChange={v => { setView(v); setPage(1) }} />
        </div>
      </div>

      {/* Card View */}
      {view === 'card' && (
        <>
          {paged.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle size={24} className="text-secondary mb-3" />
              <p className="text-secondary text-sm">No tickets match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paged.map(t => (
                <TicketCard key={t.id} ticket={t} onClick={() => setSelected(t)} />
              ))}
            </div>
          )}
          <Pagination page={page} total={filtered.length} perPage={CARD_PER_PAGE} onChange={setPage} />
        </>
      )}

      {/* Table View */}
      {view === 'table' && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface/60 border-b border-border">
                  <tr>
                    <th className="th text-left">Ticket</th>
                    <th className="th text-left">Community</th>
                    <th className="th text-left">Category</th>
                    <th className="th text-left">Priority</th>
                    <th className="th text-left">Status</th>
                    <th className="th text-left">SLA</th>
                    <th className="th text-left">Assigned</th>
                    <th className="th text-left">Created</th>
                    <th className="th" />
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="td text-center text-secondary py-10">No tickets match your filters.</td>
                    </tr>
                  ) : paged.map(t => {
                    const sla = getSlaStatus(t)
                    return (
                      <tr key={t.id} className="tr">
                        <td className="td">
                          <div>
                            <p className="font-medium text-primary text-xs leading-snug max-w-[200px] truncate">{t.title}</p>
                            <p className="font-mono text-2xs text-secondary mt-0.5">{t.id}</p>
                          </div>
                        </td>
                        <td className="td">
                          <span className="text-xs text-secondary">{t.communityName}</span>
                        </td>
                        <td className="td">
                          <span className="badge badge-gray text-2xs">{t.category.replace(/_/g,' ')}</span>
                        </td>
                        <td className="td">{priorityBadge(t.priority)}</td>
                        <td className="td">{statusBadge(t.status)}</td>
                        <td className="td">
                          <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${sla.bg} ${sla.color}`}>
                            {sla.label}
                          </span>
                        </td>
                        <td className="td">
                          <span className="text-xs text-secondary">{t.assignedTo || '—'}</span>
                        </td>
                        <td className="td">
                          <span className="text-xs text-secondary whitespace-nowrap">
                            {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </td>
                        <td className="td">
                          <button
                            onClick={() => setSelected(t)}
                            className="btn btn-sm btn-ghost text-xs"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={filtered.length} perPage={TABLE_PER_PAGE} onChange={setPage} />
        </>
      )}

      {/* Ticket Modal */}
      {selected && (
        <TicketModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* New Ticket Modal */}
      {newTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-card shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-primary">New Support Ticket</h2>
              <button onClick={() => setNewTicketOpen(false)} className="p-1.5 rounded-button hover:bg-surface text-secondary">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block">Title</label>
                <input
                  autoFocus
                  className="input"
                  placeholder="Describe the issue…"
                  value={newForm.title}
                  onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block">Community</label>
                <input
                  className="input"
                  placeholder="Community name"
                  value={newForm.community}
                  onChange={e => setNewForm(f => ({ ...f, community: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block">Category <span className="text-danger">*</span></label>
                <Select
                  value={newForm.category}
                  onChange={v => setNewForm(f => ({ ...f, category: v }))}
                  options={[{ value: '', label: 'Select category…' }, ...TICKET_CATEGORIES.map(c => ({ value: c.value, label: c.label }))]}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary mb-1 block">Priority</label>
                <Select
                  value={newForm.priority}
                  onChange={v => setNewForm(f => ({ ...f, priority: v }))}
                  options={Object.entries(PRIORITY).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreateTicket}
                disabled={!newForm.title.trim() || !newForm.community.trim() || !newForm.category}
                className="btn btn-primary btn-sm flex-1 disabled:opacity-50"
              >
                Create Ticket
              </button>
              <button onClick={() => setNewTicketOpen(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
