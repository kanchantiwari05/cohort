import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, ChevronRight } from 'lucide-react'
import useMasterSettingsStore from '../../../store/masterSettingsStore'
import ModuleIcon from '../../../lib/moduleIcons'
import CommunityTypeHierarchyBuilder from './CommunityTypeHierarchyBuilder'

const PRESET_COLORS = ['#028090', '#1B3A6B', '#1565C0', '#6A1B9A', '#BF360C', '#C17900', '#2E7D32', '#546E7A']
const ICON_OPTS = ['briefcase', 'book-open', 'building', 'star', 'monitor', 'users', 'globe', 'heart', 'award', 'zap', 'home', 'map-pin']

function slugify(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export default function CommunityTypeFormPage() {
  const { ctId } = useParams()
  const navigate = useNavigate()
  const isEdit = !!ctId

  const communityTypes = useMasterSettingsStore(s => s.communityTypes)
  const modules = useMasterSettingsStore(s => s.modules)
  const addCommunityType = useMasterSettingsStore(s => s.addCommunityType)
  const updateCommunityType = useMasterSettingsStore(s => s.updateCommunityType)

  const existing = isEdit ? communityTypes.find(c => c.id === ctId) : null

  const [form, setForm] = useState(() =>
    existing
      ? { ...existing }
      : {
          name: '',
          slug: '',
          examples: '',
          description: '',
          color: '#028090',
          icon: 'briefcase',
          defaultHierarchyPreset: { levels: [{ index: 0, name: 'Level 1', color: '#1B3A6B' }], nodes: [] },
          recommendedModuleIds: [],
          suggestedPlanSlug: 'starter',
          slugTouched: false,
        }
  )

  useEffect(() => {
    if (isEdit && !existing) {
      navigate('/admin/settings/communityTypes', { replace: true })
    }
  }, [isEdit, existing, navigate])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const slugAuto = !isEdit && !form.slugTouched
  const computedSlug = slugify(form.name)
  const templateLevels = form.defaultHierarchyPreset?.levels || []
  const templateNodes = form.defaultHierarchyPreset?.nodes || []
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (templateLevels.length === 0) {
      toast.error('Add at least one hierarchy level')
      return
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug?.trim() || computedSlug,
      examples: form.examples,
      description: form.description,
      color: form.color,
      icon: form.icon,
      defaultHierarchyPreset: form.defaultHierarchyPreset,
      recommendedModuleIds: form.recommendedModuleIds || [],
      suggestedPlanSlug: form.suggestedPlanSlug,
    }
    if (isEdit) {
      updateCommunityType(ctId, payload)
      toast.success(`${payload.name} saved ✓`)
    } else {
      addCommunityType(payload)
      toast.success(`${payload.name} created ✓`)
    }
    navigate('/admin/settings/communityTypes')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-0 md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-[#D0DCF0] px-5 py-4 flex-shrink-0">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#546E7A] mb-2">
          <Link to="/admin/settings/communityTypes" className="hover:text-[#1B3A6B]">
            Community Types
          </Link>
          <ChevronRight size={13} className="text-[#B0BEC5]" />
          <span className="text-[#1B3A6B] font-medium">
            {isEdit ? `Edit · ${existing?.name ?? ''}` : 'New Type'}
          </span>
        </nav>
        <h1 className="text-[17px] font-bold text-[#1A237E] leading-tight">
          {isEdit ? 'Edit Community Type' : 'New Community Type'}
        </h1>
        <p className="text-[12px] text-[#90A4AE] mt-0.5">
          Define identity, build the default hierarchy template, and set module recommendations.
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-[#F4F8FF] p-5">
        <form id="ct-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">

          {/* Left column */}
          <div className="space-y-5">
            {/* Identity */}
            <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-5 space-y-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-[#546E7A]">Identity</h2>

              <label className="block text-[13px] font-medium text-[#1A237E]">
                Name *
                <input
                  className="mt-1 w-full input rounded-[8px] border-[#D0DCF0]"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Business Network"
                />
              </label>

              <label className="block text-[13px] font-medium text-[#1A237E]">
                Slug
                <input
                  className="mt-1 w-full input rounded-[8px] font-mono text-sm border-[#D0DCF0]"
                  value={slugAuto ? computedSlug : form.slug}
                  onChange={e => {
                    set('slugTouched', true)
                    set('slug', e.target.value)
                  }}
                />
                <span className="text-[11px] text-[#90A4AE]">Used in code — lowercase, no spaces</span>
              </label>

              <label className="block text-[13px] font-medium text-[#1A237E]">
                Examples
                <input
                  className="mt-1 w-full input rounded-[8px] border-[#D0DCF0]"
                  value={form.examples}
                  onChange={e => set('examples', e.target.value)}
                  placeholder="BNI, Rotary, Trade Association…"
                />
              </label>

              <label className="block text-[13px] font-medium text-[#1A237E]">
                Description
                <textarea
                  className="mt-1 w-full input rounded-[8px] min-h-[72px] border-[#D0DCF0]"
                  maxLength={150}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
                <span className="text-[11px] text-[#90A4AE]">{(form.description || '').length}/150</span>
              </label>

            </section>

            {/* Hierarchy builder */}
            <section className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-0 overflow-hidden">
              <div className="h-[760px]">
                <CommunityTypeHierarchyBuilder
                  title={form.name?.trim() || 'Community Type Template'}
                  initialTemplate={form.defaultHierarchyPreset}
                  onChange={template => {
                    setForm(f => ({
                      ...f,
                      defaultHierarchyPreset: {
                        levels: (template?.levels || []).map((level, index) => ({ ...level, index })),
                        nodes: template?.nodes || [],
                      },
                    }))
                  }}
                />
              </div>
            </section>
          </div>

          {/* Right column — live hierarchy preview */}
          <div className="xl:sticky xl:top-5 space-y-3">
            <div className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D0DCF0] bg-[#F4F8FF] flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${form.color}22` }}
                >
                  <ModuleIcon name={form.icon} size={14} style={{ color: form.color }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#1A237E]">
                    {form.name || 'Untitled Type'}
                  </p>
                  {form.examples && (
                    <p className="text-[10px] text-[#90A4AE] italic">{form.examples}</p>
                  )}
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-1">
                  <p className="text-[12px] text-[#546E7A]">
                    <span className="font-semibold text-[#1A237E]">{templateLevels.length}</span> levels
                    {' · '}
                    <span className="font-semibold text-[#1A237E]">{templateNodes.length}</span> nodes
                  </p>
                  {templateLevels.length > 0 && (
                    <p className="text-[11px] text-[#90A4AE]">
                      {templateLevels.map(l => l.name).join(' → ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Level summary */}
            {templateLevels.length > 0 && (
              <div className="bg-white rounded-[12px] border border-[#D0DCF0] shadow-[0_2px_8px_rgba(27,58,107,0.06)] p-4">
                <p className="text-[11px] font-semibold uppercase text-[#546E7A] mb-2">Level summary</p>
                <div className="space-y-1.5">
                  {templateLevels.map((lv, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: lv.color || '#546E7A' }}
                      />
                      <span className="text-[#90A4AE] tabular-nums w-5">L{i}</span>
                      <span className="font-medium text-[#1A237E]">{lv.name || `Level ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Sticky footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D0DCF0] bg-white flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate('/admin/settings/communityTypes')}
          className="btn btn-outline btn-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="ct-form"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-[8px] bg-[#028090] text-white text-sm font-semibold hover:bg-[#026a76] transition-colors"
        >
          <Check size={16} /> {isEdit ? 'Save changes' : 'Create type'}
        </button>
      </div>
    </div>
  )
}
