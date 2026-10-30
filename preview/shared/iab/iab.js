/* FMSS shared in-app browser (IAB) foundation (see iab.css for the structure).
   One value, y (the sheet top in the host's 375×812 px), drives everything: Y1 812 closed · Y2 half · Y3 44 full.
   Full screen geometry is shared, never per prototype: the full header (46px tall) sits 2px under the sheet top (screen y 46),
   its hairline on its last row (screen y 91), the page from 48 (screen y 92).
   Motion (one place for every prototype): critically damped spring ω18 (close ω16), 4 substeps; 1:1 drag with 100ms velocity
   samples, projection y + v·0.18s, a flick > 600px/s moves at least one step, rubber-band ×0.25 above full; a tap on the half
   sheet → full. Full screen: a press below the header scrolls the page (rubber-band ×0.35, spring-back ω16, fling τ 325ms) and a
   pull past the page top hands over to the sheet. Every open from closed plays the page load (1140ms bar, page fades in after 1/3).
   Entry point: how the sheet was opened from closed (go(s, {entry}), kept until it closes) decides what a drag on it may do:
     (none)       a sheet open (caption, product tile, swipe): every drag above
     'cta'        a CTA opened it full screen: the sheet never follows a press (no dismiss, no half, no sheet rubber-band); a press
                  below the header only scrolls the page, which rubber-bands at its top (×0.35) and springs back, the sheet staying
                  put; × / Escape / the host's controls close it
     'collapse'   the host's floating CTA opened it: the only drag is the morph back into that CTA (collapse, below)

   const iab=FMSSIAB.create({host, y2, label, url, headers:{full}, handle, web:'<img …>', webH, visH, …hooks});
   Per-prototype config (all optional unless noted):
     host*        375×812 layer the IAB is built into          label     dialog name, e.g. 'In-app browser (IAB): nike.com'
     url*         the site's domain: the half sheet's header is the shared one (header.js, loaded first), with url/<url>.svg
     headers*     {full} the full screen header vector (site specific)   web*      the page's markup (first element scrolls / fades)
     webH*        page height (number or function)               visH      visible page height in full (smax = webH - visH)
     y2           half-sheet top (406)
     handle       a 20px drag strip at the sheet's top           halfZ     damping into half (.82)
     shift        'p' | 'hk': what moves the page top half → full ('p')
     fullness(y)  0 half/closed → 1 full (default from half)
     hold(from,to) hold the full header through a move (1→3 / 3→1)
     capOpacity(sd) status backing opacity (default sd = (84 - y) / 40)   xOn(s) when × shows (s === 3)
     spring {w, z, wClose}                                     scale()   host px → client px (host height / 812)
   Hooks: onRender(c) c = {y, t (closed→half), p (fullness), hk (header), sd (status), state} · onState(s) · onOpen(s, opts)
     before a fresh open · onClose() a close starts · onClosed() a close lands (spring at rest, back home) · onOpened(s) an open
     or half↔full move lands · onSettled(s) any move lands at rest in state s (1 = home) · onLoad(why) · onPress(e) a real press on the sheet
     · onX() × tapped · wheelTo(e, d, apply) / wd(e) the page's wheel routing (wheel scrolls the page in full only via these).
   collapse     for entry 'collapse': a swipe down on the full screen sheet morphs it into the host's floating CTA.
                {to() target rect {x,y,w,h,r} in host px · content() the CTA's markup (node) cross-faded in
                 · min 120 · flick 500 (px, px/s down: less snaps back to full) · w 20 (the host's peek → CTA spring, critically damped)
                 · onStart() · onDone() the morph lands: the host shows its real CTA in place, the sheet is already closed}
                Same gesture as any sheet drag (header / handle, or a pull past the page top); the morph mirrors peek → CTA: geometry on
                one spring, the page fades out over m 0–.45, the CTA's content in over .35–.85, shadow grows; overlay + toolbar leave. */
