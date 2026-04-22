import { useState } from 'react'
import {
  Shield, Plus, ChevronRight, Users, Check, X, Search,
  Edit3, Trash2, UserCog, Lock, Info, AlertTriangle,
  Crown, Star, Briefcase, User, ChevronDown, MoreVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DEFAULT_ROLES, CUSTOM_ROLES, PERMISSION_ACTIONS,
  DEFAULT_PERMISSIONS, CSA_ENABLED_MODULES, CSA_USERS, ALL_MODULES,
} from '../../data/rbac'

// ── Helpers ────────────────────────────────────────────────────────────────────
function roleBadgeCls(color) {
  const map = {
    danger:  'badge-danger',
    navy:    'badge-navy',
    teal:    'badge-teal',
    success: 'badge-success',
    amber:   'badge-amber',
    warning: 'badge-amber',
  }
  return map[color] || 'badge-gray'
}

function roleIcon(color) {
  const map = {
    danger:  Crown,
    navy:    Star,
    teal:    Briefcase,
    success: User,
    amber:   UserCog,
    warning: UserCog,
  }
  return map[color] || User
}

function statusBadge(status) {
  return status === 'active'
    ? ['Active', 'badge-success']
    : ['Inactive', 'badge-danger']
}

// ── Enabled module objects for CSA ─────────────────────────────────────────────
const enabledModuleObjs = ALL_MODULES.filter(m => CSA_ENABLED_MODULES.includes(m.id))
const disabledModuleObjs = ALL_MODULES.filter(m => !CSA_ENABLED_MODULES.includes(m.id))

const ACTION_LABELS = {
  view:    'View',
  create:  'Create',
  edit:    'Edit',
  delete:  'Delete',
  export:  'Export',
  approve: 'Approve',
}

// ── Toggle Cell ────────────────────────────────────────────────────────────────
function PermCell({ checked, onChange }) {
  return (
    <td className="px-3 py-2.5 text-center">
      <button
        onClick={() => onChange(!checked)}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all duration-150
          ${checked
            ? 'bg-teal border-teal text-white'
            : 'bg-white border-border text-transparent hover:border-teal/50'
          }`}
      >
        <Check size={12} strokeWidth={3} />
      </button>
    </td>
  )
}

// ── Role Card ──────────────────────────────────────────────────────────────────
function RoleCard({ role, isSelected, onSelect, onDelete }) {
  const Icon = roleIcon(role.color)
  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-card
        ${isSelected
          ? 'border-teal bg-teal/5 shadow-card'
          : 'border-border bg-white hover:border-teal/30'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
            ${isSelected ? 'bg-teal text-white' : 'bg-surface'}`}>
            <Icon size={15} className={isSelected ? '' : 'text-secondary'} />
          </div>
          <div>
            <p className={`font-semibold text-sm leading-tight ${isSelected ? 'text-teal' : 'text-primary'}`}>
              {role.name}
            </p>
            <span className={`badge ${roleBadgeCls(role.color)} text-2xs mt-0.5`}>
              {role.isDefault ? 'Default' : 'Custom'}
            </span>
          </div>
        </div>
        {!role.isDefault && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(role) }}
            className="p-1 rounded text-secondary hover:text-danger hover:bg-danger/8 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <p className="text-2xs text-secondary mt-2 leading-relaxed">{role.description}</p>
      <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-1 text-2xs text-secondary">
        <Users size={11} />
        <span>{role.usersCount} user{role.usersCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

// ── Create Role Modal ──────────────────────────────────────────────────────────
function CreateRoleModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState('teal')

  const COLORS = [
    { key: 'teal',    label: 'Teal',    bg: '#028090' },
    { key: 'navy',    label: 'Navy',    bg: '#1B3A6B' },
    { key: 'amber',   label: 'Amber',   bg: '#E6A817' },
    { key: 'success', label: 'Green',   bg: '#2E7D32' },
    { key: 'danger',  label: 'Red',     bg: '#BF360C' },
  ]

  if (!isOpen) return null

  const handleCreate = () => {
    if (!name.trim()) { toast.error('Role name is required'); return }
    onCreate({ name: name.trim(), description: desc.trim(), color, usersCount: 0, isDefault: false })
    setName(''); setDesc(''); setColor('teal')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(27,58,107,0.45)' }}>
      <div className="bg-white rounded-card shadow-modal w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-primary text-base flex items-center gap-2">
            <Plus size={16} className="text-teal" /> Create New Role
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm px-2"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Role Name *</label>
            <input
              className="input"
              placeholder="e.g. Chapter Admin"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Description</label>
            <textarea
              className="input h-auto py-2 resize-none"
              rows={3}
              placeholder="Describe what this role can do…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-2">Badge Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  className={`w-7 h-7 rounded-full border-2 transition-all
                    ${color === c.key ? 'border-primary scale-110' : 'border-transparent'}`}
                  style={{ background: c.bg }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleCreate} className="btn btn-primary">Create Role</button>
        </div>
      </div>
    </div>
  )
}

