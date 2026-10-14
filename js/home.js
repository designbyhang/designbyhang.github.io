(()=>{const rail=document.getElementById('work'),strip=document.getElementById('strip'),cur=document.querySelector('.ticks-cur'),track=document.querySelector('.ticks-in');
const mqR=matchMedia('(prefers-reduced-motion: reduce)'),mqM=matchMedia('(max-width:640px)');
const cards=[...strip.children];
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
  if(cur&&track)cur.style.transform=`translate3d(${(max?x/max:0)*(track.offsetWidth-18)}px,0,0)`;}
function loop(){const d=t-x;x=Math.abs(d)<.3?t:x+d*.16;render();raf=x!==t?requestAnimationFrame(loop):0;}
function to(v){if(!on)return;t=clamp(v,0,max);if(mqR.matches){x=t;render();return;}if(!raf)raf=requestAnimationFrame(loop);}
addEventListener('wheel',e=>{if(!on||e.ctrlKey)return;if(e.target.closest&&e.target.closest('.scroll')&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){const sc=e.target.closest('.scroll');if(sc.scrollHeight>sc.clientHeight+1)return;}
  e.preventDefault();const k=e.deltaMode===1?16:e.deltaMode===2?W:1;to(t+(e.deltaX+e.deltaY)*k);},{passive:false});
// touch / pen drag
let sx=null,sy,st,lock=null;
rail.addEventListener('touchstart',e=>{if(!on)return;const q=e.touches[0];sx=q.clientX;sy=q.clientY;st=t;lock=null;},{passive:true});
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
