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

/* solution carousel: arrows step the slides, both arrows loop infinitely, arrow keys when focused */
(function(){document.querySelectorAll('.media.carousel').forEach(function(c){var tr=c.querySelector('.car-track');if(!tr||!c.querySelector('[data-dir]'))return;var n=tr.children.length,i=0,prev=c.querySelector('[data-dir="-1"]'),next=c.querySelector('[data-dir="1"]'),cap=c.closest('figure')&&c.closest('figure').querySelector('figcaption'),caps=[].map.call(tr.children,function(img){return img.getAttribute('alt')||''});
 function go(d){i=Math.max(0,Math.min(n-1,i+d));[].forEach.call(tr.children,function(img,j){img.classList.toggle('is-active',j===i)});prev.disabled=false;next.disabled=false;c.setAttribute('aria-label','Slide '+(i+1)+' of '+n);if(cap&&!cap.hasAttribute('data-static'))cap.textContent=caps[i]||'';tone(tr.children[i])}
 function tone(img){if(!img)return;if(c.dataset.btn){c.classList.toggle('car-light',c.dataset.btn==='light');return}var run=function(){try{var k=document.createElement('canvas'),w=k.width=48,h=k.height=27,x=k.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);var d=x.getImageData(w*.6|0,h*.6|0,w-(w*.6|0),h-(h*.6|0)).data,L=0;for(var p=0;p<d.length;p+=4)L+=.2126*d[p]+.7152*d[p+1]+.0722*d[p+2];c.classList.toggle('car-light',L/(d.length/4)<128)}catch(e){}};if(img.complete&&img.naturalWidth)run();else img.addEventListener('load',run,{once:true})} /* dark image under the buttons: white buttons; light image: dark buttons */
 function step(d){go(d)}
 prev.addEventListener('click',function(){step(i<=0?n-1:-1)});next.addEventListener('click',function(){step(i>=n-1?-(n-1):1)});
 c.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?(i<=0?n-1:-1):(i>=n-1?-(n-1):1))}});
 go(0);
 /* auto-advance every DUR ms while ~35% in view; loops; pauses on hover; stops for good once the user uses an arrow */
 var DUR=5000,tm=0,vis=false,hover=false,stopped=false;
 function restart(){clearTimeout(tm);if(vis&&!hover&&!stopped)tm=setTimeout(function(){go(i>=n-1?-(n-1):1);restart()},DUR)}
 function stop(){stopped=true;clearTimeout(tm)}prev.addEventListener('click',stop);next.addEventListener('click',stop);c.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight')stop()});
 c.addEventListener('mouseenter',function(){hover=true;clearTimeout(tm)});c.addEventListener('mouseleave',function(){hover=false;restart()});
 if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){var was=vis;vis=e.intersectionRatio>=.35;if(vis!==was)restart()})},{threshold:[0,.35]}).observe(c)}else{vis=true;restart()}
 });})();
/* Back to top: always to scrollY 0 (#top is the hero, below the bar); smooth unless reduced motion */
document.querySelectorAll('.foot a[href="#top"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});});
