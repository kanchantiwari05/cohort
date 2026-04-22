# CNP Platform — Implemented Modules

> **CNP** is a white-label SaaS platform for managing business networking communities.
> The hierarchy is **100% dynamic** — no level names, depth, or structure is hardcoded.
> Platform Admin defines everything from scratch per community.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | React 18 + Vite |
| Routing | React Router v6 |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Date Utilities | date-fns |

---

## User Roles

| Role | Key | Access Level |
|------|-----|-------------|
| Platform Admin | `platform_admin` | System-wide infrastructure & hierarchy design |
| Community Super Admin | `community_super_admin` | Community/tenant-level management |
| Level Admin | `level_admin` | Assigned node + all descendants (scope-aware) |
| Member | `member` | Individual member portal |

---

## Module 1 — Authentication

**Path:** `/login` | **Files:** `src/pages/auth/`

| Feature | Description |
|---------|-------------|
| OTP Login | Phone number entry + 6-digit OTP verification |
| Role-Based Redirect | Auto-routes to role-specific dashboard on login |
| Protected Routes | `ProtectedRoute` enforces role access per route |
| Auth Store | Zustand store — `sendOTP`, `verifyOTP`, `logout`, `quickLogin` |
| User Context | Stores `role`, `communityId`, `nodeId`, `nodeName` for scope-aware rendering |

---

## Module 2 — Platform Admin

**Route prefix:** `/admin` | **Files:** `src/pages/admin/`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin/dashboard` | Platform analytics, tenant metrics, growth charts |
| Tenants | `/admin/tenants` | Multi-tenant management, billing plans, status |
| Hierarchy Builder | `/admin/hierarchy` | **Dynamic** hierarchy CRUD — define levels, add/edit/delete nodes, assign Level Admins |
| Domains | `/admin/domains` | Domain configuration and mapping |
| Deploy | `/admin/deploy` | Deployment management and versioning |
| Users | `/admin/users` | System-wide user management |
| Billing | `/admin/billing` | Revenue tracking, subscription management |
| Health | `/admin/health` | System health monitoring and metrics |
| Support | `/admin/support` | Support ticket management |
| Settings | `/admin/settings` | Platform-level configuration |

### Hierarchy Builder Capabilities (PA only)

| Action | Description |
|--------|-------------|
| Community selector | Switch between tenants to configure each independently |
| Define levels | Add/rename/reorder (drag-drop)/delete hierarchy levels |
| Level color & icon | Per-level visual identity in the org chart |
| Add nodes | Create nodes at any level under any parent |
| Edit nodes | Rename, reassign Level Admin, view stats |
| Delete nodes | Allowed only when node has no children |
| Assign Level Admin | Modal — search members, confirm, stores `laId/laName/laEmail/laPhone/laSince` |
| Remove Level Admin | One-click removal from a node |
| Visual org tree | Color-coded by level, ✓ assigned / ⚠ unassigned indicators |
| Filter unassigned | Amber badge — click to filter tree to nodes lacking a Level Admin |
| 6 community presets | BNI, Religious, Trade, Alumni, Corporate, Flat — for fast setup |

---

## Module 3 — Community Super Admin (CSA)

**Route prefix:** `/csa` | **Files:** `src/pages/csa/`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/csa/dashboard` | Community overview, member growth, referral metrics |
| Hierarchy | `/csa/hierarchy` | **Read-only** hierarchy tree with View-Only banner |
| Members | `/csa/members` | Community-wide member management and status |
| Level Admins | `/csa/level-admins` | Assign/reassign Level Admins to hierarchy nodes |
| Modules | `/csa/modules` | Enable/disable features per community |
| Analytics | `/csa/analytics` | Community performance metrics and trends |
| Communication | `/csa/communication` | Broadcast messaging and announcements |
| Automation | `/csa/automation` | Workflow automation setup |
| Settings | `/csa/settings` | Community-level configuration |

**CSA Hierarchy constraints:**
- Cannot modify structural hierarchy (no add/edit/delete nodes or levels)
- Can only assign/reassign Level Admins to existing nodes
- View-only banner shown at top of hierarchy page

---

## Module 4 — Level Admin

