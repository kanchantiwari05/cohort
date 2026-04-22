import { TrendingUp } from 'lucide-react'

const SCORE = 87

function CircleGauge({ score, size = 140 }) {
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#028090' : score >= 60 ? '#E6A817' : '#BF360C'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#D0DCF0" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-primary">{score}</span>
        <span className="text-xs text-secondary mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

const BREAKDOWN = [
  { label: 'Attendance',     value: 92, weight: '40%' },
  { label: 'Referrals Given', value: 85, weight: '30%' },
  { label: 'Meetings',       value: 80, weight: '20%' },
  { label: 'Visitors Invited', value: 70, weight: '10%' },
]

const FUNNEL = [
  { label: 'Given',       value: 15, pct: 100, color: '#1B3A6B' },
  { label: 'Acknowledged', value: 13, pct: 87,  color: '#028090' },
  { label: 'In Progress', value: 8,  pct: 53,  color: '#E6A817' },
  { label: 'Closed Won',  value: 5,  pct: 33,  color: '#2E7D32' },
]

const MONTHLY = [
  { month: 'Jan', refs: 2 },
  { month: 'Feb', refs: 3 },
  { month: 'Mar', refs: 2 },
  { month: 'Apr', refs: 4 },
  { month: 'May', refs: 3 },
  { month: 'Jun', refs: 1 },
]

const maxRefs = Math.max(...MONTHLY.map(m => m.refs))

function scoreLabel(s) {
  if (s >= 90) return 'Outstanding'
  if (s >= 80) return 'Excellent'
  if (s >= 70) return 'Good'
  if (s >= 60) return 'Fair'
  return 'At Risk'
}

function scoreBg(s) {
  if (s >= 80) return 'text-success'
  if (s >= 60) return 'text-warning'
  return 'text-danger'
}

export default function MemberMyStats() {
  return (
    <div className="p-3">
      {/* Header */}
      <div className="px-4 pt-12 pb-5" style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0D2444 100%)' }}>
        <h1 className="text-xl font-bold text-white mb-1">My Stats</h1>
        <p className="text-white/60 text-sm">Andheri Chapter · Jun 2026</p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Engagement score */}
        <div className="rounded-[16px] border border-border bg-white p-5">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-4">Engagement Score</p>
          <div className="flex flex-col items-center">
            <CircleGauge score={SCORE} />
            <p className={`text-lg font-bold mt-3 ${scoreBg(SCORE)}`}>{scoreLabel(SCORE)}</p>
            <p className="text-xs text-secondary mt-1">Rank <strong className="text-primary">#7</strong> of 47 members in chapter</p>
          </div>

          <div className="mt-5 space-y-3">
            {BREAKDOWN.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary">{item.label} <span className="text-[10px] text-secondary/60">({item.weight})</span></span>
                  <span className="font-semibold text-primary">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.value}%`,
                      background: item.value >= 80 ? '#028090' : item.value >= 60 ? '#E6A817' : '#BF360C',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* This month summary */}
        <div className="rounded-[16px] p-5" style={{ background: '#1B3A6B' }}>
          <p className="text-white/60 text-xs uppercase tracking-wide mb-4">This Month</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Referrals Given',  value: '3'        },
              { label: 'Meetings Attended', value: '4 / 5'   },
              { label: 'Business Generated', value: '₹1.53L' },
              { label: 'Visitors Invited',  value: '1'       },
            ].map(s => (
              <div key={s.label} className="rounded-[12px] p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-white text-lg font-bold">{s.value}</p>
                <p className="text-white/60 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral funnel */}
        <div className="rounded-[16px] border border-border bg-white p-5">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-4">Referral Pipeline (YTD)</p>
          <div className="space-y-2.5">
            {FUNNEL.map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-xs text-secondary w-24 flex-shrink-0">{f.label}</span>
                <div className="flex-1 h-7 rounded-[8px] overflow-hidden bg-surface flex items-center">
                  <div
                    className="h-7 rounded-[8px] flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${f.pct}%`, background: f.color }}
                  >
                    <span className="text-[11px] font-bold text-white">{f.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
            <span className="text-secondary">Conversion Rate</span>
            <span className="font-bold text-success">33.3%</span>
          </div>
        </div>

        {/* Monthly referral sparkline */}
        <div className="rounded-[16px] border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Referrals by Month</p>
            <TrendingUp size={14} className="text-teal" />
          </div>
          <div className="flex items-end gap-2 h-16">
            {MONTHLY.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-[4px] bg-teal transition-all"
                  style={{ height: `${(m.refs / maxRefs) * 52}px`, minHeight: 4 }}
                />
                <span className="text-[9px] text-secondary">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business generated */}
        <div className="rounded-[16px] border border-border bg-white p-5">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">₹ Business Generated (YTD)</p>
          <p className="text-3xl font-bold text-primary mt-2">₹3,40,000</p>
          <p className="text-xs text-secondary mt-1">Through closed referrals — 5 deals won</p>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">Chapter Rank</span>
              <span className="font-bold text-navy">#7 of 47</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-secondary">Zone Rank</span>
              <span className="font-bold text-navy">#12 of 156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
