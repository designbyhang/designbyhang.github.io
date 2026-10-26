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
/* the one play/pause icon pair (.mbtn): pause = two strokes, play = filled triangle */
window.dbhPP='<svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><line x1="5.5" y1="3" x2="5.5" y2="13"/><line x1="10.5" y1="3" x2="10.5" y2="13"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.087 4L5.087 12A0.8 0.8 0 0 0 6.311 12.678L12.711 8.678A0.8 0.8 0 0 0 12.711 7.322L6.311 3.322A0.8 0.8 0 0 0 5.087 4Z"/></svg>';
window.dbhPlayPause=function(box,watch,p,noun){var b=document.createElement('button'),held=false,always=document.body.hasAttribute('data-always-play');b.type='button';b.className='mbtn vid-btn';
 b.innerHTML=window.dbhPP;box.appendChild(b);
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
(function(){var DUR=5000,HAND=1000,RM=matchMedia('(prefers-reduced-motion: reduce)'),ease=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
document.querySelectorAll('.media.carousel').forEach(function(c){var tr=c.querySelector('.car-track');if(!tr)return;var imgs=[].slice.call(tr.children),n=imgs.length;if(n<2)return;
 var i=0,playing=!RM.matches,vis=false,elapsed=0,h=1,ht=0,last=0,raf=0,cap=c.closest('figure')&&c.closest('figure').querySelector('figcaption'),caps=imgs.map(function(img){return img.getAttribute('alt')||''});
 var ctrl=document.createElement('div'),row=document.createElement('div'),pp=document.createElement('button'),sr=document.createElement('span'),bars=[],fills=[];
 ctrl.className='car-ctrl';row.className='car-dots';row.setAttribute('role','group');row.setAttribute('aria-label','Choose slide');
 var dots=imgs.map(function(img,k){var b=document.createElement('button');b.type='button';b.className='car-dot';b.innerHTML='<i class="car-bar" aria-hidden="true"><i class="car-fill"></i></i>';
  b.setAttribute('aria-label','Slide '+(k+1)+' of '+n+(caps[k]?': '+caps[k]:''));b.addEventListener('click',function(){go(k)});row.appendChild(b);bars.push(b.firstChild);fills.push(b.firstChild.firstChild);return b});
 pp.type='button';pp.className='mbtn car-pp';pp.innerHTML=window.dbhPP;pp.addEventListener('click',function(){playing=!playing;sync();kick()});
 sr.className='car-sr';ctrl.appendChild(row);ctrl.appendChild(pp);c.appendChild(ctrl);c.appendChild(sr);
 row.addEventListener('keydown',function(e){var k=dots.indexOf(document.activeElement),t=null;if(k<0)return;
  if(e.key==='ArrowRight')t=k+1;else if(e.key==='ArrowLeft')t=k-1;else if(e.key==='Home')t=0;else if(e.key==='End')t=n-1;
  if(t===null)return;e.preventDefault();e.stopPropagation();go(t);dots[i].focus()});
 c.addEventListener('keydown',function(e){if(e.target!==c)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(i+(e.key==='ArrowRight'?1:-1))}});
 function sync(){pp.setAttribute('aria-pressed',playing?'true':'false');pp.setAttribute('aria-label',(playing?'Pause':'Play')+' slideshow');sr.setAttribute('aria-live',playing?'off':'polite')}
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
/* NEXT CASE STUDY card = the homepage project card (css/card.css): a card whose homepage cover loops (USPS: the hero GIF) loops here too,
   only while on screen; off screen it shows the first-frame still (src swap, so the GIF is not decoded), and always with reduced motion */
(function(){var ims=document.querySelectorAll('.next img[data-loop]');if(!ims.length)return;var RM=matchMedia('(prefers-reduced-motion: reduce)');
 ims.forEach(function(im){var still=im.getAttribute('src'),loop=im.getAttribute('data-loop'),vis=false,
  set=function(){var u=vis&&!RM.matches?loop:still;if(im.getAttribute('src')!==u)im.setAttribute('src',u)};
  if(RM.addEventListener)RM.addEventListener('change',set);
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){vis=e.isIntersecting;set()})}).observe(im.closest('.media-wrap'));});})();
/* Back to top: always to scrollY 0 (#top is the hero, below the bar); smooth unless reduced motion */
document.querySelectorAll('.foot a[href="#top"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});});
/* live prototype iframes (iframe[data-src]): attach src only once the site is unlocked (the same-origin frame then reads the shared
   sessionStorage flag and shows no second gate) and only as the frame nears the viewport; each prototype pauses its own idle demo offscreen */
(function(){var fs=document.querySelectorAll('iframe[data-src]');if(!fs.length)return;var go=function(f){f.src=f.getAttribute('data-src');f.removeAttribute('data-src')};
var arm=function(){if(!('IntersectionObserver' in window)){fs.forEach(go);return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);go(e.target)}})},{rootMargin:'400px 0px'});fs.forEach(function(f){io.observe(f)})};
var open=false;try{open=sessionStorage.getItem('dbh-unlocked')==='1'}catch(_){}
if(open||!document.documentElement.classList.contains('gated'))arm();else addEventListener('gate:unlocked',arm,{once:true})})();
/* phones (<=640px, the breakpoint where these frames go 4:5): each live prototype frame is a tap target (.proto-open) that opens it full
   screen. The full-screen view is the shared © Easter egg / Studio presentation layer (js/hang-egg.js window.dbhLayer: page-colour layer,
   top-right "× CLOSE", its entrance/exit timeline, Esc, iOS scroll lock + flow, theme toggle). The same iframe (no second copy, no reload,
   state kept) is lifted to position:fixed over the layer (.proto-lift, css/case.css) and fades with it; inside it html.embed-full fits the
   device centred with even margins. Desktop is unchanged: the shield is display:none above 640px.
   Turned to landscape while open (touch devices): the device is hidden (visibility, the same iframe, no reload), its demo and video hold
   (embed:hold / embed:release, handled in each prototype) and the caption (portrait: none) reads LAND; back in portrait the device
   returns. Portrait: a one-line instruction per prototype (INS, .proto-ins = the figcaption style) 16px below the device frame, at most
   375px wide; device + gap + text fit between the bars, centred together (375x812 cap). The lifted iframe keeps the whole box between
   the bars and the device is padded into it (PAD, the same injected style as js/proto-fs.js on desktop: the prototype's frame gets the
   device's top and height, overflow visible), with at least ROOM (device units) above it, so the device's drop-shadow has room inside
   the transparent iframe and never ends on its edge (it was cut to a hard band at the device's top and bottom);
   it enters with CLOSE (.hegg-ui) and is hidden in landscape. Full screen never autoplays (html.embed-full: the prototype lands on its clean start and waits for input). */