(function(){
'use strict';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^/]*$/,'');
const VER=((document.currentScript&&document.currentScript.src||'').match(/\?v=\d+/)||[''])[0];
const LOAD_MS=1140,LOAD_THIRD=290,LOAD_OUT=130;
const LOAD_KF=[[0,0,'cubic-bezier(.2,.8,.3,1)'],[120,.26,'cubic-bezier(.3,.5,.5,1)'],[290,.334,'cubic-bezier(.3,.6,.4,1)'],[430,.41,'cubic-bezier(.2,.4,.4,1)'],
  [620,.45,'cubic-bezier(.45,0,.3,1)'],[780,.71,'cubic-bezier(.2,.6,.4,1)'],[1000,.78,'cubic-bezier(.5,0,.9,.6)'],[LOAD_MS,1]];
/* the page load, also for page loads outside the sheet (P&B's peek): bar fill, bar fade (no hold at 100%), page fade-in after 1/3 */
function playLoad(bar,fill,page){
  if(RM.matches||!Element.prototype.animate)return [];
  const T=LOAD_MS+LOAD_OUT;
  return [
    fill.animate(LOAD_KF.map(([t,v,e])=>Object.assign({transform:`scaleX(${v})`,offset:t/LOAD_MS},e?{easing:e}:{})),{duration:LOAD_MS,fill:'forwards'}),
    bar.animate([{opacity:1},{opacity:1,offset:LOAD_MS/T,easing:'ease-out'},{opacity:0}],{duration:T}),
    page.animate([{opacity:0},{opacity:0,offset:LOAD_THIRD/(LOAD_THIRD+200),easing:'cubic-bezier(.2,.7,.2,1)'},{opacity:1}],{duration:LOAD_THIRD+200})
  ];
}
/* critically damped spring on any value (4 substeps, dt ≤ 32ms); settles within .3 / 8 per s (large targets) or .002 / .05 */
function makeSpring(get,set){
  let raf=0,busy=false,tgt=null;
  return {get busy(){return busy},get target(){return tgt},stop(){cancelAnimationFrame(raf);busy=false},
    to(target,{v=0,w=18,z=1,onDone}={}){
      cancelAnimationFrame(raf);tgt=target;
      if(RM.matches){set(target);busy=false;onDone&&onDone();return}
      let last=performance.now(),vel=v,x=get();busy=true;
      const big=Math.abs(target)>20,eps=big?.3:.002,veps=big?8:.05;
      const step=now=>{const dt=Math.min(.032,(now-last)/1000);last=now;
        for(let i=0;i<4;i++){const h=dt/4;vel+=(-w*w*(x-target)-2*z*w*vel)*h;x+=vel*h}
        if(Math.abs(x-target)<eps&&Math.abs(vel)<veps){busy=false;set(target);onDone&&onDone();return}
        set(x);raf=requestAnimationFrame(step)};
      raf=requestAnimationFrame(step);
    }};
}
/* the sheet header (half sheet): the shared FMSS IAB sheet header, header.js (load it before this file) */
const header=o=>window.FMSSIABHeader(o);
function create(cfg){
  const host=cfg.host,Y1=812,Y2=cfg.y2||406,Y3=44,FT=2,CT=FT+46;   // full: sheet top 44 (the status bar bottom), header 2px under it (46), content 48 (92); one value for every prototype
  const SP=Object.assign({w:18,z:1,wClose:16},cfg.spring||{});
  const halfZ=cfg.halfZ||.82,visH=cfg.visH||622;
  const webH=()=>typeof cfg.webH==='function'?cfg.webH():cfg.webH;
  const smax=()=>Math.max(0,(webH()||0)-visH);
  const scaleNow=cfg.scale||(()=>host.getBoundingClientRect().height/812);
  const fullness=cfg.fullness||(y=>clamp((Y2-y)/(Y2-Y3)));
  const holdRule=cfg.hold||((from,to)=>(from===1&&to===3)||(from===3&&to===1));
  const xOn=cfg.xOn||(s=>s===3);
  const el=(tag,cls,attrs)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);return e};

  /* ---------- DOM ---------- */
  const sheet=el('div','iab-sheet',{id:'sheet',role:'dialog','aria-modal':'false','aria-label':cfg.label||'In-app browser (IAB)','aria-hidden':'true'});
  const cap=el('i','iab-cap',{'aria-hidden':'true'});
  const panel=el('div','iab-panel');
  const hHalf=header({url:cfg.url,cls:'iab-h iab-hh',id:'hHalf'});
  const hFull=el('img','iab-h iab-hf',{id:'hFull',src:cfg.headers.full,alt:''});hFull.style.top=FT+'px';
  const handle=cfg.handle?el('div','iab-handle',{id:'handle','aria-hidden':'true'}):null;
  const loadEl=el('div','iab-load',{id:'load','aria-hidden':'true'}),loadFill=el('i','',{id:'loadFill'});loadEl.appendChild(loadFill);
  const webv=el('div','iab-webv',{id:'webv'});webv.innerHTML=cfg.web;
  const web=webv.firstElementChild;if(!web.id)web.id='web';
  panel.append(hHalf,hFull);if(handle)panel.append(handle);panel.append(loadEl,webv);
  sheet.append(cap,panel);
  const tb=el('img','iab-tb',{id:'footer',src:BASE+'toolbar.svg'+VER,alt:'','aria-hidden':'true'});
  const x=el('button','iab-x',{id:'x',type:'button','aria-label':cfg.xLabel||'Close in-app browser (IAB)'});
  const cc=el('div','iab-cc',{'aria-hidden':'true'});panel.append(cc);   // collapse: the CTA's content, cross-faded in during the morph
  host.append(sheet,tb,x);

  /* ---------- render everything from y ---------- */
  let y=Y1,state=1,hLock=false,col=null,entry=null;   // entry: the open's entry point (see the top), null while closed
  function render(){
    if(col)return renderCol();
    const t=clamp((Y1-y)/(Y1-Y2)),p=fullness(y);
    const hk=hLock?1:clamp((p-.45)/.2);           // half → full header over p .45–.65: fade out, then in (never both texts at once)
    const sd=clamp((84-y)/40);                     // docking at the top: the status area turns white
    sheet.style.transform=`translate3d(0,${(y-Y1).toFixed(2)}px,0)`;
    const r=(16*(1-p)).toFixed(2);panel.style.borderRadius=`${r}px ${r}px 0 0`;
    cap.style.top=(-y-8).toFixed(2)+'px';cap.style.height=(52+clamp(52-y,0,4)).toFixed(2)+'px';   // 8px past the screen top: the phone's clip is its only top edge
    const co=cfg.capOpacity?cfg.capOpacity(sd,y):sd;cap.style.opacity=co.toFixed(3);cap.style.display=co>.001?'block':'none';   // not even a layer while unseen
    hHalf.style.opacity=(1-clamp(hk*2)).toFixed(3);
    hFull.style.opacity=clamp(hk*2-1).toFixed(3);
    if(handle)handle.style.opacity=(1-p).toFixed(3);
    webv.style.top=lerp(52,CT,cfg.shift==='hk'?hk:p).toFixed(2)+'px';
    loadEl.style.top=lerp(52,CT,hk).toFixed(2)+'px';
    tb.style.transform=`translate3d(0,${((1-clamp((p-.2)/.8))*110).toFixed(2)}px,0)`;
    tb.style.visibility=y<Y1-.5?'visible':'hidden';
    cfg.onRender&&cfg.onRender({y,t,p,hk,sd,state});
  }
  /* collapse morph: m 0 (the sheet where it was let go) → 1 (the CTA's rect); the rest (overlay, toolbar, status) rides an effective y
     that runs from the release point to closed */
  function renderCol(){
    const c=col,m=c.m,e=clamp(m,0,1.08),q=clamp(m),to=c.to,fade=1-clamp(m/.45);
    const yE=lerp(c.y0,Y1,q),t=clamp((Y1-yE)/(Y1-Y2)),p=fullness(yE),sd=clamp((84-yE)/40);
    const top=lerp(c.y0,to.y,e),h=lerp(Y1+48-c.y0,to.h,e),rt=lerp(c.r0,to.r,q),rb=lerp(0,to.r,q);
    sheet.style.transform=`translate3d(0,${(top-Y1).toFixed(2)}px,0)`;
    panel.style.left=lerp(0,to.x,e).toFixed(2)+'px';panel.style.width=lerp(375,to.w,e).toFixed(2)+'px';panel.style.height=Math.max(1,h).toFixed(2)+'px';
    panel.style.borderRadius=`${rt.toFixed(2)}px ${rt.toFixed(2)}px ${rb.toFixed(2)}px ${rb.toFixed(2)}px`;
    panel.style.boxShadow=`0 ${lerp(-1,4,q).toFixed(2)}px ${lerp(10,18,q).toFixed(2)}px rgba(0,0,0,${lerp(0,.13,q).toFixed(3)})`;
    hHalf.style.opacity=(c.oh*fade).toFixed(3);hFull.style.opacity=(c.of*fade).toFixed(3);webv.style.opacity=loadEl.style.opacity=fade.toFixed(3);
    if(handle)handle.style.opacity=(c.oa*fade).toFixed(3);
    cap.style.opacity=(c.co*fade).toFixed(3);cap.style.display=c.co*fade>.001?'block':'none';
    cc.style.opacity=clamp((m-.35)/.5).toFixed(3);
    tb.style.transform=`translate3d(0,${((1-clamp((p-.2)/.8))*110).toFixed(2)}px,0)`;
    tb.style.visibility=yE<Y1-.5?'visible':'hidden';
    cfg.onRender&&cfg.onRender({y:yE,t,p,hk:0,sd,state});
  }
  const mSpring=makeSpring(()=>col?col.m:1,v=>{if(col){col.m=v;render()}});
  function clearCol(){col=null;mSpring.stop();cc.style.display='none';cc.style.opacity='0';cc.textContent='';
    ['left','width','height','boxShadow'].forEach(k=>panel.style[k]='');webv.style.opacity=loadEl.style.opacity=''}
  function collapse(){
    const C=cfg.collapse,to=C.to();ySpring.stop();
    const n=C.content&&C.content();cc.textContent='';if(n)cc.append(n);cc.style.display='block';
    col={m:0,y0:y,to,r0:16*(1-fullness(y)),oh:+hHalf.style.opacity||0,of:+hFull.style.opacity||0,oa:handle?+handle.style.opacity||0:0,co:+cap.style.opacity||0};
    hLock=false;entry=null;setState(1);C.onStart&&C.onStart();render();
    /* the spring's last step lands within eps of m 1 and its exact m 1 render shares a task with the handoff, so it is never painted:
       the last painted morph frame sat ~1px short of the CTA. Paint m 1 exactly (to() re-read now, so the morph ends on the CTA's
       resting rect) and hand off on the next frame: pixel-exact, same spring */
    mSpring.to(1,{w:C.w||20,z:1,onDone:()=>{
      const c=col;if(!c)return;c.to=C.to();c.m=1;render();
      requestAnimationFrame(()=>{if(col!==c)return;
        clearCol();resetLoad();stopScroll();setScroll(0);y=Y1;render();
        cfg.onSettled&&cfg.onSettled(1);C.onDone&&C.onDone();
      });
    }});
  }
  const collapseOn=()=>entry==='collapse'&&!!cfg.collapse;
  function setState(s){
    state=s;
    x.classList.toggle('on',!!xOn(s));
    sheet.setAttribute('aria-hidden',s===1?'true':'false');
    cfg.onState&&cfg.onState(s);
  }
  const ySpring=makeSpring(()=>y,v=>{y=v;render()});

  /* ---------- page scroll (full screen only) ---------- */
  let sy=0,sraf=0;
  function setScroll(v){sy=v;web.style.translate=`0 ${(-v).toFixed(2)}px`}
  function stopScroll(){cancelAnimationFrame(sraf);sraf=0}
  function scrollBack(){
    const target=clamp(sy,0,smax());if(Math.abs(sy-target)<.5){setScroll(target);return}
    let last=performance.now(),v=0;const w=16;
    const f=now=>{const dt=Math.min(.032,(now-last)/1000);last=now;for(let i=0;i<4;i++){const h=dt/4;v+=(-w*w*(sy-target)-2*w*v)*h;sy+=v*h}
      if(Math.abs(sy-target)<.3&&Math.abs(v)<8){setScroll(target);sraf=0;return}setScroll(sy);sraf=requestAnimationFrame(f)};
    sraf=requestAnimationFrame(f);
  }
  function fling(v){
    stopScroll();if(RM.matches||Math.abs(v)<60)return scrollBack();
    let last=performance.now();const M=smax();
    const f=now=>{const dt=Math.min(.032,(now-last)/1000);last=now;v*=Math.exp(-dt/.325);let n=sy+v*dt;
      if(n<=0||n>=M){setScroll(clamp(n,0,M));sraf=0;return}
      setScroll(n);if(Math.abs(v)<12){sraf=0;return}sraf=requestAnimationFrame(f)};
    sraf=requestAnimationFrame(f);
  }
  function scrollTo(to,ms=260){                    // eased (cubic out) scroll, e.g. an autoplay step undone by a real press
    stopScroll();const a=sy,t0=performance.now();
    const f=now=>{const q=clamp((now-t0)/ms),e=1-Math.pow(1-q,3);setScroll(a+(to-a)*e);sraf=q<1?requestAnimationFrame(f):0};
    sraf=requestAnimationFrame(f);
  }
  const rubber=v=>{const M=smax();return v<0?v*.35:v>M?M+(v-M)*.35:v};   // every entry, a CTA open too: the page rubber-bands at its top and springs back

  /* ---------- page load: on every open from closed (never half ↔ full), reset once closed ---------- */
  let loadAnims=[],loads=0;
  function resetLoad(){loadAnims.forEach(a=>a.cancel());loadAnims=[]}
  function load(why){resetLoad();loads++;stopScroll();setScroll(0);cfg.onLoad&&cfg.onLoad(why);loadAnims=playLoad(loadEl,loadFill,web)}

  /* ---------- go: 1 closed · 2 half · 3 full ---------- */
  function go(s,opts={}){
    const from=state,target=s===1?Y1:s===2?Y2:Y3;
    if(from===1&&s>1){entry=opts.entry||null;cfg.onOpen&&cfg.onOpen(s,opts);if(opts.load!==false)load(opts.why)}
    if(from>1&&s===1){entry=null;cfg.onClose&&cfg.onClose()}
    hLock=opts.hold!=null?!!opts.hold:!!holdRule(from,s);
    setState(s);render();
    const o={v:opts.v||0,w:opts.w!=null?opts.w:s===1?SP.wClose:SP.w,z:opts.z!=null?opts.z:SP.z,onDone:opts.onDone};
    const d=o.onDone;
    o.onDone=s===1?()=>{resetLoad();stopScroll();setScroll(0);cfg.onClosed&&cfg.onClosed();cfg.onSettled&&cfg.onSettled(1);d&&d()}
                   :()=>{cfg.onOpened&&cfg.onOpened(s);cfg.onSettled&&cfg.onSettled(s);d&&d()};
    ySpring.to(target,o);
  }

  /* ---------- sheet drag (1:1, velocity + position snap); also driven by autoplay with id 'fake' ---------- */
  const MOUSE_OUT=Y2+(Y1-Y2)*.6;                   // mouse: past here (60% of the way from half to closed) a downward drag is a dismiss
  const ptype=new Map();                           // pointerId → pointerType of the latest press anywhere in this document (host drags too)
  addEventListener('pointerdown',e=>{ptype.set(e.pointerId,e.pointerType)},true);
  let drag=null,sc=null;
  function dragStart(clientY,id,scale){
    if(entry==='cta')return;                       // a CTA open: the sheet never follows a press
    ySpring.stop();hLock=false;
    drag={id,startY:clientY,y0:y,from:state,moved:false,scale:scale||0,mouse:ptype.get(id)==='mouse',samples:[[performance.now(),y]]};
    sheet.classList.add('drag');
  }
  function dragMove(clientY){
    if(!drag)return;
    let ny=drag.y0+(clientY-drag.startY)/(drag.scale||scaleNow());
    if(Math.abs(clientY-drag.startY)>4)drag.moved=true;
    if(ny<Y3)ny=Y3-(Y3-ny)*.25;
    const prev=y;y=Math.min(Y1,ny);render();
    const now=performance.now();drag.samples.push([now,y]);
    while(drag.samples.length>2&&now-drag.samples[0][0]>100)drag.samples.shift();
    /* mouse only: a drag pulled down past MOUSE_OUT commits the dismiss right there (the sheet springs closed from where it is, the
       rest of the gesture is ignored), so nothing the cursor does afterwards can bring it back: a trackpad's drag-lock / three
       finger drag keeps the button "down" for a moment after the fingers lift, and a release the page never hears leaves the press
       live. Touch keeps the plain release decision. */
    if(drag.mouse&&drag.moved&&y>prev&&y>=MOUSE_OUT&&drag.from===2&&!(drag.from===3&&collapseOn()))dragEnd({out:true});
  }
  function dragEnd(o){
    if(!drag)return;
    const d=drag;drag=null;sheet.classList.remove('drag');
    if(o&&o.out){const s=d.samples,a=s[0],b=s[s.length-1];return go(1,{v:Math.max(0,(b[0]-a[0])>0?(b[1]-a[1])/((b[0]-a[0])/1000):0)})}
    if(!d.moved){if(d.from===2)return go(3);return ySpring.to(d.from===3?Y3:Y2,{w:SP.w,z:SP.z})}
    const s=d.samples,a=s[0],b=s[s.length-1];
    const v=(b[0]-a[0])>0?(b[1]-a[1])/((b[0]-a[0])/1000):0;   // px/s (+ = down)
    if(d.from===3&&collapseOn())return (y-Y3>(cfg.collapse.min||120)||v>(cfg.collapse.flick||500))?collapse():go(3,{v});   // full ⇄ CTA only: a small drag snaps back
    const proj=y+v*.18;
    const cands=d.from===3?[[3,Y3],[2,Y2]]:[[3,Y3],[2,Y2],[1,Y1]];
    let best=cands[0];for(const c of cands)if(Math.abs(proj-c[1])<Math.abs(proj-best[1]))best=c;
    if(Math.abs(v)>600){                     // a flick always moves at least one step its way
      const want=clamp(d.from+(v>0?-1:1),1,3);
      if(d.from===3&&want<2){}else if((v>0&&best[0]>want)||(v<0&&best[0]<want))best=cands.find(c=>c[0]===want)||best;
    }
    go(best[0],{v,z:best[0]===2?halfZ:SP.z});
  }
  function cancelFake(){const d=drag;if(!d||d.id!=='fake')return false;drag=null;sheet.classList.remove('drag');ySpring.to(d.y0,{w:SP.w,z:SP.z});return true}
  const atFull=()=>!ySpring.busy||(ySpring.target===Y3&&Math.abs(y-Y3)<24);   // settling into full still scrolls; a travelling sheet is caught
  function scStart(clientY,id,scale){stopScroll();sc={id,startY:clientY,s0:sy,scale,moved:false,samples:[[performance.now(),sy]]}}
  function scMove(clientY){
    const want=sc.s0-(clientY-sc.startY)/sc.scale;
    if(Math.abs(clientY-sc.startY)>4)sc.moved=true;
    if(want<0&&sc.s0<=0&&entry!=='cta'){const {id,scale}=sc;sc=null;setScroll(0);dragStart(clientY,id,scale);drag.moved=true;return}   // at the top: the sheet takes over
    setScroll(rubber(want));
    const now=performance.now();sc.samples.push([now,sy]);
    while(sc.samples.length>2&&now-sc.samples[0][0]>100)sc.samples.shift();
  }
  function scEnd(){
    const d=sc;sc=null;if(!d)return;
    if(!d.moved)return scrollBack();
    const s=d.samples,a=s[0],b=s[s.length-1],dt=(b[0]-a[0])/1000;
    if(sy<0||sy>smax())return scrollBack();
    fling(dt>0&&performance.now()-b[0]<80?(b[1]-a[1])/dt:0);
  }
  /* a press on the sheet owns its gesture until the button is up, wherever the pointer goes: moves and the release are heard on the
     window (capture phase), not only on the sheet, so a pointer capture the browser drops mid-drag (or never grants) can't strand
     it; a mouse move with the button no longer down, the capture lost or the window losing focus count as the release. */
  let own=null;                                    // the pointerId of the press the sheet itself took
  sheet.addEventListener('pointerdown',e=>{
    if(e.button!==0||state===1)return;
    cfg.onPress&&cfg.onPress(e);
    try{sheet.setPointerCapture(e.pointerId)}catch(_){}
    if(e.pointerType==='mouse'){const s=getSelection&&getSelection();if(s&&s.rangeCount)s.removeAllRanges()}
    own=e.pointerId;
    const s0=scaleNow();
    if(state===3&&atFull()&&(e.clientY-sheet.getBoundingClientRect().top)/s0>=CT){scStart(e.clientY,e.pointerId,s0);return}
    dragStart(e.clientY,e.pointerId,s0);
  });
  const mine=e=>own!=null&&e.pointerId===own&&((sc&&sc.id===own)||(drag&&drag.id===own));
  const release=()=>{const id=own;own=null;if(sc&&sc.id===id)scEnd();else if(drag&&drag.id===id)dragEnd()};
  addEventListener('pointermove',e=>{
    if(!mine(e))return;
    if(e.pointerType==='mouse'&&!(e.buttons&1))return release();
    if(sc)scMove(e.clientY);else if(drag)dragMove(e.clientY);
  },true);
  const up=e=>{if(mine(e))release();else if(own!=null&&e.pointerId===own)own=null};
  addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
  sheet.addEventListener('lostpointercapture',e=>{if(mine(e)&&e.pointerType==='mouse'&&!(e.buttons&1))release()});
  addEventListener('blur',()=>{if(own!=null&&(sc||drag))release()});
  ['selectstart','dragstart'].forEach(t=>addEventListener(t,e=>{if(own!=null&&(sc||drag))e.preventDefault()},true));
  sheet.addEventListener('wheel',e=>{
    if(state!==3||!atFull()||drag||sc||!cfg.wheelTo)return;
    cfg.wheelTo(e,cfg.wd?cfg.wd(e):e.deltaY,d=>{const n=clamp(sy+d,0,smax());if(Math.abs(n-sy)<.5)return false;stopScroll();setScroll(n);return true});
  },{passive:false});
  x.addEventListener('click',()=>{if(cfg.onX)cfg.onX();else go(1)});

  /* the clean start, instantly */
  function reset(){if(col)clearCol();ySpring.stop();entry=null;drag=null;sc=null;own=null;sheet.classList.remove('drag');stopScroll();setScroll(0);resetLoad();hLock=false;y=Y1;setState(1);render()}
  function setY(v){ySpring.stop();y=v;render()}

  const api={Y1,Y2,Y3,sheet,panel,cap,toolbar:tb,x,web,webv,
    get y(){return y},get state(){return state},get entry(){return entry},get busy(){return ySpring.busy},get target(){return ySpring.target},
    get drag(){return drag},get collapsing(){return !!col},get sc(){return sc},get scroll(){return sy},get loads(){return loads},
    get loading(){return loadAnims.some(a=>a.playState==='running')},
    render,setState,go,collapse,close:()=>go(1),stop:()=>ySpring.stop(),setY,reset,atFull,smax,
    dragStart,dragMove,dragEnd,cancelFake,setScroll,stopScroll,scrollTo,load,resetLoad,
    holdHeader(v){hLock=!!v}};
  return api;
}
window.FMSSIAB={create,header:window.FMSSIABHeader,makeSpring,playLoad,LOAD_MS,LOAD_THIRD,LOAD_OUT,LOAD_KF};
})();
