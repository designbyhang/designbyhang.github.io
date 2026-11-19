/* Shared inline autoplay runner for prototype embeds (preview; first used by preview/fmss-all). It is the loop the VAC / MAC / SAP / CC
   and FMSS Evolution prototypes each carry inline, as one module: load it after demo-clock.js (which pauses the whole document when the
   case page's host says so, so the loop needs no pause logic of its own) and give it the page's steps.
   When it runs: ONLY inline on a case page (?inline=1, not lifted full screen: html.embed-full), while the page says it may (o.canRun:
   visible, not held), never with ?auto=0 or reduced motion. Full screen never autoplays: lifting it stops the loop, o.toFull() lands the
   prototype on its clean start and it then moves only on real input. Back inline, the loop runs again from a clean start (a 248ms
   crossfade, o.reset() under the cover) when it was cut mid-step or touched in full screen, else it carries on where it was.
   Steps: a number is a hold (ms), a function(tk) is one gesture and always runs to its end (a stop mid-gesture marks the run broken).
   Gestures drive the page's own functions; taps are shown with the shared touch indicator (demo-loop.css): it appears LEAD before the
   press, presses PRESS, the release is the action, it stays HOLD and fades FADE — 1032ms per tap, as the MAC prototype. Every time here
   is a multiple of 8ms. */
(function(){
'use strict';
if(window.DemoLoop)return;
var T={LEAD:480,PRESS:152,HOLD:160,FADE:240,XIN:120,XOUT:128,POLL:48};
function create(o){
  var html=document.documentElement,phone=o.phone,DW=o.width||375,RM=matchMedia('(prefers-reduced-motion: reduce)');
  var INLP=/[?&]inline=1\b/.test(location.search),INL=function(){return INLP&&!html.classList.contains('embed-full')};
  var finger=document.createElement('div');finger.className='dl-finger';finger.setAttribute('aria-hidden','true');phone.appendChild(finger);
  var xf=document.createElement('div');xf.className='dl-xf';xf.setAttribute('aria-hidden','true');phone.appendChild(xf);
  var on=false,token=0,stepI=0,inStep=false,broken=false,dirty=false,steps=[];
  function wait(ms,tk){return new Promise(function(res,rej){var t0=performance.now();(function f(){if(tk!==token)return rej('x');var left=ms-(performance.now()-t0);left<=0?res():setTimeout(f,Math.min(T.POLL,left))})()})}
  /* hold until the prototype reaches a state by itself (a dwell, a spring landing), at most max ms */
  function until(cond,tk,max){return new Promise(function(res,rej){var t0=performance.now();(function f(){if(tk!==token)return rej('x');if(cond()||performance.now()-t0>=(max||9600))return res();setTimeout(f,T.POLL)})()})}
  function sc(){return phone.getBoundingClientRect().width/DW}
  /* an element's centre in design px (the phone's own coordinates) */
  function at(el){var r=el.getBoundingClientRect(),p=phone.getBoundingClientRect(),k=sc();return [(r.left+r.width/2-p.left)/k,(r.top+r.height/2-p.top)/k]}
  function fingerAt(x,y){finger.style.translate=x.toFixed(2)+'px '+y.toFixed(2)+'px'}
  function fingerOff(){finger.classList.remove('on','down')}
  /* a synthetic touch on an element at design px: the element's own pointer handlers decide what the tap does */
  function press(el,x,y){var p=phone.getBoundingClientRect(),k=sc(),cx=p.left+x*k,cy=p.top+y*k;
    ['pointerdown','pointerup'].forEach(function(t){el.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:77,pointerType:'touch',isPrimary:true,clientX:cx,clientY:cy,button:0,buttons:t==='pointerup'?0:1}))})}
  /* one tap: where = [x,y] or a function giving it, read when the finger appears; fn = the action on release */
  function tap(where,tk,fn){var xy=typeof where==='function'?where():where;fingerAt(xy[0],xy[1]);finger.classList.add('on');
    return wait(T.LEAD,tk).then(function(){finger.classList.add('down');return wait(T.PRESS,tk)})
      .then(function(){finger.classList.remove('down');fn&&fn(xy);return wait(T.HOLD,tk)})
      .then(function(){finger.classList.remove('on');return wait(T.FADE,tk)})}
  function loop(tk){return (function next(){if(tk!==token)return Promise.reject('x');var s=steps[stepI];
    var p=typeof s==='number'?wait(s,tk):(inStep=true,Promise.resolve(s(tk)).then(function(){inStep=false}));
    return p.then(function(){stepI=(stepI+1)%steps.length;return next()})})()}
  function xfade(tk){if(RM.matches||!xf.animate){o.reset();return Promise.resolve()}
    return new Promise(function(res,rej){var a=xf.animate([{opacity:0},{opacity:1}],{duration:T.XIN,easing:'ease-in',fill:'forwards'});
      a.onfinish=function(){o.reset();fingerOff();xf.animate([{opacity:1},{opacity:0}],{duration:T.XOUT,easing:'ease-out'}).onfinish=function(){tk===token?res():rej('x')};a.cancel()}})}
  function canRun(){return steps.length&&!/[?&]auto=0\b/.test(location.search)&&!RM.matches&&!document.hidden&&INL()&&(!o.canRun||o.canRun())}
  function start(){if(on||!canRun())return;on=true;var tk=++token;if(o.frame)o.frame.dataset.autoplay='on';
    var run=function(){loop(tk).catch(function(){})};
    if(broken||dirty||(o.clean&&!o.clean())){broken=dirty=false;stepI=0;xfade(tk).then(run,function(){})}else run()}
  function stop(){if(!on)return;on=false;token++;if(o.frame)o.frame.dataset.autoplay='off';fingerOff();if(inStep){inStep=false;broken=true}}
  function sync(){canRun()?start():stop()}
  var wasInl=INL();
  if(INLP)new MutationObserver(function(){var i=INL();if(i===wasInl)return;wasInl=i;
    if(!i){stop();stepI=0;broken=dirty=false;o.toFull&&o.toFull();return}   // into full screen: the clean start, no demo
    if(stepI||dirty)broken=true;sync()}).observe(html,{attributes:true,attributeFilter:['class']});
  (o.frame||phone).addEventListener('pointerdown',function(e){if(e.isTrusted&&!INL())dirty=true},{capture:true,passive:true});
  document.addEventListener('visibilitychange',sync);RM.addEventListener&&RM.addEventListener('change',sync);
  return {T:T,wait:wait,until:until,tap:tap,press:press,at:at,fingerAt:fingerAt,fingerOff:fingerOff,sync:sync,stop:stop,
    play:function(s){steps=s;sync()},get on(){return on},get stepI(){return stepI},get inline(){return INL()}};
}
window.DemoLoop={create:create,T:T};
})();
