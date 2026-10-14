(()=>{const rail=document.getElementById('work'),strip=document.getElementById('strip'),dotsEl=document.getElementById('dots');
const mqR=matchMedia('(prefers-reduced-motion: reduce)'),mqM=matchMedia('(max-width:640px)');
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
// screenX(p) = W/2 + (p - c0 - x)·s ; scale eases s0→1 over the first card's width, and back 1→s0 over the last (About)
function render(){const span=cw+parseFloat(getComputedStyle(strip).columnGap||0);
  const p=clamp(x/span,0,1),q=clamp((max-x)/span,0,1),s=Math.max(s0+(1-s0)*ease(p),s0+(1-s0)*ease(q));
  strip.style.transform=`translate3d(${(W/2-(c0+x)*s).toFixed(2)}px,0,0) scale(${s.toFixed(4)})`;
  strip.dataset.p=p.toFixed(3);
  if(dotsEl)dotsEl.style.setProperty('--gy',(H/2+ch*s/2+40).toFixed(1)+'px'); // gauge sits 40px below the scaled cards
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
document.querySelector('.poster-cta')?.addEventListener('click',e=>{const i=cards.findIndex(k=>k.classList.contains('intro'))+1;if(!cards[i])return;e.preventDefault();if(on)to(centers[i]-c0);else cards[i].scrollIntoView({behavior:mqR.matches?'auto':'smooth',block:'start'});});
document.querySelector('a[href="#about"]')?.addEventListener('click',e=>{if(on){e.preventDefault();to(max);}});
window.__homeScale={to:v=>{t=x=clamp(v,0,max);render();},span:()=>cw+parseFloat(getComputedStyle(strip).columnGap||0),max:()=>max};
const mTrack=()=>{if(on||!thumb||!dots.length)return;const vc=innerHeight/2;let a=0,bd=1e9;cards.forEach((k,i)=>{const r=k.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vc);if(d<bd){bd=d;a=i;}});
  const b=dots[a];blob.to(b.offsetLeft+b.offsetWidth/2);dotsEl.dataset.settled='';if(a!==act){act=a;dots.forEach((x,i)=>x.setAttribute('aria-current',i===a?'true':'false'));}};
addEventListener('scroll',mTrack,{passive:true});addEventListener('resize',mTrack);setTimeout(mTrack,300);
addEventListener('resize',measure);mqR.addEventListener('change',measure);mqM.addEventListener('change',measure);
(document.fonts?document.fonts.ready:Promise.resolve()).then(measure);measure();})();
// intro card: "HANG" construction poster (after Paul Rand) — letters cropped by solid hairline grid cells, mono words on grid lines
(()=>{const root=document.getElementById('poster');if(!root)return;const svg=root.querySelector('svg');
const L={W:1200,H:683.4,
  xs:[110,330,392,610,830,880,1060],ys:[64,244,284,452,492,622],
  letters:[ // glyph, crop cell [x0,y0,x1,y1], font-size, x, baseline
    ['H',[110,64,330,244],360,104,316,'Craft'],
    ['A',[880,64,1060,244],360,868,316,'Vision'],
    ['N',[392,284,610,452],360,396,536,'Strategy'],
    ['G',[610,492,830,622],360,596,744]],
  words:[['Craft',110,244],['Vision',880,244],['Systems',830,452],['Strategy',392,452]],
  dims:[['V',90,64,244,'A',-1],['V',90,244,284,'C',-1],['V',1080,244,284,'B',1],['H',368,392,610,'D'],['H',368,610,830,'D'],['H',270,330,392,'C'],['V',850,284,452,'A',1]],
  dots:[[1060,452,5],[610,284,4],[330,452,5]],ring:[880,622],title:[114,610,40]},
P={W:600,H:871.5,
  xs:[50,290,346,550],ys:[56,226,262,432,468,638,674,820],
  letters:[
    ['H',[50,56,290,226],300,44,266,'Craft'],
    ['A',[346,56,550,226],300,336,266,'Vision'],
    ['N',[50,262,290,432],300,54,472,'Strategy'],
    ['G',[50,468,290,638],300,40,678]],
  words:[['Craft',50,226],['Systems',50,638],['Vision',346,638],['Strategy',50,432]],
  dims:[['V',30,56,226,'A',-1],['V',30,226,262,'C',-1],['V',570,226,262,'B',1],['H',248,290,346,'C'],['V',30,468,638,'A',-1],['H',553,290,550,'D']],
  dots:[[550,432,4],[550,820,4],[290,262,4]],ring:[550,674],title:[54,806,40]};
const inkC=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
function inkL(ch,fs,top,bot,font,sc){const S=sc?Math.max(100,Math.round(fs*sc)):400,k=fs/S,pad=S*.3,base=S*1.2,cv=inkC.canvas;cv.width=S*2;cv.height=S*1.6;inkC.clearRect(0,0,cv.width,cv.height);inkC.font=font.replace('#',S+'px');inkC.fillStyle='#000';inkC.fillText(ch,pad,base);
  const y0=Math.max(0,Math.round(base+top/k)),y1=Math.min(cv.height,Math.round(base+bot/k));if(y1<=y0)return 0;const d=inkC.getImageData(0,y0,cv.width,y1-y0).data;let m=1e9;
  for(let y=0;y<y1-y0;y++)for(let x=0;x<m&&x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>127){m=x;break;}return m===1e9?0:(m-pad)*k;}
function inkT(ch,fs,font,sc){const S=Math.max(100,Math.round(fs*sc)),k=fs/S,base=S*1.2,cv=inkC.canvas;cv.width=S*2;cv.height=S*1.6;inkC.clearRect(0,0,cv.width,cv.height);inkC.font=font.replace('#',S+'px');inkC.fillStyle='#000';inkC.fillText(ch,S*.3,base);
  const d=inkC.getImageData(0,0,cv.width,cv.height).data;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>127)return(y-base)*k;return 0;}
function build(){const cw=root.clientWidth,ch=root.clientHeight,port=cw/ch<1,G0=port?P:L,px=G0.W/cw,VW=G0.W,VH=ch*px;
  // equal grid inset on all four sides (same cqi as the caption block); positions remap to the box, glyphs scale uniformly
  const YS=G0.ys,Bw=YS[2]-YS[1],nR=Math.ceil(YS.length/2),Rh=(YS[YS.length-1]-YS[0]-(nR-1)*Bw)/nR,YN=YS.map((v,i)=>YS[0]+Math.ceil(i/2)*Rh+Math.floor(i/2)*Bw); // equal row bands
  const yq=y=>{for(let i=1;i<YS.length;i++)if(y<=YS[i]||i===YS.length-1)return YN[i-1]+(y-YS[i-1])*(YN[i]-YN[i-1])/(YS[i]-YS[i-1]);};
  const m=(port?.08:.065)*VW,gx0=G0.xs[0],gx1=G0.xs[G0.xs.length-1],gy0=G0.ys[0],gy1=G0.ys[G0.ys.length-1];
  const sx=(VW-2*m)/(gx1-gx0),sy=(VH-2*m)/(gy1-gy0),X=x=>m+(x-gx0)*sx,Y=y=>m+(yq(y)-gy0)*sy;
  const f=Math.max(1,(ch/G0.H)/(cw/G0.W)); // keep the earlier rendered size of the small marks
  const G={xs:G0.xs.map(X),ys:G0.ys.map(Y),
    letters:G0.letters.map(l=>{const c=[X(l[1][0]),Y(l[1][1]),X(l[1][2]),Y(l[1][3])],fs=l[2]*sx;return[l[0],c,fs,X(l[3]),c[1]+(l[4]-l[1][1])*sx,l[5]];}),
    words:G0.words.map(p=>[p[0],X(p[1]),Y(p[2])]),dots:G0.dots.map(d=>[X(d[0]),Y(d[1]),d[2]]),ring:[X(G0.ring[0]),Y(G0.ring[1])]};
  const mono=12*px;/* all mono text 12px */let out='<defs>',body='';
  G.letters.forEach((l,i)=>{const c=l[1];out+=`<clipPath id="pc${i}"><rect x="${c[0]}" y="${c[1]}" width="${c[2]-c[0]}" height="${c[3]-c[1]}"/></clipPath>`;});out+='</defs>';
  const ln=(x1,y1,x2,y2,c,d)=>{body+=`<line class="${c} a ${x1===x2?'lv':'ln'}" style="--d:${d}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;};
  const y0=G.ys[0],y1=G.ys[G.ys.length-1],x0=G.xs[0],x1=G.xs[G.xs.length-1];
  G.xs.forEach((x,i)=>ln(x,y0,x,y1,'g',i*40));G.ys.forEach((y,i)=>ln(x0,y,x1,y,'g',120+i*40));
  const FS=getComputedStyle(document.documentElement),sans=FS.getPropertyValue('--sans').trim(),mf=FS.getPropertyValue('--mono').trim(),CAP=.73,wo=5*sx;
  const gap0=(()=>{const h=G.letters.find(l=>l[5]),w=G.words.find(p=>p[0]===h[5]);return w[1]+wo+inkL(w[0][0].toUpperCase(),mono,-mono,0,'400 # '+mf)-h[1][0];})();
  // v11: one shared glyph size; each letter centred in its column (equal left/right ink gap), top gap = shared gap
  const SF='500 # '+sans,SC=(devicePixelRatio||1)/px;
  const inkLR=(ch,fs,top,bot)=>{const S=Math.max(100,Math.round(fs*SC)),k=fs/S,pad=S*.3,base=S*1.2,cv=inkC.canvas;cv.width=S*2;cv.height=S*1.6;inkC.clearRect(0,0,cv.width,cv.height);inkC.font=SF.replace('#',S+'px');inkC.fillStyle='#000';inkC.fillText(ch,pad,base);
    const y0=Math.max(0,Math.round(base+top/k)),y1=Math.min(cv.height,Math.round(base+bot/k));if(y1<=y0)return[0,0];const d=inkC.getImageData(0,y0,cv.width,y1-y0).data;let L=1e9,R=-1;
    for(let y=0;y<y1-y0;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>127){if(x<L)L=x;if(x>R)R=x;}return L===1e9?[0,0]:[(L-pad)*k,(R+1-pad)*k];};
  const place=(l,fs)=>{const c=l[1],base=c[1]+gap0-inkT(l[0],fs,SF,SC),e=inkLR(l[0],fs,c[1]-base,c[3]-base-2/SC);return{base,e};};
  let fs=Infinity;G.letters.forEach(l=>{const c=l[1],w=c[2]-c[0],e=inkLR(l[0],100,-1000,1000);fs=Math.min(fs,100*(w-2*gap0)/(e[1]-e[0]));});
  for(let it=0;it<3;it++){let f2=Infinity;G.letters.forEach(l=>{const c=l[1],e=place(l,fs).e;f2=Math.min(f2,fs*(c[2]-c[0]-2*gap0)/(e[1]-e[0]));});fs=f2;}
  G.letters.forEach(l=>{const c=l[1],q=place(l,fs);l[2]=fs;l[4]=q.base;l[3]=c[0]+((c[2]-c[0])-(q.e[1]-q.e[0]))/2-q.e[0];l[6]=l[3]+q.e[0];});
  // v13: each keyword's ink-left = ink-left of the big letter in its column (no letter in column -> nearest letter column)
  const colL=(x,y)=>{const L=G.letters.filter(l=>x>=l[1][0]-.01&&x<l[1][2]-.01).sort((a,b)=>Math.abs(y-a[1][3])-Math.abs(y-b[1][3]));if(L.length)return L[0];return G.letters.slice().sort((a,b)=>Math.abs(a[1][0]-x)-Math.abs(b[1][0]-x))[0];};
  const Hl=G.letters.find(l=>l[0]==='H'),wx=p=>{const L=colL(p[1],p[2]);return (L[0]==='G'?p[1]+(Hl[6]-Hl[1][0]):L[6])-inkL(p[0][0].toUpperCase(),mono,-mono,0,'400 # '+mf,SC);};
  const lx=l=>l[3];
  G.letters.forEach((l,i)=>{body+=`<g clip-path="url(#pc${i})"><text class="w lt a" style="--d:${500+i*110}" x="${lx(l).toFixed(2)}" y="${l[4].toFixed(2)}" font-size="${l[2].toFixed(2)}" font-weight="500">${l[0]}</text></g>`;});
  const bandB=y=>{const n=G.ys.find(v=>v>y+.01);return n-y;},wb=p=>p[2]+bandB(p[2])/2+mono*CAP/2;
  G.words.forEach((p,i)=>{body+=`<text class="m a" style="--d:${1050+i*60}" x="${wx(p).toFixed(2)}" y="${wb(p).toFixed(2)}" font-size="${mono}">${p[0]}</text>`;});
  G.dots.forEach((d,i)=>{body+=`<circle class="a" style="--d:${1500+i*60}" fill="#eeeeee" cx="${d[0]}" cy="${d[1]}" r="${2.5*px}"/>`;});
  const R=G.ring;body+=`<circle class="a" style="--d:1650" fill="#eeeeee" cx="${R[0]}" cy="${R[1]}" r="${2.5*px}"/>`; // former ring: now a plain 5px dot
  svg.setAttribute('viewBox',`0 0 ${VW} ${VH}`);svg.setAttribute('preserveAspectRatio','none');svg.innerHTML=out+body;
  // knockouts: card colour behind mono words so grid lines stop short of the type
  const ko=getComputedStyle(root.closest('.media-wrap')).backgroundColor;root.style.setProperty('--ko',ko&&ko!=='rgba(0, 0, 0, 0)'?ko:'#fff');const kp=3*px;
  svg.querySelectorAll('text.m').forEach(t=>{const b=t.getBBox(),r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('class','ko a');r.setAttribute('style',t.getAttribute('style'));
    const lx0=G.words.find(w=>w[0]===t.textContent)[1]+1.5*px,rx=Math.max(b.x-kp,lx0);r.setAttribute('x',rx);r.setAttribute('y',b.y);r.setAttribute('width',b.x+b.width+kp-rx);r.setAttribute('height',b.height);t.before(r);});
  // caption: same ink gap from the grid lines as the H/A/N letters
  const cap=root.querySelector('.poster-cap');if(cap){const H=G.letters.find(l=>l[5]),wH=G.words.find(p=>p[0]===H[5]),gp=(wH[1]+wo+inkL(wH[0][0].toUpperCase(),mono,-mono,0,'400 # '+mf)-H[1][0])/px,mp=m/px;
    const tt=cap.querySelector('.poster-title'),ts=getComputedStyle(tt),tf=parseFloat(ts.fontSize);
    const tl=inkL(tt.textContent.trim()[0],tf,-tf,0,'400 # '+sans,devicePixelRatio||1);inkC.font='400 '+ts.fontSize+' '+ts.fontFamily;const mt=inkC.measureText('S'),capH=mt.actualBoundingBoxAscent,below=(tf-(mt.fontBoundingBoxAscent+mt.fontBoundingBoxDescent))/2+mt.fontBoundingBoxDescent;
    // vertically centre the caption's cap height in the bottom grid row
    const rT=G.ys[G.ys.length-2],rB=G.ys[G.ys.length-1],baseY=((rT+rB)/2)/px+capH/2;
    const LC=G.letters.filter(l=>Math.abs(l[1][0]-G.xs[0])<.01).sort((a,b)=>b[1][1]-a[1][1])[0];cap.style.left=(LC[6]/px-tl).toFixed(2)+'px';cap.style.bottom=(VH/px-baseY-below).toFixed(2)+'px';}
  }
let lp=null,rt=0;const rb=()=>{const port=root.clientWidth/root.clientHeight<1;if(port!==lp){lp=port;build();}};
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{lp=null;rb();});rb();
addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{lp=null;rb();},150);});})();