// ── Assign Role Modal ──────────────────────────────────────────────────────────
function AssignRoleModal({ isOpen, onClose, user, allRoles, onAssign }) {
  const [selected, setSelected] = useState(user?.roleId || '')

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(27,58,107,0.45)' }}>
      <div className="bg-white rounded-card shadow-modal w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-primary text-base">Change Role</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm px-2"><X size={16} /></button>
        </div>
        <p className="text-sm text-secondary mb-4">
          Assigning role for <span className="font-semibold text-primary">{user.name}</span>
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allRoles.map(r => (
            <label key={r.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
              ${selected === r.id ? 'border-teal bg-teal/5' : 'border-border hover:border-teal/30'}`}>
              <input type="radio" name="role" value={r.id} checked={selected === r.id}
                onChange={() => setSelected(r.id)} className="accent-teal" />
              <div>
                <p className="text-sm font-semibold text-primary">{r.name}</p>
                <p className="text-2xs text-secondary">{r.description}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={() => { onAssign(user.id, selected); onClose() }} className="btn btn-primary">
            Assign Role
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RolesPermissionsPage() {
  const allRoles = [...DEFAULT_ROLES, ...CUSTOM_ROLES]
  const [roles, setRoles] = useState([...CUSTOM_ROLES])
  const [selectedRole, setSelectedRole] = useState(CUSTOM_ROLES[0])
  const [activeTab, setActiveTab] = useState('matrix') // 'matrix' | 'users'
  const [createOpen, setCreateOpen]   = useState(false)
  const [assignModal, setAssignModal] = useState(null) // user object
  const [userSearch, setUserSearch]   = useState('')
  const [users, setUsers]             = useState(CSA_USERS)

  // Permissions state per custom role
  const [perms, setPerms] = useState(() => {
    const init = {}
    CUSTOM_ROLES.forEach(r => {
      init[r.id] = {}
      enabledModuleObjs.forEach(m => {
        init[r.id][m.id] = {
          ...(DEFAULT_PERMISSIONS[r.id]?.[m.id] || { view: false, create: false, edit: false, delete: false, export: false, approve: false })
        }
      })
    })
    return init
  })

  const currentPerms = selectedRole ? (perms[selectedRole.id] || {}) : {}
  const isDefault    = selectedRole?.isDefault

  const togglePerm = (moduleId, action, value) => {
    if (isDefault) return
    setPerms(prev => ({
      ...prev,
      [selectedRole.id]: {
        ...prev[selectedRole.id],
        [moduleId]: {
          ...prev[selectedRole.id]?.[moduleId],
          [action]: value,
        },
      },
    }))
  }

  const handleCreateRole = (roleData) => {
    const newRole = {
      ...roleData,
      id: `role-custom-${Date.now()}`,
    }
    setRoles(prev => [...prev, newRole])
    // Init empty perms
    setPerms(prev => ({
      ...prev,
      [newRole.id]: Object.fromEntries(
        enabledModuleObjs.map(m => [m.id, { view: false, create: false, edit: false, delete: false, export: false, approve: false }])
      ),
    }))
    setSelectedRole(newRole)
    toast.success(`Role "${newRole.name}" created.`, { style: { fontSize: 13 } })
  }

  const handleDeleteRole = (role) => {
    setRoles(prev => prev.filter(r => r.id !== role.id))
    if (selectedRole?.id === role.id) setSelectedRole(CUSTOM_ROLES[0] || DEFAULT_ROLES[0])
    toast.success(`Role "${role.name}" deleted.`, { style: { fontSize: 13 } })
  }

  const handleSavePerms = () => {
    toast.success('Permissions saved successfully!', { style: { fontSize: 13 } })
  }

  const handleAssignRole = (userId, roleId) => {
    const role = [...DEFAULT_ROLES, ...roles].find(r => r.id === roleId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId, role: role?.name || u.role } : u))
    toast.success('Role assigned.', { style: { fontSize: 13 } })
  }

  const handleDeactivate = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId
      ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
      : u
    ))
    toast.success('User status updated.', { style: { fontSize: 13 } })
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const combinedRoles = [...DEFAULT_ROLES, ...roles]

  return (
    <>
      <div className="space-y-6 pb-10 p-3">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5 text-2xs text-secondary mb-1.5">
              <span>Harvard Alumni</span>
              <ChevronRight size={11} />
              <span className="text-primary font-medium">Roles &amp; Permissions</span>
            </div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Shield size={20} className="text-teal" />
              Roles &amp; Permissions
            </h1>
            <p className="text-sm text-secondary mt-1">
              Create roles and control access inside enabled modules.
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary gap-2">
            <Plus size={15} />
            Create New Role
          </button>
        </div>

        {/* ── Disabled modules notice ── */}
        {disabledModuleObjs.length > 0 && (
          <div className="flex items-start gap-3 bg-amber/8 border border-amber/25 rounded-card px-4 py-3">
            <Lock size={15} className="text-amber mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber font-semibold">Some modules are disabled by Platform Owner</p>
              <p className="text-2xs text-secondary mt-0.5">
                {disabledModuleObjs.map(m => m.name).join(', ')} — These modules are not available for your community.
                Contact the Platform Owner to enable them.
              </p>
            </div>
          </div>
        )}

        {/* ── Main Split Layout ── */}
        <div className="flex gap-5 items-start">

          {/* ── Roles Sidebar ── */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Default Roles</p>
            </div>
            {DEFAULT_ROLES.map(role => (
              <RoleCard
                key={role.id}
                role={role}
                isSelected={selectedRole?.id === role.id}
                onSelect={() => setSelectedRole(role)}
                onDelete={() => {}}
              />
            ))}

            {roles.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-2 mb-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Custom Roles</p>
                </div>
                {roles.map(role => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isSelected={selectedRole?.id === role.id}
                    onSelect={() => setSelectedRole(role)}
                    onDelete={handleDeleteRole}
                  />
                ))}
              </>
            )}

            <button
              onClick={() => setCreateOpen(true)}
              className="btn btn-outline btn-sm w-full gap-2 mt-1"
            >
              <Plus size={13} />
              Add Custom Role
            </button>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Role Header */}
            {selectedRole && (
              <div className="card card-body py-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-teal/10`}>
                    <Shield size={18} className="text-teal" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-primary">{selectedRole.name}</h3>
                      <span className={`badge ${roleBadgeCls(selectedRole.color)}`}>
                        {selectedRole.isDefault ? 'Default' : 'Custom'}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-0.5">{selectedRole.description}</p>
                  </div>
                </div>
                {isDefault && (
                  <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface rounded-lg px-3 py-1.5">
                    <Lock size={12} /> Default roles have fixed permissions
                  </div>
                )}
                {!isDefault && (
                  <button onClick={handleSavePerms} className="btn btn-primary btn-sm gap-1.5">
                    <Check size={13} /> Save Permissions
                  </button>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-border p-1 w-fit">
              {[
                { key: 'matrix', label: 'Permission Matrix' },
                { key: 'users',  label: 'Assigned Users' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${activeTab === t.key
                      ? 'bg-teal text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Permission Matrix Tab ── */}
            {activeTab === 'matrix' && selectedRole && (
              <div className="card overflow-hidden">
                {isDefault && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-navy/5 border-b border-border text-xs text-navy">
                    <Info size={13} className="flex-shrink-0" />
                    This is a default role. Permissions are fixed and cannot be modified.
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-surface/60">
                        <th className="px-5 py-3 text-left text-2xs font-semibold text-secondary uppercase tracking-wider w-44">
                          Module
                        </th>
                        {PERMISSION_ACTIONS.map(a => (
                          <th key={a} className="px-3 py-3 text-center text-2xs font-semibold text-secondary uppercase tracking-wider">
                            {ACTION_LABELS[a]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {/* Enabled modules */}
                      {enabledModuleObjs.map(module => {
                        const modulePerms = isDefault
                          ? { view: true, create: true, edit: true, delete: true, export: true, approve: true }
                          : (currentPerms[module.id] || {})
                        return (
                          <tr key={module.id} className="hover:bg-surface/40 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded flex items-center justify-center"
                                  style={{ background: `${module.color}18` }}>
                                  <Shield size={11} style={{ color: module.color }} />
                                </div>
                                <span className="text-sm font-medium text-primary">{module.name}</span>
                              </div>
                            </td>
                            {PERMISSION_ACTIONS.map(action => (
                              <PermCell
                                key={action}
                                checked={!!modulePerms[action]}
                                onChange={val => togglePerm(module.id, action, val)}
                              />
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Disabled modules notice in matrix */}
                {disabledModuleObjs.length > 0 && (
                  <div className="border-t border-border">
                    {disabledModuleObjs.map(module => (
                      <div key={module.id}
                        className="flex items-center gap-4 px-5 py-3 bg-surface/40 opacity-60">
                        <div className="w-44 flex items-center gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-border/60">
                            <Lock size={11} className="text-secondary" />
                          </div>
                          <span className="text-sm text-secondary line-through">{module.name}</span>
                        </div>
                        <span className="text-xs text-secondary italic flex-1">
                          This module has been disabled by Platform Owner.
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Users Tab ── */}
            {activeTab === 'users' && (
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-surface/60 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm font-semibold text-primary">
                    Users with role: <span className="text-teal">{selectedRole?.name}</span>
                  </p>
                  <div className="relative w-60">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                      className="input pl-9 text-xs"
                      placeholder="Search users…"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-surface/40">
                        {['Name', 'Email', 'Current Role', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-2xs font-semibold text-secondary uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map(user => {
                        const [statusLabel, statusCls] = statusBadge(user.status)
                        return (
                          <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal text-xs font-bold flex-shrink-0">
                                  {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-primary">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-secondary">{user.email}</td>
                            <td className="px-5 py-3">
                              <span className={`badge ${roleBadgeCls(
                                combinedRoles.find(r => r.id === user.roleId)?.color || 'teal'
                              )}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`badge ${statusCls}`}>{statusLabel}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setAssignModal(user)}
                                  className="btn btn-ghost btn-sm text-teal hover:bg-teal/10 gap-1"
                                >
                                  <UserCog size={13} /> Change Role
                                </button>
                                <button
                                  onClick={() => handleDeactivate(user.id)}
                                  className={`btn btn-ghost btn-sm gap-1 ${
                                    user.status === 'active'
                                      ? 'text-danger hover:bg-danger/8'
                                      : 'text-success hover:bg-success/8'
                                  }`}
                                >
                                  {user.status === 'active' ? <X size={13} /> : <Check size={13} />}
                                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-secondary text-sm">
                      No users found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Info Footer ── */}
        <div className="flex items-start gap-3 bg-navy/5 border border-navy/15 rounded-card px-4 py-3">
          <Info size={16} className="text-navy mt-0.5 flex-shrink-0" />
          <p className="text-sm text-navy">
            <strong>Note:</strong> You can only manage permissions inside modules enabled by your Platform Owner.
            Disabled modules are automatically removed from role matrices and community sidebar.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateRoleModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateRole}
      />
      <AssignRoleModal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        user={assignModal}
        allRoles={combinedRoles}
        onAssign={handleAssignRole}
      />
    </>
  )
}
