# Farmer Support — Prototype Handover

> **Prototype repository:** `Douglas-Gockah/Farmer-support-redesign`
> **Branch:** `claude/review-v0-prototype-KPDCc`
> **Date:** March 2026
> **Audience:** Frontend engineers, backend engineers, product / QA

---

## 1. Purpose & Overview

This prototype redesigns the **Farmer Support** internal tool — the system used by field agents, programme managers, and finance teams to manage agricultural support requests from farmer groups in Ghana. It covers the full lifecycle from initial request sync through scoring, approval, manager confirmation, and MoMo disbursement.

Three distinct operational flows have been prototyped:

| Flow | Status |
|---|---|
| **Flow 1 — Requests & Disbursement** | Fully interactive |
| **Flow 2 — Support Fulfilment** | Skeleton / coming soon |
| **Flow 3 — Recoveries** | Skeleton / coming soon |

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties (OKLch) |
| Component library | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Date utilities | date-fns |
| Toasts | Custom component (see `toast-notification.tsx`) |
| Theming | next-themes (light / dark) |

No backend or external API is consumed. All data is local mock state.

---

## 3. Repository Structure

```
app/
  layout.tsx              Root layout (metadata, font, theme)
  page.tsx                Entry point — renders AppShell + KanbanScreen
  globals.css             Tailwind base + CSS variable definitions

components/
  app-shell.tsx           Main layout wrapper (sidebar + header + content area)
  header.tsx              Top bar (hamburger, page title, language, profile avatar)
  sidebar.tsx             56px icon-only left nav with tooltip labels
  kanban-screen.tsx       Flow 1 — full Requests & Disbursement view (tabs + board)
  fulfillment-board.tsx   Flow 2 — Support Fulfilment (placeholder columns)
  recoveries-board.tsx    Flow 3 — Recoveries (placeholder columns)
  dashboard-screen.tsx    Analytics dashboard view (built, not wired to nav yet)

  kanban/
    types.ts              TypeScript interfaces (FarmerRequest, Stage, SupportInterest, …)
    constants.ts          Column definitions, score tiles, Ghana regions/districts
    mock-data.ts          35 sample FarmerRequest objects across all stages
    use-kanban-state.ts   Master state hook (filtering, modal state, workflow handlers)
    kanban-card.tsx       Card rendered inside each column
    column-header.tsx     Column title + item count + sort toggle
    filter-bar.tsx        Search + Community / Agent / Date dropdowns
    scoring-modal.tsx     Score submission UI (document viewer + score slider)
    card-menu.tsx         Right-click / kebab context menu on cards
    support-pill.tsx      Cash / Ploughing badge with score display

  approval-modal.tsx      Review → Approve / Hold / Reject flow  (723 lines)
  disbursement-modal.tsx  Verify → Confirm → Processing → Success  (937 lines)
  manager-confirmation-modal.tsx  Manager verifies MoMo details  (356 lines)
  hold-scoring-modals.tsx Hold and scoring sub-modals  (185 lines)
  slide-over-panel.tsx    Detail slide-over panel  (271 lines)
  fulfillment-slide-over.tsx  Flow 2 slide-over with accordion farmer sections  (717 lines)
  disbursement-records-table.tsx  Paginated records table  (467 lines)
  toast-notification.tsx  Fade-out toast stack (bottom-right)
  theme-provider.tsx      next-themes wrapper

  ui/                     56 shadcn/ui component files (Button, Dialog, Table, …)

hooks/
  use-mobile.ts           Responsive breakpoint hook
  use-toast.ts            Toast queue hook

lib/
  utils.ts                cn() — Tailwind class merger
```

---

## 4. Data Model

Defined in `components/kanban/types.ts`.

### `ActionRecord`

Captures a single auditable action taken on a request. Created when a MoMo number is corrected during the disbursement verify step (and in future, any other stage transition that requires a reason).

