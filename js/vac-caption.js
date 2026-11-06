/* VAC Reels caption, one build for the hero (js/vac-chain.js, projects/vac.html) and the prototypes (preview/vac-proto, mac-proto, sap-proto, cc-proto):
   the one-line caption, then "… more ⌄" as Reels draws it. The down arrow is the inline Figma vector (141734:25696, 12×12 box at y 4.5,
   5px after the ink of "more", centred on the 15/20 caption's x-height).
   Truncation decides where "more ⌄" sits, as in the app: the line may run to 299px (4px inside the 303px CTA's right edge, a maximum,
   never a pin); the caption is cut on whole glyphs so that text + "…" + 4px + "more ⌄" fits, and the group follows the cut text
   wherever it ends. data-cut marks copy that is already a crop (the prototype's chain reels): it always ends in "…".
     VACCaption.html({cap, chev, cls, cut}) -> '<p class="vcap …">'   (position it with cls; the size, type and layout are here)
     VACCaption.watch(root)  fits every p.vcap in root now, once the fonts are in, and whenever one is (re)laid out */
(function(){'use strict';
if(window.VACCaption)return;
const W=299,GAP=4,ARROW=5,INSET=1.4;
const CHEV_SVG='<svg class="vcap-cv" viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true"><path d="M9.55729 4.05851C9.80135 3.81446 10.198 3.8145 10.4421 4.05851C10.6861 4.30259 10.6861 4.6992 10.4421 4.94328C9.28526 6.10007 8.12734 7.25908 6.9694 8.41593C6.43426 8.95016 5.56693 8.95229 5.02995 8.41789L1.55729 4.94328L1.47721 4.84465C1.31735 4.60222 1.34416 4.272 1.55729 4.05851C1.77072 3.84508 2.10087 3.8186 2.34343 3.97843L2.44206 4.05851L5.91178 7.53215C5.95949 7.57943 6.03697 7.57936 6.08561 7.53117C7.24344 6.37442 8.3994 5.2164 9.55729 4.05851Z" fill="white" fill-opacity="0.7"/></svg>';
const st=document.createElement('style');
// specificity above the hosts' own type rules (css/card.css .cv-scr.vac p, .cover-anim .cv-scr img)
st.textContent=
 'html body p.vcap.vcap{display:flex;gap:'+GAP+'px;width:'+W+'px;margin:0;padding:0;white-space:nowrap;font:var(--t-r-cap);letter-spacing:var(--t-r-cap-ls);font-feature-settings:var(--t-sf-ft);color:#fff;text-shadow:0 0 1px rgba(0,0,0,.62)}'+
 'html body p.vcap span{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}'+
 'html body p.vcap em{flex:none;display:flex;align-items:flex-start;font-style:normal;color:var(--t-r-more-c)}'+
 'html body p.vcap em .vcap-cv{position:static;left:auto;top:auto;display:block;flex:none;width:12px;height:12px;max-width:none;margin:4.5px 0 0 '+(ARROW-INSET)+'px;pointer-events:none}';
document.head.appendChild(st);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function html(o){return '<p class="vcap'+(o.cls?' '+o.cls:'')+'" data-cap="'+esc(o.cap)+'"'+(o.cut?' data-cut':'')+'><span>'+esc(o.cap)+(o.cut?'…':'')+'</span>'+
  '<em>more'+CHEV_SVG+'</em></p>'}
const cx=document.createElement('canvas').getContext('2d');
function fit(p){
  const sp=p.firstElementChild,em=sp&&sp.nextElementSibling,cv=em&&em.querySelector('.vcap-cv');if(!cv||!p.offsetWidth)return;
  const k=p.getBoundingClientRect().width/p.offsetWidth;if(!(k>0))return;const w=e=>e.getBoundingClientRect().width/k;
  // the arrow 5px after the ink of "more": the em's box ends at the last glyph's advance plus its letter-spacing
  const cs=getComputedStyle(em),ls=parseFloat(cs.letterSpacing)||0;cx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
  const m=cx.measureText('more'),rsb=m.width-m.actualBoundingBoxRight+ls;cv.style.marginLeft=(ARROW-INSET-rsb).toFixed(2)+'px';
  const full=p.dataset.cap||'',cut=p.hasAttribute('data-cut'),room=W-GAP-w(em);sp.style.flex='none';   // measured at its own width, then kept there
  sp.textContent=full+(cut?'…':'');if(!cut&&w(sp)<=room+.01)return;
  const g=Array.from(full),txt=n=>g.slice(0,n).join('').replace(/[\s.,;:]+$/,'')+'…';let lo=0,hi=g.length;
  while(lo<hi){const mid=(lo+hi+1)>>1;sp.textContent=txt(mid);if(w(sp)<=room+.01)lo=mid;else hi=mid-1}
  sp.textContent=txt(lo)}
function watch(root){const ps=[...root.querySelectorAll('p.vcap')];if(!ps.length)return;
  const all=()=>ps.forEach(fit);all();
  document.fonts&&document.fonts.ready&&document.fonts.ready.then(all);
  if(window.ResizeObserver){const ro=new ResizeObserver(es=>es.forEach(e=>{if(e.contentRect.width)fit(e.target)}));ps.forEach(p=>ro.observe(p))}}
window.VACCaption={html,watch,fit,W,GAP};
})();
