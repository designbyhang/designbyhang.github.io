/* Device cover: the shared foundation for animated case-study covers (the case-page hero only:
   homepage and NEXT CASE STUDY cards show the still cover art, no demo).
   A cover is the project's cover art (black phone on the project gradient, the same file in light and dark mode) with a live phone screen
   laid exactly over the screen baked into the art, on a black bezel fill under it (the Evolution prototypes' frame setup), so only the screen content moves.
   Markup: <span class="cover-anim" data-cover-anim="NAME" data-art="W H x y" [data-pos="x y"] aria-hidden="true"></span>
     data-art: the art's size and the screen's top-left, in art px (2 art px per design px); data-pos: CSS background-position as fractions.
   A project registers its player once: DeviceCover.register(NAME,{T,rest,build(screenEl)->{anims,imgs,video?,videos?,frame?}}); the player owns
   what is on the screen, this module owns the frame, fit, start, pause and reduced motion. video / videos: the screen's <video>s (data-src,
   loaded once the cover is near, played and paused with the demo; a player's VideoScrubber lock parks the ones it covers). frame: an
   optional per-display-frame painter (a canvas layer drawn from a video), called only while the demo runs.
   Scripted touches: DeviceCover.finger() is the touch marker (the Evolution prototypes' autoplay finger, as VideoScrubber's demo tap
   .vs-m: 44px grey disc, white ring) and DeviceCover.touch(T,gestures) its loop keyframes, so a demo shows the taps and swipes it plays. Players: js/vac-chain.js (vac). FMSS (js/fmss-split.js, [data-fmss-anim]) still mounts
   itself with the same frame, fit and helpers; it moves onto this module once its in-flight changes land (the frame CSS mirrors .fsp-*).
   Shared motion helpers (spring, 8ms resampling, squircle) live here too so every cover moves the same way. */
