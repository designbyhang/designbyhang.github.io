/* HANG easter egg: click (or Enter/Space on) the homepage copyright line to open a full-viewport layer in the page colour with the
   HANG letter animation (js/hang-cube.js, loaded on the first open only, same ?v= as this file). Closes only on CLOSE (the Studio presentation's
   top-right "× CLOSE", same markup/classes; click/tap, Enter or Space) or Esc; clicks elsewhere on the layer do nothing; the animation loop and its observers are destroyed on close. Colours come from the site tokens
   (--page/--ink) and follow the light/dark toggle live. prefers-reduced-motion: no fades and a static, fully formed H.
   The layer itself (lock, flow, toggle, keys, CLOSE entrance/exit) is shared as window.dbhLayer.open(cfg)/close(): the egg is one cfg;
   the FMSS case page's phone full-screen prototypes (js/case.js) are another. cfg: label, stage (inner HTML), cls, trg (focus fallback),
   mount(o) -> {destroy} or a promise of one, show(o) when the layer turns on, frame(a) each exit frame with the layer opacity, done() at the end,
   tabs() extra Tab stops, enter() when CLOSE starts its entrance (also at once with reduced motion, and once an instant open has
   painted), exit(k) each exit frame with CLOSE's own exit progress k (1 -> 0), so a cfg can move its own controls on CLOSE's timing;
   view (URL state, below), instant (open without the entrance: a refresh restoring the layer).
   Refresh persistence (window.dbhView, shared with js/proto-fs.js and projects/studio-present.js): an open full-screen view writes
   ?fs=<view> with history.replaceState (no new history entry) and clears it on close; on load a page whose URL carries it reopens
   that view without animation once the gate is passed (the gate stays first), the page scrolled under it to the view's section. */
(()=>{const trg=document.querySelector('footer.bot>span');
const me=document.currentScript,q=me&&me.src.indexOf('?')>0?me.src.slice(me.src.indexOf('?')):'',src=new URL('hang-cube.js'+q,me?me.src:location.href).href;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let load=null,ov=null,inst=null,ret=null,cfg=null;
/* iOS Safari bars, as the Studio presentation (projects/studio-present.js lock/unlock/flow/adoptToggle + js/theme.js): viewport-fit=cover
   while open; once faded in, html.hegg-flow makes the layer the document (css/hang-egg.css) at scroll 0, restored on close; the theme
   toggle joins the layer; theme.js keeps theme-color + html/body = --page and re-samples on toggles (also on the next frame while
   html.hegg-flow is set); re-sample after entering the flow and after closing. */
const de=document.documentElement,vpm=document.querySelector('meta[name=viewport]'),vp0=vpm&&vpm.content,resample=()=>{if(window.__dbhResample)window.__dbhResample();};
let flowY=null;const flow=on=>{if(on){if(flowY!==null)return;flowY=scrollY;de.classList.add('hegg-flow');scrollTo({top:0,left:0,behavior:'instant'});resample();}
  else{if(flowY===null)return;const y=flowY;flowY=null;de.classList.remove('hegg-flow');scrollTo({top:y,left:0,behavior:'instant'});}};
let tb=null,tbHome=null,tbNext=null;
const adoptToggle=o=>{const b=document.querySelector('.theme-btn');if(!b)return;tb=b;tbHome=b.parentNode;tbNext=b.nextSibling;o.appendChild(b);},
 releaseToggle=()=>{if(!tb)return;const b=tb;tb=null;if(tbNext&&tbNext.parentNode===tbHome)tbHome.insertBefore(b,tbNext);else tbHome.appendChild(b);};
const lock=()=>{if(vpm&&!/viewport-fit/.test(vp0))vpm.content=vp0+', viewport-fit=cover';de.classList.add('hegg-open');},unlock=()=>{de.classList.remove('hegg-open');if(vpm)vpm.content=vp0;};
const lib=()=>window.HangCube?Promise.resolve():load||(load=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=()=>{load=null;no();};document.head.appendChild(s);}));
const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key==='Tab'){e.preventDefault();const f=[ov.querySelector('.hegg-x'),...(cfg.tabs?cfg.tabs():[]),ov.querySelector('.theme-btn')].filter(e=>e&&e.getClientRects().length),i=f.indexOf(document.activeElement);f[(i+(e.shiftKey?f.length-1:1))%f.length].focus();return;}
  if(e.key===' '&&e.target.closest&&e.target.closest('.hegg-x')){e.preventDefault();e.stopPropagation();close();return;} /* Space on CLOSE (a link: Enter clicks it natively) */
  if(e.key===' '&&e.target.closest&&e.target.closest('.theme-btn'))return; /* Space on the toggle (it joins the layer) */
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(e.key)){e.preventDefault();e.stopPropagation();}}; /* page behind stays put */
function open(c){if(ov)return;cfg=c;ret=document.activeElement;
  const o=ov=document.createElement('div');o.className='hegg'+(c.cls?' '+c.cls:'');o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label',c.label);
  o.innerHTML='<i class="hegg-edge hegg-edge-t" aria-hidden="true"></i><i class="hegg-edge hegg-edge-b" aria-hidden="true"></i>'+(c.stage||'')+'<div class="bar hegg-bar"><nav class="bar-right" aria-label="'+c.label+'"><a class="ax hegg-x" href="#" role="button" aria-label="Close"><span class="arr arr-back" aria-hidden="true"><svg viewBox="0 0 20 16" fill="none"><path d="M2 0L18 16M18 0L2 16"/></svg></span><span class="t">CLOSE</span></a></nav></div>';
  o.querySelector('.hegg-x').addEventListener('click',e=>{e.preventDefault();close();});
  o.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
  document.body.appendChild(o);lock();adoptToggle(o);
  document.addEventListener('keydown',keys,true);o.querySelector('.hegg-x').focus({preventScroll:true});
  if(c.view)window.dbhView.set(c.view);
  const on=()=>{o.classList.add('on');if(c.show)c.show(o);};
  if(c.instant){o.style.transition='none';on();flow(true);requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ov!==o)return;o.style.transition='';if(c.enter)c.enter();}));}
  else if(reduce.matches){on();flow(true);if(c.enter)c.enter();}else{uis(o).forEach(m=>m.style.opacity='0');requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ov!==o)return;on();enter(o);setTimeout(()=>{if(ov===o)flow(true);},320);}));}
  if(c.mount)Promise.resolve(c.mount(o)).then(m=>{if(ov===o&&!inst)inst=m||null;else if(m&&m.destroy)m.destroy();},()=>{if(ov===o)close();});}
