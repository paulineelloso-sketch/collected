# CLAUDE.md — "collected" app

## What this project is

**collected** is a personal commonplace book / digital garden — a place to save and revisit quotes and passages that resonate. The UX is intentionally minimal: quotes scroll vertically, the one closest to the centre of the viewport becomes "focused" (full opacity, full scale), everything else fades away.

The repository currently holds a React prototype (`digital-garden-v4.jsx`) plus a handoff spec (`CLAUDE_CODE_HANDOFF.md`). The goal is to scaffold a production Next.js app around the prototype and deploy it to Vercel.

---

## Repository layout (current state)

```
collected/
├── CLAUDE.md                  ← this file
├── CLAUDE_CODE_HANDOFF.md     ← implementation spec (10-step guide)
└── digital-garden-v4.jsx      ← finished React prototype (776 lines)
```

After scaffolding, the layout will grow into a standard Next.js App Router structure:

```
collected/
├── src/
│   └── app/
│       ├── page.tsx           ← main page (the converted component)
│       ├── layout.tsx         ← root layout with metadata
│       └── globals.css        ← minimal CSS reset only
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Technology stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (TSX) |
| Styling | CSS-in-JS via injected `<style>` tag inside the component |
| Fonts | Google Fonts — DM Sans + DM Serif Display (loaded via `@import` inside the style tag) |
| CSS framework | Tailwind CSS — installed but **not used** in the component; used only for the body/html reset if needed |
| Third-party UI | **None** — zero component libraries, zero animation packages |
| Data persistence | `localStorage` (client-side only, no backend) |
| Deployment | Vercel |

---

## Scaffolding command

```bash
npx create-next-app@latest collected --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd collected
```

Accept all defaults when prompted. Do **not** install any additional packages.

---

## Key conventions

### Styling

- All component styles live in the `styles` constant (a CSS template literal) that is injected as a `<style>` tag at the top of the JSX return.
- **Do not** refactor styles into Tailwind utility classes — the entire visual language depends on the hand-crafted CSS.
- **Do not** extract styles into separate `.css` or `.module.css` files unless explicitly asked.
- `globals.css` should contain only a minimal reset (box-sizing, margins, background colour). The component is responsible for everything else.

### CSS variables (defined in `:root`)

```css
--bg:        #12141c        /* page background */
--text:      #ddd8cf        /* primary text */
--text-dim:  rgba(221,216,207,0.18)
--text-mid:  rgba(221,216,207,0.45)
--text-low:  rgba(221,216,207,0.28)
--accent:    #c9a96e        /* gold — used for active states, links */
--font-sans: 'DM Sans', sans-serif
--font-serif:'DM Serif Display', serif
```

### Naming

- JavaScript: camelCase (`drawerOpen`, `focusedId`, `updateFocus`)
- CSS classes: kebab-case (`site-header`, `filter-bar`, `entry-row`, `overlay-panel`)
- CSS classes are semantic and descriptive — do not rename them without updating both the JSX and the styles string.

### TypeScript

- The `Entry` interface should be defined explicitly:
  ```ts
  interface Entry {
    id: string;
    bite: string;
    rest: string;
    author: string;
    source: string;
    link: string;
    date_saved: string;
    topics: string[];
  }
  ```
- Use type inference for React state where possible (`useState<Entry | null>(null)`).
- The component must start with `'use client'` — it uses `useState`, `useEffect`, `useRef`, `useCallback`, and DOM scroll listeners.

### React patterns

- `updateFocus` is memoised with `useCallback` and depends on `[entries, filterAuthor, filterTopic]`. The `isVisible` helper is used inside it — be careful about stale closure bugs if you refactor.
- Scroll handling uses `requestAnimationFrame` for throttling — do not replace with debounce.
- Refs (`rowRefs`) are used to measure DOM positions for the focus calculation — do not remove the `ref` callback on entry rows.
- State initialisation order matters — `entries` must be set before `updateFocus` runs.

---

## Data model

```ts
interface Entry {
  id: string;         // unique ID — use Date.now().toString() for new entries
  bite: string;       // the highlighted quote shown in the scroll view
  rest: string;       // surrounding context, shown in the overlay on click
  author: string;     // attribution
  source: string;     // book / article / site name
  link: string;       // URL (may be empty string)
  date_saved: string; // e.g. "Nov 2024" — format: "MMM YYYY"
  topics: string[];   // lowercase tags, e.g. ["creativity", "work"]
}
```

The hardcoded `ENTRIES` array in the component serves as seed data / fallback for first visits.

---

## localStorage persistence

Implement in two `useEffect` hooks inside the component:

```ts
// 1. Load on mount
useEffect(() => {
  const saved = localStorage.getItem('collected-entries');
  if (saved) {
    try { setEntries(JSON.parse(saved)); } catch { /* ignore */ }
  }
}, []);

// 2. Persist on change
useEffect(() => {
  localStorage.setItem('collected-entries', JSON.stringify(entries));
}, [entries]);
```

Key: `'collected-entries'`. Keep the hardcoded `ENTRIES` array as the `useState` initial value (used on first visit when localStorage is empty).

---

## UI behaviour reference

| Action | Result |
|---|---|
| Scroll | Entry closest to viewport centre becomes `focused` (opacity 1, scale 1); entries within 35% of viewport height become `near` (opacity 0.38, scale 0.965); all others fade to opacity 0.14, scale 0.92 |
| Click focused entry | Opens full-screen overlay with bite, rest, author, source, and "view source ↗" link |
| Click overlay backdrop or × | Closes overlay |
| Click `+` button (bottom-right) | Opens bottom drawer form |
| Save entry in drawer | Prepends new entry to list; closes drawer |
| Escape key | Closes overlay or drawer |
| Author / Topic dropdowns | Filters visible entries; `filtered-out` class hides non-matching rows |

---

## Root layout metadata

```ts
export const metadata: Metadata = {
  title: 'collected',
  description: 'A personal commonplace book',
}
```

Body background in `layout.tsx` or `globals.css` must be `#12141c`.

---

## Local development

```bash
npm run dev        # starts dev server at http://localhost:3000
npm run build      # production build
npm run lint       # ESLint check
```

---

## Deployment

```bash
npx vercel         # first deploy — follow prompts, accept all defaults
```

After the first deploy, every push to `main` on GitHub auto-deploys via Vercel's Git integration.

---

## What NOT to do

- Do not add third-party UI libraries (Radix, shadcn, Framer Motion, etc.)
- Do not refactor the inline styles into Tailwind classes or CSS modules
- Do not add a backend, API routes, or a database — this is intentionally client-only
- Do not rename CSS classes without updating both the JSX and the `styles` string
- Do not skip the `'use client'` directive — the component will break on the server
- Do not use `useLayoutEffect` for the scroll listener — `useEffect` with `{ passive: true }` is intentional
- Do not move the Google Fonts `@import` to `<head>` or `next/font` — it works fine inside the component's style tag
