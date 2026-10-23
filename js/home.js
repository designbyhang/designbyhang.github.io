(()=>{const rail=document.getElementById('work'),strip=document.getElementById('strip'),dotsEl=document.getElementById('dots');
const mqR=matchMedia('(prefers-reduced-motion: reduce)'),mqM=matchMedia('(max-width:640px),(orientation:portrait) and (max-width:1024px)');
const cards=[...strip.children];let act=-1;
const dots=dotsEl?cards.map((k,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<i></i>';b.setAttribute('aria-label',`Card ${i+1} of ${cards.length}`+(k.id==='about'?': About':''));b.addEventListener('click',()=>{if(on)to(centers[i]-c0);else k.scrollIntoView({behavior:mqR.matches?'auto':'smooth',block:'center'});});dotsEl.appendChild(b);return b;}):[];
const thumb=dotsEl?dotsEl.appendChild(Object.assign(document.createElement('i'),{className:'dots-cur'})):null;
// liquid highlighter: centre follows the gauge exactly; width is a spring driven by velocity (lead edge leads, trail lags)
const BASE=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ring-d'))||24.2,K=380,DAMP=17,VK=.045,VMAX=14.8,LEAD=.32; // spring stiffness, damping, px of stretch per px/s, max stretch, lead share
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

const sfx=window.dbhSfx; // shared dial sound (js/sfx.js)
// screenX(p) = W/2 + (p - c0 - x)·s ; scale eases s0→1 over the first card's width, and back 1→s0 over the last (About)
function render(){const span=cw+parseFloat(getComputedStyle(strip).columnGap||0);
  const p=clamp(x/span,0,1),q=clamp((max-x)/span,0,1),s=Math.max(s0+(1-s0)*ease(p),s0+(1-s0)*ease(q));
  strip.style.transform=`translate3d(${(W/2-(c0+x)*s).toFixed(2)}px,0,0) scale(${s.toFixed(4)})`;
  strip.dataset.p=p.toFixed(3);if(on)sfx.move(x,span);if(on)navAct(x>max-span/2);
  let a=0,bd=1e9;centers.forEach((c,i)=>{const d=Math.abs(c-c0-x);if(d<bd){bd=d;a=i;}});
  if(thumb&&dots.length){let k=0;while(k<centers.length-2&&centers[k+1]-c0<x)k++;const f=clamp((x-(centers[k]-c0))/((centers[k+1]-centers[k])||1),0,1),d0=dots[k],d1=dots[k+1]||d0,p0=d0.offsetLeft+d0.offsetWidth/2,p1=d1.offsetLeft+d1.offsetWidth/2;blob.to(p0+(p1-p0)*f);
    const st=Math.abs(p1-p0)*Math.min(f,1-f)<1.5; /* within 1.5px of a dot centre = settled */
    if(st!==('settled' in dotsEl.dataset)){if(st){dotsEl.dataset.settled='';}else delete dotsEl.dataset.settled;}}
  if(a!==act){act=a;dots.forEach((b,i)=>b.setAttribute('aria-current',i===a?'true':'false'));}}
let tw=null;const eo=p=>1-Math.pow(1-p,3);
function loop(){if(tw){const p=Math.min(1,(performance.now()-tw.s)/tw.d);x=t=tw.a+(tw.b-tw.a)*(tw.e||eo)(p);if(p>=1){x=t=tw.b;tw=null;}}
  else{const d=t-x;x=Math.abs(d)<.3?t:x+d*.16;}
  render();raf=(tw||x!==t)?requestAnimationFrame(loop):0;}
// tap transitions (CTA, ABOUT, CASE STUDIES): one gentle glide, 1000ms easeInOutCubic, like a soft swipe
const GLIDE=1000;let gRaf=0;
function glide(i){const k=cards[i];if(!k)return;
  if(on){const b=clamp(centers[i]-c0,0,max);if(mqR.matches){tw=null;x=t=b;render();return;}tw={s:performance.now(),a:x,b,d:GLIDE,e:ease};t=b;if(!raf)raf=requestAnimationFrame(loop);return;}
  const r=k.getBoundingClientRect(),y1=i===0?0:Math.max(0,scrollY+r.top+r.height/2-innerHeight/2);
  if(mqR.matches){scrollTo(0,y1);return;}
  const de=document.documentElement,snap=de.style.scrollSnapType,sb=de.style.scrollBehavior,y0=scrollY,s0=performance.now();de.style.scrollSnapType='none';de.style.scrollBehavior='auto';cancelAnimationFrame(gRaf);
  const st=now=>{const p=Math.min(1,(now-s0)/GLIDE);scrollTo(0,y0+(y1-y0)*ease(p));if(p<1)gRaf=requestAnimationFrame(st);else{de.style.scrollSnapType=snap;de.style.scrollBehavior=sb;}};gRaf=requestAnimationFrame(st);}
['touchstart','wheel'].forEach(ev=>addEventListener(ev,()=>cancelAnimationFrame(gRaf),{passive:true}));
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
document.querySelector('.poster-cta')?.addEventListener('click',e=>{e.preventDefault();glide(cards.findIndex(k=>k.classList.contains('intro'))+1);});
document.querySelectorAll('a[href="#about"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();glide(cards.length-1);}));
document.querySelectorAll('a[href="#work"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();glide(0);}));
strip.addEventListener('click',e=>{const k=e.target.closest('.card');if(!k||e.target.closest('.poster-cta'))return;sfx.tap();const a=e.target.closest('a[href]');if(a){const ms=/projects\/([\w-]+)\.html/.exec(a.getAttribute('href'));if(ms)try{sessionStorage.setItem('dbh-ret',JSON.stringify({slug:ms[1],m:on?'h':'v',t,y:scrollY,ts:Date.now()}));}catch(_){}}if(a&&sfx.on&&!a.target&&!(e.metaKey||e.ctrlKey||e.shiftKey||e.button)){e.preventDefault();setTimeout(()=>{location.href=a.href;},90);}}); /* card tap click; 90ms so the click is heard before navigating */
window.__homeScale={to:v=>{t=x=clamp(v,0,max);render();},span:()=>cw+parseFloat(getComputedStyle(strip).columnGap||0),max:()=>max};
// header nav: active underline follows position (About card >50% in view)
let navA=null,navT=0;function navAct(ab){if(ab===navA)return;navA=ab;document.querySelectorAll('.top nav a').forEach(l=>{const on2=ab?l.hash==='#about':l.hash==='#work';l.classList.toggle('is-active',on2);if(on2)l.setAttribute('aria-current','page');else l.removeAttribute('aria-current');});}
const mTrack=()=>{if(on||!thumb||!dots.length)return;const vc=innerHeight/2;let a=0,bd=1e9;cards.forEach((k,i)=>{const r=k.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vc);if(d<bd){bd=d;a=i;}});
  const b=dots[a];blob.to(b.offsetLeft+b.offsetWidth/2);dotsEl.dataset.settled='';if(a!==act){act=a;dots.forEach((x,i)=>x.setAttribute('aria-current',i===a?'true':'false'));}const ab=cards[cards.length-1].getBoundingClientRect(),vis=Math.max(0,Math.min(ab.bottom,innerHeight)-Math.max(ab.top,0))/Math.min(ab.height,innerHeight);navAct(vis>.5);};
addEventListener('scroll',mTrack,{passive:true});addEventListener('resize',mTrack);setTimeout(mTrack,300);
addEventListener('resize',measure);mqR.addEventListener('change',measure);mqM.addEventListener('change',measure);
// return from a case study: put the card where it was (same layout) or centred (other layout / next-project), no intro replay
const R=window.__dbhRet,ri=R?cards.findIndex(k=>{const a=k.querySelector('a.hit');return a&&a.getAttribute('href')==='projects/'+R.slug+'.html';}):-1;
function restore(){if(ri<0)return;if(on){t=x=clamp(R.m==='h'&&typeof R.t==='number'?R.t:centers[ri]-c0,0,max);tw=null;render();return;}
  const de=document.documentElement,sb=de.style.scrollBehavior;de.style.scrollBehavior='auto';
  if(R.m==='v'&&typeof R.y==='number')scrollTo(0,R.y);else{const r=cards[ri].getBoundingClientRect();scrollTo(0,Math.max(0,scrollY+r.top+r.height/2-innerHeight/2));}
  de.style.scrollBehavior=sb;mTrack();}
if(ri>=0){measure();restore();(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{measure();restore();});addEventListener('load',restore,{once:true});}
// bfcache restore: page comes back exactly as left; just drop the stored target so the next fresh visit plays the intro
addEventListener('pageshow',e=>{if(e.persisted)try{sessionStorage.removeItem('dbh-ret');}catch(_){}});
(document.fonts?document.fonts.ready:Promise.resolve()).then(measure);measure();})();
// intro card: "HANG" construction poster (after Paul Rand) — letters cropped by solid hairline grid cells, mono words on grid lines
(()=>{const root=document.getElementById('poster');if(!root)return;const svg=root.querySelector('svg'),MP=matchMedia('(max-width:640px),(orientation:portrait) and (max-width:1024px)'),mqR=matchMedia('(prefers-reduced-motion: reduce)') /* portrait = the page's mobile-portrait query (the portrait card is wider than tall now) */;
const L={W:1200,H:683.4,
  xs:[110,330,392,610,830,880,1060],xe:[110,319.5,381.5,591,800.5,850.5,1060] /* v17: four letter columns equal (209.5) */,ys:[64,244,284,452,492,622],
  letters:[ // glyph, crop cell [x0,y0,x1,y1], font-size, x, baseline
    ['H',[110,64,330,244],360,104,316,'Vision'],
    ['A',[880,64,1060,244],360,868,316,'Strategy'],
    ['N',[392,284,610,452],360,396,536,'Systems'],
    ['G',[610,492,830,622],360,596,744]],
  words:[['Vision',110,284,330,452],['Strategy',392,64,610,244],['Systems',610,284,830,452],['Craft',880,492,1060,622],['Creativity',880,284,1060,452]], /* v18: each keyword centred in a big box */
  dims:[['V',90,64,244,'A',-1],['V',90,244,284,'C',-1],['V',1080,244,284,'B',1],['H',368,392,610,'D'],['H',368,610,830,'D'],['H',270,330,392,'C'],['V',850,284,452,'A',1]],
  dots:[[1060,452,5],[610,284,4],[330,452,5],[392,64,5],[830,244,5],[110,492,5],[392,622,5]],ring:[880,622],title:[114,610,40]},
P={W:600,H:600,
  xs:[50,300,550],xe:[50,300,550] /* mobile v20: two equal columns, two letter rows (H|N, A|G), no CTA row */,ys:[56,270,306,520,556] /* mobile v22: square card; label rows 36, letter rows 214 */,
  letters:[
    ['H',[50,56,300,270],300,44,316,'Vision'],
    ['N',[300,56,550,270],300,336,316,'Strategy'],
    ['A',[50,306,300,520],300,54,572,'Systems'],
    ['G',[300,306,550,520],300,296,560]],
  words:[['Vision',50,270],['Strategy',300,270],['Systems',50,520],['Creativity',300,520]],
  dims:[],
  dots:[[300,56,4],[550,520,4],[300,306,4],[300,556,4]],ring:[550,556],title:[54,806,40]};
const inkC=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
function inkL(ch,fs,top,bot,font,sc){const S=sc?Math.max(100,Math.round(fs*sc)):400,k=fs/S,pad=S*.3,base=S*1.2,cv=inkC.canvas;cv.width=S*2;cv.height=S*1.6;inkC.clearRect(0,0,cv.width,cv.height);inkC.font=font.replace('#',S+'px');inkC.fillStyle='#000';inkC.fillText(ch,pad,base);
  const y0=Math.max(0,Math.round(base+top/k)),y1=Math.min(cv.height,Math.round(base+bot/k));if(y1<=y0)return 0;const d=inkC.getImageData(0,y0,cv.width,y1-y0).data;let m=1e9;
  for(let y=0;y<y1-y0;y++)for(let x=0;x<m&&x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>127){m=x;break;}return m===1e9?0:(m-pad)*k;}
function inkT(ch,fs,font,sc){const S=Math.max(100,Math.round(fs*sc)),k=fs/S,base=S*1.2,cv=inkC.canvas;cv.width=S*2;cv.height=S*1.6;inkC.clearRect(0,0,cv.width,cv.height);inkC.font=font.replace('#',S+'px');inkC.fillStyle='#000';inkC.fillText(ch,S*.3,base);
  const d=inkC.getImageData(0,0,cv.width,cv.height).data;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>127)return(y-base)*k;return 0;}
const THIN_D=.7882 /* 16px at the 1440 design size */,THIN_P=1; /* thin-row height factors (desktop rows are empty; mobile keeps 22px for VISION/STRATEGY) */
function build(){const cw=root.clientWidth,ch=root.clientHeight,port=MP.matches,G0=port?P:L,px=G0.W/cw,VW=G0.W,VH=ch*px;
  // equal grid inset on all four sides (same cqi as the caption block); positions remap to the box, glyphs scale uniformly
  const YS=G0.ys,Bw0=YS[2]-YS[1],Bw=port?Bw0*THIN_P:Bw0*THIN_D /* v19: thinner keyword rows, height given to the big rows */,nR=Math.ceil((YS.length-1)/2),Rh=(YS[YS.length-1]-YS[0]-Math.floor((YS.length-1)/2)*Bw)/nR /* big rows + thin rows (mobile ends on a thin row) */,YN=YS.map((v,i)=>YS[0]+Math.ceil(i/2)*Rh+Math.floor(i/2)*Bw); // equal row bands
  const yq=y=>{for(let i=1;i<YS.length;i++)if(y<=YS[i]||i===YS.length-1)return YN[i-1]+(y-YS[i-1])*(YN[i]-YN[i-1])/(YS[i]-YS[i-1]);};
  const m=(port?.075294:.060924)*VW /* inset: 6.0924cqi = 64px at 1440 (card 1050.5px; was 6.5cqi = 68.3px); mobile 8cqi x 64/68 = 7.5294cqi */,gx0=G0.xs[0],gx1=G0.xs[G0.xs.length-1],gy0=G0.ys[0],gy1=G0.ys[G0.ys.length-1];
  const XS=G0.xs,XE=G0.xe,xq=x=>{for(let i=1;i<XS.length;i++)if(x<=XS[i]||i===XS.length-1)return XE[i-1]+(x-XS[i-1])*(XE[i]-XE[i-1])/(XS[i]-XS[i-1]);};
  const sx=(VW-2*m)/(gx1-gx0),sy=(VH-2*m)/(gy1-gy0),X=x=>m+(xq(x)-gx0)*sx,Y=y=>m+(yq(y)-gy0)*sy;
  const f=Math.max(1,(ch/G0.H)/(cw/G0.W)); // keep the earlier rendered size of the small marks
  const G={xs:G0.xs.map(X),ys:G0.ys.map(Y),
    letters:G0.letters.map(l=>{const c=[X(l[1][0]),Y(l[1][1]),X(l[1][2]),Y(l[1][3])],fs=l[2]*sx;return[l[0],c,fs,X(l[3]),c[1]+(l[4]-l[1][1])*sx,l[5]];}),
    words:G0.words.map(p=>p.length>4?[p[0],X(p[1]),Y(p[2]),X(p[3]),Y(p[4])]:[p[0],X(p[1]),Y(p[2])]),dots:G0.dots.map(d=>[X(d[0]),Y(d[1]),d[2]]),ring:[X(G0.ring[0]),Y(G0.ring[1])]};
  const mono=(()=>{const m0=12*px,mf0=getComputedStyle(document.documentElement).getPropertyValue('--mono').trim(),PADX=10*px,PADY=6*px;inkC.font=m0+'px '+mf0;inkC.letterSpacing=(.04*m0)+'px';let k=1;
    G.words.forEach(p=>{const t=inkC.measureText(p[0].toUpperCase()),iw=t.actualBoundingBoxRight+t.actualBoundingBoxLeft,bw=p.length>4?p[3]-p[1]:G.xs.find(v=>v>p[1]+.01)-p[1],nY=G.ys.find(v=>v>p[2]+.01),bh=p.length>4?p[4]-p[2]:nY-p[2];k=Math.min(k,(bw-2*PADX)/iw,(bh-2*PADY)/(.73*m0));});
    inkC.letterSpacing='0px';return m0*Math.max(.5,k);})();/* mono text 12px, scaled down (all keywords together) only when the narrowest keyword box can't fit it with 10px/6px padding, e.g. mobile landscape */let out='<defs>',body='';
  G.letters.forEach((l,i)=>{const c=l[1];out+=`<clipPath id="pc${i}"><rect x="${c[0]}" y="${c[1]}" width="${c[2]-c[0]}" height="${c[3]-c[1]}"/></clipPath>`;});out+='</defs>';
  const ln=(x1,y1,x2,y2,c,d)=>{body+=`<line class="${c} a ${x1===x2?'lv':'ln'}" style="--d:${d}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;};
  const y0=G.ys[0],y1=G.ys[G.ys.length-1],x0=G.xs[0],x1=G.xs[G.xs.length-1];
  /* grid draw-in (as in the Studio Model deck): one element per line, verticals alternate top->bottom / bottom->top at i*150ms,
     horizontals alternate left->right / right->left from 800ms, 1.7s each, cubic-bezier(.65,0,.35,1) (css .g.a / .rv).
     Then the letters slide in (1.1s, 110ms apart) from 0.2s before the last line lands; once they have landed all keywords fade in
     together (.wf, 0.7s); once that fade ends the CTA rises from its row (desktop); then the dots and the last dot (former ring). */
  const LS=1700,ST=150,HO=800,LEND=Math.max((G.xs.length-1)*ST,HO+(G.ys.length-1)*ST)+LS,TL=LEND-200,SQ=110,
    TW=TL+(G.letters.length-1)*SQ+1100,TC=TW+700,TD=port?TC:TC+SQ;
  G.xs.forEach((x,i)=>ln(x,y0,x,y1,'g'+(i%2?' rv':''),i*ST));G.ys.forEach((y,i)=>ln(x0,y,x1,y,'g'+(i%2?' rv':''),HO+i*ST));
  const FS=getComputedStyle(document.documentElement),sans=FS.getPropertyValue('--sans').trim(),mf=FS.getPropertyValue('--mono').trim(),CAP=.73,wo=5*sx;
  const gap0=(()=>{const h=G.letters.find(l=>l[5]),w=G.words.find(p=>p[0]===h[5]);return w[1]+wo+inkL('C',mono,-mono,0,'400 # '+mf)-h[1][0]; /* base gap: keyword inset measured on 'C' */})();
  // v11: one shared glyph size; each letter centred in its column (equal left/right ink gap), top gap = shared gap
  const SF='500 # '+sans,SC=(devicePixelRatio||1)/px;
  const inkLR=(ch,fs,top,bot)=>{const S=Math.max(100,Math.round(fs*SC)),k=fs/S,pad=S*.3,base=S*1.2,cv=inkC.canvas;cv.width=S*2;cv.height=S*1.6;inkC.clearRect(0,0,cv.width,cv.height);inkC.font=SF.replace('#',S+'px');inkC.fillStyle='#000';inkC.fillText(ch,pad,base);
    const y0=Math.max(0,Math.round(base+top/k)),y1=Math.min(cv.height,Math.round(base+bot/k));if(y1<=y0)return[0,0];const d=inkC.getImageData(0,y0,cv.width,y1-y0).data;let L=1e9,R=-1;
    for(let y=0;y<y1-y0;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>127){if(x<L)L=x;if(x>R)R=x;}return L===1e9?[0,0]:[(L-pad)*k,(R+1-pad)*k];};
  const place=(l,fs,t=gap0)=>{const c=l[1],base=c[1]+t-(port&&l[0]==='G'?2*inkT('H',fs,SF,SC)-inkT('G',fs,SF,SC):inkT(l[0],fs,SF,SC)) /* mobile: G raised by twice its overshoot over H (optical, per Hang) */,e=inkLR(l[0],fs,c[1]-base,c[3]-base-2/SC);return{base,e};};
  const T=.08*(G.letters[0][1][2]-G.letters[0][1][0]); /* v17 letter padding: 8% of the (equal) column width, ~H's earlier padding */
  // v17: one shared size; every letter's top gap = T (H's padding); the widest ink (G) gets side gaps = gap0, all letters centred in equal columns
  let fs=Infinity;G.letters.forEach(l=>{const c=l[1],w=c[2]-c[0],e=inkLR(l[0],100,-1000,1000);fs=Math.min(fs,100*(w-2*T)/(e[1]-e[0]));});
  for(let it=0;it<4;it++){let f2=Infinity;G.letters.forEach(l=>{const c=l[1],e=place(l,fs,T).e;f2=Math.min(f2,fs*(c[2]-c[0]-2*T)/(e[1]-e[0]));});fs=f2;}
  let TT=T;if(port){const Hc=G.letters.find(l=>l[0]==='H')[1],Hw=Hc[2]-Hc[0];for(let j=0;j<4;j++){const e=place(G.letters.find(l=>l[0]==='H'),fs,TT).e;TT=(Hw-(e[1]-e[0]))/2;}} /* mobile v22: top gap = H's side gap (size unchanged) */
  G.letters.forEach(l=>{const c=l[1],q=place(l,fs,TT);l[2]=fs;l[4]=q.base;l[3]=c[0]+((c[2]-c[0])-(q.e[1]-q.e[0]))/2-q.e[0];l[6]=l[3]+q.e[0];l[7]=q.e[1]-q.e[0];});
  /* intro-card letters: custom HANG outlines, same cells + same shared-size rule as the live letters (one size: widest visible ink = column - 2T; top gap T;
     centred on visible ink; mobile: top gap = H side gap, G raised 2x its overshoot). l[8..10] keep the live text's x/size/baseline for the slide proxy. */
  {const HL=window.HangLetters;let s=Infinity;G.letters.forEach(l=>{l[8]=l[3];l[9]=l[2];l[10]=l[4];});
  const lay=(l,s,t)=>{const c=l[1],base=c[1]+t+(port&&l[0]==='G'?692:704)*s,e=HL.inkX(l[0],(base-c[3])/s,(base-c[1])/s);return{base,e};};
  G.letters.forEach(l=>{const c=l[1],b=HL.bounds(l[0]);s=Math.min(s,(c[2]-c[0]-2*T)/(b[2]-b[0]));});
  for(let it=0;it<6;it++){let s2=Infinity;G.letters.forEach(l=>{const c=l[1],e=lay(l,s,T).e;s2=Math.min(s2,(c[2]-c[0]-2*T)/(e[1]-e[0]));});s=s2;}
  let TT=T;if(port){const H=G.letters.find(l=>l[0]==='H'),Hw=H[1][2]-H[1][0];for(let j=0;j<4;j++){const e=lay(H,s,TT).e;TT=(Hw-(e[1]-e[0])*s)/2;}}
  G.letters.forEach(l=>{const c=l[1],q=lay(l,s,TT),w=(q.e[1]-q.e[0])*s;l[2]=s;l[4]=q.base;l[3]=c[0]+((c[2]-c[0])-w)/2-q.e[0]*s;l[6]=l[3]+q.e[0]*s;l[7]=w;});}
  
  // v13: each keyword's ink-left = ink-left of the big letter in its column (no letter in column -> nearest letter column)
  const colL=(x,y)=>{const L=G.letters.filter(l=>x>=l[1][0]-.01&&x<l[1][2]-.01).sort((a,b)=>Math.abs(y-a[1][3])-Math.abs(y-b[1][3]));if(L.length)return L[0];return G.letters.slice().sort((a,b)=>Math.abs(a[1][0]-x)-Math.abs(b[1][0]-x))[0];};
  const Hl=G.letters.find(l=>l[0]==='H'),wx=p=>{const L=colL(p[1],p[2]);const nb=G.ys.find(v=>v>p[2]+.01)-p[2],adj=Math.abs(p[2]-L[1][3])<1||Math.abs(p[2]+nb-L[1][1])<1;return (p[3]||L[0]==='G'&&!adj?p[1]+(Hl[6]-Hl[1][0]):L[6])-inkL(p[0][0].toUpperCase(),mono,-mono,0,'400 # '+mf,SC);};
  const lx=l=>l[3];
  G.letters.forEach((l,i)=>{body+=`<g clip-path="url(#pc${i})"><g class="w lt a" style="--d:${TL+i*SQ}"><text fill-opacity="0" x="${lx([0,0,0,l[8]]).toFixed(2)}" y="${l[10].toFixed(2)}" font-size="${l[9].toFixed(2)}" font-weight="500">${l[0]}</text><path fill-rule="evenodd" d="${window.HangLetters.path(l[0],l[3],l[4],l[2])}"/></g></g>`;});
  const bandB=y=>{const n=G.ys.find(v=>v>y+.01);return n-y;},inkVt=(str,fpx,font)=>{const S=8,F=fpx*S,cv=document.createElement('canvas'),c2=cv.getContext('2d',{willReadFrequently:true});const w=Math.ceil(F*str.length)+20,h=Math.ceil(F*2),b=Math.round(F*1.4);cv.width=w;cv.height=h;c2.font=font.replace('#',F+'px');c2.fillText(str,10,b);const d=c2.getImageData(0,0,w,h).data;let t0=-1,t1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>127){if(t0<0)t0=y;t1=y;break;}return[(b-t0)/S,(t1+1-b)/S];},
  wb=p=>{const v=inkVt(p[0].toUpperCase(),mono,'400 # '+mf);return (p.length>4?(p[2]+p[4])/2:p[2]+bandB(p[2])/2)+(v[0]-v[1])/2-(port?0:.85*px);}; /* v18: centre the pixel-measured ink; desktop: -.85px measured rasterisation offset of the scaled intro card */
  const wc=p=>{inkC.font=mono+'px '+mf;inkC.letterSpacing=(.04*mono)+'px';const t=inkC.measureText(p[0].toUpperCase());inkC.letterSpacing='0px';const iw=t.actualBoundingBoxRight+t.actualBoundingBoxLeft;const L=G.letters.find(l=>l[5]===p[0]);let c;if(p.length>4)c=(p[1]+p[3])/2;else if(L)c=L[6]+L[7]/2;else{const nx=G.xs.find(v=>v>p[1]+.01);c=(p[1]+nx)/2;}return c-iw/2+t.actualBoundingBoxLeft;}; /* PREVIEW center-words: keyword ink centred on its letter's ink; CRAFT centred in its box */
  G.words.forEach(p=>{body+=`<text class="m a wf" style="--d:${TW}" x="${wc(p).toFixed(2)}" y="${wb(p).toFixed(2)}" font-size="${mono}">${p[0]}</text>`;});
  G.dots.forEach((d,i)=>{body+=`<circle class="a" style="--d:${TD+i*60}" fill="#eeeeee" cx="${d[0]}" cy="${d[1]}" r="${2.5*px}"/>`;});
  const R=G.ring;body+=`<circle class="a" style="--d:${TD+150}" fill="#eeeeee" cx="${R[0]}" cy="${R[1]}" r="${2.5*px}"/>`; // former ring: now a plain 5px dot
  svg.setAttribute('viewBox',`0 0 ${VW} ${VH}`);svg.style.setProperty('--gw',px);svg.setAttribute('preserveAspectRatio','none');svg.innerHTML=out+body;
  // knockouts: card colour behind mono words so grid lines stop short of the type
  /* knockouts use the card token var(--c-paper) via CSS (no computed snapshot: it went stale/mid-fade on theme toggle) */const kp=3*px;
  svg.querySelectorAll('text.m').forEach(t=>{const b=t.getBBox(),r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('class','ko a wf');r.setAttribute('style',t.getAttribute('style'));
    const lx0=G.words.find(w=>w[0]===t.textContent)[1]+1.5*px,rx=Math.max(b.x-kp,lx0);r.setAttribute('x',rx);r.setAttribute('y',b.y);r.setAttribute('width',b.x+b.width+kp-rx);r.setAttribute('height',b.height);t.before(r);});
  // caption: same ink gap from the grid lines as the H/A/N letters
  const cap=port?null:root.querySelector('.poster-cap');if(cap){const H=G.letters.find(l=>l[5]),wH=G.words.find(p=>p[0]===H[5]),gp=(wH[1]+wo+inkL(wH[0][0].toUpperCase(),mono,-mono,0,'400 # '+mf)-H[1][0])/px,mp=m/px;
    const tt=cap.querySelector('.poster-title'),ts=getComputedStyle(tt),tf=parseFloat(ts.fontSize);
    const tl=inkL(tt.textContent.trim()[0],tf,-tf,0,'400 # '+sans,devicePixelRatio||1);inkC.font='400 '+ts.fontSize+' '+ts.fontFamily;const mt=inkC.measureText('S'),inkV=(()=>{const S=8,str=tt.textContent.trim(),fpx=tf*S,cv=document.createElement('canvas'),c2=cv.getContext('2d',{willReadFrequently:true});c2.font='400 '+fpx+'px '+ts.fontFamily;c2.letterSpacing=ts.letterSpacing==='normal'?'0px':(parseFloat(ts.letterSpacing)*S)+'px';const w=Math.ceil(c2.measureText(str).width)+20,h=Math.ceil(fpx*2),b=Math.round(fpx*1.4);cv.width=w;cv.height=h;c2.font='400 '+fpx+'px '+ts.fontFamily;c2.fillText(str,10,b);const d=c2.getImageData(0,0,w,h).data;let t0=-1,t1=-1;for(let y=0;y<h;y++){for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>127){if(t0<0)t0=y;t1=y;break;}}return[(b-t0)/S,(t1+1-b)/S];})(),capH=inkV[0]-inkV[1] /* v18: pixel-measured ink of the CTA text (ascenders..baseline incl. overshoot) */,below=(tf-(mt.fontBoundingBoxAscent+mt.fontBoundingBoxDescent))/2+mt.fontBoundingBoxDescent;
    // vertically centre the caption's cap height in the bottom grid row
    const rT=G.ys[G.ys.length-2],rB=G.ys[G.ys.length-1],baseY=((rT+rB)/2)/px+capH/2;
    const LC=G.letters.filter(l=>Math.abs(l[1][0]-G.xs[0])<.01).sort((a,b)=>b[1][1]-a[1][1])[0];{const ar=tt.querySelector('.arr'),inkW=ar.offsetLeft+ar.offsetWidth-tt.offsetLeft-tl /* layout offsets: unaffected by the nudge transform */,Gl=G.letters.find(l=>l[0]==='G'),sL=G.xs[0]/px,sR=Gl[1][0]/px;cap.style.left=((sL+sR)/2-inkW/2-tl).toFixed(2)+'px';} /* v19: CTA ink (text + arrow) centred horizontally in the boxes left of the G (CTA hidden on mobile portrait) */const pb=document.createElement('span');pb.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';tt.appendChild(pb);const belowD=(tt.getBoundingClientRect().bottom-pb.getBoundingClientRect().top)/(tt.getBoundingClientRect().width/tt.offsetWidth||1);pb.remove(); /* v18: real baseline-to-box-bottom (the arrow svg grows the line box) */
    cap.style.bottom=(VH/px-baseY-belowD).toFixed(2)+'px';cap.style.translate='-.58px -.38px'; /* measured: text in the scaled desktop card rasterises ~.45px low */
    /* CTA rises from the bottom of its row: the cap (static) clips to the row band, the button slides (css/home.css) */
    const cT=ch-parseFloat(cap.style.bottom)-cap.offsetHeight,yT=rT/px-cT,yB=rB/px-cT;cap.style.clipPath=`polygon(-50% ${yT.toFixed(2)}px,150% ${yT.toFixed(2)}px,150% ${yB.toFixed(2)}px,-50% ${yB.toFixed(2)}px)`;
    cap.style.setProperty('--rise',(yB-tt.offsetTop).toFixed(2)+'px');cap.style.setProperty('--cd',TC+'ms');}
  }
let lp=null,rt=0,bw=0,bh=0;const rb=()=>{const port=MP.matches;if(port!==lp){lp=port;build();bw=root.offsetWidth;bh=root.offsetHeight;}};
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{lp=null;rb();});rb();
addEventListener('resize',()=>rbs());
/* rotation: rebuild whenever the card's real size changes (iOS fires resize before layout settles, leaving a stretched viewBox) */
const rbs=()=>{clearTimeout(rt);const w=root.offsetWidth,h=root.offsetHeight;if(Math.abs(w-bw)<=1&&Math.abs(h-bh)<=1&&root.style.visibility!=='hidden')return;root.style.visibility='hidden';rt=setTimeout(()=>{const w2=root.offsetWidth,h2=root.offsetHeight;if(Math.abs(w2-bw)>1||Math.abs(h2-bh)>1||MP.matches!==lp){lp=null;rb();}requestAnimationFrame(()=>requestAnimationFrame(()=>{root.style.visibility='';}));},500);}; /* rotation/resize: hide, wait until the size stops changing, rebuild once, show (one draw-in) */if(window.ResizeObserver)new ResizeObserver(rbs).observe(root);addEventListener('orientationchange',rbs);
// mobile portrait: once the draw-in finishes, glide the first project card into view (once; cancelled by any user input; never with reduced motion)
let done=false,raf=0;
const stop=e=>{if(e&&e.type==='scroll'&&performance.now()-(window.__dbhNudge||-1e9)<400)return; /* theme.js's 1px bar re-sample nudge is not user input */done=true;cancelAnimationFrame(raf);ev.forEach(e=>removeEventListener(e,stop,true));},ev=['wheel','touchstart','pointerdown','keydown','scroll'];
const go=()=>{if(done)return;const live=document.getAnimations().filter(a=>a.effect&&root.contains(a.effect.target)&&isFinite(a.effect.getComputedTiming().endTime)&&a.playState!=='finished');if(live.length)return;
  setTimeout(()=>{if(done||!MP.matches||mqR.matches||scrollY>2){stop();return;}const k=root.closest('.card')?.nextElementSibling;if(!k){stop();return;}
    ev.forEach(e=>removeEventListener(e,stop,true));const de=document.documentElement,snap=de.style.scrollSnapType,hd=document.querySelector('.top'),fx=hd&&/fixed|sticky/.test(getComputedStyle(hd).position)?hd.offsetHeight:0,
      y1=Math.max(0,scrollY+k.getBoundingClientRect().top-fx-16),y0=scrollY,t0=performance.now(),D=900,e=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,end=()=>{done=true;cancelAnimationFrame(raf);de.style.scrollSnapType=snap;['wheel','touchstart','pointerdown','keydown'].forEach(x=>removeEventListener(x,end,true));};
    ['wheel','touchstart','pointerdown','keydown'].forEach(x=>addEventListener(x,end,{capture:true,passive:true}));de.style.scrollSnapType='none';
    const st=n=>{if(done)return;const p=Math.min(1,(n-t0)/D);scrollTo({top:y0+(y1-y0)*e(p),behavior:'instant'});if(p<1)raf=requestAnimationFrame(st);else end();};raf=requestAnimationFrame(st);},400);};
if(MP.matches&&!mqR.matches&&scrollY<3&&!window.__dbhRet){ev.forEach(e=>addEventListener(e,stop,{capture:true,passive:true}));root.addEventListener('animationend',go);}
window.__posterAuto=()=>({done});})();