**Route prefix:** `/la` | **Files:** `src/pages/la/`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/la/dashboard` | **Dynamic** — shows assigned node name + level name + breadcrumb path |
| Members | `/la/members` | Members scoped to `getLAScope(nodeId)` — node + all descendants |
| Meetings | `/la/meetings` | Schedule and manage meetings for assigned scope |
| Attendance | `/la/attendance` | Track member attendance at meetings/events |
| Referrals | `/la/referrals` | Monitor referral activity within scope |
| Events | `/la/events` | Create and manage events within scope |
| Visitors | `/la/visitors` | Track guest visits and conversions |
| Reports | `/la/reports` | Generate performance reports for assigned scope |

**Dynamic scope (key change):**
- Dashboard header reads `"{levelName}: {nodeName}"` — e.g. `"Chapter: Andheri Chapter"` or `"State: Maharashtra"`
- Breadcrumb shows full ancestor path via `getNodePath(nodeId)`
- All data queries use `getLAScope(nodeId)` — works for Zone-level, Chapter-level, State-level, Shakha-level LA without any code change

---

## Module 5 — Member

**Route prefix:** `/member` | **Files:** `src/pages/member/`

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/member/dashboard` | Personal score (0–100), quick actions, recent activity |
| Referrals | `/member/referrals` | Log referrals, track value and success rate |
| Meetings | `/member/meetings` | View calendar, RSVP to meetings |
| Events | `/member/events` | Browse and register for events |
| 1-on-1 Meetings | `/member/one-on-one` | Schedule and manage one-on-one conversations |
| Feed | `/member/feed` | Activity feed and community updates |
| Directory | `/member/directory` | Search and view other members' business details |
| My Stats | `/member/my-stats` | Personal performance metrics |
| Profile | `/member/profile` | View/edit profile and business information |

> Member pages are conditionally shown based on which modules the CSA has enabled for the community.

---

## Dynamic Hierarchy System *(new)*

**Core concept:** No level name (Zone, Chapter, State, Shakha, etc.) is hardcoded anywhere.
The Platform Admin designs the entire hierarchy from scratch per community.

### Supported Community Types

| Type | Example Structure | Preset |
|------|-------------------|--------|
| Professional Networking | Zone → Chapter → Group | `preset-bni` |
| Religious / Spiritual | Country → State → City → Temple Shakha | `preset-religious` |
| Trade Association | Federation → State Body → District → Committee | `preset-trade` |
| Alumni Network | University → Campus → Batch → Department | `preset-alumni` |
| Corporate Internal | Region → Division → Team | `preset-corporate` |
| Flat | Members directly under community head | `preset-flat` |

### Data Model

#### Hierarchy Config (per community)
```
levels: [{ id, index, name, namePlural, color, icon, canHaveLA, isOperational }]
maxDepth: number
```

#### Node (flat array, `parentId` references)
```
{ id, communityId, levelId, levelIndex, levelName,
  parentId, name, code,
  laId, laName, laEmail, laPhone, laSince,
  memberCount, directMemberCount, childNodeCount,
  active, createdAt }
```

#### Member (single `nodeId`, no level-specific fields)
```
{ id, communityId, nodeId, name, phone, email,
  businessName, category, status, engagementScore,
  memberId, memberSince }
```

### Sample Communities

| Community | Type | Levels | Nodes | Members |
|-----------|------|--------|-------|---------|
| BNI Mumbai Metro | professional_networking | 3 (Zone → Chapter → Group) | 19 | 10 (sample) |
| Akhil Bharat Hindu Parishad | religious | 4 (Country → State → City → Temple Shakha) | 17 | 4 (sample) |
| Mumbai Founders Club | flat | 1 (Club) | 1 | 3 (sample) |

---

## Shared Components

**Files:** `src/components/`

| Component | File | Purpose |
|-----------|------|---------|
| ProtectedRoute | `ProtectedRoute.jsx` | Route-level auth guard with role checking |
| Modal | `Modal.jsx` | Reusable dialog/popup component |
| SlideOver | `SlideOver.jsx` | Slide-in panel component |
| Skeleton | `Skeleton.jsx` | Loading skeleton UI |
| ComingSoon | `ComingSoon.jsx` | Placeholder for upcoming features |

*Pending addition:* `src/components/hierarchy/HierarchyTree.jsx` and `TreeNode.jsx` (reusable across PA builder and CSA view)

---

## Layouts

**Files:** `src/layouts/`

| Layout | File | Purpose |
|--------|------|---------|
| DashboardLayout | `DashboardLayout.jsx` | Admin/CSA/Level Admin shell with sidebar |
| MemberLayout | `MemberLayout.jsx` | Member-specific shell |
| AppLayout | `AppLayout.jsx` | Base app layout wrapper |
| Header | `Header.jsx` | Top navigation bar |
| Sidebar | `Sidebar.jsx` | Role-aware dynamic sidebar navigation |

---

## State Management

**Files:** `src/store/`

| Store | File | Manages |
|-------|------|---------|
| Auth Store | `authStore.js` | User session, role, OTP flow, `nodeId` context |
| Tenant Store | `tenantStore.js` | Multi-tenant context, enabled modules |
| Hierarchy Store | `hierarchyStore.js` *(pending)* | Communities, nodes, levels, LA assignments, UI state |

---

## Data Files

**Files:** `src/data/`

| File | Purpose | Status |
|------|---------|--------|
| `users.js` | Login users / role mappings | Existing |
| `tenants.js` | Tenant config, modules, plan details | Existing |
| `platform.js` | Platform metrics, growth data, tenant info | Existing |
| `hierarchy.js` | Legacy zone/chapter/group structure (BNI-only) | Existing (deprecated) |
| `members.js` | Legacy member profiles with `zone/chapter/group` fields | Existing (deprecated) |
| `meetings.js` | Meeting/event calendar data | Existing |
| `referrals.js` | Referral tracking data | Existing |
| `hierarchySchema.js` | Schema documentation for all hierarchy entities | **New** |
| `communities.js` | 3 sample communities with dynamic nodes + members | **New** |
| `communityPresets.js` | 6 hierarchy presets for fast community setup | **Pending** |

