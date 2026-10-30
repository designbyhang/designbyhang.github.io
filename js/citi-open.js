/* Citi Color Theming opening, the first figure of 03 Color Theming, above the theme tiles (Hang's guide: Figma "Selected Case Studies (For Grok)" XYE8LCJVe0rHhnEB5DA18A, prototype flow 143313:7576 ->
   143313:7096 -> 143313:8050 -> 143361:13572 -> 143361:15021 -> 143361:15593 -> back to 143313:7576, six 1920x1080 "Opening" frames).
   Each tier opens the app: its splash screen smart-animates into home while a giant glowing citi mark drifts in behind the phone and
   the tier's title (name + two colour dots) slides in at the bottom left; then the next tier's splash dissolves in over it, the ground
   colour changes, and the mark and title drift on out to the right. Citi Blue -> Citi Priority -> Citigold -> Citi Blue, looping.
   Built on the shared parts, config only: the phone, screens and splash/home poses are CitiPhone (js/citi-intro.js, load it first), the
   motion is the shared state-seq player (js/state-seq.js, load it after), which registers with the one-demo pool (js/demos.js), plays
   only >= 35% in view with the tab visible, pauses offscreen, and is ambient (no controls, taps, keys or focus). Styles: css/citi-open.css.
   Figma, read from the file (every transition): SMART_ANIMATE, easing SLOW (spring k80 c20 m1 = state-seq's default curve), 1666.8 ms
   -> 1664 ms on the 8 ms grid. The prototype advances on the arrow keys, so it has no holds; the holds here are Hang's rhythm: the
   splash breathes 480, home (title in) 1280. Loop: 6 x 1664 + 3 x (480 + 1280) = 15264 ms.
   Frame by frame (design px on the 1920x1080 frame; phone screen 375x812 at 773,134 in every frame):
     splash  ground #002f9b / #17293f / #2c1f10; the screen's splash (logo 132,360); its mark x480 o0 and title x40 o0 wait on the left;
             the previous tier's mark x720 o0 and title x200 o0 have drifted out to the right
     home    the screen opens (logo up to 74.6,8 at 2x and out, greeting up to y90, accounts, tiles and tab bar up into place, Sign Off
             in, handle white -> black); the mark slides to x560 at 20% and the title to x120 at 100%
   Screens are different Figma frames per tier (Screen Blue / Priority / Gold), so smart animate dissolves them: the incoming screen
   fades in over the outgoing one (Gold -> Blue: Gold fades out over the waiting Blue splash: the same picture with the stack fixed).
   Splash poses are the guide's, per tier: Blue/Priority accounts y1012, first tile y1237, tab bar y1532; Gold accounts 1152, Portfolio
   1434, Transactions 1684, tab bar 1707; the home bar stays at y778 (only its handle changes colour); Sign Off y64 -> y60.
   The mark: Figma's Logo group (the citi wordmark + arc, 1% white fill, white drop shadow blur 250 knocked out of the shape, group 20%):
   assets/citi/open/mark-glow.webp (the blur, rendered from Figma's own SVG filter at half size: it is soft) under the exact vector
   knockout as a mask (assets/citi/open/mark-mask.svg), so the inner edge stays vector-crisp. Layer box = the filter region 1740x1300
   at (logo x - 250, -110). Reduced motion: Citi Blue home, still (rm 1). */
