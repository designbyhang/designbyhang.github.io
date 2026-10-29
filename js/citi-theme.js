/* Citi Color Theming (03): one looping frame that re-themes the Citi dashboard Everyday (Blue) -> Priority -> Citigold -> Everyday ...,
   a forward loop (Gold goes straight back to Blue). No dependencies.
   Markup: <div class="media mframe" data-citi-theme><img src="assets/citi/theme/blue.webp" ...></div>. The image is the no-JS fallback
   and the reduced-motion frame (Blue, row closed). One SVG covering it exactly (same 2880x1620 box, slice = the img's object-fit:cover)
   stacks the three real Figma exports (assets/citi/theme/blue|priority|gold.webp, 3840x2160 tiles frames citi08/09/10 at 2880) and
   cross-fades them; everything that changes colour or copy (background, header title + swatches, buttons, illustrations, chart, icons,
   the $200 / $500 card, the account names) changes with the fade. On top, the Transactions card's third row (Sant Ambroeus) is its
   own strip (row-blue = Blue/Priority copy, row-gold = the AAdvantage copy) with the "Split with Zelle" action attached to its right
   edge (zelle-blue|priority|gold.webp), clipped to the row: closed on Blue, swiped open 180 px on Priority and Gold. The swipe is a
   state of each theme, not the trigger: it opens on Blue->Priority, stays open on Priority->Gold, closes on Gold->Blue.
   Coordinates: slide px; the row is x 865.5..1392, y 1260..1380.
   Loop (ms, all on the 8 ms grid), PERIOD 8400. Each step: colour cross-fade 640 ms (cubic-bezier(.4,0,.2,1)); the row, when it
   moves, starts 160 ms later and slides 640 ms on cubic-bezier(.45,0,.15,1) (lands at +800); then the theme holds.
     0-2000 Blue (row closed) · 2000-2640 -> Priority, 2160-2800 row opens · hold to 4800 · 4800-5440 -> Gold (row stays open) ·
     hold to 7600 · 7600-8240 -> Blue, 7760-8400 row closes · 8400 = 0 (Blue settled: the wrap is seamless).
   Plays while it has the page's demo turn (js/demos.js), the box is >= 35% in view and the tab is visible; paused where it is
   otherwise. Never interactive. Reduced motion: the still Blue frame (t 0). window.__citiTheme: seek(t) / resume() / PERIOD. */
