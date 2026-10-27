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
window.dbhPlayPause=function(box,watch,p,noun){var b=document.createElement('button'),held=false,always=document.body.hasAttribute('data-always-play'),D=window.dbhDemos,on=!D,ask=null;b.type='button';b.className='mbtn vid-btn';
 b.innerHTML=window.dbhPP;box.appendChild(b);
 var sync=function(){var on=!p.paused();b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',(on?'Pause ':'Play ')+noun)};
 b.addEventListener('click',function(){if(p.paused()){held=false;p.play()}else{held=true;p.pause()}sync();if(ask)ask()});sync();
 /* only while it has the page's one demo turn (js/demos.js); a manual pause hands the turn on */
 var seen=always;if(D)ask=D.add(watch,{play:function(){on=true;if(seen&&!held&&p.paused())p.play();sync()},pause:function(){on=false;if(!p.paused())p.pause();sync()},want:function(){return !held}});
 /* body[data-always-play] (USPS): plays whenever it has the page's one demo turn (no 35% threshold) and loops until the button pauses it.
    Retries on load, when scrolled into view and on the first tap/scroll/key, for browsers that refuse a muted start until then */
 if(always){var kick=function(){if(on&&!held&&p.paused())p.play();sync()};kick();watch.__kick=kick;
  ['pointerdown','touchstart','keydown','scroll'].forEach(function(t){addEventListener(t,kick,{passive:true,capture:true})});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)kick()})}).observe(watch);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)kick()});return sync;}
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){seen=e.intersectionRatio>=.35;if(seen){if(on&&!held&&p.paused())p.play()}else if(!p.paused())p.pause();sync()})},{threshold:[0,.35]}).observe(watch);
 return sync;};
/* window.dbhSwipe(el, step[, opt]): the one horizontal-swipe gesture for every carousel-like media box (the .media.carousel slideshows
   below, every js/state-seq.js player). step(d): d = +1 next (swipe / drag LEFT, trackpad fingers left), -1 previous. Touch, pen,
   mouse drag and two-finger trackpad (wheel deltaX). A press is claimed only once it is horizontal (8px moved, |dx| > 1.2|dy|); a
   vertical one is left to the page (touch-action: pan-y, css/case.css .dbh-swipe). On release it steps at 48px, or at 16px flicked at
   >= .4px/ms; a claimed drag swallows its click, so taps on slides, dots and play/pause still work. Wheel: one gesture = one step
   (40px of deltaX, then held until the events pause for 200ms, its inertia tail included). opt.skip: presses never taken as a swipe */
window.dbhSwipe=function(el,step,opt){var skip=(opt&&opt.skip)||'.car-ctrl,.ss-ctrl,button,a',p=null,eat=false,acc=0,held=false,wt=0;
 el.classList.add('dbh-swipe');el.addEventListener('dragstart',function(e){e.preventDefault()});
 el.addEventListener('pointerdown',function(e){eat=false;p=null;if(e.button>0||!e.isPrimary||(e.target.closest&&e.target.closest(skip)))return;p={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),on:false}});
 el.addEventListener('pointermove',function(e){if(!p||e.pointerId!==p.id||p.on)return;var ax=Math.abs(e.clientX-p.x),ay=Math.abs(e.clientY-p.y);if(ax<8&&ay<8)return;
  if(ax>1.2*ay){p.on=true;try{el.setPointerCapture(e.pointerId)}catch(_){}var s=getSelection&&getSelection();if(s&&s.removeAllRanges)s.removeAllRanges()}else p=null});
 el.addEventListener('pointerup',function(e){if(!p||e.pointerId!==p.id)return;var q=p,dx=e.clientX-q.x,ax=Math.abs(dx);p=null;if(!q.on)return;eat=true;
  if(ax>=48||(ax>=16&&ax/Math.max(1,performance.now()-q.t)>=.4))step(dx<0?1:-1)});
 el.addEventListener('pointercancel',function(){p=null});
 el.addEventListener('click',function(e){if(!eat)return;eat=false;e.preventDefault();e.stopPropagation()},true);
 el.addEventListener('wheel',function(e){if(e.ctrlKey||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();var now=performance.now();
  if(now-wt>200){held=false;acc=0}wt=now;if(held)return;acc+=e.deltaX*(e.deltaMode?16:1);if(Math.abs(acc)>=40){held=true;step(acc>0?1:-1);acc=0}},{passive:false});};
