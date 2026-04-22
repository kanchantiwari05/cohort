import { Users, Star, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { members, referrals, meetings, events } from '../../data'
import { format } from 'date-fns'

const StatCard = ({ icon: Icon, label, value, sub, iconBg }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-10 h-10 rounded-button flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-textSecondary font-medium">{label}</p>
      <p className="text-[22px] font-semibold text-textPrimary mt-0.5">{value}</p>
      {sub && <p className="text-xs text-textSecondary mt-0.5">{sub}</p>}
    </div>
  </div>
)

const refStatusIcon = { closed: <CheckCircle size={14} className="text-success" />, open: <Clock size={14} className="text-warning" />, pending: <XCircle size={14} className="text-textSecondary" /> }

export default function CSADashboard() {
  const activeMembers = members.filter(m => m.status === 'active').length
  const totalRefValue = referrals.reduce((s, r) => s + r.value, 0)
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled').length
  const upcomingEvents   = events.filter(e => e.status === 'open').length

  return (
    <div className="p-3">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-textPrimary">Community Dashboard</h1>
        <p className="text-textSecondary text-sm mt-1">BNI Mumbai Metro — April 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}      label="Active Members"   value={activeMembers}  sub={`of ${members.length} total`}     iconBg="bg-action/10 text-action" />
        <StatCard icon={Star}       label="Referral Value"   value={`₹${(totalRefValue/100000).toFixed(1)}L`} sub="this month" iconBg="bg-accent/10 text-accent" />
        <StatCard icon={Calendar}   label="Upcoming Meetings" value={upcomingMeetings} sub="scheduled"                    iconBg="bg-primary/10 text-primary" />
        <StatCard icon={TrendingUp} label="Events Open"      value={upcomingEvents} sub="registrations open"              iconBg="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-textPrimary">Recent Referrals</h2>
          </div>
          <div className="divide-y divide-border">
            {referrals.slice(0, 5).map(r => {
              const from = members.find(m => m.id === r.fromMemberId)
              const to   = members.find(m => m.id === r.toMemberId)
              return (
                <div key={r.id} className="px-6 py-3 flex items-center gap-3">
                  {refStatusIcon[r.status]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-textPrimary font-medium truncate">{r.businessName}</p>
                    <p className="text-xs text-textSecondary">{from?.name} → {to?.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-textPrimary whitespace-nowrap">₹{r.value.toLocaleString('en-IN')}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-textPrimary">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-border">
            {events.filter(e => e.status === 'open').map(e => (
              <div key={e.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-bg rounded-button flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-textPrimary">{new Date(e.date).getDate()}</span>
                  <span className="text-[10px] text-textSecondary uppercase">{format(new Date(e.date), 'MMM')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-textPrimary font-medium truncate">{e.title}</p>
                  <p className="text-xs text-textSecondary">{e.venue}</p>
                </div>
                <span className="badge badge-teal whitespace-nowrap">{e.registrations}/{e.capacity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
