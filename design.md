web application/stitch/projects/11316030173599916908/screens/c2598a5a75324d7aa738c53056a39810
# DESIGN.md — Orbit Modern Workspace Design System

> **Implementation Guide for Next.js & Supabase**  
> *Targeted Frontend Redesign: Preserves 100% of existing backend logic, schema, Supabase auth/CRUD, and data contracts while replacing the presentation layer with a calm, tactile, AI-native productivity interface.*

---

## 1. Design Philosophy

### 1.1 Overall Visual Style
Orbit moves away from dense, dark, enterprise tables toward an **organic, tactile, floating-canvas aesthetic** inspired by modern workspaces like Linear, Notion Calendar, and Arc Browser.
* **Warm Canvas Foundation:** Soft alabaster/cream backgrounds (`#FAF7F2` / `#FFF8F0`) that eliminate eye strain and sterile corporate stiffness.
* **Floating Elevated Containers:** Pure white elevated cards (`#FFFFFF`) featuring generous border radii (`16px`–`28px`) and diffused multi-layer ambient drop shadows.
* **Tactile Micro-Affordances:** Subtle borders (`1px solid rgba(223, 217, 209, 0.6)`), pill-shaped interactive chips, and gentle hover elevations that feel physical and responsive.
* **Breathing Room & Asymmetry:** Open grid rhythm, deliberate white space, and balanced focal points that reduce cognitive friction when managing schedules, tasks, finances, and notes simultaneously.

### 1.2 UX Principles
1. **Fidelity to Underlying Logic:** Pure presentation-layer refactoring. Form schemas, mutation handlers, Supabase hooks, and realtime subscriptions stay completely untouched.
2. **Context-Aware Glanceability:** Key metrics (85% velocity, liquid balance, next class in 45m) appear in large, high-contrast display typography at the top of every screen.
3. **Modal & In-Place Workflows:** Creation triggers (quick capture bar, modal sheets, quick-log pills) keep users anchored in their primary flow without disruptive full-page redirects.
4. **Calm Productivity:** Color is applied semantically and sparingly — neutrals dominate 90% of the screen, while accents (violet, emerald, amber, rose) denote status, urgency, and category identity.

### 1.3 Product Personality
* **Archetype:** Thoughtful Executive Assistant & Knowledge Studio.
* **Tone:** Calm, composed, modern, intelligent, and tactile.

---

## 2. Design System Tokens

### 2.1 Color Palette

#### Backgrounds & Canvas Surfaces
* `surface-canvas` (Global Page Background): `#FFF8F0` / `#FAF7F2`
* `surface-card` (Default Elevated Container): `#FFFFFF`
* `surface-container-low` (Sub-container / Row Hover): `#F9F3EB`
* `surface-container-high` (Input backgrounds / Inactive tags): `#F3ECE2`
* `surface-container-highest` (Pill toggles / Hover chips): `#EAE2D7`

#### Borders & Dividers
* `border-subtle`: `rgba(223, 217, 209, 0.5)` / `#E7E0D6`
* `border-focus`: `#19191B` (or active accent `#7C3AED`)
* `border-glass`: `rgba(255, 255, 255, 0.7)`

#### Text & Typography Colors
* `text-primary` (Headings, primary values): `#19191B` (Deep Charcoal Black)
* `text-secondary` (Subtitles, table headers, timestamps): `#6B6762` (Warm Slate Gray)
* `text-tertiary` (Placeholders, inactive tabs, captions): `#9E9890`
* `text-on-dark` (Labels on dark buttons/chips): `#FFFFFF`

#### Brand & Functional Accent Colors
* `accent-primary` (Orbit Violet / AI copilot): `#6366F1` / `#7C3AED`
* `accent-primary-light` (Violet chip background): `#EEF2FF` / `#F5F3FF`
* `accent-warning` (Warm Amber / Highlights): `#F59E0B` / `#FEF3C7`
* `accent-amber-card` (Dashboard Activity tile): `#FDE68A` (Border: `#FCD34D`, Text: `#78350F`)

