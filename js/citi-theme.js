/* Citi Color Theming (03): one looping frame. Everyday (Blue) swipes its Sant Ambroeus transaction open to "Split with Zelle" and
   closed again, then the dashboard re-themes Everyday -> Priority -> Citigold -> Everyday, each change a plain crossfade of the full
   themed layer (640 ms, cubic-bezier(.4,0,.2,1)). No dependencies.
   Markup: <div class="media mframe" data-citi-theme><img src="assets/citi/theme/blue.webp" ...></div>. The image is the no-JS fallback
   and the reduced-motion frame (Blue, row closed). One SVG covering it exactly (same 2880x1620 box, slice = the img's object-fit:cover)
   holds three theme layers, each a real Figma export (assets/citi/theme/blue|priority|gold.webp) with the Transactions card's third row
   laid over it closed (row-blue = Everyday/Priority copy, row-gold = the AAdvantage copy). Only Blue's row moves: it slides 180 px left
   on cubic-bezier(.45,0,.15,1) with the Zelle action (zelle-blue) attached to its right edge, clipped to the row. Flat 2D.
   Loop (ms, all on the 8 ms grid), PERIOD 9920:
     0-1600 Blue, row closed · 1600-2240 row swipes open · 2240-3840 hold · 3840-4480 row swipes closed · 4480-4800 breath ·
     4800-5440 crossfade to Priority · hold to 7040 · 7040-7680 crossfade to Gold · hold to 9280 · 9280-9920 crossfade to Blue ·
     9920 = 0 (Blue, row closed: seamless wrap).
   Plays while it has the page's demo turn (js/demos.js), the box is >= 35% in view and the tab is visible; paused where it is
   otherwise. Never interactive. Reduced motion: the still Blue frame (t 0). window.__citiTheme: seek(t) / resume() / PERIOD. */
(function(){"use strict";
var doc=document,NS="http://www.w3.org/2000/svg",RM=matchMedia("(prefers-reduced-motion: reduce)"),V="?v=314";
var SW0=1600,SWD=640,SW1=3840,XF=640,STEPS=[[4800,0,1],[7040,1,2],[9280,2,0]],PERIOD=9280+XF; /* 9920 */
var ROW={x:865.5,y:1188,w:526.5,h:120},SHIFT=180;
var cl=function(v){return v<0?0:v>1?1:v},
 bez=function(x1,y1,x2,y2){return function(x){if(x<=0)return 0;if(x>=1)return 1;var u=x,i,cx,dx;   /* cubic-bezier(), CSS-style */
  for(i=0;i<8;i++){cx=3*x1*u*(1-u)*(1-u)+3*x2*u*u*(1-u)+u*u*u-x;dx=3*x1*(1-u)*(1-3*u)+3*x2*u*(2-3*u)+3*u*u;if(Math.abs(cx)<1e-5||!dx)break;u=cl(u-cx/dx)}
  return 3*y1*u*(1-u)*(1-u)+3*y2*u*u*(1-u)+u*u*u}},
 fade=bez(.4,0,.2,1),glide=bez(.45,0,.15,1);
function el(t,a,p){var e=doc.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function build(host,id){
 var B="../assets/citi/theme/",SRC=[];
 var svg=el("svg",{viewBox:"0 0 2880 1620",preserveAspectRatio:"xMidYMid slice","aria-hidden":"true",focusable:"false"});
 var img=function(p,n,a){var s=B+n+".webp"+V;if(SRC.indexOf(s)<0)SRC.push(s);a.href=s;a.preserveAspectRatio="none";return el("image",a,p)};
 var mv=null,L=["blue","priority","gold"].map(function(n,i){var g=el("g",{display:i?"none":"inline"},svg);img(g,n,{width:2880,height:1620});
  var w=el("svg",{x:ROW.x,y:ROW.y,width:ROW.w,height:ROW.h,viewBox:"0 0 "+ROW.w+" "+ROW.h,overflow:"hidden"},g),h=el("g",{},w);
  img(h,i===2?"row-gold":"row-blue",{width:ROW.w,height:ROW.h});
  if(!i){img(h,"zelle-blue",{x:ROW.w,width:SHIFT,height:ROW.h});mv=h}return g});
 var shown=-1,show=function(a,b,o){var k=a*4+(b<0?3:b);   /* a = solid layer, b = layer fading in on top at opacity o */
  if(k!==shown){shown=k;L.forEach(function(g,i){g.setAttribute("display",i===a||i===b?"inline":"none");g.removeAttribute("opacity")});
   svg.appendChild(L[a]);if(b>=0)svg.appendChild(L[b])}
  if(b>=0)L[b].setAttribute("opacity",o.toFixed(4))};
 host.appendChild(svg);
 return [function(t){t=((t%PERIOD)+PERIOD)%PERIOD;
  var o=t<SW0?0:t<SW0+SWD?glide((t-SW0)/SWD):t<SW1?1:t<SW1+SWD?1-glide((t-SW1)/SWD):0;   /* row: Blue only */
  mv.setAttribute("transform",o>1e-4?"translate("+(-SHIFT*o).toFixed(2)+" 0)":"");
  var a=0,b=-1,u=-1;for(var i=STEPS.length-1;i>=0;i--)if(t>=STEPS[i][0]){u=t-STEPS[i][0];a=STEPS[i][1];b=STEPS[i][2];break}
  if(u<0||u>=XF){if(u>=XF)a=b;show(a,-1);return}
  show(a,b,fade(u/XF))}
 ,SRC];
}
function control(host){
 var t=0,raf=0,last=0,vis=false,on=!window.dbhDemos,frozen=false,draw=null;
 var go=function(){return draw&&!frozen&&!RM.matches&&vis&&on&&!doc.hidden};
 var tick=function(now){raf=0;if(!go()){last=0;return}if(last)t=(t+Math.min(64,now-last))%PERIOD;last=now;draw(t);raf=requestAnimationFrame(tick)};
 var upd=function(){if(!draw||frozen)return;if(RM.matches){draw(0);return}if(go()&&!raf){last=0;raf=requestAnimationFrame(tick)}};
 /* load the layers first (only once the box is near the view); until then the Blue image alone shows */
 var start=function(){if(draw)return;start=function(){};var b=build(host,"cth"+Math.random().toString(36).slice(2,7)),f=b[0],svg=host.lastChild;
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
