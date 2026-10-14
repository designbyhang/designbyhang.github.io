(()=>{const rail=document.getElementById('work'),strip=document.getElementById('strip'),dotsEl=document.getElementById('dots');
const mqR=matchMedia('(prefers-reduced-motion: reduce)'),mqM=matchMedia('(max-width:640px)');
const cards=[...strip.children];let act=-1;
const dots=dotsEl?cards.map((k,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<i></i>';b.setAttribute('aria-label',`Card ${i+1} of ${cards.length}`+(k.id==='about'?': About':''));b.addEventListener('click',()=>to(centers[i]-c0));dotsEl.appendChild(b);return b;}):[];
const thumb=dotsEl?dotsEl.appendChild(Object.assign(document.createElement('i'),{className:'dots-cur'})):null;
// liquid highlighter: centre follows the gauge exactly; width is a spring driven by velocity (lead edge leads, trail lags)
const BASE=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ring-d'))||24.2,K=380,DAMP=17,VK=.045,VMAX=10,LEAD=.32; // spring stiffness, damping, px of stretch per px/s, max stretch, lead share
const blob={c:null,pc:null,w:BASE,wv:0,v:0,dir:1,raf:0,last:0,
  to(c){if(this.c===null){this.c=this.pc=c;}this.c=c;if(!this.raf){this.last=performance.now();this.raf=requestAnimationFrame(t=>this.step(t));}},
  step(now){const dt=Math.min(.05,(now-this.last)/1000)||.016;this.last=now;
    const inst=(this.c-this.pc)/dt;this.pc=this.c;this.v+=(inst-this.v)*Math.min(1,dt*30);if(Math.abs(this.v)>1)this.dir=Math.sign(this.v);
    const red=mqR.matches,wt=red?BASE:BASE+Math.min(VMAX,Math.abs(this.v)*VK);
    this.wv+=(-K*(this.w-wt)-DAMP*this.wv)*dt;this.w+=this.wv*dt;if(red){this.w=BASE;this.wv=0;}
    const w=Math.max(BASE*.9,this.w),off=this.dir*(w-BASE)*LEAD;
    thumb.style.width=w.toFixed(2)+'px';thumb.style.transform=`translate3d(${(this.c+off-w/2).toFixed(2)}px,0,0)`;
    const busy=Math.abs(this.v)>.5||Math.abs(this.w-BASE)>.02||Math.abs(this.wv)>.05;
    if(busy)this.raf=requestAnimationFrame(t=>this.step(t));else{this.raf=0;this.v=0;this.w=BASE;thumb.style.width=BASE+'px';thumb.style.transform=`translate3d(${(this.c-BASE/2).toFixed(2)}px,0,0)`;}}};
let W,H,cw,ch,c0,centers,max,s0,t=0,x=0,raf=0,on=false;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
function measure(){on=!mqM.matches;if(!on){strip.style.transform='';return;}
  W=rail.clientWidth;H=rail.clientHeight;strip.style.transform='none';
  centers=cards.map(k=>k.offsetLeft+k.offsetWidth/2);cw=cards[0].offsetWidth;ch=cw*.569444;c0=centers[0];
  max=centers[centers.length-1]-c0;
  // landing: intro ≈73% of viewport width, capped so it fits ~62% of the rail height
  s0=mqR.matches?1:Math.max(1,Math.min(.73*W/cw,.82*H/ch));
  t=clamp(t,0,max);x=t;render();}
// screenX(p) = W/2 + (p - c0 - x)·s ; scale eases s0→1 over the first card's width, and back 1→s0 over the last (About)
function render(){const span=cw+parseFloat(getComputedStyle(strip).columnGap||0);
  const p=clamp(x/span,0,1),q=clamp((max-x)/span,0,1),s=Math.max(s0+(1-s0)*ease(p),s0+(1-s0)*ease(q));
  strip.style.transform=`translate3d(${(W/2-(c0+x)*s).toFixed(2)}px,0,0) scale(${s.toFixed(4)})`;
  strip.dataset.p=p.toFixed(3);
  let a=0,bd=1e9;centers.forEach((c,i)=>{const d=Math.abs(c-c0-x);if(d<bd){bd=d;a=i;}});
  if(thumb&&dots.length){let k=0;while(k<centers.length-2&&centers[k+1]-c0<x)k++;const f=clamp((x-(centers[k]-c0))/((centers[k+1]-centers[k])||1),0,1),d0=dots[k],d1=dots[k+1]||d0,p0=d0.offsetLeft+d0.offsetWidth/2,p1=d1.offsetLeft+d1.offsetWidth/2;blob.to(p0+(p1-p0)*f);
    const st=Math.abs(p1-p0)*Math.min(f,1-f)<1.5; /* within 1.5px of a dot centre = settled */
    if(st!==('settled' in dotsEl.dataset)){if(st)dotsEl.dataset.settled='';else delete dotsEl.dataset.settled;}}
  if(a!==act){act=a;dots.forEach((b,i)=>b.setAttribute('aria-current',i===a?'true':'false'));}}
let tw=null;const eo=p=>1-Math.pow(1-p,3);
function loop(){if(tw){const p=Math.min(1,(performance.now()-tw.s)/tw.d);x=t=tw.a+(tw.b-tw.a)*eo(p);if(p>=1){x=t=tw.b;tw=null;}}
  else{const d=t-x;x=Math.abs(d)<.3?t:x+d*.16;}
  render();raf=(tw||x!==t)?requestAnimationFrame(loop):0;}
function to(v){if(!on)return;tw=null;t=clamp(v,0,max);if(mqR.matches){x=t;render();return;}if(!raf)raf=requestAnimationFrame(loop);}
addEventListener('wheel',e=>{if(!on||e.ctrlKey)return;if(e.target.closest&&e.target.closest('.scroll')&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){const sc=e.target.closest('.scroll');if(sc.scrollHeight>sc.clientHeight+1)return;}
  e.preventDefault();const k=e.deltaMode===1?16:e.deltaMode===2?W:1;to(t+(e.deltaX+e.deltaY)*k);},{passive:false});
// touch / pen drag
let sx=null,sy,st,lock=null;
rail.addEventListener('touchstart',e=>{if(!on)return;tw=null;const q=e.touches[0];sx=q.clientX;sy=q.clientY;st=t;lock=null;},{passive:true});
rail.addEventListener('touchmove',e=>{if(!on||sx==null)return;const q=e.touches[0],dx=q.clientX-sx,dy=q.clientY-sy;
  if(lock==null&&Math.hypot(dx,dy)>6)lock=Math.abs(dx)>Math.abs(dy)?'x':'y';
  if(lock){e.preventDefault();to(st-(lock==='x'?dx:dy)*1.4);}},{passive:false});
rail.addEventListener('touchend',()=>{sx=null;},{passive:true});
// keys: card to card
function idx(){let i=0,b=1e9;centers.forEach((c,j)=>{const d=Math.abs(c-c0-t);if(d<b){b=d;i=j;}});return i;}
addEventListener('keydown',e=>{if(!on||e.target.closest('input,textarea'))return;
  const m={ArrowRight:1,PageDown:1,ArrowDown:1,ArrowLeft:-1,PageUp:-1,ArrowUp:-1}[e.key];
  if(m){e.preventDefault();to(centers[clamp(idx()+m,0,cards.length-1)]-c0);}
  if(e.key==='Home'){e.preventDefault();to(0);}if(e.key==='End'){e.preventDefault();to(max);}});
// keep focused links in view
strip.addEventListener('focusin',e=>{const k=e.target.closest('.card');if(k&&on)to(centers[cards.indexOf(k)]-c0);});
document.querySelector('a[href="#about"]')?.addEventListener('click',e=>{if(on){e.preventDefault();to(max);}});
window.__homeScale={to:v=>{t=x=clamp(v,0,max);render();},span:()=>cw+parseFloat(getComputedStyle(strip).columnGap||0),max:()=>max};
addEventListener('resize',measure);mqR.addEventListener('change',measure);mqM.addEventListener('change',measure);
(document.fonts?document.fonts.ready:Promise.resolve()).then(measure);measure();})();
// intro card: "HANG" construction poster (after Paul Rand) — letters cropped by dotted grid cells, mono words on grid lines
(()=>{const root=document.getElementById('poster');if(!root)return;const svg=root.querySelector('svg');
const L={W:1200,H:683.4,
  xs:[110,330,392,610,830,880,1060],ys:[64,244,284,452,492,622],
  letters:[ // glyph, crop cell [x0,y0,x1,y1], font-size, x, baseline
    ['H',[110,64,330,244],360,104,316],
    ['A',[880,64,1060,244],360,868,316],
    ['N',[330,284,392,452],360,334,536],
    ['G',[610,492,830,622],360,596,744]],
  words:[['Craft',110,244],['Visual',610,244],['UI',880,244],['UX',610,452],['Systems',830,452],['Strategy',392,452]],
  dims:[['V',90,64,244,'A',-1],['V',90,244,284,'C',-1],['V',1080,244,284,'B',1],['H',368,392,610,'D'],['H',368,610,830,'D'],['H',270,330,392,'C'],['V',850,284,452,'A',1]],
  tris:[[392,284],[830,492]],dots:[[1060,452,5],[610,284,4]],ring:[880,622],title:[114,610,40]},
P={W:600,H:871.5,
  xs:[50,290,346,550],ys:[56,226,262,432,468,638,674,820],
  letters:[
    ['H',[50,56,290,226],300,44,266],
    ['A',[346,56,550,226],300,336,266],
    ['N',[290,262,346,432],300,292,472],
    ['G',[50,468,290,638],300,40,678]],
  words:[['Craft',50,226],['Visual',346,226],['Systems',50,638],['UI',290,638],['UX',346,638],['Strategy',50,432]],
  dims:[['V',30,56,226,'A',-1],['V',30,226,262,'C',-1],['V',570,226,262,'B',1],['H',248,290,346,'C'],['V',30,468,638,'A',-1],['H',553,290,550,'D']],
  tris:[[290,262],[346,674]],dots:[[550,432,4],[550,820,4]],ring:[550,674],title:[54,806,40]};
function build(){const port=root.clientWidth/root.clientHeight<1,G=port?P:L,px=G.W/root.clientWidth,mono=11*px;let out='<defs>',body='';
  G.letters.forEach((l,i)=>{const c=l[1];out+=`<clipPath id="pc${i}"><rect x="${c[0]}" y="${c[1]}" width="${c[2]-c[0]}" height="${c[3]-c[1]}"/></clipPath>`;});out+='</defs>';
  const ln=(x1,y1,x2,y2,c,d)=>{body+=`<line class="${c} a ${x1===x2?'lv':'ln'}" style="--d:${d}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;};
  const y0=G.ys[0],y1=G.ys[G.ys.length-1],x0=G.xs[0],x1=G.xs[G.xs.length-1];
  G.xs.forEach((x,i)=>ln(x,y0,x,y1,'g',i*40));G.ys.forEach((y,i)=>ln(x0,y,x1,y,'g',120+i*40));
  G.letters.forEach((l,i)=>{body+=`<g clip-path="url(#pc${i})"><text class="w lt a" style="--d:${500+i*110}" x="${l[3]}" y="${l[4]}" font-size="${l[2]}" font-weight="500">${l[0]}</text></g>`;});
  G.words.forEach((p,i)=>{body+=`<text class="m a" style="--d:${1050+i*60}" x="${p[1]+5}" y="${p[2]+mono*1.5}" font-size="${mono}">${p[0]}</text>`;});
  const ts=port?22:26;G.tris.forEach((t,i)=>{body+=`<polygon class="a" style="--d:${1400+i*60}" fill="#111" points="${t[0]},${t[1]} ${t[0]+ts},${t[1]} ${t[0]},${t[1]+ts}"/>`;});
  G.dots.forEach((d,i)=>{body+=`<circle class="a" style="--d:${1500+i*60}" fill="#111" cx="${d[0]}" cy="${d[1]}" r="${d[2]*px*.9}"/>`;});
  const R=G.ring,rr=7.5*px;body+=`<circle class="dk a" style="--d:1650" cx="${R[0]}" cy="${R[1]}" r="${rr-.5*px}"/><circle class="a" style="--d:1700" fill="#111" cx="${R[0]}" cy="${R[1]}" r="${2*px}"/>`;
  svg.setAttribute('viewBox',`0 0 ${G.W} ${G.H}`);svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.innerHTML=out+body;}
let lp=null,rt=0;const rb=()=>{const port=root.clientWidth/root.clientHeight<1;if(port!==lp){lp=port;build();}};
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{lp=null;rb();});rb();
addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{lp=null;rb();},150);});})();
