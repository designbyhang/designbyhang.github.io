/* Studio Model, full presentation (studio_00..studio_44), STEPPED. One scroll / swipe / key press plays exactly one
   Figma transition with cubic-bezier(.8,0,.2,1) and the frame's own Figma duration. Layers are matched by name path
   (Smart Animate): position / size / rotation / radius / colour / opacity tween; layers that exist on one side only fade.
   Logomark cells are normalised to clip box + inner square-or-circle, so corners sweep and fills never cross-fade.
   Monochrome art follows the site theme through a palette map (photos are never altered). */
(()=>{
const de=document.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)'),sysDark=matchMedia('(prefers-color-scheme: dark)');
/* follow the OS setting live unless the visitor has picked a theme with the site toggle (registered once per page) */
const onSys=()=>{let saved=null;try{saved=localStorage.getItem('dbh-theme');}catch(e){}if(saved==='dark'||saved==='light')return;de.dataset.theme=sysDark.matches?'dark':'light';};
sysDark.addEventListener?sysDark.addEventListener('change',onSys):sysDark.addListener(onSys);
/* StudioDeck.create({inner, stage, cap?, base?, onSlide?, onStep?}) mounts the deck: `inner` becomes the 1920x1080 artboard
   (scaled by layout()), `stage` gets the slide canvas colour. Returns a small controller API. */
function create(opts){const D=window.__STUDIO__;
const S=D.slides,N=S.length,DUR=D.dur,TYP=D.type,W=1920,H=1080,AS=D.assets,BASE=opts.base||D.base;
/* posts that zoom between slides (Mock 1-3: the playbook / Jen S. bulletin posts) are one unit: on every slide the post keeps
   the inner layout of the slide where it is shown at full size (same text boxes, sizes and line breaks) and only its frame
   is scaled (q = transform: scale from the top-left), so text never reflows, rewraps or cross-fades between sizes. */
/* light mode only: on studio_27-36 slides where the S app tile's dark backing is invisible (BG opacity 0, e.g. studio_29/30), the
   white logomark would vanish on the #f4f4f4 stage, so it takes the deck's light-mode logomark colour (#161616) instead. st() picks
   fl in light, so the fill tweens with the transition into the slides where the tile backing fades in (and back to white). */
if(!D._lmk){D._lmk=1;const ni=new Set(D.noinv||[]);S.forEach((s,n)=>{if(!ni.has(n))return;const m=new Map(s.items);
 for(const[k,l]of s.items){const g=/^(.*\/Logo Card)\/Logomark[^/]*\/.+/.exec(k);if(!g||l.t!=='SHAPE'||!l.f||Math.min(l.f[0],l.f[1],l.f[2])<250)continue;
  const bg=m.get(g[1]+'/BG');if(bg&&bg.o===0)l.fl=[22,22,22,l.f[3]];}});}
if(!D._unit){D._unit=1;const keys=new Set();for(const s of S)for(const[k]of s.items)if(/^Mock \d+$/.test(k))keys.add(k);
 for(const m of keys){let ref=-1,rw=0;S.forEach((s,i)=>{const e=s.items.find(x=>x[0]===m);if(e&&e[1].o>=.999&&e[1].w>rw){rw=e[1].w;ref=i;}});if(ref<0)continue;
  const R=S[ref].items,re=R.find(x=>x[0]===m)[1],kids=R.filter(x=>x[0].startsWith(m+'/'));
  /* single-line texts (box no taller than 1.5 lines) never wrap: browser metrics can't push 'Jen S.' onto two lines */
  for(const[,v]of kids)if(v.t==='TEXT'){const lh=parseFloat((/line-height:([\d.]+)px/.exec(D.texts[v.tx][0])||[])[1]);if(lh&&v.h<=lh*1.5)v.nw=1;}
  S.forEach((s,i)=>{if(i===ref)return;if(!s.items.some(x=>x[0]===m))return;const rest=s.items.filter(x=>!x[0].startsWith(m+'/')),j=rest.findIndex(x=>x[0]===m),e=rest[j][1];
   rest[j]=[m,{...re,x:e.x,y:e.y,o:e.o,q:e.w/re.w}];rest.splice(j+1,0,...kids.map(([k,v])=>[k,{...v}]));s.items=rest;});}}
const root=opts.inner,stage=opts.stage,cap=opts.cap||null;
root.style.position='absolute';root.style.left='0';root.style.top='0';root.style.width=W+'px';root.style.height=H+'px';root.style.transformOrigin='0 0';
/* ---- theme palette. Light = the Figma design as-is, except the white slide canvas becomes the site's standard media box colour #f4f4f4.
   Dark = neutrals map linearly white -> #222 (standard media box, dark) and black -> white. Saturated colours and photos untouched. */
let dark=de.dataset.theme==='dark';
/* studio_27-36 (D.noinv) keep their Figma colours in dark mode too: DW is the dark-palette weight, 1 on normal slides,
   0 on those; across 26->27 and 36->37 it tweens with the transition, so every colour (stage included) eases between the two
   palettes in one piece, no layer cross-fade. */
const NI=new Set(D.noinv||[]),KD=i=>NI.has(i)?0:1;let DW=1;
function P(c,bg,w){if(!c)return c;w=w===undefined?DW:w;const r=c[0],g=c[1],b=c[2];if(Math.max(r,g,b)-Math.min(r,g,b)>14)return c;
 const l=bg&&r>=250&&g>=250&&b>=250?[FL,FL,FL,c[3]]:c;if(!dark||w<=0)return l;
 const f=v=>255-v*(255-FD)/255,d=[f(r),f(g),f(b),c[3]];if(w>=1)return d.map((v,j)=>j<3?Math.round(v):v);
 return[0,1,2].map(j=>Math.round(l[j]+(d[j]-l[j])*w)).concat([c[3]]);}
/* stage = the site's standard .media box (--frame): #f4f4f4 light, #222 dark. studio_27-36 keep their content's Figma colours
   but their surface follows the theme: their stage is exactly that standard colour in both modes (Figma's #eee / black bg is
   not used), and it tweens to/from the neighbours' canvas with the 26->27 / 36->37 transitions. */
function bgOf(n){if(NI.has(n))return dark?[FD,FD,FD,1]:[FL,FL,FL,1];const b=S[n].bg;return b?P(b,1,1):null;}
const FL=0xf4,FD=0x22;
const mapCss=(s,ni)=>!dark||ni?s:s.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g,(m,r,g,b,a)=>{const c=P([+r,+g,+b,+a],0,1);return`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;});
/* ---- per-slide layer maps and child orders */
const L=S.map(s=>{const m=new Map();for(const[k,e]of s.items)m.set(k,e);return m;});
const KID=S.map(s=>{const m=new Map();for(const[k,e]of s.items){if(!m.has(e.p))m.set(e.p,[]);m.get(e.p).push(k);}return m;});
const cidOf=e=>!e?null:e.t==='VEC'?'v'+(e.g||[]).join(',')+'|'+(e.gs||[]).join(','):e.t==='TEXT'?'t'+e.tx:e.t==='IMG'?'i'+e.as:null;
/* path interpolation (same command structure => tween numbers) */
const PT={};function ptok(id){if(PT[id])return PT[id];const d=D.paths[id][0],nums=[];const tpl=d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g,m=>{nums.push(+m);return'#';});return PT[id]={tpl,nums};}
function plerp(a,b,t){const A=ptok(a),B=ptok(b);if(A.tpl!==B.tpl)return null;let j=0;return A.tpl.replace(/#/g,()=>{const v=A.nums[j]+(B.nums[j]-A.nums[j])*t;j++;return+v.toFixed(3);});}
const canInterp=(a,b)=>a&&b&&a.length===b.length&&a.every((x,j)=>ptok(x).tpl===ptok(b[j]).tpl);
/* ---- DOM, created lazily per transition window */
const el=new Map(),cont=new Map();
function anyItem(k){for(let i=0;i<N;i++){const e=L[i].get(k);if(e)return e;}}
function ensure(k){if(el.has(k))return el.get(k);const e=anyItem(k);const pe=e.p?ensure(e.p):root;
 const d=document.createElement('div');d.className='ml';d.dataset.k=k;d.style.display='none';pe.appendChild(d);el.set(k,d);cont.set(k,new Map());return d;}
function assetSrc(id,ni){const a=AS[id];return BASE+(dark&&a.d&&!ni?a.d:a.s);}
function swapSrc(c){const want=assetSrc(c._as,c._ni);if(c._src===want)return;c._src=want;const im=new Image();im.src=want;(im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(()=>{if(c._src===want)c.src=want;});}
/* text/image content of a layer follows the palette of the slide(s) it is on (light palette on studio_27-36 in dark mode);
   a layer shared across 26->27 / 36->37 switches at the midpoint of the colour tween */
function modeOf(k,ni){const cm=cont.get(k);if(!cm)return;for(const c of cm.values()){if(c._ni===ni)continue;c._ni=ni;if(!dark)continue;if(c.className==='mt')paintText(c);else if(c.tagName==='IMG')swapSrc(c);}}
function ensureContent(k,item,s){const cm=cont.get(k),cid=cidOf(item);if(cm.has(cid))return cm.get(cid);const host=el.get(k);let c;
 if(item.t==='VEC'){c=document.createElementNS('http://www.w3.org/2000/svg','svg');c.setAttribute('overflow','visible');c.setAttribute('aria-hidden','true');
  c.innerHTML=(item.g||[]).map(id=>`<path class="pf" d="${D.paths[id][0]}" fill-rule="${D.paths[id][1]==='E'?'evenodd':'nonzero'}"/>`).join('')+(item.gs||[]).map(id=>`<path class="ps" d="${D.paths[id][0]}" fill-rule="${D.paths[id][1]==='E'?'evenodd':'nonzero'}"/>`).join('');
  c._pf=[...c.querySelectorAll('.pf')];c._ps=[...c.querySelectorAll('.ps')];}
 else if(item.t==='TEXT'){c=document.createElement('div');c.className='mt';c._tx=item.tx;c._nw=item.nw;c._ni=KD(s|0)===0;paintText(c);}
 else if(item.t==='IMG'){c=document.createElement('img');c.alt='';c.decoding='async';c.draggable=false;c._as=item.as;c._ni=KD(s|0)===0;c.src=assetSrc(item.as,c._ni);c._src=c.src;}
 c.style.display='none';host.appendChild(c);cm.set(cid,c);return c;}
function paintText(c){const t=D.texts[c._tx],ni=!!c._ni;c.style.cssText=mapCss(t[0],ni);c.innerHTML=mapCss(t[1],ni);c.style.position='absolute';c.style.left='0';c.style.top='0';if(c._nw)c.style.whiteSpace='nowrap';}
/* ---- interpolation helpers */
const R0=[0,0,0,0],lerp=(a,b,t)=>a+(b-a)*t;
function lc(a,b,t){if(!a&&!b)return null;a=a||[b[0],b[1],b[2],0];b=b||[a[0],a[1],a[2],0];return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t),lerp(a[3],b[3],t)];}
const rgba=c=>c?`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${+c[3].toFixed(4)})`:'transparent';
function la(a,b,t){let d=((b-a)%360+540)%360-180;return a+d*t;}
function st(l){return{x:l.x,y:l.y,w:l.w,h:l.h,o:l.o,a:l.a||0,r:l.r||R0,f:(!dark&&l.fl)||l.f||null,s:l.s||null,sw:l.sw||0,sa:l.sa||'C',sh:l.sh||null,q:l.q||1};}
let curT=0,curI=-1;
function pair(i,k){const a=L[i].get(k),b=L[i+1]?L[i+1].get(k):null;
 if(!a&&!b)return null;if(a&&b)return[a,b,st(a),st(b)];
 /* pm: the layer fades with its parent instead of on its own; in the ending cross-fade (END) every slide fades as one piece */
 const pk=(a||b).p,pm=pk&&(i===END||!(L[i].get(pk)&&L[i+1]&&L[i+1].get(pk)));
 if(TYP[i]==='D'){ /* Figma DISSOLVE: the outgoing frame stays put while the incoming one fades in on top */
  if(a){const s=st(a);return[a,null,s,{...s}];}const s=st(b);return[null,b,{...s,o:pm?s.o:0},s];}
 if(a){const s=st(a);return[a,null,s,{...s,o:pm?s.o:0}];}const s=st(b);return[null,b,{...s,o:pm?s.o:0},s];}
const shown=new Map();
function vis(node,on){const v=on?'':'none';if(node.style.display!==v)node.style.display=v;}
function apply(k,ia,ib,v,t){const e=el.get(k),m=cont.get(k);
 if(!v||v.o<=0.001){vis(e,false);return;}vis(e,true);
 const s=e.style;s.left=v.x+'px';s.top=v.y+'px';s.width=v.w+'px';s.height=v.h+'px';s.opacity=v.o>=.999?'':v.o;
 const fl=(ia||ib).fx,q=v.q||1,sq=Math.abs(q-1)>1e-4;s.transform=sq?`scale(${q})`:(Math.abs(v.a)>.01||fl)?`rotate(${v.a}deg)${fl?' scaleX(-1)':''}`:'';s.transformOrigin=sq?'0 0':'';
 s.borderRadius=v.r.some(x=>x>.01)?v.r.map(x=>x.toFixed(2)+'px').join(' '):'';
 const clip=(ia&&ia.clip)||(ib&&ib.clip);s.overflow=clip?'hidden':'';
 const kind=(ia||ib).t,isBox=kind!=='VEC'&&kind!=='TEXT'&&kind!=='IMG';
 const fc=v.f?P(v.f,(ia||ib).bgf):null;
 if(isBox){const c=fc?rgba(fc):'';s.background=c;s.color=c;const sh=[];if(c)sh.push('0 0 0 var(--seam) currentColor');
  /* a frame with no fill casts its shadow from its contents, as in Figma (e.g. the S app tile: a square, fill-less 'Logo Card'
     whose rounded BG vector is the visible tile). box-shadow would draw the square frame's corners under the rounded tile. */
  if(v.sh&&!c){s.boxShadow=sh.join(',');s.filter=v.sh.map(q=>`drop-shadow(${q[0]}px ${q[1]}px ${q[2]/2}px ${rgba(q[4])})`).join(' ');}
  else{if(v.sh)for(const q of v.sh)sh.push(`${q[0]}px ${q[1]}px ${q[2]}px ${q[3]}px ${rgba(q[4])}`);s.boxShadow=sh.join(',');if(s.filter)s.filter='';}}
 else{if(s.background)s.background='';if(v.sh){s.boxShadow=v.sh.map(q=>`${q[0]}px ${q[1]}px ${q[2]}px ${q[3]}px ${rgba(q[4])}`).join(',');}else if(s.boxShadow)s.boxShadow='';}
 if(isBox&&v.s&&v.s[3]>0){s.outline=`${v.sw}px solid ${rgba(P(v.s))}`;s.outlineOffset=(v.sa==='I'?-v.sw:v.sa==='O'?0:-v.sw/2)+'px';}else if(s.outline)s.outline='';
 /* content variants */
 const ca=cidOf(ia),cb=cidOf(ib);const want=new Map();
 if(ca&&cb&&ca!==cb&&ia.t==='VEC'&&ib.t==='VEC'&&canInterp(ia.g||[],ib.g||[])&&canInterp(ia.gs||[],ib.gs||[])){
  const c=ensureContent(k,ia);want.set(c,1);c._lerp=[ib,t];}
 else{if(ca){const c=ensureContent(k,ia);c._lerp=null;want.set(c,ca===cb?1:1-t);}if(cb&&cb!==ca){const c=ensureContent(k,ib);c._lerp=null;want.set(c,t);}}
 for(const c of m.values()){const o=want.get(c);if(o===undefined||o<=0.001){vis(c,false);continue;}vis(c,true);c.style.opacity=o>=.999?'':o;
  if(c.tagName==='svg'){c.setAttribute('width',v.w);c.setAttribute('height',v.h);c.setAttribute('viewBox',`0 0 ${v.w} ${Math.max(v.h,.001)}`);
   if(c._lerp){const[ib2,tt]=c._lerp;(ia.g||[]).forEach((id,j)=>c._pf[j].setAttribute('d',plerp(id,ib2.g[j],tt)));(ia.gs||[]).forEach((id,j)=>c._ps[j].setAttribute('d',plerp(id,ib2.gs[j],tt)));}
   const fcol=fc?rgba(fc):'none',scol=v.s?rgba(P(v.s)):'none';for(const p of c._pf)p.setAttribute('fill',fcol);for(const p of c._ps)p.setAttribute('fill',scol);}
  else if(c.tagName==='IMG'){c.style.left='0';c.style.top='0';c.style.width='100%';c.style.height='100%';}
  else{c.style.width=v.w+'px';c.style.height=v.h+'px';}}}
/* merged z-order for transition i (B-only layers slot in after their predecessor; DISSOLVE puts B on top) */
function merged(i,p){const A=KID[i].get(p)||[],B=(L[i+1]&&KID[i+1].get(p))||[];if(TYP[i]==='D'){const r=A.slice();for(const k of B)if(!r.includes(k))r.push(k);return r;}
 const r=A.slice();let prev=null;for(const k of B){if(!r.includes(k))r.splice(prev?r.indexOf(prev)+1:0,0,k);prev=k;}return r;}
let active=new Set(),built=new Set();
function build(i){if(i<0||i>N-2||built.has(i))return;built.add(i);for(const s of[i,i+1])for(const[k,e]of S[s].items){ensure(k);if(e.t==='IMG'||e.t==='TEXT'||e.t==='VEC')ensureContent(k,e,s);}}
function activate(i){build(i);const keys=new Set();for(const s of[i,i+1])for(const k of L[s].keys())keys.add(k);
 for(const k of active)if(!keys.has(k))vis(el.get(k),false);
 const parents=new Set();for(const k of keys)parents.add((L[i].get(k)||L[i+1].get(k)).p);
 for(const p of parents){const host=p?el.get(p):root;const order=merged(i,p);const cur=[...host.children].filter(c=>c.dataset&&c.dataset.k);
  const curKeys=cur.map(c=>c.dataset.k).filter(k=>order.includes(k));if(curKeys.join('\n')!==order.join('\n')){for(const k of order)host.appendChild(el.get(k));
}}
 active=keys;curI=i;}
const easeStep=(function bez(p1x,p1y,p2x,p2y){const cx=3*p1x,bx=3*(p2x-p1x)-cx,ax=1-cx-bx,cy=3*p1y,by=3*(p2y-p1y)-cy,ay=1-cy-by;
 const X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t,dX=t=>(3*ax*t+2*bx)*t+cx;
 return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let n=0;n<8;n++){const e=X(t)-x,d=dX(t);if(Math.abs(e)<1e-6)break;if(Math.abs(d)<1e-6)break;t-=e/d;}
  let lo=0,hi=1;if(Math.abs(X(t)-x)>1e-5){t=x;for(let n=0;n<30;n++){const v=X(t);if(Math.abs(v-x)<1e-6)break;if(v<x)lo=t;else hi=t;t=(lo+hi)/2;}}return Y(t);};})(.8,0,.2,1);
/* 'pixel on grid' intro (studio_02->11, transitions 0-8): Figma's own behaviour per Hang, i.e. square boxes fading in one
   after another, with the prototype's easing (SLOW spring / EASE_OUT). Everywhere else: the steep ease + corner sweep. */
const FADE=new Set(D.fade||[]);
const spring=(m,k,c)=>{const w0=Math.sqrt(k/m),z=c/(2*Math.sqrt(k*m));let x;
 if(z<1){const wd=w0*Math.sqrt(1-z*z);x=t=>1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t));}
 else if(z===1)x=t=>1-Math.exp(-w0*t)*(1+w0*t);
 else{const s=w0*Math.sqrt(z*z-1),r1=-z*w0+s,r2=-z*w0-s;x=t=>1-(r2*Math.exp(r1*t)-r1*Math.exp(r2*t))/(r2-r1);}
 return d=>{const e=x(d);return u=>u<=0?0:u>=1?1:x(u*d)/e;};};
const bezF=(a,b,c2,d2)=>{const cx=3*a,bx=3*(c2-a)-cx,ax=1-cx-bx,cy=3*b,by=3*(d2-b)-cy,ay=1-cy-by,X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t;
 return x=>{if(x<=0)return 0;if(x>=1)return 1;let lo=0,hi=1,t=x;for(let n=0;n<40;n++){const v=X(t);if(Math.abs(v-x)<1e-6)break;if(v<x)lo=t;else hi=t;t=(lo+hi)/2;}return Y(t);};};
const FIG={LINEAR:()=>u=>u,EASE_IN:()=>bezF(.42,0,1,1),EASE_OUT:()=>bezF(0,0,.58,1),EASE_IN_AND_OUT:()=>bezF(.42,0,.58,1),
 SLOW:spring(1,80,20),GENTLE:spring(1,100,15),QUICK:spring(1,300,20),BOUNCY:spring(1,600,15)};
/* ending (swag studio_43 -> logo studio_44, the last transition): a soft cross-fade instead of the Figma step. The swag fades
   out while the logo screen fades in and settles from 1.1x to 1x about the artboard centre (a gentle zoom out), 1.4s,
   cubic-bezier(.65,0,.35,1); stepping back plays the same curve in reverse */
const inOut=bezF(.65,0,.35,1),END=N-2,END_MS=1400,END_Z=1.1;
const easeFor=i=>i===END?inOut:FADE.has(i)&&D.ease&&FIG[D.ease[i]]?FIG[D.ease[i]](DUR[i]):easeStep;
const durOf=i=>i===END?END_MS:DUR[i]*1000;
let lastDraw=[0,0],shownN=-1,rawU=null,rawDir=1;
/* the 9 intro boxes all fade in with the same animation: Figma's SLOW spring over 0.833s. studio_11->12 (transition 9) is
   1.667s in Figma because the grid fades out with it; its box keeps the 0.833s fade inside that transition. */
const CELLT=D.cellT||{};
function cellT(i,t){const c=CELLT[i];if(!c)return t;const u=rawU!==null?rawU:(rawDir>0?t:1-t);const e=FIG[c[1]](c[0])(Math.min(1,u*DUR[i]/c[0]));return rawDir>0?e:1-e;}
/* grid draw-in (studio_02 -> 03): alternating directions, verticals down/up from 500ms at i*150ms, horizontals right/left from
   1.3s at i*150ms, 1.7s each, cubic-bezier(.65,0,.35,1). */
/* drawn on EVERY studio_02 -> 03 step (3.45s total: 8 verticals + 4 horizontals). The step only lands (AUTO PLAY wait,
   `animating` false) when the last line is fully drawn; a new gesture during the draw completes it at once and lands there. */
/* Each line is its own element: while drawing, the real Grid layer (a 11x5 group of 240px cells, each outlining its own border
   with a 1px band) is hidden and an SVG of one growing rect per line stands in for it. A strip-mask over the cell group cannot
   work: every strip also uncovers the bands of the crossing lines, so a crossing line that had not drawn yet showed as a dot /
   short tick at each intersection. Every visible grid line is the shared border of two cells, i.e. two coincident 1px bands
   composited on top of each other, so each line is drawn as two identical rects: same geometry, coverage and colour as the
   finished layer (crossings get four bands in both), and swapping back to the real layer when the draw ends changes nothing. */
const GRID=D.grid||null;let gfx=null,gsv=null;
function gridLines(now){const g=el.get('Grid');if(!g||!gfx)return;const t=now-gfx.t0;let done=true;
 if(!gsv){const ns='http://www.w3.org/2000/svg',it=anyItem('Grid');gsv=document.createElementNS(ns,'svg');gsv.setAttribute('aria-hidden','true');
  gsv.setAttribute('width',it.w);gsv.setAttribute('height',it.h);gsv.setAttribute('viewBox',`0 0 ${it.w} ${it.h}`);gsv.setAttribute('overflow','visible');
  gsv.style.cssText=`position:absolute;left:${it.x}px;top:${it.y}px;display:block;pointer-events:none`;
  gsv._r=[...GRID.v,...GRID.hz].map(()=>[0,1].map(()=>gsv.appendChild(document.createElementNS(ns,'rect'))));
  gsv._c=(S[1].items.find(([k,v])=>k.startsWith('Grid/')&&v.s)||[,{s:[22,22,22,1]}])[1].s;}
 if(gsv.previousSibling!==g)g.after(gsv);gsv.style.display='';gsv.setAttribute('fill',rgba(P(gsv._c)));g.style.opacity='0';
 /* lines start 500ms in (the copy fade, ~0.83s, overlaps the first lines) */
 const O=500,DL=1700,ST=150,p=d=>{const u=Math.min(1,Math.max(0,(t-O-d)/DL));if(u<1)done=false;return inOut(u);},nv=GRID.v.length;
 const set=(j,x,y,w,h)=>{for(const r of gsv._r[j]){r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',Math.max(0,w));r.setAttribute('height',Math.max(0,h));}};
 GRID.v.forEach((x,i)=>{const h=GRID.h0*p(i*ST);set(i,x-.5,i%2?GRID.y0+GRID.h0-h:GRID.y0,1,h);});
 GRID.hz.forEach((y,i)=>{const w=GRID.w0*p(800+i*ST);set(nv+i,i%2?GRID.x0+GRID.w0-w:GRID.x0,y-.5,w,1);});
 if(done)endGrid();}
function endGrid(){const L=gfx&&gfx.land;gfx=null;if(gsv)gsv.style.display='none';draw(lastDraw[0],lastDraw[1]);if(L)land(L.done);}
function gridTick(now){if(!gfx)return;gridLines(now);if(gfx)gfx.raf=requestAnimationFrame(gridTick);}
function startGrid(){if(!GRID||rm.matches)return;if(gfx)cancelGrid();gfx={t0:performance.now(),land:null};gridLines(gfx.t0);gfx.raf=requestAnimationFrame(gridTick);}
function cancelGrid(){if(gfx){cancelAnimationFrame(gfx.raf);endGrid();}}
function draw(i,t){if(i>=N-1){i=N-2;t=1;}if(i<0){i=0;t=0;}lastDraw=[i,t];
 if(i!==curI)activate(i);
 DW=lerp(KD(i),KD(i+1),t);
 /* the slide's own canvas colour fills the 1920x1080 artboard only; the stage around it (fullscreen letterbox, screen edges)
    is the standard stage colour, so black slides stay framed and iOS samples #f4f4f4 / #222222 at the edges (studio-present.js
    sets data-lb=canvas only on tight viewports where its CLOSE / AUTO PLAY chrome overlaps the art: then the canvas fills the
    letterbox as before so the chrome stays legible; data-lb=none while the presentation is open otherwise: the stage paints
    nothing and html/body, set to the stage colour, show through) */
 const bg=lc(bgOf(i),bgOf(i+1),t);root.style.background=bg?rgba(bg):'';const lb=stage.dataset.lb;stage.style.background=lb==='none'?'transparent':lb==='canvas'&&bg?rgba(bg):dark?'#222222':'#f4f4f4';
 const n=t>=.5?i+1:i;stage.dataset.slide=String(n).padStart(2,'0');if(n!==shownN){shownN=n;opts.onSlide&&opts.onSlide(n);}
 /* logomark cells that switch on/off (opacity 0<->1 in Figma) are revealed with the clipped-circle sweep instead of an
    opacity fade: full colour throughout, a circle grows from the cell centre (clipped by the cell) until it covers it. */
 const sweep=new Map();
 if(!FADE.has(i))for(const k of active){const a=L[i].get(k),b=L[i+1].get(k);if(!a||!b||a.t!=='CELL'||b.t!=='CELL'||Math.abs(a.o-b.o)<.5)continue;
  const inn=a.o<b.o,vis2=inn?b:a,sh=(inn?L[i+1]:L[i]).get(k+'/Shape');if(!sh)continue;sweep.set(k,{e:inn?t:1-t,cell:vis2,sh});}
 for(const k of active){const pr=pair(i,k);if(!pr){vis(el.get(k),false);continue;}const[ia,ib,a,b]=pr;
  if(NI.size)modeOf(k,ia&&ib?DW<.5:KD(ia?i:i+1)===0);
  if((ia||ib).cover&&!(ia&&ib)){a.o=ia?(t<=0?a.o:0):0;b.o=ib?(t>=1?b.o:0):0;}
  const sw=sweep.get(k);if(sw){a.o=b.o=1;if(sw.e<=0.0005){vis(el.get(k),false);continue;}}
  const pk=(ia||ib).p,psw=pk&&sweep.get(pk);
  if(psw&&k===pk+'/Shape'){const T=psw.sh,c=psw.cell,e=psw.e,round=T.r&&T.r[0]>1;
   const cx=round?T.x+T.w/2:c.w/2,cy=round?T.y+T.h/2:c.h/2,R1=round?T.w/2:Math.hypot(c.w,c.h)/2+1,rr=R1*e;
   const v=e>=.9995?{...st(T)}:{...st(T),x:cx-rr,y:cy-rr,w:2*rr,h:2*rr,r:[rr,rr,rr,rr]};v.o=1;
   apply(k,T,T,v,1);continue;}
  const to=(ia||ib).t==='CELL'&&FADE.has(i)?cellT(i,t):t;
  apply(k,ia,ib,{x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),w:lerp(a.w,b.w,t),h:lerp(a.h,b.h,t),o:lerp(a.o,b.o,to),a:la(a.a,b.a,t),r:a.r.map((r,j)=>lerp(r,b.r[j],t)),f:lc(a.f,b.f,t),s:lc(a.s,b.s,t),sw:lerp(a.sw||b.sw,b.sw||a.sw,t),sa:t<.5?a.sa:b.sa,q:lerp(a.q,b.q,t),
   sh:(a.sh&&b.sh&&a.sh.length===b.sh.length)?a.sh.map((q,j)=>[lerp(q[0],b.sh[j][0],t),lerp(q[1],b.sh[j][1],t),lerp(q[2],b.sh[j][2],t),lerp(q[3],b.sh[j][3],t),lc(q[4],b.sh[j][4],t)]):(t<.5?a.sh:b.sh)},t);}
 if(gfx){const g=el.get('Grid');if(g)g.style.opacity='0';} /* the line SVG stands in for it while drawing */
 if(i===END)for(const k of active){const b=L[i+1].get(k);if(!b||b.p||L[i].get(k))continue;const e=el.get(k),z=lerp(END_Z,1,t);
  if(e.style.display==='none')continue;e.style.transformOrigin=`${W/2-b.x}px ${H/2-b.y}px`;e.style.transform=z>1.0001?`scale(${z})`:'';}
 if(cap)cap.textContent=String(n+1).padStart(2,'0')+' / '+String(N).padStart(2,'0')+(opts.capLabel===false?'':'  ·  '+D.labels[n]);}
/* ---- theme switching: instant, also mid-transition (the next frame simply paints with the new palette) */
function setTheme(){const d=de.dataset.theme==='dark';if(d===dark)return;dark=d;
 for(const cm of cont.values())for(const c of cm.values()){if(c.className==='mt')paintText(c);
  else if(c.tagName==='IMG'&&AS[c._as].d)swapSrc(c);}
 draw(lastDraw[0],lastDraw[1]);opts.onTheme&&opts.onTheme(dark);}
new MutationObserver(setTheme).observe(de,{attributes:true,attributeFilter:['data-theme']});
/* ---- timed stepping: one call = one Figma transition, cubic-bezier(.8,0,.2,1) at the frame's own duration */
let cur=0,anim=null,raf=0,steps=0,pend=0,pendEdge=null;
const canStep=dir=>dir>0?cur<N-1:cur>0;
function prefetch(n){for(let j=n-2;j<=n+1;j++)build(j);}
function show(n){cur=n;draw(Math.min(n,N-2),n>=N-1?1:0);prefetch(n);}
function prog(now){return Math.min(1,anim.u0+(1-anim.u0)*Math.min(1,(now-anim.t0)/anim.dur));}
function frame(){const now=performance.now(),u=prog(now),e=anim.ease(u);
 rawU=u;rawDir=anim.dir;draw(anim.i,anim.dir>0?e:1-e);rawU=null;
 if(u>=1){const done=anim.done;cur=anim.to;anim=null;raf=0;stage.dataset.steps=String(++steps);prefetch(cur);if(gfx){gfx.land={done};return;}land(done);return;}
 raf=requestAnimationFrame(frame);}
/* a step reaches its stop: natural end, finished early by the next gesture (finishNow), or an instant (reduced-motion) cut */
function land(done){done&&done();flush();}
function step(dir,done){if(anim||!canStep(dir))return false;if(gfx)cancelGrid();const to=cur+dir,i=Math.min(cur,to);prefetch(to);opts.onStep&&opts.onStep(dir,to);
 rawDir=dir;
 if(rm.matches){cur=to;show(cur);stage.dataset.steps=String(++steps);land(done);return true;}
 anim={to,i,dir,t0:performance.now(),u0:0,dur:durOf(i),done,ease:easeFor(i)};raf=requestAnimationFrame(frame);if(dir>0&&cur===0)startGrid();return true;}
/* finish the running transition within ms (progress stays continuous), used when the next gesture is already queued */
function hurry(ms){if(!anim)return;const now=performance.now();if(anim.dur-(now-anim.t0)<=ms)return;anim.u0=prog(now);anim.t0=now;anim.dur=ms;}
/* request one step: steps now, or queues it (max one queued) while a transition runs; edge(dir) when there is no slide that way */
/* complete the running transition right now (its end frame), then start whatever was queued */
function finishNow(){if(!anim)return;if(raf)cancelAnimationFrame(raf);raf=0;const A=anim;anim=null;rawU=null;draw(A.i,A.dir>0?1:0);cur=A.to;stage.dataset.steps=String(++steps);prefetch(cur);if(gfx){cancelGrid();}land(A.done);}
function request(dir,edge){if(anim){if(pend)finishNow();if(anim){pend=dir;pendEdge=edge||null;hurry(350);return 'queued';}}
 if(canStep(dir)){step(dir);return 'step';}edge&&edge(dir);return 'edge';}
function flush(){if(!pend)return;const d=pend,e=pendEdge;pend=0;pendEdge=null;request(d,e);}
function stop(){if(gfx){gfx.land=null;cancelGrid();}anim=null;pend=0;pendEdge=null;if(raf)cancelAnimationFrame(raf);raf=0;}
/* jump to where the running transition was heading (used when the presentation closes mid-transition) */
function settle(){const to=anim?anim.to:cur;stop();show(to);return to;}
/* layout: fit the 1920x1080 artboard into a w x h box, 'contain' (letterbox) or 'cover' (crop), centred; k overrides the scale */
function layout(w,h,mode,k){k=k||(mode==='cover'?Math.max(w/W,h/H):Math.min(w/W,h/H));const ox=(w-W*k)/2,oy=(h-H*k)/2;
 root.style.transform=`translate(${ox}px,${oy}px) scale(${k})`;root.style.setProperty('--seam',Math.min(2,.5/(k*(devicePixelRatio||1))).toFixed(3)+'px');return k;}
/* canvas colour of the slide currently shown (theme-mapped), for letterbox / status bar */
function canvas(n){n=n===undefined?(stage.dataset.slide|0):n;const b=bgOf(n);return b?rgba(b):null;}
return{N,draw:(i,t)=>{build(i);draw(i,t);},show,step,request,hurry,stop,settle,cancelGrid,get gridDrawing(){return!!gfx;},prefetch,layout,canvas,canStep,ease:easeStep,easeFor,dur:DUR,labels:D.labels,
 get cur(){return cur;},get animating(){return!!anim||!!gfx;},get pending(){return pend;},get steps(){return steps;},get dark(){return dark;},
 ready:()=>Promise.all([...root.querySelectorAll('img')].map(im=>im.complete?0:new Promise(r=>{im.onload=im.onerror=r;})))};}
/* ---- wheel gesture detector, shared by the embed and the preview page. One physical gesture = one start.
   A new gesture starts after a gap of >120ms, on a direction change, or when the delta rises again after having decayed
   (a new trackpad swipe interrupting the previous swipe's inertia). Inertia tails only decay, so they never start one. */
function wheelDetector(){let last=-1e9,peak=0,low=Infinity,decay=false,dir=0,armed=false,t0=-1e9;
 return e=>{const now=e.timeStamp||performance.now();let dy=e.deltaY;if(e.deltaMode===1)dy*=16;else if(e.deltaMode===2)dy*=innerHeight;
  const a=Math.abs(dy),d=dy>0?1:dy<0?-1:0,gap=now-last;last=now;
  if(Math.abs(e.deltaX)>a)return null;
  let start=false;
  if(gap>120||(d&&dir&&d!==dir))start=true;
  else if(decay){if(a<low)low=a;else if(a>=Math.max(low*3,low+6)&&now-t0>180)start=true;}
  else{if(a>peak)peak=a;else if(a<peak*.7){decay=true;low=a;}}
  if(start){peak=a;low=Infinity;decay=false;armed=true;t0=now;}
  if(armed&&d&&a>=1){armed=false;dir=d;return{dir:d,fresh:start};}
  return null;};}
window.StudioDeck={create,wheelDetector};})();
