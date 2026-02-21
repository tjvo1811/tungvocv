# Portfolio Improvement Brief — tungvocv
## Paste this into Cursor / Claude Code / any AI editor

**HARD RULE: Do NOT change any text content, labels, descriptions, names, dates, or data. Only modify styles, animations, and visual behavior.**

---

## What I Found (Context for the AI)

- Stack: React + TypeScript + Vite, Tailwind CSS via CDN, `framer-motion` already imported but unused, `@react-three/fiber` for hero/globe scenes
- Fonts: `Playfair Display` (serif) + `Inter` (sans) — both loaded in `index.html`
- `index.css` is completely empty — all styles are Tailwind inline classes
- The `animate-fade-in-up` class on `HonorCard` fires immediately on page load via CSS, NOT on scroll — there are zero scroll-triggered animations currently
- Color palette: cream background `#F9F8F4`, gold accent `#C5A059`, stone neutrals

---

## Change 1 — Add Scroll Reveal Hook (Most Important)

Create a new file `hooks/useScrollReveal.ts`:

```ts
import { useEffect, useRef } from 'react';

export function useScrollReveal(options = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
```

Then add these CSS classes to `index.css`:

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-delay-1 { transition-delay: 0.08s; }
.reveal-delay-2 { transition-delay: 0.16s; }
.reveal-delay-3 { transition-delay: 0.24s; }
.reveal-delay-4 { transition-delay: 0.32s; }
.reveal-delay-5 { transition-delay: 0.40s; }
```

Apply the hook in `App.tsx`:
- Wrap the heading block of each `<section>` in a `<div ref={useScrollReveal()} className="reveal">`
- Wrap each `<ExperienceItem>` in a `<div ref={useScrollReveal()} className="reveal">`
- On `HonorCard`, replace the existing `animate-fade-in-up` class with `reveal reveal-delay-{n}` where n is 1–5 based on position, and wrap the parent grid container with the hook

---

## Change 2 — Minimalist Visual Cleanup

In `App.tsx`, make these find-and-replace style changes:

**Cards (Education + HonorCard):**
- Replace `rounded-xl` with `rounded-sm` on all card divs
- Replace `shadow-sm hover:shadow-md` with `hover:shadow-sm` — reduce shadow intensity
- Replace `border border-stone-200` with `border border-stone-200/60` — make borders more ghostly
- On `HonorCard`, remove the `shadow-sm` from the View Paper button

**Section dividers:**
- Replace `border-t border-stone-200` section separators with `border-t border-stone-100` — even lighter

**Gold bar under headings:**
- The `<div className="w-16 h-1 bg-nobel-gold mx-auto mt-6">` decorative line — reduce height from `h-1` to `h-px` (1px) and reduce width from `w-16` to `w-10`. Feels more refined.

**ExperienceItem timeline:**
- Change `border-l-2` to `border-l` on the timeline left border — thinner line looks cleaner
- Change the gold dot `w-3 h-3` to `w-2 h-2` — smaller, more delicate

---

## Change 3 — Font Upgrade

In `index.html`, replace the current Google Fonts import:

```html
<!-- REMOVE THIS -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- ADD THIS -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

In the Tailwind config block inside `index.html`, update:

```js
fontFamily: {
  serif: ['"Cormorant Garamond"', 'serif'],
  sans: ['"DM Sans"', 'sans-serif'],
},
```

No other changes needed — all `font-serif` and `font-sans` classes will automatically pick up the new fonts.

---

## Change 4 — Section Spacing Increase

For each `<section>` in `App.tsx`, change `py-24` to `py-32`. This adds generous breathing room between sections without changing any content.

---

## Change 5 — Navbar Refinement

The navbar already has scroll behavior (`scrolled` state). Make it slightly more minimal:

- On the non-scrolled state, reduce nav link font from default to `text-sm font-light tracking-widest`
- Add `border-b border-stone-200/0` when not scrolled and `border-b border-stone-200/80` when scrolled (matches the backdrop blur appearing on scroll)
- The "T" logo circle: change `rounded-full` to `rounded-sm` — a square logo mark feels more editorial

---

## Change 6 — HonorCard Hover

In `HonorCard`, the current hover is `hover:border-nobel-gold/50`. Add a subtle lift:

```
hover:-translate-y-1 hover:border-nobel-gold/50
```

And add `transition-transform duration-300` to the card div class list. Small lift on hover makes cards feel interactive without being dramatic.

---

## Summary of Files to Touch

| File | Changes |
|------|---------|
| `index.html` | Font swap (Cormorant Garamond + DM Sans) |
| `index.css` | Add `.reveal` animation classes |
| `App.tsx` | Apply `useScrollReveal` hook, minimalist class tweaks, spacing |
| `hooks/useScrollReveal.ts` | Create new file |

No data files, component logic, text content, or props need changing.