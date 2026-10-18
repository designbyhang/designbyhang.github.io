/* Studio Model presentation embed (studio.html). The deck (studio-deck.js) sits in the section's media container, cover-fitted.
   When the container's centre crosses the viewport centre while scrolling down, it expands (FLIP, steep ease) into a fullscreen
   presentation; while open, one wheel gesture / swipe / key press = one transition. Stepping past the last slide (or back
   before the first) collapses it into the container and the page scrolls on. Entering from below starts at the last slide.
   Esc or CLOSE collapses at any time. */
(()=>{const host=document.getElementById('deck');if(!host||!window.StudioDeck)return;
const stage=host.querySelector('.deck-stage'),inner=host.querySelector('.deck-inner');
const de=document.documentElement,body=document.body,rm=matchMedia('(prefers-reduced-motion: reduce)');
const fs=document.createElement('div');fs.className='deck-fs';fs.hidden=true;fs.tabIndex=-1;
fs.setAttribute('role','dialog');fs.setAttribute('aria-modal','true');fs.setAttribute('aria-label','Studio Model presentation');
fs.innerHTML='<button type="button" class="deck-x" aria-label="Close presentation"><span class="t">CLOSE</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg></button><p class="deck-n" aria-hidden="true"></p>';
body.appendChild(fs);
const btn=fs.querySelector('.deck-x'),cnt=fs.querySelector('.deck-n');
let state='closed',y0=0,armed=true,prevC=null,suppress=0,raf=0;
const deck=StudioDeck.create({inner,stage,onSlide:n=>{cnt.textContent=String(n+1).padStart(2,'0')+' / '+String(window.__STUDIO__.slides.length).padStart(2,'0');if(state!=='closed')chrome();},onTheme:()=>{if(state!=='closed')chrome();}});
const N=deck.N;cnt.textContent='01 / '+String(N).padStart(2,'0');
/* steep ease shared with the deck transitions */
const ease=deck.ease,DUR=650;
const W=1920,H=1080,lerp=(a,b,t)=>a+(b-a)*t;
function fitBox(x,y,w,h,k){stage.style.left=x+'px';stage.style.top=y+'px';stage.style.width=w+'px';stage.style.height=h+'px';deck.layout(w,h,null,k);}
const kCover=(w,h)=>Math.max(w/W,h/H),kContain=(w,h)=>Math.min(w/W,h/H);
function fitClosed(){if(state!=='closed')return;const w=host.clientWidth,h=host.clientHeight;if(w&&h)deck.layout(w,h,'cover');}
const vw=()=>fs.clientWidth||innerWidth,vh=()=>fs.clientHeight||innerHeight;
function fitOpen(){if(state==='open')fitBox(0,0,vw(),vh(),kContain(vw(),vh()));}
if(window.ResizeObserver)new ResizeObserver(fitClosed).observe(host);
addEventListener('resize',()=>{fitClosed();fitOpen();});
/* status bar + overscroll colour follow the fullscreen canvas while open; restored to the site values on close */
function setMeta(c){document.querySelectorAll('meta[name="theme-color"]').forEach(x=>x.remove());const m=document.createElement('meta');m.name='theme-color';m.content=c;document.head.appendChild(m);de.style.backgroundColor=c;}
function canvasColor(){return deck.canvas()||(deck.dark?'#000000':'#f1f1f1');}
function chrome(){const c=canvasColor();fs.style.background=state==='open'?c:'';setMeta(c);}
function restoreChrome(){setMeta(de.dataset.theme==='dark'?'#111111':'#ededed');}
/* scroll lock that also holds on iOS Safari: pin the body at -scrollY, restore the exact position afterwards */
function lock(){y0=scrollY;const s=body.style;s.position='fixed';s.top=-y0+'px';s.left='0';s.right='0';s.width='100%';s.overflow='hidden';}
function unlock(){const s=body.style;s.position=s.top=s.left=s.right=s.width=s.overflow='';scrollTo({top:y0,left:0,behavior:'instant'});}
function anim(from,to,done){cancelAnimationFrame(raf);const t0=performance.now();
 const tick=now=>{const u=rm.matches?1:Math.min(1,(now-t0)/DUR),e=ease(u),T=to();
  const w=lerp(from.w,T.w,e),h=lerp(from.h,T.h,e);fitBox(lerp(from.x,T.x,e),lerp(from.y,T.y,e),w,h,lerp(from.k,T.k,e));
  if(u<1)raf=requestAnimationFrame(tick);else{raf=0;done();}};
 raf=requestAnimationFrame(tick);}
const hostBox=()=>{const r=stage.parentNode===host?stage.getBoundingClientRect():host.getBoundingClientRect(),b=host.clientLeft||0;
 const x=r.left+(stage.parentNode===host?0:b),y=r.top+(stage.parentNode===host?0:b),w=host.clientWidth,h=host.clientHeight;return{x,y,w,h,k:kCover(w,h)};};
const fullBox=()=>({x:0,y:0,w:vw(),h:vh(),k:kContain(vw(),vh())});
function open(n){if(state!=='closed')return;const from=hostBox();lock();state='opening';de.classList.add('deck-open');
 deck.stop();deck.show(n);fs.hidden=false;fs.appendChild(stage);stage.classList.add('is-fs');fitBox(from.x,from.y,from.w,from.h,from.k);chrome();
 wOwner='land';wLast=performance.now();tStart=null;
 anim(from,fullBox,()=>{state='open';chrome();fitOpen();fs.focus({preventScroll:true});});}
function close(){if(state!=='open'&&state!=='opening')return;deck.stop();pendingKey=0;const from={...fullBox()};state='closing';fs.style.background='';
 unlock();restoreChrome();
 anim(from,hostBox,()=>{host.appendChild(stage);stage.classList.remove('is-fs');stage.style.left=stage.style.top=stage.style.width=stage.style.height='';
  fs.hidden=true;state='closed';de.classList.remove('deck-open');armed=false;prevC=null;fitClosed();if(fs.contains(document.activeElement)||document.activeElement===fs)host.focus({preventScroll:true});});}
/* trigger: container centre crosses the viewport centre (down -> open at the first slide, up -> open at the last) */
function watch(){if(state!=='closed'||suppress)return;const r=host.getBoundingClientRect(),c=r.top+r.height/2,m=innerHeight/2;
 if(!armed){if(Math.abs(c-m)>innerHeight*.3)armed=true;prevC=c;return;}
 if(prevC!==null&&r.bottom>0&&r.top<innerHeight){if(prevC>m&&c<=m)open(0);else if(prevC<m&&c>=m)open(N-1);}
 prevC=c;}
let sraf=0;addEventListener('scroll',()=>{if(!sraf)sraf=requestAnimationFrame(()=>{sraf=0;watch();});},{passive:true});
/* in-page jumps (TOC, back to top) pass through without opening the presentation */
let sTimer=0;const quiet=()=>{clearTimeout(sTimer);sTimer=setTimeout(()=>{suppress=0;prevC=null;removeEventListener('scroll',quiet);},250);};
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;suppress=1;prevC=null;addEventListener('scroll',quiet,{passive:true});quiet();},true);
/* stepping while open */
let pendingKey=0;
function act(dir){if(state!=='open')return;if(deck.canStep(dir))deck.step(dir,()=>{if(pendingKey){const d=pendingKey;pendingKey=0;act(d);}});else if(!deck.animating)close();}
const GAP=180,TOUCH_PX=30;let wLast=-1e9,wOwner=null;
addEventListener('wheel',e=>{if(state==='closed')return;e.preventDefault();const now=performance.now(),dy=e.deltaY,dx=e.deltaX;
 if((now-wLast)>GAP&&!deck.animating&&state==='open')wOwner=null;wLast=now;
 if(state!=='open'||wOwner)return;if(Math.abs(dx)>Math.abs(dy)||Math.abs(dy)<1)return;
 wOwner='done';act(dy>0?1:-1);},{passive:false});
