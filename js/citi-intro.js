/* Citi intro: the Citigold app opening, splash -> home (Figma file XYE8LCJVe0rHhnEB5DA18A, deck slides citi_11 141388:16711 ->
   citi_12 141388:16730, phone "Citi Gold" 141388:16712 / 141388:16733). Played by the shared state-seq player (js/state-seq.js,
   load it AFTER this file): this file only writes the stage markup and the state-seq config, so the motion is config, not code.
   Three parts, kept apart so a tier switch is a token swap, not new motion:
     THEMES  per-tier tokens + content (colours, gradient, accent, splash tint, copy). Only "gold" ships; Blue and Priority are noted below.
     SCREEN  the 375x812 phone markup, built from a theme.
     MOTION  the state-seq sequence (theme-free): Splash hold 1600 · open 1248 · Home hold 4000 · close 1248 = 8096ms loop.
   Prototype (read from the Figma reactions): citi_11 -[Right arrow]-> citi_12 and citi_12 -[Left arrow]-> citi_11, both SMART_ANIMATE,
   easing SLOW, 1250.12ms -> 1248ms here (8ms grid). SLOW = Figma's spring k80 c20 m1 = state-seq's default curve. The holds are not in
   Figma (the deck advances on key presses); they are design choices on the 8ms grid.
   Smart-animate pairs (citi_11 -> citi_12, phone px): logo 132,360 114.8x74 o1 -> 74.6,8 x2 o0 · greeting y375 o0 #ffc37c -> y90 o1 white
   · Sign Off o0 -> o1 (new parent: dissolves) · light ground y812 h1 -> y482 h330 · Citi Accounts y1012 -> 172 · Portfolio tile y1132 -> 454
   · Transactions tile y1237 -> 704 · tab bar y1532 -> 727 · home bar y1583 -> 778, handle white -> black. The accounts, tiles and tab
   bar are empty in citi_11, so their contents fade in (Figma dissolves unmatched layers). Status bar and phone gradient do not move.
   API (for the future three-tier toggle): CitiIntro.setTheme(name) applies a theme's tokens + copy and replays the open;
   CitiIntro.replay() cuts to the splash and opens again. Tier frames in Figma for when they are wired:
     citi_12: Citi Blue 141388:16731 (gradient #002d72 top -> #0055d8 bottom, 0-100%), Citi Priority 141388:16732 (#57759b -> #14202c, 0-100%),
       Citi Gold 141388:16733 (both tiers empty frames at opacity 0 there)
     citi_13: Citi Blue 141388:15297 (solid #0055d8, its gradient hidden), Citi Priority 141388:15681, Citi Gold 141388:16065 (Blue/Priority: Transactions tile first, no Portfolio,
     first account Citi Double Cash®: their tile layout differs, so they need their own MOTION.home positions, see THEMES note)
   Reduced motion: the Home frame, still. Offscreen / hidden tab: paused (state-seq). Phone: screen 375x812 R48 at 60% smoothing, 8px black OUTSIDE stroke (bezel 391x828 R56), shadow 40/48 blur 20 black 16%.
   Corners: 60%-smoothed squircles (state-seq squircle maths
   via FMSSSplit.squircle when present). Styles: css/citi-intro.css. */
