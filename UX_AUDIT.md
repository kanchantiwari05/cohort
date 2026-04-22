# CNP Platform Admin — UX Change Spec

> Concrete UI changes to make, file by file. Each item says exactly what to add, remove, or move.

---

## Sidebar / DashboardLayout.jsx

**Remove from nav:**
- `Hierarchy` entry — redundant (per-tenant hierarchy is TenantNew step 4; templates are Settings > Community Types)
- `Branding` entry — redundant (branding is always per-tenant via TenantNew step 3 / TenantDetail; platform identity is Settings > Platform Identity)
- `Analytics` entry — Phase 2 stub, remove until built
- `Users` entry — Phase 2 stub, remove until built

**Final platform_admin nav should be:**
```
Dashboard
── Tenants ──────────────
  All Tenants
  Launch Tracker
── Configuration ─────────
  Domains
  App Deployment
── Operations ────────────
  Billing
  Support
  Health
  Community Access
── Master Settings ───────
  Plans
  Modules
  Community Types
  Platform Identity
```

---

## Dashboard.jsx

**Add:**
- "+ New Tenant" primary button in the page header (top-right), linking to `/admin/tenants/new`
- Make each stat card clickable with a subtle hover state:
  - Total Tenants → `/admin/tenants`
  - Active Communities → `/admin/tenants?status=active`
  - Open Support Tickets → `/admin/support?status=open`
  - Monthly Revenue → `/admin/billing`
- Make each row in the Top Communities table clickable → `/admin/tenants/:id`
- Add "View all tenants →" link below the Top Communities table
- If any system service status is not green, show a dismissable amber alert banner at the very top of the page: *"Service degraded: OTP delivery — [View Health →]"*

**Fix:**
- "View all activity" link in the activity feed → navigate to `/admin/support` (closest available page) until a dedicated audit log page exists
- "View detailed health" link → navigate to `/admin/health`

**Remove:**
- Commented-out Quick Actions block — either implement or delete entirely

---

## Tenants.jsx

**Add:**
- "New Tenant" button in the page header top-right corner (primary button), linking to `/admin/tenants/new`
- In table view: visually dim suspended tenant rows (50% opacity on all cells except the status badge and action menu)

---

## TenantDetail.jsx

**Remove:**
- Billing tab entirely — replace with a read-only "Billing Summary" section inside the Overview tab showing: current plan, next invoice date, MRR. Add a "View Full Billing →" link that navigates to `/admin/billing?tenant=:id`
- "Send Message" button — remove until functional
- "Reset Access" button — remove until functional

**Add:**
- "Edit Tenant" button in the page header (next to tenant name), linking to `/admin/tenants/:id/edit`. Remove it from wherever it's buried in a tab.
- For tenants created less than 14 days ago that haven't gone live yet — show a "Setup Checklist" card at the top of the Overview tab:

```
Setup Checklist                                    2 of 5 complete
─────────────────────────────────────────────────────────────────
✅  Branding configured        (done)
✅  Domain provisioned         (done)
⬜  App build triggered        → Go to App Deployment
⬜  CSA has logged in          (waiting...)
⬜  Go Live                    [Mark as Live]
```

Each incomplete step links directly to the relevant admin page with the tenant context pre-filled.

- Modules tab: add subtitle *"Active for this tenant — overrides community defaults"* below the tab title

---

## TenantEdit.jsx

**Add:**
- After saving, show a toast with a suggested next step:
  - If branding fields changed → *"Branding updated — trigger a new app build to apply changes [Go →]"*
  - Otherwise → *"Changes saved"* (plain toast is fine)

---

## AppBuildDetail.jsx

**Add:**
- Breadcrumb: `App Deployment > Build #[id]`
- After smoke test is marked complete, show a "Build Complete" success card:
  - "Return to App Deployment" button → `/admin/app-deployment`
  - "View Tenant" button → `/admin/tenants/:id`

**Fix:**
- Smoke test checklist should start blank (all items unchecked) for new builds — remove pre-populated dummy pass/fail data

---

## OnboardingDetail.jsx (Launch Tracker Detail)

**Add:**
- Breadcrumb: `Launch Tracker > [Community Name]`
- "Send Nudge" button accessible directly on the page header (not only from the card in the list view)

---

## Domains.jsx

**Add:**
- After domain provisioning animation completes, show a success card:
  - "View Tenant" button → `/admin/tenants/:id`
  - "Copy domain URL" button
- For custom domain setup: add a "DNS Records" collapsible panel showing the exact CNAME record to add, with a copy button

**Fix:**
- After provisioning: don't just stop the animation — replace it with a persistent "Domain is live" green banner so the admin knows it's done

---

## Support.jsx

**Add:**
- "New Ticket" button in the page header top-right
- "My Assigned" tab in the filter tabs (alongside All / Open / In-Progress / Resolved)

**Fix:**
- Auto-sort: rows where SLA is breached should always float to the top of the list regardless of other sort order
- Replace native `<select>` filter elements with the `FilterBar` component to match other pages

---

## Billing.jsx

**Add:**
- Invoice rows: "Resend Invoice" action in the row action menu (alongside Download and Change Plan)
- Overdue banner: show the exact count and total amount — *"3 invoices overdue · ₹45,000 outstanding"* instead of a generic warning
- Invoice rows: clicking tenant name in a row navigates to `/admin/tenants/:id`

**Fix:**
- "Send Payment Reminder" action should open a confirm dialog before sending — not fire immediately

