/* Citi intro (Color Theming): one continuous piece. The app opens in Citi Blue (splash -> home, Figma citi_11 141388:16711 -> citi_12
   141388:16730), sweeps up a tier to Citi Priority, then to Citigold, then splits into citi_13's three-up row (141388:15296: Blue 278 ·
   Priority 773 · Gold 1268, y134), holds, and folds back into the one Blue phone, which closes to the splash and opens again.
   Played by the shared state-seq player (js/state-seq.js, load it AFTER this file): this file only writes the stage markup and the
   state-seq config, so the motion is config, not code. Parts:
     THEMES  per-tier tokens + copy (Blue 141388:15297, Priority 141388:15681 from citi_13; Gold from citi_12 141388:16733).
     LAYOUT  per-tier tile stack (Gold: Portfolio then Transactions; Blue/Priority: Transactions first) -> splash and home poses.
     SCREEN  one 375x812 phone-screen builder for every tier: the live (animated) screen, and still home screens for the sweeps + row.
     MOTION  the state-seq sequence. Splash 1600 · open 1248 · sweep to Priority 1440 · sweep to Gold 1440 · split 1600 · row hold 1440 ·
             fold back 1440 · close 1248, chained by 8ms holds = 11488ms loop (all on the 8ms grid).
   Opening (unchanged from the Citigold build): Figma's SMART_ANIMATE, easing SLOW, 1250.12ms -> 1248ms (SLOW = spring k80 c20 m1 =
   state-seq's default curve), smart-animate pairs (phone px): logo 132,360 114.8x74 o1 -> 74.6,8 x2 o0 · greeting y375 -> y90 · Sign Off
   o0 -> o1 · light ground y812 h1 -> y482 h330 · Citi Accounts y1012 -> 172 · first tile y1132 -> 454 (Gold's second tile 1237 -> 704) ·
   tab bar y1532 -> 727 · home bar y1583 -> 778, handle white -> black; empty layers' contents fade in.
   Sweeps: still home screens of the next tier in left-anchored wipes inside the live screen (w 0 -> 375, Blue -> Priority -> Gold, the
   tier row's direction). Split: the live (now Gold) phone slides to the right slot; the Priority and Blue phones, hidden behind it,
   are revealed at the centre and drawn out to the left. Fold back: the row converges on the centre with the live phone on top, its two
   sweeps retracting as it lands, so it arrives in Blue over the Blue phone; the close then plays the opening in reverse.
   Ambient (state-seq ambient:true): no pill, no play/pause, no tabindex, tap, swipe or keys; it just autoplays and loops.
   Reduced motion: the three-up row, still (rm 4). Offscreen / hidden tab: paused (state-seq). Phone: screen 375x812 R48 at 60% smoothing,
   8px black OUTSIDE stroke (bezel 391x828 R56), shadow 40/48 blur 20 black 16%. Styles: css/citi-intro.css. */
