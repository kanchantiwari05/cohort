import { useState, useMemo } from 'react'
import { ScrollText, Download, Shield, ShieldAlert, Info } from 'lucide-react'
import { auditLogs as seedLogs } from '../../data/auditLogs'
import FilterBar from '../../components/FilterBar'
import Pagination from '../../components/Pagination'
import SlideOver from '../../components/SlideOver'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonRow } from '../../components/Skeleton'

const LOGS_PER_PAGE = 20

const ACTION_OPTIONS = [
  { value: 'module_toggle',    label: 'Module Toggle' },
  { value: 'hierarchy_change', label: 'Hierarchy Change' },
  { value: 'la_assignment',    label: 'LA Assignment' },
  { value: 'tenant_create',    label: 'Tenant Action' },
  { value: 'plan_change',      label: 'Plan Change' },
  { value: 'domain_provision', label: 'Domain' },
  { value: 'security_event',   label: 'Security Event' },
  { value: 'login',            label: 'Login' },
  { value: 'settings_change',  label: 'Settings Change' },
]

const ROLE_OPTIONS = [
  { value: 'platform_admin',        label: 'Platform Admin' },
  { value: 'community_super_admin', label: 'CSA' },
  { value: 'level_admin',           label: 'Level Admin' },
]

const SEVERITY_OPTIONS = [
  { value: 'info',     label: 'Info' },
  { value: 'warning',  label: 'Warning' },
  { value: 'critical', label: 'Critical' },
]

const SEVERITY_META = {
  info:     { cls: 'badge-gray',   icon: Info,        label: 'Info' },
  warning:  { cls: 'badge-warning', icon: ShieldAlert, label: 'Warning' },
  critical: { cls: 'badge-danger',  icon: Shield,      label: 'Critical' },
}

const ROLE_META = {
  platform_admin:        { cls: 'badge-teal',    label: 'Platform Admin' },
  community_super_admin: { cls: 'badge-navy',    label: 'CSA' },
  level_admin:           { cls: 'badge-gray',    label: 'Level Admin' },
  system:                { cls: 'badge-warning', label: 'System' },
}