/* exit = the Studio presentation's close (projects/studio-present.js close/aside/asideMeasure, studio-deck.js easeStep): one 650ms
   timeline on the steep ease, p = 1 -> 0; CLOSE fades out while sliding 16px left, finished when the header BACK it shares the corner
   with would have passed it (clr = BACK width / (BACK width + its right inset), smoothstep, from wherever it is); the layer fades
   on the rest of the same progress. BACK is the case pages' header link (measured with the same markup inside the CLOSE row). The
   loop stops, the layer goes and focus returns to the copyright line when it ends. Reduced motion: straight out, as Studio. */
const DUR=650,UI_DX=16,ease=(function bez(p1x,p1y,p2x,p2y){const cx=3*p1x,bx=3*(p2x-p1x)-cx,ax=1-cx-bx,cy=3*p1y,by=3*(p2y-p1y)-cy,ay=1-cy-by;
 const X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t,dX=t=>(3*ax*t+2*bx)*t+cx;
 return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let n=0;n<8;n++){const e=X(t)-x,d=dX(t);if(Math.abs(e)<1e-6)break;if(Math.abs(d)<1e-6)break;t-=e/d;}
  let lo=0,hi=1;if(Math.abs(X(t)-x)>1e-5){t=x;for(let n=0;n<30;n++){const v=X(t);if(Math.abs(v-x)<1e-6)break;if(v<x)lo=t;else hi=t;t=(lo+hi)/2;}}return Y(t);};})(.8,0,.2,1);
const clrOf=x=>{const nav=x.parentNode,k=document.createElement('a');k.className='ax hegg-x';k.setAttribute('aria-hidden','true');k.style.cssText='position:absolute;visibility:hidden';
 k.innerHTML='<span class="arr arr-back"><svg viewBox="0 0 20 16" fill="none"><path d="M0 8H19M11 0L19 8l-8 8"/></svg></span><span class="t">BACK</span>';nav.appendChild(k);
 const w=k.getBoundingClientRect().width;k.remove();const off=w+innerWidth-x.getBoundingClientRect().right;return off>0?Math.min(1,Math.max(0,w/off)):1;};
/* entrance = the Studio presentation's (studio-present.js aside/uiEnter): on the same 650ms open timeline and steep ease, CLOSE stays
   hidden until the header BACK it shares the corner with would have passed it (p >= clr), then slides 16px left to right into place
   while fading 0 to 1 over 450ms on cubic-bezier(.2,.8,.2,1). Closing during the entrance exits from wherever it is. A cfg's other
   controls (.hegg-ui, e.g. the FMSS prototype caption = the Studio counter .deck-n) enter with CLOSE, 40ms apart as Studio's UI_STAG, and exit with it. */
