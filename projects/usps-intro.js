/* USPS Innovations case study: "Opening sequence" (SVG + GSAP, both local).
   Generated from the approved standalone build (/workspace/usps-intro, v8) by usps-intro/embed/make_embed.py, then extended by hand into a
   seamless loop (make_embed.py does not know about the loop; re-running it would drop it):
     blue pre-roll -> intro (logo fade, INNOVATIONS, THAT DELIVER, copy, START) -> 1s hold -> zoom out into the Studio Display art ->
     2s monitor hold -> zoom back in to a full-bleed blue screen while the end content fades away -> wraps to the pre-roll (= intro frame 0).
   Layout: the intro SVG sits at a fixed design size inside the display's screen rect, measured on the 2880x1620 art (x 389.75, y 209.75,
   2100.5 x 1200.5, 3px radius; same rect as .sd-screen). The whole 2880x1620 art space (.ui-zoom) is scaled about the screen centre, which is
   the art centre (1440, 810), so the zoom is one scale() on one wrapper; text is re-rasterised at every scale, never bitmap-stretched.
   Play/pause is the shared .vid-btn (window.dbhPlayPause, js/case.js): plays while ~35% in view, pauses out of view, the button pauses/resumes
   where it left off; like FMSS, the same under prefers-reduced-motion. */