```typescript
interface ActionRecord {
  id: string;        // e.g. "1714123456789-momo-update"
  stage: Stage;      // The stage at which the action occurred
  actor: string;     // Full name of the user who took the action
  action: string;    // Short label, e.g. "Updated MoMo number"
  summary?: string;  // Human-readable description
  reason?: string;   // Mandatory justification text entered by the user
  timestamp: string; // Localised date-time string (en-GH)
}
```

`ActionRecord[]` is stored on `FarmerRequest.actionHistory` and rendered in the left-panel timeline of modals via `ActionTimeline` (`components/kanban/action-timeline.tsx`).

### `DisbursementBreakdown`

Stores the charge details captured during the Confirm step so they can be shown on the success screen and records table.

```typescript
interface DisbursementBreakdown {
  baseAmount: number;         // Farmer count × amount per farmer
  withdrawalCharge: number;   // Flat or percentage charge (or 0)
  transportAllowance: number; // Optional fixed allowance (or 0)
  total: number;              // Sum of all three
}
```

### `FarmerRequest`

```typescript
interface FarmerRequest {
  id: string;                   // "FS-2024-001"
  date: string;                 // "12 Jan 2024"
  agent: string;                // Field agent full name
  community: string;            // Community / district
  groupName: string;            // Farmer group name
  score: number | null;         // 0–100, null until scored
  stage: Stage;                 // Current workflow stage (see below)
  farmers: number;              // Group headcount
  onHold: boolean;
  holdComment: string;
  rejectionComment: string;
  supportInterests: SupportInterest[];   // Primary + optional Secondary
  approvedSupportType: SupportType | null; // "Cash" | "Ploughing"
  approvedAmountPerFarmer?: number;      // GHS — Cash support
  approvedLandSizePerFarmer?: number;    // Acres — Ploughing support
  momoNumber?: string;                   // MoMo account number
  momoName?: string;                     // MoMo account name
  transactionId?: string;                // e.g. "TXN-4F8A2B1C"
  disbursedAmount?: number;              // Total GHS disbursed
  disbursedDate?: string;
  disbursementBreakdown?: DisbursementBreakdown; // Charge breakdown from Confirm step
  hasFinancialRecords?: boolean;         // Historic records flag
  optedOutFarmers?: string[];            // Names of opted-out members
  wantsDouble?: boolean;                 // Double-amount opt-in flag
  farmersList?: Array<{ id: string; name: string }>; // Individual farmer roster
  groupScore?: number;                   // Pre-existing group score
  actionHistory?: ActionRecord[];        // Audit trail of actions on this request
  simulateMomoNotRegistered?: boolean;   // Prototype flag: forces a "not registered" result on the initial wallet check
}
```

### `SupportInterest`

```typescript
interface SupportInterest {
  rank: "Primary" | "Secondary";
  type: "Cash" | "Ploughing";
  amountPerFarmer?: number;   // GHS — Cash
  momoNumber?: string;
  momoName?: string;
  landSizePerFarmer?: number; // Acres — Ploughing
}
```

### `Stage` (workflow states)

```typescript
type Stage =
  | "synced"               // Arrived from field sync, awaiting scoring
  | "pending_approval"     // Scored, awaiting programme manager review
  | "rejected"             // Rejected by manager
  | "agent_confirmation"   // Approved — manager verifying MoMo details
  | "finance_disbursement" // Confirmed — awaiting finance disbursement
  | "disbursed"            // Funds sent
  | "opted_out";           // Group received funds but some members opted out
```

---

## 5. Workflow — Flow 1 (Requests & Disbursement)

