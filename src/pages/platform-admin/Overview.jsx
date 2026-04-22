import { Building2, Users, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
import { tenants } from '../../data'

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-action' }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-10 h-10 rounded-button flex items-center justify-center flex-shrink-0 ${color === 'text-action' ? 'bg-action/10' : color === 'text-success' ? 'bg-success/10' : color === 'text-accent' ? 'bg-accent/10' : 'bg-primary/10'}`}>
      <Icon size={20} className={color} />
    </div>
    <div>
      <p className="text-xs text-textSecondary font-medium">{label}</p>
      <p className="text-[22px] font-semibold text-textPrimary mt-0.5">{value}</p>
      {sub && <p className="text-xs text-textSecondary mt-0.5">{sub}</p>}
    </div>
  </div>
)

const planBadge = { enterprise: 'badge-blue', professional: 'badge-teal', starter: 'badge-amber' }
const statusBadge = { active: 'badge-green', trial: 'badge-amber', suspended: 'badge-red' }

export default function PAOverview() {
  const total    = tenants.length
  const active   = tenants.filter(t => t.status === 'active').length
  const members  = tenants.reduce((s, t) => s + t.memberCount, 0)

  return (
    <div className="p-3">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-textPrimary">Platform Overview</h1>
        <p className="text-textSecondary text-sm mt-1">All tenants across the CNP platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Building2} label="Total Tenants"     value={total}   sub={`${active} active`}          color="text-primary" />
        <StatCard icon={Users}     label="Total Members"     value={members}  sub="across all communities"      color="text-action"  />
        <StatCard icon={TrendingUp}label="Avg Members/Tenant"value={Math.round(members/total)} sub="per community"    color="text-success" />
        <StatCard icon={Activity}  label="Platform Health"   value="99.8%"    sub="uptime last 30 days"         color="text-accent"  />
      </div>

      {/* Tenant list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-textPrimary">Active Communities</h2>
          <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
            <ArrowUpRight size={14} /> Provision New
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="table-header text-left px-6 py-3">Community</th>
              <th className="table-header text-left px-6 py-3">Plan</th>
              <th className="table-header text-left px-6 py-3">Status</th>
              <th className="table-header text-right px-6 py-3">Members</th>
              <th className="table-header text-right px-6 py-3">Active</th>
              <th className="table-header text-left px-6 py-3">Billing</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="table-row">
                <td className="table-cell px-6 font-medium">{t.name}</td>
                <td className="table-cell px-6">
                  <span className={`badge ${planBadge[t.plan] || 'badge-gray'} capitalize`}>{t.plan}</span>
                </td>
                <td className="table-cell px-6">
                  <span className={`badge ${statusBadge[t.status] || 'badge-gray'} capitalize`}>{t.status}</span>
                </td>
                <td className="table-cell px-6 text-right">{t.memberCount}</td>
                <td className="table-cell px-6 text-right">{t.activeMembers}</td>
                <td className="table-cell px-6 text-sm text-textSecondary">{t.billingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