const UI_MS=450,UI_STAG=40,UI_EASE='cubic-bezier(.2,.8,.2,1)';
const uiStop=m=>{if(m._ui){m._ui.cancel();m._ui=null;}};
const uis=o=>[o.querySelector('.hegg-x'),...o.querySelectorAll('.hegg-ui')];
function enter(o){const x=o.querySelector('.hegg-x'),clr=clrOf(x),t0=performance.now();
  const go=()=>{uis(o).forEach((m,i)=>{m.style.opacity=m.style.translate='';if(!m.animate)return;m._ui=m.animate([{opacity:0,translate:-UI_DX+'px 0'},{opacity:1,translate:'0px 0'}],{duration:UI_MS,delay:UI_STAG*i,easing:UI_EASE,fill:'backwards'});m._ui.onfinish=()=>{m._ui=null;};});if(cfg&&cfg.enter)cfg.enter();};
  const tick=now=>{if(ov!==o)return;const p=ease(Math.min(1,(now-t0)/DUR));if(p>=clr||p>=1)go();else requestAnimationFrame(tick);};
  requestAnimationFrame(tick);}
function close(){if(!ov)return;const o=ov,c=inst,cf=cfg,r=ret;ov=inst=null;if(cf.view)window.dbhView.set(null);document.removeEventListener('keydown',keys,true);flow(false);releaseToggle();o.classList.add('is-closing');
  const fin=()=>{if(c)c.destroy();if(cf.done)cf.done();o.remove();if(!ov){unlock();resample();if(r&&r.focus&&document.contains(r))r.focus({preventScroll:true});else if(cf.trg)cf.trg.focus({preventScroll:true});}};
  if(reduce.matches){fin();return;}
  const x=o.querySelector('.hegg-x'),ms=uis(o),st=ms.map(m=>{const cs=getComputedStyle(m),r={o:+cs.opacity,x:parseFloat(cs.translate)||0};uiStop(m);return r;}),a0=+getComputedStyle(o).opacity,clr=clrOf(x),t0=performance.now();
  o.style.transition='none';o.style.opacity=String(a0);
  const tick=now=>{const u=Math.min(1,(now-t0)/DUR),p=1-ease(u),q=clr<1?Math.max(0,(p-clr)/(1-clr)):+(p>=1),k=q*q*(3-2*q);
   ms.forEach((m,i)=>{const s0=st[i];m.style.opacity=(s0.o*k).toFixed(4);m.style.translate=(s0.x+(-UI_DX-s0.x)*(1-k)).toFixed(2)+'px 0';});if(cf.exit)cf.exit(k);const a=a0*(clr>0?Math.min(1,p/clr):p);o.style.opacity=a.toFixed(4);if(cf.frame)cf.frame(a);
   if(u<1)requestAnimationFrame(tick);else fin();};
  requestAnimationFrame(tick);}
window.dbhLayer={open,close,get el(){return ov;}};
/* URL state: get / set (replaceState, other params and the hash kept) / when(fn) = after the DOM is parsed and the gate is passed */
window.dbhView={get:()=>{try{return new URLSearchParams(location.search).get('fs');}catch(_){return null;}},
 set:v=>{try{const u=new URL(location.href);if(v)u.searchParams.set('fs',v);else u.searchParams.delete('fs');if(u.href!==location.href)history.replaceState(history.state,'',u.pathname+u.search+u.hash);}catch(_){}},
 when:fn=>{const go=()=>{if(de.classList.contains('gated'))addEventListener('gate:unlocked',()=>setTimeout(fn,0),{once:true});else fn();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(go,0),{once:true});else setTimeout(go,0);}};
/* a restoring load places the page itself (the view's section), not the browser's remembered scroll */
if(window.dbhView.get()&&'scrollRestoration' in history)history.scrollRestoration='manual';
if(!trg)return;
trg.classList.add('hegg-trg');trg.tabIndex=0;trg.setAttribute('role','button');trg.setAttribute('aria-haspopup','dialog');trg.setAttribute('aria-label',trg.textContent.trim()+': play the HANG animation');
const EGG={label:'HANG',trg,view:'egg',stage:'<div class="hegg-stage" role="img" aria-label="The letters H, A, N, G drawn and turning in a loop"></div>',
 mount:o=>lib().then(()=>ov===o?window.HangCube.mount(o.querySelector('.hegg-stage')):null)};
const openEgg=()=>open(EGG);
trg.addEventListener('click',openEgg);
trg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEgg();}});
/* restore after a refresh: the page at its footer (the copyright line), the layer already on */
window.dbhView.when(()=>{if(window.dbhView.get()!=='egg'||ov)return;scrollTo({top:document.documentElement.scrollHeight,left:0,behavior:'instant'});EGG.instant=true;open(EGG);EGG.instant=false;});
window.dbhEgg={open:openEgg,close,get cube(){return cfg===EGG?inst:null;}};
})();
