(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fx=document.querySelectorAll('.fx');
if(rm||!('IntersectionObserver'in window))fx.forEach(e=>e.classList.add('in'));
else{const go=()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -10% 0px'});fx.forEach(e=>io.observe(e));};
/* gated: reveal only after unlock (js/gate.js fires gate:unlocked), otherwise they finish unseen under the gate */
document.documentElement.classList.contains('gated')?addEventListener('gate:unlocked',go,{once:true}):go();}
const secs=[...document.querySelectorAll('section[data-title]')],links=[...document.querySelectorAll('.toc a')],mid=document.getElementById('bar-mid'),bar=document.querySelector('.prog i');
let cur='';
// header label: hidden until the eyebrow scrolls under the bar, then 'FMSS · <section>' (falls back to the section name, then hidden, if it can't fit between logo and BACK)
const SEP=' · ',PRJ=document.body.dataset.prj||'FMSS',brand=document.querySelector('.bar .brand'),back=document.querySelector('.bar-right');
function setMid(t){if(!mid)return;mid.dataset.t=t;fit();}
function fit(){if(!mid||!mid.dataset.t||!brand||!back)return;const bb=mid.closest('.bar').getBoundingClientRect();mid.textContent=PRJ+SEP+mid.dataset.t;mid.style.left=(brand.offsetParent?Math.round(brand.getBoundingClientRect().left-(parseFloat(brand.style.translate)||0)-bb.left):Math.round(parseFloat(getComputedStyle(brand.parentNode).paddingLeft)))+'px';mid.style.right=Math.ceil(bb.right-back.getBoundingClientRect().left+12)+'px';} /* all widths: label replaces the logo at its left inset (its resting spot: minus any slide-out translate, studio-present.js); ellipsis 12px before BACK */
addEventListener('resize',fit);
function upd(){const y=scrollY+innerHeight*.3;let s=secs[0];for(const x of secs)if(x.offsetTop<=y)s=x;
 if(s&&s.id!==cur){cur=s.id;links.forEach(a=>a.setAttribute('aria-current',a.hash==='#'+cur?'true':'false'));setMid(s.dataset.title);}
 if(mid){const k=document.querySelector('.hero .kicker'),past=k?k.getBoundingClientRect().bottom<=mid.closest('.bar').getBoundingClientRect().bottom:true;mid.classList.toggle('on',past);mid.closest('.bar').classList.toggle('mid-on',past);}
 const h=document.documentElement.scrollHeight-innerHeight;if(bar)bar.style.transform=`scaleX(${h>0?Math.min(1,scrollY/h):0})`;}
let t=0;addEventListener('scroll',()=>{if(!t)t=requestAnimationFrame(()=>{t=0;upd();});},{passive:true});addEventListener('resize',upd);upd();})();
/* play/pause button (.vid-btn) on media containers: plays at ~35% in view, pauses when out; loops; the button toggles; a manual pause sticks.
   window.dbhPlayPause(box, watch, player, noun): adds the button to box and drives player {paused(), play(), pause()} from watch's visibility; returns its state sync */
window.dbhPlayPause=function(box,watch,p,noun){var b=document.createElement('button'),held=false,always=document.body.hasAttribute('data-always-play');b.type='button';b.className='vid-btn';
 b.innerHTML='<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><line x1="5.5" y1="3" x2="5.5" y2="13"/><line x1="10.5" y1="3" x2="10.5" y2="13"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.333 3.2v9.6L13.333 8z"/></svg>';box.appendChild(b);
 var sync=function(){var on=!p.paused();b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',(on?'Pause ':'Play ')+noun)};
 b.addEventListener('click',function(){if(p.paused()){held=false;p.play()}else{held=true;p.pause()}sync()});sync();
 /* body[data-always-play] (USPS): plays from load on every screen and loops until the button pauses it; never paused for leaving the view.
    Retries on load, when scrolled into view and on the first tap/scroll/key, for browsers that refuse a muted start until then */
 if(always){var kick=function(){if(!held&&p.paused())p.play();sync()};kick();watch.__kick=kick;
  ['pointerdown','touchstart','keydown','scroll'].forEach(function(t){addEventListener(t,kick,{passive:true,capture:true})});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)kick()})}).observe(watch);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)kick()});return sync;}
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(e.intersectionRatio>=.35){if(!held&&p.paused())p.play()}else if(!p.paused())p.pause();sync()})},{threshold:[0,.35]}).observe(watch);
 return sync;};
/* video[data-lazy]: heavy demos get their source only when they near the view (600px ahead), then the play helper starts them */
(function(){var vs=document.querySelectorAll('video[data-lazy]');if(!vs.length)return;var go=function(v){v.removeAttribute('data-lazy');v.querySelectorAll('source[data-src]').forEach(function(s){s.src=s.getAttribute('data-src');s.removeAttribute('data-src')});v.load()};if(!('IntersectionObserver' in window)){vs.forEach(go);return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);go(e.target)}})},{rootMargin:'600px 0px'});vs.forEach(function(v){io.observe(v)})})();
document.querySelectorAll('video.demo-video').forEach(function(v){v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;if(!document.body.hasAttribute('data-always-play')){v.autoplay=false;v.removeAttribute('autoplay');v.pause();}
 var sync=dbhPlayPause(v.closest('.media')||v.parentNode,v,{paused:function(){return v.paused},play:function(){var p=v.play();if(p&&p.catch)p.catch(function(){})},pause:function(){v.pause()}},'video');
 v.addEventListener('play',sync);v.addEventListener('pause',sync);if(v.__kick){v.addEventListener('loadeddata',v.__kick);v.addEventListener('canplay',v.__kick);}});

