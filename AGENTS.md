# Working on designbyhang.com

Static portfolio site for Hang Zheng, served by GitHub Pages from `main`. Pushing to `main` puts changes live in about a minute, so treat every push as shipping.

## How changes ship
- Visual changes: show Hang a preview (screenshot or a branch) first and wait for him to say "ship". Only Hang's own message counts as approval.
- Non-visual changes (analytics, docs) can ship once tested, then tell Hang.
- "pause" means stop at once and revert anything already pushed.
- After shipping, send the live link.
- Do exactly what's asked. Delete unused code rather than hiding it. No patch layers.

## Cache-busting (`?v=`)
- CSS/JS are referenced with `?v=N`. Bump only the files you changed, in every page that loads them.
- Next free number: **343** (update this line when you use one). Numbers are global; never reuse one.
- Don't touch pinned refs: `header.js?v=137`, the cc-proto `nav.webp?v=263`, and the Citi animation pins.
- Other agents (Animation-Wiz for Citi animations) also push to `main`. Fetch and rebase right before pushing.

## Design rules
- Spacing on an even scale: 4, 8, 12, 16, 24, 32, 40...
- Buttons inside media containers: 32px from right and bottom on desktop, 16px on mobile.
- All motion durations, delays and holds are multiples of 8ms (e.g. 0.56s, 0.64s).
- Rounded corners use 60% corner smoothing (squircle).
- No focus rings or outlines anywhere (including keyboard focus-visible). No hover effects. No inner scrolling areas.
- Captions under media: Instrument Sans 400, 14px/18px, centred, text colour at 56% opacity.
- Straight apostrophes only (no curly quotes) in copy.
- Homepage project cards and next-project cards are static covers; no demo playback.
- Project heroes and Solution demos autoplay and never respond to taps. Prototypes are interactive only in full screen.
- Phone portrait case pages: hero media above the meta section; meta stays as stacked rows.
- Wide screens (>=1800px): case pages widen to max 1440px (laptops keep 1152px); text column is centred on the whole page. Every full-screen view (Studio presentation, full-screen prototypes) must look exactly as it did before the wide layout, at every screen size.
- FMSS prototypes share foundation components (one in-app browser for all three). Fix the shared component, not each prototype.

## Don't touch unless the task needs it
- `gate.js` (password gate), `hang-cube.js`, `studio-deck-data.js`, `header.js`.
- Never put the passcode, its hash, or `gate.js` in preview/mock pages. Never commit tokens or secrets.
- Don't edit Hang's Figma files; read/export only.
- No Apple sound files or assets; don't ship SF Pro.
- Leave `checks/` uncommitted.

## Analytics
GoatCounter (`designbyhang.goatcounter.com`) on index and case pages; `js/gc-depth.js` logs section-reached and finished events. `/nocount.html` excludes your browser.
