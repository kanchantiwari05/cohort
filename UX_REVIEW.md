# Platform Admin — Full UX Review
**Reviewed page-by-page as a real user. Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low**

---

## 🔴 CRITICAL — Broken or Dead Interactions

| # | Page | Issue | Detail |
|---|------|--------|--------|
| C1 | MasterSettingsPage | **Settings tab bar missing Plans, Community Types, Identity** | `TABS` array only has "Modules". The other 3 settings pages are unreachable via tabs — users must guess the exact URL |
| C2 | PlansTab / CommunityTypesTab / Hierarchy | **`window.confirm()` mixed with custom modals** | Three pages use native browser confirm dialog when tenant count = 0, and custom `<Modal>` when count > 0. Looks broken |
| C3 | PlansTab | **"View tenants on this plan →" button is dead** | Button renders but has no `onClick` handler. User clicks, nothing happens. Silent failure |
| C4 | CommunityAccess | **"Add Community" navigates to a route that doesn't exist** | Goes to `/admin/community-access/new` — no page/route exists, user hits 404 |
| C5 | Domains | **"Edit" domain action only shows a toast — no edit modal** | Clicking Edit fires `toast('Editing...')`. User expects UI to open, gets nothing |

---

## 🟠 HIGH — Major UX Problems by Page

### Dashboard
| # | Issue | Detail |
|---|--------|--------|
| H1 | Hardcoded greeting "Good morning, Jatin 👋" | Name is a hardcoded string, not from auth store. Every admin account sees "Jatin" |
| H2 | Stat card numbers animate from 0 on every page visit | Counter animation replays each visit — not just first load. Distracting |
| H3 | Degraded service banner is not visually clickable | Banner appears for degraded services but "View Health →" reads like text, not a link |
| H4 | Commented-out Quick Actions panel is dead code in JSX | Should be removed or shipped — stale commented-out block in production JSX |

### Tenants
| # | Issue | Detail |
|---|--------|--------|
| H5 | "View as CSA" always opens `/csa/dashboard` without the tenant's context | User clicks to impersonate Tenant X's CSA — lands on a blank generic CSA dashboard |
| H6 | Delete confirmation says nothing about data loss consequences | Modal asks to type the name but never says "This deletes all member data, hierarchy, billing history" |
| H7 | Health score badge (0–100) has no explanation | User sees "74" — no tooltip or legend explaining what it measures or what's good/bad |

### TenantNew (6-step wizard)
| # | Issue | Detail |
|---|--------|--------|
| H8 | App Build prerequisites don't link back to the step that fixes them | Shows "Logo — MISSING ✕" in Step 5 with no way to jump back to Step 3 (Branding) |
| H9 | Disabled future steps have no tooltip explaining why | Steps 4–6 are greyed out before unlocked — no "Complete previous steps first" tooltip |
| H10 | Custom domain field accepts any string — no format validation | User can type "not-a-domain" and proceed. No error shown |
| H11 | Success screen shows new tenant ID with no copy button | Tenant ID is displayed as plain text — user must manually select and copy |

### TenantDetail
| # | Issue | Detail |
|---|--------|--------|
| H12 | Setup checklist silently vanishes once tenant becomes `active` | No "Setup Complete" graduation state — checklist just disappears |
| H13 | Hierarchy tab shows "Read-only" with no way to edit from here | "Viewing in read-only mode" — but no button/link to the Hierarchy editor |
| H14 | Activity timestamps and "CSA Last Login" are hardcoded strings | "Today, 9:42 AM" and "15 Feb 2024" are static — user is reading fake data |

### Launch Tracker
| # | Issue | Detail |
|---|--------|--------|
| H15 | Summary pills (Total/Completed/Stalled) are hardcoded — not reactive | Counts never update when filters are applied — always shows full dataset totals |
| H16 | "Stalled" status is never explained to the user | Badge appears but no definition — user doesn't know what triggers "Stalled" vs "In Progress" |
| H17 | WhatsApp nudge modal has no character limit | WhatsApp cuts off long messages silently — no length indicator or warning |
| H18 | Detail page breaks on URL refresh | Data comes from `location.state` — refresh `/admin/onboarding/:id` and the page has no data |

