/* Squircle: Figma corner smoothing (60%) on every rounded corner of the site, from one place.
   Squircle.path(w,h,R,sm) is the Figma-style smoothed rounded rect as an SVG path (port of figma-squircle, after Figma's "Desperately
   seeking squircles"; moved here from js/fmss-split.js unchanged, which uses it for the FMSS phones). Squircle.pathR takes per-corner
   radii [tl,tr,br,bl] (the same string as path() when they are all equal).
   Auto mode: every element with a border-radius (stylesheet or inline, present at load or added later, resized, or animated by script)
   is drawn with 60% smoothing at the radius it already has. No per-element rules; CSS keeps the plain border-radius as the fallback.
   - 'shape' (corner-shape: superellipse() supported, Chromium 139+): the element keeps its own box, borders, shadows, outlines and overflow
     clip; only the corner curve changes: inline corner-shape:superellipse(K) and each radius x F. K/F were fitted against path() at
     r 12/24/48 (rendered and overlaid): max deviation ~1/8px at r24, ~1/4px at r48 (a plain circle is 3/8 and 5/8px off).
     Pseudo-elements whose radius is inherit get corner-shape from a [data-sq-pe] rule (their radius inherits the scaled value).
     Page-size containers (taller than 2 screens, e.g. main.sheet) get the backdrop tiles below instead: a non-circular corner on a
     box that holds the whole page makes the compositor redraw all of it through a mask on every scrolled frame (scroll stutter).
   - 'clip' (Safari, Firefox; any browser with clip-path:path()): a clip-path from path(), sized by a ResizeObserver. It never cuts a box-
     shadow or an outer ring: elements that cast a shadow only lose the thin slivers between their circular corner and the smoothed one
     (a pure spread ring, e.g. a phone bezel, is smoothed on its own outer edge instead). A ::before/::after border ring that inherits the
     radius (VAC phone outlines) is redrawn as a smoothed ring ([data-sq-ring]). Page-size containers and anything holding an <iframe>
     (live prototypes lift out of the sheet to full screen as position:fixed; a clip-path would clip and re-stack them) get no clip:
     their four corner slivers are painted over in the backdrop colour instead (background tiles, [data-sq-bd]).
   Left alone everywhere: pills and circles (radius >= half the short side: smoothing is a no-op there), elements that already carry
   their own clip-path (FMSS phone screens and bezels, prototype media: they are shaped by path() directly), SVG, [data-sq-off].
   Scans run once at DOMContentLoaded, then only for added nodes (one batch per frame), resizes (ResizeObserver) and inline style writes
   on tracked elements (MutationObserver); writes are batched after reads (no layout thrash). ?sq=off|clip|shape (kept for the session)
   forces a mode for comparison. */