(function(){var ms=document.querySelectorAll('.proto-fig .media.proto');   // the Evolution prototypes only (other embeds stay inline)
if(!ms.length)return;var mq=matchMedia('(max-width:640px)'),
 lq=matchMedia('(orientation:landscape) and (pointer:coarse)'),LAND='This prototype works in portrait.<br>Rotate your phone to continue.',   // two lines, broken after the first sentence
 INS={'fmss-cb':'Tap the video’s caption to preview the ad’s destination without leaving Reels.','fmss-hs':'Tap a product image to browse product details side by side in a split screen.','fmss-profile':'Tap the brand’s profile picture to visit their Profile, with their website a tap away.'};
var PAD='html.fsx-pad .wrap{padding:var(--fsx-t,0px) 0 0!important}html.fsx-pad .mframe{height:var(--fsx-h,100vh)!important;overflow:visible!important;contain:none!important}',
 ROOM=32; /* drop-shadow(40px 0 20px) = 10px std dev: fully faded by ~30 device px; this much margin is kept above and below the device */
ms.forEach(function(m){var f=m.querySelector('iframe');if(!f)return;var b=document.createElement('button');b.type='button';b.className='proto-open';
 var name=(f.getAttribute('title')||'Prototype').replace(/, interactive prototype$/,'');b.setAttribute('aria-label','Open '+name+' full screen');b.setAttribute('aria-haspopup','dialog');m.appendChild(b);
 var doc=function(){try{return f.contentDocument&&f.contentDocument.documentElement}catch(_){return null}};
 var full=function(on){var d=doc();if(d&&d.classList.contains('embed'))d.classList.toggle('embed-full',on)};
 var esc=function(e){if(e.key==='Escape'&&window.dbhLayer){e.preventDefault();e.stopPropagation();window.dbhLayer.close()}};
 var send=function(t){try{f.contentWindow.dispatchEvent(new Event(t))}catch(_){}},held=false;
 var de=document.documentElement,clearSel=function(){try{getSelection().removeAllRanges()}catch(_){}},noSel=function(e){e.preventDefault()},
  nosel=function(on){de.classList.toggle('proto-nosel',on);clearSel();['selectstart','dragstart'].forEach(function(t){document[on?'addEventListener':'removeEventListener'](t,noSel,true)})}; /* while open: no selection on the page */
 var land=function(){if(held)send('embed:hold')}; /* opened in landscape: the device is held */
 var u=f.getAttribute('data-src')||f.getAttribute('src')||'',ik=Object.keys(INS).filter(function(k){return u.indexOf('/'+k+'/')>=0})[0],ins=ik?INS[ik]:'';
 /* portrait layout: the bars' box (css top/height) minus 16px + the instruction's height, the device's width limit and the 812 cap give
    the device height (less ROOM above and below); the device is padded to that spot inside the iframe, device + gap + text centred in the box */
 var pad=function(on,t,h){var d=doc();if(!d||!d.classList.contains('embed'))return;var D=d.ownerDocument;
  if(on&&!D.getElementById('fsx-pad-css')){var st=D.createElement('style');st.id='fsx-pad-css';st.textContent=PAD;(D.head||d).appendChild(st)}
  if(on&&t!=null){d.style.setProperty('--fsx-t',t+'px');d.style.setProperty('--fsx-h',h+'px')}
  if(!on){d.style.removeProperty('--fsx-t');d.style.removeProperty('--fsx-h')}d.classList.toggle('fsx-pad',on)};
 var lay=function(){var L=window.dbhLayer,el=L&&L.el,p=el&&el.querySelector('.proto-ins');if(!p||!f.classList.contains('proto-lift'))return;
  if(held){pad(false);return}var r=f.getBoundingClientRect(),W=r.width,iw=Math.max(0,Math.min(375,W-32));p.style.width=iw+'px';
  var T=p.offsetHeight,g=T?16:0,h=Math.max(0,Math.floor(Math.min((r.height-g-T)*828/(828+2*ROOM),828,828*(W-32)/391))),t=Math.round((r.height-h-g-T)/2);
  pad(true,t,h);p.style.top=(r.top+t+h+g)+'px'};
 var orient=function(){var L=window.dbhLayer,el=L&&L.el,p=el&&el.querySelector('.deck-n'),on=lq.matches;if(!el||on===held)return;held=on;
  el.classList.toggle('proto-land',on);f.classList.toggle('proto-hide',on);if(p)p.innerHTML=on?LAND:'';lay();
  send(on?'embed:hold':'embed:release')};
 var lqOn=function(on){if(lq.addEventListener)lq[on?'addEventListener':'removeEventListener']('change',orient);else lq[on?'addListener':'removeListener'](orient)};
 var win=null,load=function(){var on=f.classList.contains('proto-lift');full(on);hook();if(on){lay();land()}},
  hook=function(){var w=null;try{w=f.contentWindow}catch(_){}if(w===win)return;if(win)try{win.removeEventListener('keydown',esc,true)}catch(_){}win=w;if(w)try{w.addEventListener('keydown',esc,true)}catch(_){}};
 b.addEventListener('click',function(){var L=window.dbhLayer;if(!L||L.el||!mq.matches)return;
  if(f.hasAttribute('data-src')){f.src=f.getAttribute('data-src');f.removeAttribute('data-src')}
  f.addEventListener('load',load);
  L.open({label:name,cls:'proto-full',trg:b,stage:'<p class="proto-ins hegg-ui">'+ins+'</p><p class="deck-n hegg-ui"></p>',
   show:function(){nosel(true);f.style.transition='none';f.classList.add('proto-lift');full(true);hook();orient();lay();addEventListener('resize',lay);lqOn(true);land();void f.offsetWidth;f.style.transition='';f.classList.add('proto-on')},
   tabs:function(){return held?[]:[f]},
   frame:function(a){f.style.transition='none';f.style.opacity=a.toFixed(4)},
   done:function(){nosel(false);f.removeEventListener('load',load);lqOn(false);removeEventListener('resize',lay);pad(false);if(held){held=false;f.classList.remove('proto-hide');send('embed:release')}if(win)try{win.removeEventListener('keydown',esc,true)}catch(_){}win=null;
    f.classList.remove('proto-lift','proto-on');f.style.transition=f.style.opacity='';full(false)}});});
});})();
