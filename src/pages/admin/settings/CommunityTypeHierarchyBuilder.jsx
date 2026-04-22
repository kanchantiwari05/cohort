import { useEffect, useMemo, useRef, useState } from 'react'
import {
  GripVertical, Pencil, Palette, Trash2, ChevronDown, ChevronRight,
  Plus, Minus, Check, AlertTriangle, CheckCircle, Search, X,
  Users, Maximize2, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../../components/Modal'
import ViewToggle from '../../../components/ViewToggle'
import { members } from '../../../data/members'

const COLOR_SWATCHES = ['#1B3A6B', '#028090', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']
const NODE_W = 152
const NODE_H = 80
const H_GAP = 20
const V_GAP = 48

function normalizeLevels(rawLevels = []) {
  const fallback = ['#028090', '#1B3A6B', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']
  return (Array.isArray(rawLevels) ? rawLevels : [])
    .map((level, i) => ({
      id: level?.id || `l${i + 1}`,
      name: (level?.name || '').trim() || `Level ${i + 1}`,
      color: level?.color || fallback[i] || '#546E7A',
    }))
}

function normalizeNodes(rawNodes = [], levels = []) {
  const validLevelIds = new Set(levels.map(l => l.id))
  const today = new Date().toISOString().split('T')[0]
  return (Array.isArray(rawNodes) ? rawNodes : [])
    .map((node, i) => ({
      id: node?.id || `n-${Date.now()}-${i + 1}`,
      name: (node?.name || '').trim(),
      levelId: node?.levelId || levels[0]?.id || null,
      parentId: node?.parentId ?? null,
      laId: node?.laId ?? null,
      laName: node?.laName ?? null,
      laEmail: node?.laEmail ?? null,
      laPhone: node?.laPhone ?? null,
      memberCount: Number.isFinite(Number(node?.memberCount)) ? Number(node.memberCount) : 0,
      createdAt: node?.createdAt || today,
    }))
    .filter(node => node.name && node.levelId && validLevelIds.has(node.levelId))
}

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => ({ ...n, children: buildTree(nodes, n.id) }))
}

function collectDescendantIds(nodeId, allNodes) {
  return allNodes
    .filter(n => n.parentId === nodeId)
    .reduce((acc, child) => [...acc, child.id, ...collectDescendantIds(child.id, allNodes)], [])
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function formatDate(ds) {
  if (!ds) return '—'
  return new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function computeSubtreeLayout(node) {
  if (!node.children?.length) return { width: NODE_W, nodeX: 0 }
  let cursor = 0
  const childOffsets = []
  node.children.forEach((child, i) => {
    const cl = computeSubtreeLayout(child)
    childOffsets.push({ offset: cursor, width: cl.width })
    cursor += cl.width + (i < node.children.length - 1 ? H_GAP : 0)
  })
  const totalChildWidth = cursor
  const totalWidth = Math.max(totalChildWidth, NODE_W)
  const nodeX = (totalChildWidth - NODE_W) / 2
  return { width: totalWidth, nodeX, childOffsets }
}

function assignPositions(node, baseX, baseY, layoutCache, positions = [], edges = []) {
  const layout = layoutCache.get(node.id) || computeSubtreeLayout(node)
  layoutCache.set(node.id, layout)
  const nodeAbsX = baseX + layout.nodeX
  const cx = nodeAbsX + NODE_W / 2
  const cy = baseY + NODE_H
  positions.push({ id: node.id, x: nodeAbsX, y: baseY, cx, cy })

  if (node.children?.length && layout.childOffsets) {
    node.children.forEach((child, i) => {
      const childLayout = computeSubtreeLayout(child)
      layoutCache.set(child.id, childLayout)
      const childOffsetX = baseX + layout.childOffsets[i].offset
      const childAbsX = childOffsetX + childLayout.nodeX
      const childCX = childAbsX + NODE_W / 2
      const childY = baseY + NODE_H + V_GAP
      edges.push({ px: cx, py: cy, cx: childCX, cy: childY })
      assignPositions(child, childOffsetX, childY, layoutCache, positions, edges)
    })
  }
  return { positions, edges }
}

function ColorPicker({ color, onChange }) {
  const [customHex, setCustomHex] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customError, setCustomError] = useState(false)

  function handleCustom(val) {
    setCustomHex(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setCustomError(false)
      onChange(val)
    } else {
      setCustomError(true)
    }
  }

  return (
    <div className="mt-2 p-3 bg-white border border-border rounded-button shadow-modal">
      <div className="flex items-center gap-2 flex-wrap">
        {COLOR_SWATCHES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex-shrink-0"
            style={{
              background: s,
              boxShadow: color === s ? `0 0 0 2px white, 0 0 0 3.5px ${s}` : undefined,
              borderColor: color === s ? s : 'transparent',
            }}
          />
        ))}
        <button type="button" onClick={() => setShowCustom(v => !v)} className="text-2xs text-secondary hover:text-teal underline ml-1">
          Custom
        </button>
      </div>
      {showCustom && (
        <div className="mt-2">
          <input
            className={`input text-xs h-8 ${customError ? 'border-danger' : ''}`}
            placeholder="#RRGGBB"
            value={customHex}
            onChange={e => handleCustom(e.target.value)}
          />
          {customError && <p className="text-2xs text-danger mt-0.5">Enter a valid hex (#RRGGBB)</p>}
        </div>
      )}
    </div>
  )
}

function AssignLAModal({ open, onClose, targetNode, levels, nodes, onConfirm }) {
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setSelectedMember(null)
    }
  }, [open])

  if (!targetNode) return null
  const level = levels.find(l => l.id === targetNode.levelId)
  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.business.toLowerCase().includes(q)
  })
  const getAlreadyLANode = memberId => nodes.find(n => n.laId === memberId && n.id !== targetNode.id) || null
  const alreadyLANode = selectedMember ? getAlreadyLANode(selectedMember.id) : null

  return (
    <Modal open={open} onClose={onClose} title="Assign Level Admin" maxWidth={520}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {level && (
            <span className="badge text-2xs" style={{ background: level.color + '18', color: level.color, border: `1px solid ${level.color}35` }}>
              {level.name}
            </span>
          )}
          <span className="text-sm font-semibold text-primary">{targetNode.name}</span>
        </div>

        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input className="input pl-9 text-sm" placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border border border-border rounded-button">
          {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-secondary">No members found</div>}
          {filtered.map(m => {
            const otherNode = getAlreadyLANode(m.id)
            const isSel = selectedMember?.id === m.id
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMember(isSel ? null : m)}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${isSel ? 'bg-teal/10' : 'hover:bg-surface'}`}
              >
                <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-sm flex-shrink-0">
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-primary">{m.name}</p>
                  <p className="text-xs text-secondary truncate">{m.business}</p>
                  {otherNode && <p className="text-2xs text-amber mt-0.5">★ LA of {otherNode.name}</p>}
                </div>
                {isSel && <Check size={15} className="text-teal flex-shrink-0" />}
              </div>
            )
          })}
        </div>

        {alreadyLANode && (
          <div className="bg-amber/10 border border-amber/30 rounded-button p-3 mt-3 text-xs text-amber-dark">
            ⚠ {selectedMember?.name} is currently LA of {alreadyLANode.name}. Assigning here will remove them from there.
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button className="btn btn-outline flex-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary flex-1" disabled={!selectedMember} onClick={() => onConfirm(selectedMember)}>
            Confirm Assignment
          </button>
        </div>
      </div>
    </Modal>
  )
}

function OrgChartCard({ node, level, isSelected, onClick, onAssignLA, onAddChild, nextLevel }) {
  const isUnassigned = !node.laName
  return (
    <div
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}
      className={`group absolute bg-white rounded-card cursor-pointer transition-all hover:shadow-lg hover:z-10 ${isSelected ? 'ring-2 ring-teal shadow-md z-10' : 'shadow-sm border border-border'}`}
      style={{ width: NODE_W, height: NODE_H, top: node.y, left: node.x }}
    >
      <div className="h-1.5 rounded-t-card" style={{ background: level?.color ?? '#546E7A' }} />
      <div className="px-3 py-2 flex flex-col justify-between h-[calc(100%-6px)]">
        <div>
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-semibold text-primary leading-tight truncate flex-1">{node.name}</p>
            {isUnassigned ? <AlertTriangle size={11} className="text-amber flex-shrink-0 mt-0.5" /> : <CheckCircle size={11} className="text-success flex-shrink-0 mt-0.5" />}
          </div>
          {level && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block" style={{ background: level.color + '18', color: level.color }}>
              {level.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-0.5 text-[10px] text-secondary"><Users size={9} /> {node.memberCount}</span>
          {isUnassigned ? (
            <button onClick={e => { e.stopPropagation(); onAssignLA(node) }} className="text-[9px] text-amber border border-amber/40 px-1.5 py-0.5 rounded-button hover:bg-amber/10 transition-colors">
              Assign LA
            </button>
          ) : (
            <span className="text-[9px] text-secondary truncate max-w-[70px]" title={node.laName}>{node.laName?.split(' ')[0]}</span>
          )}
        </div>
      </div>
      {nextLevel && (
        <button
          onClick={e => { e.stopPropagation(); onAddChild(node) }}
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-teal text-teal rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-teal hover:text-white z-20"
          title={`Add ${nextLevel.name}`}
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  )
}

function OrgChartCanvas({ nodes, levels, selectedNodeId, onSelect, onAssignLA, onAddChild }) {
  const tree = buildTree(nodes)
  if (!tree.length) return null
  const layoutCache = new Map()
  let allPositions = []
  let allEdges = []
  let rootCursor = 0
  tree.forEach(root => {
    const cl = computeSubtreeLayout(root)
    layoutCache.set(root.id, cl)
    const { positions, edges } = assignPositions(root, rootCursor, 0, layoutCache)
    allPositions.push(...positions)
    allEdges.push(...edges)
    rootCursor += cl.width + H_GAP * 3
  })
  rootCursor -= H_GAP * 3
  const totalW = rootCursor
  const maxY = Math.max(...allPositions.map(p => p.y)) + NODE_H
  const PAD = 40

  return (
    <div className="relative" style={{ width: totalW + PAD * 2, height: maxY + PAD * 2, minWidth: '100%' }}>
      <svg className="absolute inset-0 pointer-events-none" width={totalW + PAD * 2} height={maxY + PAD * 2} style={{ overflow: 'visible' }}>
        {allEdges.map((e, i) => {
          const midY = (e.py + e.cy) / 2
          const d = `M ${e.px + PAD} ${e.py + PAD} C ${e.px + PAD} ${midY + PAD}, ${e.cx + PAD} ${midY + PAD}, ${e.cx + PAD} ${e.cy + PAD}`
          return <path key={i} d={d} fill="none" stroke="#D0DCF0" strokeWidth={1.5} strokeLinecap="round" />
        })}
      </svg>
      {allPositions.map(pos => {
        const node = nodes.find(n => n.id === pos.id)
        if (!node) return null
        const level = levels.find(l => l.id === node.levelId)
        const nextLevel = levels[levels.findIndex(l => l.id === node.levelId) + 1]
        return (
          <OrgChartCard
            key={node.id}
            node={{ ...node, x: pos.x + PAD, y: pos.y + PAD }}
            level={level}
            nextLevel={nextLevel}
            isSelected={selectedNodeId === node.id}
            onClick={() => onSelect(node)}
            onAssignLA={onAssignLA}
            onAddChild={onAddChild}
          />
        )
      })}
    </div>
  )
}

function ZoomableCanvas({ children }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    function onWheel(e) {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.12 : 0.9
      setZoom(z => {
        const newZ = Math.min(2.5, Math.max(0.15, z * factor))
        setPan(p => ({ x: mouseX - (mouseX - p.x) * (newZ / z), y: mouseY - (mouseY - p.y) * (newZ / z) }))
        return newZ
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function onMouseDown(e) {
    if (e.button !== 0) return
    setIsDragging(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }
  function onMouseMove(e) {
    if (!isDragging || !dragRef.current) return
    setPan({ x: dragRef.current.panX + (e.clientX - dragRef.current.startX), y: dragRef.current.panY + (e.clientY - dragRef.current.startY) })
  }
  function onMouseUp() { setIsDragging(false); dragRef.current = null }
  function zoomStep(delta) { setZoom(z => Math.min(2.5, Math.max(0.15, z + delta))) }
  function resetView() { setZoom(1); setPan({ x: 40, y: 40 }) }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', willChange: 'transform' }}>
        {children}
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-0.5 bg-white border border-border rounded-button shadow-sm px-1 py-1" onMouseDown={e => e.stopPropagation()}>
        <button onClick={() => zoomStep(-0.15)} className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors" title="Zoom out">
          <Minus size={13} />
        </button>
        <button onClick={resetView} className="text-xs text-secondary hover:text-primary w-10 text-center h-7 rounded-button hover:bg-surface transition-colors font-medium" title="Reset view">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={() => zoomStep(0.15)} className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors" title="Zoom in">
          <Plus size={13} />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button onClick={resetView} className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors" title="Fit to screen">
          <Maximize2 size={12} />
        </button>
      </div>
    </div>
  )
}

function CompactTreeRow({ node, levels, depth, selectedNodeId, collapsed, onSelect, onAddChild, onToggle }) {
  const level = levels.find(l => l.id === node.levelId)
  const nextLevel = levels[levels.findIndex(l => l.id === node.levelId) + 1]
  const hasChildren = node.children?.length > 0
  const isCollapsed = collapsed.has(node.id)
  const isSelected = selectedNodeId === node.id
  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-1.5 rounded-button cursor-pointer transition-colors text-xs ${isSelected ? 'bg-teal/10 text-teal' : 'hover:bg-surface text-primary'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: '8px' }}
        onClick={() => onSelect(node)}
      >
        <button onClick={e => { e.stopPropagation(); onToggle(node.id) }} className={`flex-shrink-0 transition-colors ${!hasChildren ? 'invisible' : 'text-secondary hover:text-primary'}`}>
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
        {level && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: level.color }} />}
        <span className="flex-1 truncate">{node.name}</span>
        {node.laName ? <CheckCircle size={12} className="text-success flex-shrink-0" /> : <AlertTriangle size={12} className="text-amber flex-shrink-0" />}
        {nextLevel && (
          <button onClick={e => { e.stopPropagation(); onAddChild(node) }} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-teal transition-all flex-shrink-0" title={`Add ${nextLevel.name}`}>
            <Plus size={11} />
          </button>
        )}
      </div>
      {hasChildren && !isCollapsed && node.children.map(child => (
        <CompactTreeRow key={child.id} node={child} levels={levels} depth={depth + 1} selectedNodeId={selectedNodeId} collapsed={collapsed} onSelect={onSelect} onAddChild={onAddChild} onToggle={onToggle} />
      ))}
    </div>
  )
}

function ListTreeNode({ node, levels, collapsed, selectedNodeId, onSelect, onAddChild, onToggle, onAssignLA }) {
  const level = levels.find(l => l.id === node.levelId)
  const nextLevel = levels[levels.findIndex(l => l.id === node.levelId) + 1]
  const hasChildren = node.children?.length > 0
  const isCollapsed = collapsed.has(node.id)
  const isSelected = selectedNodeId === node.id
  const isUnassigned = !node.laName
  return (
    <div className="mb-2">
      <div
        onClick={() => onSelect(node)}
        className={`group bg-white border rounded-card p-3 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-teal ring-1 ring-teal' : 'border-border'}`}
        style={isUnassigned ? { borderLeft: '4px solid #E6A817' } : { borderLeft: `4px solid ${level?.color ?? '#D0DCF0'}` }}
      >
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onToggle(node.id) }} className={`flex-shrink-0 text-secondary ${!hasChildren ? 'invisible' : 'hover:text-primary'}`}>
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
          {level && <span className="badge text-2xs flex-shrink-0" style={{ background: level.color + '18', color: level.color, border: `1px solid ${level.color}35` }}>{level.name}</span>}
          <span className="font-semibold text-sm text-primary flex-1 truncate">{node.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {nextLevel && <button onClick={e => { e.stopPropagation(); onAddChild(node) }} className="btn btn-ghost btn-sm text-2xs flex items-center gap-1 text-teal border border-teal/30 hover:bg-teal/10 rounded-button"><Plus size={10} /> {nextLevel.name}</button>}
            <button onClick={e => { e.stopPropagation(); onSelect(node) }} className="p-1 rounded-button text-secondary hover:text-primary hover:bg-surface"><Pencil size={12} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 pl-5 text-xs text-secondary">
          <span className="flex items-center gap-0.5"><Users size={11} /> {node.memberCount}</span>
          {node.laName ? <span className="flex items-center gap-1 text-success"><CheckCircle size={11} /> {node.laName}</span> : <button onClick={e => { e.stopPropagation(); onAssignLA(node) }} className="flex items-center gap-1 text-amber hover:underline"><AlertTriangle size={11} /> Assign LA</button>}
        </div>
      </div>
      {hasChildren && !isCollapsed && (
        <div className="pl-6 ml-2 mt-1 border-l-2 border-border/60 space-y-0">
          {node.children.map(child => <ListTreeNode key={child.id} node={child} levels={levels} collapsed={collapsed} selectedNodeId={selectedNodeId} onSelect={onSelect} onAddChild={onAddChild} onToggle={onToggle} onAssignLA={onAssignLA} />)}
        </div>
      )}
    </div>
  )
}

export default function CommunityTypeHierarchyBuilder({ initialTemplate, onChange, title = 'Community Type Template' }) {
  const initialLevels = useMemo(() => {
    const normalized = normalizeLevels(initialTemplate?.levels)
    return normalized.length ? normalized : [{ id: 'l1', name: 'Level 1', color: '#028090' }]
  }, [initialTemplate?.levels])
  const initialNodes = useMemo(() => normalizeNodes(initialTemplate?.nodes, initialLevels), [initialTemplate?.nodes, initialLevels])

  const [levels, setLevels] = useState(initialLevels)
  const [nodes, setNodes] = useState(initialNodes)
  const [panelMode, setPanelMode] = useState('levels')
  const [selectedNode, setSelectedNode] = useState(null)
  const [addCtx, setAddCtx] = useState(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [treeViewMode, setTreeViewMode] = useState('org')
  const [collapsed, setCollapsed] = useState(new Set())
  const [unassignedFilter, setUnassignedFilter] = useState(false)
  const [nodesExpanded, setNodesExpanded] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)
  const [dragLevelIdx, setDragLevelIdx] = useState(null)
  const [dragOverLevelIdx, setDragOverLevelIdx] = useState(null)
  const [removeLAConfirm, setRemoveLAConfirm] = useState(false)
  const [deleteNodeConfirm, setDeleteNodeConfirm] = useState(false)
  const [deleteNodeMode, setDeleteNodeMode] = useState('delete_subtree')
  const [deleteLevelId, setDeleteLevelId] = useState(null)
  const [editingLevelId, setEditingLevelId] = useState(null)
  const [editingLevelName, setEditingLevelName] = useState('')
  const [colorPickerLevelId, setColorPickerLevelId] = useState(null)
  const [showAddLevel, setShowAddLevel] = useState(false)
  const [newLevelName, setNewLevelName] = useState('')
  const [newLevelColor, setNewLevelColor] = useState('#028090')
  const [editNameValue, setEditNameValue] = useState('')
  const [editNameError, setEditNameError] = useState('')
  const [addNodeName, setAddNodeName] = useState('')
  const [addNodeError, setAddNodeError] = useState('')

  useEffect(() => {
    if (!onChange) return
    onChange({ levels: levels.map((level, index) => ({ ...level, index })), nodes })
  }, [levels, nodes, onChange])

  useEffect(() => {
    if (selectedNode) {
      const updated = nodes.find(n => n.id === selectedNode.id)
      if (updated) setSelectedNode(updated)
    }
  }, [nodes, selectedNode])

  const tree = useMemo(() => buildTree(nodes), [nodes])
  const assignedCount = nodes.filter(n => n.laName).length
  const unassignedCount = nodes.filter(n => !n.laName).length
  const displayNodes = unassignedFilter ? nodes.filter(n => !n.laName) : null

  const getLevelByNode = node => levels.find(l => l.id === node.levelId) || levels[0]
  const getLevelIdx = levelId => levels.findIndex(l => l.id === levelId)
  const countDirectChildren = nodeId => nodes.filter(n => n.parentId === nodeId).length
  const countDescendants = nodeId => nodes.filter(n => n.parentId === nodeId).reduce((sum, c) => sum + 1 + countDescendants(c.id), 0)
  const getPath = nodeId => {
    const path = []
    let current = nodes.find(n => n.id === nodeId)
    while (current) {
      path.unshift(current.name)
      current = current.parentId ? nodes.find(n => n.id === current.parentId) : null
    }
    return path.join(' › ')
  }

  function handleSelectNode(node) {
    setSelectedNode(node)
    setPanelMode('edit')
    setRemoveLAConfirm(false)
    setDeleteNodeConfirm(false)
    setDeleteNodeMode('delete_subtree')
    setEditNameValue(node.name)
    setEditNameError('')
    if (leftCollapsed) setLeftCollapsed(false)
  }

  function handleAddChild(node) {
    const next = levels[getLevelIdx(node.levelId) + 1]
    if (!next) return
    setAddCtx({ levelId: next.id, levelName: next.name, parentId: node.id, parentName: node.name })
    setAddNodeName('')
    setAddNodeError('')
    setPanelMode('add')
    if (leftCollapsed) setLeftCollapsed(false)
  }

  function handleAddRootNode() {
    if (!levels[0]) {
      toast.error('Add at least one level first')
      return
    }
    setAddCtx({ levelId: levels[0].id, levelName: levels[0].name, parentId: null, parentName: 'Root' })
    setAddNodeName('')
    setAddNodeError('')
    setPanelMode('add')
    if (leftCollapsed) setLeftCollapsed(false)
  }

  function handleCreateNode() {
    const name = addNodeName.trim()
    if (!name) { setAddNodeError('Name is required'); return }
    const siblings = nodes.filter(n => n.parentId === addCtx.parentId)
    if (siblings.some(n => n.name.toLowerCase() === name.toLowerCase())) { setAddNodeError('Name already exists'); return }
    setNodes(prev => [...prev, {
      id: `n-${Date.now()}`,
      name,
      levelId: addCtx.levelId,
      parentId: addCtx.parentId,
      laId: null, laName: null, laEmail: null, laPhone: null,
      memberCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }])
    toast.success(`"${name}" created ✓`)
    setPanelMode('levels')
    setAddCtx(null)
  }

  function handleSaveName(nodeId) {
    const newName = editNameValue.trim()
    if (newName.length < 2) { setEditNameError('Minimum 2 characters'); return }
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const siblings = nodes.filter(n => n.parentId === node.parentId && n.id !== nodeId)
    if (siblings.some(n => n.name.toLowerCase() === newName.toLowerCase())) { setEditNameError('Name already exists'); return }
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, name: newName } : n))
    setEditNameError('')
    toast.success('Node renamed ✓')
  }

  function handleRemoveLA(nodeId) {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, laId: null, laName: null, laEmail: null, laPhone: null } : n))
    setRemoveLAConfirm(false)
    toast.success('Level Admin removed')
  }

  function handleDeleteNode(nodeId, mode = 'delete_subtree') {
    const targetNode = nodes.find(n => n.id === nodeId)
    if (!targetNode) return

    if (mode === 'merge_to_parent') {
      if (!targetNode.parentId) {
        toast.error('Top-level nodes cannot be merged upward')
        return
      }
      const parentNode = nodes.find(n => n.id === targetNode.parentId)
      const directChildrenCount = nodes.filter(n => n.parentId === nodeId).length
      setNodes(prev =>
        prev
          .map(n => (n.parentId === nodeId ? { ...n, parentId: targetNode.parentId } : n))
          .filter(n => n.id !== nodeId)
      )
      setSelectedNode(null)
      setPanelMode('levels')
      setDeleteNodeConfirm(false)
      setDeleteNodeMode('delete_subtree')
      toast.success(
        `Deleted "${targetNode.name}" and moved ${directChildrenCount} child node${directChildrenCount !== 1 ? 's' : ''} to ${parentNode?.name || 'parent'}`
      )
      return
    }

    const idsToDelete = new Set([nodeId, ...collectDescendantIds(nodeId, nodes)])
    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)))
    setSelectedNode(null)
    setPanelMode('levels')
    setDeleteNodeConfirm(false)
    setDeleteNodeMode('delete_subtree')
    toast.success(`Deleted ${idsToDelete.size} node${idsToDelete.size > 1 ? 's' : ''}`)
  }

  function handleAssignLA(member) {
    setNodes(prev => prev.map(n => {
      if (n.laId === member.id && n.id !== assignTarget.id) return { ...n, laId: null, laName: null, laEmail: null, laPhone: null }
      if (n.id === assignTarget.id) return { ...n, laId: member.id, laName: member.name, laEmail: member.email, laPhone: member.phone }
      return n
    }))
    toast.success(`${member.name} assigned as Level Admin of ${assignTarget.name} ✓`)
    setAssignModalOpen(false)
    setAssignTarget(null)
  }

  function handleLevelDrop(e, idx) {
    e.preventDefault()
    if (dragLevelIdx === null || dragLevelIdx === idx) { setDragLevelIdx(null); setDragOverLevelIdx(null); return }
    const next = [...levels]
    const [moved] = next.splice(dragLevelIdx, 1)
    next.splice(idx, 0, moved)
    setLevels(next)
    setDragLevelIdx(null)
    setDragOverLevelIdx(null)
  }

  function handleSaveLevelName(levelId) {
    const name = editingLevelName.trim()
    if (name.length < 2) return
    setLevels(prev => prev.map(l => l.id === levelId ? { ...l, name } : l))
    setEditingLevelId(null)
    toast.success('Level renamed ✓')
  }

  function handleDeleteLevel(levelId) {
    const hasNodes = nodes.some(n => n.levelId === levelId)
    if (hasNodes) { toast.error('Remove nodes in this level first'); return }
    setDeleteLevelId(levelId)
  }

  function confirmDeleteLevel(levelId) {
    setLevels(prev => prev.filter(l => l.id !== levelId))
    setDeleteLevelId(null)
    toast.success('Level deleted')
  }

  function handleAddLevel() {
    const name = newLevelName.trim()
    if (name.length < 2) return
    setLevels(prev => [...prev, { id: `l${Date.now()}`, name, color: newLevelColor }])
    setNewLevelName('')
    setNewLevelColor('#028090')
    setShowAddLevel(false)
    toast.success(`${name} level added ✓`)
  }

  function handleToggleNode(nodeId) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="border-b border-border bg-white px-4 py-3 flex-shrink-0 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-primary">Hierarchy Builder</h3>
            <p className="text-2xs text-secondary">Create from scratch for this community type</p>
          </div>
          <ViewToggle value={treeViewMode} onChange={setTreeViewMode} firstValue="org" secondValue="list" />
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          <div className={`flex-shrink-0 border-r border-border bg-white flex flex-col transition-all duration-200 ease-in-out overflow-hidden ${leftCollapsed ? 'w-10' : 'w-[300px]'}`}>
            {leftCollapsed ? (
              <div className="flex flex-col items-center pt-3 gap-3">
                <button onClick={() => setLeftCollapsed(false)} className="p-2 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors" title="Expand panel">
                  <PanelLeftOpen size={16} />
                </button>
                {levels.map(l => <div key={l.id} className="w-3 h-3 rounded-full" style={{ background: l.color }} title={l.name} />)}
              </div>
            ) : (
              <>
                <div className="px-3 pt-3 pb-2 border-b border-border flex-shrink-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-2xs font-medium text-secondary">{title}</label>
                    <button onClick={() => setLeftCollapsed(true)} className="p-1 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors" title="Collapse panel">
                      <PanelLeftClose size={14} />
                    </button>
                  </div>
                  <p className="text-2xs text-secondary">{levels.length} levels · {nodes.length} nodes {unassignedCount > 0 && <span className="text-amber font-medium">· {unassignedCount} unassigned ⚠</span>}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {panelMode === 'levels' && (
                    <div className="flex flex-col gap-2">
                      <div className="mb-1">
                        <p className="text-2xs font-semibold text-secondary uppercase tracking-widest">Hierarchy Levels</p>
                        <p className="text-2xs text-secondary mt-0.5">Drag to reorder · Rename inline</p>
                      </div>
                      {levels.map((level, idx) => (
                        <div key={level.id}>
                          {deleteLevelId === level.id ? (
                            <div className="border border-danger/30 rounded-button p-3 bg-danger/5">
                              <p className="text-xs font-medium text-danger mb-2">Delete <strong>{level.name}</strong>?</p>
                              <div className="flex gap-2">
                                <button className="btn btn-sm btn-outline flex-1" onClick={() => setDeleteLevelId(null)}>Cancel</button>
                                <button className="btn btn-sm btn-danger flex-1" onClick={() => confirmDeleteLevel(level.id)}>Delete</button>
                              </div>
                            </div>
                          ) : (
                            <div
                              draggable
                              onDragStart={() => setDragLevelIdx(idx)}
                              onDragOver={e => { e.preventDefault(); setDragOverLevelIdx(idx) }}
                              onDrop={e => handleLevelDrop(e, idx)}
                              onDragEnd={() => { setDragLevelIdx(null); setDragOverLevelIdx(null) }}
                              className={`bg-white border border-border rounded-button p-3 transition-all ${dragOverLevelIdx === idx ? 'opacity-60 bg-teal/5' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical size={14} className="text-secondary cursor-grab flex-shrink-0" />
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: level.color }} />
                                {editingLevelId === level.id ? (
                                  <input className="flex-1 text-sm bg-transparent border-0 border-b border-teal outline-none" value={editingLevelName} autoFocus onChange={e => setEditingLevelName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveLevelName(level.id); if (e.key === 'Escape') setEditingLevelId(null) }} onBlur={() => handleSaveLevelName(level.id)} />
                                ) : (
                                  <span className="flex-1 text-sm font-medium text-primary">{level.name}</span>
                                )}
                                <button onClick={() => { setEditingLevelId(level.id); setEditingLevelName(level.name) }} className="p-1 rounded text-secondary hover:text-primary transition-colors"><Pencil size={12} /></button>
                                <button onClick={() => setColorPickerLevelId(colorPickerLevelId === level.id ? null : level.id)} className="p-1 rounded text-secondary hover:text-primary transition-colors"><Palette size={12} /></button>
                                <button onClick={() => handleDeleteLevel(level.id)} className="p-1 rounded text-secondary hover:text-danger transition-colors"><Trash2 size={12} /></button>
                              </div>
                              {colorPickerLevelId === level.id && <ColorPicker color={level.color} onChange={color => setLevels(prev => prev.map(l => l.id === level.id ? { ...l, color } : l))} />}
                            </div>
                          )}
                        </div>
                      ))}
                      {showAddLevel ? (
                        <div className="border border-border rounded-button p-3 bg-surface mt-1">
                          <p className="text-xs font-medium text-primary mb-2">New Level</p>
                          <input className="input text-sm mb-2" placeholder="Level Name" value={newLevelName} onChange={e => setNewLevelName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddLevel() }} autoFocus />
                          <p className="text-2xs text-secondary mb-1.5">Color</p>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {COLOR_SWATCHES.map(s => <button key={s} type="button" onClick={() => setNewLevelColor(s)} className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex-shrink-0" style={{ background: s, boxShadow: newLevelColor === s ? `0 0 0 2px white, 0 0 0 3.5px ${s}` : undefined, borderColor: newLevelColor === s ? s : 'transparent' }} />)}
                          </div>
                          <div className="flex gap-2">
                            <button className="btn btn-outline btn-sm flex-1" onClick={() => { setShowAddLevel(false); setNewLevelName('') }}>Cancel</button>
                            <button className="btn btn-primary btn-sm flex-1" onClick={handleAddLevel} disabled={newLevelName.trim().length < 2}>Add Level</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddLevel(true)} className="border border-dashed border-border text-secondary text-xs hover:border-teal hover:text-teal rounded-button py-2 w-full transition-colors flex items-center justify-center gap-1.5 mt-1">
                          <Plus size={13} /> Add Level
                        </button>
                      )}

                      <div className="mt-4">
                        <button onClick={() => setNodesExpanded(v => !v)} className="flex items-center gap-1 w-full mb-1.5">
                          {nodesExpanded ? <ChevronDown size={12} className="text-secondary" /> : <ChevronRight size={12} className="text-secondary" />}
                          <p className="text-2xs font-semibold text-secondary uppercase tracking-widest flex-1">Nodes</p>
                          <span className="text-2xs text-secondary">{nodes.length}</span>
                        </button>
                        {nodesExpanded && (nodes.length === 0
                          ? <p className="text-2xs text-secondary text-center py-3">No nodes yet</p>
                          : buildTree(nodes).map(root => <CompactTreeRow key={root.id} node={root} levels={levels} depth={0} selectedNodeId={selectedNode?.id} collapsed={collapsed} onSelect={handleSelectNode} onAddChild={handleAddChild} onToggle={handleToggleNode} />))}
                      </div>
                    </div>
                  )}

                  {panelMode === 'add' && addCtx && (
                    <div>
                      <button onClick={() => setPanelMode('levels')} className="text-teal text-xs cursor-pointer mb-4 flex items-center gap-1 hover:underline">← Back</button>
                      <p className="text-2xs font-semibold text-secondary uppercase tracking-widest mb-0.5">Add Node</p>
                      <p className="text-xs text-secondary mb-4">Adding a <strong>{addCtx.levelName}</strong> under <strong>{addCtx.parentName}</strong></p>
                      <div className="mb-4">
                        <label className="text-xs font-medium text-primary block mb-1">Name <span className="text-danger">*</span></label>
                        <input className={`input text-sm ${addNodeError ? 'border-danger' : ''}`} placeholder="Node name" value={addNodeName} onChange={e => { setAddNodeName(e.target.value); setAddNodeError('') }} onKeyDown={e => { if (e.key === 'Enter') handleCreateNode() }} autoFocus />
                        {addNodeError && <p className="text-danger text-xs mt-1">{addNodeError}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline flex-1" onClick={() => setPanelMode('levels')}>Cancel</button>
                        <button className="btn btn-primary flex-1" onClick={handleCreateNode} disabled={!addNodeName.trim()}>Create Node</button>
                      </div>
                    </div>
                  )}

                  {panelMode === 'edit' && selectedNode && (
                    <div>
                      <button onClick={() => { setPanelMode('levels'); setSelectedNode(null) }} className="text-teal text-xs cursor-pointer mb-4 flex items-center gap-1 hover:underline">← Back</button>
                      <p className="text-2xs font-semibold text-secondary uppercase tracking-widest mb-2">Editing Node</p>
                      <div className="mb-1">
                        <label className="text-2xs text-secondary block mb-1">Name</label>
                        <div className="flex gap-2">
                          <input className={`input text-sm flex-1 ${editNameError ? 'border-danger' : ''}`} value={editNameValue} onChange={e => { setEditNameValue(e.target.value); setEditNameError('') }} onKeyDown={e => { if (e.key === 'Enter') handleSaveName(selectedNode.id) }} />
                          <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => handleSaveName(selectedNode.id)} disabled={!editNameValue.trim()}>Save</button>
                        </div>
                        {editNameError && <p className="text-danger text-xs mt-1">{editNameError}</p>}
                      </div>
                      <p className="text-2xs text-secondary mb-4">{getPath(selectedNode.id)}</p>

                      <div className="border-t border-border pt-3 mt-3">
                        <p className="text-xs font-semibold text-primary mb-3">Level Admin</p>
                        {selectedNode.laName ? (
                          <div>
                            <div className="flex items-start gap-2 mb-3">
                              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-sm flex-shrink-0">{getInitials(selectedNode.laName)}</div>
                              <div>
                                <p className="font-semibold text-sm text-primary">{selectedNode.laName}</p>
                                <p className="text-xs text-secondary">{selectedNode.laEmail}</p>
                                <p className="text-xs text-secondary">{selectedNode.laPhone}</p>
                              </div>
                            </div>
                            {removeLAConfirm ? (
                              <div className="bg-danger/5 border border-danger/20 rounded-button p-3">
                                <p className="text-xs text-danger mb-2">Remove <strong>{selectedNode.laName}</strong>?</p>
                                <div className="flex gap-2">
                                  <button className="btn btn-outline btn-sm flex-1" onClick={() => setRemoveLAConfirm(false)}>Cancel</button>
                                  <button className="btn btn-sm flex-1 border border-danger text-danger hover:bg-danger hover:text-white rounded-button" onClick={() => handleRemoveLA(selectedNode.id)}>Remove</button>
                                </div>
                              </div>
                            ) : (
                              <button className="text-xs border border-danger text-danger hover:bg-danger hover:text-white rounded-button px-3 h-8 transition-colors" onClick={() => setRemoveLAConfirm(true)}>Remove Level Admin</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => { setAssignTarget(selectedNode); setAssignModalOpen(true) }} className="bg-amber/10 border border-amber text-amber-dark hover:bg-amber hover:text-white rounded-button text-sm px-4 h-9 transition-colors w-full">Assign Level Admin</button>
                        )}
                      </div>

                      <div className="border-t border-border pt-3 mt-3">
                        <p className="text-xs font-semibold text-primary mb-2">Stats</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Members', value: selectedNode.memberCount },
                            { label: 'Direct sub', value: countDirectChildren(selectedNode.id) },
                            { label: 'Descendants', value: countDescendants(selectedNode.id) },
                            { label: 'Created', value: formatDate(selectedNode.createdAt) },
                          ].map(s => (
                            <div key={s.label} className="bg-surface rounded-button p-2">
                              <p className="text-2xs text-secondary">{s.label}</p>
                              <p className="text-sm font-semibold text-primary">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-danger/20 pt-3 mt-3">
                        <p className="text-xs font-semibold text-danger mb-1">Danger Zone</p>
                        {deleteNodeConfirm ? (
                          <div className="bg-danger/5 border border-danger/20 rounded-button p-3">
                            <p className="text-xs text-danger mb-1">Delete <strong>{selectedNode.name}</strong>?</p>
                            {countDescendants(selectedNode.id) > 0 ? (
                              <>
                                <p className="text-xs text-danger/80 mb-2">
                                  This node has <strong>{countDescendants(selectedNode.id)}</strong> child node{countDescendants(selectedNode.id) !== 1 ? 's' : ''}. Choose what to do:
                                </p>
                                <div className="space-y-1.5 mb-2.5">
                                  {selectedNode.parentId && (
                                    <label className="flex items-start gap-2 text-xs text-primary">
                                      <input
                                        type="radio"
                                        name="delete-mode"
                                        value="merge_to_parent"
                                        checked={deleteNodeMode === 'merge_to_parent'}
                                        onChange={e => setDeleteNodeMode(e.target.value)}
                                        className="mt-0.5"
                                      />
                                      <span>Delete only this node and move direct children to the parent node</span>
                                    </label>
                                  )}
                                  <label className="flex items-start gap-2 text-xs text-primary">
                                    <input
                                      type="radio"
                                      name="delete-mode"
                                      value="delete_subtree"
                                      checked={deleteNodeMode === 'delete_subtree'}
                                      onChange={e => setDeleteNodeMode(e.target.value)}
                                      className="mt-0.5"
                                    />
                                    <span>Delete this node and all children under it</span>
                                  </label>
                                  {!selectedNode.parentId && (
                                    <p className="text-2xs text-secondary">Merge is unavailable for top-level nodes.</p>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-danger/80 mb-2">This action cannot be undone.</p>
                            )}
                            <div className="flex gap-2">
                              <button className="btn btn-outline btn-sm flex-1" onClick={() => setDeleteNodeConfirm(false)}>Cancel</button>
                              <button className="btn btn-sm flex-1 bg-danger text-white hover:bg-danger/90 rounded-button" onClick={() => handleDeleteNode(selectedNode.id, deleteNodeMode)}>
                                {deleteNodeMode === 'merge_to_parent' ? 'Delete & Merge' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button className="border border-danger text-danger hover:bg-danger hover:text-white rounded-button text-sm px-4 h-9 transition-colors w-full" onClick={() => { setDeleteNodeMode('delete_subtree'); setDeleteNodeConfirm(true) }}>Delete Node</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-surface overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-white flex-shrink-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {leftCollapsed && <button onClick={() => setLeftCollapsed(false)} className="p-1.5 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors flex-shrink-0"><PanelLeftOpen size={15} /></button>}
                <span className="text-sm font-semibold text-primary truncate">{title}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {levels[0] && (
                  <button className="btn btn-ghost btn-sm text-xs" onClick={handleAddRootNode}>
                    + Add {levels[0].name}
                  </button>
                )}
                {treeViewMode === 'list' && (
                  <>
                    <button className="btn btn-ghost btn-sm text-xs" onClick={() => setCollapsed(new Set())}>Expand All</button>
                    <button className="btn btn-ghost btn-sm text-xs" onClick={() => setCollapsed(new Set(nodes.map(n => n.id)))}>Collapse</button>
                  </>
                )}
                {unassignedCount > 0 && (
                  <button onClick={() => setUnassignedFilter(v => !v)} className={`flex items-center gap-1.5 rounded-button text-xs h-8 px-2.5 border transition-colors ${unassignedFilter ? 'bg-amber text-white border-amber' : 'bg-amber/10 text-amber border-amber/40'}`}>
                    {unassignedFilter ? <><X size={12} /> Clear</> : <><AlertTriangle size={12} /> {unassignedCount} unassigned</>}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <p className="text-sm font-semibold text-primary mb-1">No nodes yet</p>
                  <p className="text-xs text-secondary mb-4">Add your first {levels[0]?.name || 'node'} to get started</p>
                  <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={handleAddRootNode}>
                    <Plus size={14} /> Add {levels[0]?.name || 'Node'}
                  </button>
                </div>
              ) : unassignedFilter ? (
                <div className="overflow-auto h-full p-6">
                  <p className="text-xs text-secondary mb-4 font-medium">{displayNodes.length} unassigned node{displayNodes.length !== 1 ? 's' : ''}</p>
                  <div className="max-w-2xl space-y-2">
                    {displayNodes.map(node => (
                      <div key={node.id} onClick={() => handleSelectNode(node)} className={`bg-white border rounded-card p-3 cursor-pointer hover:shadow-md transition-all ${selectedNode?.id === node.id ? 'border-teal ring-1 ring-teal' : 'border-border'}`} style={{ borderLeft: '4px solid #E6A817' }}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-primary flex-1">{node.name}</span>
                          <button onClick={e => { e.stopPropagation(); setAssignTarget(node); setAssignModalOpen(true) }} className="bg-amber/10 border border-amber text-amber-dark hover:bg-amber hover:text-white rounded-button text-xs px-2.5 h-7 transition-colors">Assign LA</button>
                        </div>
                        <p className="text-2xs text-secondary mt-1">{getPath(node.id)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : treeViewMode === 'org' ? (
                <ZoomableCanvas>
                  <OrgChartCanvas nodes={nodes} levels={levels} selectedNodeId={selectedNode?.id} onSelect={handleSelectNode} onAssignLA={node => { setAssignTarget(node); setAssignModalOpen(true) }} onAddChild={handleAddChild} />
                </ZoomableCanvas>
              ) : (
                <div className="overflow-auto h-full p-6">
                  <div className="max-w-2xl">
                    {tree.map(root => <ListTreeNode key={root.id} node={root} levels={levels} collapsed={collapsed} selectedNodeId={selectedNode?.id} onSelect={handleSelectNode} onAddChild={handleAddChild} onToggle={handleToggleNode} onAssignLA={node => { setAssignTarget(node); setAssignModalOpen(true) }} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-white px-4 py-2.5 flex-shrink-0 flex items-center gap-3 flex-wrap text-xs">
          <span className="font-semibold text-primary">{title}</span>
          <span className="text-secondary">{levels.length} levels · {nodes.length} nodes</span>
          <span className="text-success font-medium">{assignedCount} assigned</span>
          {unassignedCount > 0 && <span className="text-amber font-medium">{unassignedCount} unassigned ⚠</span>}
          <button className="btn btn-primary btn-sm ml-auto" type="button" onClick={() => toast.success('Template changes are auto-saved')}>
            Auto-saved ✓
          </button>
        </div>
      </div>

      <AssignLAModal
        open={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setAssignTarget(null) }}
        targetNode={assignTarget}
        levels={levels}
        nodes={nodes}
        onConfirm={handleAssignLA}
      />
    </>
  )
}