/* video[data-lazy]: heavy demos get their source only when they near the view (600px ahead), then the play helper starts them */
(function(){var vs=document.querySelectorAll('video[data-lazy]');if(!vs.length)return;var go=function(v){v.removeAttribute('data-lazy');v.querySelectorAll('source[data-src]').forEach(function(s){s.src=s.getAttribute('data-src');s.removeAttribute('data-src')});v.load()};if(!('IntersectionObserver' in window)){vs.forEach(go);return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);go(e.target)}})},{rootMargin:'600px 0px'});vs.forEach(function(v){io.observe(v)})})();
document.querySelectorAll('video.demo-video').forEach(function(v){v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;v.autoplay=false;v.removeAttribute('autoplay');v.pause();
 var sync=dbhPlayPause(v.closest('.media')||v.parentNode,v,{paused:function(){return v.paused},play:function(){var p=v.play();if(p&&p.catch)p.catch(function(){})},pause:function(){v.pause()}},'video');
 v.addEventListener('play',sync);v.addEventListener('pause',sync);if(v.__kick){v.addEventListener('loadeddata',v.__kick);v.addEventListener('canplay',v.__kick);}});

/* solution carousel: a pill of dots (one per slide) + play/pause. Each slide fills over 5s (linear), then a 1s handoff
   (easeInOutQuad = cubic-bezier(.455,.03,.515,.955)): the active bar drops its fill and shrinks to a dot while the next dot grows
   into an empty track, on one shared progress, so the pill keeps its width. The fill starts once the handoff lands. Loops forever.
   Runs while >= 35% in view; pause freezes the fill; a dot click or a swipe (window.dbhSwipe) runs the handoff and restarts the fill;
   arrow keys when focused.
   Reduced motion: no autoplay, no animation */
(function(){var DUR=5000,HAND=1000,RM=matchMedia('(prefers-reduced-motion: reduce)'),ease=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
document.querySelectorAll('.media.carousel').forEach(function(c){var tr=c.querySelector('.car-track');if(!tr)return;var imgs=[].slice.call(tr.children),n=imgs.length;if(n<2)return;
 var i=0,playing=!RM.matches,vis=false,on=!window.dbhDemos,ask=null,elapsed=0,h=1,ht=0,last=0,raf=0,cap=c.closest('figure')&&c.closest('figure').querySelector('figcaption'),caps=imgs.map(function(img){return img.getAttribute('alt')||((img.querySelector('img[alt]')||{}).alt)||''});
 var ctrl=document.createElement('div'),row=document.createElement('div'),pp=document.createElement('button'),sr=document.createElement('span'),bars=[],fills=[];
 ctrl.className='car-ctrl';row.className='car-dots';row.setAttribute('role','group');row.setAttribute('aria-label','Choose slide');
 var dots=imgs.map(function(img,k){var b=document.createElement('button');b.type='button';b.className='car-dot';b.innerHTML='<i class="car-bar" aria-hidden="true"><i class="car-fill"></i></i>';
  b.setAttribute('aria-label','Slide '+(k+1)+' of '+n+(caps[k]?': '+caps[k]:''));b.addEventListener('click',function(){go(k)});row.appendChild(b);bars.push(b.firstChild);fills.push(b.firstChild.firstChild);return b});
 pp.type='button';pp.className='mbtn car-pp';pp.innerHTML=window.dbhPP;pp.addEventListener('click',function(){playing=!playing;sync();kick();if(ask)ask()});
 sr.className='car-sr';ctrl.appendChild(row);ctrl.appendChild(pp);c.appendChild(ctrl);c.appendChild(sr);
 row.addEventListener('keydown',function(e){var k=dots.indexOf(document.activeElement),t=null;if(k<0)return;
  if(e.key==='ArrowRight')t=k+1;else if(e.key==='ArrowLeft')t=k-1;else if(e.key==='Home')t=0;else if(e.key==='End')t=n-1;
  if(t===null)return;e.preventDefault();e.stopPropagation();go(t);dots[i].focus()});
 dbhSwipe(c,function(d){go(i+d);if(ask)ask()}); /* = a dot tap: the handoff runs and the 5s fill restarts (only while it holds the
    demo turn, js/demos.js, which re-picks); wraps like autoplay */
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
 function running(){return h<1||(playing&&vis&&on&&!document.hidden)}
 function kick(){if(!raf&&running()){last=0;raf=requestAnimationFrame(frame)}}
 function frame(now){raf=0;var dt=last?Math.min(50,now-last):16;last=now;
  if(h<1)h=Math.min(1,(now-ht)/HAND);else if(playing&&vis&&on&&!document.hidden){elapsed+=dt;if(elapsed>=DUR){go(i+1);return}}
  draw();if(running())raf=requestAnimationFrame(frame)}
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(x){vis=x.intersectionRatio>=.35;kick()})},{threshold:[0,.35,1]}).observe(c);else vis=true;
 document.addEventListener('visibilitychange',kick);
 /* the fill runs only while it has the page's one demo turn (js/demos.js) */
 if(window.dbhDemos)ask=dbhDemos.add(c,{play:function(){on=true;kick()},pause:function(){on=false},want:function(){return playing}});
 if(RM.addEventListener)RM.addEventListener('change',function(){if(RM.matches){playing=false;h=1;sync();draw()}});
 go(0,true);sync();
 });})();
