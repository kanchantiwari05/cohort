import { useState } from 'react'
import { Phone, Calendar, UserCheck, UserX, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_VISITORS = [
  {
    id: 'v001', name: 'Vivek Kapoor',  phone: '+91 93456 78901',
    referredBy: 'Amit Desai',    meeting: 'Weekly Networking Meeting — 14 Jun',
    daysAgo: 2,  status: 'pending', business: 'Kapoor Textiles', category: 'Trading',
    email: 'vivek@kapoortex.com',
  },
  {
    id: 'v002', name: 'Meera Pillai',  phone: '+91 87654 32109',
    referredBy: 'Sunita Patel',  meeting: 'Weekly Networking Meeting — 14 Jun',
    daysAgo: 4,  status: 'pending', business: 'Pillai Healthcare', category: 'Healthcare',
    email: 'meera@pillaihc.com',
  },
  {
    id: 'v003', name: 'Kunal Thakur',  phone: '+91 99887 76655',
    referredBy: 'Arjun Mehta',   meeting: 'Visitor Introduction Day — 22 Jun',
    daysAgo: 1,  status: 'pending', business: 'Thakur Logistics', category: 'Logistics',
    email: 'kunal@thakurlog.com',
  },
]

function initials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }

const TABS = ['Pending Approval', 'Approved', 'All']

export default function LAVisitorsPage() {
  const [visitors, setVisitors]     = useState(INITIAL_VISITORS)
  const [activeTab, setActiveTab]   = useState('Pending Approval')
  const [confirmId, setConfirmId]   = useState(null)   // approve confirm
  const [declineId, setDeclineId]   = useState(null)   // decline confirm
  const [profileId, setProfileId]   = useState(null)   // profile view

  const pending  = visitors.filter(v => v.status === 'pending')
  const approved = visitors.filter(v => v.status === 'approved')

  const visible = activeTab === 'Pending Approval' ? pending
                : activeTab === 'Approved'         ? approved
                : visitors

  const confirmVisitor = visitors.find(v => v.id === confirmId)
  const declineVisitor = visitors.find(v => v.id === declineId)
  const profileVisitor = visitors.find(v => v.id === profileId)

  const doApprove = () => {
    setVisitors(prev => prev.map(v => v.id === confirmId ? { ...v, status: 'approved' } : v))
    toast.success(`${confirmVisitor?.name} converted to member — invite sent!`, { style: { fontSize: 13 } })
    setConfirmId(null)
  }

  const doDecline = () => {
    setVisitors(prev => prev.map(v => v.id === declineId ? { ...v, status: 'declined' } : v))
    toast.error(`${declineVisitor?.name} declined`, { style: { fontSize: 13 } })
    setDeclineId(null)
  }

  const tabCount = (t) => {
    if (t === 'Pending Approval') return pending.length
    if (t === 'Approved')         return approved.length
    return visitors.length
  }

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-primary">Visitors</h1>
        <p className="text-secondary text-sm mt-1">Andheri Chapter — visitor pipeline</p>
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
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-2xs font-medium ${
              activeTab === t ? 'bg-teal/10 text-teal' : 'bg-surface text-secondary'
            }`}>
              {tabCount(t)}
            </span>
            {activeTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t" />}
          </button>
        ))}
      </div>

      {/* Visitor cards */}
      <div className="space-y-4">
        {visible.map(v => (
          <div key={v.id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-navy">{initials(v.name)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-primary">{v.name}</p>
                    <p className="text-sm text-secondary">{v.business} · {v.category}</p>
                  </div>
                  {v.status === 'approved' && (
                    <span className="badge badge-success">Approved</span>
                  )}
                  {v.status === 'declined' && (
                    <span className="badge badge-danger">Declined</span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-2xs text-secondary">
                  <p className="flex items-center gap-1.5"><Phone size={10} /> {v.phone}</p>
                  <p className="flex items-center gap-1.5">
                    <span className="font-medium text-primary">Referred by:</span> {v.referredBy}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar size={10} /> Attending: {v.meeting}
                  </p>
                  <p>Registered {v.daysAgo} day{v.daysAgo !== 1 ? 's' : ''} ago</p>
                </div>

                {v.status === 'pending' && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setProfileId(v.id)}
                      className="btn-ghost btn-sm flex items-center gap-1.5"
                    >
                      <Eye size={13} /> View Profile
                    </button>
                    <button
                      onClick={() => setConfirmId(v.id)}
                      className="btn-primary btn-sm flex items-center gap-1.5"
                    >
                      <UserCheck size={13} /> Approve → Convert to Member
                    </button>
                    <button
                      onClick={() => setDeclineId(v.id)}
                      className="btn btn-sm flex items-center gap-1.5 bg-white text-danger border border-danger hover:bg-danger/5"
                      style={{ height: 36, padding: '0 14px', fontSize: 13, borderRadius: 8 }}
                    >
                      <UserX size={13} /> Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <UserCheck size={32} className="text-secondary mb-3" />
            <p className="text-sm text-secondary">No visitors in this view</p>
          </div>
        )}
      </div>

      {/* Approve Confirmation */}
      {confirmId && confirmVisitor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-modal w-full max-w-sm">
            <div className="p-6">
              <div className="w-12 h-12 rounded-card bg-teal/10 flex items-center justify-center mb-4">
                <UserCheck size={20} className="text-teal" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">Convert to Member?</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Convert <strong>{confirmVisitor.name}</strong> to a full member of Andheri Chapter?
                An OTP invite will be sent to their mobile number.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setConfirmId(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={doApprove} className="btn-primary flex-1">Confirm & Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation */}
      {declineId && declineVisitor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-modal w-full max-w-sm">
            <div className="p-6">
              <div className="w-12 h-12 rounded-card bg-danger/10 flex items-center justify-center mb-4">
                <UserX size={20} className="text-danger" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">Decline Visitor?</h3>
              <p className="text-sm text-secondary">
                <strong>{declineVisitor.name}</strong> will be notified that their visit request was not approved.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setDeclineId(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={doDecline}
                className="btn flex-1 bg-white text-danger border-2 border-danger hover:bg-danger/5 active:scale-95"
                style={{ height: 44, borderRadius: 8, fontSize: 14, fontWeight: 500 }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile View */}
      {profileId && profileVisitor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-modal w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold text-primary">Visitor Profile</h3>
              <button onClick={() => setProfileId(null)} className="p-1.5 rounded-button hover:bg-surface text-secondary">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-navy">{initials(profileVisitor.name)}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-primary">{profileVisitor.name}</p>
                  <p className="text-sm text-secondary">{profileVisitor.business}</p>
                  <p className="text-2xs text-secondary">{profileVisitor.category}</p>
                </div>
              </div>
              {[
                { label: 'Phone',       value: profileVisitor.phone       },
                { label: 'Email',       value: profileVisitor.email       },
                { label: 'Referred By', value: profileVisitor.referredBy  },
                { label: 'Meeting',     value: profileVisitor.meeting     },
              ].map(row => (
                <div key={row.label} className="flex gap-3 text-sm">
                  <span className="text-secondary w-24 flex-shrink-0">{row.label}</span>
                  <span className="text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setProfileId(null)} className="btn-ghost flex-1">Close</button>
              <button
                onClick={() => { setProfileId(null); setConfirmId(profileVisitor.id) }}
                className="btn-primary flex-1"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
