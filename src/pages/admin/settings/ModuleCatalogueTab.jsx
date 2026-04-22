import { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Pencil, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import useMasterSettingsStore from '../../../store/masterSettingsStore'
import ModuleIcon from '../../../lib/moduleIcons'

const PRESET_COLORS = ['#028090', '#1B3A6B', '#1565C0', '#6A1B9A', '#BF360C', '#C17900', '#2E7D32', '#546E7A']

const ICON_OPTIONS = [
  'users', 'calendar', 'clipboard-check', 'star', 'trending-up',
  'message-circle', 'bar-chart-2', 'layout', 'network', 'zap',
  'headphones', 'briefcase', 'book-open', 'building', 'monitor',
  'globe', 'heart', 'award', 'home', 'map-pin',
]

export default function ModuleCatalogueTab() {
  const modules = useMasterSettingsStore(s => s.modules)
  const plans = useMasterSettingsStore(s => s.plans)
  const reorderModules = useMasterSettingsStore(s => s.reorderModules)
  const updateModule = useMasterSettingsStore(s => s.updateModule)

  const [drawerModule, setDrawerModule] = useState(null)

  const sorted = useMemo(() => [...modules].sort((a, b) => a.sortOrder - b.sortOrder), [modules])

  const planIncludes = (plan, modId) =>
    plan.allowedModuleIds === 'all' || plan.allowedModuleIds.includes(modId)

  const activePlans = plans.filter(p => p.isActive)

  const onDragEnd = result => {
    if (!result.destination) return
    const items = Array.from(sorted)
    const [removed] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, removed)
    reorderModules(items)
    toast.success('Order updated')
  }

  const saveEdit = draft => {
    updateModule(draft.id, {
      name: draft.name,
      shortName: (draft.shortName || '').slice(0, 20),
      description: (draft.description || '').slice(0, 200),
      color: draft.color,
      icon: draft.icon,
    })
    toast.success(`${draft.name} saved ✓`)
    setDrawerModule(null)
  }

  const alwaysOnN = sorted.filter(m => m.alwaysOn).length

  return (
    <div className="p-3 space-y-3 max-w-5xl">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#1B3A6B]">Module Catalogue</h2>
          <p className="text-[12px] text-[#90A4AE] mt-0.5">
            Platform defaults — applies to all new tenants
          </p>
          <p className="text-[11px] text-[#90A4AE] mt-0.5">
            {sorted.length} modules · {alwaysOnN} always on · {sorted.length - alwaysOnN} enableable · Drag rows to reorder
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-[#90CAF9] bg-[#E3F2FD]/60 px-3 py-2 text-[12px] text-[#1565C0]">
        ℹ Module IDs are fixed. Customize display names, icons, and descriptions. Always On modules cannot be plan-restricted.
      </div>

      {/* Compact table */}
      <div className="rounded-[10px] border border-[#D0DCF0] bg-white shadow-[0_2px_8px_rgba(27,58,107,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-[#F4F8FF] border-b border-[#D0DCF0]">
                  <th className="w-8 px-2 py-2.5" />
                  <th className="w-7 px-2 py-2.5" />
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Module</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A] hidden md:table-cell">Description</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Plans</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Type</th>
                  <th className="px-2 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Edit</th>
                </tr>
              </thead>
              <Droppable droppableId="modules">
                {provided => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    {sorted.map((m, idx) => (
                      <Draggable key={m.id} draggableId={m.id} index={idx}>
                        {(p, snap) => (
                          <tr
                            ref={p.innerRef}
                            {...p.draggableProps}
                            className={`border-b border-[#D0DCF0]/70 transition-colors
                              ${snap.isDragging ? 'bg-[#E3F2FD] shadow-md' : 'hover:bg-[#FAFCFF]'}
                            `}
                          >
                            {/* Drag handle */}
                            <td className="px-2 py-2.5 align-middle w-8">
                              <button
                                type="button"
                                {...p.dragHandleProps}
                                className="text-[#C0CDD9] hover:text-[#546E7A] flex items-center justify-center"
                                aria-label="Drag to reorder"
                              >
                                <GripVertical size={15} />
                              </button>
                            </td>

                            {/* Color + icon */}
                            <td className="px-1 py-2.5 align-middle w-7">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{ background: `${m.color}20` }}
                              >
                                <ModuleIcon name={m.icon} size={13} style={{ color: m.color }} />
                              </div>
                            </td>

                            {/* Name + ID */}
                            <td className="px-3 py-2.5 align-middle min-w-[140px]">
                              <p className="text-[13px] font-semibold text-[#1A237E] leading-tight">{m.name}</p>
                              <p className="text-[10px] font-mono text-[#B0BEC5] leading-tight mt-0.5">{m.id}</p>
                            </td>

                            {/* Description */}
                            <td className="px-3 py-2.5 align-middle max-w-[240px] hidden md:table-cell">
                              <p className="text-[12px] text-[#546E7A] line-clamp-2 leading-snug">
                                {m.description || <span className="text-[#B0BEC5] italic">No description</span>}
                              </p>
                            </td>

                            {/* Plan badges */}
                            <td className="px-3 py-2.5 align-middle">
                              <div className="flex flex-wrap gap-1">
                                {activePlans.map(pl => {
                                  const on = planIncludes(pl, m.id)
                                  return (
                                    <span
                                      key={pl.id}
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        on
                                          ? 'bg-[#E0F2F1] text-[#028090]'
                                          : 'bg-[#F5F5F5] text-[#BDBDBD]'
                                      }`}
                                    >
                                      {pl.name.split(' ')[0]}
                                    </span>
                                  )
                                })}
                              </div>
                            </td>

                            {/* Always-on badge */}
                            <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                              {m.alwaysOn ? (
                                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                                  Always On
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E0F7FA] text-[#028090]">
                                  Enableable
                                </span>
                              )}
                            </td>

                            {/* Edit */}
                            <td className="px-2 py-2.5 align-middle text-right">
                              <button
                                type="button"
                                onClick={() => setDrawerModule({ ...m })}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#028090] border border-[#D0DCF0] hover:bg-[#E0F7FA] transition-colors"
                              >
                                <Pencil size={11} /> Edit
                              </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>
      </div>

      {/* Edit drawer */}
      {drawerModule && (
        <ModuleEditDrawer
          key={drawerModule.id}
          initial={drawerModule}
          onClose={() => setDrawerModule(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  )
}

function ModuleEditDrawer({ initial, onClose, onSave }) {
  const [draft, setDraft] = useState({ ...initial })
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }))

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(27,58,107,0.4)] cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className="absolute top-0 right-0 flex h-full w-full max-w-[400px] flex-col bg-white shadow-[-8px_0_32px_rgba(27,58,107,0.12)] border-l border-[#D0DCF0] z-[61]"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#D0DCF0] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${draft.color}22` }}
            >
              <ModuleIcon name={draft.icon} size={16} style={{ color: draft.color }} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1A237E] leading-tight">Edit Module</h3>
              <p className="text-[11px] text-[#90A4AE] font-mono mt-0.5">{draft.id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F4F8FF] text-[#90A4AE]">
            <X size={18} />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {initial.alwaysOn && (
            <div className="rounded-lg bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-2 text-[11.5px] text-[#2E7D32]">
              This is an Always On module — display info can be edited but it cannot be restricted per plan.
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-[12px] font-semibold text-[#1A237E]">
              Display name
              <input
                className="mt-1 w-full input rounded-[8px] text-[13px]"
                value={draft.name}
                maxLength={40}
                onChange={e => set('name', e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-semibold text-[#1A237E]">
              Short name
              <span className="text-[10px] text-[#90A4AE] font-normal ml-1">(max 20)</span>
              <input
                className="mt-1 w-full input rounded-[8px] text-[13px]"
                maxLength={20}
                value={draft.shortName || ''}
                onChange={e => set('shortName', e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-semibold text-[#1A237E]">
              Description
              <span className="text-[10px] text-[#90A4AE] font-normal ml-1">(max 200)</span>
              <textarea
                className="mt-1 w-full input rounded-[8px] text-[13px] min-h-[80px] resize-none"
                maxLength={200}
                value={draft.description || ''}
                onChange={e => set('description', e.target.value)}
              />
              <span className="text-[10.5px] text-[#90A4AE]">{(draft.description || '').length}/200</span>
            </label>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-[12px] font-semibold text-[#1A237E] mb-2">Accent color</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    draft.color === c ? 'border-[#1B3A6B] scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <p className="text-[12px] font-semibold text-[#1A237E] mb-2">Icon</p>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set('icon', ic)}
                  className={`w-full aspect-square rounded-lg border flex items-center justify-center transition-colors ${
                    draft.icon === ic
                      ? 'border-[#028090] bg-[#E0F7FA]'
                      : 'border-[#E8EDF5] hover:border-[#028090]/40 hover:bg-[#F4F8FF]'
                  }`}
                  title={ic}
                >
                  <ModuleIcon name={ic} size={15} style={{ color: draft.icon === ic ? draft.color : '#90A4AE' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-[#D0DCF0] bg-[#F8FAFF] p-3">
            <p className="text-[10.5px] text-[#90A4AE] mb-2 font-medium uppercase tracking-wide">Preview</p>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${draft.color}20` }}
              >
                <ModuleIcon name={draft.icon} size={18} style={{ color: draft.color }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1A237E]">{draft.name || 'Module name'}</p>
                <p className="text-[11px] text-[#90A4AE]">{draft.shortName || draft.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[#D0DCF0] bg-[#FAFBFF] flex-shrink-0">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#028090] text-white text-[13px] font-semibold hover:bg-[#026a76] transition-colors"
          >
            <Check size={14} /> Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