(function(){"use strict";if(window.Squircle)return;
const SM=.6,F=1.18,K=1.3,KS=`superellipse(${K})`;
/* Figma corner smoothing as an SVG path (sm 0..1; .6 = Figma 60%) */
function path(w,h,R,sm){
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
const f3=n=>+n.toFixed(3);
/* one corner's numbers (same maths as path()) */
function cp(R,sm,budget){
  const rad=x=>x*Math.PI/180;R=Math.max(0,Math.min(R,budget));
  let p=(1+sm)*R;const arcM=90*(1-sm),arc=Math.sin(rad(arcM/2))*R*Math.SQRT2,al=(90-arcM)/2,p34=R*Math.tan(rad(al/2)),be=45*sm;
  const c=p34*Math.cos(rad(be)),d=c*Math.tan(rad(be));let b=(p-arc-c-d)/3,a=2*b;
  if(p>budget){const m=budget-d-arc-c,minA=m/6;b=Math.min(b,m-minA);a=m-b;p=budget}
  return {R:f3(R),p:f3(p),A:f3(a),AB:f3(a+b),ABC:f3(a+b+c),BC:f3(b+c),C:f3(c),D:f3(d),S:f3(arc)};
}
/* the smoothed curve of each corner, relative, from its start on one edge to the next edge (clockwise from top right) */
const SEG=[
  q=>`c0 ${-q.A} 0 ${-q.AB} ${q.D} ${-q.ABC}a${q.R} ${q.R} 0 0 1 ${q.S} ${-q.S}c${q.C} ${-q.D} ${q.BC} ${-q.D} ${q.ABC} ${-q.D}`,      // tl: (0,p) -> (p,0)
  q=>`c${q.A} 0 ${q.AB} 0 ${q.ABC} ${q.D}a${q.R} ${q.R} 0 0 1 ${q.S} ${q.S}c${q.D} ${q.C} ${q.D} ${q.BC} ${q.D} ${q.ABC}`,            // tr: (w-p,0) -> (w,p)
  q=>`c0 ${q.A} 0 ${q.AB} ${-q.D} ${q.ABC}a${q.R} ${q.R} 0 0 1 ${-q.S} ${q.S}c${-q.C} ${q.D} ${-q.BC} ${q.D} ${-q.ABC} ${q.D}`,       // br: (w,h-p) -> (w-p,h)
  q=>`c${-q.A} 0 ${-q.AB} 0 ${-q.ABC} ${-q.D}a${q.R} ${q.R} 0 0 1 ${-q.S} ${-q.S}c${-q.D} ${-q.C} ${-q.D} ${-q.BC} ${-q.D} ${-q.ABC}`]; // bl: (p,h) -> (0,h-p)
/* per-corner radii [tl,tr,br,bl]; ox/oy shift the whole path */
function pathR(w,h,Rs,sm,ox=0,oy=0){
  if(!ox&&!oy&&Rs[0]===Rs[1]&&Rs[1]===Rs[2]&&Rs[2]===Rs[3])return path(w,h,Rs[0],sm);
  const b=Math.min(w,h)/2,[q0,q1,q2,q3]=Rs.map(r=>cp(r,sm,b)),X=v=>f3(v+ox),Y=v=>f3(v+oy);
  return `M${X(w-q1.p)} ${Y(0)}${SEG[1](q1)}L${X(w)} ${Y(h-q2.p)}${SEG[2](q2)}L${X(q3.p)} ${Y(h)}${SEG[3](q3)}L${X(0)} ${Y(q0.p)}${SEG[0](q0)}Z`;
}
/* the slivers between each circular corner and its smoothed curve (what the smoothing takes away), as closed sub-paths */
function sliverList(w,h,Rs,sm,ox=0,oy=0){
  const b=Math.min(w,h)/2,X=v=>f3(v+ox),Y=v=>f3(v+oy);
  return Rs.map((r,i)=>{const q=cp(r,sm,b),R=q.R,p=q.p;let s='';if(R<.05)return s;
    if(i===0)s+=`M${X(0)} ${Y(p)}${SEG[0](q)}L${X(R)} ${Y(0)}A${R} ${R} 0 0 0 ${X(0)} ${Y(R)}Z`;
    if(i===1)s+=`M${X(w-p)} ${Y(0)}${SEG[1](q)}L${X(w)} ${Y(R)}A${R} ${R} 0 0 0 ${X(w-R)} ${Y(0)}Z`;
    if(i===2)s+=`M${X(w)} ${Y(h-p)}${SEG[2](q)}L${X(w-R)} ${Y(h)}A${R} ${R} 0 0 0 ${X(w)} ${Y(h-R)}Z`;
    if(i===3)s+=`M${X(p)} ${Y(h)}${SEG[3](q)}L${X(0)} ${Y(h-R)}A${R} ${R} 0 0 0 ${X(R)} ${Y(h)}Z`;
    return s});
}
const slivers=(w,h,Rs,sm,ox,oy)=>sliverList(w,h,Rs,sm,ox,oy).join('');

const api={path,pathR,slivers,SMOOTH:SM,K,F,mode:'off',refresh:()=>{},scan:()=>{}};
window.Squircle=api;
const de=document.documentElement;
let force=null;try{const m=/[?&]sq=(off|clip|shape)\b/.exec(location.search);if(m)sessionStorage.setItem('dbh-sq',m[1]);force=sessionStorage.getItem('dbh-sq')}catch(_){}
const SHAPE=CSS.supports('corner-shape','superellipse(2)'),CLIP=CSS.supports('clip-path','path(evenodd,"M0 0H1V1Z")');
const MODE=force==='off'?'off':force==='clip'&&CLIP?'clip':force==='shape'&&SHAPE?'shape':SHAPE?'shape':CLIP?'clip':'off';
api.mode=MODE;
if(MODE==='off'||!window.ResizeObserver||!window.MutationObserver)return;
de.dataset.sq=MODE;

/* shared rules: pseudo-elements can't take inline style */
const css=document.createElement('style');css.id='squircle-css';
css.textContent=MODE==='shape'?`[data-sq-pe~=b]::before,[data-sq-pe~=a]::after{corner-shape:${KS}}`:
  ['b::before','a::after'].map(s=>{const [k,pe]=s.split('::');return `[data-sq-ring~=${k}]::${pe}{border-color:transparent!important;background:var(--sq-ring-${k}-c)!important;clip-path:var(--sq-ring-${k})!important}`}).join('');
(document.head||de).appendChild(css);

const LONG=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'];
const PROP=['border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius'];
const T=new WeakMap();   // element -> record
const live=new Set();
const zero=v=>!v||/^0(px|%)?( 0(px|%)?)?$/.test(v);
/* '12px' | '50%' | '3.2% 5.6%' -> resolved circular radius in px (elliptical: the smaller axis) */
function rpx(v,w,h){const t=v.split(' '),x=t[0],y=t[1]||t[0],u=(s,L)=>s.endsWith('%')?parseFloat(s)/100*L:parseFloat(s)||0;return Math.min(u(x,w),u(y,h))}
const scale=v=>v.split(' ').map(t=>zero(t)?t:`calc(${t} * ${F})`).join(' ');
/* shadows: [{x,y,b,s,inset}] */
function shadows(v){if(!v||v==='none')return[];const o=[];
  v.split(/,(?![^(]*\))/).forEach(s=>{const n=(s.replace(/rgba?\([^)]*\)|#[0-9a-f]+|[a-z-]+\([^)]*\)/gi,'').match(/-?[\d.]+px|\b0\b/g)||[]).map(parseFloat);
    o.push({x:n[0]||0,y:n[1]||0,b:n[2]||0,s:n[3]||0,inset:/\binset\b/.test(s)})});return o}
function backdrop(e){for(let p=e.parentElement;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c&&!/rgba\(.*,\s*0\)$|transparent/.test(c))return c}return 'rgb(255,255,255)'}

/* read: everything needed from computed style, before any write */
function read(r){
  const e=r.el,cs=getComputedStyle(e);
  const ic=e.style.clipPath;
  if(ic&&ic!==r.myClip||!ic&&cs.clipPath!=='none')return r.skip='clip';   // shaped by its own clip-path already
  r.rad=LONG.map(k=>cs[k]);
  if(r.par&&T.get(r.par)){const pc=getComputedStyle(r.par);r.inh=LONG.every((k,i)=>r.rad[i]===pc[k])}else r.inh=false;   // radius: inherit
  r.sh=shadows(cs.boxShadow).filter(s=>!s.inset);r.ov=cs.overflowX==='visible'&&cs.overflowY==='visible';r.skip=null;
  const big=r.h>2*innerHeight;
  r.bd=(MODE==='clip'?e.tagName!=='IFRAME'&&(!!e.querySelector('iframe')||big):big)&&cs.backgroundImage==='none'||(r.bd&&r.bdOn);
  if(r.bd)r.bdc=backdrop(e);
  if(MODE==='clip'){
    r.ring=[];['::before','::after'].forEach((pe,i)=>{const c=getComputedStyle(e,pe);if(c.content==='none'||c.display==='none')return;
      const bw=parseFloat(c.borderTopWidth)||0;
      if(bw>0&&c.borderTopStyle!=='none'&&LONG.every((k,j)=>c[k]===r.rad[j])&&/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)&&c.backgroundImage==='none'&&
         Math.abs(parseFloat(c.width)+(c.boxSizing==='border-box'?0:2*bw)-r.w)<1&&Math.abs(parseFloat(c.height)+(c.boxSizing==='border-box'?0:2*bw)-r.h)<1)
        r.ring.push({k:i?'a':'b',bw,c:c.borderTopColor})});
  }else{
    r.pe=[];['::before','::after'].forEach((pe,i)=>{const c=getComputedStyle(e,pe);if(c.content!=='none'&&LONG.every((k,j)=>c[k]===r.rad[j]))r.pe.push(i?'a':'b')});
  }
}
/* write */
function pill(r){const m=Math.min(r.w,r.h)/2-.5;return r.w<1||r.h<1||r.rad.every(zero)||r.rad.some(v=>rpx(v,r.w,r.h)>=m)}
function clear(r){const s=r.el.style;
  if(r.on==='shape'){r.mine=null;LONG.forEach((k,i)=>s[k]=r.ai[i]);s.removeProperty('corner-shape');r.el.removeAttribute('data-sq-pe')}
  if(r.on==='clip'){if(s.clipPath===r.myClip)s.clipPath='';r.myClip=null;
    ['b','a'].forEach(k=>{s.removeProperty('--sq-ring-'+k);s.removeProperty('--sq-ring-'+k+'-c')});r.el.removeAttribute('data-sq-ring')}
  if(r.bdOn){['backgroundImage','backgroundPosition','backgroundSize','backgroundRepeat','backgroundOrigin'].forEach(k=>s[k]='');r.bdOn=false;r.el.removeAttribute('data-sq-bd')}
  r.on=null;r.el.removeAttribute('data-sq');
}
function write(r){
  const e=r.el,s=e.style;
  if(r.skip||pill(r)){if(r.on)clear(r);return}
  if(r.bd&&r.on&&!r.bdOn)clear(r);
  if(r.bd){ // backdrop tiles: paint the four slivers in the colour behind (no clip or corner-shape on page-size / prototype-hosting containers)
    const w=r.w,h=r.h,R=r.rad.map(v=>rpx(v,w,h)),b=Math.min(w,h)/2,L=sliverList(w,h,R,SM),lay=[],pos=[],sz=[],P=['left top','right top','right bottom','left bottom'];
    R.forEach((rr,i)=>{if(!L[i])return;const p=Math.ceil(cp(rr,SM,b).p),ox=i===1||i===2?p-w:0,oy=i>1?p-h:0;
      lay.push(`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${p}' height='${p}'><path transform='translate(${f3(ox)} ${f3(oy)})' fill='${r.bdc}' d='${L[i]}'/></svg>`)}")`);
      sz.push(`${p}px ${p}px`);pos.push(P[i])});
    s.backgroundImage=lay.join(',');s.backgroundPosition=pos.join(',');s.backgroundSize=sz.join(',');
    s.backgroundRepeat='no-repeat';s.backgroundOrigin='border-box';r.bdOn=true;e.setAttribute('data-sq-bd','');
  }else if(MODE==='shape'){
    s.setProperty('corner-shape',KS);
    if(!r.inh){const v=r.rad.map(scale);LONG.forEach((k,i)=>s[k]=v[i]);r.mine=LONG.map(k=>s[k])}else r.mine=null;
    if(r.pe.length)e.setAttribute('data-sq-pe',r.pe.join(' '));else e.removeAttribute('data-sq-pe');
  }else{
    const w=r.w,h=r.h,R=r.rad.map(v=>rpx(v,w,h));
    let v;
    if(!r.sh.length&&!r.ov)v=`path('${pathR(w,h,R,SM)}')`;
    else{const rg=r.sh.filter(q=>!q.x&&!q.y&&!q.b&&q.s>0),ring=rg.length>0,sp=ring?Math.max(...rg.map(q=>q.s)):0;   // a hairline ring is the visible edge: smooth its outside
      const E=r.ov?4096:Math.ceil(Math.max(0,...r.sh.map(q=>Math.max(Math.abs(q.x),Math.abs(q.y))+q.b*1.5+Math.max(0,q.s))))+4;
      const cut=ring?slivers(w+2*sp,h+2*sp,R.map(x=>x>.05?x+sp:0),SM,-sp,-sp):slivers(w,h,R,SM);
      v=`path(evenodd,'M${-E} ${-E}H${w+E}V${h+E}H${-E}Z${cut}')`}
    if(s.clipPath!==v)s.clipPath=v;r.myClip=s.clipPath;
    const rk=[];(r.ring||[]).forEach(q=>{const b=q.bw,o=pathR(w,h,R,SM),i=pathR(w-2*b,h-2*b,R.map(x=>Math.max(0,x-b)),SM,b,b);
      s.setProperty('--sq-ring-'+q.k,`path(evenodd,'${o}${i}')`);s.setProperty('--sq-ring-'+q.k+'-c',q.c);rk.push(q.k)});
    if(rk.length)e.setAttribute('data-sq-ring',rk.join(' '));else e.removeAttribute('data-sq-ring');
  }
  r.on=MODE;e.setAttribute('data-sq','');
}

/* tracking */
const ro=new ResizeObserver(es=>{const rs=[];
  es.forEach(en=>{const r=T.get(en.target);if(!r)return;const bs=en.borderBoxSize&&en.borderBoxSize[0];
    const w=bs?bs.inlineSize:en.target.offsetWidth,h=bs?bs.blockSize:en.target.offsetHeight;
    if(r.on&&Math.abs(w-r.w)<.01&&Math.abs(h-r.h)<.01)return;r.w=w;r.h=h;rs.push(r)});
  update(rs)});
/* inline style writes anywhere (a script animating a radius in from 0 starts tracking here; cheap: inline reads only) and class changes
   on or above tracked elements (a stylesheet radius that changes with state is re-read, never pinned) */
let dirty=new Set(),draf=0;
const later=rs=>{rs.forEach(r=>dirty.add(r));if(!draf)draf=requestAnimationFrame(()=>{draf=0;const b=[...dirty].filter(r=>r.el.isConnected);dirty=new Set();update(b)})};
const mo=new MutationObserver(ms=>{const rs=new Set(),cl=[];
  ms.forEach(m=>{const t=m.target;if(m.attributeName==='class'){cl.push(t);return}
    const r=T.get(t),s=t.style;
    if(!r){if(t.nodeType===1&&!(t instanceof SVGElement)&&LONG.some(k=>!zero(s[k]))&&!t.closest('[data-sq-off]')){const p=t.parentElement;track(t,p&&T.has(p)?p:null)}return}
    if(MODE==='shape'){if(r.mine?LONG.some((k,i)=>s[k]!==r.mine[i]):LONG.map(k=>s[k]).join()!==r.lastInline)rs.add(r)}   // a script wrote its own radius (also while not drawn: hidden, pill, inherit)
    else if(s.clipPath&&s.clipPath!==r.myClip||LONG.map(k=>s[k]).join()!==r.lastInline)rs.add(r)});   // a script's radius or clip
  update([...rs]);
  if(cl.length){const d=[];live.forEach(r=>{if(r.el.isConnected&&cl.some(t=>t===r.el||t.contains(r.el)))d.push(r)});
    cl.forEach(t=>{if(!T.has(t)&&t.nodeType===1&&!(t instanceof SVGElement))scanLater.push(t)});if(scanLater.length&&!raf)raf=requestAnimationFrame(flush);if(d.length)later(d)}});
/* re-derive: author radius back in place (shape), read all, then write all.
   shape: while the radius isn't ours (r.mine null: never drawn, hidden or a pill and cleared, or inherit) the inline radius IS the
   author's, so it is taken as r.ai every time. (Before, r.ai was only refreshed while drawn, so a radius a script wrote while the element
   was hidden survived only until the next update: the P&B floating card, shown again after the IAB collapse with 16px, was put back to
   the peek's 20px 20px 0 0 from before it hid on the next class change or resize: square, uncut-looking bottom corners and big top ones.) */
function update(rs){if(!rs.length)return;
  if(MODE==='shape')rs.forEach(r=>{const s=r.el.style,now=LONG.map(k=>s[k]);
    if(!r.mine){r.ai=now;return}
    if(now.some((v,i)=>v!==r.mine[i]))r.ai=now;   // the author's own inline radius (a script's write), else theirs from before
    LONG.forEach((k,i)=>s[k]=r.ai[i])});
  rs.forEach(r=>{read(r);if(MODE==='clip')r.lastInline=LONG.map(k=>r.el.style[k]).join()});
  rs.forEach(write);
  if(MODE==='shape')rs.forEach(r=>r.lastInline=LONG.map(k=>r.el.style[k]).join())}
function track(e,par){
  if(T.has(e))return;
  const r={el:e,par,w:0,h:0,on:null,ai:LONG.map(k=>e.style[k]),mine:null,myClip:null,lastInline:LONG.map(k=>e.style[k]).join()};
  T.set(e,r);live.add(r);ro.observe(e);
}
const SKIP=/^(HTML|BODY|HEAD|SCRIPT|STYLE|LINK|META|SOURCE|TRACK|BR|TEMPLATE|svg)$/i;
function scan(root){
  const list=root.nodeType===1?[root,...root.querySelectorAll('*')]:[...root.querySelectorAll('*')];
  for(const e of list){
    if(T.has(e)||SKIP.test(e.tagName)||e instanceof SVGElement||e.closest('[data-sq-off]'))continue;
    const cs=getComputedStyle(e);
    if(LONG.every(k=>zero(cs[k])))continue;
    let par=e.parentElement;track(e,par&&T.has(par)?par:null);
  }
}
api.scan=scan;
api.refresh=()=>update([...live].filter(r=>r.el.isConnected));
let q=[],scanLater=[],raf=0;
function flush(){raf=0;const b=q,c=scanLater;q=[];scanLater=[];b.forEach(n=>{if(n.isConnected)scan(n)});
  c.forEach(e=>{if(e.isConnected&&!T.has(e)&&!SKIP.test(e.tagName)&&!e.closest('[data-sq-off]')){const cs=getComputedStyle(e);if(!LONG.every(k=>zero(cs[k]))){const p=e.parentElement;track(e,p&&T.has(p)?p:null)}}})}
const add=new MutationObserver(ms=>{ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)q.push(n)}));
  if(q.length&&!raf)raf=requestAnimationFrame(flush)});
// theme toggles change colours baked in (clip rings, backdrop tiles): re-read at the switch and once its .3s fade is done
let tt=0;const theme=new MutationObserver(()=>{clearTimeout(tt);api.refresh();tt=setTimeout(api.refresh,320)});
function start(){scan(document.body||de);add.observe(document.body||de,{childList:true,subtree:true});mo.observe(document.body||de,{attributes:true,subtree:true,attributeFilter:['style','class']});theme.observe(de,{attributes:true,attributeFilter:['data-theme']})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
