/* FMSS split screen motion: the Solution 1 loop ("across ad objectives", preview/fmss-sol1) as one shared engine.
   FMSSSplit.screen(el,i,opt) fills a 375x812 phone screen element with phone i's layers (A feed -> B split screen -> C full screen ->
   B -> A) and returns its Web Animations, images and video; every phone shares one clock (T) and one pose track (POSE).
   Used by the FMSS cover animation ([data-fmss-anim], below: hero on projects/fmss.html, the homepage card, NEXT CASE STUDY cards).
   Motion, holds and layer recipe are sol1's, unchanged (see the notes inline); only the container (bezel, label, frame) is the caller's. */
(function(){"use strict";if(window.FMSSSplit)return;
/* phones (sol1 PH/MED/CS/CU): split line (B sheet top), feed (A) media height ah, split screen (B) media y/height,
   C status bar + IAB header colour (one continuous surface), bottom colour of each C screen (c1-c4 last row); url: the B sheet is an IAB
   for that domain: its header is the shared one (preview/shared/iab/header.js, loaded before this file) drawn on the sheet image's blank
   header strip, riding with the sheet on the same track as .bs */
const PHONES=[{label:'Offsite Conversions',top:406,ah:375,by:44,bh:350,cs:'#fff',cu:'#fff',url:'nike.com'},
  {label:'Lead Generation',top:406,ah:375,by:44,bh:350,cs:'#f1f2f6',cu:'#fff'},
  {label:'Business Messages',top:406,ah:375,by:44,bh:350,cs:'#fff',cu:'#ccd1d8'},
  {label:'App Installs',top:406,ah:240,by:107,bh:225,cs:'#f1f2f6',cu:'#fff'}];
/* Motion ported from the Evolution prototypes. preview/fmss-hs makeSpring() (same as fmss-cb springTo(), fmss-profile spring()):
   a critically damped spring on the sheet's top edge, a += -w²(x-target) - 2ζw·v, semi-implicit Euler with 4 substeps per 60Hz frame,
   ζ=1 (no overshoot), at rest once |x-target|<.3px and |v|<7.5px/s, then snapped to the target. ω=16 for opening from the feed and
   closing back to it, ω=18 for split ↔ full. Simulated once with the prototype's sheet stops (812, 407, 44) and pre-sampled. */
function spr(x0,tg,w){let x=x0,v=0;const o=[0],dt=1/60;for(;;){for(let i=0;i<4;i++){const h=dt/4;v+=(-w*w*(x-tg)-2*w*v)*h;x+=v*h}
  if(Math.abs(x-tg)<.3&&Math.abs(v)<7.5){o.push(1);return o}o.push((x-x0)/(tg-x0))}}
const S1=spr(812,407,16),S2=spr(407,44,18),S3=spr(44,407,18),S4=spr(407,812,16);
/* 8ms grid: each curve time-scaled to an exact length (feed <-> split 640ms, split <-> full 560ms), sampled every 8ms */
const STEP=8,rs=(S,ms)=>{const n=ms/STEP,L=S.length-1,o=[];for(let k=0;k<=n;k++){const u=k/n*L,i=Math.min(L-1,Math.floor(u)),f=u-i;o.push(k===n?1:S[i]+(S[i+1]-S[i])*f)}return o};
const R1=rs(S1,640),R2=rs(S2,560),R3=rs(S3,560),R4=rs(S4,640),dur=S=>(S.length-1)*STEP;
/* v132 holds (moved for phone 1 in v135, below): the original Solution video's (A 3800, C 3400, A 504 before the loop; B 4504) scaled ~0.81x so the loop is exactly 16000ms (transitions
   unchanged, 2400ms): A 3096, B 3664, C 2768, A 408. Both split-screen (B) holds 3664ms, long enough for the player controls to fade out
   (gone 2400ms after split screen is reached, js/video-scrubber.js) and a 1264ms beat without them; loop 16000ms */
/* v135 holds moved for phone 1's clip (v1.mp4, 15.733s, Nike 24.7): its red two-person close-up (video 7.467-8.333s, frames 224-249) must
   only ever play while full screen (C) covers the video. The clip is locked to the loop (VideoScrubber lock: 0:00 at t1e, where the cover
   enters on its still, the frame-0 poster; v138: parked, paused, through the whole C hold t2e-t3 on the frame due at t3, so it always
   leaves C on 8.49s however far its decoder lagged; a render guard hides any frame inside 7.40-8.37s), so the close-up needs t3 - t1e >= 8.6s: the feed
   gives 1000ms (3096 -> 2096) and the second split hold 760ms (3664 -> 2904) to the first split hold (+880, 4544) and full screen (+880,
   3648). Shown video: 0:00-5.0 from t1e until C covers it, 8.49 (C reveals it at t3) to the clip's own wrap back to 0:00 at the next t1e.
   Loop still exactly 16000ms, transitions unchanged; all four phones share the clock */
const B1=4544,B2=2904,t1=2096,t1e=t1+dur(R1),t2=t1e+B1,t2e=t2+dur(R2),t3=t2e+3648,t3e=t3+dur(R3),t4=t3e+B2,t4e=t4+dur(R4),T=t4e+408;
const LOCK={zero:t1e,park:[t2e,t3],avoid:[7.4,8.37]};   // phone 1's video lock (see above), the same in js/fmss-split.js and preview/fmss-sol1
/* the loop as poses: a = surface -> split progress, c = split -> full progress, one sample every 8ms inside each transition */
const POSE=(()=>{const P=[{t:0,a:0,c:0}],seg=(t0,S,f)=>S.forEach((e,k)=>P.push({t:t0+k*STEP,...f(e)}));
  seg(t1,R1,e=>({a:e,c:0}));seg(t2,R2,e=>({a:1,c:e}));seg(t3,R3,e=>({a:1,c:1-e}));seg(t4,R4,e=>({a:1-e,c:0}));P.push({t:T,a:0,c:0});return P})();
const track=fn=>POSE.map(p=>Object.assign({offset:Math.min(1,p.t/T),easing:'linear'},fn(p)));
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,e)=>a+(b-a)*e;
/* Figma corner smoothing (60%) as an SVG path */
function squircle(w,h,R,sm){
  const rad=x=>x*Math.PI/180,budget=Math.min(w,h)/2;R=Math.min(R,budget);
  let p=(1+sm)*R;const arcM=90*(1-sm),arc=Math.sin(rad(arcM/2))*R*Math.SQRT2,al=(90-arcM)/2,p34=R*Math.tan(rad(al/2)),be=45*sm;
  const c=p34*Math.cos(rad(be)),d=c*Math.tan(rad(be));let b=(p-arc-c-d)/3,a=2*b;
  if(p>budget){const m=budget-d-arc-c,minA=m/6;b=Math.min(b,m-minA);a=m-b;p=budget}
  const f=n=>+n.toFixed(3),A=f(a),AB=f(a+b),ABC=f(a+b+c),BC=f(b+c),C=f(c),Dd=f(d),S=f(arc),r=f(R);
  return `M${f(w-p)} 0c${A} 0 ${AB} 0 ${ABC} ${Dd}a${r} ${r} 0 0 1 ${S} ${S}c${Dd} ${C} ${Dd} ${BC} ${Dd} ${ABC}`+
    `L${w} ${f(h-p)}c0 ${A} 0 ${AB} ${-Dd} ${ABC}a${r} ${r} 0 0 1 ${-S} ${S}c${-C} ${Dd} ${-BC} ${Dd} ${-ABC} ${Dd}`+
    `L${f(p)} ${h}c${-A} 0 ${-AB} 0 ${-ABC} ${-Dd}a${r} ${r} 0 0 1 ${-S} ${-S}c${-Dd} ${-C} ${-Dd} ${-BC} ${-Dd} ${-ABC}`+
    `L0 ${f(p)}c0 ${-A} 0 ${-AB} ${Dd} ${-ABC}a${r} ${r} 0 0 1 ${S} ${-S}c${C} ${-Dd} ${BC} ${-Dd} ${ABC} ${-Dd}Z`;
}
const SQ=CSS.supports('clip-path','path(evenodd,"M0 0H1V1Z")');
const mvP=(d,x,y)=>d.replace(/([ML])(-?[\d.]+) (-?[\d.]+)/g,(m,c,a,b)=>c+(+(+a+x).toFixed(3))+' '+(+(+b+y).toFixed(3)));
const PATH={scr:squircle(375,812,40,.6),bezel:squircle(391,828,48,.6)};
PATH.rim=`path(evenodd,'${PATH.bezel}${mvP(squircle(372,809,38.5,.6),9.5,9.5)}')`;   // outer bezel minus the screen shape inset 1.5px
/* cover art phone (assets/cover-fmss-*.webp, measured at 2 art px per design px): circular corners, outer 56, 8px bezel, so the screen is 48
   (sol1's own phone keeps its 48/40 at 60% smoothing above). Cover rim: concentric ring from 4px inside the baked outer edge (r 52) to 1.5px
   over the screen (r 46.5), so neither the art's outer edge nor the screen corner is redrawn off-shape */
PATH.coverScr=`path('${squircle(375,812,48,0)}')`;
PATH.coverRim=`path(evenodd,'${mvP(squircle(383,820,52,0),4,4)}${mvP(squircle(372,809,46.5,0),9.5,9.5)}')`;
/* fill one 375x812 screen element with phone i (0-3). opt.base = URL of preview/fmss-sol1/assets/ (trailing slash); opt.sheetDy = extra px the B
   sheet sits lower at the split hold only (eased in with a, out with c; the B backdrop runs that much longer under it); opt.video = false to
   leave the <video> without src (caller attaches it lazily via the returned video's data-src). Layer CSS: see .fsp-* in css/card.css
   (sol1 keeps the same rules inline under its own class names). */
function screen(el,i,opt){
  const VS=window.VideoScrubber,p=PHONES[i],B=opt.base,V=opt.v||'?v=5',top=p.top,sd=opt.sheetDy||0,up=top-44,dn=812-top,n=i+1,lazy=opt.video===false;
  // bw: a white strip under everything at the split line (shows only while A is hidden, through the anti-aliased bottom row of the B
  // backdrop, whose edge meets the sheet's in the same device row; over the screen's black that row read as a dark hairline)
  el.innerHTML=`<i class="bw" style="position:absolute;left:0;width:375px;top:${top-2}px;height:${sd+4}px;background:#fff"></i>`+
    `<img class="L a" alt="" src="${B}a${n}.webp${V}">`+
    `<img class="L bt" alt="" src="${B}bu${n}.webp${V}" style="height:${top+sd}px">`+
    `<div class="mv"><video muted playsinline loop ${lazy?'preload="none" data-src':'preload="auto" src'}="${B}v${n}.mp4${V}" disableremoteplayback poster="${B}p${n}.webp${V}"></video></div>`+
    (VS?'<i class="vs-at"></i>':`<img class="L bc" alt="" src="${B}bc${n}.webp${V}" style="height:${top}px">`)+
    `<img class="L bo" alt="" src="${B}bo${n}.webp${V}" style="height:${top}px">`+
    `<img class="L bs" alt="" src="${B}bl${n}.webp${V}" style="top:${top}px;height:${dn}px">`+
    `<i class="L cu" style="background:${p.cu}"></i>`+
    `<i class="L cs" style="background:${p.cs}"></i>`+
    `<img class="L cb" alt="" src="${B}c${n}.webp${V}" style="clip-path:inset(43px 0 0 0)">`+
    `<img class="L ct" alt="" src="${B}c${n}.webp${V}" style="clip-path:inset(0 0 768px 0)">`;
  // IAB sheet: the sheet image's header strip is blank (the sheet's white, its rounded corners); the shared header draws on it
  if(p.url)el.querySelector('.bs').after(window.FMSSIABHeader({url:p.url,cls:'bhd',style:`top:${top}px;will-change:transform`}));
  if(SQ)el.style.clipPath=`path('${PATH.scr}')`;
  const q=s=>el.querySelector(s),anims=[],o={duration:T,iterations:Infinity,fill:'both'},A=(s,fn)=>anims.push(q(s).animate(track(fn),o));
  // live player controls (js/video-scrubber.js): timestamp + seekable track drawn where bc's were, its icons as a crop (ci); split screen
  // runs t1 → t3 (counted from t1e) and t3 → t4e (from t3e), and the controls fade out 2080–2400ms after it is reached
  if(VS)q('.vs-at').replaceWith(VS.create({video:q('video'),icons:`${B}ci${n}.webp${V}`,trackY:top-14,className:'L bc',
    sinceSplit:VS.loop(()=>anims[0],T,[[t1,t1e,t3],[t3,t3e,t4e]]),lock:i===0?LOCK:null}).el);
  // A: under everything; hidden while B/C sit on top so nothing of it shows through the moving sheet
  A('.a',p=>({opacity:p.a<1?1:0}));
  // B top (backdrop, nav bar) dissolves in over A; the B sheet rises from the bottom edge
  A('.bt',p=>({opacity:p.a}));A('.bo',p=>({opacity:p.a}));
  // shared element: the same playing video travels feed rect [0,216,375,ah] -> split-screen rect [12,by,351,bh]: x, y, width, height and
  // corner radius 0 -> 16 (60% smoothing) on one value, sized not scaled
  A('.mv',e=>{const a=e.a,x=lerp(0,12,a),y=lerp(216,p.by,a),w=lerp(375,351,a),h=lerp(p.ah,p.bh,a),r=16*a;
    const k={left:x.toFixed(2)+'px',top:y.toFixed(2)+'px',width:w.toFixed(2)+'px',height:h.toFixed(2)+'px'};
    if(SQ)k.clipPath=`path('${squircle(+w.toFixed(2),+h.toFixed(2),r,.6)}')`;else k.borderRadius=r.toFixed(2)+'px';
    return k});
  // player controls ride up with the media (Figma: 185px) while they fade in
  A('.bc',p=>({transform:`translateY(${(185*(1-p.a)).toFixed(2)}px)`,opacity:p.a}));
  // the B sheet is its own image (bl: b's rows from the split line down, first rows free of the backdrop's resampling bleed), laid at the
  // split line, not the full b image under a clip-path inset: no mask edge and no baked tint row to show as a hairline under the video
  // the B sheet rises from the bottom edge to the split line, then on to the top for full screen
  A('.bs',p=>({transform:`translateY(${(dn*(1-p.a)-up*p.c+sd*p.a*(1-p.c)).toFixed(2)}px)`}));
  if(p.url)A('.bhd',e=>({transform:`translateY(${(dn*(1-e.a)-up*e.c+sd*e.a*(1-e.c)).toFixed(2)}px)`}));   // its header rides with it
  // C content expands up out of the sheet position and dissolves in over it; C status bar dissolves in
  A('.cs',p=>({transform:`translateY(${(up*(1-p.c)).toFixed(2)}px)`,opacity:p.c>=.99?1:0}));
  A('.cu',p=>({transform:`translateY(${(up*(1-p.c)).toFixed(2)}px)`,opacity:p.c>=.6?1:0}));
  A('.cb',p=>({transform:`translateY(${(up*(1-p.c)).toFixed(2)}px)`,opacity:clamp(p.c/.6)}));
  A('.ct',p=>({opacity:p.c}));
  anims.forEach(a=>{a.pause();a.currentTime=0});
  return {anims,imgs:[...el.querySelectorAll('img')],video:q('video')};
}
window.FMSSSplit={PHONES,POSE,T,STEP,marks:{t1,t1e,t2,t2e,t3,t3e,t4,t4e},squircle,PATH,SQ,screen};

/* ---- FMSS cover animation: [data-fmss-anim] over the FMSS cover (hero, homepage card, NEXT CASE STUDY card) ----
   The element paints the cover art itself (CSS background, the light-mode file in both themes: black phone on the orange gradient,
   never theme-swapped) and lays phone 1 (Offsite Conversions, the hero's Nike screen) over the phone screen baked into that art, with
   the same black inner rim sol1 draws, so only the screen content moves. The art: data-art "W H x y" = art size and the screen's
   top-left in art px (2 art px per design px). Positioned like the CSS background (cover, data-pos "x y" as fractions). */
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const ART_BASE=(document.currentScript&&document.currentScript.src)||location.href;
function mount(host){
  if(host.__fsp)return;host.__fsp=1;
  const [W,H,SX,SY]=host.dataset.art.split(/\s+/).map(Number),[PX,PY]=(host.dataset.pos||'.5 .5').split(/\s+/).map(Number);
  const ph=document.createElement('span');ph.className='fsp-ph';
  const scr=document.createElement('span');scr.className='fsp-scr';
  const rim=document.createElement('span');rim.className='fsp-rim';if(SQ)rim.style.clipPath=PATH.coverRim;
  ph.append(scr,rim);host.appendChild(ph);
  // the cover's split line is 1px lower than sol1's (407 vs 406: the prototype's sheet stop), so the still and the B hold line up
  const r=screen(scr,0,{base:new URL('../preview/fmss-sol1/assets/',ART_BASE).href,video:false,sheetDy:1}),v=r.video;
  if(SQ)scr.style.clipPath=PATH.coverScr;   // the art's screen shape, not sol1's
  // B hold: the hero art is the split screen, so the loop enters there (sol1 t1e) and the first moving frame is the still
  r.anims.forEach(a=>a.currentTime=t1e);
  // fit: same maths as background-size:cover + background-position; layout sizes (offsetWidth) so the home strip's scale is ignored
  const fit=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const s=Math.max(w/W,h/H),ox=(w-W*s)*PX,oy=(h-H*s)*PY;
    ph.style.transform=`translate(${(ox+(SX-16)*s).toFixed(3)}px,${(oy+(SY-16)*s).toFixed(3)}px) scale(${(2*s).toFixed(5)})`};
  new ResizeObserver(fit).observe(host);fit();
  let seen=false,near=false,ready=false;
  const upd=()=>{
    if(near&&!RM.matches&&v.dataset.src){v.preload='auto';v.src=v.dataset.src;delete v.dataset.src}
    const go=ready&&seen&&!document.hidden&&!RM.matches;
    host.classList.toggle('on',ready&&!RM.matches);
    if(RM.matches&&ready){r.anims.forEach(a=>{a.pause();a.currentTime=t1e});if(!v.paused)v.pause();return}
    r.anims.forEach(a=>{if(go){if(a.playState!=='running')a.play()}else if(a.playState==='running')a.pause()});
    if(go){if(v.paused&&v.src){const p=v.play();p&&p.catch(()=>{})}}else if(!v.paused)v.pause();
  };
  new IntersectionObserver(es=>{const e=es[es.length-1];near=e.isIntersecting;upd()},{rootMargin:'400px'}).observe(host);
  new IntersectionObserver(es=>{seen=es[es.length-1].isIntersecting;upd()},{threshold:.1}).observe(host);
  document.addEventListener('visibilitychange',upd);
  RM.addEventListener&&RM.addEventListener('change',upd);
  // first show only once every layer is decoded (no partial screen); video plays from its poster
  let started=false;const start=()=>{if(started)return;started=true;
    Promise.all(r.imgs.map(im=>im.decode?im.decode().catch(()=>{}):Promise.resolve())).then(()=>{ready=true;upd()})};
  new IntersectionObserver((es,o)=>{if(es[es.length-1].isIntersecting){o.disconnect();start()}},{rootMargin:'400px'}).observe(host);
}
const all=()=>document.querySelectorAll('[data-fmss-anim]').forEach(mount);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',all);else all();
})();
