import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import useMasterSettingsStore from '../../../store/masterSettingsStore'
import ModuleIcon from '../../../lib/moduleIcons'

// ── FIX 22: Recommended modules tooltip ───────────────────────────────────────
const MODULE_LABELS = {
  member_management:    'Member Management',
  dashboard_analytics:  'Dashboard Analytics',
  communication_hub:    'Communication Hub',
  meeting_management:   'Meeting Management',
  attendance_management:'Attendance',
  event_management:     'Event Management',
  referral_business:    'Referral & Business',
  networking_groups:    'Networking & Groups',
  activity_feed:        'Activity Feed',
  automation:           'Automation',
  support_help:         'Support & Help',
}

function ModulesCell({ ct }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const mods = ct.recommendedModules || []

  return (
    <td className="px-3 py-2.5 align-middle">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-[12px] text-[#546E7A] hover:text-[#028090] transition-colors"
      >
        {mods.length} recommended
      </button>
      {open && anchorRef.current && createPortal(
        <div
          className="absolute z-[9999] bg-white border border-[#D0DCF0] rounded-[10px] shadow-[0_4px_16px_rgba(27,58,107,0.12)] p-3 text-xs"
          style={{
            top:  anchorRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
            left: Math.min(anchorRef.current.getBoundingClientRect().left + window.scrollX, window.innerWidth - 230),
            width: 220,
          }}
        >
          <p className="font-semibold text-[#1A237E] mb-1">Recommended for {ct.name}:</p>
          <div className="border-t border-[#D0DCF0] mb-1.5" />
          {mods.length === 0
            ? <p className="text-[#90A4AE] italic">None configured</p>
            : mods.map(id => (
                <p key={id} className="text-[#028090]">✓ {MODULE_LABELS[id] || id}</p>
              ))}
        </div>,
        document.body
      )}
    </td>
  )
}

export default function CommunityTypesTab() {
  const navigate = useNavigate()
  const communityTypes = useMasterSettingsStore(s => s.communityTypes)
  const plans = useMasterSettingsStore(s => s.plans)
  const reorderCommunityTypes = useMasterSettingsStore(s => s.reorderCommunityTypes)
  const deactivateCommunityType = useMasterSettingsStore(s => s.deactivateCommunityType)
  const updateCommunityType = useMasterSettingsStore(s => s.updateCommunityType)

  const sorted = useMemo(
    () => [...communityTypes].sort((a, b) => a.sortOrder - b.sortOrder),
    [communityTypes]
  )
  const activePlans = plans.filter(p => p.isActive)

  const [deactivateCtx, setDeactivateCtx] = useState(null)
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageCTs = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onDragEnd = result => {
    if (!result.destination) return
    const items = Array.from(sorted)
    const [r] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, r)
    reorderCommunityTypes(items)
    toast.success('Community types reordered ✓')
  }

  const handleDeactivate = ct => {
    setDeactivateCtx(ct)
  }

  const confirmDeactivate = () => {
    if (!deactivateCtx) return
    deactivateCommunityType(deactivateCtx.id)
    toast.success('Community type deactivated')
    setDeactivateCtx(null)
  }

  return (
    <div className="p-3 space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#1B3A6B]">Community Types</h2>
          <p className="text-[12px] text-[#90A4AE] mt-0.5">
            {sorted.length} types · Default hierarchy template + recommended modules per type · Drag to reorder
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/settings/community-types/new')}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[8px] bg-[#028090] text-white text-[12.5px] font-semibold hover:bg-[#026a76] transition-colors shadow-sm flex-shrink-0"
        >
          + Add Type
        </button>
      </div>

      <div className="rounded-[12px] bg-white shadow-[0_2px_8px_rgba(27,58,107,0.08)] border border-[#D0DCF0] overflow-hidden">
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F8FF] border-b border-[#D0DCF0]">
                  <th className="w-10 px-2 py-3" />
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Type</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Slug</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Examples</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Levels</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Modules</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Plan</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">Tenants</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">Status</th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#546E7A] text-right">Actions</th>
                </tr>
              </thead>
              <Droppable droppableId="community-types-table">
                {prov => (
                  <tbody ref={prov.innerRef} {...prov.droppableProps}>
                    {pageCTs.map((ct, idx) => {
                      const levels = ct.defaultHierarchyPreset?.levels || []
                      const sug = activePlans.find(p => p.slug === ct.suggestedPlanSlug)
                      return (
                        <Draggable key={ct.id} draggableId={ct.id} index={(page - 1) * PAGE_SIZE + idx}>
                          {(dp, snap) => (
                            <tr
                              ref={dp.innerRef}
                              {...dp.draggableProps}
                              className={`border-b border-[#D0DCF0]/80 ${
                                snap.isDragging ? 'bg-[#E3F2FD] shadow-md' : 'hover:bg-[#FAFCFF]/80'
                              } ${!ct.isActive ? 'bg-[#FAFAFA]/90' : ''}`}
                            >
                              <td className="px-2 py-2.5 align-middle">
                                <button
                                  type="button"
                                  className="p-1 text-[#90A4AE] hover:text-[#1B3A6B]"
                                  {...dp.dragHandleProps}
                                  aria-label="Drag to reorder"
                                >
                                  <GripVertical size={16} />
                                </button>
                              </td>
                              <td className="px-3 py-2.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${ct.color}22` }}
                                  >
                                    <ModuleIcon name={ct.icon} size={16} style={{ color: ct.color }} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-[#1A237E] truncate">{ct.name}</p>
                                    {ct.description && (
                                      <p className="text-[10px] text-[#90A4AE] line-clamp-1">{ct.description}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 align-middle">
                                <code className="text-[10px] bg-[#F4F8FF] px-1.5 py-0.5 rounded text-[#546E7A]">
                                  {ct.slug}
                                </code>
                              </td>
                              <td className="px-3 py-2.5 align-middle max-w-[140px]">
                                <p className="text-[11px] text-[#546E7A] italic line-clamp-2" title={ct.examples}>
                                  {ct.examples || '—'}
                                </p>
                              </td>
                              <td className="px-3 py-2.5 align-middle">
                                <div className="flex flex-wrap gap-1">
                                  {levels.length === 0 ? (
                                    <span className="text-[11px] text-[#90A4AE]">—</span>
                                  ) : (
                                    levels.map((lv, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                                        style={{
                                          background: (lv.color || '#546E7A') + '15',
                                          color: lv.color || '#546E7A',
                                          borderColor: (lv.color || '#546E7A') + '40',
                                        }}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: lv.color || '#546E7A' }} />
                                        {lv.name}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </td>
                              <ModulesCell ct={ct} />
                              <td className="px-3 py-2.5 align-middle text-[12px] text-[#1A237E]">
                                {sug?.name || ct.suggestedPlanSlug}
                              </td>
                              {/* FIX 23: zero-tenant label */}
                              <td className="px-3 py-2.5 align-middle text-right tabular-nums">
                                {(ct.tenantsUsing ?? 0) === 0
                                  ? <span className="text-[11px] text-[#90A4AE] italic">Not yet used</span>
                                  : <span className="text-[12px] text-[#546E7A]">{ct.tenantsUsing}</span>}
                              </td>
                              <td className="px-3 py-2.5 align-middle">
                                {ct.isActive ? (
                                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#BF360C]">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 align-middle text-right">
                                <div className="flex flex-wrap justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/admin/settings/community-types/${ct.id}/edit`)}
                                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#028090] border border-[#D0DCF0] hover:bg-[#F4F8FF]"
                                  >
                                    <Pencil size={12} /> Edit
                                  </button>
                                  {ct.isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDeactivate(ct)}
                                      className="text-[11px] font-medium text-[#BF360C] px-2 py-1"
                                    >
                                      Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateCommunityType(ct.id, { isActive: true })
                                        toast.success('Community type reactivated')
                                      }}
                                      className="text-[11px] font-medium text-[#2E7D32] px-2 py-1"
                                    >
                                      Reactivate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      )
                    })}
                    {prov.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#D0DCF0] bg-white">
          <span className="text-[12px] text-[#546E7A]">
            {sorted.length === 0
              ? 'No community types'
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium border border-[#D0DCF0] text-[#546E7A] hover:bg-[#F4F8FF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`h-7 w-7 rounded-[6px] text-[12px] font-medium border transition-colors ${
                  n === page
                    ? 'bg-[#028090] text-white border-[#028090]'
                    : 'border-[#D0DCF0] text-[#546E7A] hover:bg-[#F4F8FF]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium border border-[#D0DCF0] text-[#546E7A] hover:bg-[#F4F8FF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* FIX 24: deactivate modal with tenant-count warning */}
      {deactivateCtx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(27,58,107,0.45)]">
          <div className="bg-white rounded-[12px] max-w-md w-full p-5 shadow-[0_2px_8px_rgba(27,58,107,0.08)]">
            <h3 className="text-[16px] font-bold text-[#1A237E]">Deactivate {deactivateCtx.name}?</h3>
            {(deactivateCtx.tenantsUsing ?? 0) > 0 ? (
              <div className="mt-2 space-y-2">
                <p className="text-[13px] text-[#546E7A]">
                  This type has <strong className="text-[#1A237E]">{deactivateCtx.tenantsUsing} active tenant{deactivateCtx.tenantsUsing > 1 ? 's' : ''}</strong>. Deactivating hides this type from new tenant creation. It does <strong>not</strong> affect existing tenants — they keep this type.
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-[#546E7A] mt-2">
                This will hide it from tenant creation. No tenants are currently using this type.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeactivateCtx(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 rounded-[8px] bg-[#BF360C] text-white text-sm font-medium"
                onClick={confirmDeactivate}
              >
                Deactivate Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
