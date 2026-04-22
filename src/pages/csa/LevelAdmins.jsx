import { useState } from 'react'
import { Shield, Search, X, UserPlus, Phone, Mail, AlertTriangle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { members } from '../../data'

const CHAPTER_NAMES = { c1:'Andheri', c2:'Bandra', c3:'Borivali', c4:'Dadar', c5:'Powai', c6:'Thane', c7:'Navi Mumbai', c8:'Vashi' }

const INITIAL_NODES = [
  { id: 'z1', name: 'Zone Alpha',          type: 'Zone',    laId: 'la005', laName: 'Tushar Jain',   email: 'tushar@bnimumbai.com',  phone: '+91 98201 20005', since: '2024-03-01' },
  { id: 'z2', name: 'Zone Beta',           type: 'Zone',    laId: 'la006', laName: 'Priti Shetty',  email: 'priti@bnimumbai.com',   phone: '+91 98201 20006', since: '2024-03-01' },
  { id: 'c1', name: 'Andheri Chapter',     type: 'Chapter', laId: 'la001', laName: 'Hardik Patel',  email: 'hardik@bnimumbai.com',  phone: '+91 98201 20001', since: '2024-02-20' },
  { id: 'c2', name: 'Bandra Chapter',      type: 'Chapter', laId: 'la002', laName: 'Sneha Kapoor',  email: 'sneha@bnimumbai.com',   phone: '+91 98201 20002', since: '2024-03-15' },
  { id: 'c3', name: 'Borivali Chapter',    type: 'Chapter', laId: null,    laName: null,            email: null,                    phone: null,              since: null         },
  { id: 'c4', name: 'Dadar Chapter',       type: 'Chapter', laId: null,    laName: null,            email: null,                    phone: null,              since: null         },
  { id: 'c5', name: 'Powai Chapter',       type: 'Chapter', laId: 'la003', laName: 'Firoz Shaikh',  email: 'firoz@bnimumbai.com',   phone: '+91 98201 20003', since: '2024-02-28' },
  { id: 'c6', name: 'Thane Chapter',       type: 'Chapter', laId: 'la004', laName: 'Nandini Menon', email: 'nandini@bnimumbai.com', phone: '+91 98201 20004', since: '2024-04-01' },
  { id: 'c7', name: 'Navi Mumbai Chapter', type: 'Chapter', laId: null,    laName: null,            email: null,                    phone: null,              since: null         },
  { id: 'c8', name: 'Vashi Chapter',       type: 'Chapter', laId: null,    laName: null,            email: null,                    phone: null,              since: null         },
]

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

export default function CSALevelAdminsPage() {
  const [nodes, setNodes]         = useState(INITIAL_NODES)
  const [filter, setFilter]       = useState('all')
  const [assignNodeId, setAssignNodeId] = useState(null)
  const [search, setSearch]       = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = nodes.filter(n => {
    if (filter === 'assigned')   return !!n.laId
    if (filter === 'unassigned') return !n.laId
    return true
  })

  const assignNode = nodes.find(n => n.id === assignNodeId)

  const candidateMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.business.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (nodeId) => {
    setAssignNodeId(nodeId)
    setSearch('')
    setSelectedId(null)
  }

  const closeModal = () => {
    setAssignNodeId(null)
    setSearch('')
    setSelectedId(null)
  }

  const handleAssign = () => {
    if (!selectedId || !assignNodeId) return
    const member = members.find(m => m.id === selectedId)
    setNodes(prev => prev.map(n =>
      n.id === assignNodeId
        ? { ...n, laId: member.id, laName: member.name, email: member.email, phone: member.phone, since: new Date().toISOString().split('T')[0] }
        : n
    ))
    toast.success(`${member.name} assigned as Level Admin for ${assignNode?.name}`, { style: { fontSize: 13 } })
    closeModal()
  }

  const tabs = [
    { id: 'all',        label: 'All',        count: nodes.length },
    { id: 'assigned',   label: 'Assigned',   count: nodes.filter(n => n.laId).length },
    { id: 'unassigned', label: 'Unassigned', count: nodes.filter(n => !n.laId).length },
  ]

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Level Admins</h1>
          <p className="text-secondary text-sm mt-1">Manage Level Admin assignments for all hierarchy nodes</p>
        </div>
        <button className="btn-primary btn-sm flex items-center gap-2">
          <UserPlus size={14} />
          Assign / Reassign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`relative px-5 py-2.5 text-sm font-medium transition-colors ${
              filter === tab.id ? 'text-teal' : 'text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-2xs font-medium ${
              filter === tab.id ? 'bg-teal/10 text-teal' : 'bg-surface text-secondary'
            }`}>
              {tab.count}
            </span>
            {filter === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(node => (
          <div key={node.id} className="card p-5">
            {/* Card header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-base font-semibold text-primary">{node.name}</p>
                <span className="badge badge-teal mt-1">{node.type}</span>
              </div>
              <div className="w-9 h-9 rounded-button bg-navy/5 flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-navy" />
              </div>
            </div>

            {node.laId ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-teal">{initials(node.laName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary">{node.laName}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-secondary">
                      <Phone size={10} />
                      <span className="text-2xs">{node.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-secondary">
                      <Mail size={10} />
                      <span className="text-2xs">{node.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-2xs text-secondary">Since {formatDate(node.since)}</p>
                  <button
                    onClick={() => openModal(node.id)}
                    className="btn-ghost btn-sm"
                  >
                    Reassign
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-amber flex-shrink-0" />
                  <p className="text-sm font-medium text-warning">No Level Admin assigned</p>
                </div>
                <button
                  onClick={() => openModal(node.id)}
                  className="btn btn-sm"
                  style={{ background: '#E6A817', color: '#fff', height: 36, padding: '0 14px', fontSize: 13, borderRadius: 8, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <UserPlus size={13} />
                  Assign Now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignNodeId && assignNode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-primary">Assign Level Admin</h3>
                <p className="text-2xs text-secondary mt-0.5">{assignNode.name}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-button hover:bg-surface text-secondary transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  placeholder="Search members to assign..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-9"
                  style={{ height: 40, fontSize: 13 }}
                />
              </div>

              <div className="max-h-60 overflow-y-auto rounded-button border border-border divide-y divide-border">
                {candidateMembers.slice(0, 12).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      selectedId === m.id ? 'bg-teal/10' : 'hover:bg-surface'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xs font-bold text-navy">{initials(m.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary">{m.name}</p>
                      <p className="text-2xs text-secondary truncate">
                        {m.business} · {CHAPTER_NAMES[m.chapter] ?? m.chapter}
                      </p>
                    </div>
                    {selectedId === m.id && <Check size={14} className="text-teal flex-shrink-0" />}
                  </button>
                ))}
                {candidateMembers.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-secondary">No members found</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={handleAssign}
                disabled={!selectedId}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign as Level Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
