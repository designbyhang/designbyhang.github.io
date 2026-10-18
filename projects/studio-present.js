/* Studio Model presentation embed (studio.html). The deck (studio-deck.js) sits in the section's media container, cover-fitted.
   When the container's centre crosses the viewport centre while scrolling, it expands (FLIP, steep ease) into a fullscreen
   presentation; while open, every wheel gesture / swipe / key press = one transition (one more is queued if a transition is
   running). Stepping past the last slide (or back before the first) collapses it into the container and the page scrolls on.
   Esc or CLOSE collapses at any time and the container keeps showing that slide; clicking it, or scrolling down into it again,
   resumes there (in memory, for this page view). Scrolling up into it never expands it. */
(()=>{const host=document.getElementById('deck');if(!host||!window.StudioDeck)return;
const stage=host.querySelector('.deck-stage'),inner=host.querySelector('.deck-inner');
const de=document.documentElement,body=document.body,rm=matchMedia('(prefers-reduced-motion: reduce)');
const fs=document.createElement('div');fs.className='deck-fs';fs.hidden=true;fs.tabIndex=-1;
fs.setAttribute('role','dialog');fs.setAttribute('aria-modal','true');fs.setAttribute('aria-label','Studio Model presentation');
/* CLOSE reuses the page header's BACK markup and classes (.bar / .bar-right / .ax / .arr / .t), so it sits exactly where BACK
   sits with the same type, gap, icon size/stroke and hover underline at every breakpoint */
/* AUTO PLAY (bottom-right, CLOSE's markup + the header BACK's icon/text gap): play glyph points right; pause = two bars */
const AP_PLAY='<svg viewBox="0 0 20 16" fill="none"><path d="M5 1L17 8L5 15Z"/></svg>',AP_PAUSE='<svg viewBox="0 0 20 16" fill="none"><path d="M7 1V15M13 1V15"/></svg>';
fs.innerHTML='<i class="deck-edge deck-edge-t" aria-hidden="true"></i><i class="deck-edge deck-edge-b" aria-hidden="true"></i><div class="bar deck-bar"><nav class="bar-right" aria-label="Presentation"><a class="ax deck-x" href="#presentation" role="button" aria-label="Close presentation"><span class="arr arr-back" aria-hidden="true"><svg viewBox="0 0 20 16" fill="none"><path d="M2 0L18 16M18 0L2 16"/></svg></span><span class="t">CLOSE</span></a></nav></div><div class="bar deck-bar deck-auto-bar"><nav class="bar-right" aria-label="Autoplay"><a class="ax deck-auto" href="#autoplay" role="button" aria-pressed="false" aria-label="Autoplay"><span class="arr arr-back" aria-hidden="true">'+AP_PLAY+'</span><span class="t">AUTO PLAY</span></a></nav></div><p class="deck-n" aria-hidden="true"><span class="arr arr-up"><svg viewBox="0 0 20 16" fill="none"><path d="M0 8H19M11 0L19 8l-8 8"/></svg></span><span class="n"><span class="a">01</span><span class="s">/</span><span class="b">01</span></span><span class="arr arr-up arr-dn"><svg viewBox="0 0 20 16" fill="none"><path d="M0 8H19M11 0L19 8l-8 8"/></svg></span></p>';
body.appendChild(fs);
const edges=fs.querySelectorAll('.deck-edge'),btn=fs.querySelector('.deck-x'),cnt=fs.querySelector('.deck-n'),apBtn=fs.querySelector('.deck-auto'),apIco=apBtn.querySelector('.arr'),cntA=cnt.querySelector('.a'),cntB=cnt.querySelector('.b');
let state='closed',armed=true,prevC=null,suppress=0,raf=0,resume=null,openQ=0;
/* counter starts at the first filled logomark square (studio_04, slide index 2: the grid slides studio_02/03 before it read 00)
   and counts up to the swag slide (studio_43, the one before the last), 40/40; the closing logo slide (studio_44) is not counted
   and keeps showing 40/40 */
const C0=2,CN=window.__STUDIO__.slides.length-2-C0+1,pad=n=>String(n).padStart(2,'0'),num=n=>pad(Math.min(CN,Math.max(0,n-C0+1)));
const deck=StudioDeck.create({inner,stage,onSlide:n=>{cntA.textContent=num(n);if(state!=='closed')chrome();},onTheme:()=>{if(state!=='closed')chrome();},
 /* any step (gesture or AUTO PLAY) restarts the AUTO PLAY wait, which then waits for the landing */
 onStep:()=>{if(apOn){clearTimeout(apT);apT=setTimeout(apWait,0);}}});
const N=deck.N;cntA.textContent=num(deck.cur);cntB.textContent=pad(CN);
const ease=deck.ease,DUR=650;
const W=1920,H=1080,lerp=(a,b,t)=>a+(b-a)*t;
function fitBox(x,y,w,h,k){stage.style.left=x+'px';stage.style.top=y+'px';stage.style.width=w+'px';stage.style.height=h+'px';deck.layout(w,h,null,k);}
const kCover=(w,h)=>Math.max(w/W,h/H),kContain=(w,h)=>Math.min(w/W,h/H);
function fitClosed(){if(state!=='closed')return;const w=host.clientWidth,h=host.clientHeight;if(w&&h)deck.layout(w,h,'cover');}
const vw=()=>fs.clientWidth||innerWidth,vh=()=>fs.clientHeight||innerHeight;
/* fullscreen: the art is contain-fitted inside symmetric side gutters wide enough to clear the counter (right inset + counter
   width + 12px), so the vertically centred counter never sits on the art; the stage (canvas colour) still fills the screen */
function gutter(){const r=cnt.getBoundingClientRect();return r.width?Math.max(0,vw()-r.left+12):0;}
const kFs=()=>Math.min(Math.max(1,vw()-2*gutter())/W,vh()/H);
function fitOpen(){if(state==='open')fitBox(0,0,vw(),vh(),kFs());}
if(window.ResizeObserver)new ResizeObserver(fitClosed).observe(host);
addEventListener('resize',()=>{fitClosed();fitOpen();if(state==='open')chrome();});
/* CLOSE/counter take the light or dark site colours to suit the slide's canvas. Status bar / toolbar / overscroll colour
   (theme-color + html/body bg) is the standard stage colour, #f4f4f4 light / #222222 dark: js/theme.js applies it while
   html.deck-lock is set and follows the toggle live; removing the class restores the page values. */
function canvasColor(){return deck.canvas()||(deck.dark?'#222222':'#f4f4f4');}
const stageColor=()=>deck.dark?'#222222':'#f4f4f4';
const lumOf=c=>{const v=(c.match(/\d+/g)||[244,244,244]).slice(0,3).map(Number);return c[0]==='#'?parseInt(c.slice(1,3),16):(.3*v[0]+.59*v[1]+.11*v[2]);};
/* TRUE fullscreen: once the open animation has finished, html.deck-flow hides the page (display:none) and puts the layer in
   normal flow as the document itself (one viewport + 2px, scroll 0; body = stage colour, js/theme.js). Closing restores the fixed
   overlay and the page's scroll position first, then animates back into the page. The layer/stage paint nothing in the letterbox,
   the slide canvas stays inside the artboard; on tight landscape phones (CLOSE / AUTO PLAY over the art) the canvas fills it.
   iOS 26 Safari bars: they tint from the solid fixed/sticky element at each screen edge and WebKit re-samples it when that layer
   repaints (that is why the project pages' solid sticky header follows the toggle live); without one it falls back to a body
   colour it does not reliably re-read (device: the top kept the colour from opening). So the open layer gets the same thing as the
   project pages: two solid, full-width fixed edge strips (.deck-edge: top = the header row, bottom = the band under AUTO PLAY /
   the toggle), painted in the colour shown at that edge (stage colour, or the canvas when it fills the letterbox) by chrome(),
   which runs synchronously on every theme change. */
let flowY=null;function flow(on){if(on){if(flowY!==null)return;flowY=scrollY;de.classList.add('deck-flow');scrollTo({top:0,left:0,behavior:'instant'});}
 else{if(flowY===null)return;const y=flowY;flowY=null;de.classList.remove('deck-flow');scrollTo({top:y,left:0,behavior:'instant'});}}
function chrome(){const sc=stageColor(),open=state==='open',r=inner.getBoundingClientRect(),hit=e=>{const b=e.getBoundingClientRect();return b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top;},
 clear=!open||(!hit(btn)&&!hit(apBtn)),edge=clear?sc:canvasColor(),tone=lumOf(edge)<128?'dark':'light';
 if(!open){delete stage.dataset.lb;stage.style.background=sc;}else{stage.dataset.lb=clear?'none':'canvas';stage.style.background=clear?'transparent':edge;}
 fs.dataset.tone=tone;fs.dataset.ntone=tone;fs.dataset.lb=clear?'none':'canvas';edges.forEach(e=>e.style.background=edge);fs.style.background=open&&!clear?edge:'';fs.style.boxShadow=open&&!clear?'0 0 0 100vmax '+edge:'';}

/* scroll lock without moving the page: the document keeps its scroll position and geometry (no position:fixed body pinned
   at -scrollY: that shifted the whole page under the fixed overlay and left browsers hit-testing the overlay's controls against
   stale geometry until a resize). The wheel/touchmove/key handlers below stop page scrolling; overflow:hidden on <html> only
   during the open/close animation and, once open, on non-touch screens (touch screens keep a normally scrollable root). */
/* iOS: while fullscreen the layer extends under the status bar / toolbar (viewport-fit=cover; chrome is inset by env(safe-area-*)),
   and js/theme.js paints theme-color + html/body in the stage colour while html.deck-lock is set; both restored on close. */
const vpm=document.querySelector('meta[name=viewport]'),vp0=vpm&&vpm.content;
function lock(){if(vpm&&!/viewport-fit/.test(vp0))vpm.content=vp0+', viewport-fit=cover';de.classList.add('deck-lock');}
function unlock(){de.classList.remove('deck-lock');if(vpm)vpm.content=vp0;}
/* the theme toggle joins the fullscreen layer while it is open (same layer as CLOSE, above the stage), and goes back to its
   own place in the page afterwards */
let tb=null,tbHome=null,tbNext=null;
function adoptToggle(){const b=document.querySelector('.theme-btn');if(!b||b.parentNode===fs)return;tb=b;tbHome=b.parentNode;tbNext=b.nextSibling;fs.appendChild(b);}
function releaseToggle(){if(!tb||tb.parentNode!==fs)return;if(tbNext&&tbNext.parentNode===tbHome)tbHome.insertBefore(tb,tbNext);else tbHome.appendChild(tb);}
/* the page's section menu (.toc: fixed at the right edge, wide screens only) sits where the fullscreen counter goes. While
   the stage expands it slides out to the right, fully off-screen, and fades, on the expand's own progress (same DUR and
   ease); on close it slides back in on the collapse's progress and lands as it ends. The counter stays hidden until the
   menu has passed it and fades in over the rest of the expand (out first on close), so the two never share a frame.
   Uses the independent CSS translate property, so the menu's own translateY(-50%) is untouched; fixed boxes add no
   scroll overflow. Without a visible menu (narrow screens) nothing changes. */
const toc=document.querySelector('.toc');let tg=null;
function asideMeasure(){tg=null;if(!toc)return;toc.style.translate='';const t=toc.getBoundingClientRect();if(!t.width)return;
 const off=innerWidth-t.left;tg={off,clr:Math.min(1,Math.max(0,cnt.getBoundingClientRect().right-t.left)/off)};}
function aside(p){if(!tg)return;toc.style.translate=(p*tg.off).toFixed(2)+'px 0';toc.style.opacity=String(1-p);
 const c=tg.clr<1?Math.max(0,(p-tg.clr)/(1-tg.clr)):+(p>=1);cnt.style.opacity=String(c*c*(3-2*c));}
function asideReset(){tg=null;if(toc)toc.style.translate=toc.style.opacity='';cnt.style.opacity='';}
function anim(from,to,done,side){cancelAnimationFrame(raf);const t0=performance.now();
 const tick=now=>{const u=rm.matches?1:Math.min(1,(now-t0)/DUR),e=ease(u),T=to();side(e);
  const w=lerp(from.w,T.w,e),h=lerp(from.h,T.h,e);fitBox(lerp(from.x,T.x,e),lerp(from.y,T.y,e),w,h,lerp(from.k,T.k,e));
  if(u<1)raf=requestAnimationFrame(tick);else{raf=0;done();}};
 raf=requestAnimationFrame(tick);}
const hostBox=()=>{const r=host.getBoundingClientRect(),b=host.clientLeft||0,w=host.clientWidth,h=host.clientHeight;return{x:r.left+b,y:r.top+b,w,h,k:kCover(w,h)};};
const fullBox=()=>({x:0,y:0,w:vw(),h:vh(),k:kFs()});
function open(n){if(state!=='closed')return;const from=hostBox();lock();state='opening';apSet(true);de.classList.add('deck-open');openQ=0;
 if(n!==deck.cur||deck.animating){deck.stop();deck.show(n);}
 fs.hidden=false;fs.appendChild(stage);adoptToggle();stage.classList.add('is-fs');fitBox(from.x,from.y,from.w,from.h,from.k);chrome();tStart=null;asideMeasure();aside(0);
 anim(from,fullBox,()=>{state='open';flow(true);cnt.style.opacity='';fitOpen();chrome();if(window.__dbhResample)__dbhResample();fs.focus({preventScroll:true});if(openQ){const d=openQ;openQ=0;act(d);}apWait();},aside);}
/* entering on studio_02: after 2s the deck plays the step to studio_03 on its own (text out, grid draws in). A gesture in
   those 2s steps right away instead (once: the timer is cancelled); a forward gesture landing within 300ms after the timer
   fired counts as that same step. Any exit cancels it. Reduced motion: same 2s, instant change. */
let autoT=0,autoAt=0;const AUTO_MS=2000;
function autoStop(){clearTimeout(autoT);autoT=0;}
/* autoplay: ON whenever the presentation opens (incl. resuming at a remembered slide; on studio_02 it replaces the old 2s
   opening hold, same timing, so there is no double step); toggle state itself is not remembered; one step every AP_MS counted from the end of the previous transition (so any
   manual scroll/swipe/key step restarts the wait); waits out running transitions; turns itself off on the last slide and on
   exit. Steps go through deck.request like any gesture (reduced motion = instant change). Per-slide holds (AP_HOLD) replace
   AP_MS: 1s on the finished grid (studio_03, after the line draw lands) and on the swag slide (studio_43, before the logo end frame). */
const AP_MS=500,AP_HOLD={[C0-1]:1000,[window.__STUDIO__.slides.length-2]:1000};let apOn=false,apT=0;
function apSet(v){apOn=!!v;clearTimeout(apT);apT=0;apBtn.setAttribute('aria-pressed',String(apOn));apBtn.classList.toggle('on',apOn);apIco.innerHTML=apOn?AP_PAUSE:AP_PLAY;if(apOn){autoStop();autoAt=0;apWait();}}
function apWait(){if(!apOn)return;clearTimeout(apT);apT=0;if(state!=='open')return;if(deck.animating){apT=setTimeout(apWait,60);return;}
 if(!deck.canStep(1)){apSet(false);return;}apT=setTimeout(apFire,AP_HOLD[deck.cur]??AP_MS);}
function apFire(){apT=0;if(!apOn||state!=='open')return;if(deck.animating){apWait();return;}if(!deck.canStep(1)){apSet(false);return;}deck.request(1,()=>apSet(false));}
function autoStart(){autoStop();autoT=setTimeout(()=>{autoT=0;if(state==='open'&&deck.cur===0&&!deck.animating){autoAt=performance.now();deck.request(1,()=>close('end'));}},AUTO_MS);}
/* how: 'esc' (Esc / CLOSE: remember the slide), 'end' (past the last / before the first slide: forget it) */
function close(how){if(state!=='open'&&state!=='opening')return;autoStop();apSet(false);autoAt=0;const n=deck.settle();resume=how==='esc'?n:null;openQ=0;flow(false);
 const from={...fullBox()};state='closing';chrome();fs.classList.add('is-closing');asideMeasure();aside(1);
 unlock();
 anim(from,hostBox,()=>{host.appendChild(stage);stage.classList.remove('is-fs');stage.style.left=stage.style.top=stage.style.width=stage.style.height='';
  /* focus goes back to the frame for keyboard users, without a focus ring (the ring is only for Tab navigation) */
  const hadFocus=fs.contains(document.activeElement);
  releaseToggle();asideReset();fs.hidden=true;fs.classList.remove('is-closing');state='closed';de.classList.remove('deck-open');armed=false;prevC=null;fitClosed();
  /* the transparent fixed layer covered the edges while collapsing: re-sample the bars from the page (sticky header) now */
  if(window.__dbhResample)__dbhResample();
  if(hadFocus){host.classList.add('deck-quiet');host.focus({preventScroll:true,focusVisible:false});}},e=>aside(1-e));}
host.addEventListener('blur',()=>host.classList.remove('deck-quiet'));
/* trigger: only scrolling DOWN into the container (its centre crossing the viewport centre upwards) expands it, on the first
   slide or the remembered one. Coming from below it never expands: the page scrolls past and the container keeps showing its
   current slide; a click or Enter opens it. */
function watch(){if(state!=='closed'||suppress||performance.now()-(window.__dbhNudge||-1e9)<400)return;const r=host.getBoundingClientRect(),c=r.top+r.height/2,m=innerHeight/2;
 if(!armed){if(Math.abs(c-m)>innerHeight*.12)armed=true;prevC=c;return;}
 if(prevC!==null&&r.bottom>0&&r.top<innerHeight&&prevC>m&&c<=m)open(resume??0);
 prevC=c;}
let sraf=0;addEventListener('scroll',()=>{if(!sraf)sraf=requestAnimationFrame(()=>{sraf=0;watch();});},{passive:true});
/* in-page jumps (TOC, back to top) pass through without opening the presentation */
let sTimer=0;const quiet=()=>{clearTimeout(sTimer);sTimer=setTimeout(()=>{suppress=0;prevC=null;removeEventListener('scroll',quiet);},250);};
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||fs.contains(a))return;suppress=1;prevC=null;addEventListener('scroll',quiet,{passive:true});quiet();},true);
/* stepping: one gesture = one request; the deck queues one step if a transition is running; past either end it collapses */
function act(dir){if(state==='opening'){openQ=dir;return;}if(state!=='open')return;autoStop();if(autoAt){const late=performance.now()-autoAt<300;autoAt=0;if(late&&dir>0)return;}deck.request(dir,()=>close('end'));}
const wheelGesture=StudioDeck.wheelDetector();
addEventListener('wheel',e=>{const g=wheelGesture(e);if(state==='closed')return;e.preventDefault();if(g&&state!=='closing')act(g.dir);},{passive:false});
const TOUCH_PX=30;let tStart=null,tCtl=false;
addEventListener('touchstart',e=>{tCtl=!!(e.target.closest&&e.target.closest('.deck-x,.deck-auto,.theme-btn'));if((state!=='open'&&state!=='opening')||e.touches.length!==1||tCtl){tStart=null;return;}const t=e.touches[0];tStart={y:t.clientY,x:t.clientX,t:performance.now(),done:false};},{passive:true});
addEventListener('touchmove',e=>{if(state==='closed'||tCtl)return;e.preventDefault();if(!tStart)return;const t=e.touches[0],dy=tStart.y-t.clientY;tStart.ly=t.clientY;
 if(!tStart.done&&Math.abs(dy)>=TOUCH_PX&&Math.abs(dy)>=Math.abs(tStart.x-t.clientX)){tStart.done=true;act(dy>0?1:-1);}},{passive:false});
