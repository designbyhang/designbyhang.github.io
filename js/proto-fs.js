/* Case-page prototypes (projects/fmss.html 08 Evolution: .proto-fig .media.proto iframe[data-src], css/proto-fs.css; other embeds are untouched): inline they only autoplay (?inline=1;
   the frame takes no input, a click target covers it); a click/tap opens a full-screen view the way the Studio presentation does
   (projects/studio-present.js), on the shared full-screen motion (js/fs-motion.js window.dbhFS): the frame grows from its inline
   spot to the viewport over DUR 648ms on the deck's ease (cubic-bezier(.8,0,.2,1), projects/studio-deck.js easeStep); the header's logo/label slide out left and BACK (and the section menu)
   slide out right on the same progress; "× CLOSE" (BACK's markup) and the theme toggle join a top layer, CLOSE slides 16px in while
   fading over 448ms, cubic-bezier(.2,.8,.2,1), 40ms stagger, once BACK has passed it; Escape / CLOSE collapse it back into place in
   reverse. Page scroll is locked (html.deck-lock, theme.js paints the stage colour), solid .deck-edge strips once open.
   Differences from the deck, both forced by the iframe: the SAME iframe is lifted (position:fixed, no DOM move = no reload) and
   grown with transform only (FLIP; the panel behind it too), so no layout runs per frame; and the page is never display:none'd
   (Studio's html.deck-flow), since that would hide the lifted iframe. In full screen (html.embed-full in the prototype) it is fully
   interactive and never autoplays: the prototype itself lands on its clean start when html.embed-full is set.
   Under the device: the instruction (window.dbhIns, js/case.js; css .fs-ins), 40px below the device frame, at most 375px wide; the
   device shrinks (375x812 cap kept) so device + gap + text fit the probe box, the group centred in it. It enters with CLOSE (the
   chrome's onIn) and fades on close; it lives in the .fsx-bg layer, under the lifted iframe. Not shown inline.
   Refresh: open writes ?fs=<prototype> (window.dbhView, js/hang-egg.js), close clears it; a load carrying it reopens that prototype
   with no expansion (snap: CLOSE and the page chrome at their end state), the page under it at the prototype, the device on its clean
   start (no autoplay in full screen); the instruction then plays its entrance once restored.
   Phones (<=640px) keep js/case.js's own full screen (.proto-open + window.dbhLayer, with the landscape message): this one is desktop/tablet;
   both grow from and shrink back to the inline frame on the same dbhFS timeline. */
(()=>{const ms=[...document.querySelectorAll('.proto-fig .media.proto')].filter(m=>m.querySelector('iframe'));if(!ms.length)return;
const de=document.documentElement,body=document.body,rm=matchMedia('(prefers-reduced-motion: reduce)');
const phoneMq=matchMedia('(max-width:640px)');
/* motion: Studio's, from the shared foundation (js/fs-motion.js) */
const FS=window.dbhFS,lerp=FS.lerp;
/* layers */
const bg=document.createElement('div');bg.className='fsx-bg';bg.hidden=true;
bg.innerHTML='<i class="fsx-panel" aria-hidden="true"></i><i class="deck-edge deck-edge-t" aria-hidden="true"></i><i class="deck-edge deck-edge-b" aria-hidden="true"></i><i class="fsx-probe" aria-hidden="true"></i>';
const panel=bg.firstChild;const probe=bg.querySelector('.fsx-probe'),MAXH=828;
const fs=document.createElement('div');fs.className='deck-fs fsx';fs.hidden=true;fs.tabIndex=-1;fs.setAttribute('role','dialog');fs.setAttribute('aria-modal','true');
fs.innerHTML='<div class="bar deck-bar"><nav class="bar-right" aria-label="Prototype"><a class="ax deck-x" href="#evolution" role="button" aria-label="Close prototype"><span class="arr arr-back" aria-hidden="true"><svg viewBox="0 0 20 16" fill="none"><path d="M2 0L18 16M18 0L2 16"/></svg></span><span class="t">CLOSE</span></a></nav></div>';
const DI=window.dbhIns;bg.insertAdjacentHTML('beforeend',DI.html());const ins=bg.lastChild,insS=ins.firstChild; /* under the iframe */
const keyOf=f=>DI.key(f.getAttribute('src')||f.getAttribute('data-src')),I=DI.make(()=>ins);
const onTap=e=>{if(cur)I.tap(e,keyOf(cur.f));};
addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='proto-state'||!cur||e.source!==cur.f.contentWindow||(state!=='open'&&state!=='opening'))return;I.state(d.home);});
body.append(bg,fs);
const btn=fs.querySelector('.deck-x');
let state='closed',cur=null,tw=null,P=0,G=null,snap=false;
const vw=()=>fs.clientWidth||innerWidth,vh=()=>fs.clientHeight||innerHeight;
/* scroll lock + iOS viewport-fit, as Studio lock()/unlock() */
const vpm=document.querySelector('meta[name=viewport]'),vp0=vpm&&vpm.content;
/* while open: no selection or drag on the page (CSS html.deck-lock + these), and any selection cleared on open and close */
const noSel=e=>{if(state!=='closed')e.preventDefault();},clearSel=()=>{try{getSelection().removeAllRanges();}catch(_){}};
addEventListener('selectstart',noSel,true);addEventListener('dragstart',noSel,true);
function lock(){if(vpm&&!/viewport-fit/.test(vp0))vpm.content=vp0+', viewport-fit=cover';de.classList.add('deck-lock');clearSel();}
function unlock(){de.classList.remove('deck-lock');if(vpm)vpm.content=vp0;clearSel();}
/* theme toggle joins the top layer while open (Studio adoptToggle/releaseToggle) */
let tb=null,tbHome=null,tbNext=null;
function adoptToggle(){const b=document.querySelector('.theme-btn');if(!b||b.parentNode===fs)return;tb=b;tbHome=b.parentNode;tbNext=b.nextSibling;fs.appendChild(b);}
function releaseToggle(){if(!tb||tb.parentNode!==fs)return;if(tbNext&&tbNext.parentNode===tbHome)tbHome.insertBefore(tb,tbNext);else tbHome.appendChild(tb);}
/* page chrome slides out on the expand's progress; CLOSE enters once BACK has passed it (the shared Studio chrome, js/fs-motion.js;
   none of the deck's counter / AUTO SCROLL / landscape toggle offset here); the instruction starts its entrance with CLOSE */
