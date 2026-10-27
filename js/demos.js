/* One demo at a time, site-wide (window.dbhDemos). Every autoplaying demo on a page joins one pool, and only ONE plays: the one in view
   whose centre is nearest the centre of the window (2D distance, so a horizontal strip such as the homepage rail works the same as a
   page that scrolls). Every other demo is paused where it is (clock, videos, rAF loops, timers, CSS/WAAPI animations) and resumes from
   there when it is the nearest again. Nothing plays off screen. Load it before every player script (it is plain, no dependencies).
   API
     dbhDemos.add(el, {play(), pause(), want()})  el = the box measured for "nearest the centre". play/pause are called on every change
       (a new member starts paused: it plays once the pool picks it). want() (optional) false = not autoplaying right now (user-paused,
       a stepped piece after its first touch): it never takes the turn. Returns ask(): call it when want() may have changed.
     dbhDemos.ask()  re-pick on the next frame (after anything that moves members without a scroll, resize or intersection change).
   Each member keeps its own rules on top (reduced motion, its own in-view threshold, a hidden tab): the pool only ever narrows what plays.
   Members today: js/state-seq.js loops (VAC Solution, Citi intro), js/device-cover.js and js/fmss-split.js covers (case page heroes,
   homepage cards, NEXT CASE STUDY cards), js/case.js demo videos and slide carousels, and, here:
   - autoplay embeds (iframe[data-autoplay]: FMSS Solution animations, Evolution / VAC prototypes). They post {type:'demo-hello'} once they
     run (again after each reload by the js/case.js loader) and are answered with their state; after that {type:'demo-play'|'demo-pause'}
     goes out on every change (preview/shared/demo/demo-clock.js freezes the whole prototype). While any frame is lifted full screen
     (.proto-lift / .fsx-lift) none plays inline (full screen itself is never paused: the embed ignores a pause there).
   - looping GIFs (img[data-loop]: src = the first-frame still, data-loop = the GIF): the GIF while it has the turn, else the still (a GIF
     cannot pause, so it restarts from its first frame), and always the still with reduced motion. */
(function(){"use strict";if(window.dbhDemos)return;
var ms=[],cur=null,vis=[],q=0,O=location.origin,io=null;
var lifted=function(){for(var i=0;i<ms.length;i++){var c=ms[i].el.classList;if(c.contains('proto-lift')||c.contains('fsx-lift'))return true}return false};
var pick=function(){q=0;var cx=innerWidth/2,cy=innerHeight/2,best=null,bd=Infinity;
 if(!lifted())vis.forEach(function(m){if(m.want&&!m.want())return;var r=m.el.getBoundingClientRect();
  if(!r.width||!r.height||r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth)return;
  var dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy,d=dx*dx+dy*dy;if(d<bd){bd=d;best=m}});
 if(best===cur)return;var was=cur;cur=best;if(was)was.pause();if(cur)cur.play()};
var ask=function(){if(!q)q=requestAnimationFrame(pick)};
if('IntersectionObserver' in window)io=new IntersectionObserver(function(es){es.forEach(function(e){var m=null;
  for(var i=0;i<ms.length;i++)if(ms[i].el===e.target){m=ms[i];break}var k=vis.indexOf(m);
  if(e.isIntersecting){if(k<0)vis.push(m)}else if(k>=0)vis.splice(k,1)});ask()},{threshold:[0,.25,.5,.75,1]});
function add(el,h){var m={el:el,play:h.play,pause:h.pause,want:h.want};ms.push(m);if(io)io.observe(el);else vis.push(m);ask();return ask}
var api=window.dbhDemos={add:add,ask:ask,current:function(){return cur&&cur.el}};
addEventListener('scroll',function(){if(vis.length)ask()},{passive:true});addEventListener('resize',ask);
addEventListener('strip:rest',ask);   // the homepage rail (js/home.js) moves its cards by transform, then says when it settles
function init(){
 /* autoplay embeds */
 var fs=[].slice.call(document.querySelectorAll('iframe[data-autoplay]'));
 var send=function(f,on){try{if(f.contentWindow&&f.getAttribute('src'))f.contentWindow.postMessage({type:on?'demo-play':'demo-pause'},O)}catch(_){}};
 fs.forEach(function(f){api.add(f,{play:function(){send(f,true)},pause:function(){send(f,false)},want:function(){return !!f.getAttribute('src')}})});
 if(fs.length&&'MutationObserver' in window){var mo=new MutationObserver(ask);fs.forEach(function(f){mo.observe(f,{attributes:true,attributeFilter:['class','src']})})}
 addEventListener('message',function(e){var d=e.data;if(!d||d.type!=='demo-hello'||e.origin!==O)return;
  for(var i=0;i<fs.length;i++)if(fs[i].contentWindow===e.source){var f=fs[i];pick();send(f,!!cur&&cur.el===f);return}});
 /* looping GIFs */
 var RM=matchMedia('(prefers-reduced-motion: reduce)');
 [].forEach.call(document.querySelectorAll('img[data-loop]'),function(im){var still=im.getAttribute('src'),loop=im.getAttribute('data-loop'),on=false,
  set=function(){var u=on&&!RM.matches?loop:still;if(im.getAttribute('src')!==u)im.setAttribute('src',u)};
  if(RM.addEventListener)RM.addEventListener('change',set);
  api.add(im.closest('.media-wrap,.media')||im,{play:function(){on=true;set()},pause:function(){on=false;set()}})});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
