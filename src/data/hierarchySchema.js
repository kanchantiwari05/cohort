// ─────────────────────────────────────────────────────────────────────────────
// CNP — Dynamic Hierarchy Schema Documentation
// This file documents the shape of each entity. Not imported at runtime.
// ─────────────────────────────────────────────────────────────────────────────

// ─── COMMUNITY ───────────────────────────────────────────────────────────────
export const communitySchema = {
  id: 'comm-001',
  name: 'BNI Mumbai Metro',
  type: 'professional_networking',
  // type options:
  // professional_networking | alumni | trade_association
  // religious | corporate | interest_based | flat
  domain: 'bnimumbai.cnp.app',
  csaId: 'csa-001',
  csaName: 'Rajesh Mehta',
  memberCount: 240,
  activeModules: [
    'meetings', 'attendance', 'referrals',
    'one_to_one', 'communication',
  ],
  createdAt: '2024-02-15',
  status: 'active',
};

// ─── HIERARCHY CONFIG ─────────────────────────────────────────────────────────
// Defines the LEVELS (structure template). Stored per community.
// PA defines these first before creating nodes.
export const hierarchyConfigSchema = {
  id: 'hconfig-001',
  communityId: 'comm-001',
  communityName: 'BNI Mumbai Metro',
  maxDepth: 3,
  levels: [
    {
      id: 'hlvl-001',
      index: 0,           // 0 = topmost level
      name: 'Zone',
      namePlural: 'Zones',
      color: '#1B3A6B',   // for visual tree badge
      icon: 'map-pin',    // lucide icon name
      description: 'Regional grouping of chapters',
      canHaveLA: true,    // can a Level Admin be assigned here
      isOperational: false, // does day-to-day work happen here
    },
    {
      id: 'hlvl-002',
      index: 1,
      name: 'Chapter',
      namePlural: 'Chapters',
      color: '#028090',
      icon: 'users',
      description: 'Local networking chapters',
      canHaveLA: true,
      isOperational: true,
    },
    {
      id: 'hlvl-003',
      index: 2,
      name: 'Group',
      namePlural: 'Groups',
      color: '#C17900',
      icon: 'user-check',
      description: 'Sub-groups within chapters',
      canHaveLA: true,
      isOperational: true,
    },
  ],
  createdAt: '2024-02-15',
  updatedAt: '2024-02-15',
  createdBy: 'pa-001',
};

// ─── HIERARCHY NODE ───────────────────────────────────────────────────────────
// Actual node instances. Stored as flat array with parentId references.
// Works for ANY depth — no level names are hardcoded.
export const nodeSchema = {
  id: 'node-001',
  communityId: 'comm-001',

  // Level reference
  levelId: 'hlvl-001',
  levelIndex: 0,
  levelName: 'Zone',        // denormalized for display speed

  // Tree structure — parentId = null means root node
  parentId: null,
  path: '/node-001',        // full ancestor path for fast subtree queries
  // Deep example: '/node-001/node-003/node-010'

  // Identity
  name: 'North Zone',
  code: 'NZ',               // optional short code

  // Level Admin
  laId: null,
  laName: null,
  laEmail: null,
  laPhone: null,
  laSince: null,

  // Stats (computed/updated on mutation)
  memberCount: 94,
  directMemberCount: 0,
  childNodeCount: 4,
  totalDescendantCount: 12,

  active: true,
  createdAt: '2024-02-15',
  updatedAt: '2024-02-15',
  createdBy: 'pa-001',
};

// ─── MEMBER ───────────────────────────────────────────────────────────────────
// Members reference a single nodeId (their bottom-level node).
// No zone/chapter/group fields — all ancestry is derived via hierarchy utils.
export const memberSchema = {
  id: 'mem-001',
  communityId: 'comm-001',
  nodeId: 'node-010',       // bottom-level node they belong to

  name: 'Amit Desai',
  phone: '9812345678',
  email: 'amit@desaitech.com',
  businessName: 'Desai Technologies',
  category: 'IT Services',
  role: 'member',
  status: 'active',
  engagementScore: 87,
  memberId: 'BNI-AND-001',
  memberSince: '2024-03-01',
  createdAt: '2024-03-01',
};
