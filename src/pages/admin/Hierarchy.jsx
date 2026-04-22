 import { useState, useEffect, useRef } from 'react'
import {
  GripVertical, Pencil, Palette, Trash2, ChevronDown, ChevronRight,
  Plus, Minus, Check, AlertTriangle, CheckCircle, Search, X, Building2,
  GitBranch, PanelLeftClose, PanelLeftOpen, Users,
  Maximize2, ArrowLeft, Layers, CheckCircle2, PlusCircle, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import ViewToggle from '../../components/ViewToggle'
import Pagination from '../../components/Pagination'
import FilterBar from '../../components/FilterBar'
import Select from '../../components/Select'
import { tenants, HIERARCHY_PRESETS } from '../../data/tenants'
import useMasterSettingsStore from '../../store/masterSettingsStore'
import { members } from '../../data/members'

// ─── Static hierarchy data ────────────────────────────────────────────────────

const TENANT_HIERARCHY = {
  'tenant-001': {
    levels: [
      { id: 'l1', name: 'Zone',    color: '#028090' },
      { id: 'l2', name: 'Chapter', color: '#1B3A6B' },
      { id: 'l3', name: 'Group',   color: '#E6A817' },
    ],
    nodes: [
      { id:'n-z1', name:'North Zone',       levelId:'l1', parentId:null,   laId:'la005', laName:'Tushar Jain',    laEmail:'tushar@bnimumbai.com',  laPhone:'+91 98201 20005', memberCount:180, createdAt:'2024-02-16' },
      { id:'n-z2', name:'South Zone',       levelId:'l1', parentId:null,   laId:'la006', laName:'Priti Shetty',   laEmail:'priti@bnimumbai.com',   laPhone:'+91 98201 20006', memberCount:60,  createdAt:'2024-02-16' },
      { id:'n-c1', name:'Andheri Chapter',  levelId:'l2', parentId:'n-z1', laId:'la001', laName:'Hardik Patel',   laEmail:'hardik@bnimumbai.com',  laPhone:'+91 98201 20001', memberCount:47,  createdAt:'2024-02-16' },
      { id:'n-c2', name:'Borivali Chapter', levelId:'l2', parentId:'n-z1', laId:'la002', laName:'Sneha Kapoor',   laEmail:'sneha@bnimumbai.com',   laPhone:'+91 98201 20002', memberCount:42,  createdAt:'2024-02-18' },
      { id:'n-c3', name:'Bandra Chapter',   levelId:'l2', parentId:'n-z2', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:38,  createdAt:'2024-02-20' },
      { id:'n-c4', name:'Worli Chapter',    levelId:'l2', parentId:'n-z2', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:22,  createdAt:'2024-02-20' },
      { id:'n-g1', name:'Morning Group',    levelId:'l3', parentId:'n-c1', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:24,  createdAt:'2024-02-22' },
      { id:'n-g2', name:'Evening Group',    levelId:'l3', parentId:'n-c1', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:23,  createdAt:'2024-02-22' },
      { id:'n-g3', name:'Sunrise Group',    levelId:'l3', parentId:'n-c2', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:22,  createdAt:'2024-02-24' },
      { id:'n-g4', name:'Weekend Group',    levelId:'l3', parentId:'n-c2', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:20,  createdAt:'2024-02-24' },
      { id:'n-g5', name:'Alpha Group',      levelId:'l3', parentId:'n-c3', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:20,  createdAt:'2024-02-26' },
      { id:'n-g6', name:'Beta Group',       levelId:'l3', parentId:'n-c3', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:18,  createdAt:'2024-02-26' },
      { id:'n-g7', name:'Core Group',       levelId:'l3', parentId:'n-c4', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:12,  createdAt:'2024-02-28' },
      { id:'n-g8', name:'Growth Group',     levelId:'l3', parentId:'n-c4', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:10,  createdAt:'2024-02-28' },
      { id:'n-g9', name:'Bridge Group',     levelId:'l3', parentId:'n-c4', laId:null,    laName:null,             laEmail:null,                    laPhone:null,              memberCount:5,   createdAt:'2024-03-01' },
    ],
  },
  'tenant-002': {
    levels: [
      { id: 'l1', name: 'Batch', color: '#7C3AED' },
      { id: 'l2', name: 'City',  color: '#028090' },
    ],
    nodes: [
      { id:'t2-b1', name:'2019 Batch', levelId:'l1', parentId:null,    laId:null, laName:null, laEmail:null, laPhone:null, memberCount:220, createdAt:'2024-02-22' },
      { id:'t2-b2', name:'2020 Batch', levelId:'l1', parentId:null,    laId:null, laName:null, laEmail:null, laPhone:null, memberCount:180, createdAt:'2024-02-22' },
      { id:'t2-c1', name:'Mumbai',     levelId:'l2', parentId:'t2-b1', laId:null, laName:null, laEmail:null, laPhone:null, memberCount:92,  createdAt:'2024-02-25' },
      { id:'t2-c2', name:'Delhi',      levelId:'l2', parentId:'t2-b1', laId:null, laName:null, laEmail:null, laPhone:null, memberCount:78,  createdAt:'2024-02-25' },
      { id:'t2-c3', name:'Pune',       levelId:'l2', parentId:'t2-b1', laId:null, laName:null, laEmail:null, laPhone:null, memberCount:50,  createdAt:'2024-02-25' },
      { id:'t2-c4', name:'Mumbai',     levelId:'l2', parentId:'t2-b2', laId:null, laName:null, laEmail:null, laPhone:null, memberCount:88,  createdAt:'2024-02-28' },
      { id:'t2-c5', name:'Bengaluru',  levelId:'l2', parentId:'t2-b2', laId:null, laName:null, laEmail:null, laPhone:null, memberCount:62,  createdAt:'2024-02-28' },
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitialLevels(tid) {
  if (TENANT_HIERARCHY[tid]) return TENANT_HIERARCHY[tid].levels
  const t = tenants.find(x => x.id === tid)
  const preset = HIERARCHY_PRESETS.find(p => p.suggestedFor?.includes(t?.type)) || HIERARCHY_PRESETS[0]
  const colors = ['#028090', '#1B3A6B', '#E6A817', '#2E7D32']
  return preset.levels.map((name, i) => ({ id: `l${i + 1}`, name, color: colors[i] || '#546E7A' }))
}

function getInitialNodes(tid) {
  return TENANT_HIERARCHY[tid]?.nodes || []
}

function normalizeTemplateLevels(rawLevels = []) {
  const COLORS = ['#028090', '#1B3A6B', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']
  const levels = Array.isArray(rawLevels) ? rawLevels : []
  return levels
    .map((level, idx) => {
      if (typeof level === 'string') {
        return { id: `l${idx + 1}`, name: level.trim(), color: COLORS[idx] || '#546E7A' }
      }
      return {
        id: level?.id || `l${idx + 1}`,
        name: (level?.name || '').trim(),
        color: level?.color || COLORS[idx] || '#546E7A',
      }
    })
    .filter(level => level.name)
}

function normalizeTemplateNodes(rawNodes = [], levels = []) {
  const nodes = Array.isArray(rawNodes) ? rawNodes : []
  const validLevelIds = new Set(levels.map(l => l.id))
  const today = new Date().toISOString().split('T')[0]
  return nodes
    .map((node, idx) => ({
      id: node?.id || `n-${Date.now()}-${idx + 1}`,
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

function resolveInitialHierarchy(tenantId, template) {
  if (template) {
    const levels = normalizeTemplateLevels(template.levels)
    return {
      levels: levels.length ? levels : getInitialLevels(tenantId),
      nodes: normalizeTemplateNodes(template.nodes, levels),
    }
  }
  return {
    levels: getInitialLevels(tenantId),
    nodes: getInitialNodes(tenantId),
  }
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
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function formatDate(ds) {
  if (!ds) return '—'
  return new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const COLOR_SWATCHES = ['#1B3A6B', '#028090', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']

// ─── Org Chart Layout Engine ──────────────────────────────────────────────────

const NODE_W  = 152
const NODE_H  = 80
const H_GAP   = 20
const V_GAP   = 48

function computeSubtreeLayout(node) {
  if (!node.children?.length) {
    return { width: NODE_W, nodeX: 0 }
  }
  let cursor = 0
  const childOffsets = []
  node.children.forEach((child, i) => {
    const cl = computeSubtreeLayout(child)
    childOffsets.push({ offset: cursor, width: cl.width })
    cursor += cl.width + (i < node.children.length - 1 ? H_GAP : 0)
  })
  const totalChildWidth = cursor
  const totalWidth      = Math.max(totalChildWidth, NODE_W)
  const nodeX           = (totalChildWidth - NODE_W) / 2
  return { width: totalWidth, nodeX, childOffsets }
}

function assignPositions(node, baseX, baseY, layoutCache, positions = [], edges = []) {
  const layout = layoutCache.get(node.id) || computeSubtreeLayout(node)
  layoutCache.set(node.id, layout)
  const nodeAbsX = baseX + layout.nodeX
  const cx       = nodeAbsX + NODE_W / 2
  const cy       = baseY + NODE_H
  positions.push({ id: node.id, x: nodeAbsX, y: baseY, cx, cy })

  if (node.children?.length && layout.childOffsets) {
    node.children.forEach((child, i) => {
      const childLayout    = computeSubtreeLayout(child)
      layoutCache.set(child.id, childLayout)
      const childOffsetX   = baseX + layout.childOffsets[i].offset
      const childAbsX      = childOffsetX + childLayout.nodeX
      const childCX        = childAbsX + NODE_W / 2
      const childY         = baseY + NODE_H + V_GAP
      edges.push({ px: cx, py: cy, cx: childCX, cy: childY })
      assignPositions(child, childOffsetX, childY, layoutCache, positions, edges)
    })
  }
  return { positions, edges }
}

// ─── ColorPicker ──────────────────────────────────────────────────────────────

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

// ─── AssignLAModal ────────────────────────────────────────────────────────────

function AssignLAModal({ open, onClose, targetNode, levels, nodes, onConfirm }) {
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    if (open) { setSearch(''); setSelectedMember(null) }
  }, [open])

  if (!targetNode) return null

  const level    = levels.find(l => l.id === targetNode.levelId)
  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.business.toLowerCase().includes(q)
  })

  function getAlreadyLANode(mid) {
    return nodes.find(n => n.laId === mid && n.id !== targetNode.id) || null
  }

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
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-secondary">No members found</div>
          )}
          {filtered.map(m => {
            const otherNode = getAlreadyLANode(m.id)
            const isSel     = selectedMember?.id === m.id
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

// ─── Org Chart Node Card ──────────────────────────────────────────────────────

function OrgChartCard({ node, level, isSelected, onClick, onAssignLA, onAddChild, nextLevel }) {
  const isUnassigned = !node.laName
  return (
    <div
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}
      className={`
        group absolute bg-white rounded-card cursor-pointer transition-all
        hover:shadow-lg hover:z-10
        ${isSelected ? 'ring-2 ring-teal shadow-md z-10' : 'shadow-sm border border-border'}
      `}
      style={{ width: NODE_W, height: NODE_H, top: node.y, left: node.x }}
    >
      {/* Level color bar */}
      <div className="h-1.5 rounded-t-card" style={{ background: level?.color ?? '#546E7A' }} />

      <div className="px-3 py-2 flex flex-col justify-between h-[calc(100%-6px)]">
        <div>
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-semibold text-primary leading-tight truncate flex-1">{node.name}</p>
            {isUnassigned
              ? <AlertTriangle size={11} className="text-amber flex-shrink-0 mt-0.5" />
              : <CheckCircle  size={11} className="text-success flex-shrink-0 mt-0.5" />
            }
          </div>
          {level && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
              style={{ background: level.color + '18', color: level.color }}>
              {level.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-0.5 text-[10px] text-secondary">
            <Users size={9} /> {node.memberCount}
          </span>
          {isUnassigned ? (
            <button
              onClick={e => { e.stopPropagation(); onAssignLA(node) }}
              className="text-[9px] text-amber border border-amber/40 px-1.5 py-0.5 rounded-button hover:bg-amber/10 transition-colors"
            >
              Assign LA
            </button>
          ) : (
            <span className="text-[9px] text-secondary truncate max-w-[70px]" title={node.laName}>
              {node.laName?.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Add child button on hover */}
      {nextLevel && (
        <button
          onClick={e => { e.stopPropagation(); onAddChild(node) }}
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2
                     opacity-0 group-hover:opacity-100 transition-opacity
                     bg-white border border-teal text-teal rounded-full w-7 h-7
                     flex items-center justify-center shadow-sm hover:bg-teal hover:text-white z-20"
          title={`Add ${nextLevel.name}`}
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  )
}

// ─── Org Chart Canvas ─────────────────────────────────────────────────────────

function OrgChartCanvas({ nodes, levels, selectedNodeId, onSelect, onAssignLA, onAddChild }) {
  const tree = buildTree(nodes)
  if (!tree.length) return null

  // Compute layout for all root subtrees side by side
  const layoutCache = new Map()
  let allPositions  = []
  let allEdges      = []
  let rootCursor    = 0

  tree.forEach(root => {
    const cl = computeSubtreeLayout(root)
    layoutCache.set(root.id, cl)
    const { positions, edges } = assignPositions(root, rootCursor, 0, layoutCache)
    allPositions.push(...positions)
    allEdges.push(...edges)
    rootCursor += cl.width + H_GAP * 3
  })
  rootCursor -= H_GAP * 3

  // Build id→position lookup
  const posMap = {}
  allPositions.forEach(p => { posMap[p.id] = p })

  const totalW = rootCursor
  const maxY   = Math.max(...allPositions.map(p => p.y)) + NODE_H
  const PAD    = 40

  return (
    <div
      className="relative"
      style={{ width: totalW + PAD * 2, height: maxY + PAD * 2, minWidth: '100%' }}
    >
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={totalW + PAD * 2}
        height={maxY + PAD * 2}
        style={{ overflow: 'visible' }}
      >
        {allEdges.map((e, i) => {
          const mx  = (e.px + e.cx) / 2   // not used in path, but for clarity
          const midY = (e.py + e.cy) / 2
          const d   = `M ${e.px + PAD} ${e.py + PAD}
                       C ${e.px + PAD} ${midY + PAD},
                         ${e.cx + PAD} ${midY + PAD},
                         ${e.cx + PAD} ${e.cy + PAD}`
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#D0DCF0"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {/* Node cards */}
      {allPositions.map(pos => {
        const node  = nodes.find(n => n.id === pos.id)
        if (!node) return null
        const level     = levels.find(l => l.id === node.levelId)
        const levelIdx  = levels.findIndex(l => l.id === node.levelId)
        const nextLevel = levels[levelIdx + 1]
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

// ─── Zoomable / Pannable Canvas Wrapper ──────────────────────────────────────

function ZoomableCanvas({ children }) {
  const [zoom, setZoom]         = useState(1)
  const [pan, setPan]           = useState({ x: 40, y: 40 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  const dragRef      = useRef(null)   // { startX, startY, panX, panY }

  // Non-passive wheel listener so we can preventDefault (stops page scroll)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onWheel(e) {
      e.preventDefault()
      const rect   = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.12 : 0.9
      setZoom(z => {
        const newZ = Math.min(2.5, Math.max(0.15, z * factor))
        // Zoom toward the mouse cursor position
        setPan(p => ({
          x: mouseX - (mouseX - p.x) * (newZ / z),
          y: mouseY - (mouseY - p.y) * (newZ / z),
        }))
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
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    })
  }
  function onMouseUp() { setIsDragging(false); dragRef.current = null }

  function zoomStep(delta) {
    setZoom(z => Math.min(2.5, Math.max(0.15, z + delta)))
  }
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
      {/* Transformed content layer */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Zoom controls — bottom-right overlay */}
      <div
        className="absolute bottom-4 right-4 flex items-center gap-0.5 bg-white border border-border rounded-button shadow-sm px-1 py-1"
        onMouseDown={e => e.stopPropagation()}
      >
        <button
          onClick={() => zoomStep(-0.15)}
          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors"
          title="Zoom out (scroll down)"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={resetView}
          className="text-xs text-secondary hover:text-primary w-10 text-center h-7 rounded-button hover:bg-surface transition-colors font-medium"
          title="Reset view"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => zoomStep(0.15)}
          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors"
          title="Zoom in (scroll up)"
        >
          <Plus size={13} />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={resetView}
          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface rounded-button transition-colors"
          title="Fit to screen"
        >
          <Maximize2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Compact Tree Row (left panel mini tree) ──────────────────────────────────

function CompactTreeRow({ node, levels, depth, selectedNodeId, collapsed, onSelect, onAddChild, onToggle }) {
  const level     = levels.find(l => l.id === node.levelId)
  const levelIdx  = levels.findIndex(l => l.id === node.levelId)
  const nextLevel = levels[levelIdx + 1]
  const hasChildren  = node.children?.length > 0
  const isCollapsed  = collapsed.has(node.id)
  const isSelected   = selectedNodeId === node.id

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-1.5 rounded-button cursor-pointer transition-colors text-xs
          ${isSelected ? 'bg-teal/10 text-teal' : 'hover:bg-surface text-primary'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: '8px' }}
        onClick={() => onSelect(node)}
      >
        <button
          onClick={e => { e.stopPropagation(); onToggle(node.id) }}
          className={`flex-shrink-0 transition-colors ${!hasChildren ? 'invisible' : 'text-secondary hover:text-primary'}`}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
        {level && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: level.color }} />}
        <span className="flex-1 truncate">{node.name}</span>
        {node.laName ? <CheckCircle size={12} className="text-success flex-shrink-0" /> : <AlertTriangle size={12} className="text-amber flex-shrink-0" />}
        {nextLevel && (
          <button
            onClick={e => { e.stopPropagation(); onAddChild(node) }}
            className="opacity-0 group-hover:opacity-100 text-secondary hover:text-teal transition-all flex-shrink-0"
            title={`Add ${nextLevel.name}`}
          >
            <Plus size={11} />
          </button>
        )}
      </div>
      {hasChildren && !isCollapsed && node.children.map(child => (
        <CompactTreeRow
          key={child.id}
          node={child}
          levels={levels}
          depth={depth + 1}
          selectedNodeId={selectedNodeId}
          collapsed={collapsed}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

// ─── List Tree Node Card ──────────────────────────────────────────────────────

function ListTreeNode({ node, levels, collapsed, selectedNodeId, onSelect, onAddChild, onToggle, onAssignLA }) {
  const level     = levels.find(l => l.id === node.levelId)
  const levelIdx  = levels.findIndex(l => l.id === node.levelId)
  const nextLevel = levels[levelIdx + 1]
  const hasChildren = node.children?.length > 0
  const isCollapsed = collapsed.has(node.id)
  const isSelected  = selectedNodeId === node.id
  const isUnassigned = !node.laName

  return (
    <div className="mb-2">
      <div
        onClick={() => onSelect(node)}
        className={`group bg-white border rounded-card p-3 cursor-pointer transition-all hover:shadow-md
          ${isSelected ? 'border-teal ring-1 ring-teal' : 'border-border'}`}
        style={isUnassigned ? { borderLeft: `4px solid #E6A817` } : { borderLeft: `4px solid ${level?.color ?? '#D0DCF0'}` }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onToggle(node.id) }}
            className={`flex-shrink-0 text-secondary ${!hasChildren ? 'invisible' : 'hover:text-primary'}`}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
          {level && (
            <span className="badge text-2xs flex-shrink-0"
              style={{ background: level.color + '18', color: level.color, border: `1px solid ${level.color}35` }}>
              {level.name}
            </span>
          )}
          <span className="font-semibold text-sm text-primary flex-1 truncate">{node.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {nextLevel && (
              <button onClick={e => { e.stopPropagation(); onAddChild(node) }}
                className="btn btn-ghost btn-sm text-2xs flex items-center gap-1 text-teal border border-teal/30 hover:bg-teal/10 rounded-button">
                <Plus size={10} /> {nextLevel.name}
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); onSelect(node) }}
              className="p-1 rounded-button text-secondary hover:text-primary hover:bg-surface">
              <Pencil size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 pl-5 text-xs text-secondary">
          <span className="flex items-center gap-0.5"><Users size={11} /> {node.memberCount}</span>
          {node.laName ? (
            <span className="flex items-center gap-1 text-success"><CheckCircle size={11} /> {node.laName}</span>
          ) : (
            <button onClick={e => { e.stopPropagation(); onAssignLA(node) }}
              className="flex items-center gap-1 text-amber hover:underline">
              <AlertTriangle size={11} /> Assign LA
            </button>
          )}
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="pl-6 ml-2 mt-1 border-l-2 border-border/60 space-y-0">
          {node.children.map(child => (
            <ListTreeNode
              key={child.id}
              node={child}
              levels={levels}
              collapsed={collapsed}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onToggle={onToggle}
              onAssignLA={onAssignLA}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Hierarchy summary helpers ────────────────────────────────────────────────

function getHierarchySummary(tenantId) {
  const data = TENANT_HIERARCHY[tenantId]
  if (!data) {
    // Use preset levels, no nodes
    const levels = getInitialLevels(tenantId)
    return { levels, nodes: [], totalNodes: 0, assignedNodes: 0, unassignedNodes: 0, pct: 0, status: 'not_started' }
  }
  const { levels, nodes } = data
  const assigned   = nodes.filter(n => n.laName).length
  const unassigned = nodes.length - assigned
  const pct        = nodes.length > 0 ? Math.round((assigned / nodes.length) * 100) : 0
  const status     = nodes.length === 0 ? 'not_started' : pct === 100 ? 'complete' : 'in_progress'
  return { levels, nodes, totalNodes: nodes.length, assignedNodes: assigned, unassignedNodes: unassigned, pct, status }
}

const STATUS_META_H = {
  complete:    { label: 'Complete',    cls: 'badge-success' },
  in_progress: { label: 'In Progress', cls: 'badge-teal'    },
  not_started: { label: 'Not Started', cls: 'badge-gray'    },
}

// ─── Hierarchy List ───────────────────────────────────────────────────────────

const CARD_PER_PAGE  = 9
const TABLE_PER_PAGE = 10

function HierarchyList({ onEdit, onAdd }) {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState([])
  const [viewMode, setViewMode]         = useState('table')  // 'card' | 'table'
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletedIds, setDeletedIds]     = useState(new Set())
  const [page, setPage]                 = useState(1)

  const allTenants = tenants.filter(t => t.status !== 'suspended').filter(t => !deletedIds.has(t.id))

  const filtered = allTenants.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter.length > 0 && !statusFilter.includes(getHierarchySummary(t.id).status)) return false
    return true
  })

  const perPage = viewMode === 'card' ? CARD_PER_PAGE : TABLE_PER_PAGE
  const paged   = filtered.slice((page - 1) * perPage, page * perPage)

  const handleDelete = (tenantId) => {
    setDeletedIds(prev => new Set([...prev, tenantId]))
    setDeleteTarget(null)
    toast.success('Hierarchy configuration deleted')
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-navy">Hierarchy Configurations</h1>
          <p className="text-secondary text-sm mt-0.5">{allTenants.length} communities on the platform</p>
        </div>
        <button onClick={onAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Hierarchy
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input
            className="input pl-9"
            placeholder="Search communities…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <FilterBar
          filters={[{
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: v => { setStatusFilter(v); setPage(1) },
            multi: true,
            options: [
              { value: 'complete',    label: 'Complete'    },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'not_started', label: 'Not Started' },
            ],
          }]}
        />

        <ViewToggle value={viewMode} onChange={v => { setViewMode(v); setPage(1) }} />
      </div>

      {/* Stats pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          ['Total',       allTenants.length],
          ['Complete',    allTenants.filter(t => getHierarchySummary(t.id).status === 'complete').length],
          ['In Progress', allTenants.filter(t => getHierarchySummary(t.id).status === 'in_progress').length],
          ['Not Started', allTenants.filter(t => getHierarchySummary(t.id).status === 'not_started').length],
        ].map(([label, count]) => (
          <span key={label} className="bg-surface border border-border rounded-button px-3 py-1 text-xs font-medium text-secondary">
            {label}: <span className="text-primary font-semibold">{count}</span>
          </span>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <GitBranch size={32} className="text-secondary mb-3" />
          <p className="text-sm font-semibold text-primary">No communities found</p>
          <p className="text-xs text-secondary mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {filtered.length > 0 && viewMode === 'card' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paged.map(tenant => {
              const s    = getHierarchySummary(tenant.id)
              const meta = STATUS_META_H[s.status]
              const isDeleteTarget = deleteTarget === tenant.id
              return (
                <div key={tenant.id} className="card p-4">
                  {isDeleteTarget ? (
                    <div className="border border-danger/25 bg-danger/5 rounded-card p-3 space-y-2">
                      <p className="text-xs font-medium text-danger">Delete hierarchy for <strong>{tenant.name}</strong>?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-sm flex-1">Cancel</button>
                        <button onClick={() => handleDelete(tenant.id)} className="btn btn-sm flex-1 bg-danger text-white hover:bg-danger/90 rounded-button">Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-card bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <GitBranch size={18} className="text-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{tenant.name}</p>
                        <p className="text-xs text-secondary capitalize">{tenant.type?.replace(/_/g, ' ')}</p>
                      </div>
                      <span className={`badge ${meta.cls} flex-shrink-0`}>{meta.label}</span>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => onEdit(tenant.id)} className="btn btn-ghost btn-sm" title="Edit Hierarchy">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(tenant.id)} className="btn btn-ghost btn-sm hover:text-danger" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Pagination page={page} total={filtered.length} perPage={CARD_PER_PAGE} onChange={setPage} />
        </>
      )}

      {/* ── TABLE VIEW ── */}
      {filtered.length > 0 && viewMode === 'table' && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="th text-left">#</th>
                    <th className="th text-left">Community</th>
                    <th className="th text-left">Type</th>
                    <th className="th text-left">Levels</th>
                    <th className="th text-left">Nodes</th>
                    <th className="th text-left">LA Progress</th>
                    <th className="th text-left">Status</th>
                    <th className="th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((tenant, idx) => {
                    const s    = getHierarchySummary(tenant.id)
                    const meta = STATUS_META_H[s.status]
                    const isDeleteTarget = deleteTarget === tenant.id
                    const rowNum = (page - 1) * TABLE_PER_PAGE + idx + 1
                    return (
                      <tr key={tenant.id} className="tr">
                        <td className="td px-4 text-secondary text-sm">{rowNum}</td>
                        <td className="td px-4">
                          <p className="text-sm font-semibold text-primary">{tenant.name}</p>
                        </td>
                        <td className="td px-4">
                          <span className="text-sm text-secondary capitalize">{tenant.type?.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="td px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {s.levels.length > 0 ? s.levels.map(lv => (
                              <span key={lv.id}
                                className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ background: lv.color + '18', color: lv.color, border: `1px solid ${lv.color}35` }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: lv.color }} />
                                {lv.name}
                              </span>
                            )) : <span className="text-sm text-secondary">—</span>}
                          </div>
                        </td>
                        <td className="td px-4">
                          <div className="text-sm">
                            <span className="font-semibold text-primary">{s.totalNodes}</span>
                            {s.unassignedNodes > 0 && (
                              <span className="text-amber-dark text-xs ml-1.5">({s.unassignedNodes} unassigned)</span>
                            )}
                          </div>
                        </td>
                        <td className="td px-4" style={{ minWidth: 140 }}>
                          {s.totalNodes > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                                <div className="h-full rounded-full"
                                  style={{ width: `${s.pct}%`, background: s.pct === 100 ? '#2E7D32' : s.unassignedNodes > 0 ? '#E6A817' : '#028090' }} />
                              </div>
                              <span className={`text-xs font-semibold flex-shrink-0 ${s.pct === 100 ? 'text-success' : s.unassignedNodes > 0 ? 'text-amber-dark' : 'text-teal'}`}>
                                {s.pct}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-secondary text-sm">—</span>
                          )}
                        </td>
                        <td className="td px-4">
                          <span className={`badge ${meta.cls}`}>{meta.label}</span>
                        </td>
                        <td className="td px-4">
                          {isDeleteTarget ? (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-sm" title="Cancel">
                                <X size={14} />
                              </button>
                              <button onClick={() => handleDelete(tenant.id)} className="btn btn-ghost btn-sm text-danger hover:text-danger" title="Confirm delete">
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => onEdit(tenant.id)} className="btn btn-ghost btn-sm">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(tenant.id)} className="btn btn-ghost btn-sm hover:text-danger">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={filtered.length} perPage={TABLE_PER_PAGE} onChange={setPage} />
        </>
      )}
    </div>
  )
}

// ─── HierarchyPage (shell that holds list + builder) ─────────────────────────

export default function HierarchyPage({
  initialPageView = 'list',
  initialTenantId = 'tenant-001',
  startWithTemplateStep = false,
  allowListView = true,
  lockTenantId = false,
  tenantDisplayName = '',
  initialTemplate = null,
  onTemplateChange,
}) {
  const [pageView, setPageView] = useState(allowListView ? initialPageView : 'builder')  // 'list' | 'builder'
  const [builderTenantId, setBuilderTenantId] = useState(initialTenantId)

  const handleEdit = (tenantId) => {
    setBuilderTenantId(tenantId)
    setPageView('builder')
  }

  const handleAdd = () => {
    setBuilderTenantId(tenants[0]?.id ?? 'tenant-001')
    setPageView('builder')
  }

  if (allowListView && pageView === 'list') {
    return (
      <div className="p-3 space-y-6">
        <HierarchyList onEdit={handleEdit} onAdd={handleAdd} />
      </div>
    )
  }

  return (
    <HierarchyBuilder
      initialTenantId={builderTenantId}
      onBack={allowListView ? () => setPageView('list') : undefined}
      startWithTemplateStep={startWithTemplateStep}
      lockTenantId={lockTenantId}
      tenantDisplayName={tenantDisplayName}
      initialTemplate={initialTemplate}
      onTemplateChange={onTemplateChange}
    />
  )
}

// ─── HierarchyBuilder (the original full-screen builder) ─────────────────────

function HierarchyBuilder({
  initialTenantId,
  onBack,
  startWithTemplateStep = false,
  lockTenantId = false,
  tenantDisplayName = '',
  initialTemplate = null,
  onTemplateChange,
}) {
  // ── Data state ────────────────────────────────────────────────────────────────
  const [tenantId,   setTenantId]   = useState(initialTenantId ?? 'tenant-001')
  const [levels,     setLevels]     = useState(() => resolveInitialHierarchy(initialTenantId ?? 'tenant-001', initialTemplate).levels)
  const [nodes,      setNodes]      = useState(() => resolveInitialHierarchy(initialTenantId ?? 'tenant-001', initialTemplate).nodes)

  // ── Template picker (shown when no nodes exist) ───────────────────────────────
  const getActiveCommunityTypes = useMasterSettingsStore(s => s.getActiveCommunityTypes)
  const communityTypesList      = getActiveCommunityTypes()
  const hierarchyPresets        = communityTypesList.map(ct => ({
    id:           `preset-${ct.slug}`,
    name:         ct.name,
    levels:       (ct.defaultHierarchyPreset?.levels || []).map(l => l.name),
    suggestedFor: [ct.slug],
    description:  `Default levels for ${ct.name}`,
  }))

  const [showTemplateStep,      setShowTemplateStep]      = useState(() =>
    startWithTemplateStep || getInitialNodes(initialTenantId ?? 'tenant-001').length === 0
  )
  const [templateSelectedPreset, setTemplateSelectedPreset] = useState(null)
  const [templateCustomLevels,  setTemplateCustomLevels]  = useState([{ id: 1, name: '' }])
  const [templateErrors,        setTemplateErrors]        = useState({})

  // ── Panel / view state ────────────────────────────────────────────────────────
  const [panelMode,        setPanelMode]        = useState('levels')
  const [selectedNode,     setSelectedNode]     = useState(null)
  const [addCtx,           setAddCtx]           = useState(null)
  const [leftCollapsed,    setLeftCollapsed]    = useState(false)
  const [treeViewMode,     setTreeViewMode]     = useState('org')   // 'org' | 'list'
  const [collapsed,        setCollapsed]        = useState(new Set())
  const [unassignedFilter, setUnassignedFilter] = useState(false)
  const [nodesExpanded,    setNodesExpanded]    = useState(true)

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignTarget,    setAssignTarget]    = useState(null)

  // ── Drag (level reorder) ──────────────────────────────────────────────────────
  const [dragLevelIdx,     setDragLevelIdx]     = useState(null)
  const [dragOverLevelIdx, setDragOverLevelIdx] = useState(null)

  // ── Inline confirm ────────────────────────────────────────────────────────────
  const [removeLAConfirm,   setRemoveLAConfirm]   = useState(false)
  const [deleteNodeConfirm, setDeleteNodeConfirm] = useState(false)
  const [deleteNodeMode,    setDeleteNodeMode]    = useState('delete_subtree')
  const [deleteLevelId,     setDeleteLevelId]     = useState(null)

  // ── Level editing ─────────────────────────────────────────────────────────────
  const [editingLevelId,   setEditingLevelId]   = useState(null)
  const [editingLevelName, setEditingLevelName] = useState('')
  const [colorPickerLevelId, setColorPickerLevelId] = useState(null)
  const [showAddLevel,     setShowAddLevel]     = useState(false)
  const [newLevelName,     setNewLevelName]     = useState('')
  const [newLevelColor,    setNewLevelColor]    = useState('#028090')

  // ── Node editing ──────────────────────────────────────────────────────────────
  const [editNameValue, setEditNameValue] = useState('')
  const [editNameError, setEditNameError] = useState('')
  const [addNodeName,   setAddNodeName]   = useState('')
  const [addNodeError,  setAddNodeError]  = useState('')

  // (presetOffer replaced by showTemplateStep above)

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const initialData = resolveInitialHierarchy(tenantId, initialTemplate)
    setLevels(initialData.levels)
    setNodes(initialData.nodes)
    setPanelMode('levels')
    setSelectedNode(null)
    setCollapsed(new Set())
    setUnassignedFilter(false)
    setShowTemplateStep(startWithTemplateStep || initialData.nodes.length === 0)
    setTemplateSelectedPreset(null)
    setTemplateCustomLevels([{ id: 1, name: '' }])
    setTemplateErrors({})
  }, [tenantId, startWithTemplateStep])

  useEffect(() => {
    if (!onTemplateChange) return
    onTemplateChange({
      levels: levels.map((level, index) => ({ ...level, index })),
      nodes,
    })
  }, [levels, nodes, onTemplateChange])

  // ── Template picker helpers ───────────────────────────────────────────────────

  const addTemplateLevel    = () => setTemplateCustomLevels(prev => [...prev, { id: Date.now(), name: '' }])
  const removeTemplateLevel = id => setTemplateCustomLevels(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev)
  const updateTemplateLevel = (id, name) => setTemplateCustomLevels(prev => prev.map(l => l.id === id ? { ...l, name } : l))

  function applyTemplatePreset() {
    const COLORS = ['#028090', '#1B3A6B', '#E6A817', '#2E7D32', '#7C3AED', '#E53E3E']
    let levelNames = []
    if (templateSelectedPreset === 'scratch') {
      levelNames = templateCustomLevels.filter(l => l.name.trim()).map(l => l.name.trim())
      if (levelNames.length === 0) { setTemplateErrors({ levels: true }); return }
    } else {
      const preset = hierarchyPresets.find(p => p.id === templateSelectedPreset)
      if (!preset) { setTemplateErrors({ preset: true }); return }
      levelNames = preset.levels
    }
    setLevels(levelNames.map((name, i) => ({ id: `l${i + 1}`, name, color: COLORS[i] || '#546E7A' })))
    setShowTemplateStep(false)
    setTemplateErrors({})
    toast.success('Hierarchy levels configured ✓')
  }

  useEffect(() => {
    if (selectedNode) {
      const updated = nodes.find(n => n.id === selectedNode.id)
      if (updated) setSelectedNode(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes])

  // ── Computed ──────────────────────────────────────────────────────────────────

  const tenant          = tenants.find(t => t.id === tenantId)
  const effectiveTenantName = tenantDisplayName || tenant?.name || 'New Community'
  const activeTenants   = tenants.filter(t => t.status !== 'suspended')
  const tree            = buildTree(nodes)
  const assignedCount   = nodes.filter(n => n.laName).length
  const unassignedCount = nodes.filter(n => !n.laName).length
  const displayNodes    = unassignedFilter ? nodes.filter(n => !n.laName) : null

  function getLevelByNode(node) { return levels.find(l => l.id === node.levelId) || levels[0] }
  function getLevelIdx(levelId)  { return levels.findIndex(l => l.id === levelId) }
  function countDirectChildren(nodeId)  { return nodes.filter(n => n.parentId === nodeId).length }
  function countDescendants(nodeId) {
    const direct = nodes.filter(n => n.parentId === nodeId)
    return direct.reduce((sum, c) => sum + 1 + countDescendants(c.id), 0)
  }
  function getPath(nodeId) {
    const path = []
    let current = nodes.find(n => n.id === nodeId)
    while (current) {
      path.unshift(current.name)
      current = current.parentId ? nodes.find(n => n.id === current.parentId) : null
    }
    return path.join(' › ')
  }

  // ── Node action handlers ──────────────────────────────────────────────────────

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
    const idx = getLevelIdx(node.levelId)
    const next = levels[idx + 1]
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
    if (siblings.some(n => n.name.toLowerCase() === name.toLowerCase())) {
      setAddNodeError('Name already exists'); return
    }
    const newNode = {
      id: `n-${Date.now()}`, name,
      levelId: addCtx.levelId, parentId: addCtx.parentId,
      laId: null, laName: null, laEmail: null, laPhone: null,
      memberCount: 0, createdAt: new Date().toISOString().split('T')[0],
    }
    setNodes(prev => [...prev, newNode])
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
    if (siblings.some(n => n.name.toLowerCase() === newName.toLowerCase())) {
      setEditNameError('Name already exists'); return
    }
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, name: newName } : n))
    setEditNameError('')
    toast.success('Node renamed ✓')
  }

  function handleRemoveLA(nodeId) {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, laId: null, laName: null, laEmail: null, laPhone: null } : n
    ))
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

    const descendantIds = collectDescendantIds(nodeId, nodes)
    const idsToDelete   = new Set([nodeId, ...descendantIds])
    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)))
    setSelectedNode(null)
    setPanelMode('levels')
    setDeleteNodeConfirm(false)
    setDeleteNodeMode('delete_subtree')
    const total = idsToDelete.size
    toast.success(`Deleted ${total} node${total > 1 ? 's' : ''}`)
  }

  function handleAssignLA(member) {
    setNodes(prev => prev.map(n => {
      if (n.laId === member.id && n.id !== assignTarget.id)
        return { ...n, laId: null, laName: null, laEmail: null, laPhone: null }
      if (n.id === assignTarget.id)
        return { ...n, laId: member.id, laName: member.name, laEmail: member.email, laPhone: member.phone }
      return n
    }))
    if (selectedNode?.id === assignTarget.id) {
      setSelectedNode(prev => ({
        ...prev, laId: member.id, laName: member.name, laEmail: member.email, laPhone: member.phone,
      }))
    }
    toast.success(`${member.name} assigned as Level Admin of ${assignTarget.name} ✓`)
    setAssignModalOpen(false)
    setAssignTarget(null)
  }

  function openAssignModal(node) { setAssignTarget(node); setAssignModalOpen(true) }

  // ── Level handlers ────────────────────────────────────────────────────────────

  function handleLevelDragStart(idx)      { setDragLevelIdx(idx) }
  function handleLevelDragOver(e, idx)    { e.preventDefault(); setDragOverLevelIdx(idx) }
  function handleLevelDrop(e, idx) {
    e.preventDefault()
    if (dragLevelIdx === null || dragLevelIdx === idx) { setDragLevelIdx(null); setDragOverLevelIdx(null); return }
    const nl = [...levels]
    const [moved] = nl.splice(dragLevelIdx, 1)
    nl.splice(idx, 0, moved)
    setLevels(nl)
    setDragLevelIdx(null); setDragOverLevelIdx(null)
  }

  function handleStartEditLevel(level) { setEditingLevelId(level.id); setEditingLevelName(level.name) }
  function handleSaveLevelName(levelId) {
    const name = editingLevelName.trim()
    if (name.length < 2) return
    setLevels(prev => prev.map(l => l.id === levelId ? { ...l, name } : l))
    setEditingLevelId(null)
    toast.success('Level renamed ✓')
  }

  function handleDeleteLevel(levelId) {
    const hasNodes = nodes.some(n => n.levelId === levelId)
    if (hasNodes) {
      const lv  = levels.find(l => l.id === levelId)
      const cnt = nodes.filter(n => n.levelId === levelId).length
      toast.error(`Remove all ${cnt} ${lv?.name} nodes first`)
      return
    }
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
    toast.success(`${name} level added ✓`)
    setNewLevelName('')
    setNewLevelColor('#028090')
    setShowAddLevel(false)
  }

  function handleToggleNode(nodeId) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId)
      return next
    })
  }

  // ── Panel renderers ───────────────────────────────────────────────────────────

  function renderLevelsPanel() {
    return (
      <div className="flex flex-col gap-2">
        <div className="mb-1">
          <p className="text-2xs font-semibold text-secondary uppercase tracking-widest">Hierarchy Levels</p>
          <p className="text-2xs text-secondary mt-0.5">Drag to reorder · Click name to rename</p>
        </div>

        {levels.map((level, idx) => (
          <div key={level.id}>
            {deleteLevelId === level.id ? (
              <div className="border border-danger/30 rounded-button p-3 bg-danger/5">
                <p className="text-xs font-medium text-danger mb-2">Delete <strong>{level.name}</strong>? Cannot be undone.</p>
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-outline flex-1" onClick={() => setDeleteLevelId(null)}>Cancel</button>
                  <button className="btn btn-sm btn-danger flex-1" onClick={() => confirmDeleteLevel(level.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <div
                draggable
                onDragStart={() => handleLevelDragStart(idx)}
                onDragOver={e => handleLevelDragOver(e, idx)}
                onDrop={e => handleLevelDrop(e, idx)}
                onDragEnd={() => { setDragLevelIdx(null); setDragOverLevelIdx(null) }}
                className={`bg-white border border-border rounded-button p-3 transition-all ${dragOverLevelIdx === idx ? 'opacity-60 bg-teal/5' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-secondary cursor-grab flex-shrink-0" />
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: level.color }} />
                  {editingLevelId === level.id ? (
                    <input
                      className="flex-1 text-sm bg-transparent border-0 border-b border-teal outline-none"
                      value={editingLevelName}
                      autoFocus
                      onChange={e => setEditingLevelName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveLevelName(level.id); if (e.key === 'Escape') setEditingLevelId(null) }}
                      onBlur={() => handleSaveLevelName(level.id)}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-primary">{level.name}</span>
                  )}
                  <button onClick={() => handleStartEditLevel(level)} className="p-1 rounded text-secondary hover:text-primary transition-colors flex-shrink-0">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setColorPickerLevelId(colorPickerLevelId === level.id ? null : level.id)} className="p-1 rounded text-secondary hover:text-primary transition-colors flex-shrink-0">
                    <Palette size={12} />
                  </button>
                  <button onClick={() => handleDeleteLevel(level.id)} className="p-1 rounded text-secondary hover:text-danger transition-colors flex-shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
                {colorPickerLevelId === level.id && (
                  <ColorPicker
                    color={level.color}
                    onChange={color => setLevels(prev => prev.map(l => l.id === level.id ? { ...l, color } : l))}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {showAddLevel ? (
          <div className="border border-border rounded-button p-3 bg-surface mt-1">
            <p className="text-xs font-medium text-primary mb-2">New Level</p>
            <input
              className="input text-sm mb-2"
              placeholder="Level Name"
              value={newLevelName}
              onChange={e => setNewLevelName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddLevel() }}
              autoFocus
            />
            <div className="mb-2">
              <p className="text-2xs text-secondary mb-1.5">Color</p>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_SWATCHES.map(s => (
                  <button key={s} type="button" onClick={() => setNewLevelColor(s)}
                    className="w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex-shrink-0"
                    style={{ background: s, boxShadow: newLevelColor === s ? `0 0 0 2px white, 0 0 0 3.5px ${s}` : undefined, borderColor: newLevelColor === s ? s : 'transparent' }}
                  />
                ))}
              </div>
            </div>
            <p className="text-2xs text-secondary mb-2">After: {levels[levels.length - 1]?.name || 'last'}</p>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm flex-1" onClick={() => { setShowAddLevel(false); setNewLevelName('') }}>Cancel</button>
              <button className="btn btn-primary btn-sm flex-1" onClick={handleAddLevel} disabled={newLevelName.trim().length < 2}>Add Level</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddLevel(true)}
            className="border border-dashed border-border text-secondary text-xs hover:border-teal hover:text-teal rounded-button py-2 w-full transition-colors flex items-center justify-center gap-1.5 mt-1"
          >
            <Plus size={13} /> Add Level
          </button>
        )}

        {/* Compact mini tree */}
        <div className="mt-4">
          <button onClick={() => setNodesExpanded(v => !v)} className="flex items-center gap-1 w-full mb-1.5">
            {nodesExpanded ? <ChevronDown size={12} className="text-secondary" /> : <ChevronRight size={12} className="text-secondary" />}
            <p className="text-2xs font-semibold text-secondary uppercase tracking-widest flex-1">Nodes</p>
            <span className="text-2xs text-secondary">{nodes.length}</span>
          </button>
          {nodesExpanded && (
            nodes.length === 0
              ? <p className="text-2xs text-secondary text-center py-3">No nodes yet</p>
              : buildTree(nodes).map(root => (
                <CompactTreeRow
                  key={root.id} node={root} levels={levels} depth={0}
                  selectedNodeId={selectedNode?.id} collapsed={collapsed}
                  onSelect={handleSelectNode} onAddChild={handleAddChild} onToggle={handleToggleNode}
                />
              ))
          )}
        </div>
      </div>
    )
  }

  function renderAddPanel() {
    if (!addCtx) return null
    const levelObj = levels.find(l => l.id === addCtx.levelId)
    const siblings  = nodes.filter(n => n.parentId === addCtx.parentId)
    const isDupe    = !!addNodeName.trim() && siblings.some(n => n.name.toLowerCase() === addNodeName.trim().toLowerCase())

    return (
      <div>
        <button onClick={() => setPanelMode('levels')} className="text-teal text-xs cursor-pointer mb-4 flex items-center gap-1 hover:underline">← Back</button>
        <p className="text-2xs font-semibold text-secondary uppercase tracking-widest mb-0.5">Add Node</p>
        <p className="text-xs text-secondary mb-4">
          Adding a <strong>{addCtx.levelName}</strong> under <strong>{addCtx.parentName}</strong>
        </p>
        <div className="mb-3">
          <p className="text-2xs text-secondary mb-1">Level</p>
          {levelObj && (
            <span className="badge text-2xs" style={{ background: levelObj.color + '18', color: levelObj.color, border: `1px solid ${levelObj.color}35` }}>
              {levelObj.name}
            </span>
          )}
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium text-primary block mb-1">Name <span className="text-danger">*</span></label>
          <input
            className={`input text-sm ${isDupe || addNodeError ? 'border-danger' : ''}`}
            placeholder="e.g. Morning Group"
            value={addNodeName}
            onChange={e => { setAddNodeName(e.target.value); setAddNodeError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateNode() }}
            autoFocus
          />
          {(isDupe || addNodeError) && <p className="text-danger text-xs mt-1">{addNodeError || 'Name already exists'}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline flex-1" onClick={() => setPanelMode('levels')}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={handleCreateNode} disabled={!addNodeName.trim() || isDupe}>Create Node</button>
        </div>
      </div>
    )
  }

  function renderEditPanel() {
    if (!selectedNode) return null
    const level          = getLevelByNode(selectedNode)
    const directChildren = countDirectChildren(selectedNode.id)
    const descendants    = countDescendants(selectedNode.id)
    const canMergeToParent = !!selectedNode.parentId && descendants > 0
    const path           = getPath(selectedNode.id)
    const siblings       = nodes.filter(n => n.parentId === selectedNode.parentId && n.id !== selectedNode.id)
    const isNameDupe     = !!editNameValue.trim() && siblings.some(n => n.name.toLowerCase() === editNameValue.trim().toLowerCase())

    return (
      <div>
        <button onClick={() => { setPanelMode('levels'); setSelectedNode(null) }} className="text-teal text-xs cursor-pointer mb-4 flex items-center gap-1 hover:underline">← Back</button>
        <p className="text-2xs font-semibold text-secondary uppercase tracking-widest mb-2">Editing Node</p>

        {level && (
          <span className="badge text-2xs mb-3 inline-flex" style={{ background: level.color + '18', color: level.color, border: `1px solid ${level.color}35` }}>
            {level.name}
          </span>
        )}

        <div className="mb-1">
          <label className="text-2xs text-secondary block mb-1">Name</label>
          <div className="flex gap-2">
            <input
              className={`input text-sm flex-1 ${isNameDupe || editNameError ? 'border-danger' : ''}`}
              value={editNameValue}
              onChange={e => { setEditNameValue(e.target.value); setEditNameError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(selectedNode.id) }}
            />
            <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => handleSaveName(selectedNode.id)} disabled={isNameDupe || !editNameValue.trim()}>Save</button>
          </div>
          {(isNameDupe || editNameError) && <p className="text-danger text-xs mt-1">{editNameError || 'Name already exists'}</p>}
        </div>
        <p className="text-2xs text-secondary mb-4">{path}</p>

        {/* LA section */}
        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs font-semibold text-primary mb-3">Level Admin</p>
          {selectedNode.laName ? (
            <div>
              <div className="flex items-start gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-sm flex-shrink-0">
                  {getInitials(selectedNode.laName)}
                </div>
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
                <button className="text-xs border border-danger text-danger hover:bg-danger hover:text-white rounded-button px-3 h-8 transition-colors" onClick={() => setRemoveLAConfirm(true)}>
                  Remove Level Admin
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber" />
                <p className="text-sm font-medium text-primary">No Level Admin</p>
              </div>
              <button onClick={() => openAssignModal(selectedNode)} className="bg-amber/10 border border-amber text-amber-dark hover:bg-amber hover:text-white rounded-button text-sm px-4 h-9 transition-colors w-full">
                Assign Level Admin
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs font-semibold text-primary mb-2">Stats</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Members',     value: selectedNode.memberCount },
              { label: 'Direct sub',  value: directChildren },
              { label: 'Descendants', value: descendants },
              { label: 'Created',     value: formatDate(selectedNode.createdAt) },
            ].map(s => (
              <div key={s.label} className="bg-surface rounded-button p-2">
                <p className="text-2xs text-secondary">{s.label}</p>
                <p className="text-sm font-semibold text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="border-t border-danger/20 pt-3 mt-3">
          <p className="text-xs font-semibold text-danger mb-1">Danger Zone</p>
          {deleteNodeConfirm ? (
            <div className="bg-danger/5 border border-danger/20 rounded-button p-3">
              <p className="text-xs text-danger mb-1">Delete <strong>{selectedNode.name}</strong>?</p>
              {descendants > 0 && (
                <>
                  <p className="text-xs text-danger/80 mb-2">
                    This node has <strong>{descendants}</strong> child node{descendants !== 1 ? 's' : ''}. Choose what to do:
                  </p>
                  <div className="space-y-1.5 mb-2.5">
                    {canMergeToParent && (
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
              )}
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm flex-1" onClick={() => setDeleteNodeConfirm(false)}>Cancel</button>
                <button className="btn btn-sm flex-1 bg-danger text-white hover:bg-danger/90 rounded-button" onClick={() => handleDeleteNode(selectedNode.id, deleteNodeMode)}>
                  {deleteNodeMode === 'merge_to_parent' ? 'Delete & Merge' : `Delete${descendants > 0 ? ` (${descendants + 1})` : ''}`}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="border border-danger text-danger hover:bg-danger hover:text-white rounded-button text-sm px-4 h-9 transition-colors w-full"
              onClick={() => { setDeleteNodeMode('delete_subtree'); setDeleteNodeConfirm(true) }}
            >
              Delete Node{descendants > 0 ? ` + ${descendants} sub-node${descendants !== 1 ? 's' : ''}` : ''}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col h-full p-3">

        {/* Header */}
        <div className="border-b border-border bg-white px-4 md:px-6 py-3 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-button bg-teal/10 flex items-center justify-center flex-shrink-0">
              <GitBranch size={16} className="text-teal" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-primary">Hierarchy Builder</h1>
              <p className="text-2xs text-secondary hidden sm:block">Design and manage community org structures</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 btn-ghost btn btn-sm border border-border text-xs"
              >
                <ArrowLeft size={13} /> All Hierarchies
              </button>
            )}
            <span className="badge badge-success text-2xs hidden sm:inline-flex">Platform Admin</span>
            <ViewToggle
              value={treeViewMode}
              onChange={setTreeViewMode}
              firstValue="org"
              secondValue="list"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* ── LEFT PANEL ── */}
          <div
            className={`
              flex-shrink-0 border-r border-border bg-white flex flex-col
              transition-all duration-200 ease-in-out overflow-hidden
              ${leftCollapsed ? 'w-10' : 'w-[300px] lg:w-[320px]'}
            `}
          >
            {leftCollapsed ? (
              /* Collapsed strip */
              <div className="flex flex-col items-center pt-3 gap-3">
                <button
                  onClick={() => setLeftCollapsed(false)}
                  className="p-2 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors"
                  title="Expand panel"
                >
                  <PanelLeftOpen size={16} />
                </button>
                {/* Level color dots */}
                {levels.map(l => (
                  <div key={l.id} className="w-3 h-3 rounded-full" style={{ background: l.color }} title={l.name} />
                ))}
              </div>
            ) : (
              <>
                {/* Panel header + collapse button */}
                <div className="px-3 pt-3 pb-2 border-b border-border flex-shrink-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="text-2xs font-medium text-secondary">Community</label>
                    <button
                      onClick={() => setLeftCollapsed(true)}
                      className="p-1 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors"
                      title="Collapse panel"
                    >
                      <PanelLeftClose size={14} />
                    </button>
                  </div>
                  {lockTenantId ? (
                    <div className="input text-sm bg-surface text-primary cursor-default">
                      {effectiveTenantName}
                    </div>
                  ) : (
                    <Select
                      searchable
                      value={tenantId}
                      onChange={v => setTenantId(v)}
                      options={activeTenants.map(t => ({ value: t.id, label: t.name }))}
                    />
                  )}
                  {!showTemplateStep && (
                    <button
                      type="button"
                      onClick={() => { setShowTemplateStep(true); setTemplateSelectedPreset(null); setTemplateCustomLevels([{ id: 1, name: '' }]) }}
                      className="mt-2 w-full text-2xs text-teal hover:underline text-left"
                    >
                      ↺ Change hierarchy template
                    </button>
                  )}
                  <p className="text-2xs text-secondary mt-1.5 flex items-center gap-1 flex-wrap">
                    <span>{levels.length} levels · {nodes.length} nodes</span>
                    {unassignedCount > 0 && <span className="text-amber font-medium">· {unassignedCount} unassigned ⚠</span>}
                  </p>
                </div>

                {/* Panel body */}
                <div className="flex-1 overflow-y-auto p-3">
                  {panelMode === 'levels' && renderLevelsPanel()}
                  {panelMode === 'add'    && renderAddPanel()}
                  {panelMode === 'edit'   && renderEditPanel()}
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT PANEL (tree preview) ── */}
          <div className="flex-1 flex flex-col bg-surface overflow-hidden">

            {/* Toolbar */}
            <div className="px-4 py-2 border-b border-border bg-white flex-shrink-0 flex items-center justify-between gap-3">
              {/* Expand panel button if collapsed */}
              <div className="flex items-center gap-2 min-w-0">
                {leftCollapsed && (
                  <button onClick={() => setLeftCollapsed(false)} className="p-1.5 rounded-button text-secondary hover:bg-surface hover:text-primary transition-colors flex-shrink-0">
                    <PanelLeftOpen size={15} />
                  </button>
                )}
                <span className="text-sm font-semibold text-primary truncate">{effectiveTenantName}</span>
                {/* Level legend */}
                <div className="hidden md:flex items-center gap-2 ml-3">
                  {levels.map(l => (
                    <span key={l.id} className="flex items-center gap-1 text-2xs text-secondary">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {levels[0] && (
                  <button
                    className="btn btn-ghost btn-sm text-xs"
                    onClick={handleAddRootNode}
                  >
                    + Add {levels[0].name}
                  </button>
                )}
                {treeViewMode === 'list' && (
                  <>
                    <button className="btn btn-ghost btn-sm text-xs" onClick={() => setCollapsed(new Set())}>
                      Expand All
                    </button>
                    <button className="btn btn-ghost btn-sm text-xs" onClick={() => setCollapsed(new Set(nodes.map(n => n.id)))}>
                      Collapse
                    </button>
                  </>
                )}
                {unassignedCount > 0 && (
                  <button
                    onClick={() => setUnassignedFilter(v => !v)}
                    className={`flex items-center gap-1.5 rounded-button text-xs h-8 px-2.5 border transition-colors
                      ${unassignedFilter ? 'bg-amber text-white border-amber' : 'bg-amber/10 text-amber border-amber/40'}`}
                  >
                    {unassignedFilter ? <><X size={12} /> Clear</> : <><AlertTriangle size={12} /> {unassignedCount} unassigned</>}
                  </button>
                )}
              </div>
            </div>

            {/* Tree canvas */}
            <div className="flex-1 overflow-hidden">
              {showTemplateStep ? (
                /* ── Template Picker ── */
                <div className="h-full overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto space-y-5">
                    <div>
                      <p className="text-base font-semibold text-primary">Choose a Hierarchy Template</p>
                      <p className="text-sm text-secondary mt-0.5">
                        Pick a template that matches your community structure, or build your own from scratch
                      </p>
                    </div>

                    {templateErrors.preset && (
                      <div className="flex items-center gap-2 text-danger text-sm">
                        <AlertCircle size={14} />
                        Please select a template to continue
                      </div>
                    )}

                    {/* Template grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {hierarchyPresets.map(preset => {
                        const selected  = templateSelectedPreset === preset.id
                        const suggested = preset.suggestedFor.includes(tenants.find(t => t.id === tenantId)?.type)
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => { setTemplateSelectedPreset(preset.id); setTemplateErrors({}) }}
                            className={`relative text-left rounded-card border-2 p-4 cursor-pointer transition-all
                              ${selected ? 'border-teal bg-teal/5' : 'border-border bg-white hover:border-teal/40'}`}
                          >
                            {suggested && (
                              <span className="badge badge-teal text-2xs absolute top-3 left-3">Suggested</span>
                            )}
                            {selected && (
                              <div className="absolute top-3 right-3">
                                <Check size={14} className="text-teal" />
                              </div>
                            )}
                            <div className={`text-xl mb-1.5 ${suggested ? 'mt-5' : ''}`}>🏢</div>
                            <p className="font-bold text-sm text-primary leading-tight">{preset.name}</p>
                            <p className="text-xs text-secondary mt-0.5">{preset.description}</p>
                            {preset.levels.length > 0 && (
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                {preset.levels.map((lvl, i) => (
                                  <div key={lvl} className="flex items-center gap-1">
                                    <span className="badge badge-gray text-2xs">{lvl}</span>
                                    {i < preset.levels.length - 1 && (
                                      <ChevronRight size={10} className="text-secondary flex-shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Build from scratch */}
                    <div>
                      <button
                        type="button"
                        onClick={() => { setTemplateSelectedPreset('scratch'); setTemplateErrors({}) }}
                        className={`w-full text-left rounded-card border-2 p-4 cursor-pointer transition-all flex items-center gap-4
                          ${templateSelectedPreset === 'scratch' ? 'border-teal bg-teal/5' : 'border-border bg-white hover:border-teal/40'}`}
                      >
                        <PlusCircle size={24} className={templateSelectedPreset === 'scratch' ? 'text-teal' : 'text-secondary'} />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-primary">Build from scratch</p>
                          <p className="text-xs text-secondary mt-0.5">Define your own level names</p>
                        </div>
                        {templateSelectedPreset === 'scratch' && <Check size={16} className="text-teal flex-shrink-0" />}
                      </button>

                      {templateSelectedPreset === 'scratch' && (
                        <div className="mt-3 border border-teal/20 rounded-card bg-teal/[0.03] p-4 space-y-3">
                          <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
                            Define Hierarchy Levels
                            <span className="ml-1 font-normal normal-case">(top → bottom)</span>
                          </p>
                          {templateErrors.levels && (
                            <p className="text-xs text-danger flex items-center gap-1">
                              <AlertCircle size={12} /> Add at least one level name
                            </p>
                          )}
                          <div className="space-y-2">
                            {templateCustomLevels.map((level, idx) => (
                              <div key={level.id} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-teal/15 text-teal text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={level.name}
                                  onChange={e => { updateTemplateLevel(level.id, e.target.value); setTemplateErrors(er => ({ ...er, levels: false })) }}
                                  placeholder={`Level ${idx + 1} (e.g. ${['Zone', 'Chapter', 'Group', 'Team', 'Cluster'][idx] ?? 'Sub-group'})`}
                                  className="input flex-1 text-sm"
                                />
                                {templateCustomLevels.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTemplateLevel(level.id)}
                                    className="w-8 h-8 rounded-button flex items-center justify-center text-secondary hover:text-danger hover:bg-danger/8 transition-colors flex-shrink-0 border border-border"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {templateCustomLevels.length < 6 && (
                            <button
                              type="button"
                              onClick={addTemplateLevel}
                              className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 font-medium transition-colors"
                            >
                              <Plus size={13} /> Add Level
                            </button>
                          )}
                          <p className="text-xs text-secondary">Max 6 levels. Top level is broadest; bottom is where members belong.</p>
                        </div>
                      )}
                    </div>

                    {/* Apply button */}
                    <div className="flex items-center gap-3 pt-1">
                      {nodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowTemplateStep(false)}
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={applyTemplatePreset}
                        disabled={!templateSelectedPreset}
                        className="btn btn-primary"
                      >
                        Apply Template →
                      </button>
                    </div>
                  </div>
                </div>
              ) : nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-14 h-14 rounded-card bg-teal/10 flex items-center justify-center mb-4">
                    <Building2 size={28} className="text-teal" />
                  </div>
                  <p className="text-sm font-semibold text-primary mb-1">No nodes yet</p>
                  <p className="text-xs text-secondary mb-4">Add your first {levels[0]?.name || 'node'} to get started</p>
                  <button
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                    onClick={handleAddRootNode}
                  >
                    <Plus size={14} /> Add {levels[0]?.name || 'Node'}
                  </button>
                </div>
              ) : unassignedFilter ? (
                /* Unassigned filter view */
                <div className="overflow-auto h-full p-6">
                  <p className="text-xs text-secondary mb-4 font-medium">
                    {displayNodes.length} unassigned node{displayNodes.length !== 1 ? 's' : ''}
                  </p>
                  <div className="max-w-2xl space-y-2">
                    {displayNodes.map(node => {
                      const lv = getLevelByNode(node)
                      return (
                        <div
                          key={node.id}
                          onClick={() => handleSelectNode(node)}
                          className={`bg-white border rounded-card p-3 cursor-pointer hover:shadow-md transition-all
                            ${selectedNode?.id === node.id ? 'border-teal ring-1 ring-teal' : 'border-border'}`}
                          style={{ borderLeft: '4px solid #E6A817' }}
                        >
                          <div className="flex items-center gap-2">
                            {lv && (
                              <span className="badge text-2xs" style={{ background: lv.color + '18', color: lv.color, border: `1px solid ${lv.color}35` }}>
                                {lv.name}
                              </span>
                            )}
                            <span className="font-semibold text-sm text-primary flex-1">{node.name}</span>
                            <button
                              onClick={e => { e.stopPropagation(); openAssignModal(node) }}
                              className="bg-amber/10 border border-amber text-amber-dark hover:bg-amber hover:text-white rounded-button text-xs px-2.5 h-7 transition-colors"
                            >
                              Assign LA
                            </button>
                          </div>
                          <p className="text-2xs text-secondary mt-1">{getPath(node.id)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : treeViewMode === 'org' ? (
                /* ── Org Chart view — zoomable + pannable canvas ── */
                <ZoomableCanvas>
                  <OrgChartCanvas
                    nodes={nodes}
                    levels={levels}
                    selectedNodeId={selectedNode?.id}
                    onSelect={handleSelectNode}
                    onAssignLA={openAssignModal}
                    onAddChild={handleAddChild}
                  />
                </ZoomableCanvas>
              ) : (
                /* ── List tree view ── */
                <div className="overflow-auto h-full p-6">
                  <div className="max-w-2xl">
                    {tree.map(root => (
                      <ListTreeNode
                        key={root.id}
                        node={root}
                        levels={levels}
                        collapsed={collapsed}
                        selectedNodeId={selectedNode?.id}
                        onSelect={handleSelectNode}
                        onAddChild={handleAddChild}
                        onToggle={handleToggleNode}
                        onAssignLA={openAssignModal}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="border-t border-border bg-white px-4 md:px-6 py-2.5 flex-shrink-0 flex items-center gap-3 flex-wrap text-xs">
          <span className="font-semibold text-primary">{effectiveTenantName}</span>
          <span className="text-secondary">{levels.length} levels · {nodes.length} nodes</span>
          <span className="text-success font-medium">{assignedCount} assigned</span>
          {unassignedCount > 0 && <span className="text-amber font-medium">{unassignedCount} unassigned ⚠</span>}
          <button className="btn btn-primary btn-sm ml-auto" onClick={() => toast.success('Changes are auto-saved')}>
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
