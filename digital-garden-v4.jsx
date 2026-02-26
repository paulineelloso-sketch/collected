import { useState, useEffect, useRef, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #12141c;
    --text: #ddd8cf;
    --text-dim: rgba(221,216,207,0.18);
    --text-mid: rgba(221,216,207,0.45);
    --text-low: rgba(221,216,207,0.28);
    --accent: #c9a96e;
    --font-sans: 'DM Sans', sans-serif;
    --font-serif: 'DM Serif Display', serif;
  }

  html { scroll-behavior: auto; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    overflow-x: hidden;
  }

  /* ── Header ── */
  .site-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 48px;
    pointer-events: none;
  }
  .site-title {
    font-family: var(--font-serif);
    font-size: 16px;
    font-style: italic;
    color: var(--text-mid);
    pointer-events: all;
    letter-spacing: 0.01em;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: all;
  }
  .site-count {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  /* ── Filter dropdowns ── */
  .filter-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 40;
    display: flex;
    justify-content: center;
    padding: 26px 0;
    gap: 10px;
    pointer-events: none;
  }
  .filter-select-wrap {
    position: relative;
    pointer-events: all;
  }
  .filter-select {
    appearance: none;
    background: rgba(18, 20, 28, 0.85);
    border: 1px solid rgba(255,255,255,0.09);
    color: var(--text-mid);
    font-family: var(--font-sans);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 8px 32px 8px 14px;
    cursor: pointer;
    outline: none;
    border-radius: 2px;
    backdrop-filter: blur(12px);
    transition: border-color 200ms ease, color 200ms ease;
    min-width: 130px;
  }
  .filter-select:hover,
  .filter-select:focus {
    border-color: rgba(201,169,110,0.4);
    color: var(--accent);
  }
  .filter-select.active {
    border-color: rgba(201,169,110,0.6);
    color: var(--accent);
  }
  .filter-arrow {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--text-low);
    font-size: 9px;
  }
  .filter-select option {
    background: #1a1d28;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 10px;
  }

  /* ── Entries list ── */
  .entries-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 42vh 24px;
  }

  /* ── Entry row ── */
  .entry-row {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 0;
    cursor: default;
    transition: opacity 250ms ease;
  }

  .entry-row.filtered-out {
    display: none;
  }

  /* Quote text */
  .entry-text {
    font-family: var(--font-serif);
    font-size: clamp(17px, 2.2vw, 27px);
    font-style: italic;
    text-align: center;
    line-height: 1.5;
    letter-spacing: -0.005em;
    color: var(--text);
    opacity: 0.14;
    transform: scale(0.92) translateY(4px);
    transition:
      opacity 550ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 550ms cubic-bezier(0.16, 1, 0.3, 1),
      color 400ms ease;
    cursor: default;
    user-select: none;
  }

  .entry-row.near .entry-text {
    opacity: 0.38;
    transform: scale(0.965) translateY(2px);
  }

  .entry-row.focused .entry-text {
    opacity: 1;
    transform: scale(1) translateY(0);
    color: #f2ede4;
    cursor: pointer;
  }

  /* Date — only visible when focused, sits below the quote */
  .entry-date {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-top: 14px;
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 80ms,
      transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 80ms;
    pointer-events: none;
  }

  .entry-row.focused .entry-date {
    opacity: 1;
    transform: translateY(0);
  }



  /* ── Scroll hint ── */
  .scroll-hint {
    position: fixed;
    bottom: 44px; left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 1;
    transition: opacity 600ms ease;
    pointer-events: none;
    z-index: 10;
  }
  .scroll-hint.hidden { opacity: 0; }
  .scroll-hint-text {
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(221,216,207,0.18);
  }
  .scroll-hint-line {
    width: 1px;
    height: 32px;
    background: linear-gradient(to bottom, rgba(221,216,207,0.2), transparent);
    animation: pulse 2.2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.25; transform: scaleY(1); }
    50% { opacity: 0.7; transform: scaleY(1.15); }
  }

  /* ── Overlay ── */
  .overlay {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 24px;
    opacity: 0; pointer-events: none;
    transition: opacity 300ms ease;
  }
  .overlay.open { opacity: 1; pointer-events: all; }

  .overlay-backdrop {
    position: absolute; inset: 0;
    background: rgba(10, 12, 18, 0.93);
    backdrop-filter: blur(22px);
  }

  .overlay-panel {
    position: relative; z-index: 1;
    max-width: 560px; width: 100%;
    padding: 52px 52px 44px;
    border: 1px solid rgba(255,255,255,0.07);
    background: #181b26;
    transform: scale(0.95) translateY(16px);
    transition: transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
    max-height: 85vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.06) transparent;
  }
  .overlay.open .overlay-panel {
    transform: scale(1) translateY(0);
  }

  .overlay-close {
    position: absolute; top: 18px; right: 22px;
    background: none; border: none;
    color: rgba(221,216,207,0.25);
    font-size: 22px; cursor: pointer;
    font-family: var(--font-sans);
    transition: transform 200ms ease, color 200ms ease;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }
  .overlay-close:hover {
    transform: rotate(90deg);
    color: var(--text);
  }

  .overlay-bite {
    font-family: var(--font-serif);
    font-size: 21px;
    font-style: italic;
    line-height: 1.55;
    color: #f2ede4;
    margin-bottom: 28px;
  }

  .overlay-rule {
    width: 28px;
    height: 1px;
    background: rgba(201,169,110,0.45);
    margin-bottom: 28px;
  }

  .overlay-rest {
    font-size: 14px;
    line-height: 1.85;
    font-weight: 300;
    color: rgba(221,216,207,0.52);
    margin-bottom: 36px;
  }

  .overlay-footer {
    padding-top: 22px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .overlay-author {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    opacity: 0.85;
    display: block;
    margin-bottom: 4px;
  }
  .overlay-source {
    font-size: 13px;
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--text-low);
    display: block;
  }
  .overlay-link {
    font-size: 10px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
    opacity: 0.55;
    border-bottom: 1px solid rgba(201,169,110,0.28);
    padding-bottom: 2px;
    white-space: nowrap;
    transition: opacity 200ms ease;
    flex-shrink: 0;
  }
  .overlay-link:hover { opacity: 1; }

  /* ── Add button ── */
  .add-btn {
    position: fixed; bottom: 36px; right: 44px;
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(24, 27, 38, 0.9);
    color: rgba(255,255,255,0.28);
    font-size: 22px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 240ms ease; z-index: 100;
    font-weight: 200; font-family: var(--font-sans);
    backdrop-filter: blur(8px);
    line-height: 1;
  }
  .add-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    transform: scale(1.08);
  }

  /* ── Drawer ── */
  .drawer-backdrop {
    position: fixed; inset: 0; z-index: 90;
    background: rgba(8, 10, 16, 0.65);
    backdrop-filter: blur(10px);
    opacity: 0; pointer-events: none;
    transition: opacity 280ms ease;
  }
  .drawer-backdrop.open { opacity: 1; pointer-events: all; }

  .drawer {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 95;
    background: #181b26;
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 36px 48px 52px;
    transform: translateY(100%);
    transition: transform 430ms cubic-bezier(0.16, 1, 0.3, 1);
    max-height: 75vh; overflow-y: auto;
  }
  .drawer.open { transform: translateY(0); }

  .drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }
  .drawer-title {
    font-size: 10px; letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(221,216,207,0.3);
  }
  .drawer-close {
    background: none; border: none;
    color: rgba(221,216,207,0.25); cursor: pointer;
    font-size: 22px; font-family: var(--font-sans); line-height: 1;
    transition: transform 200ms ease, color 200ms ease;
  }
  .drawer-close:hover { transform: rotate(90deg); color: var(--text); }

  .form-row { margin-bottom: 26px; }
  .form-label {
    display: block; font-size: 9px;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: rgba(221,216,207,0.2); margin-bottom: 9px;
  }
  .form-hint {
    font-size: 10px; color: rgba(221,216,207,0.17);
    margin-top: 6px; font-style: italic;
  }
  .form-input, .form-textarea {
    width: 100%; background: transparent;
    border: none; border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 7px 0 11px; color: var(--text);
    font-size: 14px; font-weight: 300; font-family: var(--font-sans);
    outline: none; resize: none;
    transition: border-color 200ms ease;
  }
  .form-input:focus, .form-textarea:focus {
    border-bottom-color: var(--accent);
  }
  .form-input::placeholder, .form-textarea::placeholder {
    color: rgba(221,216,207,0.14);
  }
  .form-textarea { min-height: 72px; line-height: 1.7; }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 22px;
  }
  @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }

  .form-submit {
    background: none; border: none;
    font-size: 10px; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--accent);
    cursor: pointer; font-family: var(--font-sans); font-weight: 500;
    padding: 0; margin-top: 8px;
    transition: opacity 200ms ease;
  }
  .form-submit:hover { opacity: 0.55; }

  @media (max-width: 640px) {
    .site-header { padding: 20px 20px; }
    .filter-bar { padding: 20px 0; }
    .entries-list { padding: 40vh 16px; }
    .drawer { padding: 28px 20px 44px; }
    .overlay-panel { padding: 40px 24px 36px; }
  }
