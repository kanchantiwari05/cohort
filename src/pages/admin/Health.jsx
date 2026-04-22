import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, Bell, BellOff, Sliders, ChevronRight } from 'lucide-react'
import { apiResponseTimeData, otpDeliveryData, systemServices, tenants } from '../../data/platform'
import { useLoading } from '../../hooks/useLoading'
import { SkeletonRow } from '../../components/Skeleton'

// ── Pulsing dot ───────────────────────────────────────────────────────────────
function PulsingDot({ color = 'bg-success' }) {
  return (
    <span className="relative flex-shrink-0" style={{ width: 10, height: 10 }}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${color}`} />
      <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${color}`} />
    </span>
  )
}

// ── Health badge ──────────────────────────────────────────────────────────────
function HealthBadge({ score }) {
  if (score >= 90) return <span className="badge badge-success">● Healthy</span>
  if (score >= 60) return <span className="badge badge-warning">⚠ Warning</span>
  return <span className="badge badge-danger">✕ Critical</span>
}

// ── Service card ──────────────────────────────────────────────────────────────
function ServiceCard({ svc, lastCheckedSec }) {
  const isOnline     = svc.status === 'online'
  const isInProgress = svc.status === 'in_progress'
  return (
    <div className="card p-5 flex items-center gap-4">
      <PulsingDot color={isOnline ? 'bg-success' : isInProgress ? 'bg-amber' : 'bg-danger'} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary">{svc.name}</p>
        <p className="text-xs text-secondary mt-0.5">
          {isOnline ? 'Operational' : isInProgress ? 'In Progress' : 'Down'} · {svc.latency}
        </p>
        <p className="text-2xs text-secondary/60 mt-1">Last checked {lastCheckedSec}s ago</p>
      </div>
      <span className={`badge ${isOnline ? 'badge-success' : isInProgress ? 'badge-warning' : 'badge-danger'}`}>
        {isOnline ? 'Online' : isInProgress ? 'In Progress' : 'Offline'}
      </span>
    </div>
  )
}

// ── Custom tooltips ───────────────────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const ms = payload[0].value
  return (
    <div className="card py-1.5 px-3 shadow-modal text-xs">
      <p className="text-secondary">{label}</p>
      <p className={`font-semibold mt-0.5 ${ms > 500 ? 'text-danger' : ms > 300 ? 'text-warning' : 'text-success'}`}>
        {ms} ms
      </p>
    </div>
  )
}
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card py-1.5 px-3 shadow-modal text-xs">
      <p className="text-secondary">{label}</p>
      <p className="font-semibold text-teal mt-0.5">{payload[0].value}%</p>
    </div>
  )
}