```
Field sync
   │
   ▼
[Synced Requests]
   │  CTA: "Score"  → opens ScoringModal
   │  handleScored(id, score)
   ▼
[Pending Approval]
   │  CTA: "Review" → opens ApprovalModal
   │  handleApproved(id, type, amount?, landSize?)  → agent_confirmation
   │  handleHeld(id, comment)                       → stays in column (onHold=true)
   │  handleRejected(id, comment)                   → rejected
   ▼
[Manager Confirmation]
   │  CTA: "Confirm" → opens ManagerConfirmationModal
   │  handleManagerConfirmed(id, momoNumber, momoName)
   ▼
[Pending Disbursement]
   │  CTA: "Disburse" → opens DisbursementModal (multi-step)
   │  handleDisbursed(id, txId, totalAmount)
   ▼
[Disbursed]
   │
   └─► (optional) opted_out  — some farmers did not receive funds
```

All transitions are managed inside `useKanbanState` (`components/kanban/use-kanban-state.ts`). Each handler calls `setRequests` to update the stage and merges any newly captured data (amount, MoMo, transaction ID, etc.).

---

## 6. Kanban Board — UI Details

### Columns (Flow 1)

| Stage key | Label | Dot colour | CTA button |
|---|---|---|---|
| `synced` | Synced Requests | Amber `#D97706` | Score |
| `pending_approval` | Pending Approval | Blue `#2563EB` | Review |
| `rejected` | Rejected | Red `#DC2626` | — |
| `agent_confirmation` | Manager Confirmation | Green `#16A34A` | Confirm |
| `finance_disbursement` | Pending Disbursement | Purple `#7C3AED` | Disburse |
| `disbursed` | Disbursed | Grey `#6B7280` | — |

### Card anatomy (`kanban-card.tsx`)

- Group name + request ID
- Agent name, community, date
- Farmer count
- Support interest pill(s) — `support-pill.tsx` shows type + score/amount
- Score badge (colour-coded: red < 50, amber < 75, green ≥ 75)
- Hold indicator banner
- CTA button (stage-dependent)
- Kebab / context menu (card-menu.tsx)

### Scoring system (`constants.ts` — `SCORE_TILES`)

| Label | Score | Meaning |
|---|---|---|
| Poor | 25 | Significant gaps in criteria |
| Fair | 50 | Meets some requirements |
| Good | 75 | Meets most criteria well |
| Excellent | 95 | Exceeds all scoring criteria |

A continuous slider (1–100) is available alongside the four quick-select tiles.

### Filter bar (`filter-bar.tsx`)

- Free-text search (group name or request ID)
- Community dropdown
- Region dropdown
- District dropdown
- Agent dropdown (derived from live request data)
- Date preset selector + calendar picker
- Active filters shown as dismissible pills

### Sorting

The **Pending Approval** column header includes a sort toggle that cycles through `default → score descending → score ascending`. Controlled by `scoreSort` / `cycleScoreSort` in `useKanbanState`.

### View toggle

The filter bar includes a **Pipeline / Records** toggle. Pipeline = Kanban columns. Records = `DisbursementRecordsTable` (paginated table of disbursed + opted-out records).

---

## 7. Modal Inventory

### ApprovalModal (`approval-modal.tsx`)

Triggered when a manager clicks **Review** on a `pending_approval` card.

**Tabs:** Review | Hold | Reject
**Review tab actions:**
- Select support type to approve (Cash or Ploughing)
- Set amount per farmer (GHS) or land size (acres)
- Optional: charge type (None / Flat / Percentage), transport allowance
- Calls `handleApproved()`

**Hold tab:** Free-text comment → `handleHeld()`
**Reject tab:** Free-text comment → `handleRejected()`

### DisbursementModal (`disbursement-modal.tsx`)

Triggered when finance clicks **Disburse** on a `finance_disbursement` card.

**Steps:**
1. **Verify** — wallet check and number correction (see detail below)
2. **Confirm** — cost breakdown with charge selection
3. **Processing** — animated 30-second countdown (with "Simulate success" shortcut)
4. **Success** — transaction ID, disbursement breakdown, toast fired

Calls `handleDisbursed(id, txId, totalAmount, breakdown, momoUpdateRecord)`.