### Billing
| # | Issue | Detail |
|---|--------|--------|
| H19 | Overdue banner "Send Reminder" only targets the first overdue invoice | `onSendReminder(overdue[0])` — multiple overdue invoices exist but only the first is actioned |
| H20 | Generate Invoice modal defaults to hardcoded month "2024-07" | Admin must remember to update it or generates invoices with wrong dates every cycle |
| H21 | Invoice row has 5 action icons with no grouping or overflow menu | Download + Resend + Change Plan + Send Reminder + Mark Paid — cluttered row with no "···" menu |

### Health
| # | Issue | Detail |
|---|--------|--------|
| H22 | Alert rule threshold edit accepts zero, negative values, and text | No input validation — bad thresholds save silently |
| H23 | OTP Delivery chart Y-axis domain `[90, 100]` distorts severity visually | A 95% rate looks "half empty" because the scale starts at 90, not 0 — deceiving |
| H24 | "Last incident: 14 days ago" is a hardcoded string | Static text — doesn't compute from the actual incident dates shown on the same page |

### Support
| # | Issue | Detail |
|---|--------|--------|
| H25 | "My Assigned" tab is hardcoded to `MY_AGENT = 'Jatin Dudhat'` | Every admin sees the same agent's tickets — not tied to the logged-in user |
| H26 | New Ticket modal: Community is a free-text input | Should be a searchable community picker — user can type any random string |
| H27 | Ticket resolution has no confirmation or undo | "Mark Resolved" closes the modal immediately with no undo option |
| H28 | New ticket `category` defaults to `'other'` | Every self-created ticket shows "other" in the category column — should require selection |

### Domains
| # | Issue | Detail |
|---|--------|--------|
| H29 | Provision success says "Domain is Live!" even when status is `pending_dns` | Success screen shows 🎉 and "SSL secured" but domain hasn't propagated — misleading |
| H30 | Revoke modal type-to-confirm has no clipboard helper | User must manually type a long domain like `alumni.iitb.ac.in` with zero typo tolerance |
| H31 | DNS propagation warning is tiny fine print | "(2–10 min)" is in subtitle text — most users expect instant and will open support tickets |

### Hierarchy
| # | Issue | Detail |
|---|--------|--------|
| H32 | Drag-and-drop with pagination breaks row ordering | Drag uses visible index — reorders wrong items when on page 2+ |
| H33 | Org chart node text overflows and overlaps on long names | No truncation in chart nodes — long community names break the visual layout |
| H34 | Tree expanded/collapsed state resets on navigate | User expands nodes, navigates away, returns — all expansions are lost |

### CommunityAccess
| # | Issue | Detail |
|---|--------|--------|
| H35 | Module enablement % hardcoded to 11 total modules | `/ 11 * 100` — if module count ever changes, all percentages are wrong |
| H36 | "Edit" and "Manage" buttons look and feel the same | No visual hierarchy — user doesn't know which does what without clicking both |

### Settings — Plans
| # | Issue | Detail |
|---|--------|--------|
| H37 | Module toggles auto-save with zero feedback | Toggle saves instantly via store — no toast, no "saving…" indicator, no undo |
| H38 | Deactivation uses `window.confirm()` for zero-tenant plans | Should always use the custom modal — inconsistent with every other confirm dialog |

### Settings — Platform Identity
| # | Issue | Detail |
|---|--------|--------|
| H39 | Logo upload has no file size or type validation | A 50MB image uploads fine — no rejection, no compression, breaks the store |
| H40 | Timezone dropdown only has 7 hardcoded options | Users in unlisted timezones (Pacific/Auckland, Africa/Lagos) are completely stuck |
| H41 | Support email and WhatsApp fields have no format validation | Admin can save "abc" as email and "xyz" as phone — no error shown |

---

## 🟡 MEDIUM — Noticeable Friction

### Cross-Page
| # | Issue |
|---|--------|
| M1 | Sign Out in two places — sidebar bottom AND profile dropdown |
| M2 | No "unsaved changes" warning before navigating away or logging out on any form page |
| M3 | Badge/status color coding has no legend anywhere — users must memorize meanings |
| M4 | Empty states after filtering say "No results" without noting active filters are the cause |
| M5 | No date-range filter on any listing (Launch Tracker, Support, Domains, Tenants) |

### Dashboard
| M6 | Tenant Growth chart has no empty state — blank canvas if data is empty |
| M7 | "Mark All Read" activity button has no visual confirmation that anything changed |

### Billing
| M8 | MRR chart tooltip hardcoded to "2024" — wrong in 2025/2026 |
| M9 | "Paid This Month" counts ALL paid invoices, not just the current calendar month |