const hdr=document.querySelector('body>.bar');
const ch=FS.chrome({hdr,asides:[[document.querySelector('.toc'),null],[document.querySelector('body>.bar .bar-right a'),btn]],lefts:[hdr&&hdr.querySelector('.brand'),document.getElementById('bar-mid')],
 opening:()=>state==='opening',instant:()=>snap,onIn:g=>{if(g.mate===btn)I.enter();}});
const asideMeasure=()=>{if(state==='closing')I.exit();ch.measure();},aside=p=>ch.set(p),asideReset=()=>ch.reset();
/* prototype plumbing, as js/case.js */
const doc=f=>{try{return f.contentDocument&&f.contentDocument.documentElement}catch(_){return null}};
const full=(f,on)=>{const d=doc(f);if(d&&d.classList.contains('embed'))d.classList.toggle('embed-full',on)};
/* full screen pads the prototype's own frame inside a full-viewport iframe (style injected into the same-origin prototype
   document while lifted): the device box gets the 64px margins and the 375x812 cap, and the transparent
   iframe around it leaves room for the device's drop-shadow, so it never ends on the iframe edge */
const PAD_CSS='html.fsx-pad .wrap{padding:var(--fsx-t,0px) 0 0!important}html.fsx-pad .mframe{height:var(--fsx-h,100vh)!important;overflow:visible!important;contain:none!important}';
const pad=(f,on,t,h)=>{const d=doc(f);if(!d)return;const D=d.ownerDocument;
 if(on&&!D.getElementById('fsx-pad-css')){const st=D.createElement('style');st.id='fsx-pad-css';st.textContent=PAD_CSS;(D.head||d).appendChild(st);}
 if(on&&t!=null){d.style.setProperty('--fsx-t',t+'px');d.style.setProperty('--fsx-h',h+'px');}
 if(!on){d.style.removeProperty('--fsx-t');d.style.removeProperty('--fsx-h');}d.classList.toggle('fsx-pad',on);};
const escKey=e=>{if(e.key==='Escape'&&state!=='closed'){e.preventDefault();e.stopPropagation();close();}};
let win=null;function hook(f){let w=null;try{w=f&&f.contentWindow}catch(_){}if(w===win)return;if(win)try{win.removeEventListener('keydown',escKey,true);win.removeEventListener('click',onTap,true)}catch(_){}win=w;if(w)try{w.addEventListener('keydown',escKey,true);w.addEventListener('click',onTap,true)}catch(_){}}
/* geometry. Device scale inside the prototype (its fit(): screen 375x812 + 8px bezel): inline vs full screen; the device is centred in
   its frame both ways, so mapping the device = mapping the frame centres plus a uniform scale. Full screen width term 531 = 391 bezel + 2x70:
   the bezel's drop-shadow (40px right + 20px blur) fades out inside the viewport on both sides, never cut at the screen edge */