#### Step 1 — Verify Account Details (wallet check flow)

The verify step is a two-panel layout (context sidebar left, interactive area right) with a multi-state wallet check flow:

**Initial state**
- Displays the submitted MoMo number and account name.
- **"Check wallet name"** button triggers a simulated 1.5 s API call.
- If `simulateMomoNotRegistered` is set on the card and no correction has been made yet, the check returns a **not-registered** failure; otherwise it returns **verified**.

**Not-registered path**
- Red error card appears: "*{number} is not registered for mobile payments*".
- **"Update MoMo number"** opens the unified edit panel (see below).
- Cancelling the edit panel restores the not-registered error state.
- The "Check wallet name" button remains disabled until a corrected number is saved and verified.

**Verified path**
- Green result card shows: status label, resolved account name, verified MoMo number.
- **"Update number"** link opens the unified edit panel (see below).
- **"Proceed to disbursement"** footer button becomes active.

**Unified edit panel** (opened from both paths via `handleOpenEdit`)

The panel replaces the contextual error/verified card and gives the user a standalone check-and-save workflow:

| UI element | Behaviour |
|---|---|
| Section title "Check a different number" | Always visible while panel is open |
| Cancel link | Closes panel; restores prior state (not-registered error if applicable) |
| Number input + **"Check number"** button | Side-by-side. Button is disabled while a check is in progress or the input matches the currently saved number. Typing any change resets the check state to `idle`. |
| Spinner state | Button label changes to "Checking…" with spinner during the 1.5 s simulated call |
| **Not-registered result** | Red inline chip: "Number not registered — try a different number". User can edit the input and check again — unlimited retries. |
| **Verified result** | Green card showing the account name and verified number, followed by a mandatory **Reason for update** textarea and **"Save this number and proceed"** button. |
| Save guard | "Save this number and proceed" is disabled until the reason field is non-empty. |

**Saving a corrected number**
- Creates an `ActionRecord` (stored as `momoUpdateRecord`) with `action: "Updated MoMo number"`, the reason text, actor, and timestamp.
- Updates `currentMomo` to the new number.
- Closes the edit panel and returns to the verified state showing the new number.
- Displays a **"Number update recorded" activity card** below the verified result, showing the update summary (old → new) and the reason entered. This card persists as a reminder until the user proceeds to disbursement.
- The `momoUpdateRecord` is passed through to `handleDisbursed` so it can be stored on the request for audit purposes.

**Name-mismatch path** (separate, less common)
- Triggered when `hasMismatch` is true (currently hardcoded `false` in the prototype — reserved for API integration).
- Yellow warning card with submitted vs. resolved names, a new MoMo number field, and a reason field.
- On save: marks verified and continues.

### ManagerConfirmationModal (`manager-confirmation-modal.tsx`)

Triggered when a manager clicks **Confirm** on an `agent_confirmation` card.

- Shows group details and requested support
- Manager enters / edits MoMo number and account name
- Calls `handleManagerConfirmed(id, momoNumber, momoName)`

### ScoringModal (`scoring-modal.tsx`)

Triggered when an agent clicks **Score** on a `synced` card.

- Document preview area (file upload placeholder)
- Farmers list (collapsible)
- Score tiles (Poor / Fair / Good / Excellent) + slider
- Calls `handleScored(id, score)`

### SlideOverPanel (`slide-over-panel.tsx`)

Opens when a card body is clicked (not the CTA button).

- Full request summary
- Support interests breakdown
- Cost information
- Farmer list (if available)

---

## 8. Records Table (`disbursement-records-table.tsx`)

Shown when the view toggle is set to **Records**.

| Column | Notes |
|---|---|
| Reference | Sticky left column — request ID |
| Date | Disbursement date |
| Group Name | |
| Agent | |
| Community | |
| Farmers | Right-aligned numeric |
| Support Type | Cash / Ploughing badge |
| Amount per Farmer | GHS, right-aligned |
| Total Disbursed | GHS, right-aligned |
| Transaction ID | |
| Opted-Out Farmers | Count / list |
| Actions | Opens record detail modal |

