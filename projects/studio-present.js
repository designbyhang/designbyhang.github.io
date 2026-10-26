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
/* AUTO SCROLL (bottom-right, CLOSE's markup + the header BACK's icon/text gap): play glyph points right; pause = two bars */
const AP_PLAY='<svg viewBox="0 0 20 16" fill="none"><path d="M4.827 1.536L4.827 14.464A0.536 0.536 0 0 0 5.635 14.925L16.563 8.461A0.536 0.536 0 0 0 16.563 7.539L5.635 1.075A0.536 0.536 0 0 0 4.827 1.536Z"/></svg>',AP_PAUSE='<svg viewBox="0 0 20 16" fill="none"><path d="M7 1V15M13 1V15"/></svg>';
/* phones (portrait and landscape) get a round Play/Pause button instead (the theme toggle's circle, bottom right; studio.html):
   filled glyphs like the toggle's icons */
fs.innerHTML='<i class="deck-edge deck-edge-t" aria-hidden="true"></i><i class="deck-edge deck-edge-b" aria-hidden="true"></i><div class="bar deck-bar"><nav class="bar-right" aria-label="Presentation"><a class="ax deck-x" href="#presentation" role="button" aria-label="Close presentation"><span class="arr arr-back" aria-hidden="true"><svg viewBox="0 0 20 16" fill="none"><path d="M2 0L18 16M18 0L2 16"/></svg></span><span class="t">CLOSE</span></a></nav></div><div class="bar deck-bar deck-auto-bar"><nav class="bar-right" aria-label="Auto scroll"><a class="ax deck-auto" href="#autoplay" role="button" aria-pressed="false" aria-label="Auto scroll"><span class="arr arr-back" aria-hidden="true">'+AP_PLAY+'</span><span class="t">AUTO SCROLL</span></a></nav></div><button type="button" class="deck-apb mbtn" aria-pressed="false" aria-label="Play">'+window.dbhPP+'</button><p class="deck-n" aria-hidden="true"><span class="arr arr-up"><svg viewBox="0 0 20 16" fill="none"><path d="M0 8H19M11 0L19 8l-8 8"/></svg></span><span class="n"><span class="a">01</span><span class="s">/</span><span class="b">01</span></span><span class="arr arr-up arr-dn"><svg viewBox="0 0 20 16" fill="none"><path d="M0 8H19M11 0L19 8l-8 8"/></svg></span></p>';
body.appendChild(fs);
const edges=fs.querySelectorAll('.deck-edge'),btn=fs.querySelector('.deck-x'),cnt=fs.querySelector('.deck-n'),apBtn=fs.querySelector('.deck-auto'),apIco=apBtn.querySelector('.arr'),apRnd=fs.querySelector('.deck-apb'),cntA=cnt.querySelector('.a'),cntB=cnt.querySelector('.b');
let state='closed',armed=true,prevC=null,suppress=0,raf=0,resume=null,openQ=0;
/* counter starts at the first filled logomark square (studio_04, slide index 2: the grid slides studio_02/03 before it read 00)
   and counts up to the swag slide (studio_43, the one before the last), 40/40; the closing logo slide (studio_44) is not counted
   and keeps showing 40/40 */
