import { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Pencil, Trash2, X, Check, Zap, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import useMasterSettingsStore from '../../../store/masterSettingsStore'

const TRIGGER_OPTIONS = [
  { value: '', label: 'Manual' },
  { value: 'on_tenant_created', label: 'Tenant created' },
  { value: 'on_csa_invited', label: 'CSA invited' },
  { value: 'on_build_triggered', label: 'Build triggered' },
  { value: 'on_build_approved', label: 'Build approved' },
]

const OWNER_OPTS = [
  { value: 'platform_admin', label: 'Platform Admin', short: 'PA' },
  { value: 'csa', label: 'CSA', short: 'CSA' },
  { value: 'both', label: 'Both', short: 'Both' },
]

function triggerLabel(v) {
  return TRIGGER_OPTIONS.find(t => t.value === v)?.label || 'Manual'
}

function ownerShort(v) {
  return OWNER_OPTS.find(o => o.value === v)?.short || v
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors flex-shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-[#028090]' : 'bg-[#CFD8DC]'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
  )
}

export default function ChecklistTemplateTab() {
  const checklistTemplate = useMasterSettingsStore(s => s.checklistTemplate)
  const addChecklistStep = useMasterSettingsStore(s => s.addChecklistStep)
  const updateChecklistStep = useMasterSettingsStore(s => s.updateChecklistStep)
  const deleteChecklistStep = useMasterSettingsStore(s => s.deleteChecklistStep)
  const reorderChecklistSteps = useMasterSettingsStore(s => s.reorderChecklistSteps)
  const toggleChecklistStepActive = useMasterSettingsStore(s => s.toggleChecklistStepActive)

  const sorted = useMemo(
    () => [...checklistTemplate].sort((a, b) => a.stepNumber - b.stepNumber),
    [checklistTemplate]
  )

  const activeN = sorted.filter(s => s.isActive).length
  const [modal, setModal] = useState(null)

  const onDragEnd = result => {
    if (!result.destination) return
    const items = Array.from(sorted)
    const [r] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, r)
    reorderChecklistSteps(items)
    toast.success('Steps reordered')
  }

  const saveStep = data => {
    if (modal.mode === 'add') {
      addChecklistStep(data)
      toast.success('Step added ✓')
    } else {
      updateChecklistStep(modal.step.id, data)
      toast.success('Step saved ✓')
    }
    setModal(null)
  }

  const openAdd = () =>
    setModal({
      mode: 'add',
      step: {
        label: '', description: '', owner: 'platform_admin',
        expectedDays: 1, isRequired: true, autoCompleteTrigger: '',
      },
    })

  return (
    <div className="p-3 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#1B3A6B]">Onboarding Checklist Template</h2>
          <p className="text-[12px] text-[#90A4AE] mt-0.5">
            {sorted.length} steps · {activeN} active · Applied to every new tenant · Drag to reorder
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[8px] bg-[#028090] text-white text-[12.5px] font-semibold hover:bg-[#026a76] transition-colors shadow-sm flex-shrink-0"
        >
          + Add Step
        </button>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-[#F0C040] bg-[#FFF8E1] px-3 py-2 text-[12px] text-[#C17900]">
        ⚠ Template changes apply to new tenants only — existing tenant checklists are not modified.
      </div>

      {/* Compact table */}
      <div className="rounded-[10px] border border-[#D0DCF0] bg-white shadow-[0_2px_8px_rgba(27,58,107,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="bg-[#F4F8FF] border-b border-[#D0DCF0]">
                  <th className="w-8 px-2 py-2.5" />
                  <th className="w-9 px-2 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">#</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Step</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Owner</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Day</th>
                  <th className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A] hidden sm:table-cell">Trigger</th>
                  <th className="px-3 py-2.5 text-center text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Active</th>
                  <th className="px-2 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-[#546E7A]">Actions</th>
                </tr>
              </thead>
              <Droppable droppableId="checklist">
                {prov => (
                  <tbody ref={prov.innerRef} {...prov.droppableProps}>
                    {sorted.map((step, idx) => (
                      <Draggable key={step.id} draggableId={step.id} index={idx}>
                        {(p, snap) => (
                          <tr
                            ref={p.innerRef}
                            {...p.draggableProps}
                            className={`border-b border-[#D0DCF0]/70 transition-colors
                              ${snap.isDragging ? 'bg-[#E3F2FD] shadow-md' : 'hover:bg-[#FAFCFF]'}
                              ${!step.isActive ? 'opacity-50' : ''}
                            `}
                          >
                            {/* Drag handle */}
                            <td className="px-2 py-2.5 align-middle">
                              <button
                                type="button"
                                {...p.dragHandleProps}
                                className="text-[#C8D6E0] hover:text-[#546E7A] flex items-center justify-center"
                                aria-label="Reorder"
                              >
                                <GripVertical size={15} />
                              </button>
                            </td>

                            {/* Step number */}
                            <td className="px-2 py-2.5 align-middle">
                              <span
                                className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-[11px] font-bold ${
                                  step.isActive ? 'bg-[#1B3A6B] text-white' : 'bg-[#CFD8DC] text-white'
                                }`}
                              >
                                {step.stepNumber}
                              </span>
                            </td>

                            {/* Label + description */}
                            <td className="px-3 py-2.5 align-middle min-w-[180px] max-w-[260px]">
                              <p className={`text-[13px] font-semibold text-[#1A237E] leading-tight ${!step.isActive ? 'line-through' : ''}`}>
                                {step.label}
                              </p>
                              {step.description && (
                                <p className="text-[11px] text-[#90A4AE] mt-0.5 line-clamp-1">{step.description}</p>
                              )}
                            </td>

                            {/* Owner */}
                            <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                              <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                                step.owner === 'csa'
                                  ? 'bg-[#E0F7FA] text-[#028090]'
                                  : step.owner === 'both'
                                  ? 'bg-[#EDE7F6] text-[#6A1B9A]'
                                  : 'bg-[#E8EAF6] text-[#1B3A6B]'
                              }`}>
                                {ownerShort(step.owner)}
                              </span>
                            </td>

                            {/* Expected day */}
                            <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#546E7A]">
                                <Clock size={11} className="text-[#B0BEC5]" />
                                D{step.expectedDays}
                              </span>
                            </td>

                            {/* Auto-complete trigger */}
                            <td className="px-3 py-2.5 align-middle hidden sm:table-cell whitespace-nowrap">
                              {step.autoCompleteTrigger ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full font-medium">
                                  <Zap size={10} /> {triggerLabel(step.autoCompleteTrigger)}
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#B0BEC5]">Manual</span>
                              )}
                            </td>

                            {/* Active toggle */}
                            <td className="px-3 py-2.5 align-middle text-center">
                              <Toggle
                                checked={step.isActive}
                                onChange={() => {
                                  toggleChecklistStepActive(step.id)
                                  toast.success(step.isActive ? 'Step deactivated' : 'Step activated')
                                }}
                              />
                            </td>

                            {/* Actions */}
                            <td className="px-2 py-2.5 align-middle text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setModal({ mode: 'edit', step: { ...step } })}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11px] font-medium text-[#028090] border border-[#D0DCF0] hover:bg-[#E0F7FA] transition-colors"
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm('Delete this step from the template?')) {
                                      deleteChecklistStep(step.id)
                                      toast.success('Step deleted')
                                    }
                                  }}
                                  className="p-1.5 rounded-[6px] text-[#BF360C] border border-transparent hover:border-[#BF360C]/30 hover:bg-[#FFEBEE] transition-colors"
                                  title="Delete step"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>
      </div>

      {modal && (
        <StepModal mode={modal.mode} initial={modal.step} onClose={() => setModal(null)} onSave={saveStep} />
      )}
    </div>
  )
}

function StepModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    autoCompleteTrigger: initial.autoCompleteTrigger || '',
  }))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = e => {
    e.preventDefault()
    if (!form.label.trim() || !form.description.trim()) {
      toast.error('Label and description required')
      return
    }
    onSave({
      label: form.label.trim(),
      description: form.description.trim().slice(0, 200),
      owner: form.owner,
      expectedDays: Number(form.expectedDays) || 0,
      isRequired: !!form.isRequired,
      autoCompleteTrigger: form.autoCompleteTrigger || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,58,107,0.45)]">
      <form
        onSubmit={submit}
        className="bg-white rounded-[12px] w-full max-w-[480px] shadow-[0_8px_32px_rgba(27,58,107,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D0DCF0]">
          <h3 className="text-[14px] font-bold text-[#1A237E]">
            {mode === 'add' ? 'Add checklist step' : 'Edit step'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F4F8FF] text-[#90A4AE]">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block text-[12px] font-semibold text-[#1A237E]">
            Step label *
            <input
              className="mt-1 w-full input rounded-[8px] text-[13px]"
              value={form.label}
              onChange={e => set('label', e.target.value)}
              placeholder="e.g. Branding Assets Uploaded"
            />
          </label>

          <label className="block text-[12px] font-semibold text-[#1A237E]">
            Description *
            <span className="text-[10px] text-[#90A4AE] font-normal ml-1">(max 200)</span>
            <textarea
              className="mt-1 w-full input rounded-[8px] text-[13px] min-h-[72px] resize-none"
              maxLength={200}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            <span className="text-[10.5px] text-[#90A4AE]">{(form.description || '').length}/200</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            {/* Owner */}
            <div>
              <p className="text-[12px] font-semibold text-[#1A237E] mb-1.5">Owner *</p>
              <div className="space-y-1.5">
                {OWNER_OPTS.map(o => (
                  <label key={o.value} className="flex items-center gap-2 text-[12.5px] cursor-pointer">
                    <input
                      type="radio"
                      name="modal-owner"
                      checked={form.owner === o.value}
                      onChange={() => set('owner', o.value)}
                      className="accent-[#028090]"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Day + required */}
            <div className="space-y-3">
              <label className="block text-[12px] font-semibold text-[#1A237E]">
                Expected by (day)
                <input
                  type="number"
                  className="mt-1 w-full input rounded-[8px] text-[13px]"
                  value={form.expectedDays}
                  min={0}
                  onChange={e => set('expectedDays', e.target.value)}
                />
                <span className="text-[10.5px] text-[#90A4AE]">Day from tenant creation</span>
              </label>
              <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isRequired}
                  onChange={e => set('isRequired', e.target.checked)}
                  className="accent-[#028090]"
                />
                Required step
              </label>
            </div>
          </div>

          {/* Auto-complete trigger */}
          <label className="block text-[12px] font-semibold text-[#1A237E]">
            Auto-complete trigger
            <select
              className="mt-1 w-full input rounded-[8px] text-[13px]"
              value={form.autoCompleteTrigger}
              onChange={e => set('autoCompleteTrigger', e.target.value)}
            >
              {TRIGGER_OPTIONS.map(t => (
                <option key={t.value || 'none'} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className="text-[10.5px] text-[#90A4AE]">Leave as Manual for PA/CSA to mark done</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-[#D0DCF0] bg-[#FAFBFF]">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#028090] text-white text-[12.5px] font-semibold hover:bg-[#026a76] transition-colors"
          >
            <Check size={14} /> {mode === 'add' ? 'Add step' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
