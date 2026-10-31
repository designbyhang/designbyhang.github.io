/* VAC Reels caption, one build for the hero (js/vac-chain.js, projects/vac.html) and the prototype (preview/vac-proto): the one-line
   caption, then "… more ⌄" as Reels draws it. The down arrow is FMSS Caption & Browse's (preview/shared/caption/chevron-down.svg, the
   12×8 box with the 8×4 arrow 2px in, as preview/mac-proto and preview/sap-proto use it): its arrow starts 5px after the ink of "more",
   its box top 7px under the line top (the arrow centred on the 15/20 caption's x-height, line top + 11).
   Truncation decides where "more ⌄" sits, as in the app: the line may run to 299px (4px inside the 303px CTA's right edge, a maximum,
   never a pin); the caption is cut on whole glyphs so that text + "…" + 4px + "more ⌄" fits, and the group follows the cut text
   wherever it ends. data-cut marks copy that is already a crop (the prototype's chain reels): it always ends in "…".
     VACCaption.html({cap, chev, cls, cut}) -> '<p class="vcap …">'   (position it with cls; the size, type and layout are here)
     VACCaption.watch(root)  fits every p.vcap in root now, once the fonts are in, and whenever one is (re)laid out */
(function(){'use strict';
if(window.VACCaption)return;
const W=299,GAP=4,ARROW=5,INSET=2;
const st=document.createElement('style');
// specificity above the hosts' own type rules (css/card.css .cv-scr.vac p, .cover-anim .cv-scr img)
st.textContent=
 'html body p.vcap.vcap{display:flex;gap:'+GAP+'px;width:'+W+'px;margin:0;padding:0;white-space:nowrap;font:400 15px/20px -apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro","Segoe UI",Roboto,"Inter","Helvetica Neue",Arial,sans-serif;letter-spacing:-.24px;color:#fff;text-shadow:0 0 1px rgba(0,0,0,.62)}'+
 'html body p.vcap span{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}'+
 'html body p.vcap em{flex:none;display:flex;align-items:flex-start;font-style:normal;color:rgba(255,255,255,.7)}'+
 'html body p.vcap em img.vcap-cv{position:static;left:auto;top:auto;display:block;width:12px;height:8px;max-width:none;margin:7px 0 0 '+(ARROW-INSET)+'px;pointer-events:none}';
document.head.appendChild(st);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function html(o){return '<p class="vcap'+(o.cls?' '+o.cls:'')+'" data-cap="'+esc(o.cap)+'"'+(o.cut?' data-cut':'')+'><span>'+esc(o.cap)+(o.cut?'…':'')+'</span>'+
  '<em>more<img class="vcap-cv" alt="" src="'+esc(o.chev)+'" width="12" height="8" draggable="false"></em></p>'}
const cx=document.createElement('canvas').getContext('2d');
function fit(p){
  const sp=p.firstElementChild,em=sp&&sp.nextElementSibling,cv=em&&em.querySelector('img');if(!cv||!p.offsetWidth)return;
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