### Health
| M10 | "Last checked Xs ago" increments forever — services aren't actually re-checking. Misleading |
| M11 | Incident history capped at 5 hardcoded entries — no "Load more" |
| M12 | Alert "Last triggered" shows date only — ambiguous if it fires multiple times a day |

### Support
| M13 | Breached ticket IDs in SLA banner overflow on small screens with no truncation |
| M14 | "Mark All Passed" smoke test button fires with no confirmation — one click clears 12 items |

### Domains
| M15 | Provision modal step names are hidden on mobile — user only sees "1 2 3" |
| M16 | DNS records collapsible doesn't explain why the TXT verification record is needed |

### Hierarchy
| M17 | "Add child" button is hover-only (`opacity-0 group-hover`) — completely undiscoverable |
| M18 | Zoom reset button has no tooltip — user doesn't know clicking it resets the view |
| M19 | LA column header says "Phone" but displays an email address |

### Settings — Module Catalogue
| M20 | No pagination — 100+ modules would require endless scrolling |
| M21 | Description textarea shows a character counter but doesn't enforce `maxLength` |
| M22 | Edit drawer closes immediately on Save — toast fires but is often off-screen |

### Settings — Community Types
| M23 | Examples column (2-line clamp, 140px wide) truncates with no tooltip |
| M24 | Drag-and-drop reorder doesn't reset page to 1 — page 2 can go empty after reorder |

### Settings — Plans
| M25 | Clone plan button is icon-only — no label, no hover tooltip |
| M26 | "Always On" modules have no inline explanation of why they can't be disabled |

### TenantDetail
| M27 | "PA override" acronym in Modules tab — users won't know PA = Platform Admin |
| M28 | Members tab search fires on every keystroke — no debounce |

---

## 🔵 LOW — Polish

| # | Page | Issue |
|---|------|--------|
| L1 | Dashboard | Greeting hardcodes name — `user?.name` from authStore is already imported |
| L2 | Tenants | Domain shown in row sub-text AND the Domain column — redundant |
| L3 | Billing | MRR chart tooltip year is the literal string `"2024"` |
| L4 | AppBuildDetail | Build ID appears in breadcrumb AND in page header — redundant |
| L5 | Launch Tracker | Overdue badge is amber — should be red/danger to match all other overdue states |
| L6 | PlansTab | `plan.slug` column is a developer field — not relevant to admin users |
| L7 | PlatformIdentity | Short name max 6 chars with no explanation of where it's used |
| L8 | CommunityTypesTab | Reorder toast says "reordered" but doesn't explain what visual effect it has |
| L9 | All pages | Skeleton loaders don't match actual content grid/card count and shape |
| L10 | All listings | Pagination renders even with 0 results — disabled prev/next buttons look broken |

---

## Priority Summary

| Severity | Count | Action |
|----------|-------|--------|
| 🔴 Critical | 5 | Fix immediately |
| 🟠 High | 37 | Next sprint |
| 🟡 Medium | 28 | Following sprint |
| 🔵 Low | 10 | Polish pass |

---

## Quick Wins (High impact, ≤10 min each)

| Fix | File | Change |
|-----|------|--------|
| C1 — Add missing tabs | `MasterSettingsPage.jsx` | Add Plans, CommunityTypes, Identity to `TABS` array |
| H1 — Fix greeting | `Dashboard.jsx` | Replace `"Jatin"` with `useAuthStore(s => s.user?.name)` |
| H25 — My Assigned | `Support.jsx` | Replace `MY_AGENT = 'Jatin Dudhat'` with auth store user name |
| H20 — Invoice month | `Billing.jsx` | Default month to `new Date().toISOString().slice(0, 7)` |
| H24 — Last incident | `Health.jsx` | Compute "X days ago" from `INCIDENTS[0].date` instead of hardcoding |
| C3 — View tenants button | `PlansTab.jsx` | Add `onClick={() => navigate('/admin/tenants?plan=' + plan.id)}` |
| H28 — Ticket category | `Support.jsx` | Remove `'other'` default; require selection before submit |
| L2 — Domain redundancy | `Tenants.jsx` | Remove domain from row sub-text (Domain column already shows it) |
| L6 — Plan slug column | `PlansTab.jsx` | Remove the `slug` `<td>` from the table |
| H2 — Stat animation | `Dashboard.jsx` | Skip counter animation after initial mount |
