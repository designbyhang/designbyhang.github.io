# Reels "Ad" label: measured spec (replaces sponsored-spec.md)

Sources: Hang's screenshots /workspace/refs/ad-label/kalshi.png and muse.png (iPhone at 3x, 1260×2736 px = 420×912 pt).
All values are in pt (px ÷ 3). Reels uses the same 78pt comment bar as our stage, so the stack is **anchored to the reel's bottom edge**:
the reel's bottom is at 834 in the reference and 734 in ours, so **ours = ref − 100**. Horizontal values keep the 12pt left inset.

## Stack (top → bottom), as applied in preview/sap-proto (375×812 stage, reel 375×734)

| element | reference (pt) | ours (pt) | notes |
|---|---|---|---|
| Avatar | 36 circle, x 12, y 664.7–700.7 | x 12, y 565–601 | unchanged size |
| Brand name | 15pt **Semibold**, x 56, baseline row top + 23.6 | x 56 (det-relative 44), 15/20, weight 600, −0.24 tracking | weight from ink width: 208pt measured vs 204.6 at 500 and 209.5 at 600 |
| Verified badge | **none** | removed | |
| Globe | 12pt box (ink ≈11.3), 7pt after the name's advance, vertically centred on the 36pt row (box top = row top + 12) | `globe.svg`, 12×12, top 577 (LensCrafters 549), left = 12 + 44 + name advance + 7 | Ray-Ban 124.5 · Warby 161 · Zenni 159 · Even 162.5 · LensCrafters 156 |
| "Sponsored" line | **none** | removed | |
| Caption | 15/20 regular, x 12, line top 709.7 (9.3 below the brand row) | line 610–630; "… more ⌄" (chevron-down.svg, 12×8 at line top + 7) | fitted so the arrow ends at the CTA's right edge (rule below) |
| CTA | x 12, 352 wide (right edge 364 of 420), y 741–785 (44 tall), 11 below the caption, r ≈ 12, label 15 semibold centred | x 12, **303 wide**, y 641–685, 60% squircle r 12 | width kept at 303 so it stays clear of the action column (x 326); proportional would be ≈314 |
| **Ad pill** | x 12, 47.3 × 24, y 798.3–822.3; 13.3 below the CTA, 12 above the reel's bottom | `ad-pill.svg`, x 12, y 698–722 (47.5 × 24) | left-aligned with the CTA |
| "Explore more like this" chip (SAP only) | n/a | x 63.5 (pill + 4), y 698 | moved left from 110 |
| LensCrafters (carousel instead of CTA) | n/a | author 537, caption 582, carousel 613–685, pill 698 | carousel bottom on the CTA's bottom |

## Caption fitting rule (Hang, 27 Oct): the "more ⌄" arrow ends at the CTA's right edge
Use the same rule in MAC and every other surface. Coordinates are phone pt, with the caption/CTA left edge at x 12.
- **Target:** the CTA's right edge, **x = 315** (12 + 303). Ads without a CTA (LensCrafters, carousel) use the same x.
- **Caption string:** prefix + `...` + space + `more` (`more` at 80% white), 15/20 SF Pro Text Regular, −0.24 tracking. Strip trailing spaces and `, . ; :` from the prefix before adding `...`.
- **"more" ink end:** e = the rendered string's advance width + 0.24 (Chrome adds tracking after the last glyph) − 0.791 (the right side bearing of "e": SF Pro Text Regular advance 1170, xMax 1062, upm 2048, at 15pt). This is relative to the caption's left edge.
- **Arrow box:** chevron-down.svg (12×8) left **L = floor((12 + e + 3.05) × 2) / 2** (snapped down to 0.5pt), top = caption line top + 7.
- **Arrow right edge:** the drawn stroke's right edge = **L + 10.65** (path x 10 + the 0.65 round cap; the 0.5pt shadow blur isn't counted).
- **Fit:** take the longest **whole-word** prefix with L + 10.65 ≤ 315. If that leaves a gap of more than **12pt** (315 − right > 12), use the longest **character** prefix with L + 10.65 ≤ 315 instead (a mid-word cut, Instagram style). Never go past 315. The tolerance is 0 past, ≤ 12 short for whole-word cuts, and the mid-word cut gets as close as possible.
- **Reference implementation:** `fitCap()` in the SAP caption renderer (build/ui.html in the SAP working folder; SF Pro Text OTFs, Chromium).