(function(){"use strict";
var box=document.querySelector('[data-citi-intro]');if(!box)return;
var stage=box.querySelector('.ss-stage');
var A=(function(){var s=document.currentScript&&document.currentScript.src;return s?s.replace(/js\/citi-intro\.js.*$/,'assets/citi/intro/'):'../assets/citi/intro/'})();
var V='?v=178';

/* ---- THEMES: tokens + copy per tier (Figma citi_12 / citi_13). Only gold is filled; blue / priority need their tokens read from
   141388:15297 / 141388:15681 (accent hues, gradient stops) and a tile-order variant before they can be added here. */
var THEMES={
 gold:{label:'Citigold',
  tokens:{'--ci-g0':'#000','--ci-g0s':'-29.469%','--ci-g1':'#a37543','--ci-g1s':'208.33%', /* phone gradient: Figma's transform puts the stops off the
     frame (t = .1239 + .4205*y), so the screen runs from 12.4% to 54.4% of black -> #a37543 */
   '--ci-acc':'#8e6f32','--ci-acc2':'#aa853c','--ci-tint':'#ffc37c'},                   /* tile/tab accent, Transactions title, splash greeting */
  greeting:['Good Morning','Sarah'],
  accounts:[['Citi® / AAdvantage® Executive','9848','$2,126.36','Current Balance'],['Citi® Checking','9820','$4,214.52','Available Now'],
   ['Citi® Savings','9840','$5,830.60','Available Now']],
  portfolio:{total:'$865,387.20',asOf:'As of 10/24/20 12:22 PM',
   legend:[['#451245','Stocks','38%'],['#c6533d','Bonds','29%'],['#cf9c48','Mutual Funds','13%'],['#5f6465','ETFs','15%'],['#6f87b2','Cash','5%']]},
  transactions:[['Uber','Citi® / AAdvantage® Executive - 9848','$53.46','Pending'],['Walgreens','Citi® / AAdvantage® Executive - 9848','$21.32','Pending'],
   ['Sant Ambroeus','Citi® / AAdvantage® Executive - 9848','$320.40',''],['Lyft','Citi® / AAdvantage® Executive - 9848','$42.67',''],
   ['Walgreens','Citi Double Cash - 9848','$21.32','']]}
};

/* ---- SCREEN: phone markup from a theme (layers carry data-l for state-seq) */
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')};
var CHEV='<svg class="ci-chev" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function row(c,d){return '<div class="ci-row'+(d?' ci-dv':'')+'"><div class="ci-l"><b>'+esc(c[0])+'</b><small>'+esc(c[1])+'</small></div>'+
 '<div class="ci-r"><b>'+esc(c[2])+'</b>'+(c[3]?'<small>'+esc(c[3])+'</small>':'')+'</div></div>'}
function accounts(t){return '<div class="ci-acc-h ci-dv"><span>Citi Accounts</span><small>View Disclosure</small></div>'+t.accounts.map(function(c){return row(c,1)}).join('')}
function portfolio(t){var p=t.portfolio;return '<div class="ci-th ci-dv"><span class="ci-a1">Investment Portfolio</span><i class="ci-a1">'+CHEV+'</i></div>'+
 '<div class="ci-pf"><div class="ci-tot"><b>'+esc(p.total)+'</b><small>'+esc(p.asOf)+'</small></div><div class="ci-chart"><ul>'+
 p.legend.map(function(l){return '<li><i style="background:'+l[0]+'"></i><span>'+esc(l[1])+'</span><span>'+esc(l[2])+'</span></li>'}).join('')+
 '</ul><img src="'+A+'pie.svg'+V+'" width="120" height="120" alt=""></div></div>'}
function transactions(t){var n=t.transactions.length;return '<div class="ci-th ci-dv"><span class="ci-a2">Transactions</span><i class="ci-a2">'+CHEV+'</i></div>'+
 t.transactions.map(function(c,j){return row(c,j<n-1)}).join('')}
/* the selected tab icon inline (Figma "Icon selected"): the disc in the tier accent, its three bars white */
var TABS='<div class="ci-tab ci-on"><svg class="ci-ico" viewBox="0 0 23 23"><circle cx="11.5" cy="11.5" r="11.5" fill="currentColor"/><path d="M5 16H18V15H5ZM5 12H18V11H5ZM5 8H18V7H5Z" fill="#fff"/></svg><span>Accounts</span></div>'+
 '<div class="ci-tab"><img class="ci-pay" src="'+A+'tab-payments.svg'+V+'" alt=""><span>Payments</span></div>'+
 '<div class="ci-tab"><img class="ci-svc" src="'+A+'tab-services.svg'+V+'" alt=""><span>Services</span></div>'+
 '<div class="ci-tab"><img class="ci-pro" src="'+A+'tab-profile.svg'+V+'" alt=""><span>Profile</span></div>';
function greeting(t){return '<small>'+esc(t.greeting[0])+'</small><b>'+esc(t.greeting[1])+'</b>'}
stage.innerHTML='<div class="ci-sh" data-l="ph"><i class="ci-bz"></i><div class="ci-ph">'+
 '<img class="ci-logo" data-l="lg" src="'+A+'logo.svg'+V+'" width="115" height="74" alt="">'+
 '<div class="ci-gr" data-l="gr"><div class="ci-gw">'+greeting(THEMES.gold)+'</div><div class="ci-gt" data-l="gt">'+greeting(THEMES.gold)+'</div></div>'+
 '<div class="ci-bg" data-l="bg"></div>'+
 '<div class="ci-accs" data-l="ac"><div data-l="acc"></div></div>'+
 '<div class="ci-tile ci-pft" data-l="pf"><div data-l="pfc"></div></div>'+
 '<div class="ci-tile ci-txt" data-l="tx"><div data-l="txc"></div></div>'+
 '<div class="ci-tabs" data-l="tb"><div class="ci-tabr" data-l="tbc">'+TABS+'</div></div>'+
 '<div class="ci-so" data-l="so">Sign Off</div>'+
 '<div class="ci-home" data-l="ha"><i data-l="hh"></i></div>'+
 '<div class="ci-sb"><span>2:04</span><img src="'+A+'status-right.svg'+V+'" width="67" height="11" alt=""></div>'+
 '</div></div>';

/* ---- MOTION: the state-seq config (theme-free; design px on the 1920x1080 Figma slide, phone at 773,134) */
var MOTION={mode:'loop',spring:[80,20,1],dur:1248,tr:{'0>1':1248,'1>0':1248},rm:1,w:1920,h:1080,
 base:{ph:{x:773,y:134},lg:{x:132,y:360,s:1,o:1},gr:{x:135,y:375,o:0},gt:{o:1},so:{x:313,y:60,o:0},bg:{y:812,h:1},ac:{y:1012},acc:{o:0},
  pf:{x:12,y:1132},pfc:{o:0},tx:{x:12,y:1237},txc:{o:0},tb:{y:1532},tbc:{o:0},ha:{y:1583},hh:{x:121,y:20,c:'#ffffff'}},
 states:[{name:'Splash',hold:1600,set:{}},
  {name:'Home',hold:4000,set:{lg:{x:74.6,y:8,s:2,o:0},gr:{y:90,o:1},gt:{o:0},so:{o:1},bg:{y:482,h:330},ac:{y:172},acc:{o:1},
   pf:{y:454},pfc:{o:1},tx:{y:704},txc:{o:1},tb:{y:727},tbc:{o:1},ha:{y:778},hh:{c:'#000000'}}}],
 /* phones: a 4:5 frame (css), the stage 864x1080, raised 48 design px so the phone clears the 16px-inset controls */
 layouts:[{mq:'(max-width:640px)',w:864,h:1080,oy:-48,base:{ph:{x:244.5}}}]};
var cfg=document.createElement('script');cfg.type='application/json';cfg.className='ss-cfg';cfg.textContent=JSON.stringify(MOTION);box.appendChild(cfg);

/* corners: 60%-smoothed squircles (the phone R48, tiles R16), cut once in design px (the stage scales them) */
function sq(w,h,R){if(window.FMSSSplit&&FMSSSplit.squircle)return FMSSSplit.squircle(w,h,R,.6);
 var rad=function(x){return x*Math.PI/180},sm=.6,bud=Math.min(w,h)/2;R=Math.min(R,bud);var p=(1+sm)*R,am=90*(1-sm),arc=Math.sin(rad(am/2))*R*Math.SQRT2,p34=R*Math.tan(rad((90-am)/4)),be=45*sm,
 c=p34*Math.cos(rad(be)),d=c*Math.tan(rad(be)),b=(p-arc-c-d)/3,a=2*b,f=function(v){return +v.toFixed(3)},A2=f(a),AB=f(a+b),X=f(a+b+c),BC=f(b+c),C=f(c),D=f(d),S=f(arc),r=f(R);
 return 'M'+f(w-p)+' 0c'+A2+' 0 '+AB+' 0 '+X+' '+D+'a'+r+' '+r+' 0 0 1 '+S+' '+S+'c'+D+' '+C+' '+D+' '+BC+' '+D+' '+X+'L'+w+' '+f(h-p)+'c0 '+A2+' 0 '+AB+' '+(-D)+' '+X+'a'+r+' '+r+' 0 0 1 '+(-S)+' '+S+'c'+(-C)+' '+D+' '+(-BC)+' '+D+' '+(-X)+' '+D+
  'L'+f(p)+' '+h+'c'+(-A2)+' 0 '+(-AB)+' 0 '+(-X)+' '+(-D)+'a'+r+' '+r+' 0 0 1 '+(-S)+' '+(-S)+'c'+(-D)+' '+(-C)+' '+(-D)+' '+(-BC)+' '+(-D)+' '+(-X)+'L0 '+f(p)+'c0 '+(-A2)+' 0 '+(-AB)+' '+D+' '+(-X)+'a'+r+' '+r+' 0 0 1 '+S+' '+(-S)+'c'+C+' '+(-D)+' '+BC+' '+(-D)+' '+X+' '+(-D)+'Z'}
var ph=stage.querySelector('.ci-ph'),P=sq(375,812,48);
ph.style.clipPath="path('"+P+"')";stage.querySelector('.ci-bz').style.clipPath="path('"+sq(391,828,56)+"')";
stage.querySelector('.ci-pft').style.clipPath="path('"+sq(351,238,16)+"')";
stage.querySelector('.ci-txt').style.clipPath="path('"+sq(351,380,16)+"')";

/* ---- theme + replay API */
var cur=null;
function apply(name){var t=THEMES[name];if(!t)return false;cur=name;
 for(var k in t.tokens)ph.style.setProperty(k,t.tokens[k]);ph.setAttribute('data-tier',name);
 stage.querySelector('[data-l=acc]').innerHTML=accounts(t);stage.querySelector('[data-l=pfc]').innerHTML=t.portfolio?portfolio(t):'';
 stage.querySelector('[data-l=txc]').innerHTML=transactions(t);
 stage.querySelector('.ci-gw').innerHTML=stage.querySelector('.ci-gt').innerHTML=greeting(t);return true}
var rt=0;
function replay(){var ss=box.__ss;if(!ss)return;clearTimeout(rt);ss.go(0,{dur:0,force:true,quiet:true});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)rt=setTimeout(function(){ss.go(1,{manual:true})},640)}
apply(box.getAttribute('data-citi-intro')||'gold');
window.CitiIntro={themes:THEMES,motion:MOTION,theme:function(){return cur},
 setTheme:function(name){if(name===cur||!apply(name))return false;replay();return true},replay:replay};
})();