---

## Utility Functions

**File:** `src/utils/hierarchyUtils.js` *(pending)*

| Function | Purpose |
|----------|---------|
| `buildTree(nodes, parentId)` | Converts flat node array → nested tree |
| `getChildren(nodeId, nodes)` | Direct children of a node |
| `getDescendants(nodeId, nodes)` | All descendants recursively |
| `getLAScope(nodeId, nodes)` | Node + all descendants (LA's accessible scope) |
| `getAncestors(nodeId, nodes)` | Ancestor chain (for breadcrumb) |
| `getNodePath(nodeId, nodes)` | Full path string e.g. `"North Zone > Andheri Chapter"` |
| `getMembersInScope(nodeId, nodes, members)` | Members within LA's scope |
| `isNodeNameUnique(name, parentId, nodes)` | Validation before add/rename |
| `canDeleteNode(nodeId, nodes)` | Blocks delete if children exist |
| `canDeleteLevel(levelId, nodes)` | Blocks delete if nodes at that level exist |
| `getNodeStats(nodeId, nodes, members)` | Aggregated counts for a node |
| `reindexLevels(levels)` | Re-assigns `index` after drag-reorder |
| `generateNodeId()` / `generateLevelId()` | Unique ID generators |

---

## Feature Matrix

| Feature | Platform Admin | CSA | Level Admin | Member |
|---------|:-:|:-:|:-:|:-:|
| Dashboard / Analytics | ✓ | ✓ | ✓ | ✓ |
| Member Management | ✓ | ✓ | ✓ (scoped) | — |
| Hierarchy — Design & CRUD | ✓ | — | — | — |
| Hierarchy — View | ✓ | ✓ (read-only) | Own scope | — |
| Level Admin Assignment | ✓ | ✓ | — | — |
| Meetings | — | — | ✓ | ✓ |
| Referrals | — | ✓ | ✓ | ✓ |
| Events | — | ✓ | ✓ | ✓ |
| Attendance Tracking | — | — | ✓ | Implicit |
| 1-on-1 Meetings | — | — | — | ✓ |
| Member Directory | — | — | — | ✓ |
| Profile Management | — | — | — | ✓ |
| Communication / Broadcast | — | ✓ | — | — |
| Automation | — | ✓ | — | — |
| Module Configuration | — | ✓ | — | — |
| Community Presets (6 types) | ✓ | — | — | — |
| Billing / Subscriptions | ✓ | — | — | — |
| System Health | ✓ | — | — | — |
| Domain Management | ✓ | — | — | — |
| Tenant Management | ✓ | — | — | — |
| Settings | ✓ | ✓ | — | — |

---

## Directory Structure

```
src/
├── pages/
│   ├── admin/          # 10 pages — Platform Admin (active)
│   ├── csa/            # 9 pages  — Community Super Admin (active)
│   ├── la/             # 8 pages  — Level Admin (active)
│   ├── member/         # 9 pages  — Member (active)
│   ├── auth/           # 2 pages  — Login / OTP
│   ├── platform-admin/ # legacy (unused)
│   ├── super-admin/    # legacy (unused)
│   └── level-admin/    # legacy (unused)
├── layouts/            # 5 layout components
├── components/
│   ├── (existing 5)
│   └── hierarchy/      # ← pending: HierarchyTree.jsx, TreeNode.jsx
├── store/
│   ├── authStore.js
│   ├── tenantStore.js
│   └── hierarchyStore.js  # ← pending
├── data/
│   ├── (existing files)
│   ├── hierarchySchema.js  # ← new
│   ├── communities.js      # ← new
│   └── communityPresets.js # ← pending
├── utils/
│   └── hierarchyUtils.js   # ← pending
├── hooks/              # useLoading hook
├── assets/
├── App.jsx
└── main.jsx
```

---

## Implementation Status

| Item | Status |
|------|--------|
| All 5 role modules (Auth, Admin, CSA, LA, Member) | ✅ Done |
| Dynamic hierarchy data model | ✅ Done (`hierarchySchema.js`, `communities.js`) |
| 3 sample communities (BNI, Religious, Flat) | ✅ Done |
| Community presets (6 types) | ⏳ Pending |
| `hierarchyUtils.js` utility functions | ⏳ Pending |
| `hierarchyStore.js` Zustand store | ⏳ Pending |
| `HierarchyTree.jsx` + `TreeNode.jsx` components | ⏳ Pending |
| `HierarchyBuilderPage.jsx` (PA — full CRUD) | ⏳ Pending |
| `HierarchyViewPage.jsx` (CSA — read-only) | ⏳ Pending |
| LA Dashboard dynamic scope | ⏳ Pending |
| `App.jsx` route updates | ⏳ Pending |

---

*Last updated: April 2026*