function fmtTs(ts) {
  const d = new Date(ts)
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

function SeverityBadge({ severity }) {
  const m = SEVERITY_META[severity] ?? SEVERITY_META.info
  return <span className={`badge ${m.cls} inline-flex items-center gap-1`}>{m.label}</span>
}

function RoleBadge({ role }) {
  const m = ROLE_META[role] ?? ROLE_META.system
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

function JsonDiff({ before, after }) {
  if (!before && !after) return <p className="text-secondary text-xs italic">No state diff available</p>
  return (
    <div className="space-y-2">
      {before && (
        <div>
          <p className="text-[11px] font-semibold text-danger mb-1 uppercase tracking-wide">Before</p>
          <pre className="text-xs bg-red-50 border border-red-100 rounded p-2 overflow-x-auto text-red-800 leading-relaxed">
            {JSON.stringify(before, null, 2)}
          </pre>
        </div>
      )}
      {after && (
        <div>
          <p className="text-[11px] font-semibold text-success mb-1 uppercase tracking-wide">After</p>
          <pre className="text-xs bg-green-50 border border-green-100 rounded p-2 overflow-x-auto text-green-800 leading-relaxed">
            {JSON.stringify(after, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function LogDetailSlideOver({ log, onClose }) {
  return (
    <SlideOver open={!!log} onClose={onClose} title="Log Detail" width={480}>
      {log && (
        <div className="p-5 space-y-5">
          {/* Action header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-primary">{log.actionLabel}</p>
              <p className="text-sm text-secondary mt-0.5">{log.entity}</p>
            </div>
            <SeverityBadge severity={log.severity} />
          </div>

          {/* Meta grid */}
          <div className="bg-surface border border-border rounded-card divide-y divide-border">
            {[
              { label: 'Timestamp',   value: fmtTs(log.timestamp) },
              { label: 'Actor',       value: log.actor === 'System' ? 'System (automated)' : log.actor },
              { label: 'Role',        value: <RoleBadge role={log.actorRole} /> },
              { label: 'IP Address',  value: log.ip },
              { label: 'Request ID',  value: <span className="font-mono text-xs">{log.requestId}</span> },
              { label: 'Entity Type', value: log.entityType?.replace(/_/g, ' ') },
              { label: 'Entity ID',   value: <span className="font-mono text-xs">{log.entityId}</span> },
              ...(log.tenantName ? [{ label: 'Community', value: log.tenantName }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-start gap-4 px-4 py-2.5">
                <span className="text-xs text-secondary w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-sm text-primary font-medium flex-1 min-w-0 break-words">{row.value}</span>
              </div>
            ))}
          </div>

          {/* User agent */}
          <div>
            <p className="text-[11px] font-semibold text-secondary uppercase tracking-wide mb-1.5">User Agent</p>
            <p className="text-xs text-secondary font-mono bg-surface border border-border rounded p-2 break-all leading-relaxed">
              {log.userAgent}
            </p>
          </div>

          {/* State diff */}
          <div>
            <p className="text-[11px] font-semibold text-secondary uppercase tracking-wide mb-2">State Change</p>
            <JsonDiff before={log.before} after={log.after} />
          </div>
        </div>
      )}
    </SlideOver>
  )
}

export default function AuditLogsPage() {
  const loading = useLoading(200)

  const [search,     setSearch]     = useState('')
  const [actionFilter, setActionFilter] = useState([])
  const [roleFilter,   setRoleFilter]   = useState([])
  const [severityFilter, setSeverityFilter] = useState([])
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return seedLogs.filter(log => {
      const matchSearch = !q ||
        log.actor.toLowerCase().includes(q) ||
        log.actionLabel.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        (log.tenantName?.toLowerCase().includes(q))
      const matchAction   = actionFilter.length === 0 || actionFilter.includes(log.action)
      const matchRole     = roleFilter.length === 0   || roleFilter.includes(log.actorRole)
      const matchSeverity = severityFilter.length === 0 || severityFilter.includes(log.severity)
      return matchSearch && matchAction && matchRole && matchSeverity
    })
  }, [search, actionFilter, roleFilter, severityFilter])

  const paged = filtered.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE)

  const criticalCount = seedLogs.filter(l => l.severity === 'critical').length
  const warningCount  = seedLogs.filter(l => l.severity === 'warning').length

  const handleExport = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Severity', 'IP', 'Request ID', 'Community']
    const rows = filtered.map(l => [
      fmtTs(l.timestamp), l.actor, l.actorRole, l.actionLabel,
      l.entity, l.severity, l.ip, l.requestId, l.tenantName ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="p-3 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Audit Logs</h1>
          <p className="text-secondary text-sm mt-0.5">
            Immutable record of all admin actions · Retained 12 months
          </p>
        </div>
        <button onClick={handleExport} className="btn-ghost btn flex-shrink-0">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setSeverityFilter([]); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${severityFilter.length === 0
              ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
              : 'bg-white text-secondary border-border hover:border-[#1B3A6B]/40'}`}
        >
          All  <span className="ml-1 opacity-70">{seedLogs.length}</span>
        </button>
        <button
          onClick={() => { setSeverityFilter(['critical']); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${severityFilter.length === 1 && severityFilter[0] === 'critical'
              ? 'bg-danger text-white border-danger'
              : 'bg-white text-danger border-danger/30 hover:border-danger'}`}
        >
          Critical  <span className="ml-1 opacity-70">{criticalCount}</span>
        </button>
        <button
          onClick={() => { setSeverityFilter(['warning']); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${severityFilter.length === 1 && severityFilter[0] === 'warning'
              ? 'bg-amber text-white border-amber'
              : 'bg-white text-amber-dark border-amber/30 hover:border-amber'}`}
        >
          Warning  <span className="ml-1 opacity-70">{warningCount}</span>
        </button>
        <button
          onClick={() => { setSeverityFilter(['info']); setPage(1) }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${severityFilter.length === 1 && severityFilter[0] === 'info'
              ? 'bg-[#546E7A] text-white border-[#546E7A]'
              : 'bg-white text-secondary border-border hover:border-[#546E7A]/40'}`}
        >
          Info  <span className="ml-1 opacity-70">{seedLogs.length - criticalCount - warningCount}</span>
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="Search actor, action, entity…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <FilterBar
          filters={[
            {
              key: 'action',
              label: 'Action Type',
              value: actionFilter,
              onChange: v => { setActionFilter(v); setPage(1) },
              multi: true,
              options: ACTION_OPTIONS,
            },
            {
              key: 'role',
              label: 'Actor Role',
              value: roleFilter,
              onChange: v => { setRoleFilter(v); setPage(1) },
              multi: true,
              options: ROLE_OPTIONS,
            },
            {
              key: 'severity',
              label: 'Severity',
              value: severityFilter,
              onChange: v => { setSeverityFilter(v); setPage(1) },
              multi: true,
              options: SEVERITY_OPTIONS,
            },
          ]}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText size={15} className="text-secondary" />
            <h2 className="text-sm font-semibold text-primary">Log Entries</h2>
          </div>
          <span className="text-xs text-secondary">
            {filtered.length} of {seedLogs.length} entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left whitespace-nowrap">Timestamp</th>
                <th className="th text-left">Actor</th>
                <th className="th text-left">Action</th>
                <th className="th text-left">Entity</th>
                <th className="th text-center">Severity</th>
                <th className="th text-left">IP Address</th>
                <th className="th text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td text-center text-secondary py-12">
                    No log entries match your filters.
                  </td>
                </tr>
              ) : (
                paged.map(log => (
                  <tr key={log.id} className="tr">
                    <td className="td px-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-secondary">{fmtTs(log.timestamp)}</span>
                    </td>
                    <td className="td px-4">
                      <p className="text-sm font-medium text-primary">{log.actor}</p>
                      <RoleBadge role={log.actorRole} />
                    </td>
                    <td className="td px-4">
                      <p className="text-sm text-primary">{log.actionLabel}</p>
                    </td>
                    <td className="td px-4">
                      <p className="text-sm text-primary truncate max-w-[180px]" title={log.entity}>
                        {log.entity}
                      </p>
                      {log.tenantName && (
                        <p className="text-xs text-secondary mt-0.5">{log.tenantName}</p>
                      )}
                    </td>
                    <td className="td px-4 text-center">
                      <SeverityBadge severity={log.severity} />
                    </td>
                    <td className="td px-4">
                      <span className="text-xs font-mono text-secondary">{log.ip}</span>
                    </td>
                    <td className="td px-4 text-center">
                      <button
                        onClick={() => setSelected(log)}
                        className="text-xs font-medium text-teal hover:text-teal/70 transition-colors px-2 py-1 rounded hover:bg-teal/8"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > LOGS_PER_PAGE && (
        <Pagination page={page} total={filtered.length} perPage={LOGS_PER_PAGE} onChange={setPage} />
      )}

      <LogDetailSlideOver log={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