const sInline=(w,h)=>{const pad=w<=640?24:40;return Math.min((h-pad*2)/828,(w-pad*2)/431);},sFull=(w,h)=>Math.min(h/828,w/531);
const sNow=f=>{const d=doc(f),st=d&&d.querySelector('.stage'),v=st&&parseFloat(st.style.getPropertyValue('--s'));return v>0?v:0;};
const hostBox=m=>{const r=m.getBoundingClientRect(),b=m.clientLeft||0;return{x:r.left+b,y:r.top+b,w:m.clientWidth,h:m.clientHeight};};
/* the prototype document keeps a scrollbar gutter (html scrollbar-gutter:stable), so its device centre sits gx/gy px off the
   iframe centre, the same px inline and full screen: read once, inline, before lifting (mid-resize it reads 0) */
const gut=f=>{const e=doc(f),b=e&&e.ownerDocument.body;return b&&e?{x:(b.clientWidth-e.clientWidth)/2,y:(b.clientHeight-e.clientHeight)/2}:{x:0,y:0};};
/* one frame at progress p (0 inline .. 1 full): reads first, then transform-only writes */
function render(p,fresh){const {m,f}=cur;if(fresh||state==='closing')G.A=hostBox(m);const A=G.A,F=G.F,W=G.W,H=G.H;
 panel.style.transform=FS.rectXf(A,W,H,p);const g=G.g,o=G.o,fx=F.left+F.width/2,fy=F.top+F.height/2;
 f.style.transform=FS.devXf(F,{x:A.x+A.w/2+g.x,y:A.y+A.h/2+g.y},{x:fx+o.x,y:fy+o.y},G.s0/G.s1,p);}
function measure(){const {m,f}=cur;G.W=vw();G.H=vh();panel.style.width=G.W+'px';panel.style.height=G.H+'px';f.style.width='';G.F=f.getBoundingClientRect();if(!G.g)G.g=gut(f);
 /* device box: the probe's 64px (56 on phones) + safe-area margins; capped at the native 828 (375x812 screen + 8px bezel), so
    --s never exceeds 1 (no upscaled raster); whole px so the 1:1 screen lands on the pixel grid */
 const q=probe.getBoundingClientRect(),av=Math.max(0,q.bottom-q.top);
 /* the instruction below it: 40px gap + its wrapped height come off the box; the device box is then exactly the device (its width
    limit included) and device + gap + text are centred together (not tied to the theme toggle on desktop) */
 const iw=Math.max(0,Math.min(375,G.W-32));ins.style.width=iw+'px';const T=insS.textContent?insS.offsetHeight:0,gap=T?40:0;
 const sw=Math.min(1,(G.F.width-2*Math.abs(G.g.x))/531),bh=Math.max(0,Math.floor(Math.min(av-gap-T,MAXH,828*sw))),bt=Math.round(q.top+(av-bh-gap-T)/2);
 ins.style.top=(bt+bh)+'px';ins.style.paddingTop=gap+'px'; /* the box starts at the device's bottom edge */
 pad(f,true,bt,bh);G.s1=Math.min(1,sFull(G.F.width-2*Math.abs(G.g.x),bh));
 /* at 1:1 the 375px screen sits at (frame width)/2 - 187.5: when that lands on a half px, narrow the iframe by 1px so the
    screen is pixel-aligned (crisp, not resampled) */
 if(G.s1>=1){const sx=G.F.left+(G.F.width-2*Math.abs(G.g.x))/2-187.5;if(Math.abs(sx-Math.round(sx))>.25){f.style.width=(G.F.width-1)+'px';G.F=f.getBoundingClientRect();}}G.o={x:G.g.x,y:bt+bh/2-(G.F.top+G.F.height/2)+G.g.y};
 ins.style.left=(G.F.left+G.F.width/2+G.g.x-iw/2).toFixed(2)+'px';} /* centred on the device (the prototype's own gutter offset included) */