#### Semantic & Status Colors
* `status-income` (Financial Inflow / Completed): `#10B981` (Emerald)
* `status-income-bg`: `#ECFDF5`
* `status-expense` (Financial Outflow / Critical / High Priority): `#EF4444` (Rose Red)
* `status-expense-bg`: `#FEF2F2`
* `status-in-progress` (Active tasks / Strategy): `#3B82F6` (Electric Blue)
* `status-in-progress-bg`: `#EFF6FF`
* `status-low` (Low priority / Notes): `#8B5CF6` (Lavender)
* `status-low-bg`: `#F5F3FF`

---

## 3. Typography

* **Primary Font Family:** `Plus Jakarta Sans`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
* **Monospace Font Family (Monetary & IDs):** `JetBrains Mono`, `SFMono-Regular`, Menlo, monospace

| Token | Size | Line Height | Weight | Letter Spacing | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-2xl` | `48px` (3rem) | `1.1` | 800 (Extrabold) | `-0.03em` | Velocity metric (85%), Big liquid balances |
| `display-xl` | `36px` (2.25rem)| `1.15` | 700 (Bold) | `-0.025em`| Metric values, Total income/outflow |
| `heading-1` | `28px` (1.75rem)| `1.2` | 700 (Bold) | `-0.02em` | Page Titles (e.g., "Personal Codex", "Cashflow") |
| `heading-2` | `20px` (1.25rem)| `1.3` | 700 (Bold) | `-0.015em`| Section headers, Widget titles |
| `heading-3` | `16px` (1.0rem) | `1.35`| 600 (Semibold)| `-0.01em` | Task titles, Note card headers |
| `body-base` | `14px` (0.875rem)|`1.5` | 400 (Regular) | `0em` | Descriptions, transaction notes, body copy |
| `body-medium`| `14px` (0.875rem)|`1.5` | 500 (Medium)  | `0em` | Form inputs, navigation links, table cells |
| `label-sm` | `12px` (0.75rem)| `1.4` | 600 (Semibold)| `+0.01em` | Badges, tags, metadata pills, priority pills |
| `caption-xs`| `11px` (0.6875rem)|`1.3`| 500 (Medium)  | `+0.02em` | Helper timestamps, keyboard shortcuts |

---

## 4. Layout System

### 4.1 Page Structure
Orbit uses a **Top Navigation Bar Architecture** (No persistent side navigation drawer). This maximizes horizontal workspace width for multi-column dashboards, 5-day timetables, and 3-column Kanban boards.

```
+---------------------------------------------------------------------------------------+
|  TOP HEADER BAR (Fixed/Sticky: h-18 / 72px, px-8, border-b border-subtle)             |
|  [Logo & Workspace Switcher]      [Pill Nav: Dashboard/Cashflow/...]     [User & Meta] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  PAGE CONTENT CONTAINER (max-w-[1520px], mx-auto, px-8, py-6)                         |
|                                                                                       |
|  +---------------------------------------------------------------------------------+  |
|  | Page Header: Title + Subtitle / Filters / Primary CTA Buttons                   |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
|  +-----------------------------------+  +------------------------------------------+  |
|  | Main Workspace Area (2/3 width)   |  | Secondary Copilot / Action Hub (1/3)     |  |
|  +-----------------------------------+  +------------------------------------------+  |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|  GLOBAL FOOTER STATUS BAR (Fixed bottom or document end: h-12, text-caption-xs)       |
+---------------------------------------------------------------------------------------+
```

### 4.2 Spacing System
* `space-1`: `4px`
* `space-2`: `8px`
* `space-3`: `12px`
* `space-4`: `16px`
* `space-5`: `20px`
* `space-6`: `24px`
* `space-8`: `32px`
* `space-10`: `40px`

### 4.3 Grid System
* **Desktop (>1280px):** 12-column responsive CSS grid with `gap-6` (24px).
  * Dashboard layout: Left column `col-span-8` (widgets & tasks), Right column `col-span-4` (quick requests & voice).
  * Cashflow layout: Top metrics `grid-cols-4`, Mid row `col-span-8` (chart) + `col-span-4` (subscriptions), Bottom transactions `col-span-12`.
  * Assignments layout: 3-column equal grid `grid-cols-3` for Kanban columns.
  * Schedule layout: 5-column grid `grid-cols-5` (Mon–Fri).
* **Tablet (768px – 1279px):** Adapts to 2-column or stacked single-column flow with horizontal scroll for timetables/Kanban.
* **Mobile (<768px):** Stacks all cards into a single column `col-span-12` with sticky bottom navigation.

### 4.4 Elevation & Shadows
* `shadow-card`: `0px 4px 20px -2px rgba(25, 25, 27, 0.04), 0px 2px 6px -1px rgba(25, 25, 27, 0.02)`
* `shadow-hover`: `0px 12px 32px -4px rgba(25, 25, 27, 0.08), 0px 4px 12px -2px rgba(25, 25, 27, 0.04)`
* `shadow-modal`: `0px 24px 64px -12px rgba(25, 25, 27, 0.16)`
* `shadow-floating-bar`: `0px 8px 30px rgba(0, 0, 0, 0.08)`

---

## 5. Component Specifications

### 5.1 Top Navigation Header
* **Purpose:** Persistent global frame containing workspace identity, cross-route navigation, search, and profile actions.
* **Height:** `72px` (`h-[72px]`).
* **Padding:** `0 32px` (`px-8`).
* **Background:** Semi-transparent cream with backdrop blur (`rgba(255, 248, 240, 0.85)` + `backdrop-filter: blur(12px)`).
* **Border:** Bottom border `1px solid rgba(223, 217, 209, 0.5)`.
* **Sub-elements:**
  * **Brand Pill:** SVG logo mark + Workspace badge selector (`Personal Core` with dropdown chevron).
  * **Nav Segment Control:** Centered container with `bg-[#F3ECE2] p-1 rounded-full`. Each route link is a rounded pill (`rounded-full py-1.5 px-4 font-medium text-sm`).
    * *Active Route:* `bg-[#19191B] text-white shadow-sm`.
    * *Inactive Route:* `text-[#6B6762] hover:text-[#19191B]`.
  * **Actions Group:** Segment switcher (`Private / Team`), icon button search (`⌘K`), notification bell with unread dot, user avatar.

### 5.2 Stat / Metric Card
* **Purpose:** Displays high-priority numerical KPIs with comparison indicators (Liquidity, Total Workload, Velocity).
* **Padding:** `24px` (`p-6`).
* **Border Radius:** `24px` (`rounded-3xl`).
* **Background:** `#FFFFFF` (or `#FDE68A` for the project activity variant).
* **Border:** `1px solid rgba(223, 217, 209, 0.6)`.
* **Internal Structure:**
  1. Top Row: Icon pill (`w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center`) + Label + Trend Pill (`+12.4%`).
  2. Middle Row: Value in `display-xl` (`36px` bold).
  3. Bottom Row: Micro context line (`Reconciled across 2 accounts` or subtitle).

### 5.3 Task / Kanban Card
* **Purpose:** Reusable card for assignments, homework, and sprint deliverables.
* **Padding:** `20px` (`p-5`).
* **Border Radius:** `20px` (`rounded-2xl`).
* **Background:** `#FFFFFF`.
* **Border:** `1px solid rgba(223, 217, 209, 0.5)`.
* **Internal Structure:**
  1. Header: Course/Category Tag (`bg-[#F9F3EB] text-[#19191B]`) on left, Priority badge (`High` / `Medium` / `Low`) on right.
  2. Body: Task Title (`font-semibold text-base line-clamp-2 mt-2 mb-1`) + Optional brief description.
  3. Progress / Subtask bar: Linear progress bar (`h-1.5 rounded-full bg-[#F3ECE2] fill bg-[#6366F1]`) with percentage.
  4. Footer: Due date pill with clock icon + Assignee avatar.

### 5.4 Transaction Card (Financial Feed)
* **Purpose:** Replaces dense tabular rows with rich, tactile ledger records.
* **Padding:** `16px 20px` (`px-5 py-4`).
* **Border Radius:** `16px` (`rounded-2xl`).
* **Background:** `#FFFFFF` (default), `#F9F3EB` (on hover).
* **Border:** `1px solid rgba(223, 217, 209, 0.4)`.
* **Internal Structure:**
  * Left: Category Icon container (`w-11 h-11 rounded-full bg-[#F3ECE2]`).
  * Center-Left: Merchant/Title (`font-semibold text-sm`) + Category Pill + Date metadata (`10/9/2026 • Ref: TX-90218`).
  * Center-Right: Receipt Attachment badge (`Receipt.pdf` link pill with attachment icon).
  * Right: Signed Amount (`-10,000.00 IDR` in red, or `+1,000,000.00 IDR` in emerald) + Settlement status caption.

### 5.5 Schedule / Timetable Card
* **Purpose:** Represents individual class blocks, lab sessions, and meetings in the weekly calendar.
* **Padding:** `16px` (`p-4`).
* **Border Radius:** `18px` (`rounded-2xl`).
* **Background:** Dynamic pastel tints matching course/meeting type:
  * UX/Product: `#F5F3FF` (violet tint) with `#DDD6FE` accent border.
  * CS Core: `#EFF6FF` (blue tint).
  * Strategy / Office Hours: `#FFFBEB` (amber tint).
* **Internal Structure:** Type badge, Course Title, Time interval (`09:00 - 11:00 AM`), Location room, Instructor avatar/name.

### 5.6 Interactive Button System
* **Primary Button:**
  * Background: `#19191B` (Black)
  * Text: `#FFFFFF`
  * Padding: `10px 20px` (`px-5 py-2.5`)
  * Border Radius: `9999px` (`rounded-full`)
  * Hover: `bg-[#2D2D30]`, slight scale `scale-[1.01]`
* **Secondary / Outline Button:**
  * Background: `#FFFFFF`
  * Text: `#19191B`
  * Border: `1px solid rgba(223, 217, 209, 0.8)`
  * Border Radius: `9999px`
  * Hover: `bg-[#F9F3EB]`
* **AI Copilot Button:**
  * Background: Linear gradient `linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)`
  * Text: `#6366F1`
  * Border: `1px solid #C7D2FE`
  * Border Radius: `9999px`
* **Floating Quick Capture Bar:**
  * Fixed bottom-centered pill: `h-14 px-6 rounded-full bg-white shadow-floating-bar border border-subtle`
  * Contains inline input + priority selector + `Add` button.

### 5.7 Badge & Tag Tokens
* `High Priority`: Text `#EF4444`, Background `#FEE2E2`, Border: `transparent`, Radius: `9999px`, Padding: `2px 10px`, Font: `11px 600`.
* `Medium Priority`: Text `#D97706`, Background `#FEF3C7`, Radius: `9999px`, Padding: `2px 10px`, Font: `11px 600`.
* `Low Priority`: Text `#6366F1`, Background `#EEF2FF`, Radius: `9999px`, Padding: `2px 10px`, Font: `11px 600`.
* `Course/Category`: Text `#4B5563`, Background `#F3ECE2`, Radius: `9999px`, Padding: `2px 10px`, Font: `11px 500`.

---

## 6. Interaction & Motion Behavior

* **Transitions:** Universal easing `transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`.
* **Card Hover States:** Cards elevate on hover by `-2px` on the Y-axis and shift shadow from `shadow-card` to `shadow-hover`.
* **Dropdowns & Popovers:** Dropdown menus mount with `opacity: 0; transform: translateY(-4px)` to `opacity: 1; transform: translateY(0)` within `150ms`.
* **Modal Dialogs (Add Transaction / Create Task):**
  * Backdrop: `rgba(25, 25, 27, 0.4)` with `backdrop-filter: blur(8px)`.
  * Dialog: Centered, `border-radius: 28px`, `background: #FFFFFF`, padding `32px`, scale-in from `0.98` to `1.0`.
* **Keyboard Navigation Indicators:** Visible keyboard hints (`⌘K`, `⌘J`) rendered as micro badges (`px-1.5 py-0.5 rounded bg-black/5 text-[10px] font-mono text-neutral-600`).

---

## 7. Page Specifications

### 7.1 Dashboard (`/`)
* **Hero Section:**
  * Left: User greeting avatar + `Hi, Marco! ✨` with active focus count indicator.
  * Right: Team collaborator cluster (`+9` avatar ring) + `+ Quick Log` action button.
* **Main Grid Content:**
  1. *Productivity Velocity Card (col-span-3):* Big `85%` metric + SVG smoothed velocity curve + project dropdown selector.
  2. *Weekly Strategy & Meeting Card (col-span-5):* Scheduled meeting banner with attendee list and pill action `Join a meeting`.
  3. *Quick Requests Panel (col-span-4):* Checklist of actionable items (summarize notes, generate PDF report, fix Gantt chart).
  4. *Project Activity Tile (col-span-3):* Amber styled widget with breakdown (26h Sync calls, 11h Workshops, 6h Reviews).
  5. *Design Review Task Card (col-span-5):* Elevated card with deadline pill, performer avatars, and `Ask AI to start` trigger.
  6. *Lisso AI Voice Interaction Widget (col-span-4):* Dynamic audio waveform visualization with mic toggle button.
  7. *Net Liquid Core Feed (col-span-3):* Inflow vs. Expense live breakdown.

### 7.2 Cashflow Command Center (`/cashflow`)
* **Top Metric Bar:** 4 equal cards:
  1. Net Liquidity (`840,000.00 IDR`) with percentage delta.
  2. Total Income (`1,000,000.00 IDR`) with incoming transfer badge.
  3. Total Spent (`160,000.00 IDR`) with budget health indicator.
  4. Active Subscriptions (`0 IDR`) with cycle indicator.
* **Middle Analytics Row:**
  * *Daily Spending Flow Chart (2/3 width):* Period selector (`Daily | Weekly | Monthly`), key markers (Average/day, peak day), bar chart with purple accent highlight for peak outflow.
  * *Subscriptions Hub (1/3 width):* List of recurring SaaS tools (e.g. GitHub Copilot `150,000 IDR/mo`) with toggle state + Predictive runway indicator pill (`5.2 months burn rate`).
* **Bottom Section — Ledger Feed:**
  * Header: Filter tabs (`All Records`, `Income`, `Expenses`) + Currency picker (`IDR (Rp)`).
  * Record list: Stack of modern Transaction Cards featuring verified receipt attachments and inline categorization.

### 7.3 Assignments & Kanban (`/assignments`)
* **KPI Header Bar:** Completion Rate ring gauge (`82%`), Total Active Workload (`9 units`), Next Due Critical countdown (`Tomorrow, 11:59 PM`), and AI recommendation banner.
* **Filter Ribbon:** View toggles (`Board`, `List`, `Timeline`), Priority filter dropdown, Course filter dropdown, `+ New Assignment` button.
* **3-Column Board:**
  * Column 1: `To do` (with counter badge `3` and quick-add icon).
  * Column 2: `In progress` (with counter badge `2`).
  * Column 3: `Done` (with counter badge `4`).
* **Floating Bottom Quick Capture:** Sticky bar at viewport bottom for instant task creation via typing or pasting syllabus links.

### 7.4 Schedule Workspace (`/schedule`)
* **Header Controls:** Semester selector, weekly date range navigator (`Oct 9 – Oct 15, 2026`), view switchers (`Week | Day | Month`), and `+ Add Class / Event` CTA.
* **5-Day Weekly Timetable Grid:**
  * Columns for Monday through Friday.
  * Active day highlight (Tuesday marked with dark `Today` badge and purple indicator).
  * Colored session cards specifying time, room number, and instructor.
* **Bottom Split Section:**
  * Left (2/3): *Today's Live Agenda & Directions* — cards displaying next upcoming session, walking travel time, syllabus link, and virtual bridge button.
  * Right (1/3): *Weekly Workload Breakdown* (Classes 24h, Studios 8h, Reviews 5h) + Orbit Copilot room booking recommendation card.

### 7.5 Notes & Knowledge Center (`/notes`)
* **Header & Search Bar:**
  * Instant search bar with `⌘K` keyboard shortcut.
  * Filter pills: `All Notes (18)`, `Projects (6)`, `Lectures (4)`, `Finance (3)`, `Meeting Syncs (5)`.
  * Actions: `+ New Note` and `AI Summarize`.
* **Pinned Notes Section:** 2-column featured cards with embedded tags, synchronized link badges (e.g., synced to cashflow ledger), and collaborator attribution.
* **Bottom Split Area:**
  * Left: Chronological recent note entries with rich summaries, slide count badges, and audio transcription badges.
  * Right: *Quick Capture Scratchpad* with formatting toolbar + *AI Notes Copilot* action triggers + *Semantic Vector Graph* visualizer showing connected knowledge nodes.

---

## 8. Implementation Guidelines for Next.js

### 8.1 Architectural Mapping
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Global top nav header (Navigation, switcher, user)
│   │   ├── Footer.tsx           # Bottom system status bar
│   │   └── AppShell.tsx         # Shared wrapper applying warm canvas background
│   ├── ui/                      # Atomic presentation components
│   │   ├── StatCard.tsx         # Metric KPI card
│   │   ├── Badge.tsx            # Semantic status & priority pills
│   │   ├── Button.tsx           # Rounded pill buttons & states
│   │   └── Modal.tsx            # Reusable dialog with backdrop blur
│   ├── dashboard/               # Dashboard-specific presentation widgets
│   ├── cashflow/                # TransactionCard, SpendingChart, AddTransactionModal
│   ├── assignments/            # KanbanColumn, TaskCard, QuickCaptureBar
│   ├── schedule/               # DayColumn, ScheduleSessionCard, LiveAgenda
│   └── notes/                  # NoteCard, Scratchpad, SemanticGraph
├── styles/
│   ├── tokens.css               # CSS Variables matching this DESIGN.md
│   └── *.module.css             # Component-scoped CSS modules
```

### 8.2 Preserving Backend & Supabase Contracts
* **Zero Logic Refactor:** All existing Supabase client queries (`supabase.from('transactions').select(...)`, `supabase.from('assignments').insert(...)`), realtime hooks, and auth state (`useUser()`, `useSession()`) must remain untouched.
* **Component Prop Contracts:** Wrap new presentation components around existing data handlers. For example:
  ```tsx
  // Existing data handler stays identical:
  const handleCreateTransaction = async (data: TransactionFormData) => {
    await supabase.from('transactions').insert(data);
  };

  // Only the JSX presentation is replaced:
  <TransactionCard 
    key={tx.id}
    title={tx.description}
    amount={tx.amount}
    category={tx.category}
    date={tx.date}
    receiptUrl={tx.receipt_url}
  />
  ```

### 8.3 CSS Variables Setup (`tokens.css`)
```css
:root {
  --orbit-bg-canvas: #FFF8F0;
  --orbit-bg-card: #FFFFFF;
  --orbit-bg-subtle: #F9F3EB;
  --orbit-bg-high: #F3ECE2;
  --orbit-border-subtle: rgba(223, 217, 209, 0.6);
  --orbit-text-primary: #19191B;
  --orbit-text-secondary: #6B6762;
  --orbit-text-tertiary: #9E9890;
  --orbit-accent-violet: #6366F1;
  --orbit-accent-amber: #F59E0B;
  --orbit-status-green: #10B981;
  --orbit-status-red: #EF4444;
  --orbit-status-blue: #3B82F6;
  --orbit-radius-card: 24px;
  --orbit-radius-pill: 9999px;
  --orbit-shadow-card: 0px 4px 20px -2px rgba(25, 25, 27, 0.04);
  --orbit-font: 'Plus Jakarta Sans', sans-serif;
}
```

### 8.4 Verification Checklist
- [ ] Top header nav matches pill design and handles active tab switching seamlessly.
- [ ] All forms (transaction creation, task capture, schedule adding) trigger existing Supabase mutations.
- [ ] Responsive grid stacks gracefully on viewport resizing without layout overflow.
- [ ] Font pairings and color contrast ratios meet WCAG AA standards against the warm canvas.
- [ ] Ambient drop shadows and corner radii remain consistent across all 5 workspace modules.