let tStart=null;
addEventListener('touchstart',e=>{if(state!=='open'||e.touches.length!==1||e.target.closest('.deck-x,.theme-btn')){tStart=null;return;}const t=e.touches[0];tStart={y:t.clientY,x:t.clientX,t:performance.now(),done:false};},{passive:true});
addEventListener('touchmove',e=>{if(state==='closed')return;e.preventDefault();if(!tStart||state!=='open')return;const t=e.touches[0],dy=tStart.y-t.clientY;tStart.ly=t.clientY;
 if(!tStart.done&&Math.abs(dy)>=TOUCH_PX&&Math.abs(dy)>=Math.abs(tStart.x-t.clientX)){tStart.done=true;act(dy>0?1:-1);}},{passive:false});
addEventListener('touchend',e=>{if(!tStart)return;const s=tStart;tStart=null;if(s.done||state!=='open')return;
 const t=e.changedTouches&&e.changedTouches[0],ey=t?t.clientY:(s.ly??s.y),dy=s.y-ey,dtm=performance.now()-s.t;
 if(Math.abs(dy)>=10&&(dtm<=300||Math.abs(dy)/Math.max(dtm,1)>=.3))act(dy>0?1:-1);},{passive:true});
addEventListener('touchcancel',()=>{tStart=null;},{passive:true});
const NEXT=['ArrowDown','PageDown','ArrowRight',' '],PREV=['ArrowUp','PageUp','ArrowLeft'];
addEventListener('keydown',e=>{if(state==='closed')return;
 if(e.key==='Escape'){e.preventDefault();close();return;}
 if(e.key==='Tab'){e.preventDefault();const tb=document.querySelector('.theme-btn'),f=[btn,tb].filter(Boolean),i=f.indexOf(document.activeElement);f[(i+(e.shiftKey?f.length-1:1))%f.length].focus();return;}
 const dir=NEXT.includes(e.key)?1:PREV.includes(e.key)?-1:0;if(!dir||e.altKey||e.ctrlKey||e.metaKey)return;
 if((e.key===' '||e.key==='Enter')&&/^(BUTTON)$/.test(document.activeElement&&document.activeElement.tagName))return;
 e.preventDefault();if(e.repeat||state!=='open')return;if(deck.animating){pendingKey=dir;return;}act(dir);});
btn.addEventListener('click',()=>close());
/* keyboard / pointer access from the page: Enter, Space or a click on the container opens it at the first slide */
host.addEventListener('click',()=>{if(state==='closed')open(0);});
host.addEventListener('keydown',e=>{if(state==='closed'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(0);}});
fitClosed();deck.show(0);
window.__present={get state(){return state;},deck,open,close,get armed(){return armed;}};})();