(function(){"use strict";if(window.DeviceCover)return;
/* Critically damped spring, ported from the Evolution prototypes (preview/fmss-hs makeSpring(), fmss-cb springTo(), fmss-profile spring()):
   a += -w²(x-target) - 2ζw·v, semi-implicit Euler with 4 substeps per 60Hz frame, ζ=1 (no overshoot), at rest once |x-target|<.3px and
   |v|<7.5px/s, then snapped to the target. v0 (px/s) = the velocity it is released with (a finger lifting mid-swipe); 0 = from rest.
   Returns progress 0→1 per 60Hz frame. */
function spring(x0,tg,w,v0){let x=x0,v=v0||0;const o=[0],dt=1/60;for(;;){for(let i=0;i<4;i++){const h=dt/4;v+=(-w*w*(x-tg)-2*w*v)*h;x+=v*h}
  if(Math.abs(x-tg)<.3&&Math.abs(v)<7.5){o.push(1);return o}o.push((x-x0)/(tg-x0))}}
/* 8ms grid: a curve time-scaled to an exact length (a multiple of 8ms) and sampled every 8ms */
const STEP=8,resample=(S,ms)=>{const n=ms/STEP,L=S.length-1,o=[];for(let k=0;k<=n;k++){const u=k/n*L,i=Math.min(L-1,Math.floor(u)),f=u-i;o.push(k===n?1:S[i]+(S[i+1]-S[i])*f)}return o};
/* Figma corner smoothing (sm 0–1) as an SVG path */
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
/* cover art phone (assets/cover-*.webp, one template for every project, measured at 2 art px per design px): circular corners, outer 56,
   8px bezel, so the screen is 375x812 at 48. Bezel: as the Evolution prototypes' .bezel-fill, a solid black shape UNDER the screen (from
   4px inside the baked outer edge, r 52), so the screen's anti-aliased edge meets black and nothing is drawn over the screen */
const PATH={coverScr:`path('${squircle(375,812,48,0)}')`,
  coverBezel:`path('${mvP(squircle(383,820,52,0),4,4)}')`};
/* WAAPI keyframes from timed samples [{t, ...props}] over a loop of T ms (linear between 8ms samples). A sample whose values equal both
   neighbours' is dropped (linear between equal values = the same frames): a layer keeps keyframes only where it moves. WebKit re-processes
   every keyframe of its accelerated (transform/opacity) animations, paused or not, on every scrolled frame */
const track=(P,T,fn)=>{const K=P.map(p=>Object.assign({offset:Math.min(1,p.t/T),easing:'linear'},fn(p))),
  S=k=>JSON.stringify(k,(n,v)=>n==='offset'?void 0:v),V=K.map(S);
  return K.filter((k,i)=>i===0||i===K.length-1||V[i]!==V[i-1]||V[i]!==V[i+1])};
/* touch marker keyframes over a loop of T ms. gestures: [{t, x, y, dx?, dy?, move?, ease?}]: the finger lands at x,y (design px) at t, moves
   dx,dy over `move` ms (0 = a tap; ease(u) shapes it, default ease-in u², a drag gathering speed before its release) and lifts at t+move.
   Envelope (VideoScrubber's demo tap): fades in over 240ms to t-160, presses (scale .85) over 160ms to t, releases over 120ms after the
   lift, fades out over the next 280ms. Sampled on the 8ms grid, linear between, ease-out curves; the gaps between gestures are hidden. */
const eo=u=>1-(1-u)*(1-u)*(1-u);
function touch(T,G){const K=[],put=(t,o,x,y,s)=>K.push({t,o,x,y,s});
  G.slice().sort((a,b)=>a.t-b.t).forEach(g=>{const m=g.move||0,dx=g.dx||0,dy=g.dy||0,ez=g.ease||(u=>u*u),d=g.t,u=d+m;
    for(let t=d-400;t<=u+400;t+=STEP){let o,s,k=0;
      if(t<d-160){o=eo((t-d+400)/240);s=1}else if(t<d){o=1;s=1-.15*eo((t-d+160)/160)}
      else if(t<=u){o=1;s=.85;k=m?ez((t-d)/m):0}else{k=1;const r=t-u;s=r<120?.85+.15*eo(r/120):1;o=r<=120?1:1-eo((r-120)/280)}
      put(t,o,g.x+dx*k,g.y+dy*k,s)}});
  K.sort((a,b)=>a.t-b.t);const out=[{offset:0,opacity:0,transform:'translate(-200px,-200px)',easing:'linear'}];
  K.forEach((k,i)=>{const t=((k.t%T)+T)%T,f=(x,n)=>x.toFixed(n);
    out.push({offset:t/T,opacity:+f(.9*k.o,3),transform:`translate(${f(k.x-22,2)}px,${f(k.y-22,2)}px) scale(${f(k.s,3)})`,easing:'linear'})});
  out.sort((a,b)=>a.offset-b.offset);out.push({offset:1,opacity:0,transform:'translate(-200px,-200px)',easing:'linear'});
  // hidden between gestures: each gesture's first and last key fall to 0 opacity in place (they already do: o=0 at both ends)
  return out}
const finger=()=>{const f=document.createElement('i');f.className='cv-touch';f.setAttribute('aria-hidden','true');return f};

const RM=matchMedia('(prefers-reduced-motion: reduce)');
const players={};
/* mount one cover host with its project's player */
function mount(host){
  if(host.__cv)return;const P=players[host.dataset.coverAnim];if(!P)return;host.__cv=1;
  const [W,H,SX,SY]=host.dataset.art.split(/\s+/).map(Number),[PX,PY]=(host.dataset.pos||'.5 .5').split(/\s+/).map(Number);
  const ph=document.createElement('span');ph.className='cv-ph';
  const scr=document.createElement('span');scr.className='cv-scr';
  const bz=document.createElement('span');bz.className='cv-bz';if(SQ)bz.style.clipPath=PATH.coverBezel;
  ph.append(bz,scr);host.appendChild(ph);
  const r=P.build(scr),vids=(r.videos||[]).concat(r.video&&!(r.videos||[]).includes(r.video)?[r.video]:[]),rest=P.rest||0;
  if(SQ)scr.style.clipPath=PATH.coverScr;   // the art's screen shape
  // the loop enters at the player's rest time: the frame that matches the still art, so the first moving frame is the cover
  r.anims.forEach(a=>a.currentTime=rest);
  // fit: same maths as background-size:cover + background-position; layout sizes (offsetWidth) so the home strip's scale is ignored
  const fit=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const s=Math.max(w/W,h/H),ox=(w-W*s)*PX,oy=(h-H*s)*PY;
    ph.style.transform=`translate(${(ox+(SX-16)*s).toFixed(3)}px,${(oy+(SY-16)*s).toFixed(3)}px) scale(${(2*s).toFixed(5)})`};
  new ResizeObserver(fit).observe(host);fit();
  // on: the site's one-demo-at-a-time pool (js/demos.js) gives this cover the turn (no pool on the page = always)
  let seen=false,near=false,ready=false,on=!window.dbhDemos;
  if(window.dbhDemos)window.dbhDemos.add(host,{play:()=>{on=true;upd()},pause:()=>{on=false;upd()}});
  let fr=0;const paint=()=>{fr=requestAnimationFrame(paint);r.frame()};   // the player's per-frame painter, only while the demo runs
  const upd=()=>{
    if(near&&!RM.matches)vids.forEach(v=>{if(v.dataset.src){v.preload='auto';v.src=v.dataset.src;delete v.dataset.src}});
    const go=ready&&seen&&on&&!document.hidden&&!RM.matches;
    host.classList.toggle('on',ready&&!RM.matches);
    if(RM.matches&&ready){r.anims.forEach(a=>{a.pause();a.currentTime=rest});vids.forEach(v=>{if(!v.paused)v.pause()});return}
    r.anims.forEach(a=>{if(go){if(a.playState!=='running')a.play()}else if(a.playState==='running')a.pause()});
    vids.forEach(v=>{if(go){if(v.paused&&v.src){const p=v.play();p&&p.catch(()=>{})}}else if(!v.paused)v.pause()});
    if(r.frame){if(go&&!fr)fr=requestAnimationFrame(paint);else if(!go&&fr){cancelAnimationFrame(fr);fr=0}}
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
const scan=name=>document.querySelectorAll(`[data-cover-anim="${name}"]`).forEach(mount);
function register(name,player){players[name]=player;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(name));else scan(name)}
/* asset base for a player script: call with document.currentScript while the script runs */
const base=(script,rel)=>new URL(rel,(script&&script.src)||location.href).href;
window.DeviceCover={STEP,spring,resample,squircle,SQ,mvP,PATH,track,touch,finger,register,mount,base};
})();
