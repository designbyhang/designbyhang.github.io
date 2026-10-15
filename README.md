# designbyhang.github.io

Static portfolio, no build step. Open it through any static server (GitHub Pages, or locally:
`python3 -m http.server 8080` → http://localhost:8080). Opening the HTML files directly from disk
(`file://`) will NOT load project content, because browsers block `fetch()` there.

## Layout
```
index.html                      Home page (hero, work cards, about, experience, skills, contact)
projects/<slug>.html            Thin page shell per case study (only sets data-slug + <title>)
content/projects/<slug>.json    ALL the text and image references for that case study
content/projects/<slug>/images/ The images for that case study
css/style.css                   Shared styles     css/project.css  Case-study styles
css/gate.css, js/gate.js        Passcode screen   js/project.js    Renders JSON → page
```

## Edit text
Open `content/projects/<slug>.json` and change any string. Save, then refresh. Plain text only:
no HTML, and `&` is fine as-is. Home-page text is in `index.html`.

## Swap an image
Drop the new file into `content/projects/<slug>/images/` and either reuse the old filename or update
the `"image"` value in the JSON. Always update `"alt"` to describe the new image.
To turn a placeholder tile into a real image, replace
`{ "placeholder": true, "label": "...", "title": "...", "note": "..." }` with
`{ "style": "white", "image": "file.png", "alt": "..." }`. Add `"scroll": true` for a tall image
shown in a scrollable frame.

## Add a new project
1. Pick a slug, e.g. `citi-mobile`.
2. Copy `content/projects/facebook-monetization-split-screen.json` to `content/projects/citi-mobile.json` and edit it.
3. Create `content/projects/citi-mobile/images/` and add the images.
4. Copy `projects/facebook-monetization-split-screen.html` to `projects/citi-mobile.html` and change
   `data-slug="citi-mobile"` and the `<title>`.
5. In `index.html`, link the card heading: `<a class="cl" href="projects/citi-mobile.html">…</a>`.

### JSON building blocks
Top level: `title`, `tagline`, `sections[]`. Section `type`s:
- `figure`: centred caption plus a full-width image (`caption`, `image`, `alt`)
- `split`: text card with an image carousel (`label`, `heading`, `paragraphs[]`, `carousel[{image,alt}]`)
- `row`: two cards side by side (`cards[]`)
- `image`: full-width image card (`image`, `alt`, optional `style`)
- `columns`: two independent stacks of cards (`left[]`, `right[]`)

Card fields: `style` (`dark` `red` `blue` `blue2` `orange` `white` `plain`), `label`, `heading`,
`headingSize` (28/36), `paragraphs[]`, `muted`, `items[{heading,text}]`, `numbered[]`, `big`,
`stats[{value,term,text}]`. Special cards: `placeholder`, `scroll` and `summary` (see the example).

## Passcode
`js/gate.js` stores only the SHA-256 hash of the passcode. An unlock lasts for the browser tab
session (sessionStorage). To change the passcode, run
`printf %s 'NEWCODE' | sha256sum` and paste the hash into `HASH` in `js/gate.js`.
Note: this is a deterrent, not real security. Every file, including the images and the JSON, is still
publicly downloadable from GitHub Pages, and anyone can read a public repo.

## Deploy
Push the folder's contents to the root of a repo named `designbyhang.github.io`, then enable Pages
(Settings → Pages → Deploy from branch → main / root). All paths are relative.

## FMSS scroll story (projects/fmss.html)
A scroll-driven version of the FMSS Figma presentation, rendered by `js/scroll-story.js` from
`content/projects/fmss/scenes.json` and `content/projects/fmss/images/`. Each scene is a 1920×1080
artboard scaled to the viewport. Each scene has `steps` (one per Figma frame) holding
`[x, y, w, h, opacity]` per element key:
- An element in step N+1 that wasn't in step N fades and slides in.
- An element in both steps animates to its new position (smart animate).
- The page crossfades between scenes.

Text elements (`"kind":"text"`) are live HTML, so edit their `text` (and `runs`, if present) directly.
To swap in a real video, see `content/projects/fmss/VIDEO_PLACEHOLDERS.md`.
The JSON was generated from the Figma file. Hand edits are kept unless the export is re-run.

## Home page (project strip)
`index.html` is a horizontal project strip. Covers are Figma 2× exports in `assets/cover-*.webp`.
To publish a project: wrap its `.card.proj` contents in `<a class="hit" href="projects/….html">`, add
`class="live"` to the card, and replace the `.soon` pill with `<span class="go">View case study ↗</span>`.

## FMSS case study (`projects/fmss.html`)
Long-form editorial page (not the scroll story). Edit the HTML directly — every section is a plain
`<section>`. Images are in `content/projects/fmss/case/*.webp`. The archived scroll-story lives
under `archive/` and is not linked.
