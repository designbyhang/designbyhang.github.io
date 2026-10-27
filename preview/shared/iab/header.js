/* FMSS shared IAB sheet header: one component for every FMSS demo's in-app browser sheet, wherever it is drawn: the IAB's half sheet
   (iab.js, cb / hs / P&B), P&B's peek, and the B sheet of the split-screen loops (sol1, sol2 and the FMSS cover, js/fmss-split.js).
   375×52 host px, the Figma "IAB Header" (Watch & Browse / Caption & Browse):
     drag handle 40×4 #C9CCD1 r2 at 168,8 · Facebook logo 16px at 20,24 (fb.svg, the vector one) · lock + domain (url/<domain>.svg:
     SF Pro Text Semibold 13, tracking -0.08, baseline 37, the lock 14.5px before the label, the pair centred) · three dots, 24px box at
     335,20 (4px dots at 341 / 347 / 353, y 32, never clipped) · divider 1px #C9CCD1 at .4 opacity on y 51.
   It draws no surface of its own: the sheet under it is the white (IAB panel, P&B's peek, the loops' B sheet image).
   Geometry is inline, so no stylesheet is needed and a host's own img rules cannot resize it (the site's cover pages have broad ones).
   FMSSIABHeader({url, cls, id, style}) returns the element; the host positions it (it is position:absolute at 0,0 by default). */
(function(){"use strict";if(window.FMSSIABHeader)return;
const SRC=(document.currentScript&&document.currentScript.src)||'';
const BASE=SRC.replace(/[^/]*$/,''),VER=(SRC.match(/\?v=\d+/)||[''])[0];
const ABS='position:absolute;display:block;margin:0;padding:0;border:0;max-width:none;';
function header(o){
  const h=document.createElement('div');h.className='iab-hd'+(o.cls?' '+o.cls:'');if(o.id)h.id=o.id;h.setAttribute('aria-hidden','true');
  h.style.cssText='position:absolute;left:0;top:0;width:375px;height:52px;overflow:visible;pointer-events:none;user-select:none;-webkit-user-select:none;'+(o.style||'');
  h.innerHTML=
    `<i style="${ABS}left:168px;top:8px;width:40px;height:4px;border-radius:2px;background:#C9CCD1"></i>`+
    `<img class="iab-hd-fb" src="${BASE}fb.svg${VER}" alt="" width="16" height="16" decoding="sync" draggable="false" style="${ABS}left:20px;top:24px;width:16px;height:16px">`+
    `<img class="iab-hd-url" src="${BASE}url/${o.url}.svg${VER}" alt="" width="375" height="52" decoding="sync" draggable="false" style="${ABS}left:0;top:0;width:375px;height:52px">`+
    `<svg viewBox="0 0 24 24" width="24" height="24" style="${ABS}left:335px;top:20px;width:24px;height:24px;overflow:visible"><g fill="#050505"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></g></svg>`+
    `<i style="${ABS}left:0;top:51px;width:375px;height:1px;background:#C9CCD1;opacity:.4"></i>`;
  return h;
}
window.FMSSIABHeader=header;
})();
