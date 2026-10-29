/* Citi Monthly Overview (04 Banking Experiences): one looping phone-screen sequence over the slide image citi-18.webp. No dependencies.
   Markup: <div class="media mframe" data-citi-mo><img src="citi-18.webp" ...></div>. The image (the dashboard resting on the Monthly
   Overview card, chart filled) is the no-JS fallback and the reduced-motion frame; one SVG covering it exactly (same 2880x1620 box,
   slice = the img's object-fit:cover) draws the phone screen from three crops of the slides (assets/citi/mo/: strip = the dashboard,
   citi-16 screen + citi-18 screen, head = both headers, feat = the citi-19 feature page) plus the live chart (verbatim Figma vectors,
   Graph 141388:14143). Coordinates: slide px; the screen is x 1158.5..1721, y 201..1419 (375x812 pt at 1.5x).
   Loop (ms, all on the 8 ms grid), PERIOD 8840:
     0-240 dashboard on Spending Insights · 240-2040 scroll down 1073 px (715 pt), easeInOutSine · 1960 the dark area starts to
     fill from the left (pale area already in place), the dots trail the fill edge, 2712 the current-point dot lands, 3264/3360/3456
     the three circles pop (288 each, flat overshoot) · 3744-4640 the card expands into the feature page (shared element: card rect
     -> full screen, 16 pt corners -> 0, chart rides to its feature-page place; header, tabs, summary, chart labels + tooltip,
     bills chain in) · 4640-6144 hold · 6144-7040 the exact reverse (collapse into the card, chart still full) · 7040-8840 scroll back
     up · the chart clears at 0, when the card is off screen.
   Plays while it has the page's demo turn (js/demos.js), the box is >= 35% in view and the tab is visible; paused where it is
   otherwise. Never interactive. Reduced motion: the still image (t 3744). window.__citiMo: seek(t) / resume() / PERIOD for captures. */