`;

const ENTRIES = [
  {
    id: "1",
    bite: "Our curiosity united us. It tempered our fear of doing something terrifyingly new.",
    rest: "It formed the basis of our joyful and productive collaboration. Steve was preoccupied with the nature and quality of his own thinking. He expected so much of himself and worked hard to think with a rare vitality, elegance and discipline.",
    author: "Steve Jobs Archive",
    source: "stevejobsarchive.com",
    link: "https://letters.stevejobsarchive.com",
    date_saved: "Nov 2024",
    topics: ["creativity", "curiosity"]
  },
  {
    id: "2",
    bite: "Do the brave thing — the thing that seems ridiculous one moment and genius the next.",
    rest: "Don't do the right thing. You'll be tempted. The right thing sounds so good in meetings. But good enough is not enough. Chase it down, don't let it go, do the thing that disrupts, that upends, that doesn't just defy the status quo but reshapes it forever.",
    author: "Lee Clow",
    source: "Letters to a Young Creator",
    link: "https://letters.stevejobsarchive.com/lee-clow",
    date_saved: "Aug 2024",
    topics: ["creativity", "work"]
  },
  {
    id: "3",
    bite: "Closing your heart doesn't protect you. It just cuts you off from your source of energy.",
    rest: "In the end, it only serves to lock you inside. What you'll find is that the only thing you really want from life is to feel enthusiasm, joy, and love. If you can feel that all the time, then who cares what happens outside?",
    author: "Michael A. Singer",
    source: "The Untethered Soul",
    link: "https://www.goodreads.com/book/show/1963638.The_Untethered_Soul",
    date_saved: "Mar 2024",
    topics: ["mindfulness", "energy"]
  },
  {
    id: "4",
    bite: "His curiosity was ferocious, energetic, restless — practiced with intention and rigor.",
    rest: "His insatiable curiosity was not limited or distracted by his knowledge or expertise, nor was it casual or passive. Being curious and exploring tentative ideas were far more important to Steve than being socially acceptable.",
    author: "Steve Jobs Archive",
    source: "stevejobsarchive.com",
    link: "https://letters.stevejobsarchive.com",
    date_saved: "Nov 2024",
    topics: ["thinking", "curiosity"]
  },
  {
    id: "5",
    bite: "The skill that transfers is being extremely specific about edge cases and states.",
    rest: "Designers who can describe interactions precisely get surprisingly good results. The designer writes the interaction spec in natural language and the code comes out matching their intent on the first or second pass.",
    author: "Vish (@rv_RAJvishnu)",
    source: "X / Twitter",
    link: "https://x.com/rv_RAJvishnu",
    date_saved: "Feb 2025",
    topics: ["design", "work"]
  },
  {
    id: "6",
    bite: "Defining what you need in order to stay open actually ends up limiting you.",
    rest: "If you make lists of how the world must be for you to open, you have limited your openness to those conditions. Do not let anything that happens in life be important enough that you're willing to close your heart over it.",
    author: "Michael A. Singer",
    source: "The Untethered Soul",
    link: "https://www.goodreads.com/book/show/1963638.The_Untethered_Soul",
    date_saved: "Mar 2024",
    topics: ["mindfulness", "philosophy"]
  },
  {
    id: "7",
    bite: "For an idea to live, it must cross the Nincompoop Forest.",
    rest: "Some people fear big ideas, or are afraid to defend them. Some are afraid to buy big ideas, because by their nature they have never been done before and can be scary. If you're not scared of an idea it's probably not a big idea at all.",
    author: "Lee Clow",
    source: "Letters to a Young Creator",
    link: "https://letters.stevejobsarchive.com/lee-clow",
    date_saved: "Aug 2024",
    topics: ["creativity", "work"]
  },
  {
    id: "8",
    bite: "You are only limited by your ability to stay open.",
    rest: "No matter what it is, just let it be the sport of the day. In time, you will find that you forget how to close. No matter what anyone does, no matter what situation takes place, you won't even feel the tendency to close.",
    author: "Michael A. Singer",
    source: "The Untethered Soul",
    link: "https://www.goodreads.com/book/show/1963638.The_Untethered_Soul",
    date_saved: "Mar 2024",
    topics: ["mindfulness", "energy", "philosophy"]
  }
];

export default function App() {
  const [entries, setEntries] = useState(ENTRIES);
  const [focusedId, setFocusedId] = useState(null);
  const [nearIds, setNearIds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [filterTopic, setFilterTopic] = useState("all");
  const [form, setForm] = useState({ bite: "", rest: "", author: "", source: "", link: "", topics: "" });
  const rowRefs = useRef({});
  const rafRef = useRef(null);

  // Derived filter options
  const authors = ["all", ...Array.from(new Set(entries.map(e => e.author)))];
  const topics  = ["all", ...Array.from(new Set(entries.flatMap(e => e.topics))).sort()];

  const isVisible = (entry) => {
    const okAuthor = filterAuthor === "all" || entry.author === filterAuthor;
    const okTopic  = filterTopic  === "all" || entry.topics.includes(filterTopic);
    return okAuthor && okTopic;
  };

  const visibleEntries = entries.filter(isVisible);

  const updateFocus = useCallback(() => {
    const center = window.innerHeight / 2;
    let closest = null;
    let closestDist = Infinity;
    const near = [];

    entries.filter(isVisible).forEach(entry => {
      const el = rowRefs.current[entry.id];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < closestDist) { closestDist = dist; closest = entry.id; }
      if (dist < window.innerHeight * 0.35) near.push(entry.id);
    });

    setFocusedId(closest);
    setNearIds(near.filter(id => id !== closest));
  }, [entries, filterAuthor, filterTopic]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateFocus);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateFocus();
    return () => window.removeEventListener("scroll", onScroll);
  }, [updateFocus]);

  useEffect(() => {
    // Re-run focus when filters change
    requestAnimationFrame(updateFocus);
  }, [filterAuthor, filterTopic, updateFocus]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setSelected(null); setDrawerOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAdd = () => {
    if (!form.bite.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      bite: form.bite,
      rest: form.rest,
      author: form.author || "unknown",
      source: form.source || "unknown",
      link: form.link || "",
      date_saved: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      topics: form.topics ? form.topics.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : ["note"]
    };
    setEntries(prev => [newEntry, ...prev]);
    setForm({ bite: "", rest: "", author: "", source: "", link: "", topics: "" });
    setDrawerOpen(false);
  };

  return (
    <>
      <style>{styles}</style>

      {/* Header */}
      <header className="site-header">
        <div className="site-title">collected</div>
        <div className="header-right">
          <span className="site-count">{visibleEntries.length} entries</span>
        </div>
      </header>

      {/* Filter dropdowns — centred at top */}
      <div className="filter-bar">
        <div className="filter-select-wrap">
          <select
            className={`filter-select ${filterAuthor !== "all" ? "active" : ""}`}
            value={filterAuthor}
            onChange={e => setFilterAuthor(e.target.value)}
          >
            <option value="all">Author (all)</option>
            {authors.filter(a => a !== "all").map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <span className="filter-arrow">▾</span>
        </div>

        <div className="filter-select-wrap">
          <select
            className={`filter-select ${filterTopic !== "all" ? "active" : ""}`}
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
          >
            <option value="all">Topic (all)</option>
            {topics.filter(t => t !== "all").map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="filter-arrow">▾</span>
        </div>
      </div>

      {/* Scroll hint */}
      <div className={`scroll-hint ${scrolled ? "hidden" : ""}`}>
        <span className="scroll-hint-text">scroll</span>
        <div className="scroll-hint-line" />
      </div>

      {/* Entries */}
      <div className="entries-list">
        {entries.map(entry => {
          const isFocused = focusedId === entry.id;
          const isNear    = nearIds.includes(entry.id);
          const show      = isVisible(entry);

          return (
            <div
              key={entry.id}
              ref={el => rowRefs.current[entry.id] = el}
              className={`entry-row ${isFocused ? "focused" : ""} ${isNear ? "near" : ""} ${!show ? "filtered-out" : ""}`}
              onClick={() => isFocused && show && setSelected(entry)}
            >
              <div className="entry-text">"{entry.bite}"</div>
              <div className="entry-date">{entry.date_saved}</div>
            </div>
          );
        })}
      </div>

      {/* Overlay */}
      <div className={`overlay ${selected ? "open" : ""}`}>
        <div className="overlay-backdrop" onClick={() => setSelected(null)} />
        <div className="overlay-panel">
          <button className="overlay-close" onClick={() => setSelected(null)}>×</button>
          {selected && (
            <>
              <div className="overlay-bite">"{selected.bite}"</div>
              {selected.rest && (
                <>
                  <div className="overlay-rule" />
                  <div className="overlay-rest">{selected.rest}</div>
                </>
              )}
              <div className="overlay-footer">
                <div>
                  <span className="overlay-author">{selected.author}</span>
                  <span className="overlay-source">{selected.source}</span>
                </div>
                {selected.link && (
                  <a
                    className="overlay-link"
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view source ↗
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add button */}
      <button className="add-btn" onClick={() => setDrawerOpen(true)}>+</button>

      {/* Drawer */}
      <div className={`drawer-backdrop ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-head">
          <div className="drawer-title">New entry</div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
        </div>
        <div className="form-row">
          <label className="form-label">The bite — the line that hit you</label>
          <textarea
            className="form-textarea"
            placeholder="The sentence you'd underline twice."
            value={form.bite}
            onChange={e => setForm(f => ({ ...f, bite: e.target.value }))}
          />
          <div className="form-hint">Shown in the scroll view.</div>
        </div>
        <div className="form-row">
          <label className="form-label">The rest — surrounding context</label>
          <textarea
            className="form-textarea"
            placeholder="The full passage, what came before and after..."
            value={form.rest}
            onChange={e => setForm(f => ({ ...f, rest: e.target.value }))}
          />
          <div className="form-hint">Shown on click.</div>
        </div>
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Author</label>
            <input className="form-input" placeholder="Lee Clow" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Source</label>
            <input className="form-input" placeholder="Book, article..." value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Link</label>
            <input className="form-input" placeholder="https://..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Topics</label>
            <input className="form-input" placeholder="design, philosophy..." value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))} />
          </div>
        </div>
        <button className="form-submit" onClick={handleAdd}>Save entry →</button>
      </div>
    </>
  );
}
