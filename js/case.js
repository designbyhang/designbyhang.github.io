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
function upd(){const y=scrollY+innerHeight*.3;let s=secs[0];for(const x of secs)if(x.offsetTop<=y)s=x;
 if(s&&s.id!==cur){cur=s.id;links.forEach(a=>a.setAttribute('aria-current',a.hash==='#'+cur?'true':'false'));setMid(s.dataset.title);}
 if(mid){const k=document.querySelector('.hero .kicker'),past=k?k.getBoundingClientRect().bottom<=mid.closest('.bar').getBoundingClientRect().bottom:true;mid.classList.toggle('on',past);mid.closest('.bar').classList.toggle('mid-on',past);}
 const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?Math.min(1,scrollY/h):0})`;}
let t=0;addEventListener('scroll',()=>{/* scroll-dial / TOC tick silenced */if(!t)t=requestAnimationFrame(()=>{t=0;upd();});},{passive:true});addEventListener('resize',upd);upd();})();
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

/* solution carousel: arrows step the slides, left arrow disabled on the first slide, right arrow loops, arrow keys when focused */
(function(){document.querySelectorAll('.media.carousel').forEach(function(c){var tr=c.querySelector('.car-track'),n=tr.children.length,i=0,prev=c.querySelector('[data-dir="-1"]'),next=c.querySelector('[data-dir="1"]'),cap=c.closest('figure').querySelector('figcaption'),caps=[].map.call(tr.children,function(img){return img.getAttribute('alt')||''});
 function go(d){i=Math.max(0,Math.min(n-1,i+d));[].forEach.call(tr.children,function(img,j){img.classList.toggle('is-active',j===i)});prev.disabled=i===0;next.disabled=false;c.setAttribute('aria-label','Slide '+(i+1)+' of '+n);if(cap&&!cap.querySelector('.lg-row'))cap.textContent=caps[i]||''}
 function step(d){go(d)}
 prev.addEventListener('click',function(){step(-1)});next.addEventListener('click',function(){step(i>=n-1?-(n-1):1)});
 c.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1)}});
 go(0);
 /* countdown ring on the right arrow: auto-advances every DUR ms while ~35% in view; loops to the first slide; pauses on hover; any manual step restarts it */
 var DUR=5000,ns='http://www.w3.org/2000/svg',ring=document.createElementNS(ns,'svg');ring.setAttribute('class','car-ring');ring.setAttribute('viewBox','0 0 40 40');ring.setAttribute('aria-hidden','true');
 var cir=document.createElementNS(ns,'circle');cir.setAttribute('cx','20');cir.setAttribute('cy','20');cir.setAttribute('r','19');cir.setAttribute('pathLength','100');ring.appendChild(cir);next.appendChild(ring);
 var vis=false,hover=false;
 function restart(){ring.classList.remove('run');void ring.getBoundingClientRect();cir.style.animationDuration=DUR+'ms';cir.style.animationPlayState=hover?'paused':'running';if(vis)ring.classList.add('run')}
 cir.addEventListener('animationend',function(){go(i>=n-1?-(n-1):1);restart()});
 prev.addEventListener('click',restart);next.addEventListener('click',restart);c.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight')restart()});
 c.addEventListener('mouseenter',function(){hover=true;cir.style.animationPlayState='paused'});c.addEventListener('mouseleave',function(){hover=false;cir.style.animationPlayState='running'});
 if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){var was=vis;vis=e.intersectionRatio>=.35;if(vis&&!was)restart();if(!vis)ring.classList.remove('run')})},{threshold:[0,.35]}).observe(c)}else{vis=true;restart()}
 });})();
