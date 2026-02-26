# Claude Code Handoff — "collected" app

## What this is

I've been prototyping a personal commonplace book / digital garden in Claude.ai and I want you to build it as a proper Next.js app that I can deploy to Vercel. I have a finished React component to give you — your job is to scaffold the project around it correctly.

---

## Step 1 — Scaffold the project

Create a new Next.js app using the App Router:

```bash
npx create-next-app@latest collected --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd collected
```

When prompted, accept all defaults.

---

## Step 2 — Install nothing extra

This app uses zero third-party UI libraries. Just React, Next.js, and TypeScript. No component libraries, no animation packages.

---

## Step 3 — Create the main page

Replace the contents of `src/app/page.tsx` with the component below. The component is written in JSX — convert it to TSX as you paste it in (just add the React import and any types needed, the logic is already correct).

**Paste this entire component into `src/app/page.tsx`:**

```jsx
// [PASTE THE FULL COMPONENT CODE HERE — see component.jsx in this folder]
```

The actual component code is in the file `component.jsx` I've placed alongside this prompt. Copy it in verbatim and convert to TSX.

---

## Step 4 — Update global styles

In `src/app/globals.css`, replace everything with just:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: auto;
}

body {
  background: #12141c;
}
```

The component handles all its own styles via an injected `<style>` tag.

---

## Step 5 — Update layout

In `src/app/layout.tsx`, set the metadata title and make sure the body background matches:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'collected',
  description: 'A personal commonplace book',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## Step 6 — Mark as client component

The main component uses `useState`, `useEffect`, `useRef`, and scroll listeners — it must be a Client Component. Add this as the very first line of `src/app/page.tsx`:

```tsx
'use client'
```

---

## Step 7 — Add localStorage persistence

Right now the entries live in React state and reset on refresh. Add localStorage persistence so saved entries survive page reloads:

1. On mount (`useEffect`), check `localStorage.getItem('collected-entries')` — if it exists, parse it and use it as the initial state instead of the hardcoded `ENTRIES` array
2. Whenever `entries` state changes, write it back: `localStorage.setItem('collected-entries', JSON.stringify(entries))`

Keep the hardcoded `ENTRIES` array as a fallback for when localStorage is empty (first visit).

---

## Step 8 — Test locally

```bash
npm run dev
```

Open `http://localhost:3000`. The app should look exactly like the prototype:
- Dark background (`#12141c`)
- Vertically stacked quotes, centred
- Scroll focus: the quote at the vertical centre of the viewport becomes full opacity and full scale; others fade and shrink
- Two filter dropdowns at the top centre: `Author (all)` and `Topic (all)`
- Date fades in below the focused quote
- Clicking a focused quote opens a full-screen overlay with: the full quote, surrounding context, author name, source, and a "view source ↗" link
- `+` button bottom right opens a drawer form to add new entries
- Escape key closes overlays and drawer

---

## Step 9 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create collected --public --push
```

(Or create the repo manually on github.com and follow the push instructions.)

---

## Step 10 — Deploy to Vercel

```bash
npx vercel
```

Follow the prompts — accept all defaults. Vercel will detect Next.js automatically.

After the first deploy, every `git push` to `main` will automatically redeploy.

---

## Notes for Claude Code

- Do not use any CSS frameworks for the component styles — all styles are in the injected `<style>` tag inside the component
- Tailwind is installed but only used for the body/html reset if needed — do not refactor the component styles into Tailwind classes
- The Google Fonts import (`DM Sans` + `DM Serif Display`) is handled inside the component's style tag via `@import url(...)` — this works fine in a client component
- TypeScript types needed: the `Entry` type should be inferred from the `ENTRIES` array shape, or define it explicitly as an interface with: `id`, `bite`, `rest`, `author`, `source`, `link`, `date_saved`, `topics` fields
- The `isVisible` function is used inside `updateFocus` via closure — make sure it's included in the `useCallback` dependency array or memoised correctly to avoid stale closure bugs