function anim(p0,p1,done,side){if(tw)tw.cancel();tw=FS.tween(p0,p1,p=>{P=p;side(P);render(P);},()=>{tw=null;done();},snap);}
function open(m,now){if(state!=='closed'||phoneMq.matches)return;const f=m.querySelector('iframe'),b=m.querySelector('.fsx-open');snap=!!now;
 f.setAttribute('data-keep','');if(f.hasAttribute('data-src')){f.src=f.getAttribute('data-src');f.removeAttribute('data-src');}
 {const g=m.closest('.fx');if(g&&!g.classList.contains('in')){g.style.transition='none';g.classList.add('in');void g.offsetWidth;g.style.transition='';}} /* unrevealed .fx (opacity 0 + transform) would hide the lifted iframe and pin it to the page */
 const k=keyOf(f);if(k&&window.dbhView)dbhView.set(k);I.reset();insS.textContent=k?DI.TEXT[k]:'';cur={m,f,b};const A=hostBox(m),g0=gut(f);G={A,g:g0,s0:sNow(f)||sInline(A.w-2*Math.abs(g0.x),A.h-2*Math.abs(g0.y))};
 lock();state='opening';de.classList.add('deck-open');fs.setAttribute('aria-label',(f.getAttribute('title')||'Prototype').replace(/, interactive prototype$/,'')+', full screen');
 bg.hidden=fs.hidden=false;bg.classList.remove('is-open','is-closing');adoptToggle();
 f.classList.add('fsx-lift','fsx-anim');pad(f,true);full(f,true);hook(f);f.addEventListener('load',onLoad);measure();render(0,true);
 I.hide();asideMeasure();aside(0);
 anim(0,1,()=>{state='open';snap=false;f.classList.remove('fsx-anim');I.settle(); /* no header BACK to trigger it: at the end */bg.classList.add('is-open');if(window.__dbhResample)__dbhResample();fs.focus({preventScroll:true});},aside);}
function onLoad(){if(!cur)return;const f=cur.f;if(G){G.g=gut(f);measure();}full(f,true);hook(f);}
function close(){if(state!=='open'&&state!=='opening')return;const {m,f,b}=cur,p0=P;snap=false;if(window.dbhView)dbhView.set(null);
 state='closing';fs.classList.add('is-closing');bg.classList.add('is-closing');bg.classList.remove('is-open');f.classList.add('fsx-anim');asideMeasure();aside(p0);unlock();
 anim(p0,0,()=>{const hadFocus=fs.contains(document.activeElement)||document.activeElement===f;
  f.removeEventListener('load',onLoad);hook(null);f.classList.remove('fsx-lift','fsx-anim');f.removeAttribute('data-keep');f.style.transform='';f.style.width='';full(f,false);pad(f,false);
  panel.style.transform='';releaseToggle();asideReset();bg.hidden=fs.hidden=true;fs.classList.remove('is-closing');bg.classList.remove('is-closing');
  state='closed';de.classList.remove('deck-open');cur=null;G=null;P=0;if(window.__dbhResample)__dbhResample();
  if(hadFocus&&b)b.focus({preventScroll:true,focusVisible:false});},aside);}
addEventListener('resize',()=>{if(!cur||state==='closed')return;measure();render(P,true);});
/* inline click/tap targets */
for(const m of ms){const f=m.querySelector('iframe'),b=document.createElement('button');b.type='button';b.className='fsx-open';
 b.setAttribute('aria-label','Open '+(f.getAttribute('title')||'Prototype').replace(/, interactive prototype$/,'')+' full screen');b.setAttribute('aria-haspopup','dialog');
 b.addEventListener('click',e=>{e.preventDefault();open(m);});m.appendChild(b);}
btn.addEventListener('click',e=>{e.preventDefault();close();});
/* refresh restore (wider than phones): the prototype named by ?fs=, the page scrolled to it, then open at its end state */
if(window.dbhView)dbhView.when(()=>{const v=dbhView.get(),m=v&&ms.find(m=>keyOf(m.querySelector('iframe'))===v);if(!m||phoneMq.matches||state!=='closed')return;
 m.scrollIntoView({block:'center',behavior:'instant'});open(m,true);});
/* keys (Studio): Esc closes; Tab cycles CLOSE, the toggle and the prototype */
addEventListener('keydown',e=>{if(state==='closed')return;
 if(e.key==='Escape'){e.preventDefault();close();return;}
 if(e.key==='Tab'&&cur){e.preventDefault();const t=document.querySelector('.theme-btn'),l=[btn,t,cur.f].filter(x=>x&&x.getClientRects().length),i=l.indexOf(document.activeElement);l[(i+(e.shiftKey?l.length-1:1))%l.length].focus();}});
/* no page scrolling under the layer (gestures inside the prototype go to its own document) */
addEventListener('wheel',e=>{if(state!=='closed')e.preventDefault();},{passive:false});
addEventListener('touchmove',e=>{if(state==='closed')return;if(e.target.closest&&e.target.closest('.deck-x,.theme-btn'))return;e.preventDefault();},{passive:false});
})();