const C0=2,CN=window.__STUDIO__.slides.length-2-C0+1,pad=n=>String(n).padStart(2,'0'),num=n=>pad(Math.min(CN,Math.max(0,n-C0+1)));
const deck=StudioDeck.create({inner,stage,onSlide:n=>{cntA.textContent=num(n);if(state!=='closed')chrome();},onTheme:()=>{if(state!=='closed')chrome();},
 /* any step (gesture or AUTO SCROLL) restarts the AUTO SCROLL wait, which then waits for the landing */
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
const mPort=matchMedia('(orientation:portrait) and (max-width:640px)'); /* phones in portrait: counter under the slide (studio.html), 16px side margins */
/* phones in landscape: CLOSE, the counter and the Play/Pause button sit by the right screen edge, the theme toggle by the left
   (studio.html); the art is centred between symmetric gutters sized to the wider side's controls, 16px clear of them */
const mLand=matchMedia('(orientation:landscape) and (max-height:500px) and (hover:none) and (pointer:coarse)');
/* controls' resting left edge (without the entrance slide, uiEnter), so the fit never follows them while they move in */
const restLeft=e=>e.getBoundingClientRect().left-(parseFloat(getComputedStyle(e).translate)||0);
function gutter(){if(mPort.matches)return 16;
 if(mLand.matches){const t=fs.querySelector('.theme-btn'),L=t?parseFloat(getComputedStyle(t).left)+t.offsetWidth+16:16;
  return Math.max(L,...[btn,cnt,apRnd].map(e=>e.getBoundingClientRect().width?vw()-restLeft(e)+16:0));}
 return cnt.getBoundingClientRect().width?Math.max(0,vw()-restLeft(cnt)+12):0;}
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
   the slide canvas stays inside the artboard; on tight landscape phones (CLOSE / AUTO SCROLL over the art) the canvas fills it.
   iOS 26 Safari bars: they tint from the solid fixed/sticky element at each screen edge and WebKit re-samples it when that layer
   repaints (that is why the project pages' solid sticky header follows the toggle live); without one it falls back to a body
   colour it does not reliably re-read (device: the top kept the colour from opening). So the open layer gets the same thing as the
   project pages: two solid, full-width fixed edge strips (.deck-edge: top = the header row, bottom = the band under AUTO SCROLL /
   the toggle), painted in the colour shown at that edge (stage colour, or the canvas when it fills the letterbox) by chrome(),
   which runs synchronously on every theme change. */
let flowY=null;function flow(on){if(on){if(flowY!==null)return;flowY=scrollY;de.classList.add('deck-flow');scrollTo({top:0,left:0,behavior:'instant'});}
 else{if(flowY===null)return;const y=flowY;flowY=null;de.classList.remove('deck-flow');scrollTo({top:y,left:0,behavior:'instant'});}}
function chrome(){const sc=stageColor(),open=state==='open',r=inner.getBoundingClientRect(),hit=e=>{const b=e.getBoundingClientRect();return b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top;},
 clear=!open||(!hit(btn)&&!hit(apBtn)&&!hit(apRnd)),edge=clear?sc:canvasColor(),tone=lumOf(edge)<128?'dark':'light';
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
/* page chrome that sits where the fullscreen controls go: the section menu (.toc: fixed at the right edge, wide screens only)
   under the counter, and the header's BACK (top right) under CLOSE. While the stage expands each slides out to the right
   (the edge it sits at, so it never has to pass the stage's centre), fully off-screen, and fades, on the expand's own
   progress (same DUR and ease); on close it slides back in on the collapse's progress and lands as it ends. Its control stays
   hidden until it has passed it, then slides in (uiEnter; out first on close), so the two never share a frame.
   Uses the independent CSS translate property (the menu's own translateY(-50%) is untouched; BACK moves inside its static
   nav, so case.js's header measurements are unchanged). The fixed menu adds no scroll overflow; the sticky header clips
   horizontally while BACK is out (else it widened the page, and on phones the layout viewport with it, CLOSE included). Anything not shown (the menu on narrow screens) is left alone. */
const asides=[[document.querySelector('.toc'),cnt],[document.querySelector('body>.bar .bar-right a'),btn]].filter(p=>p[0]);let tg=[];const hdr=document.querySelector('body>.bar');
/* the header's top-left label (the logo, or the 'Studio Model · Presentation' label that replaces it; whichever shows) does the
   same to the LEFT: moved by its text's right edge, so it just clears the left screen edge, on the same progress. It fades with
   filter:opacity (case.js owns their opacity and its .22s transition) and is inert while out (not clickable or focusable) */
const lefts=[hdr&&hdr.querySelector('.brand'),document.getElementById('bar-mid')].filter(Boolean);let lt=[];
const inkRight=el=>{const r=document.createRange();r.selectNodeContents(el);const b=r.getBoundingClientRect();return b.width?b.right:el.getBoundingClientRect().right;};
/* the theme toggle sits closer to the screen edge while presenting on phones in landscape: it moves between its page spot
   (measured with .tb-home, which drops the fullscreen position) and that spot on the expand's progress */
let tbOff=null;function tbMeasure(){tbOff=null;const t=fs.querySelector('.theme-btn');if(!t)return;t.style.translate='';const a=t.getBoundingClientRect();
 t.classList.add('tb-home');const b=t.getBoundingClientRect();t.classList.remove('tb-home');const dx=b.left-a.left,dy=b.top-a.top;if(dx||dy)tbOff={t,dx,dy};}
function asideMeasure(){tbMeasure();lt=[];for(const el of lefts){el.style.translate='';el.inert=true;const r=inkRight(el);if(r>0)lt.push({el,off:-r});}
 tg=[];if(hdr)hdr.style.overflowX='clip';for(const [el,mate] of asides){el.style.translate='';const t=el.getBoundingClientRect();if(!t.width)continue;
 const off=innerWidth-t.left;tg.push({el,mate,off,clr:Math.min(1,Math.max(0,mate.getBoundingClientRect().right-t.left)/off)});}
 /* the presentation's controls enter with CLOSE once BACK has passed: the counter too when the menu is not shown (phones, most
    desktop widths), and AUTO SCROLL / the Play/Pause button; top to bottom (the stagger order) */
 for(const g of tg)g.ui=[g.mate];const g=tg.find(g=>g.mate===btn);if(g){if(!tg.some(g=>g.mate===cnt))g.ui.push(cnt);g.ui.push(apBtn,apRnd);}
 /* closing: each exits from wherever it is (it may still be entering) */
 for(const g of tg)g.st=g.ui.map(m=>{const cs=getComputedStyle(m),o=+cs.opacity,x=parseFloat(cs.translate)||0;uiStop(m);return{o,x};});}
/* control entrance (Hang: slide in from the left, fading in): once its trigger is reached on the expand's progress, each control
   moves 16px left to right into place while fading 0 to 1 over 450ms, ease-out, 40ms apart. Closing reverses it on the collapse's
   progress (fade out while sliding back left), done before BACK comes back past it. Reduced motion: no move, straight in. */
const UI_DX=16,UI_MS=450,UI_STAG=40,UI_EASE='cubic-bezier(.2,.8,.2,1)';
function uiStop(m){if(m._ui){m._ui.cancel();m._ui=null;}}
function uiEnter(list){let i=0;for(const m of list){uiStop(m);m.style.opacity=m.style.translate='';if(rm.matches||!m.animate||!m.getClientRects().length)continue;
 m._ui=m.animate([{opacity:0,translate:-UI_DX+'px 0'},{opacity:1,translate:'0px 0'}],{duration:UI_MS,delay:UI_STAG*i++,easing:UI_EASE,fill:'backwards'});m._ui.onfinish=()=>{m._ui=null;};}}
function aside(p){for(const g of lt){g.el.style.translate=(p*g.off).toFixed(2)+'px 0';g.el.style.filter=p>0?'opacity('+(1-p).toFixed(4)+')':'';}if(tbOff)tbOff.t.style.translate=((1-p)*tbOff.dx).toFixed(2)+'px '+((1-p)*tbOff.dy).toFixed(2)+'px';for(const g of tg){g.el.style.translate=(p*g.off).toFixed(2)+'px 0';g.el.style.opacity=String(1-p);
 if(state==='opening'){if(g.in)continue;if(p>=g.clr||p>=1){g.in=true;uiEnter(g.ui);}else for(const m of g.ui)m.style.opacity='0';continue;}
 const c=g.clr<1?Math.max(0,(p-g.clr)/(1-g.clr)):+(p>=1),k=c*c*(3-2*c);
 g.ui.forEach((m,i)=>{const s0=g.st[i];m.style.opacity=(s0.o*k).toFixed(4);m.style.translate=(s0.x+(-UI_DX-s0.x)*(1-k)).toFixed(2)+'px 0';});}}
function asideReset(){for(const el of lefts){el.style.translate=el.style.filter='';el.inert=false;}lt=[];if(tbOff){tbOff.t.style.translate='';tbOff=null;}for(const [el] of asides)el.style.translate=el.style.opacity='';for(const m of [btn,cnt,apBtn,apRnd]){uiStop(m);m.style.opacity=m.style.translate='';}tg=[];if(hdr)hdr.style.overflowX='';}
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
 anim(from,fullBox,()=>{state='open';flow(true);fitOpen();chrome();if(window.__dbhResample)__dbhResample();fs.focus({preventScroll:true});if(openQ){const d=openQ;openQ=0;act(d);}apWait();},aside);}
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
/* AP_BUILD: the shorter wait between Logomark build steps (studio_04-studio_11, deck.cur 2-9) */
const AP_MS=500,AP_BUILD=250,AP_HOLD={[C0-1]:1000,[window.__STUDIO__.slides.length-2]:1000};let apOn=false,apT=0;
function apSet(v){apOn=!!v;clearTimeout(apT);apT=0;apBtn.setAttribute('aria-pressed',String(apOn));apBtn.classList.toggle('on',apOn);apIco.innerHTML=apOn?AP_PAUSE:AP_PLAY;
 apRnd.setAttribute('aria-pressed',String(apOn));apRnd.setAttribute('aria-label',apOn?'Pause':'Play');if(apOn){autoStop();autoAt=0;apWait();}}
function apWait(){if(!apOn)return;clearTimeout(apT);apT=0;if(state!=='open')return;if(deck.animating){apT=setTimeout(apWait,60);return;}
 if(!deck.canStep(1)){apSet(false);return;}apT=setTimeout(apFire,AP_HOLD[deck.cur]??(deck.cur>=2&&deck.cur<=9?AP_BUILD:AP_MS));}
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
  if(hadFocus)host.focus({preventScroll:true,focusVisible:false});},e=>aside(1-e));}
