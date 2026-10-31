/* Full-screen motion foundation, shared by every full-screen view on the site: the Studio presentation (projects/studio-present.js),
   the FMSS Evolution prototypes (desktop js/proto-fs.js; phones js/case.js through js/hang-egg.js window.dbhLayer) and the HANG egg.
   One source for the Studio presentation's motion:
   - expand / collapse: one DUR (648ms) timeline on the steep ease, cubic-bezier(.8,0,.2,1) (= projects/studio-deck.js easeStep),
     p 0 -> 1 on open and from wherever it is back to 0 on close (tween). Reduced motion: instant (u = 1 on the first frame).
   - page chrome (chrome()): the header's logo/label slide out left, BACK and the section menu out right, on the same progress, fading;
     each full-screen control paired with one (CLOSE with BACK) waits until it has passed, then enters 16px left to right while fading
     in over UI.MS 448ms on cubic-bezier(.2,.8,.2,1), UI.STAG 40ms apart (uiEnter); closing reverses it on the collapse's progress.
   - FLIP helpers: rectXf (a box drawn at the viewport size scaled/translated onto a rect) and devXf (an element laid out full screen,
     scaled uniformly about its centre so a point inside it, the prototype's device centre, travels from its inline spot to its own).
   Timings are 8ms multiples (Studio's original 650ms / 450ms became 648ms / 448ms). */
(()=>{if(window.dbhFS)return;
const bez=(p1x,p1y,p2x,p2y)=>{const cx=3*p1x,bx=3*(p2x-p1x)-cx,ax=1-cx-bx,cy=3*p1y,by=3*(p2y-p1y)-cy,ay=1-cy-by;
 const X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t,dX=t=>(3*ax*t+2*bx)*t+cx;
 return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let n=0;n<8;n++){const e=X(t)-x,d=dX(t);if(Math.abs(e)<1e-6)break;if(Math.abs(d)<1e-6)break;t-=e/d;}
  let lo=0,hi=1;if(Math.abs(X(t)-x)>1e-5){t=x;for(let n=0;n<30;n++){const v=X(t);if(Math.abs(v-x)<1e-6)break;if(v<x)lo=t;else hi=t;t=(lo+hi)/2;}}return Y(t);};};
const rm=matchMedia('(prefers-reduced-motion: reduce)'),lerp=(a,b,t)=>a+(b-a)*t;
const DUR=648,ease=bez(.8,0,.2,1),UI={DX:16,MS:448,STAG:40,EASE:'cubic-bezier(.2,.8,.2,1)'};
/* p0 -> p1 over DUR on the ease; step(p) every frame (first one on the next frame), done() after the last. instant (or reduced
   motion): at p1 at once (no frame of p0 is painted), done() on the next frame. Returns {cancel}. */
function tween(p0,p1,step,done,instant){let raf=0;const t0=performance.now();if(instant||rm.matches)step(p1);
 const tick=now=>{const u=instant||rm.matches?1:Math.min(1,(now-t0)/DUR);step(lerp(p0,p1,ease(u)));if(u<1)raf=requestAnimationFrame(tick);else{raf=0;if(done)done();}};
 raf=requestAnimationFrame(tick);return{cancel(){cancelAnimationFrame(raf);raf=0;}};}
const uiStop=m=>{if(m&&m._ui){m._ui.cancel();m._ui=null;}};
/* the controls' entrance (Studio uiEnter): 16px left to right while fading in, UI.MS, UI.STAG apart; instant/reduced: straight in */
function uiEnter(list,instant){let i=0;for(const m of list){if(!m)continue;uiStop(m);m.style.opacity=m.style.translate='';if(rm.matches||instant||!m.animate||!m.getClientRects().length)continue;
 m._ui=m.animate([{opacity:0,translate:-UI.DX+'px 0'},{opacity:1,translate:'0px 0'}],{duration:UI.MS,delay:UI.STAG*i++,easing:UI.EASE,fill:'backwards'});m._ui.onfinish=()=>{m._ui=null;};}}
const inkRight=el=>{const r=document.createRange();r.selectNodeContents(el);const b=r.getBoundingClientRect();return b.width?b.right:el.getBoundingClientRect().right;};
/* page chrome on the expand/collapse progress (Studio asideMeasure / aside / asideReset). o:
   asides: [[pageEl, mate]] page chrome sliding out right (BACK, the section menu) and the full-screen control that takes its spot
     (mate, or null); lefts: page labels sliding out left (logo / bar label: filter:opacity, inert while out); hdr: the sticky header
     (clips horizontally while BACK is out); opening(): true while expanding; instant(): open with no motion (refresh restore);
   ui(tg, g): optional, set g.ui = the controls entering with this mate (default [mate]); onIn(g): when a mate's controls start
     entering; extra: {measure(), set(p), reset()} for view-specific pieces moved on the same progress. */