(function(){"use strict";
var doc=document,NS="http://www.w3.org/2000/svg",RM=matchMedia("(prefers-reduced-motion: reduce)"),V="?v=301";
var HOLD=2000,FADE=640,LAG=160,SWIPE=640,STEP=2800,PERIOD=3*STEP; /* 8400 */
var OPEN=[0,1,1],ROW={x:865.5,y:1260,w:526.5,h:120},SHIFT=180;
var cl=function(v){return v<0?0:v>1?1:v},
 bez=function(x1,y1,x2,y2){return function(x){if(x<=0)return 0;if(x>=1)return 1;var u=x,i,cx,dx;   /* cubic-bezier(), CSS-style */
  for(i=0;i<8;i++){cx=3*x1*u*(1-u)*(1-u)+3*x2*u*u*(1-u)+u*u*u-x;dx=3*x1*(1-u)*(1-3*u)+3*x2*u*(2-3*u)+3*u*u;if(Math.abs(cx)<1e-5||!dx)break;u=cl(u-cx/dx)}
  return 3*y1*u*(1-u)*(1-u)+3*y2*u*u*(1-u)+u*u*u}},
 fade=bez(.4,0,.2,1),glide=bez(.45,0,.15,1);
function el(t,a,p){var e=doc.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function build(host){
 var B="../assets/citi/theme/",N=["blue","priority","gold"],SRC=[];
 var svg=el("svg",{viewBox:"0 0 2880 1620",preserveAspectRatio:"xMidYMid slice","aria-hidden":"true",focusable:"false"});
 var img=function(p,n,a){var s=B+n+".webp"+V;SRC.push(s);a.href=s;a.preserveAspectRatio="none";return el("image",a,p)};
 var bases=N.map(function(n){return img(svg,n,{x:0,y:0,width:2880,height:1620})});
 var win=el("svg",{x:ROW.x,y:ROW.y,width:ROW.w,height:ROW.h,viewBox:"0 0 "+ROW.w+" "+ROW.h,overflow:"hidden"},svg),mv=el("g",{},win);
 var rows=[img(mv,"row-blue",{width:ROW.w,height:ROW.h}),img(mv,"row-gold",{width:ROW.w,height:ROW.h})];
 var pills=N.map(function(n){return img(mv,"zelle-"+n,{x:ROW.w,width:SHIFT,height:ROW.h})});
 var op=function(e,v){e.setAttribute("opacity",v>=1?1:v<=0?0:v.toFixed(4))};
 /* two opaque layers a (from) and b (to) at progress e: the lower one stays solid, the upper one carries the fade (same result either way) */
 var mix=function(L,a,b,e){var w=L.map(function(){return 0});if(a===b||e<=0)w[a]=1;else if(e>=1)w[b]=1;else if(a<b){w[a]=1;w[b]=e}else{w[b]=1;w[a]=1-e}
  L.forEach(function(x,i){op(x,w[i])})};
 host.appendChild(svg);
 return [function(t){t=((t%PERIOD)+PERIOD)%PERIOD;
  var k=Math.floor(t/STEP),u=t-k*STEP,a=k,b=(k+1)%3;                        /* step k: hold theme k, then go to k+1 */
  var e=u<HOLD?0:fade(cl((u-HOLD)/FADE)),s=u<HOLD+LAG?0:glide(cl((u-HOLD-LAG)/SWIPE));
  mix(bases,a,b,e);mix(pills,a,b,e);
  op(rows[1],a===2?1-e:b===2?e:0);                                           /* the AAdvantage copy belongs to Gold */
  var o=OPEN[a]+(OPEN[b]-OPEN[a])*s;mv.setAttribute("transform",o>1e-4?"translate("+(-SHIFT*o).toFixed(2)+" 0)":"")}
 ,SRC];
}
function control(host){
 var t=0,raf=0,last=0,vis=false,on=!window.dbhDemos,frozen=false,draw=null;
 var go=function(){return draw&&!frozen&&!RM.matches&&vis&&on&&!doc.hidden};
 var tick=function(now){raf=0;if(!go()){last=0;return}if(last)t=(t+Math.min(64,now-last))%PERIOD;last=now;draw(t);raf=requestAnimationFrame(tick)};
 var upd=function(){if(!draw||frozen)return;if(RM.matches){draw(0);return}if(go()&&!raf){last=0;raf=requestAnimationFrame(tick)}};
 /* load the layers first (only once the box is near the view); until then the Blue image alone shows */
 var start=function(){if(draw)return;start=function(){};var b=build(host),f=b[0],svg=host.lastChild;
  svg.style.visibility="hidden";var srcs=b[1],n=0,done=function(){if(++n<srcs.length)return;
   f(RM.matches?0:t);svg.style.visibility="";draw=f;upd()};
  srcs.forEach(function(s){var i=new Image();i.onload=i.onerror=function(){(i.decode?i.decode().catch(function(){}):Promise.resolve()).then(done)};i.src=s})};
 if("IntersectionObserver" in window){
  new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting}))start()},{rootMargin:"600px 0px"}).observe(host);
  new IntersectionObserver(function(es){es.forEach(function(e){vis=e.intersectionRatio>=.35});upd()},{threshold:[0,.35]}).observe(host);
 }else{vis=true;start()}
 if(window.dbhDemos)dbhDemos.add(host,{play:function(){on=true;upd()},pause:function(){on=false},want:function(){return !RM.matches}});
 doc.addEventListener("visibilitychange",upd);if(RM.addEventListener)RM.addEventListener("change",upd);
 return {seek:function(v){frozen=true;start();t=v;if(draw)draw(t)},resume:function(){frozen=false;upd()},time:function(){return t},ready:function(){return !!draw},playing:function(){return !!raf}};
}
var insts=[];
function mount(){if(!doc.getElementById("cth-css")){var s=doc.createElement("style");s.id="cth-css";
  s.textContent="[data-citi-theme]{position:relative;outline:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;pointer-events:none}[data-citi-theme]>svg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;overflow:hidden}";doc.head.appendChild(s)}
 [].forEach.call(doc.querySelectorAll("[data-citi-theme]"),function(h){if(h.__cth)return;h.__cth=1;try{insts.push(control(h))}catch(err){if(window.console)console.warn("citi-theme:",err)}})}
window.__citiTheme={seek:function(t,i){var x=insts[i||0];x&&x.seek(t)},time:function(i){var x=insts[i||0];return x?x.time():-1},resume:function(i){var x=insts[i||0];x&&x.resume()},ready:function(i){var x=insts[i||0];return !!(x&&x.ready())},playing:function(i){var x=insts[i||0];return !!(x&&x.playing())},PERIOD:PERIOD};
doc.readyState==="loading"?doc.addEventListener("DOMContentLoaded",mount,{once:true}):mount();
})();