| ad | full caption (source copy) | rendered | cut | arrow L | arrow right | gap to 315 |
|---|---|---|---|---|---|---|
| Ray-Ban | Hey Meta, Who Eats Art? Ft. Chris Hemsworth and Chris Pratt. | Hey Meta, Who Eats Art? Ft. Chris... more | word | 296.5 | 307.15 | 7.85 |
| Warby Parker | We’ve got your eyes covered. Find your new favorite frames, online or in store. | We’ve got your eyes covered. Find... more | word | 303.5 | 314.15 | 0.85 |
| Zenni Optical | The Kittles Collection x Zenni Optical. Shop the full collection of frames at zenni.com. | The Kittles Collection x Zenni Opti... more | mid-word (word cut gap > 12) | 301 | 311.65 | 3.35 |
| Even Realities | The everyday display smart glasses. Meet Even G2, with a discreet display built into prescription-ready lenses. | The everyday display smart glasse... more | mid-word (word cut gap > 12) | 302.5 | 313.15 | 1.85 |
| LensCrafters | High-quality prescription glasses standard with every pair. Book an eye exam at a LensCrafters near you. | High-quality prescription glasses... more | word (gap ≤ 12) | 292.5 | 303.15 | 11.85 |

Pixel check (DPR 4, arrow shown vs hidden, threshold on the visible stroke; the rightmost partly covered pixel rounds up 0.25): Chromium arrow/CTA edges were Warby 315.25/315.25, Zenni 312.25/315.25, Even 314.25/315.25 and LC 304.25/315. WebKit was Warby 315.5/316.0, Zenni 312.75/316.0 and Even 314.75/316.0. The arrow never passes the CTA edge.

## Ad pill internals (ad-pill.svg, 47.5 × 24)
- Capsule: rx 12, fill #18191A at **60%** (the house chip/pill rule). Measured effective opacity is ≈0.49 (Muse) and 0.36–0.48 (Kalshi). Use `fill-opacity` 0.5 if Hang wants it lighter.
- Megaphone: traced from Kalshi (16× upsample), ink 8.33–19.33 × 6.33–17.0 inside the pill, white.
- "Ad": SF Pro Text Regular 12pt, as **outlined paths** (no font dependency). Origin x 24, baseline 16, cap top 7.67, advance end ≈39.5 → 8pt right padding.
- Self-contained: the SVG draws its own fill, so the host element needs `background:none`.

## Globe (globe.svg, 12 × 12)
- White evenodd path, traced from Kalshi (ink px 820–853 × 2032–2065, centred in the box).
- Use as an `<img>` 12×12. Don't recolour it; the ref is white on video.

## Reuse (MAC, VAC hero)
- Files: `preview/shared/caption/ad-pill.svg` (md5 39ad187e8b062a46cee2c860a8098f30) and `preview/shared/caption/globe.svg` (md5 0892aa4929763e5956854536439a526d). Reference them in place (`../shared/caption/…?v=…`) instead of copying, so they stay byte-identical.
- For MAC's raster det/caption images (s-det.webp, lc-caption.webp, rb-det.webp), re-render the brand row without the badge, Sponsored line and globe, with the name at 600. Then overlay globe.svg and ad-pill.svg at the positions above (shift by MAC's own reel bottom: y = reelBottom − 36 for the pill, and so on).
- The bottom-anchored offsets from the reel's bottom edge (B): pill B−36…B−12; CTA B−93…B−49; caption line B−124…B−104; author row B−169…B−133; globe top B−157.