function chrome(o){let tg=[],lt=[];const ex=o.extra||{},hdr=o.hdr||null;
 const lefts=()=>(o.lefts||[]).filter(Boolean),asides=()=>(o.asides||[]).filter(p=>p[0]);
 function measure(){if(ex.measure)ex.measure();lt=[];for(const el of lefts()){el.style.translate='';el.inert=true;const r=inkRight(el);if(r>0)lt.push({el,off:-r});}
  tg=[];if(hdr)hdr.style.overflowX='clip';for(const [el,mate] of asides()){el.style.translate='';const t=el.getBoundingClientRect();if(!t.width)continue;
   const off=innerWidth-t.left;tg.push({el,mate,off,clr:mate?Math.min(1,Math.max(0,mate.getBoundingClientRect().right-t.left)/off):1});}
  for(const g of tg)g.ui=g.mate?[g.mate]:[];if(o.ui)for(const g of tg)o.ui(tg,g);
  /* closing: each exits from wherever it is (it may still be entering) */
  for(const g of tg)g.st=g.ui.map(m=>{const cs=getComputedStyle(m),op=+cs.opacity,x=parseFloat(cs.translate)||0;uiStop(m);return{o:op,x};});}
 function set(p){for(const g of lt){g.el.style.translate=(p*g.off).toFixed(2)+'px 0';g.el.style.filter=p>0?'opacity('+(1-p).toFixed(4)+')':'';}if(ex.set)ex.set(p);
  for(const g of tg){g.el.style.translate=(p*g.off).toFixed(2)+'px 0';g.el.style.opacity=String(1-p);
   if(o.opening()){if(g.in)continue;if(p>=g.clr||p>=1){g.in=true;uiEnter(g.ui,o.instant&&o.instant());if(o.onIn)o.onIn(g);}else for(const m of g.ui)m.style.opacity='0';continue;}
   const c=g.clr<1?Math.max(0,(p-g.clr)/(1-g.clr)):+(p>=1),k=c*c*(3-2*c);
   g.ui.forEach((m,i)=>{const s0=g.st[i];m.style.opacity=(s0.o*k).toFixed(4);m.style.translate=(s0.x+(-UI.DX-s0.x)*(1-k)).toFixed(2)+'px 0';});}}
 function reset(){for(const el of lefts()){el.style.translate=el.style.filter='';el.inert=false;}lt=[];if(ex.reset)ex.reset();
  for(const [el] of asides())el.style.translate=el.style.opacity='';for(const g of tg)for(const m of g.ui){uiStop(m);m.style.opacity=m.style.translate='';}tg=[];if(hdr)hdr.style.overflowX='';}
 return{measure,set,reset,get groups(){return tg;}};}
/* a box laid out at W x H from the viewport's top-left, drawn over rect A (x,y,w,h) at p = 0 and at 0,0,W,H at p = 1 (transform-origin 0 0) */
const rectXf=(A,W,H,p)=>{const x=lerp(A.x,0,p),y=lerp(A.y,0,p),w=lerp(A.w,W,p),h=lerp(A.h,H,p);return 'translate('+x.toFixed(2)+'px,'+y.toFixed(2)+'px) scale('+(w/W).toFixed(5)+','+(h/H).toFixed(5)+')';};
/* an element laid out at rect F (transform-origin 50% 50%) whose point cF (its device centre, viewport px) shows at cA scaled by k0 at
   p = 0 and in place, unscaled, at p = 1; '' at 1 */
const devXf=(F,cA,cF,k0,p)=>{if(p>=1)return '';const k=lerp(k0,1,p),fx=F.left+F.width/2,fy=F.top+F.height/2,
 dx=lerp(cA.x,cF.x,p)-fx-k*(cF.x-fx),dy=lerp(cA.y,cF.y,p)-fy-k*(cF.y-fy);return 'translate('+dx.toFixed(2)+'px,'+dy.toFixed(2)+'px) scale('+k.toFixed(5)+')';};
window.dbhFS={bez,ease,DUR,UI,rm,lerp,tween,uiStop,uiEnter,chrome,inkRight,rectXf,devXf};})();
