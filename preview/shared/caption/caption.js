/* Reels ad details, shared by preview/mac-proto and preview/sap-proto: the layout (caption.css .c-stack) and its caption line.
   Caption: the VAC caption (js/vac-caption.js, load it first): one line, cut on whole glyphs so that text + "…" + "more ⌄" fits 299px from
   x 12, i.e. it ends at least 4px inside the CTA's right edge (x 311; CTA 12…315); "more ⌄" follows the cut, never pinned to the edge.
     ReelsCaption.cap(text)       -> the caption's markup (p.vcap.c-cap) for a .c-stack
     ReelsCaption.lift(el, p)     sets the block's --c-lift for a pill under the CTA at progress p (0 none … 1 settled): LIFT·p px, so the
                                  block moves with the pill (same clock, same ease), the pill never overlays it
     ReelsCaption.act(lift)       -> the action region (CTA) rect [x, y, w, h] on the 375×734 reel, for hit tests and press dims
     ReelsCaption.CTA             the CTA's [w, h, r]: 303×36, r8 (css/ad-cta.css)
     ReelsCaption.hs()            -> the product row rect (.c-stack.c-hs) */
(function(){"use strict";
var B=722,CTA=[303,36,8],H=80+CTA[1],HS=152,ACT=80,LIFT=37;   // block bottom (734 − 12); the CTA w, h, r (css/ad-cta.css); heights; author → action; pill 24 + its 13px gap
var CHEV=(document.currentScript&&document.currentScript.src||'').replace(/caption\.js(\?.*)?$/,'chevron-down.svg$1');
function cap(t){return window.VACCaption?VACCaption.html({cap:t,chev:CHEV,cls:'c-cap'}):'<p class="c-cap">'+t+'</p>'}
function lift(el,p){var v=LIFT*Math.max(0,Math.min(1,p));el.style.setProperty('--c-lift',v.toFixed(3))}
function act(l){return [12,B-H+ACT-(l||0),CTA[0],CTA[1]]}
function hs(){return [12,B-HS+ACT,303,72]}
function run(root){root=root||document;[].forEach.call(root.querySelectorAll('.c-stack>p.c-cap:not(.vcap)'),function(p){   // the copy: the p's text
  var t=document.createElement('div');t.innerHTML=cap(p.getAttribute('data-cap')||p.textContent.trim());p.replaceWith(t.firstChild)});
  if(window.VACCaption)VACCaption.watch(root)}
window.ReelsCaption={B:B,H:H,CTA:CTA,LIFT:LIFT,cap:cap,lift:lift,act:act,hs:hs,run:run};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){run()},{once:true});else run();
})();