(function(){"use strict";
var A=(function(){var s=document.currentScript&&document.currentScript.src;return s?s.replace(/js\/citi-intro\.js.*$/,'assets/citi/intro/'):'../assets/citi/intro/'})();
var V='?v=179';

/* ---- THEMES: tokens + copy per tier. Blue 141388:15297 and Priority 141388:15681 read from citi_13 (get_design_context); Gold from
   citi_12 141388:16733. Blue/Priority: first account Citi Double Cash®, Transactions first, no Portfolio (their own tile layout, see LAYOUT). */
var ACC2=[['Citi® Checking','9820','$4,214.52','Available Now'],['Citi® Savings','9840','$5,830.60','Available Now']];
function txs(a,last){return [['Uber',a,'$53.46','Pending'],['Walgreens',a,'$21.32','Pending'],['Sant Ambroeus',a,'$320.40',''],['Lyft',a,'$42.67',''],['Walgreens',last||a,'$21.32','']]}
var DC='Citi Double Cash® - 9848',G=['Good Morning','Sarah'];
var THEMES={
 blue:{label:'Citi Blue',
  tokens:{'--ci-g0':'#0055d8','--ci-g0s':'0%','--ci-g1':'#0055d8','--ci-g1s':'100%', /* citi_13 Blue: solid #0055d8 (its gradient layer is hidden) */
   '--ci-acc':'#0055d8','--ci-acc2':'#0055d8','--ci-tint':'#ffffff'},   /* no Blue splash in Figma: the greeting stays white (no tint tween) */
  greeting:G,accounts:[['Citi Double Cash®','9848','$2,126.36','Current Balance']].concat(ACC2),transactions:txs(DC)},
 priority:{label:'Citi Priority',
  tokens:{'--ci-g0':'#57759b','--ci-g0s':'0%','--ci-g1':'#14202c','--ci-g1s':'100%','--ci-acc':'#0e2a48','--ci-acc2':'#0e2a48','--ci-tint':'#ffffff'},
  greeting:G,accounts:[['Citi Double Cash®','9848','$2,126.36','Current Balance']].concat(ACC2),transactions:txs(DC)},
 gold:{label:'Citigold',
  tokens:{'--ci-g0':'#000','--ci-g0s':'-29.469%','--ci-g1':'#a37543','--ci-g1s':'208.33%', /* phone gradient: Figma's transform puts the stops off the
     frame (t = .1239 + .4205*y), so the screen runs from 12.4% to 54.4% of black -> #a37543 */
   '--ci-acc':'#8e6f32','--ci-acc2':'#aa853c','--ci-tint':'#ffc37c'},                   /* tile/tab accent, Transactions title, splash greeting */
  greeting:G,
  accounts:[['Citi® / AAdvantage® Executive','9848','$2,126.36','Current Balance']].concat(ACC2),
  portfolio:{total:'$865,387.20',asOf:'As of 10/24/20 12:22 PM',
   legend:[['#451245','Stocks','38%'],['#c6533d','Bonds','29%'],['#cf9c48','Mutual Funds','13%'],['#5f6465','ETFs','15%'],['#6f87b2','Cash','5%']]},
  transactions:txs('Citi® / AAdvantage® Executive - 9848','Citi Double Cash - 9848')}
};
/* the tier the piece opens in (data-citi-intro), then the two upgrades it sweeps through; the three-up row is this order left -> right */
var TIERS=['blue','priority','gold'];

/* ---- LAYOUT: per-tier tile stack, [splash y, home y] (Figma smart-animate pairs). Gold: Portfolio 1132 -> 454, Transactions 1237 -> 704.
   Blue/Priority: Transactions takes the first slot, 1132 -> 454. */
function tiles(t){return t.portfolio?{pf:[1132,454],tx:[1237,704]}:{tx:[1132,454]}}
/* the home pose of every screen layer (design px inside the 375x812 phone); the live screen animates into it, the still screens sit in it */
function home(t){var h={lg:{x:74.6,y:8,s:2,o:0},gr:{x:135,y:90,o:1},gt:{o:0},so:{x:313,y:60,o:1},bg:{y:482,h:330},ac:{y:172},acc:{o:1},
  tb:{y:727},tbc:{o:1},ha:{y:778},hh:{x:121,y:20,c:'#000000'}},T=tiles(t);for(var k in T){h[k]={x:12,y:T[k][1]};h[k+'c']={o:1}}return h}
function splash(t){var s={lg:{x:132,y:360,s:1,o:1},gr:{x:135,y:375,o:0},gt:{o:1},so:{x:313,y:60,o:0},bg:{y:812,h:1},ac:{y:1012},acc:{o:0},
  tb:{y:1532},tbc:{o:0},ha:{y:1583},hh:{x:121,y:20,c:'#ffffff'}},T=tiles(t);for(var k in T){s[k]={x:12,y:T[k][0]};s[k+'c']={o:0}}return s}

/* ---- SCREEN: one phone-screen builder for every tier. live = the animated screen (layers carry data-l for state-seq); otherwise a still
   home screen (the upgrade sweeps and the two tier phones of the row), same markup posed with inline styles, so all three are one system */
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
function pose(v){if(!v)return '';var s='';if('x' in v||'y' in v||'s' in v)s+='transform:translate('+(v.x||0)+'px,'+(v.y||0)+'px)'+(v.s!=null?' scale('+v.s+')':'')+';';
 if('h' in v)s+='height:'+v.h+'px;';if(v.c)s+='background-color:'+v.c+';';return s}
function screen(name,live,extra,p){var t=THEMES[name],H=home(t),tok='';p=p||'';for(var k in t.tokens)tok+=k+':'+t.tokens[k]+';';
 var L=function(k,cls,inner){return live?'<div class="'+cls+'" data-l="'+p+k+'">'+inner+'</div>':'<div class="'+cls+' ss-abs" style="'+pose(H[k])+'">'+inner+'</div>'},
  I=function(k,inner){return '<div class="ci-in"'+(live?' data-l="'+p+k+'"':'')+'>'+inner+'</div>'},T=tiles(t);
 return '<div class="ci-ph" data-tier="'+name+'" style="'+tok+'">'+
  (live?'<img class="ci-logo" data-l="'+p+'lg" src="'+A+'logo.svg'+V+'" width="115" height="74" alt="">':'')+
  L('gr','ci-gr','<div class="ci-gw">'+greeting(t)+'</div>'+(live?'<div class="ci-gt" data-l="'+p+'gt">'+greeting(t)+'</div>':''))+
  L('bg','ci-bg','')+L('ac','ci-accs',I('acc',accounts(t)))+
  (T.pf?L('pf','ci-tile ci-pft',I('pfc',portfolio(t))):'')+L('tx','ci-tile ci-txt',I('txc',transactions(t)))+
  L('tb','ci-tabs','<div class="ci-tabr'+(live?'':' ci-in')+'"'+(live?' data-l="'+p+'tbc"':'')+'>'+TABS+'</div>')+
  L('so','ci-so','Sign Off')+
  (live?'<div class="ci-home" data-l="'+p+'ha"><i data-l="'+p+'hh"></i></div>':'<div class="ci-home ss-abs" style="'+pose(H.ha)+'"><i class="ss-abs" style="'+pose(H.hh)+'"></i></div>')+
  '<div class="ci-sb"><span>2:04</span><img src="'+A+'status-right.svg'+V+'" width="67" height="11" alt=""></div>'+(extra||'')+'</div>'}
/* a phone: bezel + screen. The tier phones of the row (k = pb / pp) have no shadow of their own while they sit hidden behind the live
   phone (a stacked shadow would darken); their shadow is its own layer, k+'s' (fades in fast as the row opens) x k+'t' (fades out as it closes) */
function phone(k,inner,tier){return '<div class="ci-sh'+(tier?' ci-tier':'')+'" data-l="'+k+'">'+
 (tier?'<div class="ci-shd" data-l="'+k+'s"><div class="ci-shd" data-l="'+k+'t"><i class="ci-bz"></i></div></div>':'')+'<i class="ci-bz"></i>'+inner+
 /* rim: a 4px black stroke on the screen edge (2px inside, joining the bezel). Chrome antialiases each clipped paint on its own, so the
    tier painted underneath (the live Blue screen under a sweep) would fringe the edge by a hairline; the rim covers it, like the bezel */
 '<svg class="ci-rim" viewBox="0 0 375 812" aria-hidden="true"><path d="'+sq(375,812,48)+'"/></svg></div>'}
/* the shared builder (window.CitiPhone): the Color Theming opening (js/citi-open.js) builds its own stage from the same screens and phone; screen()'s
   p prefixes a live screen's layer keys so several live screens can share one stage */
function clip(stage,sel,p){[].forEach.call(stage.querySelectorAll(sel),function(e){e.style.clipPath="path('"+p+"')"})}
function clips(stage){clip(stage,'.ci-sh .ci-ph',sq(375,812,48));clip(stage,'.ci-bz',sq(391,828,56));clip(stage,'.ci-pft',sq(351,238,16));clip(stage,'.ci-txt',sq(351,380,16))}
window.CitiPhone={themes:THEMES,tiers:TIERS,tiles:tiles,home:home,splash:splash,screen:screen,phone:phone,sq:sq,clips:clips};
var box=document.querySelector('[data-citi-intro]');if(!box)return;
var stage=box.querySelector('.ss-stage');
var t0=box.getAttribute('data-citi-intro')||TIERS[0];
/* the live phone carries the two upgrade sweeps: still home screens of the next tiers in left-anchored wipes (layers wp, wg; w 0 -> 375) */
stage.innerHTML=phone('pb',screen(TIERS[0]),1)+phone('pp',screen(TIERS[1]),1)+
 phone('ph',screen(t0,1,'<div class="ci-wp" data-l="wp">'+screen(TIERS[1])+'</div><div class="ci-wp" data-l="wg">'+screen(TIERS[2])+'</div>'));

/* ---- MOTION: the state-seq config (design px on the 1920x1080 Figma slide; single phone at 773,134 = citi_13's centre slot).
   One continuous chain, no dwelling (Hang): the opening (unchanged, 1248) -> sweep up to Priority -> sweep up to Gold -> the split into
   citi_13's row (Blue 278 · Priority 773 · Gold 1268, scale 1; y134, citi_13's own position) -> short hold -> the row folds back into one Blue phone (the
   sweeps retract as it lands) -> the close (1248, the opening reversed) -> the Blue splash. 8ms holds = chained (state-seq needs a hold). */
function mix(){var o={};[].forEach.call(arguments,function(s){for(var k in s){o[k]=o[k]||{};for(var p in s[k])o[k][p]=s[k][p]}});return o}
var TL=THEMES[t0],SP=splash(TL),HM=home(TL),C={x:773,y:134,s:1},
 IN={wp:{w:375}},UP={wg:{w:375}},TIER={ppt:{o:1},pbt:{o:1}},SH={pps:{o:1},pbs:{o:1}},
 ROW={ph:{x:1268,y:134},pp:{x:773,y:134},pb:{x:278,y:134}}; /* citi_13's row, at its Figma y134 */
var MOTION={mode:'loop',ambient:true,spring:[80,20,1],dur:1440,
 tr:{'0>1':1248,'1>0':1248,'1>2':1440,'2>3':1440,'3>4':1600,'4>5':1440,'5>0':1248},edur:{pps:320,pbs:320},rm:4,w:1920,h:1080,
 base:mix({ph:C,pp:C,pb:C,pps:{o:0},ppt:{o:0},pbs:{o:0},pbt:{o:0},wp:{w:0},wg:{w:0}},SP),
 states:[{name:'Citi Blue, opening the app',hold:1600,set:{}},
  {name:'Citi Blue',hold:8,set:mix(HM,TIER)},
  {name:'Citi Priority',hold:8,set:mix(HM,TIER,IN)},
  {name:'Citigold',hold:8,set:mix(HM,TIER,IN,UP)},
  {name:'Citi Blue, Citi Priority, Citigold',hold:1440,set:mix(HM,TIER,IN,UP,SH,ROW)},
  {name:'Back to Citi Blue',hold:8,set:mix(HM,SH)}],
 /* phones: a 4:5 frame (css), the stage 864x1080, raised 48 design px; the row is
    citi_13's at 0.56 (pitch 495 -> 277.2, gap still 120/375 of a phone), centred in the box (the stage oy -48 undone: y 312.64 + 48) */
 layouts:[{mq:'(max-width:640px)',w:864,h:1080,oy:-48,base:{ph:{x:244.5},pp:{x:244.5},pb:{x:244.5}},
  states:[{},{},{},{},{set:{ph:{x:604.2,y:360.64,s:.56},pp:{x:327,y:360.64,s:.56},pb:{x:49.8,y:360.64,s:.56}}},{}]}]};
var cfg=document.createElement('script');cfg.type='application/json';cfg.className='ss-cfg';cfg.textContent=JSON.stringify(MOTION);box.appendChild(cfg);

/* corners: 60%-smoothed squircles (screens R48, bezels R56, tiles R16), cut once in design px (the stage scales them) */
function sq(w,h,R){if(window.FMSSSplit&&FMSSSplit.squircle)return FMSSSplit.squircle(w,h,R,.6);
 var rad=function(x){return x*Math.PI/180},sm=.6,bud=Math.min(w,h)/2;R=Math.min(R,bud);var p=(1+sm)*R,am=90*(1-sm),arc=Math.sin(rad(am/2))*R*Math.SQRT2,p34=R*Math.tan(rad((90-am)/4)),be=45*sm,
 c=p34*Math.cos(rad(be)),d=c*Math.tan(rad(be)),b=(p-arc-c-d)/3,a=2*b,f=function(v){return +v.toFixed(3)},A2=f(a),AB=f(a+b),X=f(a+b+c),BC=f(b+c),C=f(c),D=f(d),S=f(arc),r=f(R);
 return 'M'+f(w-p)+' 0c'+A2+' 0 '+AB+' 0 '+X+' '+D+'a'+r+' '+r+' 0 0 1 '+S+' '+S+'c'+D+' '+C+' '+D+' '+BC+' '+D+' '+X+'L'+w+' '+f(h-p)+'c0 '+A2+' 0 '+AB+' '+(-D)+' '+X+'a'+r+' '+r+' 0 0 1 '+(-S)+' '+S+'c'+(-C)+' '+D+' '+(-BC)+' '+D+' '+(-X)+' '+D+
  'L'+f(p)+' '+h+'c'+(-A2)+' 0 '+(-AB)+' 0 '+(-X)+' '+(-D)+'a'+r+' '+r+' 0 0 1 '+(-S)+' '+(-S)+'c'+(-D)+' '+(-C)+' '+(-D)+' '+(-BC)+' '+(-D)+' '+(-X)+'L0 '+f(p)+'c0 '+(-A2)+' 0 '+(-AB)+' '+D+' '+(-X)+'a'+r+' '+r+' 0 0 1 '+S+' '+(-S)+'c'+C+' '+(-D)+' '+BC+' '+(-D)+' '+X+' '+(-D)+'Z'}
clips(stage);

window.CitiIntro={themes:THEMES,tiers:TIERS,motion:MOTION,theme:function(){return t0}};
})();