/* Back to top: always to scrollY 0 (#top is the hero, below the bar); smooth unless reduced motion */
document.querySelectorAll('.foot a[href="#top"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});});
/* live prototype iframes (iframe[data-src]): attach src only once the site is unlocked (the same-origin frame then reads the shared
   sessionStorage flag and shows no second gate) and only as the frame nears the viewport (400px ahead); each prototype pauses its own
   idle demo offscreen. A frame that drifts more than a screen and a half away is unloaded again (src back to data-src, the document
   swapped for about:blank) so its decoded images, videos and layers are freed: iOS Safari kills a tab that keeps every demo on the page
   alive at once. It reloads, from its own start, when it nears again. Never while lifted into full screen (.proto-lift / .fsx-lift) */
(function(){var fs=document.querySelectorAll('iframe[data-src]');if(!fs.length)return;var go=function(f){if(!f.hasAttribute('data-src'))return;f.src=f.getAttribute('data-src');f.removeAttribute('data-src')};
var drop=function(f){var u=f.getAttribute('src');if(!u||f.hasAttribute('data-keep')||f.classList.contains('proto-lift')||f.classList.contains('fsx-lift'))return;
 try{f.contentWindow.location.replace('about:blank')}catch(_){}f.setAttribute('data-src',u);f.removeAttribute('src')};
var arm=function(){if(!('IntersectionObserver' in window)){fs.forEach(go);return}
 var near=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)go(e.target)})},{rootMargin:'400px 0px'});
 var far=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)drop(e.target)})},{rootMargin:'150% 0px'});
 fs.forEach(function(f){near.observe(f);far.observe(f)})};
