/* Shared demo clock for autoplaying prototype embeds (v124). Load it FIRST in <head>, before any other script.
   The host page (js/case.js, iframe[data-autoplay]) lets only ONE autoplay embed play at a time: the visible one nearest the
   window's vertical centre. It talks to the embed with postMessage: the embed says {type:'demo-hello'} when it loads (also after
   an unload and reload); the host answers {type:'demo-play'} or {type:'demo-pause'}. No answer within 600ms = no host on this
   page, so the embed simply runs.
   A PAUSE truly stops the document and a PLAY resumes it where it was, so a prototype's demo needs no pause logic of its own:
   this file wraps the page's clock (performance.now, requestAnimationFrame, setTimeout and setInterval) in one virtual clock
   that stops while paused. Pending timers and frames wait, springs and the autoplay timeline hold mid-step, running CSS/WAAPI
   animations and transitions are paused (CSS animations that start while paused too; transitions that start while paused run,
   so the site's colour-mode toggle reaches every embed at once), and playing videos are paused (a video that starts while paused is paused at once).
   On play everything continues from the same instant.
   The pause only applies while demoClock.gate() is true. The default gate is "inline": ?inline=1 and not lifted into full
   screen (html.embed-full). Full screen is never paused, so it stays fully interactive. Reduced motion is never paused
   either (it keeps its behaviour: no autoplay, the reel as it was).
   API: demoClock.hosted (a host controls this embed), demoClock.paused, demoClock.native {now,raf,caf,setTimeout,clearTimeout}.
   Events on window: 'demo:host' (the host answered), 'demo:pause', 'demo:play'. */
(function(){
'use strict';
var W=window;if(W.demoClock)return;
var P=performance,N0=P.now.bind(P),nRAF=W.requestAnimationFrame.bind(W),nCAF=W.cancelAnimationFrame.bind(W),
    nST=W.setTimeout.bind(W),nCT=W.clearTimeout.bind(W),doc=document,html=doc.documentElement;
var off=0,at=0,frozen=false;
function now(){return (frozen?at:N0())-off}
try{Object.defineProperty(P,'now',{value:now,configurable:true,writable:true})}catch(_){}

/* frames: one native frame pumps every pending callback with the virtual time */
var fr=new Map(),fid=0,pump=0;
function run(){pump=0;if(frozen)return;var t=now(),l=fr;fr=new Map();
  l.forEach(function(fn){try{fn(t)}catch(e){nST(function(){throw e})}})}
W.requestAnimationFrame=function(fn){var id=++fid;fr.set(id,fn);if(!pump&&!frozen)pump=nRAF(run);return id};
W.cancelAnimationFrame=function(id){fr.delete(id)};

/* timers: due times on the virtual clock, each backed by a native timer while running */
var tm=new Map(),tid=0;
function arm(id,t){if(frozen)return;t.h=nST(function(){fire(id)},Math.max(0,t.due-now()))}
function fire(id){var t=tm.get(id);if(!t)return;t.h=0;if(frozen)return;
  if(t.rep){t.due=Math.max(t.due+t.ms,now());arm(id,t)}else tm.delete(id);
  if(typeof t.fn==='function')t.fn.apply(W,t.a);else(0,eval)(String(t.fn))}
function add(fn,ms,a,rep){ms=Math.max(0,+ms||0);if(rep)ms=Math.max(ms,4);var id=++tid,t={fn:fn,ms:ms,a:a,rep:rep,due:now()+ms,h:0};tm.set(id,t);arm(id,t);return id}
function clr(id){var t=tm.get(id);if(!t)return;if(t.h)nCT(t.h);tm.delete(id)}
W.setTimeout=function(fn,ms){return add(fn,ms,[].slice.call(arguments,2),false)};
W.setInterval=function(fn,ms){return add(fn,ms,[].slice.call(arguments,2),true)};
W.clearTimeout=W.clearInterval=clr;

/* freeze / thaw */
var anims=[],vids=[];
function holdAnims(){if(!doc.getAnimations)return;doc.getAnimations().forEach(function(a){if(a.playState==='running'){try{a.pause();anims.push(a)}catch(_){}}})}
function freeze(){if(frozen)return;frozen=true;at=N0();
  tm.forEach(function(t){if(t.h){nCT(t.h);t.h=0}});if(pump){nCAF(pump);pump=0}
  holdAnims();
  [].forEach.call(doc.querySelectorAll('video'),function(v){if(!v.paused){vids.push(v);v.pause()}});
  html.classList.add('demo-paused');W.dispatchEvent(new Event('demo:pause'))}
function thaw(){if(!frozen)return;off+=N0()-at;frozen=false;
  anims.forEach(function(a){try{if(a.playState==='paused')a.play()}catch(_){}});anims=[];
  vids.forEach(function(v){try{var p=v.play();p&&p.catch&&p.catch(function(){})}catch(_){}});vids=[];
  tm.forEach(function(t,id){if(!t.h)arm(id,t)});if(fr.size&&!pump)pump=nRAF(run);
  html.classList.remove('demo-paused');W.dispatchEvent(new Event('demo:play'))}
/* anything that starts while paused is held too: videos and CSS animations (the demo's motion). Not transitions: while the clock is
   stopped the demo itself changes nothing, so a transition that starts then is the page reacting to the outside, above all the site's
   colour-mode toggle (data-theme mirrored from the host page): held, a paused embed kept the old colours until it played again */
doc.addEventListener('play',function(e){var v=e.target;if(frozen&&v&&v.tagName==='VIDEO'){if(vids.indexOf(v)<0)vids.push(v);v.pause()}},true);
doc.addEventListener('animationstart',function(e){if(frozen&&e.target.getAnimations)e.target.getAnimations().forEach(function(a){if(a.animationName===e.animationName&&a.playState==='running'){try{a.pause();anims.push(a)}catch(_){}}})},true);

/* the host */
var RM=W.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var framed=W.parent!==W,want=!framed;   // framed: wait for the host's word (or the 600ms fallback) before playing
var C=W.demoClock={hosted:false,get paused(){return frozen},now:now,
  native:{now:N0,raf:nRAF,caf:nCAF,setTimeout:nST,clearTimeout:nCT},
  gate:function(){return /[?&]inline=1\b/.test(location.search)&&!html.classList.contains('embed-full')},
  update:upd};
function upd(){(!want&&!RM.matches&&C.gate())?freeze():thaw()}
if(framed){
  var heard=false;
  W.addEventListener('message',function(e){var d=e.data;if(e.source!==W.parent||!d||(d.type!=='demo-play'&&d.type!=='demo-pause'))return;
    if(!heard){heard=true;C.hosted=true;W.dispatchEvent(new Event('demo:host'))}want=d.type==='demo-play';upd()});
  try{W.parent.postMessage({type:'demo-hello'},location.origin)}catch(_){}
  nST(function(){if(!heard){want=true;upd()}},600);
}
new MutationObserver(upd).observe(html,{attributes:true,attributeFilter:['class']});   // created before the page's own observers: full screen thaws first
RM.addEventListener&&RM.addEventListener('change',upd);
upd();
})();
