import { Users, UserCheck, Star, Calendar } from 'lucide-react'
import { members, meetings, referrals } from '../../data'
import useAuthStore from '../../store/authStore'

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

export default function LADashboard() {
  const { user } = useAuthStore()
  // Level admin is scoped to chapter c1
  const myMembers  = members.filter(m => m.chapter === 'c1')
  const myMeetings = meetings.filter(m => m.chapterId === 'c1')
  const lastMeeting = myMeetings.find(m => m.status === 'completed')
  const myReferrals = referrals.filter(r =>
    myMembers.some(m => m.id === r.fromMemberId)
  )
  const totalRefValue = myReferrals.reduce((s, r) => s + r.value, 0)
  const avgAttendance = myMembers.length > 0
    ? Math.round(myMembers.reduce((s, m) => s + m.attendance, 0) / myMembers.length)
    : 0

  return (
    <div className="p-3">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-textPrimary">Chapter Dashboard</h1>
        <p className="text-textSecondary text-sm mt-1">Andheri Chapter — {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}     label="My Members"      value={myMembers.length}  sub={`${myMembers.filter(m=>m.status==='active').length} active`} iconBg="bg-action/10 text-action" />
        <StatCard icon={UserCheck} label="Avg Attendance"  value={`${avgAttendance}%`} sub="this month"                                                 iconBg="bg-success/10 text-success" />
        <StatCard icon={Star}      label="Referrals"       value={myReferrals.length} sub={`₹${(totalRefValue/1000).toFixed(0)}K value`}                iconBg="bg-accent/10 text-accent" />
        <StatCard icon={Calendar}  label="Last Meeting"    value={lastMeeting ? `${lastMeeting.attendees}/${lastMeeting.total}` : '--'} sub="attendance" iconBg="bg-primary/10 text-primary" />
      </div>

      {/* Members table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-textPrimary">Chapter Members</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="table-header text-left px-6 py-3">Name</th>
              <th className="table-header text-left px-6 py-3">Business</th>
              <th className="table-header text-left px-6 py-3">Status</th>
              <th className="table-header text-right px-6 py-3">Attendance</th>
              <th className="table-header text-right px-6 py-3">Referrals</th>
            </tr>
          </thead>
          <tbody>
            {myMembers.map(m => (
              <tr key={m.id} className="table-row">
                <td className="table-cell px-6 font-medium">{m.name}</td>
                <td className="table-cell px-6 text-textSecondary">{m.business}</td>
                <td className="table-cell px-6">
                  <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="table-cell px-6 text-right">{m.attendance}%</td>
                <td className="table-cell px-6 text-right">{m.referralsGiven}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
