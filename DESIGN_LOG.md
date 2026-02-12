# Design Log

## 2026-02-12 — Dashboard Visual Redesign

### What changed

**New file: `src/lib/designSystem.ts`**
- Centralized style constants (`ds` object) for typography, cards, buttons, inputs, tables, sidebar, status dots
- `scoreBadge()` / `scoreRingColor()` for consistent color-coded scores
- `sparklinePath()` helper for inline SVG sparklines
- `progressRing()` helper for SVG progress rings
- `fakeTrend()` for demo sparkline data

**DashboardLayout.tsx** — Premium sidebar redesign
- Navigation grouped with tiny uppercase section labels (Overview / Assessments / Account)
- Active state uses subtle left border accent + dimmed white background instead of full highlight
- Active icon tinted indigo
- Sidebar background changed to `#0B1120`, thinner width (220px)
- Mobile sidebar uses cubic-bezier easing and backdrop-blur overlay
- All icons thinned to strokeWidth 1.5

**Dashboard home (`page.tsx`)**
- Stat cards with inline sparklines (SVG) and contextual delta text ("↑ 3pts from last week")
- Avg Score rendered as a progress ring instead of big number
- Quick actions row with primary/secondary/ghost button hierarchy
- Recent results table with score as colored number, subtle row separators, no heavy borders

**My Tests (`tests/page.tsx`)**
- Converted from card-per-test to a proper table layout
- Status shown as colored dot (green/gray) beside title, not badge
- Completion shown as mini progress bar + percentage
- Inline "View →" action appears on row hover (opacity transition)
- Empty state with icon, message, and CTA

**Test Detail (`tests/[id]/page.tsx`)**
- Tab interface (Overview / Task & Prompt / Candidates) instead of everything stacked
- Key stats displayed as horizontal row with dividers, not grid of cards
- Avg score shown as progress ring
- Scoring weights use slim progress bars
- Configuration displayed as key-value rows with subtle dividers, not cards
- Task prompt in light gray background block

**Candidates (`candidates/page.tsx`)**
- Score shown as number + mini inline bar (colored by score range)
- Percentile color-coded (emerald for top quartile, gray for rest)
- Result count shown beside search
- Consistent table styling from design system

**Create Test (`create/page.tsx`)**
- Smaller, tighter step indicators with smooth transitions
- Form inputs use design system classes (consistent focus rings, font sizes)
- Selection buttons use subtle indigo tint + shadow instead of thick borders
- Review step uses flat key-value rows instead of gray box grid
- Range sliders styled with accent-indigo-600

**Settings (`settings/page.tsx`)**
- Sections use flat dividers instead of cards (Profile, Notifications, API Keys, Billing)
- Uppercase section labels from design system
- Toggle switches use indigo when active
- Billing status uses dot + text instead of colored badge
- Links and actions use consistent indigo color

### Design principles applied
1. **Typography**: 11px uppercase tracking labels, 13px body, 22px titles with negative tracking
2. **Spacing**: Non-uniform — flat sections with dividers, not everything in cards
3. **Data viz**: Sparklines, progress rings, inline score bars
4. **Micro-interactions**: 200ms transitions on hovers, opacity reveals, border shifts
5. **Information density**: Tables over cards, inline metadata, compact stat rows
6. **Color**: Restrained — indigo for primary actions only, status dots (green/amber/red/gray), everything else is grays
7. **Tables**: No heavy borders, subtle row separators, hover highlights, inline hover actions
8. **Cards**: Used sparingly — flat sections with dividers for informational content
9. **Empty states**: Icon + message + CTA, not just text
10. **Navigation**: Grouped sections with uppercase labels, left-border active accent