(function(){"use strict";
var box=document.querySelector('[data-citi-open]'),P=window.CitiPhone;if(!box||!P)return;
var stage=box.querySelector('.ss-stage');
var A=(function(){var s=document.currentScript&&document.currentScript.src;return s?s.replace(/js\/citi-open\.js.*$/,'assets/citi/open/'):'../assets/citi/open/'})();
var V='?v=313';
/* per tier: key prefix, ground, title (Figma Title Blue 143354:11019 / Title Priority 143361:13578 / Title Gold 143361:16981:
   Inter Light 40, label then 20, two 40px dots 12 apart; dot 2 is a vertical gradient, Figma's transform resolved to CSS stops) */
var T=[{n:'blue',p:'b',sky:'#002f9b',label:'Citi Blue',ink:'#4e90ff',d1:'#0055d8',d2:'linear-gradient(180deg,#002bff -79.53%,#3995ff 100%)'},
 {n:'priority',p:'p',sky:'#17293f',label:'Citi Priority',ink:'#4f6f96',d1:'#123458',d2:'linear-gradient(180deg,#05386f 0%,#57759b 100%)'},
 {n:'gold',p:'g',sky:'#2c1f10',label:'Citigold',ink:'#8e6f32',d1:'#8e6f32',d2:'linear-gradient(180deg,#2c1f10 0%,#a37543 100%)'}];
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')};
/* paint order: ground, marks, titles, the phone (one shell; the three live screens stacked Blue, Priority, Gold inside it) */
stage.innerHTML='<div class="co-sky" data-l="sky"></div>'+
 T.map(function(t){return '<div class="co-mk" data-l="'+t.p+'mk"><img src="'+A+'mark-glow.webp'+V+'" width="870" height="650" alt=""></div>'}).join('')+
 T.map(function(t){return '<div class="co-tt" data-l="'+t.p+'tt" style="color:'+t.ink+'"><span>'+esc(t.label)+'</span><i style="background:'+t.d1+'"></i><i style="background:'+t.d2+'"></i></div>'}).join('')+
 P.phone('ph',T.map(function(t){return '<div class="co-sw" data-l="'+t.p+'sw">'+P.screen(t.n,1,'',t.p)+'</div>'}).join(''));
P.clips(stage);

/* poses */
function pre(o,p){var r={};for(var k in o)r[p+k]=o[k];return r}
function mix(){var o={};[].forEach.call(arguments,function(s){for(var k in s){o[k]=o[k]||{};for(var q in s[k])o[k][q]=s[k][q]}});return o}
function splash(t){var th=P.themes[t.n],s=P.splash(th);s.ha={y:778};s.so={x:313,y:64,o:0};s.ac={y:th.portfolio?1152:1012};
 if(th.portfolio){s.pf={x:12,y:1434};s.tx={x:12,y:1684};s.tb={y:1707}}else{s.tx={x:12,y:1237};s.tb={y:1532}}return s}
function home(t){return P.home(P.themes[t.n])}
/* a tier's phase: 'wait' (hidden, splash pose, mark + title waiting left), 'splash', 'home', 'under' (home pose, still opaque under the
   next tier's incoming screen; mark + title drift out right), 'gone' (home pose, faded: Gold over the Blue splash) */
function tier(t,ph,o){var p=t.p,s=ph==='home'||ph==='under'||ph==='gone'?home(t):splash(t),r=pre(s,p);
 r[p+'sw']={o:o};
 r[p+'mk']=ph==='home'?{x:310,y:-110,o:.2}:ph==='under'||ph==='gone'?{x:470,y:-110,o:0}:{x:230,y:-110,o:0};
 r[p+'tt']=ph==='home'?{x:120,y:920,o:1}:ph==='under'||ph==='gone'?{x:200,y:920,o:0}:{x:40,y:920,o:0};return r}
var B=T[0],R=T[1],G=T[2],C={ph:{x:773,y:134}};
var S=[[T[0].sky,tier(B,'splash',1),tier(R,'wait',0),tier(G,'gone',0),'Citi Blue, opening the app',480],
 [T[0].sky,tier(B,'home',1),tier(R,'wait',0),tier(G,'wait',0),'Citi Blue',1280],
 [T[1].sky,tier(B,'under',1),tier(R,'splash',1),tier(G,'wait',0),'Citi Priority, opening the app',480],
 [T[1].sky,tier(B,'wait',0),tier(R,'home',1),tier(G,'wait',0),'Citi Priority',1280],
 [T[2].sky,tier(B,'wait',0),tier(R,'under',1),tier(G,'splash',1),'Citigold, opening the app',480],
 [T[2].sky,tier(B,'wait',1),tier(R,'wait',0),tier(G,'home',1),'Citigold',1280]];
var MOTION={mode:'loop',ambient:true,spring:[80,20,1],dur:1664,rm:1,w:1920,h:1080,
 base:mix(C,{sky:{c:T[0].sky}},S[0][1],S[0][2],S[0][3]),
 states:S.map(function(s){return {name:s[4],hold:s[5],set:mix(C,{sky:{c:s[0]}},s[1],s[2],s[3])}})};
var cfg=document.createElement('script');cfg.type='application/json';cfg.className='ss-cfg';cfg.textContent=JSON.stringify(MOTION);box.appendChild(cfg);
window.CitiOpen={motion:MOTION,tiers:T};
})();
