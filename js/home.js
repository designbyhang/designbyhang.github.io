(()=>{const rail=document.getElementById('work'),strip=document.getElementById('strip'),dotsEl=document.getElementById('dots');
const mqR=matchMedia('(prefers-reduced-motion: reduce)'),mqM=matchMedia('(max-width:640px)');
const cards=[...strip.children];let act=-1;
const dots=dotsEl?cards.map((k,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<i></i>';b.setAttribute('aria-label',`Card ${i+1} of ${cards.length}`+(k.id==='about'?': About':''));b.addEventListener('click',()=>{cancelSnap();to(centers[i]-c0);});dotsEl.appendChild(b);return b;}):[];
const thumb=dotsEl?dotsEl.appendChild(Object.assign(document.createElement('i'),{className:'dots-cur'})):null;
// liquid highlighter: centre follows the gauge exactly; width is a spring driven by velocity (lead edge leads, trail lags)
const BASE=15,K=380,DAMP=17,VK=.045,VMAX=10,LEAD=.32; // spring stiffness, damping, px of stretch per px/s, max stretch, lead share
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
// soft snap: after input goes idle, ease the nearest card to centre (time-based ease-out, interruptible)
let tw=null,snapT=0;const eo=p=>1-Math.pow(1-p,3);
function loop(){if(tw){const p=Math.min(1,(performance.now()-tw.s)/tw.d);x=t=tw.a+(tw.b-tw.a)*eo(p);if(p>=1){x=t=tw.b;tw=null;}}
  else{const d=t-x;x=Math.abs(d)<.3?t:x+d*.16;}
  render();raf=(tw||x!==t)?requestAnimationFrame(loop):0;}
function nearest(v){let b=centers[0]-c0,bd=1e9;centers.forEach(c=>{const d=Math.abs(c-c0-v);if(d<bd){bd=d;b=c-c0;}});return clamp(b,0,max);}
// directional: from the card centred when the gesture began, go one card in the gesture's direction
// (or further on a fling, to the first card past the current position); jitter under TH snaps back
let gest=null;const TH=8;
function gestStart(){if(!gest&&on){const n=nearest(t);gest={i:centers.findIndex(c=>Math.abs(c-c0-n)<.5),t0:t};}}
function snap(){if(!on||sx!=null)return;const g=gest;gest=null;let b=nearest(t);
  if(g&&g.i>=0){const net=t-g.t0,pos=centers.map(c=>c-c0),n=pos.length;let k=g.i;
    if(net>TH){k=g.i+1;for(let i=g.i+1;i<n;i++){k=i;if(pos[i]>=t-.5)break;}}
    else if(net<-TH){k=g.i-1;for(let i=g.i-1;i>=0;i--){k=i;if(pos[i]<=t+.5)break;}}
    k=clamp(k,0,n-1);b=clamp(pos[k],0,max);}
  if(Math.abs(b-x)<.5&&Math.abs(b-t)<.5){x=t=b;render();return;}
  if(mqR.matches){tw=null;x=t=b;render();return;}
  tw={a:x,b,s:performance.now(),d:600};if(!raf)raf=requestAnimationFrame(loop);}
function cancelSnap(){clearTimeout(snapT);gest=null;}
function snapSoon(){clearTimeout(snapT);snapT=setTimeout(snap,140);}
function to(v){if(!on)return;tw=null;t=clamp(v,0,max);if(mqR.matches){x=t;render();return;}if(!raf)raf=requestAnimationFrame(loop);}
addEventListener('wheel',e=>{if(!on||e.ctrlKey)return;if(e.target.closest&&e.target.closest('.scroll')&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){const sc=e.target.closest('.scroll');if(sc.scrollHeight>sc.clientHeight+1)return;}
  e.preventDefault();gestStart();const k=e.deltaMode===1?16:e.deltaMode===2?W:1;to(t+(e.deltaX+e.deltaY)*k);snapSoon();},{passive:false});
// touch / pen drag
let sx=null,sy,st,lock=null;
rail.addEventListener('touchstart',e=>{if(!on)return;clearTimeout(snapT);tw=null;gestStart();const q=e.touches[0];sx=q.clientX;sy=q.clientY;st=t;lock=null;},{passive:true});
rail.addEventListener('touchmove',e=>{if(!on||sx==null)return;const q=e.touches[0],dx=q.clientX-sx,dy=q.clientY-sy;
  if(lock==null&&Math.hypot(dx,dy)>6)lock=Math.abs(dx)>Math.abs(dy)?'x':'y';
  if(lock){e.preventDefault();to(st-(lock==='x'?dx:dy)*1.4);}},{passive:false});
rail.addEventListener('touchend',()=>{sx=null;if(on)snapSoon();},{passive:true});
// keys: card to card
function idx(){let i=0,b=1e9;centers.forEach((c,j)=>{const d=Math.abs(c-c0-t);if(d<b){b=d;i=j;}});return i;}
addEventListener('keydown',e=>{if(!on||e.target.closest('input,textarea'))return;if(/^(Arrow|Page|Home|End)/.test(e.key))cancelSnap();
  const m={ArrowRight:1,PageDown:1,ArrowDown:1,ArrowLeft:-1,PageUp:-1,ArrowUp:-1}[e.key];
  if(m){e.preventDefault();to(centers[clamp(idx()+m,0,cards.length-1)]-c0);}
  if(e.key==='Home'){e.preventDefault();to(0);}if(e.key==='End'){e.preventDefault();to(max);}});
// keep focused links in view
strip.addEventListener('focusin',e=>{const k=e.target.closest('.card');if(k&&on)to(centers[cards.indexOf(k)]-c0);});
document.querySelector('a[href="#about"]')?.addEventListener('click',e=>{if(on){e.preventDefault();cancelSnap();to(max);}});
window.__homeScale={to:v=>{t=x=clamp(v,0,max);render();},span:()=>cw+parseFloat(getComputedStyle(strip).columnGap||0),max:()=>max};
addEventListener('resize',measure);mqR.addEventListener('change',measure);mqM.addEventListener('change',measure);
(document.fonts?document.fonts.ready:Promise.resolve()).then(measure);measure();})();
// intro card: Swiss construction poster — words snapped to a dotted grid, drawn in on load, slots reshuffle per visit
(()=>{const root=document.getElementById('poster');if(!root)return;const svg=root.querySelector('svg');const NS='http://www.w3.org/2000/svg';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const L={W:1200,H:683.4,cols:12,rows:7},P={W:600,H:871.5,cols:6,rows:9};
function build(){const port=root.clientWidth/root.clientHeight<1,G=port?P:L,cx=G.W/G.cols,cy=G.H/G.rows,X=c=>c*cx,Y=r=>r*cy;
  svg.setAttribute('viewBox',`0 0 ${G.W} ${G.H}`);svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  const px=G.W/root.clientWidth,mono=13*px,small=12*px;let out='',d=0;
  const ln=(x1,y1,x2,y2,c,del)=>{out+=`<line class="${c} a ${x1===x2?'lv':'ln'}" style="--d:${del}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;};
  const tx=(s,x,y,cls,fs,o={})=>{const t=`<text class="${cls} a ${o.anim||'wd'}" style="--d:${o.d||0}" x="${x}" y="${y}" font-size="${fs}"${o.w?` font-weight="${o.w}"`:''}>${s}</text>`;out+=o.rot?`<g transform="rotate(-90 ${x} ${y})">${t}</g>`:t;};
  // dotted grid
  for(let c=1;c<G.cols;c++)ln(X(c),0,X(c),G.H,'g',c*25);
  for(let r=1;r<G.rows;r++)ln(0,Y(r),G.W,Y(r),'g',100+r*25);
  // dimension marker: vertical bracket with label
  const dimV=(x,y1,y2,lab,del,side=1)=>{ln(x,y1,x,y2,'hl',del);ln(x-6,y1,x+6,y1,'hl',del);ln(x-6,y2,x+6,y2,'hl',del);tx(lab,x+side*14-(side<0?mono*.6:0),(y1+y2)/2+mono*.35,'mk',mono,{d:del+150,anim:''});};
  const dimH=(y,x1,x2,lab,del)=>{ln(x1,y,x2,y,'hl',del);ln(x1,y-6,x1,y+6,'hl',del);ln(x2,y-6,x2,y+6,'hl',del);tx(lab,(x1+x2)/2-mono*.3,y-12,'mk',mono,{d:del+150,anim:''});};
  const sq=(x,y,del)=>{out+=`<rect class="a" style="--d:${del}" fill="#111" x="${x-4}" y="${y-4}" width="8" height="8"/>`;};
  const dot=(x,y,r,del)=>{out+=`<circle class="a" style="--d:${del}" fill="#111" cx="${x}" cy="${y}" r="${r}"/>`;};
  const ring=(x,y,r,del)=>{out+=`<circle class="hl a" style="--d:${del}" cx="${x}" cy="${y}" r="${r}"/>`;};
  const node=(c0,c1,r0,r1,del)=>{for(let c=c0;c<=c1;c++)ln(X(c),Y(r0)-cy*.35,X(c),Y(r1)+cy*.35,'h nd',del+c*20);for(let r=r0;r<=r1;r++)ln(X(c0)-cx*.35,Y(r),X(c1)+cx*.35,Y(r),'h nd',del+60+r*20);for(let c=c0;c<=c1;c++)for(let r=r0;r<=r1;r++)sq(X(c),Y(r),del+300+(c+r)*25);};
  const glyph=(s,x,y,fs)=>{out+=`<text class="bg a" style="--d:120" x="${x}" y="${y}" font-size="${fs}" font-weight="500">${s}</text>`;};
  if(!port){
    const sh=pick([0,1]);
    glyph('H',X(7)+sh*cx,Y(7)+110,900);
    [[6,8],[8,8],[10,8]].forEach(([c,r],i)=>ring(X(c-sh*0),Y(r),cx*2.4,600+i*80));
    node(6,10,1,3,200);
    tx('Craft',X(0)+24,Y(2),'w',190,{w:500,d:300});
    tx('Systems',X(6)+10,Y(2)-12,'w',54,{d:520});
    tx('Product',X(7)+10,Y(3)-10,'w',40,{d:620});
    tx('Strategy',X(8)+10,Y(3)+38,'w',28,{d:720});
    tx('Interaction',X(11)-8,Y(4.6),'w',30,{rot:1,d:820});
    dot(X(11),Y(1),36,900);const md=pick([[8.5,1.5],[9.5,1.5]]);dot(X(md[0]),Y(md[1]),15,950);dot(X(pick([9.5,10.5])),Y(2.5),8,1000);dot(X(4.5),Y(4.5),5,1050);
    dimV(X(5)+26,Y(2)-133,Y(2),'A',1100);
    dimH(Y(1)-18,X(6),X(7),'C',1150);
    dimV(X(10)+18,Y(1),Y(2),'B',1200);
    const notes=['Hang Zheng','Senior Product Designer','Meta 2020–2026','Citi 2017–2020','10+ years'];
    notes.forEach((n,i)=>tx(n,X(0)+30,Y(3)+i*mono*1.5,'m',mono,{d:1250+i*50,anim:''}));
    out+=`<rect class="a" style="--d:1500" fill="#111" x="${X(0)+30}" y="${Y(3)+4*mono*1.5+mono*1.3}" width="${cx*.7}" height="${cy*.07}"/>`;
    const intro=['Product Designer with 10+ years in','interaction design and product strategy,','turning ambiguous, complex problems','into user experiences and systems','that scale.'];
    intro.forEach((n,i)=>tx(n,X(0)+30,Y(5)+small*.9+i*small*1.32,'s',small,{d:1550+i*50,anim:''}));
  }else{
    const sh=pick([0,1]);
    glyph('H',X(2.5)-sh*cx*.5,Y(9)+60,700);
    [[2,10],[3.5,10],[5,10]].forEach(([c,r],i)=>ring(X(c),Y(r),cx*2,600+i*80));
    node(2,5,2,4,200);
    tx('Craft',X(0)+20,Y(1.6),'w',150,{w:500,d:300});
    tx('Systems',X(2)+10,Y(3)-12,'w',48,{d:520});
    tx('Product',X(3)+10,Y(4)-10,'w',34,{d:620});
    tx('Strategy',X(4)+10,Y(4)+34,'w',24,{d:720});
    tx('Interaction',X(6)-10,Y(6.2),'w',28,{rot:1,d:820});
    dot(X(5),Y(1),30,900);dot(X(4.5),Y(2.5),13,950);dot(X(2.5),Y(3.5),7,1000);dot(X(0.5),Y(4.6),4,1050);
    dimV(X(4)+18,Y(1.6)-105,Y(1.6),'A',1100);
    dimV(X(5)+18,Y(2),Y(3),'B',1150);
    const notes=['Hang Zheng','Senior Product Designer','Meta 2020–2026','Citi 2017–2020','10+ years'];
    notes.forEach((n,i)=>tx(n,X(0)+20,Y(5)+i*mono*1.5,'m',mono,{d:1250+i*50,anim:''}));
    out+=`<rect class="a" style="--d:1500" fill="#111" x="${X(0)+20}" y="${Y(5)+4*mono*1.5+mono*1.3}" width="${cx*.7}" height="${cy*.07}"/>`;
    const intro=['Product Designer with 10+ years in interaction','design and product strategy, turning ambiguous,','complex problems into user experiences and','systems that scale.'];
    intro.forEach((n,i)=>tx(n,X(0)+20,Y(7)+small*.6+i*small*1.38,'s',small,{d:1550+i*50,anim:''}));
  }
  svg.innerHTML=out;}
let lastPort=null;const rb=()=>{const port=root.clientWidth/root.clientHeight<1;if(port!==lastPort||!svg.childNodes.length){lastPort=port;build();}else{/* keep composition; rescale mono via rebuild only on orientation change */}};
(document.fonts?document.fonts.ready:Promise.resolve()).then(rb);rb();addEventListener('resize',()=>{lastPort=null;rb();});})();