var open=false;try{open=sessionStorage.getItem('dbh-unlocked')==='1'}catch(_){}
if(open||!document.documentElement.classList.contains('gated'))arm();else addEventListener('gate:unlocked',arm,{once:true})})();
/* phones (<=640px, the breakpoint where these frames go 4:5): each live prototype frame is a tap target (.proto-open) that opens it full
   screen. The full-screen view is the shared © Easter egg / Studio presentation layer (js/hang-egg.js window.dbhLayer: page-colour layer,
   top-right "× CLOSE", its entrance/exit timeline, Esc, iOS scroll lock + flow, theme toggle). The same iframe (no second copy, no reload,
   state kept) is lifted to position:fixed over the layer (.proto-lift, css/case.css); inside it html.embed-full fits the device centred
   with even margins. Entry and exit are the Studio presentation's (the dbhLayer grow cfg on js/fs-motion.js, as js/proto-fs.js on desktop):
   a --frame panel (.proto-panel) grows from the inline frame to the screen while the lifted iframe is moved and scaled with transform only
   (FLIP, the device centre travels from its inline spot to its full-screen one), and the header's logo/label and BACK slide out on the
   same progress (dbhFS.chrome); close shrinks it all back into the frame from wherever it is. The full-screen colour is the stage colour
   (--frame, html.fs-stage: js/theme.js paints the bars in it), as the Studio presentation and the desktop view. Desktop is unchanged: the shield is display:none above 640px.
   Turned to landscape while open (touch devices): the device is hidden (visibility, the same iframe, no reload), its demo and video hold
   (embed:hold / embed:release, handled in each prototype) and the caption (portrait: none) reads LAND; back in portrait the device
   returns. Portrait: the instruction (window.dbhIns, below; .fs-ins) 40px below the device frame, at most
   375px wide, its line centred on the theme toggle's (below); device + gap + text fit between the bars (375x812 cap). The lifted iframe keeps the whole box between
   the bars and the device is padded into it (PAD, the same injected style as js/proto-fs.js on desktop: the prototype's frame gets the
   device's top and height, overflow visible), with at least ROOM (device units) above it, so the device's drop-shadow has room inside
   the transparent iframe and never ends on its edge (it was cut to a hard band at the device's top and bottom);
   the instruction moves as CLOSE does (dbhLayer enter/exit hooks into window.dbhIns; the layer is under the lifted iframe). Hidden in landscape.
   Refresh: open writes ?fs=<prototype> (window.dbhView, js/hang-egg.js); a load carrying it reopens that prototype at once (no
   fade; the device on its clean start, no autoplay) with the page under it at the prototype, and the instruction then plays its
   entrance (dbhLayer calls enter once the instant open has painted). Full screen never autoplays (html.embed-full: the prototype lands on its clean start and waits for input). */
/* window.dbhIns: the one instruction under a full-screen prototype, shared by both full-screen views (desktop/tablet js/proto-fs.js,
   phones the dbhLayer view below; css/case.css .fs-ins = the CLOSE button's type). A one-line instruction per prototype (TEXT, by iframe
   path). It moves as CLOSE does: same trigger, 40ms after CLOSE's entrance (STAG, Studio's UI_STAG), then WAIT 800ms more (a WAAPI delay,
   no timer: a tap or close inside it and it never shows), then a soft opacity-only fade in on FADE (400ms, ease-out), no slide; the same
   entrance on its return to the first screen and after a refresh. Every exit is the same soft fade from its current opacity (mid-entrance
   too): the first tap of the element it describes (TAP, in the prototype's own document; gone until the prototype is back on its first
   screen), leaving the first screen (the prototype's {type:'proto-state',home}) and close (once). Its box starts at the device's bottom
   edge and clips (16px bottom padding); each view places it (top, width, the 40px gap as padding-top) under its own device.
   make(get, pin): get() returns the caption's <p> (its span is kept once found: the phone layer is gone from dbhLayer.el while it closes);
   pin(), if given, runs as the entrance starts and ends (the phone view re-measures its layout) */