- Default page size: 20 rows (configurable: 10 / 20 / 50)
- Pagination controls at the bottom-right of the card

---

## 9. State Management

All workflow state lives in a single custom hook: `useKanbanState` (`components/kanban/use-kanban-state.ts`).

The hook is instantiated inside `KanbanScreen` and props-drilled to child components. There is no global state store (no Redux, Zustand, or Context).

```
KanbanScreen
  └─ useKanbanState(activeFilters)
       ├─ requests[]            ← source of truth (replace with API)
       ├─ filtered[]            ← memoised filtered view
       ├─ agents[]              ← derived unique agent list
       ├─ selectedCard          ← slide-over panel
       ├─ reviewCard            ← approval modal
       ├─ scoreCard             ← scoring modal
       ├─ disburseCard          ← disbursement modal
       ├─ managerCard           ← manager confirmation modal
       ├─ toasts[]              ← notification queue
       ├─ scoreSort             ← sort mode for pending_approval column
       └─ handlers: ctaAction, handleApproved, handleManagerConfirmed,
                    handleHeld, handleRejected, handleScored, handleDisbursed
```

---

## 10. Responsive Behaviour

| Viewport | Behaviour |
|---|---|
| Desktop (≥ lg) | Horizontal-scrolling kanban; full sidebar labels visible |
| Tablet (md) | Sidebar icon-only; board still horizontal |
| Mobile (< md) | Hamburger opens sidebar overlay; board replaced by single-column tabs |

Mobile column tabs are rendered via a horizontal scroll tab bar at the top of the board. One column is visible at a time; users swipe/tap to navigate.

---

## 11. Flows 2 & 3 — Current State

### Flow 2 — Support Fulfilment

The board columns and card scaffolding are in place. Additionally, a fully interactive **slide-over panel** (`fulfillment-slide-over.tsx`) has been built for cards in this flow.

**FulfillmentSlideOver** opens when a fulfilment card is clicked. It has:
- A context header (group name, community, agent, support type and amount)
- A **FarmersPanel** section with three collapsible accordion sections:

| Section | Dot colour | Default state | Content |
|---|---|---|---|
| Received support / All received | Green | Open | Farmers who have received their support |
| Awaiting confirmation | Grey | Open | Farmers pending receipt confirmation |
| Opted out | Yellow/Amber | Open | Farmers who opted out, with opt-out reason |

Each accordion is implemented by a shared `AccordionSection` component (defined inside the file) that renders a toggle button with a colour-coded dot, label, count badge, and chevron. Sections remember their open/closed state locally.

**Flow 2 board columns:** Pending Fulfilment → Partially Fulfilled → Fully Fulfilled → Cash Opt-Outs

Full modal actions (confirm receipt, record opt-out, etc.) are not yet wired — the slide-over currently renders the accordion UI and farmer rows but buttons within farmer rows are presentational only.

### Flow 3 — Recoveries

Column structure and headers exist; all cards display "Coming soon" placeholders. No modals or state handlers have been built.

**Flow 3 columns:** Pending Review → Approved → Rejected → Pending Recovery → Partially Recovered → Fully Recovered

Both flows will require their own data models, API integration, and modal components — the column scaffolding and tab routing are already in place.

---

## 12. Backend Integration Guide

### Replacing mock data

`MOCK_REQUESTS` in `components/kanban/mock-data.ts` is the only place static data is defined. To connect a real backend:

1. Remove the `useState(MOCK_REQUESTS)` initialiser in `use-kanban-state.ts`.
2. Replace with a data-fetching call (e.g. `useSWR`, `useQuery`, or a server component).
3. Convert each workflow handler (`handleApproved`, etc.) from a local `setRequests` call to an API mutation followed by cache invalidation / optimistic update.