/* the frame's focus ring (site :focus-visible, accent orange) only when it was reached with Tab: browsers also match
   :focus-visible after programmatic focus or any key press while it is focused (Escape during the opening, arrows), which
   left an orange outline round the frame after opening and closing */
let tabAt=-1e9;addEventListener('keydown',e=>{if(e.key==='Tab')tabAt=performance.now();},true);
host.addEventListener('focus',()=>host.classList.toggle('deck-kbd',performance.now()-tabAt<500));host.addEventListener('blur',()=>host.classList.remove('deck-kbd'));
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
addEventListener('touchstart',e=>{tCtl=!!(e.target.closest&&e.target.closest('.deck-x,.deck-auto,.deck-apb,.theme-btn'));if((state!=='open'&&state!=='opening')||e.touches.length!==1||tCtl){tStart=null;return;}const t=e.touches[0];tStart={y:t.clientY,x:t.clientX,t:performance.now(),done:false};},{passive:true});
addEventListener('touchmove',e=>{if(state==='closed'||tCtl)return;e.preventDefault();if(!tStart)return;const t=e.touches[0],dy=tStart.y-t.clientY;tStart.ly=t.clientY;
 if(!tStart.done&&Math.abs(dy)>=TOUCH_PX&&Math.abs(dy)>=Math.abs(tStart.x-t.clientX)){tStart.done=true;act(dy>0?1:-1);}},{passive:false});