window.dbhIns=(function(){var RM=matchMedia('(prefers-reduced-motion: reduce)'),STAG=40,WAIT=800,FADE={duration:400,easing:'cubic-bezier(.25,.1,.25,1)'},
 TEXT={'fmss-cb':'Tap the Reel’s caption','fmss-hs':'Tap a product image','fmss-profile':'Tap the Reel’s profile picture','vac-proto':'Tap the video ad'},
 TAP={'fmss-cb':'#more','fmss-hs':'.tile','fmss-profile':'#author','vac-proto':'#mv'}; /* the reel caption / a product image / the reel's profile picture / the video ad */
 return {TEXT:TEXT,
  key:function(u){u=u||'';return Object.keys(TEXT).filter(function(k){return u.indexOf('/'+k+'/')>=0})[0]||''},
  html:function(t){return '<p class="fs-ins"><span>'+(t||'')+'</span></p>'},
  make:function(get,pin){var a=null,tapped=false,home=false,shut=false,s=null, /* home: the prototype has reported its clean start this session */
   span=function(){var p=get();if(p)s=p.firstChild;return s},
   hide=function(t){t.style.opacity='0'},
   stop=function(){if(a){a.cancel();a=null}},
   fade=function(t){if(RM.matches||!t.animate){stop();hide(t);return}var o=+getComputedStyle(t).opacity;stop();
    t.style.opacity='0';if(o>0){a=t.animate([{opacity:o},{opacity:0}],FADE);a.onfinish=function(){a=null}}},
   enter=function(d){var t=span();if(tapped||!t)return;if(pin)pin();if(typeof d!=='number')d=STAG+WAIT;stop();t.style.opacity='';if(RM.matches||!t.animate)return;
    a=t.animate([{opacity:0},{opacity:1}],Object.assign({delay:d,fill:'backwards'},FADE));a.onfinish=function(){a=null;if(pin)pin()}},
   out=function(){var t=span();if(tapped||!t)return;tapped=true; /* gone for the rest of this full-screen session */
    if(RM.matches||!t.animate){stop();hide(t);return}
    if(a&&a.playState!=='finished'&&(a.currentTime||0)<a.effect.getTiming().delay){stop();hide(t);return} /* still waiting: it never appears */
    fade(t)};
   return {enter:function(){enter()}, /* with CLOSE's entrance */
    out:out,
    hide:function(){var t=span();if(t)hide(t)}, /* on open, before the entrance */
    settle:function(){var t=span();if(t&&!a&&t.style.opacity==='0')enter()}, /* an open with no CLOSE entrance to trigger it: at its end */
    exit:function(){var t=span();if(!t||shut)return;shut=true;fade(t)}, /* close: the fade starts once, on its own clock */
    tap:function(e,k){var x=e.target;if(k&&e.isTrusted&&x&&x.closest&&x.closest(TAP[k]))out()},
    state:function(h){if(!h){if(home)out()}else{home=true;if(tapped){tapped=false;enter(WAIT)}}}, /* a home:false before the clean start is the inline demo's */
    reset:function(){stop();tapped=home=shut=false}, /* each open */
    done:function(){stop();shut=false;s=null}}}}})(); /* closed */
/* reveal a scroll-in figure (.fx, above) at once: its opacity and transform would hide a lifted (position:fixed) iframe inside it and
   make the figure its containing block (a refresh restore opens before the figure has been scrolled into view) */