addEventListener('touchend',e=>{if(!tStart)return;const s=tStart;tStart=null;if(s.done)return;
 const t=e.changedTouches&&e.changedTouches[0],ey=t?t.clientY:(s.ly??s.y),dy=s.y-ey,dtm=performance.now()-s.t;
 if(Math.abs(dy)>=10&&(dtm<=300||Math.abs(dy)/Math.max(dtm,1)>=.3))act(dy>0?1:-1);},{passive:true});
addEventListener('touchcancel',()=>{tStart=null;},{passive:true});
const NEXT=['ArrowDown','PageDown','ArrowRight',' '],PREV=['ArrowUp','PageUp','ArrowLeft'];
addEventListener('keydown',e=>{if(e.key==='Tab')host.classList.remove('deck-quiet');if(state==='closed')return;
 if(e.key==='Escape'){e.preventDefault();close('esc');return;}
 if(e.key==='Tab'){e.preventDefault();const tb=document.querySelector('.theme-btn'),f=[btn,apBtn,tb].filter(Boolean),i=f.indexOf(document.activeElement);f[(i+(e.shiftKey?f.length-1:1))%f.length].focus();return;}
 const dir=NEXT.includes(e.key)?1:PREV.includes(e.key)?-1:0;if(!dir||e.altKey||e.ctrlKey||e.metaKey)return;
 if((e.key===' '||e.key==='Enter')&&/^(BUTTON|A)$/.test(document.activeElement&&document.activeElement.tagName))return;
 e.preventDefault();if(e.repeat||state==='closing')return;act(dir);});
btn.addEventListener('click',e=>{e.preventDefault();close('esc');});
apBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(state==='open')apSet(!apOn);});
/* the container shows the current (or remembered) slide; a click, Enter or Space reopens on exactly that slide */
host.addEventListener('click',()=>{if(state==='closed')open(deck.cur);});
host.addEventListener('keydown',e=>{if(state==='closed'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(deck.cur);}});
fitClosed();deck.show(0);
window.__present={get auto(){return!!autoT;},get autoplay(){return apOn;},get apPending(){return!!apT;},get state(){return state;},deck,open,close,get armed(){return armed;},get resume(){return resume;}};})();
