import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, Network, Shield, Users } from 'lucide-react'
import { zones, chapters } from '../../data/hierarchy'
import { levelAdmins } from '../../data/members'

function getLa(adminId) {
  return levelAdmins.find(la => la.id === adminId) ?? null
}

export default function CSAHierarchyPage() {
  const [expanded, setExpanded] = useState({ z1: true, z2: true })

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-primary">Hierarchy View</h1>
          <p className="text-secondary text-sm mt-1">
            BNI Mumbai Metro community structure — configured by Platform Admin
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-navy/5 rounded-button border border-border">
          <Eye size={14} className="text-secondary" />
          <span className="text-xs font-medium text-secondary">Read Only</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Zones',    value: 2,  icon: Network, color: 'text-navy',    bg: 'bg-navy/10'    },
          { label: 'Chapters', value: 8,  icon: Shield,  color: 'text-teal',    bg: 'bg-teal/10'    },
          { label: 'Groups',   value: 24, icon: Users,   color: 'text-success', bg: 'bg-success/10' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-button flex items-center justify-center ${s.bg}`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{s.value}</p>
              <p className="text-2xs text-secondary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div className="space-y-3">
        {zones.map(zone => {
          const la            = getLa(zone.adminId)
          const zoneChapters  = chapters.filter(c => c.zoneId === zone.id)
          const isOpen        = !!expanded[zone.id]

          return (
            <div key={zone.id} className="card overflow-hidden">
              {/* Zone row */}
              <button
                onClick={() => toggle(zone.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-navy/[0.03] transition-colors text-left"
                style={{ background: 'rgba(27,58,107,0.04)' }}
              >
                <div className="w-8 h-8 rounded-button bg-navy/10 flex items-center justify-center flex-shrink-0">
                  <Network size={14} className="text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-primary">{zone.name}</p>
                    <span className="badge badge-navy text-2xs">Zone</span>
                    {la && (
                      <span className="text-2xs text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        {la.name}
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-secondary mt-0.5">
                    {zone.memberCount} members · {zone.chapterCount} chapters
                  </p>
                </div>
                {isOpen
                  ? <ChevronDown size={16} className="text-secondary flex-shrink-0" />
                  : <ChevronRight size={16} className="text-secondary flex-shrink-0" />
                }
              </button>

              {/* Chapters */}
              {isOpen && (
                <div className="divide-y divide-border/60">
                  {zoneChapters.map(ch => {
                    const chLa = getLa(ch.adminId)
                    return (
                      <div
                        key={ch.id}
                        className="flex items-center gap-3 px-5 py-3 ml-11 hover:bg-surface transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-teal/60 flex-shrink-0" />
                        <div className="w-7 h-7 rounded-button bg-teal/10 flex items-center justify-center flex-shrink-0">
                          <Shield size={12} className="text-teal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-primary">{ch.name}</p>
                            <span className="badge badge-teal text-2xs">Chapter</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-0.5">
                            <p className="text-2xs text-secondary">
                              {ch.memberCount} members · {ch.groupCount} groups
                            </p>
                            {chLa ? (
                              <span className="text-2xs text-success flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-success" />
                                {chLa.name}
                              </span>
                            ) : (
                              <span className="text-2xs text-warning flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber" />
                                No Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 p-4 bg-surface rounded-card border border-border">
        <Eye size={13} className="text-secondary mt-0.5 flex-shrink-0" />
        <p className="text-2xs text-secondary leading-relaxed">
          This hierarchy was configured by the Platform Admin. Contact Jatin Dudhat to request structural changes (zone/chapter/group additions or removals).
        </p>
      </div>
    </div>
  )
}