function fxIn(m){var g=m.closest('.fx');if(!g||g.classList.contains('in'))return;g.style.transition='none';g.classList.add('in');void g.offsetWidth;g.style.transition=''}
(function(){var ms=document.querySelectorAll('.proto-fig .media.proto');   // the Evolution prototypes only (other embeds stay inline)
if(!ms.length)return;var mq=matchMedia('(max-width:640px)'),
 lq=matchMedia('(orientation:landscape) and (pointer:coarse)'),LAND='This prototype works in portrait.<br>Rotate your phone to continue.',   // two lines, broken after the first sentence
 DI=window.dbhIns;
var FS=window.dbhFS,
 PAD='html.fsx-pad .wrap{padding:var(--fsx-t,0px) 0 0!important}html.fsx-pad .mframe{height:var(--fsx-h,100vh)!important;overflow:visible!important;contain:none!important}',
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
 var ik=DI.key(f.getAttribute('data-src')||f.getAttribute('src')),ins=ik?DI.TEXT[ik]:'';
 var I=DI.make(function(){var L=window.dbhLayer,el=L&&L.el;return el&&el.querySelector('.fs-ins')},function(){pinK='';repin()}),
  onTap=function(e){I.tap(e,ik)};
 /* portrait layout: the instruction's line centred on the theme toggle's (its real rect; at most 375px wide, clear of the toggle); the
    device takes the bars' box from its top down to 40px above the instruction (less ROOM above; the device's width limit and the 812
    cap), padded to that spot inside the iframe. No toggle on screen (or no gain): the bars' box minus 40px + the instruction's height
    gives the device height (less ROOM above and below), device + gap + text centred in the box */
 var pad=function(on,t,h){var d=doc();if(!d||!d.classList.contains('embed'))return;var D=d.ownerDocument;
  if(on&&!D.getElementById('fsx-pad-css')){var st=D.createElement('style');st.id='fsx-pad-css';st.textContent=PAD;(D.head||d).appendChild(st)}
  if(on&&t!=null){d.style.setProperty('--fsx-t',t+'px');d.style.setProperty('--fsx-h',h+'px')}
  if(!on){d.style.removeProperty('--fsx-t');d.style.removeProperty('--fsx-h')}d.classList.toggle('fsx-pad',on)};
 var lay=function(){var L=window.dbhLayer,el=L&&L.el,p=el&&el.querySelector('.fs-ins');if(!p||!f.classList.contains('proto-lift'))return;
  if(held){pad(false);geo=null;return}var r=fbox(),W=r.width,iw=Math.max(0,Math.min(375,W-32));p.style.width=iw+'px';
  var cx=r.left+W/2,tb=document.querySelector('.theme-btn'),tr=tb&&tb.getClientRects().length&&getComputedStyle(tb).visibility!=='hidden'?tb.getBoundingClientRect():null;
  var lb=el.getBoundingClientRect(),vv=window.visualViewport,yb=Math.max(innerHeight,lb.bottom,vv?vv.offsetTop+vv.height:0);if(tr&&(!tr.width||tr.top<0||tr.bottom>yb+1))tr=null;if(tr&&p.textContent){var w=Math.floor(2*(cx-tr.right-16));if(w<160)tr=null;else{iw=Math.min(iw,w);p.style.width=iw+'px'}}else tr=null;
  var T=p.firstChild?p.firstChild.offsetHeight:0,g=T?40:0,h=Math.max(0,Math.floor(Math.min((r.height-g-T)*828/(828+2*ROOM),828,828*W/531))),t=Math.round((r.height-h-g-T)/2);
  if(tr){var ct=Math.round(tr.top+tr.height/2-T/2),sp=ct-g-r.top;if(sp>r.height-g-T){h=Math.max(0,Math.floor(Math.min(sp*828/(828+ROOM),828,828*W/531)));t=ct-g-r.top-h}}
  pad(true,t,h);geo={t:t,h:h};p.style.top=(r.top-lb.top+t+h)+'px';p.style.paddingTop=g+'px'};
 /* the lifted iframe's layout box (position:fixed, so offsets are viewport px), not its rect: it is transformed while it grows */
 var fbox=function(){return {left:f.offsetLeft,top:f.offsetTop,width:f.offsetWidth,height:f.offsetHeight}},geo=null;
 /* re-pin: Safari's toolbar and the layer's own settle move the toggle after open, so the layout is measured again on window and
    visualViewport resize/scroll, on each frame for the first 1.2s (only when the toggle's centre or the frame's box moved), and
    when the instruction starts and ends its entrance */
 var pinK='',pinR=0,pinKey=function(){var tb=document.querySelector('.theme-btn'),a=tb?tb.getBoundingClientRect():null,r=fbox();return (a?Math.round(a.top+a.height/2):'-')+','+Math.round(r.top)+','+Math.round(r.height)+','+Math.round(r.width)},
  repin=function(){var k=pinKey();if(k!==pinK){pinK=k;lay()}},
  pinOn=function(on){var vv=window.visualViewport;['resize','scroll'].forEach(function(n){if(vv)vv[on?'addEventListener':'removeEventListener'](n,repin)});
   (on?addEventListener:removeEventListener)('resize',repin);cancelAnimationFrame(pinR);pinR=0;pinK='';if(!on)return;
   var t0=performance.now(),tick=function(){repin();pinR=performance.now()-t0<1200?requestAnimationFrame(tick):0};pinR=requestAnimationFrame(tick)}; /* the box starts at the device's bottom edge */
 var orient=function(){var L=window.dbhLayer,el=L&&L.el,p=el&&el.querySelector('.deck-n'),on=lq.matches;if(!el||on===held)return;held=on;
  el.classList.toggle('proto-land',on);f.classList.toggle('proto-hide',on);if(p)p.innerHTML=on?LAND:'';lay();
  send(on?'embed:hold':'embed:release')};
 var lqOn=function(on){if(lq.addEventListener)lq[on?'addEventListener':'removeEventListener']('change',orient);else lq[on?'addListener':'removeListener'](orient)};
 var win=null,load=function(){var on=f.classList.contains('proto-lift');full(on);hook();if(on){lay();land()}},
  hook=function(){var w=null;try{w=f.contentWindow}catch(_){}if(w===win)return;if(win)try{win.removeEventListener('keydown',esc,true);win.removeEventListener('click',onTap,true)}catch(_){}win=w;if(w)try{w.addEventListener('keydown',esc,true);w.addEventListener('click',onTap,true)}catch(_){}};
 /* the prototype's {type:'proto-state',home}: leaving its first screen takes the instruction out (as the tap); back on it and at rest,
    it comes back with its entrance (window.dbhIns) */
 addEventListener('message',function(e){var d=e.data,L=window.dbhLayer;if(!d||d.type!=='proto-state'||e.source!==f.contentWindow||!L||!L.el||!f.classList.contains('proto-lift'))return;
  I.state(d.home)});
 /* grow (dbhLayer cfg.grow, js/fs-motion.js): p 0 = the inline frame, 1 = full screen. A = the frame's inner box (live on close: the page is
    back at its scroll), sA = the device scale inline (its own --s), the full-screen device from lay()'s padded box */
 var gut=function(){var e=doc(),bd=e&&e.ownerDocument.body;return bd&&e?{x:(bd.clientWidth-e.clientWidth)/2,y:(bd.clientHeight-e.clientHeight)/2}:{x:0,y:0}},
  sNow=function(){var d=doc(),st=d&&d.querySelector('.stage'),v=st&&parseFloat(st.style.getPropertyValue('--s'));return v>0?v:0},
  inner=function(){var r=m.getBoundingClientRect(),b=m.clientLeft||0;return {x:r.left+b,y:r.top+b,w:m.clientWidth,h:m.clientHeight}},
  gs=null,opening=false,panel=null,hdr=document.querySelector('body>.bar'),
  ch=FS.chrome({hdr:hdr,asides:[[document.querySelector('.toc'),null],[document.querySelector('body>.bar .bar-right a'),null]],lefts:[hdr&&hdr.querySelector('.brand'),document.getElementById('bar-mid')],opening:function(){return opening}}),
  gframe=function(p){if(!gs)return;if(!opening)gs.A=inner();var W=innerWidth,H=innerHeight;if(panel)panel.style.transform=FS.rectXf(gs.A,W,H,p);ch.set(p);
   if(!geo||held){f.style.transform='';return}var F=fbox(),sF=Math.min(geo.h/828,(F.width-2*Math.abs(gs.g.x))/531);if(!(sF>0)){f.style.transform='';return}
   f.style.transform=FS.devXf(F,{x:gs.A.x+gs.A.w/2+gs.g.x,y:gs.A.y+gs.A.h/2+gs.g.y},{x:F.left+F.width/2+gs.g.x,y:F.top+geo.t+geo.h/2+gs.g.y},(gs.s0||sF)/sF,p)},
  grow={begin:function(o){opening=o;var el=window.dbhLayer.el||(panel&&panel.closest('.hegg'));if(o){panel=el&&el.querySelector('.proto-panel');}
    if(panel){panel.style.width=innerWidth+'px';panel.style.height=innerHeight+'px'}f.classList.add('proto-anim');if(!o)de.classList.remove('fs-stage');ch.measure();gframe(o?0:1)},
   frame:gframe,
   end:function(o){f.classList.remove('proto-anim');f.style.transform='';if(o){opening=false;if(panel)panel.style.transform='';de.classList.add('fs-stage');}else{ch.reset();gs=null;panel=null}}}; /* stage colour bars once full (the page beside the growing panel keeps its own colour) */
 var go=function(now){var L=window.dbhLayer;if(!L||L.el||!mq.matches)return;I.reset();
  f.setAttribute('data-keep','');if(f.hasAttribute('data-src')){f.src=f.getAttribute('data-src');f.removeAttribute('data-src')}
  fxIn(m); /* a figure not yet revealed (.fx: opacity 0 + transform, as after a refresh restore) would hide the lifted iframe and pin it to the page, not the screen */
  f.addEventListener('load',load);
  var A0=inner(),g0=gut(),pd=A0.w<=640?24:40;gs={A:A0,g:g0,s0:sNow()||Math.min((A0.h-2*Math.abs(g0.y)-pd*2)/828,(A0.w-2*Math.abs(g0.x)-pd*2)/431)};
  L.open({label:name,cls:'proto-full',trg:b,view:ik,instant:!!now,enter:I.enter,exit:I.exit,grow:grow,stage:'<i class="proto-panel" aria-hidden="true"></i>'+DI.html(ins)+'<p class="deck-n hegg-ui"></p>',
   show:function(){nosel(true);f.style.transition='none';f.classList.add('proto-lift','proto-on');full(true);hook();orient();lay();I.hide();pinOn(true);lqOn(true);land();void f.offsetWidth;
    f.style.transition=''}, /* opaque at once: it grows from the frame (grow), restored or not (the instruction's entrance follows via enter) */
   tabs:function(){return held?[]:[f]},
   done:function(){nosel(false);I.done();f.removeEventListener('load',load);lqOn(false);pinOn(false);pad(false);if(held){held=false;f.classList.remove('proto-hide');send('embed:release')}if(win)try{win.removeEventListener('keydown',esc,true);win.removeEventListener('click',onTap,true)}catch(_){}win=null;
    f.classList.remove('proto-lift','proto-on','proto-anim');f.removeAttribute('data-keep');f.style.transition=f.style.opacity=f.style.transform='';full(false);de.classList.remove('fs-stage')}})};
 b.addEventListener('click',function(){go(false)});
 /* refresh restore (phones): this prototype's ?fs= key; the page goes to the prototype first, then the layer is on at once */
 var restore=function(){var V=window.dbhView;if(!V||!ik||V.get()!==ik||!mq.matches)return;m.scrollIntoView({block:'center',behavior:'instant'});go(true)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){window.dbhView&&dbhView.when(restore)},{once:true});else setTimeout(function(){window.dbhView&&dbhView.when(restore)},0);
});})();

