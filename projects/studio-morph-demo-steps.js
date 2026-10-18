/* Standalone preview of the Studio Model deck (unlinked): a short sticky zone; while it is pinned, one wheel gesture /
   swipe / key press plays exactly one transition. The deck itself lives in studio-deck.js (shared with studio.html). */
(()=>{const stage=document.getElementById('morph-stage'),inner=document.getElementById('morph-stage-inner'),track=document.getElementById('morph-track'),cap=document.getElementById('morph-cap');
if(!stage||!inner||!track||!window.StudioDeck)return;
const deck=StudioDeck.create({inner,stage,cap});const N=deck.N;
const GAP=180,TOUCH_PX=30;let pendingKey=0;
function inZone(){const r=track.getBoundingClientRect(),bar=document.querySelector('.bar'),bb=bar?bar.getBoundingClientRect().bottom:0;return r.top<=bb+2&&r.bottom>=innerHeight-2;}
const canStep=d=>deck.canStep(d);
function step(dir){return deck.step(dir,()=>{if(pendingKey){const d=pendingKey;pendingKey=0;step(d);}});}
let wLast=-1e9,wOwner=null,wStartIn=false;
addEventListener('wheel',e=>{const now=performance.now(),dy=e.deltaY,dx=e.deltaX;
 if((now-wLast)>GAP&&!deck.animating){wOwner=null;wStartIn=inZone();}
 wLast=now;
 if(Math.abs(dx)>Math.abs(dy))return;
 if(wOwner==='page')return;
 if(wOwner==='demo'){if(inZone()||deck.animating)e.preventDefault();return;}
 if(!inZone())return;
 if(!wStartIn){wOwner='demo';e.preventDefault();return;}
 if(Math.abs(dy)<1){e.preventDefault();return;}
 const dir=dy>0?1:-1;
 if(!canStep(dir)){wOwner='page';return;}
 wOwner='demo';e.preventDefault();step(dir);},{passive:false});
let tStart=null;
addEventListener('touchstart',e=>{if(e.touches.length!==1){tStart=null;return;}const t=e.touches[0];
 tStart={y:t.clientY,x:t.clientX,t:performance.now(),owner:inZone()?null:'page',done:false};},{passive:true});
addEventListener('touchmove',e=>{if(!tStart||tStart.owner==='page')return;const t=e.touches[0],dy=tStart.y-t.clientY,dx=tStart.x-t.clientX;tStart.ly=t.clientY;
 if(tStart.owner===null){if(Math.abs(dy)<6&&Math.abs(dx)<6)return;
  if(Math.abs(dx)>Math.abs(dy)){tStart.owner='page';return;}
  const dir=dy>0?1:-1;if(!canStep(dir)&&!deck.animating){tStart.owner='page';return;}tStart.owner='demo';}
 e.preventDefault();
 if(!tStart.done&&Math.abs(dy)>=TOUCH_PX){tStart.done=true;step(dy>0?1:-1);}},{passive:false});
addEventListener('touchend',e=>{if(!tStart)return;const s=tStart;tStart=null;if(s.owner!=='demo'||s.done)return;
 const t=e.changedTouches&&e.changedTouches[0],ey=t?t.clientY:(s.ly??s.y),dy=s.y-ey,dtm=performance.now()-s.t;
 if(Math.abs(dy)>=10&&(dtm<=300||Math.abs(dy)/Math.max(dtm,1)>=.3))step(dy>0?1:-1);},{passive:true});
addEventListener('touchcancel',()=>{tStart=null;},{passive:true});
const NEXT=['ArrowDown','PageDown','ArrowRight',' '],PREV=['ArrowUp','PageUp','ArrowLeft'];
addEventListener('keydown',e=>{const k=e.key,dir=NEXT.includes(k)?1:PREV.includes(k)?-1:0;if(!dir||e.altKey||e.ctrlKey||e.metaKey)return;
 const tg=e.target;if(tg&&(tg.isContentEditable||/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(tg.tagName)))return;
 if(k===' '&&e.shiftKey)return;
 if(!inZone())return;
 if(!canStep(dir)&&!deck.animating)return;
 e.preventDefault();if(e.repeat)return;
 if(deck.animating){pendingKey=dir;return;}step(dir);});
function fit(){deck.layout(stage.clientWidth,stage.clientHeight,'contain',stage.clientWidth/1920);}
addEventListener('resize',fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(stage);
fit();deck.show(0);
window.__morphDraw=deck.draw;window.__morphEase=deck.ease;window.__morphEaseFor=deck.easeFor;window.__morphDur=deck.dur;
window.__morphState=()=>({cur:deck.cur,animating:deck.animating,steps:deck.steps,inZone:inZone(),dark:deck.dark});
window.__morphGo=n=>{deck.stop();deck.show(n);};
window.__morphReady=()=>deck.ready();})();
