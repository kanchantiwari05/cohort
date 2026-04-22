import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Check, Upload, Download, X } from 'lucide-react'
import CommunityTypeHierarchyBuilder from './settings/CommunityTypeHierarchyBuilder'

const PRESET_COLORS = ['#1B3A6B', '#028090', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']

// ── Section 1: Client context brief ───────────────────────────────────────────
function ClientContextBrief({ communityName, communityType, csaName, isEditMode, existingNodeCount }) {
  const levels = communityType?.defaultHierarchyPreset?.levels || []
  const hasPreset = levels.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#D0DCF0] p-4 mb-4">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs text-secondary mb-1">
            {isEditMode ? 'Editing hierarchy for:' : 'Configuring hierarchy for:'}
          </p>
          <p className="text-base font-bold text-navy leading-tight truncate">
            {communityName?.trim() || <span className="text-secondary italic font-normal">Unnamed Community</span>}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {communityType && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20">
                {communityType.name}
              </span>
            )}
            {csaName && (
              <span className="text-xs text-secondary">CSA: {csaName}</span>
            )}
          </div>
          {isEditMode && (
            <p className="text-xs text-secondary mt-1">
              {levels.length} level{levels.length !== 1 ? 's' : ''} · {existingNodeCount} node{existingNodeCount !== 1 ? 's' : ''} currently configured
            </p>
          )}
          {isEditMode && (
            <p className="text-xs text-amber-600 mt-0.5">
              Changes take effect within 5 minutes for all users
            </p>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          {hasPreset ? (
            <>
              <p className="text-xs text-secondary mb-2">
                Based on <span className="font-medium text-primary">{communityType?.name}</span>, we recommend:
              </p>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {levels.map((level, i) => {
                  const color = level.color || PRESET_COLORS[i] || '#546E7A'
                  return (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-secondary/60 text-[10px]">→</span>}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: color + '20', color, border: `1px solid ${color}40` }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        {level.name || `Level ${i + 1}`}
                      </span>
                    </span>
                  )
                })}
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs text-secondary">No preset available for this type.</p>
              <p className="text-xs text-secondary">Build from scratch below.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Section 2: Template selection cards ───────────────────────────────────────
function TemplateCards({ selected, onSelect, communityType, isEditMode, communityName, nodeCount }) {
  const [confirmSwitch, setConfirmSwitch] = useState(null)
  const [confirmNameInput, setConfirmNameInput] = useState('')
  const levels = communityType?.defaultHierarchyPreset?.levels || []
  const hasPreset = levels.length > 0

  const attemptSwitch = (choice) => {
    if (choice === selected) return
    if (nodeCount > 0) {
      setConfirmSwitch(choice)
      setConfirmNameInput('')
    } else {
      onSelect(choice)
    }
  }

  const confirmAndSwitch = () => {
    onSelect(confirmSwitch)
    setConfirmSwitch(null)
    setConfirmNameInput('')
  }

  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-navy mb-3">Hierarchy Setup</h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Card A: Template */}
        <button
          type="button"
          onClick={() => attemptSwitch('template')}
          disabled={!hasPreset}
          className={`relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none
            ${selected === 'template' ? 'border-teal bg-[#F0FAFB]' : 'border-border bg-white hover:border-teal/40'}
            ${!hasPreset ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {selected === 'template' && hasPreset && (
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
              Recommended
            </span>
          )}
          <div className="flex items-start gap-2 mb-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
              ${selected === 'template' ? 'border-teal bg-teal' : 'border-secondary bg-white'}`}>
              {selected === 'template' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <p className="text-sm font-semibold text-primary pr-20">
              Use {communityType?.name || 'Community Type'} Template
            </p>
          </div>
          {hasPreset ? (
            <div className="space-y-1.5 ml-6">
              <p className="text-[11px] text-secondary mb-1.5">Levels pre-filled:</p>
              {levels.map((level, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: level.color || PRESET_COLORS[i] || '#546E7A' }} />
                  <span className="text-xs text-primary font-medium">{level.name || `Level ${i + 1}`}</span>
                </div>
              ))}
              <p className="text-[11px] text-secondary italic mt-2">These names can be renamed below</p>
            </div>
          ) : (
            <p className="text-xs text-secondary ml-6 italic">No preset for this community type</p>
          )}
        </button>

        {/* Card B: Scratch */}
        <button
          type="button"
          onClick={() => attemptSwitch('scratch')}
          className={`text-left rounded-xl border-2 p-4 transition-all cursor-pointer focus:outline-none
            ${selected === 'scratch' ? 'border-teal bg-[#F0FAFB]' : 'border-border bg-white hover:border-teal/40'}`}
        >
          <div className="flex items-start gap-2 mb-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
              ${selected === 'scratch' ? 'border-teal bg-teal' : 'border-secondary bg-white'}`}>
              {selected === 'scratch' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <p className="text-sm font-semibold text-primary">Build From Scratch</p>
          </div>
          <div className="ml-6 space-y-1">
            <p className="text-xs text-secondary">Start with no preset.</p>
            <p className="text-xs text-secondary">Define your own level names and structure.</p>
            <p className="text-[11px] text-secondary italic mt-2">
              Use this for custom community structures not covered by presets
            </p>
          </div>
        </button>
      </div>

      {/* Switch confirmation — simple for new, strong for edit */}
      {confirmSwitch && !isEditMode && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-800 font-medium mb-2">
            You have already created {nodeCount} node{nodeCount !== 1 ? 's' : ''}.
            Switching will clear all nodes and levels. Are you sure?
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmSwitch(null)} className="btn btn-outline btn-sm text-xs">Cancel</button>
            <button onClick={confirmAndSwitch} className="px-3 py-1 rounded bg-amber-500 text-white text-xs font-medium hover:bg-amber-600">
              Switch and Clear
            </button>
          </div>
        </div>
      )}

      {/* Strong modal for edit mode with existing nodes */}
      {confirmSwitch && isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <h3 className="text-sm font-bold text-primary">Delete all existing nodes?</h3>
            </div>
            <div className="space-y-3 text-xs text-secondary mb-4">
              <p>This will delete all <strong className="text-primary">{nodeCount}</strong> existing nodes for <strong className="text-primary">{communityName}</strong>.</p>
              <p>Members currently assigned to these nodes will have their node assignments removed. Level Admins will lose access immediately.</p>
              <p className="font-semibold text-danger">This cannot be undone.</p>
              <div>
                <p className="mb-1 text-primary font-medium">Type the community name to confirm:</p>
                <input
                  type="text"
                  value={confirmNameInput}
                  onChange={e => setConfirmNameInput(e.target.value)}
                  placeholder={communityName}
                  className="input text-xs w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setConfirmSwitch(null); setConfirmNameInput('') }}
                className="btn btn-outline btn-sm text-xs">Cancel</button>
              <button
                onClick={confirmAndSwitch}
                disabled={confirmNameInput !== communityName}
                className="px-4 py-1.5 rounded-button text-xs font-semibold text-white transition-colors
                  bg-danger hover:bg-danger/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Delete All and Rebuild
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section 3: Scope estimator ─────────────────────────────────────────────────
function ScopeEstimator({ levels, onSwitchToCSV }) {
  const [counts, setCounts] = useState({})
  const [hidden, setHidden] = useState(false)

  if (hidden || levels.length === 0) return null

  const computeTotal = () => {
    if (levels.length === 0) return 0
    let total = parseInt(counts[0] || 0)
    for (let i = 1; i < levels.length; i++) {
      const n = parseInt(counts[i] || 0)
      if (n) total *= n
    }
    return total
  }
  const total = computeTotal()

  const getTimeEstimate = (n) => {
    if (n <= 10) return '~5-10 minutes'
    if (n <= 25) return '~15-25 minutes'
    if (n <= 50) return '~30-45 minutes'
    if (n <= 100) return '~1-2 hours (consider CSV import)'
    return '~2+ hours — we strongly recommend using CSV bulk import'
  }

  return (
    <div className="mb-4 p-4 bg-[#FFF8E1] border border-[#E6A817] rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-primary">How large is this hierarchy?</p>
          <p className="text-xs text-secondary mt-0.5">Help us estimate how many nodes you need</p>
        </div>
        <button onClick={() => setHidden(true)}
          className="text-xs text-secondary hover:text-primary hover:underline underline-offset-2 flex-shrink-0">
          Skip estimator
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {levels.map((level, i) => (
          <div key={i} className="flex items-center gap-3">
            <label className="text-xs text-primary w-28 text-right flex-shrink-0">
              {level.name || `Level ${i + 1}`}:
            </label>
            <input
              type="number"
              min="0"
              value={counts[i] || ''}
              onChange={e => setCounts(prev => ({ ...prev, [i]: e.target.value }))}
              placeholder="0"
              className="input w-20 text-xs py-1"
            />
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="border-t border-amber-300 pt-2 space-y-1">
          <p className="text-xs font-semibold text-primary">Estimated total: ~{total} nodes</p>
          <p className="text-xs text-secondary">Estimated setup time: {getTimeEstimate(total)}</p>
          {total > 50 && total <= 100 && (
            <p className="text-xs text-teal mt-1.5">
              💡 For large hierarchies, CSV bulk import is much faster.{' '}
              <button onClick={onSwitchToCSV} className="underline font-medium hover:text-teal/80">Switch to CSV Import →</button>
            </p>
          )}
          {total > 100 && (
            <p className="text-xs text-amber-700 font-medium mt-1.5">
              ⚠ Creating 100+ nodes manually will take 2+ hours. CSV import is strongly recommended.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Section 4B: CSV import panel ───────────────────────────────────────────────
function CSVImportPanel({ levels }) {
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState(null) // null | 'processing' | 'success'
  const fileRef = useRef(null)
  const levelNames = levels.map((l, i) => l?.name || `Level ${i + 1}`)

  const handleFile = (f) => {
    if (!f) return
    setStatus('processing')
    setTimeout(() => setStatus('success'), 1200)
  }

  const downloadTemplate = () => {
    const rows = [levelNames.join(',')]
    // example rows
    if (levelNames.length >= 3) {
      rows.push(`Example A,Sub-group 1,Sub-sub 1`)
      rows.push(`Example A,Sub-group 1,Sub-sub 2`)
      rows.push(`Example A,Sub-group 2,Sub-sub 1`)
    } else if (levelNames.length === 2) {
      rows.push(`Example A,Sub-group 1`)
      rows.push(`Example A,Sub-group 2`)
    } else {
      rows.push(`Example A`)
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'hierarchy-template.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Step 1 */}
      <div>
        <p className="text-xs font-bold text-primary mb-2">Step 1 — Download the CSV template</p>
        <p className="text-xs text-secondary mb-2">Your CSV should have these columns:</p>
        <div className="overflow-x-auto mb-3">
          <table className="text-xs border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr>
                {levelNames.map(n => (
                  <th key={n} className="border border-border px-3 py-1.5 bg-surface font-semibold text-primary text-left whitespace-nowrap">{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1].map(row => (
                <tr key={row}>
                  {levelNames.map((_, i) => (
                    <td key={i} className="border border-border px-3 py-1 text-secondary whitespace-nowrap">
                      {i === 0 ? 'Example A' : i === 1 ? `Sub-group ${row + 1}` : `Sub-sub ${row + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={downloadTemplate} className="btn btn-outline btn-sm text-xs flex items-center gap-1.5">
          <Download size={12} /> Download CSV Template
        </button>
      </div>

      {/* Step 2 */}
      <div>
        <p className="text-xs font-bold text-primary mb-2">Step 2 — Fill in your data and upload</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx" className="sr-only"
          onChange={e => handleFile(e.target.files[0])} />
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl h-28 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors
            ${dragOver ? 'border-teal bg-teal/5' : 'border-border hover:border-teal/50 bg-surface'}`}
        >
          <Upload size={20} className="text-secondary" />
          <p className="text-xs text-secondary font-medium">Drag and drop your CSV here</p>
          <p className="text-xs text-secondary">or <span className="text-teal underline">Browse Files</span></p>
          <p className="text-[10px] text-secondary/60">Accepts .csv and .xlsx files</p>
        </div>
      </div>

      {/* Step 3: Validation result */}
      {status === 'processing' && (
        <div className="flex items-center gap-2 text-secondary text-xs">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Reading your file...
        </div>
      )}
      {status === 'success' && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={12} className="text-green-600" />
            </div>
            <p className="text-xs font-semibold text-green-700">File validated successfully</p>
          </div>
          <p className="text-xs text-secondary mb-1">Found:</p>
          {levelNames.map((name, i) => (
            <p key={i} className="text-xs text-primary">
              {i === 0 ? '1' : i === 1 ? '5' : '40'} {name}{i > 0 ? 's' : ''}
            </p>
          ))}
          <p className="text-xs font-semibold text-primary mt-1 mb-3">Total: ~46 nodes</p>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm text-xs">Preview Tree</button>
            <button className="btn btn-primary btn-sm text-xs">Import All Nodes</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main HierarchyWizardStep component ─────────────────────────────────────────
export default function HierarchyWizardStep({
  communityName,
  communityType,
  csaName,
  isEditMode = false,
  hierarchyTemplate,
  onChange,
  onSkip,
  hierarchySkipped,
  onStatusChange,
  getDefaultHierarchyForType,
  getScratchHierarchy,
  builderKey,
}) {
  const levels = hierarchyTemplate?.levels || []
  const nodes = hierarchyTemplate?.nodes || []
  const nodeCount = nodes.length

  const hasPreset = (communityType?.defaultHierarchyPreset?.levels || []).length > 0
  const [templateChoice, setTemplateChoice] = useState(hasPreset ? 'template' : 'scratch')
  const [buildMode, setBuildMode] = useState('manual')
  const [builderVersion, setBuilderVersion] = useState(0)
  const [showSkipNote, setShowSkipNote] = useState(false)
  const [propagationChanged, setPropagationChanged] = useState(false)

  // Community name validation
  const nameIsIncomplete = communityName?.trim() && communityName.trim().length < 3

  // Notify parent of current validation state
  useEffect(() => {
    const hasLevels = levels.length > 0
    const hasNodes = nodeCount > 0

    if (!hasLevels) {
      onStatusChange?.({ state: 'A', canProceed: false, requiresConfirm: false })
    } else if (!hasNodes) {
      onStatusChange?.({ state: 'B', canProceed: true, requiresConfirm: true })
    } else {
      onStatusChange?.({ state: 'C', canProceed: true, requiresConfirm: false })
    }
  }, [levels.length, nodeCount])

  const handleTemplateSelect = (choice) => {
    setTemplateChoice(choice)
    if (choice === 'template') {
      onChange(getDefaultHierarchyForType(communityType?.slug || ''))
    } else {
      onChange(getScratchHierarchy())
    }
    setBuilderVersion(v => v + 1)
  }

  const handleBuilderChange = (updated) => {
    onChange(updated)
    if (isEditMode) setPropagationChanged(true)
  }

  return (
    <div>
      {/* Name validation warning */}
      {nameIsIncomplete && (
        <div className="mb-4 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-secondary">
            Community name &ldquo;{communityName}&rdquo; looks incomplete.{' '}
            <span className="text-teal cursor-pointer hover:underline underline-offset-2">Go back to Step 1 →</span>
          </p>
        </div>
      )}

      {/* Edit mode propagation banner */}
      {isEditMode && propagationChanged && (
        <div className="mb-4 px-4 py-2 bg-teal/10 border border-teal/30 rounded-xl">
          <p className="text-xs text-teal font-medium">
            Changes are being saved and will propagate to all users within 5 minutes
          </p>
        </div>
      )}

      {/* Section 1: Client context brief */}
      <ClientContextBrief
        communityName={communityName}
        communityType={communityType}
        csaName={csaName}
        isEditMode={isEditMode}
        existingNodeCount={nodeCount}
      />

      {/* Section 2: Template selection */}
      <TemplateCards
        selected={templateChoice}
        onSelect={handleTemplateSelect}
        communityType={communityType}
        isEditMode={isEditMode}
        communityName={communityName}
        nodeCount={nodeCount}
      />

      {/* Section 3: Scope estimator (new flow only) */}
      {!isEditMode && levels.length > 0 && nodeCount === 0 && (
        <ScopeEstimator
          levels={levels}
          onSwitchToCSV={() => setBuildMode('csv')}
        />
      )}

      {/* Skip option (new flow only, before any nodes) */}
      {!isEditMode && nodeCount === 0 && !hierarchySkipped && (
        <div className="mb-4 text-center">
          {!showSkipNote ? (
            <button
              onClick={() => setShowSkipNote(true)}
              className="text-xs text-secondary hover:text-primary hover:underline underline-offset-2"
            >
              Not ready to build hierarchy yet? Skip for now — I&apos;ll set it up in Hierarchy Builder after tenant creation
            </button>
          ) : (
            <div className="p-3 bg-surface border border-border rounded-xl">
              <p className="text-xs text-secondary mb-2">
                Hierarchy will be empty. You can configure it anytime from the Hierarchy Builder after the tenant is created.
              </p>
              <button onClick={onSkip} className="btn btn-outline btn-sm text-xs">
                OK, Skip This Step
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section 4: Build mode tabs */}
      <div className="mb-4">
        <div className="flex gap-0.5 p-1 bg-surface rounded-full w-fit border border-border">
          <button
            type="button"
            onClick={() => setBuildMode('manual')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all
              ${buildMode === 'manual' ? 'bg-navy text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
          >
            ⊞ Manual Builder
          </button>
          <button
            type="button"
            onClick={() => setBuildMode('csv')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all
              ${buildMode === 'csv' ? 'bg-navy text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
          >
            ↑ CSV Import
          </button>
        </div>
      </div>

      {/* Section 4A: Manual builder */}
      {buildMode === 'manual' && (
        <div className="card p-0 overflow-hidden">
          <div className="h-[760px]">
            <CommunityTypeHierarchyBuilder
              key={`${builderKey}-v${builderVersion}`}
              title={communityName?.trim() || (isEditMode ? 'Edit Hierarchy' : 'New Community')}
              initialTemplate={hierarchyTemplate}
              onChange={handleBuilderChange}
            />
          </div>
        </div>
      )}

      {/* Section 4B: CSV import */}
      {buildMode === 'csv' && (
        <div className="card">
          <div className="card-body">
            <CSVImportPanel levels={levels} />
          </div>
        </div>
      )}
    </div>
  )
}
