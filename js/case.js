(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fx=document.querySelectorAll('.fx');
if(rm||!('IntersectionObserver'in window))fx.forEach(e=>e.classList.add('in'));
else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -10% 0px'});fx.forEach(e=>io.observe(e));}
const secs=[...document.querySelectorAll('section[data-title]')],links=[...document.querySelectorAll('.toc a')],mid=document.getElementById('bar-mid'),bar=document.querySelector('.prog i');
let cur='';
// header label: hidden until the eyebrow scrolls under the bar, then 'FMSS · <section>' (falls back to the section name, then hidden, if it can't fit between logo and BACK)
const SEP=' · ',PRJ='FMSS',brand=document.querySelector('.bar .brand'),back=document.querySelector('.bar-right');
function setMid(t){if(!mid)return;mid.dataset.t=t;fit();}
function fit(){if(!mid||!mid.dataset.t)return;const bb=mid.closest('.bar').getBoundingClientRect();mid.textContent=PRJ+SEP+mid.dataset.t;mid.style.left=Math.round(brand.getBoundingClientRect().left-bb.left)+'px';mid.style.right=Math.ceil(bb.right-back.getBoundingClientRect().left+12)+'px';} /* all widths: label replaces the logo at its left inset; ellipsis 12px before BACK */
addEventListener('resize',fit);
var upd=function(){const y=scrollY+innerHeight*.3;let s=secs[0];for(const x of secs)if(x.offsetTop<=y)s=x;
 if(s&&s.id!==cur){cur=s.id;links.forEach(a=>a.setAttribute('aria-current',a.hash==='#'+cur?'true':'false'));setMid(s.dataset.title);}
 if(mid){const k=document.querySelector('.hero .kicker'),past=k?k.getBoundingClientRect().bottom<=mid.closest('.bar').getBoundingClientRect().bottom:true;mid.classList.toggle('on',past);mid.closest('.bar').classList.toggle('mid-on',past);}
 const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?Math.min(1,scrollY/h):0})`;}
// toc: one shared marker that springs to the active tick (stiffness 240, damping 30, mass 1 — overdamped, no overshoot)
const ol=document.querySelector('.toc ol');let mk=null,my=0,mv=0,mt=null,mr=0,ml=0;
if(ol){mk=document.createElement('i');mk.className='toc-mark';mk.setAttribute('aria-hidden','true');ol.appendChild(mk);}
function markY(){const a=links.find(a=>a.getAttribute('aria-current')==='true');if(!a)return null;const r=a.getBoundingClientRect(),o=ol.getBoundingClientRect();return r.top-o.top+r.height/2-.5;}
function step(now){const dt=Math.min(.064,(now-ml)/1000);ml=now;const f=-240*(my-mt)-30*mv;mv+=f*dt;my+=mv*dt;
 if(Math.abs(my-mt)<.1&&Math.abs(mv)<.1){my=mt;mv=0;mr=0;}else mr=requestAnimationFrame(step);mk.style.transform=`translateY(${my}px)`;}
function moveMark(snap){if(!mk)return;const y=markY();if(y==null)return;mt=y;
 if(snap||rm||!mk.classList.contains('on')){cancelAnimationFrame(mr);mr=0;my=y;mv=0;mk.style.transform=`translateY(${y}px)`;mk.classList.add('on');return;}
 if(!mr){ml=performance.now();mr=requestAnimationFrame(step);}}
const _upd=upd;upd=function(){const c=cur;_upd();if(cur!==c)moveMark(false);};
addEventListener('resize',()=>moveMark(true));if(document.fonts)document.fonts.ready.then(()=>moveMark(true));
// toc click: smooth scroll honouring the header offset (html scroll-padding-top), push hash without a jump
links.forEach(a=>a.addEventListener('click',e=>{const el=document.getElementById(a.hash.slice(1));if(!el)return;e.preventDefault();
 const pad=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
 scrollTo({top:el.getBoundingClientRect().top+scrollY-pad,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 if(location.hash!==a.hash)history.pushState(null,'',a.hash);}));
let t=0;addEventListener('scroll',()=>{if(!t)t=requestAnimationFrame(()=>{t=0;upd();});},{passive:true});addEventListener('resize',upd);upd();})();
/* demo videos: play at ~50% in view, pause when out; button toggles; manual pause sticks; always autoplays muted when in view */
(function(){var vs=document.querySelectorAll('video.demo-video');if(!vs.length)return;var rm=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var ico='<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><line x1="5.5" y1="3" x2="5.5" y2="13"/><line x1="10.5" y1="3" x2="10.5" y2="13"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.333 3.2v9.6L13.333 8z"/></svg>';
vs.forEach(function(v){v.muted=true;v.autoplay=false;v.removeAttribute('autoplay');v.pause();var b=document.createElement('button');b.type='button';b.className='vid-btn';b.innerHTML=ico;v.parentNode.appendChild(b);v._held=false;v._vis=false;
 var sync=function(){var on=!v.paused;b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Pause video':'Play video')};
 v.addEventListener('play',sync);v.addEventListener('pause',sync);sync();
 b.addEventListener('click',function(){if(v.paused){v._held=false;var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v._held=true;v.pause()}});
});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;v._vis=e.intersectionRatio>=.35;if(v._vis){if(!v._held&&v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}}else if(!v.paused){v.pause()}})},{threshold:[0,.35]});vs.forEach(function(v){io.observe(v)})}
})();

/* solution carousel: arrows step the slides, both arrows loop infinitely, arrow keys when focused */
(function(){document.querySelectorAll('.media.carousel').forEach(function(c){var tr=c.querySelector('.car-track'),n=tr.children.length,i=0,prev=c.querySelector('[data-dir="-1"]'),next=c.querySelector('[data-dir="1"]'),cap=c.closest('figure').querySelector('figcaption'),caps=[].map.call(tr.children,function(img){return img.getAttribute('alt')||''});
 function go(d){i=Math.max(0,Math.min(n-1,i+d));[].forEach.call(tr.children,function(img,j){img.classList.toggle('is-active',j===i)});prev.disabled=false;next.disabled=false;c.setAttribute('aria-label','Slide '+(i+1)+' of '+n);if(cap&&!cap.hasAttribute('data-static'))cap.textContent=caps[i]||''}
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