addEventListener('touchend',e=>{if(!tStart)return;const s=tStart;tStart=null;if(s.done)return;
 const t=e.changedTouches&&e.changedTouches[0],ey=t?t.clientY:(s.ly??s.y),dy=s.y-ey,dtm=performance.now()-s.t;
 if(Math.abs(dy)>=10&&(dtm<=300||Math.abs(dy)/Math.max(dtm,1)>=.3))act(dy>0?1:-1);},{passive:true});
addEventListener('touchcancel',()=>{tStart=null;},{passive:true});
const NEXT=['ArrowDown','PageDown','ArrowRight',' '],PREV=['ArrowUp','PageUp','ArrowLeft'];
addEventListener('keydown',e=>{if(state==='closed')return;
 if(e.key==='Escape'){e.preventDefault();close('esc');return;}
 if(e.key==='Tab'){e.preventDefault();const tb=document.querySelector('.theme-btn'),f=[btn,apBtn,apRnd,tb].filter(e=>e&&e.getClientRects().length),i=f.indexOf(document.activeElement);f[(i+(e.shiftKey?f.length-1:1))%f.length].focus();return;}
 const dir=NEXT.includes(e.key)?1:PREV.includes(e.key)?-1:0;if(!dir||e.altKey||e.ctrlKey||e.metaKey)return;
 if((e.key===' '||e.key==='Enter')&&/^(BUTTON|A)$/.test(document.activeElement&&document.activeElement.tagName))return;
 e.preventDefault();if(e.repeat||state==='closing')return;act(dir);});
btn.addEventListener('click',e=>{e.preventDefault();close('esc');});
for(const b of [apBtn,apRnd])b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(state==='open')apSet(!apOn);});
/* the container shows the current (or remembered) slide; a click, Enter or Space reopens on exactly that slide */
host.addEventListener('click',()=>{if(state==='closed')open(deck.cur);});
host.addEventListener('keydown',e=>{if(state==='closed'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(deck.cur);}});
fitClosed();deck.show(0);
window.__present={get auto(){return!!autoT;},get autoplay(){return apOn;},get apPending(){return!!apT;},get state(){return state;},deck,open,close,get armed(){return armed;},get resume(){return resume;}};})();