// ── Uptime counter ────────────────────────────────────────────────────────────
function UptimeCounter() {
  const [sec, setSec] = useState(30)
  useEffect(() => {
    const t = setInterval(() => setSec(s => s >= 60 ? 0 : s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-1.5 text-success text-xs">
      <RefreshCw size={11} className={sec % 5 === 0 ? 'animate-spin' : ''} />
      Updated {sec}s ago
    </div>
  )
}

// ── Alert Rules ───────────────────────────────────────────────────────────────

const DEFAULT_RULES = [
  {
    id:        'otp',
    label:     'OTP Delivery Rate',
    desc:      'Alert when OTP delivery drops below threshold',
    metric:    'otp_delivery',
    threshold: 90,
    unit:      '%',
    enabled:   true,
    lastFired: '2026-04-12',
  },
  {
    id:        'error',
    label:     'Tenant Error Rate',
    desc:      'Alert when any tenant error rate exceeds threshold',
    metric:    'error_rate',
    threshold: 1,
    unit:      '%',
    enabled:   true,
    lastFired: null,
  },
  {
    id:        'health',
    label:     'Tenant Health Score',
    desc:      'Alert when any tenant health score drops below threshold',
    metric:    'health_score',
    threshold: 60,
    unit:      'pts',
    enabled:   false,
    lastFired: '2026-03-28',
  },
]

function AlertRules() {
  const [rules,    setRules]    = useState(DEFAULT_RULES)
  const [editing,  setEditing]  = useState(null)   // rule id being edited
  const [draftVal, setDraftVal] = useState('')

  const toggleRule = id =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))

  const startEdit = (id, current) => {
    setEditing(id)
    setDraftVal(String(current))
  }

  const saveEdit = id => {
    const val = parseFloat(draftVal)
    if (!isNaN(val) && val > 0) {
      setRules(prev => prev.map(r => r.id === id ? { ...r, threshold: val } : r))
    }
    setEditing(null)
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-teal" />
          <h2 className="text-base font-semibold text-primary">Alert Rules</h2>
        </div>
        <span className="text-xs text-secondary">
          {rules.filter(r => r.enabled).length} of {rules.length} active
        </span>
      </div>

      <div className="divide-y divide-border">
        {rules.map(rule => (
          <div key={rule.id} className={`px-6 py-4 flex items-center gap-4 transition-colors
            ${rule.enabled ? '' : 'opacity-50'}`}>

            {/* Toggle */}
            <button
              onClick={() => toggleRule(rule.id)}
              title={rule.enabled ? 'Disable alert' : 'Enable alert'}
              className={`w-8 h-8 rounded-button flex items-center justify-center flex-shrink-0 transition-colors border
                ${rule.enabled
                  ? 'bg-teal/10 border-teal/30 text-teal hover:bg-teal/20'
                  : 'bg-surface border-border text-secondary hover:bg-surface/80'}`}
            >
              {rule.enabled ? <Bell size={14} /> : <BellOff size={14} />}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary">{rule.label}</p>
              <p className="text-xs text-secondary mt-0.5">{rule.desc}</p>
              {rule.lastFired && (
                <p className="text-xs text-secondary mt-1">
                  Last triggered: {new Date(rule.lastFired).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Threshold */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Sliders size={12} className="text-secondary" />
              {editing === rule.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    type="number"
                    className="input text-sm font-semibold text-center"
                    style={{ width: 72, height: 32, padding: '0 8px' }}
                    value={draftVal}
                    onChange={e => setDraftVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(rule.id); if (e.key === 'Escape') setEditing(null) }}
                  />
                  <span className="text-xs text-secondary">{rule.unit}</span>
                  <button onClick={() => saveEdit(rule.id)} className="btn-primary btn btn-sm px-2 py-1 text-xs">Save</button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(rule.id, rule.threshold)}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-teal transition-colors"
                  title="Click to edit threshold"
                >
                  {rule.threshold}{rule.unit}
                  <AlertTriangle size={11} className="text-amber opacity-70" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Incident history ──────────────────────────────────────────────────────────
const INCIDENTS = [
  { id: 1, date: '2026-04-06', duration: '14 min', service: 'OTP Gateway',   summary: 'High latency spike — Jio carrier delays resolved automatically', severity: 'warning' },
  { id: 2, date: '2026-03-22', duration: '3 min',  service: 'API Gateway',   summary: 'Brief 502 errors on /auth endpoint, auto-recovered', severity: 'warning' },
  { id: 3, date: '2026-03-10', duration: '41 min', service: 'Database',      summary: 'Primary DB failover — standby promoted, full recovery', severity: 'danger'  },
  { id: 4, date: '2026-02-28', duration: '7 min',  service: 'CDN',           summary: 'Edge cache purge caused elevated miss rate in Mumbai region', severity: 'warning' },
  { id: 5, date: '2026-02-14', duration: '22 min', service: 'OTP Gateway',   summary: 'TRAI regulation change required SMS template re-approval', severity: 'danger'  },
]

function IncidentHistory() {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Clock size={15} className="text-secondary" />
        <h2 className="text-base font-semibold text-primary">Incident History</h2>
        <span className="text-xs text-secondary ml-auto">Last 5 incidents</span>
      </div>
      <div className="divide-y divide-border">
        {INCIDENTS.map(inc => (
          <div key={inc.id} className="px-6 py-3.5 flex items-start gap-4">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${inc.severity === 'danger' ? 'bg-danger' : 'bg-amber'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-primary">{inc.service}</p>
                <span className={`badge text-2xs ${inc.severity === 'danger' ? 'badge-danger' : 'badge-warning'}`}>
                  {inc.duration}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed">{inc.summary}</p>
            </div>
            <span className="text-2xs text-secondary/60 flex-shrink-0 mt-0.5">
              {new Date(inc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HealthPage() {
  const loading = useLoading(220)
  const [sec, setSec] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSec(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Only show every 4th data point on x-axis for readability
  const lineData = apiResponseTimeData

  const tenantHealth = tenants.map(t => ({
    name:        t.name,
    active:      t.activeThisMonth,
    errorRate:   t.errorRate,
    storage:     t.storage,
    healthScore: t.healthScore,
  }))

  const allOk = systemServices.every(s => s.status === 'online' || s.status === 'in_progress')

  return (
    <div className="p-3 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <Link to="/admin/dashboard" className="hover:text-teal transition-colors">Dashboard</Link>
        <ChevronRight size={11} />
        <span className="text-primary font-medium">Health Monitor</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Health Monitor</h1>
          <p className="text-secondary text-sm mt-0.5">Real-time platform status</p>
        </div>
        <UptimeCounter />
      </div>

      {/* System status banner */}
      <div className={`rounded-card px-6 py-4 flex items-center gap-3
        ${allOk ? 'bg-success/8 border border-success/20' : 'bg-danger/8 border border-danger/20'}`}>
        <CheckCircle2 size={20} className={allOk ? 'text-success' : 'text-danger'} />
        <div>
          <p className={`font-semibold text-base ${allOk ? 'text-success' : 'text-danger'}`}>
            {allOk ? 'All Systems Operational' : 'Service Disruption Detected'}
          </p>
          <p className="text-secondary text-xs mt-0.5">99.8% uptime in the last 30 days</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-secondary">
          <Clock size={12} />
          Last incident: {Math.round((Date.now() - new Date(INCIDENTS[0].date).getTime()) / 86_400_000)} days ago
        </div>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {systemServices.map(svc => <ServiceCard key={svc.name} svc={svc} lastCheckedSec={sec} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API response time */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">API Response Time</h2>
            <span className="text-xs text-secondary">Last 24 hours</span>
          </div>
          {loading ? (
            <div className="h-52 bg-gray-50 rounded-button animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D0DCF0" vertical={false} />
                <XAxis
                  dataKey="h"
                  tick={{ fontSize: 10, fill: '#546E7A' }}
                  axisLine={false} tickLine={false}
                  interval={5}
                />
                <YAxis
                  domain={[0, 1000]}
                  tick={{ fontSize: 10, fill: '#546E7A' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}ms`}
                  width={45}
                />
                <ReferenceLine y={500} stroke="#BF360C" strokeDasharray="4 2" strokeWidth={1} />
                <Tooltip content={<LineTooltip />} />
                <Line
                  type="monotone" dataKey="ms" stroke="#028090"
                  strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: '#028090' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="text-2xs text-secondary mt-2">Red line = 500ms threshold · Spike at 14:00 resolved automatically</p>
        </div>

        {/* OTP delivery */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">OTP Delivery Rate</h2>
            <span className="text-xs text-secondary">By carrier</span>
          </div>
          {loading ? (
            <div className="h-52 bg-gray-50 rounded-button animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={otpDeliveryData} layout="vertical" barCategoryGap="30%">
                <XAxis
                  type="number" domain={[90, 100]}
                  tick={{ fontSize: 10, fill: '#546E7A' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis
                  type="category" dataKey="carrier"
                  tick={{ fontSize: 12, fill: '#546E7A' }} axisLine={false} tickLine={false}
                  width={45}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(2,128,144,0.06)' }} />
                <Bar dataKey="rate" fill="#028090" radius={[0, 4, 4, 0]}>
                  {otpDeliveryData.map((d, i) => (
                    <Cell key={i}
                      fill={d.rate >= 99 ? '#2E7D32' : d.rate >= 97 ? '#028090' : '#C17900'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alert Rules */}
      <AlertRules />

      {/* Incident History */}
      <IncidentHistory />

      {/* Tenant health table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-primary">Tenant Health</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="th text-left">Tenant</th>
                <th className="th text-right">Active Users</th>
                <th className="th text-right">Error Rate</th>
                <th className="th text-right">Storage</th>
                <th className="th text-center">Health Score</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : tenantHealth.map(t => (
                  <tr key={t.name} className="tr">
                    <td className="td px-4 font-medium">{t.name}</td>
                    <td className="td px-4 text-right">{t.active || '—'}</td>
                    <td className="td px-4 text-right">
                      <span className={t.errorRate === 'N/A' ? 'text-secondary' : parseFloat(t.errorRate) > 0.05 ? 'text-warning' : 'text-success'}>
                        {t.errorRate}
                      </span>
                    </td>
                    <td className="td px-4 text-right text-secondary">{t.storage}</td>
                    <td className="td px-4 text-center">
                      <HealthBadge score={t.healthScore} />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