---

## Health.jsx

**Add:**
- Breadcrumb: `Dashboard > Health Monitor`
- Each service status card: show "Last checked: X seconds ago" timestamp below the status dot
- Add an "Incident History" section at the bottom: last 5 incidents with start time, duration, and resolution note

**Fix:**
- "Configure Alert Thresholds" UI — either wire it up or remove the form controls. Showing uneditable alert threshold inputs creates false impression of functionality.

---

## CommunityAccess.jsx

**Add:**
- "Bulk Enable Module" action: checkboxes on each row + a "Enable module for selected" dropdown button in the header that appears when rows are selected

**Fix:**
- Replace native `<select>` filter elements with the `FilterBar` component

---

## CommunityAccessDetail.jsx

**Add:**
- Breadcrumb: `Community Access > [Community Name]`

---

## CommunityAccessForm.jsx

**Add:**
- Breadcrumb: `Community Access > New` or `Community Access > [Name] > Edit`
- After creating a new community access entry, show a success state with next steps: *"Access created. Next: enable modules →"* with a button linking to the detail page

---

## settings/PlanFormPage.jsx

**Add:**
- Breadcrumb: `Settings > Plans > New Plan` or `Settings > Plans > [Plan Name] > Edit`

---

## settings/CommunityTypeFormPage.jsx

**Add:**
- Breadcrumb: `Settings > Community Types > New` or `Settings > Community Types > [Name] > Edit`

---

## settings/ModuleCatalogueTab.jsx

**Add:**
- Subtitle below the tab/page title: *"Platform defaults — applies to all new tenants"*

---

## settings/CommunityTypesTab.jsx

**Add:**
- Move email templates (welcome, meeting, referral, renewal) out of `Branding.jsx` into a new **Email Templates** sub-tab here under Settings, since email content is a platform-level config, not a branding visual

---

## Branding.jsx

**Decision: Remove from sidebar nav** (already done in DashboardLayout). Branding editing for an existing tenant should be accessible only from within TenantDetail's setup checklist or a direct "Edit Branding" link on the tenant overview card. The page itself can stay — just no standalone nav entry.

---

## Files to Delete (Unused / Dead Code)

| File | Reason |
|---|---|
| `src/layouts/AppLayout.jsx` | Never used — App.jsx uses DashboardLayout exclusively |
| `src/layouts/Sidebar.jsx` | Only imported by AppLayout.jsx |
| `src/pages/admin/Settings.jsx` | Changelog page with no active route — `/admin/settings` redirects to plans |

---

## Shared Component Fixes (Apply Everywhere)

### 1. Filters → use FilterBar on all list pages
Pages that still use native `<select>`: Support, Billing, CommunityAccess.
Swap to `src/components/FilterBar.jsx` — same component already used in Tenants and Domains.

### 2. Pagination → standardize format on all list pages
All paginated tables should show: *"Showing 1–10 of 47"* + page number buttons + a rows-per-page selector (10 / 25 / 50).
Pages missing this: Support, Billing.

### 3. Empty States → use icon + message + CTA button pattern
Pages with plain text empty states: CommunityAccess, Support.
Pattern to use (already exists in Domains.jsx):
```
[Icon]
No [items] found
[Optional subtext]
[CTA Button]
```

### 4. Confirmation Dialogs → standardize by action type
- **Irreversible** (delete tenant, revoke domain, deactivate plan): type-to-confirm input
- **Reversible** (suspend tenant, close ticket, disable module): single confirm button with warning text
- **No-risk** (send nudge, download invoice): no confirmation needed

### 5. Breadcrumbs → add to all detail/form pages
Pattern (already used in TenantDetail): `Parent Page > [Entity Name]`
Missing from: AppBuildDetail, OnboardingDetail, CommunityAccessDetail, CommunityAccessForm, PlanFormPage, CommunityTypeFormPage, Health.

---

## Priority Order

### Do First (navigation + broken UX)
1. Remove Hierarchy, Branding, Analytics, Users from sidebar nav
2. Add "New Tenant" button to Tenants.jsx page header
3. Add "+ New Tenant" button and clickable stat cards to Dashboard.jsx
4. Remove fake "Send Message" + "Reset Access" buttons from TenantDetail.jsx
5. Remove Billing tab from TenantDetail, add read-only summary + link

### Do Next (missing pieces)
6. Add Setup Checklist card to TenantDetail for new tenants
7. Add breadcrumbs to AppBuildDetail, OnboardingDetail, CommunityAccessDetail, CommunityAccessForm, PlanFormPage, CommunityTypeFormPage, Health
8. Add "New Ticket" button to Support.jsx header
9. Add post-action success states to Domains (after provisioning) and AppBuildDetail (after smoke test)
10. Move email templates from Branding.jsx → Settings > Email Templates sub-tab

### Do Later (consistency polish)
11. Swap native `<select>` to FilterBar on Support, Billing, CommunityAccess
12. Standardize pagination (Showing X–Y of Z + rows-per-page selector) on Support, Billing
13. Standardize empty states (icon + message + CTA) on Support, CommunityAccess
14. Standardize confirmation dialogs by action type across all pages
15. Add module scope subtitles (Platform defaults / Per-community / Per-tenant)
16. Add "Incident History" section to Health.jsx
17. Add "Resend Invoice" and tenant link to Billing.jsx invoice rows
18. Delete AppLayout.jsx, Sidebar.jsx, Settings.jsx dead files