(function(){
const host=document.querySelector('[data-usps-intro]');
if(!host||!window.gsap)return;
const root=host.querySelector('.ui-stage');
const ART={w:2880,h:1620,sx:389.75,sy:209.75,sw:2100.5,sh:1200.5};
root.innerHTML='<div class="ui-zoom"><img class="ui-frame" src="../assets/usps/usps-studio-display-frame.webp" width="2880" height="1620" alt="" decoding="async"><div class="ui-screen"></div></div>';
const zoomEl=root.querySelector('.ui-zoom'), frameEl=root.querySelector('.ui-frame'), screenEl=root.querySelector('.ui-screen');
screenEl.innerHTML="<svg class=\"ui-svg\" viewBox=\"0 0 1920 1080\" preserveAspectRatio=\"xMidYMid slice\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" focusable=\"false\"> <defs> <mask id=\"ui-eagleMask\" maskUnits=\"userSpaceOnUse\" x=\"-5\" y=\"-5\" width=\"90\" height=\"60\"> <polygon fill=\"#fff\" points=\"66.3,47.2 76.3,0 10,0 0,47.2\"/> <path fill=\"#000\" d=\"M49.3,9.9c7.7,1.8,7.9,3.7,7.9,3.7c5,0,6.3,0,7.2,0.9c2.9,2.7-2,9.3-2,9.3C61.8,24.2,6.6,45.8,6.6,45.8h58.1 L74,1.9H11.6C11.6,1.9,48.4,9.7,49.3,9.9\"/> <path fill=\"#000\" d=\"M55,16.3c-0.8,0.4-3.2,0.8-4,0.9c-0.8,0.1-1.2,0.1-1.2,0.3c0,0.3,1.1,0.2,1.5,0.2c1.8,0,8.9-0.5,10.6-0.2 c1.3,0.2-0.2,2.8-0.6,4.4c-0.1,0.6,0.3,0.3,0.5,0c0.5-0.8,1.9-3.4,2-4.4c0.2-2-1.2-2.3-3.6-2.3h-3.7c-0.3,0-0.4,0.1-0.5,0.3 C55.7,15.8,55.2,16.1,55,16.3\"/> <path fill=\"#000\" d=\"M32,31.1L2.3,45.8l7.2-33.7h0h30c0.5,0,16.1,0,16.4,3.1h-27l4.2,12.8c4.8-2.3,16.6-7.1,23.7-7.4 c3-0.1,4.2,0.4,3.6,0.8c-0.4,0.2-3.3,0.6-5.6,1.2c-4,1-4.2,1-8.4,2.4C41.7,26.6,37.8,28.4,32,31.1\"/> </mask> <clipPath id=\"ui-tdClip\" clipPathUnits=\"userSpaceOnUse\"><rect id=\"ui-tdClipL\" x=\"440\" y=\"528\" width=\"0\" height=\"80\"/><rect id=\"ui-tdClipR\" x=\"1480\" y=\"528\" width=\"0\" height=\"80\"/></clipPath> <filter id=\"ui-glow\" filterUnits=\"userSpaceOnUse\" x=\"-100\" y=\"-100\" width=\"2120\" height=\"1280\" color-interpolation-filters=\"sRGB\"><feDropShadow dx=\"0\" dy=\"0\" stdDeviation=\"2\" flood-color=\"#fff\" flood-opacity=\".55\"/><feDropShadow dx=\"0\" dy=\"0\" stdDeviation=\"7\" flood-color=\"rgb(190,195,255)\" flood-opacity=\".45\"/></filter> <filter id=\"ui-glowSoft\" filterUnits=\"userSpaceOnUse\" x=\"-100\" y=\"-100\" width=\"2120\" height=\"1280\" color-interpolation-filters=\"sRGB\"><feDropShadow dx=\"0\" dy=\"0\" stdDeviation=\"2\" flood-color=\"#fff\" flood-opacity=\".5\"/><feDropShadow dx=\"0\" dy=\"0\" stdDeviation=\"5\" flood-color=\"rgb(190,195,255)\" flood-opacity=\".35\"/></filter> <filter id=\"ui-face\" filterUnits=\"userSpaceOnUse\" x=\"-100\" y=\"-100\" width=\"2120\" height=\"1280\" color-interpolation-filters=\"sRGB\"><feDropShadow dx=\"0\" dy=\"0\" stdDeviation=\"3\" flood-color=\"#fff\" flood-opacity=\".55\"/><feDropShadow dx=\"0\" dy=\"0\" stdDeviation=\"9\" flood-color=\"rgb(200,205,255)\" flood-opacity=\".4\"/></filter> <linearGradient id=\"ui-streakL\" x1=\"0\" x2=\"1\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"1\"/></linearGradient> <linearGradient id=\"ui-streakR\" x1=\"1\" x2=\"0\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"1\"/></linearGradient> </defs> <!-- 1. LOGO --> <g id=\"ui-logoWrap\"><g id=\"ui-logo\" filter=\"url(#ui-glow)\"> <g transform=\"translate(915,284.7) scale(1.3)\"> <rect x=\"-2\" y=\"-2\" width=\"82\" height=\"52\" fill=\"#fff\" mask=\"url(#ui-eagleMask)\"/> <path fill=\"#fff\" transform=\"translate(73.8,43.5) scale(0.61) translate(-384.5,-7.5)\" d=\"M380,7.5c0-2.6,2-4.6,4.5-4.6c2.5,0,4.5,2,4.5,4.6c0,2.7-2,4.7-4.5,4.7C381.9,12.2,380,10.2,380,7.5 M379,7.5 c0,3.1,2.5,5.5,5.5,5.5c3,0,5.5-2.4,5.5-5.5c0-3.1-2.5-5.4-5.5-5.4C381.5,2,379,4.4,379,7.5 M382.4,10.7h1V8h1.1l1.7,2.8h1.1 l-1.8-2.8c1-0.1,1.7-0.6,1.7-1.7c0-1.2-0.7-1.8-2.2-1.8h-2.5V10.7 M383.4,5.1h1.3c0.7,0,1.4,0.1,1.4,1c0,1-0.8,1.1-1.7,1.1h-1V5.1z\"/> </g> </g></g> <!-- 2. INNOVATIONS --> <g id=\"ui-guides\" filter=\"url(#ui-glowSoft)\"></g> <g id=\"ui-headline\" filter=\"url(#ui-glow)\"></g> <!-- 3. THAT DELIVER --> <g id=\"ui-tdLines\" filter=\"url(#ui-glowSoft)\"> <line id=\"ui-hairTop\" class=\"bline\" x1=\"380\" y1=\"552.5\" x2=\"380\" y2=\"552.5\"/> <line id=\"ui-hairBot\" class=\"bline\" x1=\"1540\" y1=\"580.5\" x2=\"1540\" y2=\"580.5\"/> </g> <g clip-path=\"url(#ui-tdClip)\"><g id=\"ui-td\" filter=\"url(#ui-glow)\"> <text id=\"ui-tdText\" x=\"979.87\" letter-spacing=\"39.740\" y=\"580.5\" text-anchor=\"middle\" font-size=\"36\" font-weight=\"700\" fill=\"#fff\">THAT DELIVER</text> </g></g> <!-- 4. BODY --> <g id=\"ui-body\" filter=\"url(#ui-glowSoft)\" fill=\"#fff\" font-weight=\"600\" font-size=\"13.8\" text-anchor=\"middle\"> <text id=\"ui-b1\" x=\"960.70\" letter-spacing=\"1.409\" y=\"639.8\">ONLY USPS HAS THE INFRASTRUCTURE TO DELIVER TO EVERY ADDRESS IN AMERICA. TO DO THIS, WE'RE CONSTANTLY EVOLVING</text> <text id=\"ui-b2\" x=\"960.68\" letter-spacing=\"1.361\" y=\"672.8\">OUR SHIPPING AND MAIL TECHNOLOGIES. NOW YOU CAN SEE WHICH TOOLS, SERVICES AND IDEAS WE'RE UNVEILING NEXT.</text> </g> <!-- 5. START --> <g id=\"ui-btn\" > <g filter=\"url(#ui-face)\"><g><rect id=\"ui-bFill\" x=\"879\" y=\"728\" width=\"165\" height=\"65\" fill=\"#EBEBF6\"/></g></g> <!-- four edge lines (transitional only) --> <g id=\"ui-bLines\" filter=\"url(#ui-glowSoft)\"> <line id=\"ui-lT\" class=\"bline\" opacity=\"0\" x1=\"0\" y1=\"728\" x2=\"0\" y2=\"728\"/> <line id=\"ui-lR\" class=\"bline\" opacity=\"0\" x1=\"1044\" y1=\"0\" x2=\"1044\" y2=\"0\"/> <line id=\"ui-lB\" class=\"bline\" opacity=\"0\" x1=\"0\" y1=\"793\" x2=\"0\" y2=\"793\"/> <line id=\"ui-lL\" class=\"bline\" opacity=\"0\" x1=\"879\" y1=\"0\" x2=\"879\" y2=\"0\"/> </g> <g><text id=\"ui-bText\" x=\"962.875\" y=\"766.25\" text-anchor=\"middle\" font-size=\"16.5\" font-weight=\"700\" letter-spacing=\"2.6\" fill=\"#090C94\">START</text></g> </g> </svg>";
(()=>{const svg=screenEl.querySelector('svg'),g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='ui-content';
  [...svg.childNodes].forEach(n=>{if(n.nodeName!=='defs')g.appendChild(n);});svg.appendChild(g);})();
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById('ui-'+id);
const CFG={hBase:513.5,hSize:161,hCap:113};
// headline letter x positions (1920x1080 space), fixed so the letters sit on the GUIDES below in every browser
const HL='INNOVATIONS', HX=['345.50','401.04','531.77','662.51','795.81','913.81','1035.68','1138.88','1194.43','1331.59','1462.33'];

function build(){
  // headline: one <text> per letter so each can be drawn independently
  const g=$('headline'); g.innerHTML='';
  for(let i=0;i<HL.length;i++){
    const t=document.createElementNS(NS,'text');
    t.setAttribute('x',HX[i]); t.setAttribute('y',CFG.hBase);
    t.setAttribute('font-size',CFG.hSize); t.setAttribute('font-weight',800);
    t.setAttribute('fill','#F8F7FC'); t.setAttribute('stroke','#FFFFFF'); t.setAttribute('stroke-width','1.6');
    t.setAttribute('class','hl'); t.textContent=HL[i];
    g.appendChild(t);
  }
  // construction (blueprint) guides
  const G=$('guides'); G.innerHTML='';
  const top=CFG.hBase-CFG.hCap, base=CFG.hBase, ext=14;
  const L=(x1,y1,x2,y2)=>{const l=document.createElementNS(NS,'line');
    l.setAttribute('x1',x1.toFixed(1));l.setAttribute('y1',y1.toFixed(1));l.setAttribute('x2',x2.toFixed(1));l.setAttribute('y2',y2.toFixed(1));
    l.setAttribute('class','guide');l.dataset.x1=x1;l.dataset.y1=y1;l.dataset.x2=x2;l.dataset.y2=y2;G.appendChild(l);};
  const ext2=(x1,y1,x2,y2,e)=>{const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy);L(x1-dx/d*e,y1-dy/d*e,x2+dx/d*e,y2+dy/d*e);};
  // guide positions measured from the designer mockup (1920x1080 space), ordered left to right
  const GUIDES=[[356.61,387.33,356.61,528.00],[443.72,387.33,443.72,528.00],[519.63,387.33,519.63,528.00],[574.66,387.33,574.66,528.00],[650.53,387.33,650.53,528.00],[731.00,387.33,731.00,528.00],[926.95,387.33,866.93,528.00],[967.10,387.33,904.99,528.00],[1070.78,387.33,1070.78,528.00],[1149.83,387.33,1149.83,528.00],[1262.50,387.33,1262.50,528.00],[1342.69,387.33,1342.69,528.00],[1418.58,387.33,1418.58,528.00],[1561.65,387.33,1465.40,528.00]];
  GUIDES.forEach(g=>L(...g));
}

let tl;
function makeTimeline(){
  if(tl){tl.kill();}
  const hls=[...root.querySelectorAll('.hl')];
  const guides=[...root.querySelectorAll('#ui-guides line')];
  const lineLen=el=>Math.hypot(el.x2.baseVal.value-el.x1.baseVal.value,el.y2.baseVal.value-el.y1.baseVal.value);
  const prep=el=>{const L=lineLen(el);gsap.set(el,{attr:{'stroke-dasharray':L+' '+L,'stroke-dashoffset':L}});return L;};
  // reset
  gsap.set('#ui-logoWrap',{y:225});
  gsap.set('#ui-logo',{opacity:0,scale:0.94,transformOrigin:'50% 50%'});
  hls.forEach(t=>gsap.set(t,{attr:{'stroke-dasharray':'900 900','stroke-dashoffset':900},fillOpacity:0,strokeOpacity:1}));
  const clamp=v=>Math.max(0,Math.min(1,v));
  // v7: guides grow upward in place from their bottom endpoints (verticals + diagonals travel upward along their own angle; horizontals from the left)
  const gGeo=guides.map(g=>{let a=[+g.dataset.x1,+g.dataset.y1],b=[+g.dataset.x2,+g.dataset.y2];
    const horiz=Math.abs(b[1]-a[1])<1;
    if(!horiz && a[1]<b[1]){const tmp=a;a=b;b=tmp;}          // a = lower end, so a->b points up
    const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,off=0;  // v7: grow in place from the bottom endpoint (no travel)
    return {a,b,s:[a[0]-dx/d*off,a[1]-dy/d*off]};});
  guides.forEach(g=>g.setAttribute('opacity',0)); gsap.set('#ui-guides',{opacity:1});
  gsap.set('#ui-hairTop',{attr:{x1:380,x2:380}}); gsap.set('#ui-hairBot',{attr:{x1:1540,x2:1540}});
  gsap.set('#ui-tdClipL',{attr:{width:0}}); gsap.set('#ui-tdClipR',{attr:{x:1480,width:0}}); gsap.set('#ui-td',{y:0,opacity:1});
  gsap.set(['#ui-b1','#ui-b2'],{opacity:0,y:0});
  gsap.set('#ui-bFill',{opacity:0});
  gsap.set('#ui-bText',{opacity:0});
  gsap.set('#ui-bLines',{attr:{opacity:0}}); gsap.set('#ui-tdLines',{attr:{opacity:0}});

  tl=gsap.timeline({paused:true,defaults:{ease:'power2.out'}});
  // 1. logo alone, soft glow-in
  tl.to('#ui-logo',{opacity:1,scale:1,duration:0.7,ease:'power2.out'},0.05);
  // 2. logo pushed up as INNOVATIONS is drawn
  tl.to('#ui-logoWrap',{y:0,duration:1.0,ease:'power3.inOut'},0.85);
  tl.to(hls,{attr:{'stroke-dashoffset':0},duration:0.95,ease:'power1.inOut',stagger:0.04},3.07);  // letters start after guides settle (~3.04)
  const gStep=Math.min(0.06,0.5/Math.max(1,guides.length-1));
  // guides: CTA-style — each slides in along its own path (tail and tip travel from an offset start) and settles, staggered
  const GD=0.65, gE=gsap.parseEase('expo.out'), GP={t:0}, gTotal=GD+gStep*(guides.length-1);
  const updG=()=>{guides.forEach((g,i)=>{const q=clamp((GP.t-i*gStep)/GD),h=gE(q),G_=gGeo[i];
      g.setAttribute('x1',G_.s[0]+(G_.a[0]-G_.s[0])*h); g.setAttribute('y1',G_.s[1]+(G_.a[1]-G_.s[1])*h);
      g.setAttribute('x2',G_.s[0]+(G_.b[0]-G_.s[0])*h); g.setAttribute('y2',G_.s[1]+(G_.b[1]-G_.s[1])*h);
      g.setAttribute('opacity',q<=0?0:Math.min(1,q/0.12));});};
  tl.to(GP,{t:gTotal,duration:gTotal,ease:'none',onUpdate:updG,onStart:updG},1.9);  // starts after logo has settled (push ends 1.85); all grown by ~3.04
  tl.to(hls,{fillOpacity:1,duration:0.5,ease:'power1.inOut',stagger:0.03},3.8);
  tl.to(hls,{strokeOpacity:0,duration:0.4,stagger:0.03},4.1);
  // guides fade away once the letters are filled (same exit as the CTA outline)
  tl.to('#ui-guides',{opacity:0,duration:0.45,ease:'power1.inOut'},4.9);  // ~0.3s breath after fill completes (~4.6), guides fade out by 5.35
  // 3. two light lines converge & reveal THAT DELIVER
  const T3=5.4, D3=1.1, MID=960;  // starts only after guides have fully faded (5.35)
  // THAT DELIVER: CTA-style plain lines. Top slides in from the left, bottom from the right; each settles with its leading end at centre.
  // Text is revealed full height behind each leading end; reveal completes where they meet.
  const P3={q:0}, e3=gsap.parseEase('expo.out');
  const tdL={s0:353,a:463,b:MID+1}, tdR={s0:1567,a:1457,b:MID-1};
  const upd=()=>{
      const h=e3(P3.q);
      const tTail=tdL.s0+(tdL.a-tdL.s0)*h, tHead=tdL.s0+(tdL.b-tdL.s0)*h;
      const bTail=tdR.s0+(tdR.a-tdR.s0)*h, bHead=tdR.s0+(tdR.b-tdR.s0)*h;
      $('hairTop').setAttribute('x1',tTail); $('hairTop').setAttribute('x2',tHead);
      $('hairBot').setAttribute('x1',bTail); $('hairBot').setAttribute('x2',bHead);
      $('tdClipL').setAttribute('width',Math.max(0,tHead-440));
      $('tdClipR').setAttribute('x',bHead); $('tdClipR').setAttribute('width',Math.max(0,1480-bHead));
  };
  tl.set('#ui-tdLines',{attr:{opacity:1}},T3);
  tl.to(P3,{q:1,duration:D3,ease:'none',onUpdate:upd,onStart:upd},T3);
  tl.to('#ui-tdLines',{attr:{opacity:0},duration:0.4,ease:'power1.inOut'},T3+0.85);
  // 4. body copy
  tl.to(['#ui-b1','#ui-b2'],{opacity:1,duration:0.8,ease:'power1.inOut',stagger:0.14},T3+0.65);  // body keeps same offset relative to THAT DELIVER
  // 5. START: four lines sweep in along the four sides, outlining the rectangle; fill reveals; lines leave
  const T5=T3+1.05, X1=879, X2=1044, Y1=728, Y2=793;
  // [id, axis, travel start, edge start(corner where tail lands), edge end(corner where tip lands)]
  const sides=[['lT','x',X1-110,X1,X2],   // top: enters from the left
               ['lR','y',Y1-36, Y1,Y2],   // right: drops in from above
               ['lB','x',X2+110,X2,X1],   // bottom: enters from the right
               ['lL','y',Y2+56, Y2,Y1]];  // left: rises from below
  const S5={q:0}; const e5=gsap.parseEase('expo.out');
  const upd5=()=>{
    sides.forEach(([id,ax,s0,a,b],i)=>{
      const q=clamp((S5.q-i*0.1)/0.7), h=e5(q);
      const head=s0+(b-s0)*h, tail=s0+(a-s0)*h;   // streak slides in and lands exactly on its side
      const el=$(id); el.setAttribute(ax+'1',tail); el.setAttribute(ax+'2',head);
      el.setAttribute('opacity',q<=0?0:Math.min(1,q/0.12));
    });
  };
  tl.set('#ui-bLines',{attr:{opacity:1}},T5);
  tl.to(S5,{q:1,duration:0.85,ease:'none',onUpdate:upd5,onStart:upd5},T5);
  tl.to('#ui-bFill',{opacity:1,duration:0.4,ease:'power1.inOut'},T5+0.72);
  tl.to('#ui-bLines',{attr:{opacity:0},duration:0.35,ease:'power1.in'},T5+1.0);
  tl.to('#ui-bText',{opacity:1,duration:0.5,ease:'power1.inOut'},T5+1.0);  // simple in-place fade, no mask/motion
  syncFns=[updG,upd,upd5];
  return tl;
}
// ---- loop (all times in seconds) ----
const PRE=0.4, HOLD=1.0, ZOOM_OUT=1.6, MONITOR=2.0, ZOOM_IN=1.6, CLEAR_AT=0.1, CLEAR=0.7, ZEASE='power3.inOut';
const OVERSCAN=1.006;   // full bleed: the screen rect overshoots the frame slightly so neither its 3px corners nor the bezel can show (same 1.006 as the page's slides)
let syncFns=[], master=null, Z={z:0}, sFull=1, sMon=1, phases={};
function measure(){const W=root.clientWidth||1,H=root.clientHeight||1;
  sFull=Math.max(W/ART.sw,H/ART.sh)*OVERSCAN;     // screen rect covers the frame
  sMon=Math.max(W/ART.w,H/ART.h)*1.006;           // whole art, framed exactly like the studio display frame below (.sd-stage: width-fit, scale 1.006)
}
function applyZoom(){
  const z=Z.z, s=Math.exp(Math.log(sFull)+(Math.log(sMon)-Math.log(sFull))*z);  // log-space interpolation: even perceived zoom speed
  zoomEl.style.transform='scale('+s.toFixed(6)+')';
  frameEl.style.visibility=z<=1e-4?'hidden':'visible';   // art is fully off-frame at full bleed anyway; skip painting it
}
function sync(){syncFns.forEach(f=>f());applyZoom();}
function makeMaster(){
  if(master)master.kill();
  const intro=makeTimeline(); intro.paused(false);
  Z.z=0; gsap.set('#ui-content',{opacity:1});
  const tI=PRE, tHold=tI+intro.duration(), tOut=tHold+HOLD, tMon=tOut+ZOOM_OUT, tIn=tMon+MONITOR, L=tIn+ZOOM_IN;
  phases={preroll:[0,tI],intro:[tI,tHold],hold:[tHold,tOut],zoomOut:[tOut,tMon],monitor:[tMon,tIn],zoomIn:[tIn,L],clear:[tIn+CLEAR_AT,tIn+CLEAR_AT+CLEAR],loop:L};
  master=gsap.timeline({paused:true,repeat:-1,onUpdate:sync,onRepeat:sync});
  master.add(intro,tI);
  master.to(Z,{z:1,duration:ZOOM_OUT,ease:ZEASE},tOut);
  master.to(Z,{z:0,duration:ZOOM_IN,ease:ZEASE},tIn);
  master.to('#ui-content',{opacity:0,duration:CLEAR,ease:'power1.inOut'},tIn+CLEAR_AT);   // end content leaves early in the zoom-in: empty blue when it lands
  master.totalTime(0); sync();
  return master;
}
let on=false,ready=false,begun=false;
function go(){if(!ready)return;if(!begun){begun=true;makeMaster();}master.play();}
const player={paused:()=>!on,play:()=>{on=true;go();},pause:()=>{on=false;if(master)master.pause();}};
const btnSync=window.dbhPlayPause?dbhPlayPause(host,host,player,'animation'):null;
if('ResizeObserver' in window)new ResizeObserver(()=>{measure();applyZoom();}).observe(root);
const fontsReady=document.fonts?document.fonts.load('800 100px UspsMontserrat').then(()=>document.fonts.load('700 36px UspsMontserrat')).then(()=>document.fonts.load('600 14px UspsMontserrat')).catch(()=>{}):Promise.resolve();
window.__uspsIntro={
  ready:fontsReady.then(()=>{build();measure();makeMaster();host.classList.add('is-ready');ready=true;if(on)go();return true;}),
  seek:t=>{on=false;begun=true;if(!master)makeMaster();master.pause();master.totalTime(t,false);sync();if(btnSync)btnSync();},   // loop time; t beyond the loop length lands in later cycles
  duration:()=>phases.loop||0,
  phases:()=>phases,
  frameLoaded:()=>(frameEl.complete&&frameEl.naturalWidth>0?Promise.resolve():new Promise(r=>{frameEl.addEventListener('load',r,{once:true});frameEl.addEventListener('error',r,{once:true});})).then(()=>frameEl.decode?frameEl.decode().catch(()=>{}):0).then(()=>frameEl.naturalWidth>0)
};
})();