/* Evolution prototypes: expand button (.proto-x, css/case.css) bottom-right in each frame. Only a signifier: the frame is already one open
   target (.proto-open on phones, above; .fsx-open from js/proto-fs.js on desktop), so a click/Enter/Space on the button clicks whichever of
   those is showing, once (they are siblings, not ancestors, so nothing bubbles into a second open). Hidden while its iframe is lifted full screen */
(function(){document.querySelectorAll('.proto-fig .media.proto').forEach(function(m){var f=m.querySelector('iframe');if(!f)return;
 var x=document.createElement('button');x.type='button';x.className='mbtn proto-x';x.setAttribute('aria-label','Expand prototype');x.setAttribute('aria-haspopup','dialog');
 x.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 7L13 3M8.5 3H13V7.5M7 9L3 13M7.5 13H3V8.5"/></svg>';
 x.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();
  var t=[].filter.call(m.querySelectorAll('.fsx-open,.proto-open'),function(b){return getComputedStyle(b).display!=='none'})[0];if(t)t.click()});
 var sync=function(){x.classList.toggle('is-hidden',f.classList.contains('fsx-lift')||f.classList.contains('proto-lift'))};   // :has() fallback
 if('MutationObserver' in window)new MutationObserver(sync).observe(f,{attributes:true,attributeFilter:['class']});
 m.appendChild(x)})})();

/* 02 Problem exit-affordance rings (css/case.css .exit-rings): a member of the one-at-a-time demo pool (js/demos.js), so the loop runs only while it holds the turn and resumes where it paused; reduced motion (or no pool) keeps them static */
(function(){var m=document.querySelectorAll('.media.exit-rings');if(!m.length||!window.dbhDemos)return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.documentElement.classList.add('rings-js');
 m.forEach(function(e){dbhDemos.add(e,{play:function(){e.classList.add('rings-on')},pause:function(){e.classList.remove('rings-on')}})});})();