/* solution carousel: a pill of dots (one per slide) + play/pause. Each slide fills over 5s (linear), then a 1s handoff
   (easeInOutQuad = cubic-bezier(.455,.03,.515,.955)): the active bar drops its fill and shrinks to a dot while the next dot grows
   into an empty track, on one shared progress, so the pill keeps its width. The fill starts once the handoff lands. Loops forever.
   Runs while >= 35% in view; pause freezes the fill; a dot click runs the handoff and restarts the fill; arrow keys when focused.
   Reduced motion: no autoplay, no animation */
(function(){var DUR=5000,HAND=1000,RM=matchMedia('(prefers-reduced-motion: reduce)'),ease=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2},
 PP='<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="2.5" height="10" rx=".6"/><rect x="9.5" y="3" width="2.5" height="10" rx=".6"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.333 3.2v9.6L13.333 8z"/></svg>';
document.querySelectorAll('.media.carousel').forEach(function(c){var tr=c.querySelector('.car-track');if(!tr)return;var imgs=[].slice.call(tr.children),n=imgs.length;if(n<2)return;
 var i=0,playing=!RM.matches,vis=false,elapsed=0,h=1,ht=0,last=0,raf=0,cap=c.closest('figure')&&c.closest('figure').querySelector('figcaption'),caps=imgs.map(function(img){return img.getAttribute('alt')||''});
 var ctrl=document.createElement('div'),row=document.createElement('div'),pp=document.createElement('button'),sr=document.createElement('span'),bars=[],fills=[];
 ctrl.className='car-ctrl';row.className='car-dots';row.setAttribute('role','group');row.setAttribute('aria-label','Choose slide');
 var dots=imgs.map(function(img,k){var b=document.createElement('button');b.type='button';b.className='car-dot';b.innerHTML='<i class="car-bar" aria-hidden="true"><i class="car-fill"></i></i>';
  b.setAttribute('aria-label','Slide '+(k+1)+' of '+n+(caps[k]?': '+caps[k]:''));b.addEventListener('click',function(){go(k)});row.appendChild(b);bars.push(b.firstChild);fills.push(b.firstChild.firstChild);return b});
 pp.type='button';pp.className='car-pp';pp.innerHTML=PP;pp.addEventListener('click',function(){playing=!playing;sync();kick()});
 sr.className='car-sr';ctrl.appendChild(row);ctrl.appendChild(pp);c.appendChild(ctrl);c.appendChild(sr);
 row.addEventListener('keydown',function(e){var k=dots.indexOf(document.activeElement),t=null;if(k<0)return;
  if(e.key==='ArrowRight')t=k+1;else if(e.key==='ArrowLeft')t=k-1;else if(e.key==='Home')t=0;else if(e.key==='End')t=n-1;
  if(t===null)return;e.preventDefault();e.stopPropagation();go(t);dots[i].focus()});
 c.addEventListener('keydown',function(e){if(e.target!==c)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(i+(e.key==='ArrowRight'?1:-1))}});
 function sync(){pp.dataset.state=playing?'playing':'paused';pp.setAttribute('aria-label',(playing?'Pause':'Play')+' slideshow');sr.setAttribute('aria-live',playing?'off':'polite')}
 /* e[k]: how open slot k is (0 dot, 1 track); a handoff eases every slot from where it is to its target, so sum(e) stays 1 */
 var e=imgs.map(function(_,k){return k?0:1}),e0=e.slice();
 function go(k,first){k=(k%n+n)%n;elapsed=0;if(k!==i){e0=e.slice();h=RM.matches?1:0;ht=performance.now()}i=k;
  imgs.forEach(function(img,j){img.classList.toggle('is-active',j===i)});
  dots.forEach(function(d,j){d.setAttribute('aria-current',j===i?'true':'false');d.tabIndex=j===i?0:-1});
  c.setAttribute('aria-label','Slide '+(i+1)+' of '+n);if(cap&&!cap.hasAttribute('data-static'))cap.textContent=caps[i];if(!first)sr.textContent='Slide '+(i+1)+' of '+n;draw();kick()}
 function draw(){var q=ease(h);for(var k=0;k<n;k++){var t=k===i?1:0;e[k]=h>=1?t:e0[k]+(t-e0[k])*q;
  dots[k].style.width=(24+16*e[k]).toFixed(3)+'px';bars[k].style.width=(5+19*e[k]).toFixed(3)+'px';
  fills[k].style.setProperty('--p',k===i&&h>=1?Math.min(1,RM.matches?1:elapsed/DUR).toFixed(4):0)}}
 function running(){return h<1||(playing&&vis&&!document.hidden)}
 function kick(){if(!raf&&running()){last=0;raf=requestAnimationFrame(frame)}}
 function frame(now){raf=0;var dt=last?Math.min(50,now-last):16;last=now;
  if(h<1)h=Math.min(1,(now-ht)/HAND);else if(playing&&vis&&!document.hidden){elapsed+=dt;if(elapsed>=DUR){go(i+1);return}}
  draw();if(running())raf=requestAnimationFrame(frame)}
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(x){vis=x.intersectionRatio>=.35;kick()})},{threshold:[0,.35,1]}).observe(c);else vis=true;
 document.addEventListener('visibilitychange',kick);
 if(RM.addEventListener)RM.addEventListener('change',function(){if(RM.matches){playing=false;h=1;sync();draw()}});
 go(0,true);sync();
 });})();
/* Back to top: always to scrollY 0 (#top is the hero, below the bar); smooth unless reduced motion */
document.querySelectorAll('.foot a[href="#top"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});});