### Suggested API endpoints (Flow 1)

| Action | Method | Endpoint |
|---|---|---|
| List all requests | GET | `/api/farmer-support/requests` |
| Get single request | GET | `/api/farmer-support/requests/:id` |
| Score a request | PATCH | `/api/farmer-support/requests/:id/score` |
| Approve a request | PATCH | `/api/farmer-support/requests/:id/approve` |
| Hold a request | PATCH | `/api/farmer-support/requests/:id/hold` |
| Reject a request | PATCH | `/api/farmer-support/requests/:id/reject` |
| Manager confirm | PATCH | `/api/farmer-support/requests/:id/confirm` |
| Disburse funds | POST | `/api/farmer-support/requests/:id/disburse` |
| List disbursed records | GET | `/api/farmer-support/records?page=&size=` |

### Request body shapes (derived from handler signatures)

```typescript
// PATCH /approve
{ approvedSupportType: "Cash" | "Ploughing", approvedAmountPerFarmer?: number, approvedLandSizePerFarmer?: number }

// PATCH /hold
{ holdComment: string }

// PATCH /reject
{ rejectionComment: string }

// PATCH /score
{ score: number }  // 1–100

// PATCH /confirm
{ momoNumber: string, momoName: string }

// POST /disburse
{ transactionId: string, disbursedAmount: number }
```

### Auth & roles

The prototype does not implement authentication. The production build will need role-based access at minimum for:

- **Field Agent** — read-only view of their own requests
- **Programme Manager** — scoring, approval, hold, rejection
- **Manager** — MoMo confirmation step
- **Finance** — disbursement step

---

## 13. Known Gaps / Not Yet Built

| Area | Note |
|---|---|
| Authentication / RBAC | No login, sessions, or role checks |
| Flow 2 — Support Fulfilment | Board columns exist; slide-over with accordion farmer sections built; card-level action buttons not yet wired |
| Flow 3 — Recoveries | Columns exist; no cards, modals, or state |
| Dashboard screen | Component built (`dashboard-screen.tsx`) but not wired to sidebar navigation |
| File / document upload | Placeholder UI in scoring modal; no real upload |
| Voice note playback | UI placeholder in scoring modal; no audio functionality |
| Real MoMo integration | Disbursement fires a mock transaction ID; no payment gateway |
| Push notifications | No real-time updates; full page refresh needed to see changes from others |
| Error states | Happy-path only; no API error handling or retry logic |
| Audit log / history | No history trail of stage transitions |
| Offline support | No PWA / service worker |
| i18n | Language selector in header is a UI stub only |
| Unit / integration tests | No test suite present |

---

## 14. Design Tokens & Colour Palette

Defined in `app/globals.css` as CSS custom properties.

| Token | Light value | Usage |
|---|---|---|
| `--primary` | `#16A34A` (TreeSyt green) | Buttons, active states, badges |
| `--background` | `#FFFFFF` | Page background |
| `--card` | `#FFFFFF` | Card backgrounds |
| `--muted` | `#F9FAFB` | Secondary backgrounds |
| `--border` | `#E5E7EB` | All borders |
| `--foreground` | `oklch(0.145 0 0)` | Primary text |
| `--muted-foreground` | `oklch(0.556 0 0)` | Secondary text |
| `--destructive` | Red | Reject / error actions |

Border radius: `--radius: 0.625rem` (10px) applied consistently.

Font: **Geist** (Google Fonts), loaded in root layout.

---