(function(){"use strict";
var doc=document,NS="http://www.w3.org/2000/svg",RM=matchMedia("(prefers-reduced-motion: reduce)"),V="?v=286";
var D=1073,TOP=240,SCR=1800,C0=1960,E0=3744,EXP=896,HOLD=1504,C1=E0+EXP+HOLD,U0=C1+EXP,PERIOD=U0+SCR; /* 8840 */
var CARD={x:18.5,y:285,w:527,h:570,r:24},FULL={x:0,y:131,w:564,h:1087},CHART_DY=-73; /* screen-crop px (origin 1158,201) */
/* chart (Graph frame G, 375x300 pt; origin at crop (0.5,405), scale 1.5), times from C0 */
var DOTS=[[10,244,200],[23,243,264],[35,242,320],[47,241,360],[60,239,400],[72,236,432],[85,233,472],[97,230,496],[110,226,528],[122,222,560],[134,217,584],[146,212,616],[159,206,640],[171,200,672],[184,193,696],[196,186,720],[208,178,752],[221,171,776],[233,164,800],[245,158,832],[258,152,864],[270,147,888],[283,143,920],[295,139,952],[307,136,984],[320,134,1024],[332,132,1064],[344,131,1104],[357,130,1168],[369,130,1240]],
 SOLID=[208,178,752],RINGS=[[270,147,1304],[295,139,1400],[332,132,1496]],WIPE=1280,DOT=160,LAND=240,POP=288,CEND=1784;
var cl=function(v){return v<0?0:v>1?1:v},sine=function(t){return(1-Math.cos(Math.PI*t))/2},
 cub=function(t){return 1-Math.pow(1-t,3)},inout=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},
 back=function(t){var s=1.2;t-=1;return 1+(s+1)*t*t*t+s*t*t},          /* ~5% overshoot, flat 2D scale */
 seg=function(p,a,b){return cl((p*EXP-a)/(b-a))};                         /* stage of the expand, a..b ms into it */
function el(t,a,p){var e=doc.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function rr(x,y,w,h,r){if(window.Squircle&&Squircle.pathR&&r>.5)return Squircle.pathR(w,h,[r,r,r,r],.6,x,y);
 return "M"+x+" "+y+"h"+w+"v"+h+"h"+(-w)+"Z"}
/* a window onto rows y0..y0+h of a crop image, placed at crop y */
function win(src,y0,h,y,p,H){var s=el("svg",{x:0,y:y,width:564,height:h,viewBox:"0 "+y0+" 564 "+h,overflow:"hidden"},p);
 el("image",{href:src,width:564,height:H,preserveAspectRatio:"none"},s);return s}
function build(host,id){
 var B="../assets/citi/mo/",SRC={strip:B+"strip.webp"+V,head:B+"head.webp"+V,feat:B+"feat.webp"+V};
 var svg=el("svg",{viewBox:"0 0 2880 1620",preserveAspectRatio:"xMidYMid slice","aria-hidden":"true",focusable:"false"});
 svg.innerHTML='<defs><linearGradient id="@p" x1="39.3897" y1="-47.6107" x2="39.3897" y2="240" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#002BFF"/><stop offset="1" stop-color="#2F90FF"/></linearGradient>'
  +'<linearGradient id="@d" x1="22.2199" y1="42.9996" x2="22.2199" y2="239.498" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#002BFF"/><stop offset="1" stop-color="#2F90FF"/></linearGradient>'
  +'<clipPath id="@s"><rect x="0.5" y="0" width="562.5" height="1218" rx="70"/></clipPath><clipPath id="@c"><path/></clipPath><clipPath id="@w"><rect x="0" y="0" width="0" height="300"/></clipPath></defs>'
  +'<g transform="translate(1158 201)"><g clip-path="url(#@s)"><rect width="564" height="1218" fill="#EFEFEF"/><g class="dash"></g><g class="card"><path class="bg" fill="#fff"/><g class="cc"></g>'
  +'<g clip-path="url(#@c)"><g class="ch"><g transform="translate(0.5 405) scale(1.5)"><g transform="translate(0 50)">'
  +'<path opacity="0.1" fill-rule="evenodd" fill="url(#@p)" d="M0.996094 194.289C96.8942 195.662 177.342 149.188 203.98 131.025C246.073 102.326 299.346 79.7437 374.999 79.7432V250H203.98H0.996094"/>'
  +'<path clip-path="url(#@w)" fill-rule="evenodd" fill="url(#@d)" d="M0 194.074C117.375 194.074 208 128 208 128V250H0"/></g><g class="d"></g><g class="pt"></g></g></g></g></g>'
  +'<g class="feat"></g><rect x="181.5" y="1196.5" width="200" height="7.5" rx="3.75" fill="#000"/></g><g class="hd"></g><g class="hf"></g></g>';
 svg.innerHTML=svg.innerHTML.replace(/@/g,id);
 var q=function(s){return svg.querySelector(s)},dash=q(".dash"),card=q(".card"),bg=q(".bg"),cc=q(".cc"),ch=q(".ch"),cp=q("#"+id+"c path"),
  wipe=q("#"+id+"w rect"),feat=q(".feat"),hf=q(".hf"),parts=[];
 var strip=win(SRC.strip,0,2160,131,dash,2160);                              /* page rows 131..2292 */
 win(SRC.strip,CARD.y+D-131,264,CARD.y,cc,2160);                             /* card title, amount, Income line */
 win(SRC.head,0,131,0,q(".hd"),262);win(SRC.head,131,131,0,hf,262);
 var band=function(y0,y1){var g=el("g",{},feat);win(SRC.feat,y0-131,y1-y0,y0,g,1065);return g};
 var tabs=band(131,226),sum=band(226,330),cht=band(330,782),bills=band(782,1196);
 DOTS.forEach(function(d){parts.push({t:d[2],dur:DOT,f:cub,x:d[0],y:d[1],e:el("circle",{cx:d[0],cy:d[1],r:1,fill:"#0055D8"},q(".d")),o:1})});
 parts.push({t:SOLID[2],dur:LAND,f:back,x:SOLID[0],y:SOLID[1],e:el("circle",{cx:SOLID[0],cy:SOLID[1],r:5.75,fill:"#0055D8",stroke:"#fff","stroke-width":1.5},q(".pt")),o:.5});
 RINGS.forEach(function(r){parts.push({t:r[2],dur:POP,f:back,x:r[0],y:r[1],e:el("circle",{cx:r[0],cy:r[1],r:5.75,fill:"#fff",stroke:"#0055D8","stroke-width":1.5},q(".pt")),o:.4})});
 var op=function(e,v){e.setAttribute("opacity",v>=1?1:v.toFixed(3))},tr=function(e,x,y){e.setAttribute("transform",x||y?"translate("+x.toFixed(2)+" "+y.toFixed(2)+")":"")};
 host.appendChild(svg);
 return [function(t){t=((t%PERIOD)+PERIOD)%PERIOD;
  /* scroll position (px) and expand progress p (0 card .. 1 feature page) */
  var s=t<TOP?0:t<TOP+SCR?D*sine((t-TOP)/SCR):t<U0?D:D*(1-sine((t-U0)/SCR));
  var p=t<E0?0:t<E0+EXP?(t-E0)/EXP:t<C1?1:t<U0?1-(t-C1)/EXP:0,e=inout(p);
  var tc=t>=C0&&t<PERIOD?t-C0:-1;                                            /* chart clock; clears at the loop point */
  tr(strip,0,0);strip.setAttribute("y",131-s);tr(card,0,D-s);
  op(dash,1-cub(seg(p,0,320)));
  var x=CARD.x+(FULL.x-CARD.x)*e,y=CARD.y+(FULL.y-CARD.y)*e,w=CARD.w+(FULL.w-CARD.w)*e,h=CARD.h+(FULL.h-CARD.h)*e,r=CARD.r*(1-e),d=rr(x,y,w,h,r);
  bg.setAttribute("d",d);cp.setAttribute("d",d);
  op(cc,1-seg(p,0,320));tr(cc,0,(FULL.y-CARD.y)*e-24*e);tr(ch,0,CHART_DY*e);
  op(hf,inout(seg(p,0,512)));op(tabs,inout(seg(p,384,704)));
  var a=inout(seg(p,448,768));op(sum,a);tr(sum,0,12*(1-a));
  op(cht,Math.pow(seg(p,640,896),2));
  a=inout(seg(p,512,896));op(bills,a);tr(bills,0,36*(1-a));
  wipe.setAttribute("width",tc<0?0:(375*sine(cl(tc/WIPE))).toFixed(2));
  for(var i=0;i<parts.length;i++){var o=parts[i],u=tc<0?0:cl((tc-o.t)/o.dur),k=u>=1?1:o.f(u);
   op(o.e,cl(u/o.o));o.e.setAttribute("transform",k===1?"":"translate("+o.x+" "+o.y+") scale("+Math.max(0,k).toFixed(4)+") translate("+(-o.x)+" "+(-o.y)+")")}}
 ,SRC];
}
function control(host){
 var t=0,raf=0,last=0,vis=false,on=!window.dbhDemos,frozen=false,draw=null,svg=null;
 var go=function(){return draw&&!frozen&&!RM.matches&&vis&&on&&!doc.hidden};
 var tick=function(now){raf=0;if(!go()){last=0;return}if(last)t=(t+Math.min(64,now-last))%PERIOD;last=now;draw(t);raf=requestAnimationFrame(tick)};
 var upd=function(){if(!draw||frozen)return;if(RM.matches){draw(E0);return}if(go()&&!raf){last=0;raf=requestAnimationFrame(tick)}};
 /* load the three crops first (only once the box is near the view); until then the slide image alone shows */
 var start=function(){if(draw)return;start=function(){};var b=build(host,"cm"+Math.random().toString(36).slice(2,7)),f=b[0];svg=host.lastChild;
  svg.style.visibility="hidden";var srcs=b[1],n=0,keys=Object.keys(srcs),done=function(){if(++n<keys.length)return;
   f(RM.matches?E0:t);svg.style.visibility="";draw=f;upd()};
  keys.forEach(function(k){var i=new Image();i.onload=i.onerror=function(){(i.decode?i.decode().catch(function(){}):Promise.resolve()).then(done)};i.src=srcs[k]})};
 if("IntersectionObserver" in window){
  new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting}))start()},{rootMargin:"600px 0px"}).observe(host);
  new IntersectionObserver(function(es){es.forEach(function(e){vis=e.intersectionRatio>=.35});upd()},{threshold:[0,.35]}).observe(host);
 }else{vis=true;start()}
 if(window.dbhDemos)dbhDemos.add(host,{play:function(){on=true;upd()},pause:function(){on=false}});
 doc.addEventListener("visibilitychange",upd);if(RM.addEventListener)RM.addEventListener("change",upd);
 return {seek:function(v){frozen=true;start();t=v;if(draw)draw(t)},resume:function(){frozen=false;upd()},time:function(){return t},ready:function(){return !!draw}};
}
var insts=[];
function mount(){if(!doc.getElementById("cm-css")){var s=doc.createElement("style");s.id="cm-css";
  s.textContent="[data-citi-mo]{position:relative;outline:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}[data-citi-mo]>svg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;overflow:hidden}";doc.head.appendChild(s)}
 [].forEach.call(doc.querySelectorAll("[data-citi-mo]"),function(h){if(h.__cm)return;h.__cm=1;try{insts.push(control(h))}catch(err){if(window.console)console.warn("citi-chart:",err)}})}
window.__citiMo={seek:function(t,i){var x=insts[i||0];x&&x.seek(t)},resume:function(i){var x=insts[i||0];x&&x.resume()},ready:function(i){var x=insts[i||0];return !!(x&&x.ready())},PERIOD:PERIOD,E0:E0};
doc.readyState==="loading"?doc.addEventListener("DOMContentLoaded",mount,{once:true}):mount();
})();