## 15. Running the Prototype Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Build for production
npm run build
npm start
```

Node 18+ required. No environment variables needed (all data is local mock state).

---

## 16. File Quick-Reference

| What you need | File |
|---|---|
| Add a new workflow stage | `components/kanban/types.ts` + `constants.ts` |
| Add a new kanban column | `components/kanban/constants.ts` (COLUMNS array) |
| Change mock data | `components/kanban/mock-data.ts` |
| Connect to a real API | `components/kanban/use-kanban-state.ts` |
| Change column card layout | `components/kanban/kanban-card.tsx` |
| Change approval logic | `components/approval-modal.tsx` |
| Change disbursement flow | `components/disbursement-modal.tsx` |
| Change wallet check / edit panel logic | `components/disbursement-modal.tsx` — `VerifyStep` function |
| Change fulfilment slide-over or accordion sections | `components/fulfillment-slide-over.tsx` |
| Change MoMo confirmation | `components/manager-confirmation-modal.tsx` |
| Change scoring UI | `components/kanban/scoring-modal.tsx` |
| Change filter options | `components/kanban/filter-bar.tsx` + `constants.ts` |
| Add a new top-level flow tab | `components/kanban-screen.tsx` |
| Change sidebar navigation | `components/sidebar.tsx` |
| Change colour tokens | `app/globals.css` |

---

## 17. Recent Updates — April 2026

This section tracks significant feature additions made after the initial prototype handover.

### 17.1 Mandatory reason field for MoMo number updates

**File:** `components/disbursement-modal.tsx`

Any time a user corrects a MoMo number during the Verify step — whether after a name-mismatch warning or a not-registered failure — they are now required to enter a free-text **reason** before saving. The reason is captured in `ActionRecord.reason` and stored on the request as `momoUpdateRecord`. This ensures all number corrections have an auditable justification.

### 17.2 Fulfilment slide-over — accordion farmer sections

**File:** `components/fulfillment-slide-over.tsx`

The Support Fulfilment slide-over (`FulfillmentSlideOver`) now organises farmers into three collapsible accordion sections within the `FarmersPanel` component:

- **Received support** (green) — farmers who have received their support. Relabelled "All received" when the full group has received support.
- **Awaiting confirmation** (grey) — farmers whose receipt is still pending.
- **Opted out** (amber) — farmers who opted out, including their opt-out reason.

All three sections default to open. Each section header shows a colour-coded dot, a label, and a count badge. The shared `AccordionSection` component handles the open/close toggle and chevron animation.

### 17.3 Wallet check flow — check before save, unlimited retries

**File:** `components/disbursement-modal.tsx` — `VerifyStep`

The wallet check flow in the Verify step was significantly redesigned. Previously, entering a new number and saving it immediately kicked off a re-check. The new flow separates the check from the save:

1. After getting any result (verified or not-registered), the user opens the **unified edit panel** by clicking "Update number" or "Update MoMo number".
2. Inside the panel the user types a number and clicks **"Check number"** — these are independent actions. Editing the input resets the check state so the user must explicitly re-check each candidate number.
3. The check result is shown inline: a red error chip for not-registered numbers, or an expanded green card showing the verified account name and number.
4. A not-registered result does not close the panel — the user can immediately change the number and check again. There is no limit on retries.
5. Only after receiving a **verified** result does the reason textarea and **"Save this number and proceed"** button appear.
6. The save button is disabled until the reason field is non-empty.

**State machine inside `VerifyStep`:**

```
editCheckState: "idle" → "checking" → "verified"
                                    ↘ "not_registered" → (user retypes) → "idle"
```

Key state variables: `editInput`, `editCheckState`, `editReason`, `editingMomo`.
Key handlers: `handleOpenEdit`, `handleEditCheck`, `handleSaveEditedNumber`, `handleCancelEdit`.

### 17.4 Number update activity card

**File:** `components/disbursement-modal.tsx` — `VerifyStep`

After a user saves a corrected MoMo number, a **"Number update recorded"** activity card appears below the verified result. It displays:

- The update summary text (e.g. "Douglas Gockah updated the MoMo number from 055 000 0000 to 024 412 3456 before disbursement")
- The reason entered, shown in a quoted inset box
- The timestamp of the update

The card stays visible until the user opens the edit panel again, acting as a persistent confirmation of the action taken before they proceed to disbursement.
