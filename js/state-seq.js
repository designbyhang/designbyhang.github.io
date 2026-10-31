/* state-seq: one shared, config-driven state-sequence player for animated media (Figma smart-animate recreated on the web).
   Markup: a .media.sseq box holding a .ss-stage (a fixed design-px frame, e.g. 1920x1080, scaled to the box width and centred) whose
   layers carry data-l="key", plus <script type="application/json" class="ss-cfg">. Layers outside the box (e.g. a page headline whose
   words swap with the state) join through cfg.bind (a selector); they move in CSS px. No per-container code: everything is config.
   cfg = {
     mode: "loop" | "step",          loop = autoplay forever (holds + transitions); step = user steps (tap/click media, prev/next, swipe,
                                     arrow keys, dots); autoplay:true lets a step piece play by itself until the first touch
     autoplay: true,                 step mode only
     spring: [80,20,1],              Figma spring [stiffness, damping, mass]; default SLOW. Curve = the analytic spring, normalised over
                                     its 0.1% settle and time-scaled to the transition duration (= the linear() curve, unsampled)
     dur: 1664, tr: {"0>1":832},     transition ms (default, and per "from>to" pair); edur: {key: ms} shortens one layer's tween
     hold: 2400,                     hold ms per state (state.hold overrides)
     toggle: {tapFrame:true},        before/after (2 states): one .mbtn pill per state (state.short = its label, e.g. Before / After)
                                     replaces dots + play/pause. No autoplay: scroll drives it. State 0 (Before) while the box's vertical
                                     centre is below the window's centre line, state 1 (After) once it meets it (4px hysteresis each way;
                                     right on load too); reduced motion cuts instantly. A pill tap sets that state at once (the next
                                     crossing re-syncs it to scroll); tapFrame = tapping the frame flips too
     ambient: true,                  loop mode, no interaction at all: no pill, play/pause, live region, swipe, keys or state
                                     aria-label (the box keeps its authored one); it just autoplays and loops
     rm: 1,                          reduced motion: the static key frame shown (no autoplay; steps cut instantly)
     enter: {set, dur},                (a layout may carry its own enter)              optional one-time entrance: layers start at state 0 merged with enter.set and animate into state 0
                                     the first time the piece is in view
     base: {key: {x,y,w,h,s,o,r,c,k}},   x/y translate, w/h size, s scale, o opacity, r radius (design px); c background, k text colour (#hex)
     states: [{name, caption, hold, set: {key: {...}}}],
     layouts: [{mq, w, h, oy, base, states: [{set}]}]   media-query layout overrides (e.g. a phone frame) merged over the default
     w: 1920, h: 1080, oy: 0         stage size in design px; oy shifts the stage vertically inside the box (design px)
     fh: true                        stage height = the box height in design px (box aspect, no letterbox); with layer hm (h = stage h - hm)
   }
   Timing: every value is ms on an 8ms grid. Runs only while >= 35% in view (IntersectionObserver) and the tab is visible;
   the play/pause (loop mode) or any touch (step mode) sticks. Controls: the site's carousel pill (.car-dots, one dot per state, the
   active one filling over its hold) + .mbtn buttons (css/case.css, glass in css/theme.css), 32px inset (16px on phones). */
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)'),springs={};
function springEase(p){var key=p.join(',');if(springs[key])return springs[key];
 var k=p[0],c=p[1],m=p[2]||1,w0=Math.sqrt(k/m),z=c/(2*Math.sqrt(k*m)),x;
 if(z<1){var wd=w0*Math.sqrt(1-z*z);x=function(t){return 1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t))}}
 else if(z===1){x=function(t){return 1-Math.exp(-w0*t)*(1+w0*t)}}
 else{var s=w0*Math.sqrt(z*z-1),r1=-z*w0+s,r2=-z*w0-s,A=r2/(r2-r1),B=1-A;x=function(t){return 1-(A*Math.exp(r1*t)+B*Math.exp(r2*t))}}
 var T=0;for(var t=0;t<20;t+=.0005)if(Math.abs(1-x(t))>=.001)T=t;T+=.0005;var xe=x(T);  /* settle: last time outside the 0.1% band */
 return springs[key]=function(u){return u<=0?0:u>=1?1:x(u*T)/xe}}
function hex(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
function merge(dst,src){if(src)for(var key in src){dst[key]=dst[key]||{};for(var p in src[key]){var v=src[key][p];dst[key][p]=(p==='c'||p==='k')&&typeof v==='string'?hex(v):v}}return dst}
function clone(v){var o={};for(var key in v){o[key]={};for(var p in v[key]){var q=v[key][p];o[key][p]=q&&q.slice?q.slice():q}}return o}
var ARR='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5"/></svg>';

/* Figma 60% corner smoothing as an SVG path (same maths as FMSSSplit.squircle in js/fmss-split.js; R clamps to half the short side) */
function squircle(w,h,R,sm){if(window.FMSSSplit&&FMSSSplit.squircle)return FMSSSplit.squircle(w,h,R,sm);
 var rad=function(x){return x*Math.PI/180},bud=Math.min(w,h)/2;R=Math.min(R,bud);var p=(1+sm)*R,am=90*(1-sm),arc=Math.sin(rad(am/2))*R*Math.SQRT2,p34=R*Math.tan(rad((90-am)/4)),be=45*sm,
 c=p34*Math.cos(rad(be)),d=c*Math.tan(rad(be)),b=(p-arc-c-d)/3,a=2*b;if(p>bud){var m=bud-d-arc-c;b=Math.min(b,m-m/6);a=m-b;p=bud}
 var f=function(v){return +v.toFixed(3)},A=f(a),AB=f(a+b),X=f(a+b+c),BC=f(b+c),C=f(c),D=f(d),S=f(arc),r=f(R);
 return 'M'+f(w-p)+' 0c'+A+' 0 '+AB+' 0 '+X+' '+D+'a'+r+' '+r+' 0 0 1 '+S+' '+S+'c'+D+' '+C+' '+D+' '+BC+' '+D+' '+X+'L'+w+' '+f(h-p)+'c0 '+A+' 0 '+AB+' '+(-D)+' '+X+'a'+r+' '+r+' 0 0 1 '+(-S)+' '+S+'c'+(-C)+' '+D+' '+(-BC)+' '+D+' '+(-X)+' '+D+
  'L'+f(p)+' '+h+'c'+(-A)+' 0 '+(-AB)+' 0 '+(-X)+' '+(-D)+'a'+r+' '+r+' 0 0 1 '+(-S)+' '+(-S)+'c'+(-D)+' '+(-C)+' '+(-D)+' '+(-BC)+' '+(-D)+' '+(-X)+'L0 '+f(p)+'c0 '+(-A)+' 0 '+(-AB)+' '+D+' '+(-X)+'a'+r+' '+r+' 0 0 1 '+S+' '+(-S)+'c'+C+' '+(-D)+' '+BC+' '+(-D)+' '+X+' '+(-D)+'Z'}
/* before/after segmented control: track + thumb fill clipped to 60%-smoothed pills, re-cut whenever the box resizes (phone sizes differ) */
function segClip(seg){[seg,seg.firstChild.firstChild].forEach(function(e){var w=e.offsetWidth,h=e.offsetHeight;if(w&&h)e.style.clipPath="path('"+squircle(w,h,h/2,.6)+"')"})}
function mount(box){var pins=[];
 var cfg=JSON.parse(box.querySelector('script.ss-cfg').textContent),stage=box.querySelector('.ss-stage'),fig=box.closest('figure');
 var cap=fig&&fig.querySelector('figcaption'),n=cfg.states.length,step=cfg.mode==='step',els={};
 [].forEach.call(box.querySelectorAll('[data-l]'),function(e){els[e.getAttribute('data-l')]=e});
 /* .ss-pin: a CSS-px control inside a layer (e.g. a card's + button); --pin keeps it inside the stage's visible width when its layer
    runs past the right edge (a card pushed out still shows its button) */
 [].forEach.call(box.querySelectorAll('.ss-pin'),function(e){var l=e.parentNode.closest('[data-l]');if(l)pins.push({e:e,k:l.getAttribute('data-l')})});
 if(cfg.bind)[].forEach.call(document.querySelectorAll(cfg.bind+' [data-l]'),function(e){els[e.getAttribute('data-l')]=e});
 var sc=1,ins=32,ease=springEase(cfg.spring||[80,20,1]),L=null,i=0,cur={},from={},to={},tr=null,hold=0,clock=0,last=0,raf=0,vis=false,started=false;
 var tog0=!step&&!!cfg.toggle,playing=step?(cfg.autoplay!==false):!tog0,touched=false,entering=false;
 /* the site's one-demo-at-a-time pool (js/demos.js): an autoplaying piece holds its autoplay while another demo is nearer the window's
    centre (user steps, toggles and the entrance still run) and resumes from the same frame when its turn comes back */
 var on=true,demoAsk=null;if(window.dbhDemos&&playing){on=false;demoAsk=dbhDemos.add(box,{play:function(){on=true;kick()},pause:function(){on=false},want:function(){return playing}})}
 var FL=/"(sf|hm)"/.test(box.querySelector('script.ss-cfg').textContent),SH=cfg.h||1080,FH=false;
 function layout(){var l=null;(cfg.layouts||[]).forEach(function(x){if(!l&&matchMedia(x.mq).matches)l=x});return l||{}}
 function vals(k,extra){var L2=layout(),v=merge(merge({},cfg.base),cfg.states[k].set);merge(v,L2.base);if(L2.states&&L2.states[k])merge(v,L2.states[k].set);if(extra)merge(v,extra);
  /* sf:[avail,cssReserve,natural,max] = fluid scale: the largest s that fits natural*s into avail design px minus cssReserve CSS px (e.g. a pinned button + gap) */
  for(var q in v)if(v[q].sf){var f=v[q].sf;v[q].s=Math.max(0,Math.min(f[3],(f[0]-f[1]/sc)/f[2]));delete v[q].sf}
  /* yc:[boxH,naturalH] = centre a (fluid-scaled) layer vertically in a box of boxH design px */
  for(q in v)if(v[q].yc){v[q].y=(v[q].yc[0]-v[q].yc[1]*(v[q].s!=null?v[q].s:1))/2;delete v[q].yc}
  /* hm = height minus: in a fh layout the layer is the stage height less hm design px (equal margins whatever the box aspect) */
  for(q in v)if('hm' in v[q]){if(FH)v[q].h=SH-v[q].hm;delete v[q].hm}return v}
 function holdOf(k){return cfg.states[k].hold||cfg.hold||2400}
 function durOf(a,b){return RM.matches?0:((cfg.tr||{})[a+'>'+b]||cfg.dur||1664)}
 function put(){for(var key in cur){var e=els[key],v=cur[key];if(!e)continue;var t='';
  if('x' in v||'y' in v)t='translate('+(+(v.x||0)).toFixed(2)+'px,'+(+(v.y||0)).toFixed(2)+'px)';if('s' in v)t+=' scale('+(+v.s).toFixed(4)+')';if('a' in v)t+=' rotate('+(+v.a).toFixed(3)+'deg)';if(t)e.style.transform=t;
  if('w' in v)e.style.width=(+v.w).toFixed(2)+'px';if('h' in v)e.style.height=(+v.h).toFixed(2)+'px';if('r' in v)e.style.borderRadius=(+v.r).toFixed(2)+'px';if('lh' in v)e.style.setProperty('--lh',(+v.lh).toFixed(2)+'px');
  if('o' in v){e.style.opacity=(+v.o).toFixed(4);e.style.visibility=v.o<.001?'hidden':''}
  if(v.c)e.style.backgroundColor='rgb('+v.c.map(Math.round)+')';if(v.k)e.style.color='rgb('+v.k.map(Math.round)+')'}
  pins.forEach(function(p){var v=cur[p.k];if(!v)return;var W=(L&&L.w)||cfg.w||1920,m=(ins+48)/sc,over=Math.max(0,Math.min((+v.x||0)+(+v.w||0)-W,(+v.w||0)-m));p.e.style.setProperty('--pin',over.toFixed(2)+'px');
   /* pc 0..1 on the layer: lift its pinned button from the bottom inset to the layer's vertical centre (tabs) */
   if('pc' in v)p.e.style.setProperty('--pinb',(v.pc*(((+v.h||0)-32/sc)/2-ins/sc)).toFixed(2)+'px')})}
 /* fh (cfg or layout): the stage takes the box's own aspect: W design px wide, as tall as the box (no letterbox), so stage edges = box edges.
    The box width and height are its computed (fractional) inner size: clientWidth/clientHeight round to whole px, which pushed the stage up
    to 1/2px past a fractional box's right edge and left the fh margins (hm) up to 1/2px uneven */
 function fit(){L=layout();var cs=getComputedStyle(box),pf=function(k){return parseFloat(cs[k])||0},bb=cs.boxSizing==='border-box',bw=pf('width')?pf('width')+(bb?-pf('borderLeftWidth')-pf('borderRightWidth'):pf('paddingLeft')+pf('paddingRight')):box.clientWidth,bh=pf('height')?pf('height')+(bb?-pf('borderTopWidth')-pf('borderBottomWidth'):pf('paddingTop')+pf('paddingBottom')):box.clientHeight,W=L.w||cfg.w||1920,s=bw/W;FH=L.fh!=null?!!L.fh:!!cfg.fh;var H=FH?bh/s:(L.h||cfg.h||1080);SH=H;var oy=(bh-H*s)/2+(L.oy!=null?L.oy:(cfg.oy||0))*s;
  stage.style.width=W+'px';stage.style.height=H+'px';stage.style.transform='translate(0px,'+oy.toFixed(2)+'px) scale('+s.toFixed(5)+')';sc=s;ins=parseFloat(getComputedStyle(box).getPropertyValue('--ins'))||32;stage.style.setProperty('--inv',(1/s).toFixed(5));if(FL&&started&&!tr)cur=vals(i);if(cur)put();if(tg)segClip(tg[0].parentNode)}
 /* controls */
 /* cfg.ambient: a plain autoplaying loop, nothing built or bound (no pill, buttons, live region, swipe, keys or state aria-label) */
 var amb=!!cfg.ambient,tog=!step&&cfg.toggle,tg=null,dots=[],bars=[],fills=[],pp=null,prev=null,next=null,sr=null;
 function mbtn(cls,html,label,fn){var b=document.createElement('button');b.type='button';b.className='mbtn '+cls;b.innerHTML=html;b.setAttribute('aria-label',label);
  b.addEventListener('click',function(ev){ev.stopPropagation();fn()});return b}
 if(!amb){var ctrl=document.createElement('div'),row=document.createElement('div');sr=document.createElement('span');
 ctrl.className='car-ctrl ss-ctrl';row.className='car-dots';row.setAttribute('role','group');row.setAttribute('aria-label','Choose state');
 cfg.states.forEach(function(st,k){var b=document.createElement('button');b.type='button';b.className='car-dot';b.innerHTML='<i class="car-bar" aria-hidden="true"><i class="car-fill"></i></i>';
  b.setAttribute('aria-label',(st.name||('State '+(k+1)))+' ('+(k+1)+' of '+n+')');b.addEventListener('click',function(ev){ev.stopPropagation();touch();go(k,{manual:true})});
  row.appendChild(b);dots.push(b);bars.push(b.firstChild);fills.push(b.firstChild.firstChild)});
 if(cfg.controls===false){}
 else if(step){prev=mbtn('ss-prev',ARR,'Previous',function(){touch();go(i-1)});next=mbtn('ss-next',ARR,'Next',function(){touch();go(i+1)});ctrl.appendChild(prev);ctrl.appendChild(row);ctrl.appendChild(next)}
 else if(tog){tg=[];var seg=document.createElement('div'),th=document.createElement('span');seg.className='ss-seg';th.className='ss-thumb';th.innerHTML='<i></i>';seg.appendChild(th);
  cfg.states.forEach(function(st,k){var b=mbtn('ss-sb',st.short||st.name||String(k+1),'',function(){userTap(k)});b.setAttribute('aria-label','Show '+(st.name||st.short));tg.push(b);seg.appendChild(b)});
  seg.style.setProperty('--n',n);ctrl.appendChild(seg);ctrl.setAttribute('role','group');ctrl.setAttribute('aria-label','Before and after')}
 else{pp=mbtn('car-pp',window.dbhPP||'','Pause',function(){playing=!playing;sync();kick()});ctrl.appendChild(row);ctrl.appendChild(pp)}
 sr.className='car-sr';sr.setAttribute('aria-live','polite');if(cfg.controls!==false)box.appendChild(ctrl);box.appendChild(sr);if(pp&&cfg.controls!==false&&window.dbhTapPP)dbhTapPP(box,pp)}
 function sync(){if(tg){tg.forEach(function(b,k){b.setAttribute('aria-pressed',k===i?'true':'false')});tg[0].parentNode.style.setProperty('--k',i)}if(pp){pp.setAttribute('aria-pressed',playing?'true':'false');pp.setAttribute('aria-label',(playing?'Pause':'Play')+' animation')}}
 /* dots: slot openness e[k] eases with the transition, so the pill keeps one width */
 var e=cfg.states.map(function(){return 0}),e0=e.slice();
 function drawDots(q){if(tg||amb)return;for(var k=0;k<n;k++){var t=k===i?1:0,v=q>=1?t:e0[k]+(t-e0[k])*q;e[k]=v;
  dots[k].style.width=(24+16*v).toFixed(3)+'px';bars[k].style.width=(5+19*v).toFixed(3)+'px';dots[k].setAttribute('aria-current',k===i?'true':'false');
  var p=0;if(k===i&&q>=1)p=(step&&!playing)||RM.matches?1:Math.min(1,hold/holdOf(i));fills[k].style.setProperty('--p',p.toFixed(4))}}
 function setCap(){var st=cfg.states[i];if(cap&&st.caption!=null&&!cap.hasAttribute('data-static'))cap.textContent=st.caption;if(!amb)box.setAttribute('aria-label',(st.name||'')+(n>1?' ('+(i+1)+' of '+n+')':''))}
 function go(k,opt){k=cfg.wrap===false?Math.max(0,Math.min(n-1,k)):(k%n+n)%n;opt=opt||{};var a=i,d=opt.dur!=null?opt.dur:durOf(a,k);if(k===a&&!opt.force)return;
  from=clone(cur);to=vals(k);e0=e.slice();i=k;hold=0;tr={t0:clock,d:d,manual:!!opt.manual||step};setCap();sync();if(!opt.quiet&&sr)sr.textContent=cfg.states[k].name||'';
  if(!d){cur=clone(to);tr=null;put();drawDots(1)}kick()}
 function lerp(a,b,u){return a+(b-a)*u}
 function frameTr(){var el=clock-tr.t0,done=el>=tr.d;
  for(var key in to){var f=from[key]||to[key],t=to[key],ed=(cfg.edur||{})[key]||tr.d,u=ease(Math.min(1,el/Math.min(ed,tr.d)));cur[key]=cur[key]||{};
   for(var p in t){var fv=f[p]!=null?f[p]:t[p],tv=t[p];cur[key][p]=tv&&tv.map?tv.map(function(c,j){return lerp(fv[j],c,u)}):lerp(fv,tv,u)}}
  drawDots(ease(Math.min(1,el/tr.d)));put();if(done){tr=null;entering=false;drawDots(1)}}
 function running(){return vis&&!document.hidden&&(tr?(tr.manual||playing&&on):(playing&&on&&!RM.matches))}
 function kick(){if(!raf&&running()){last=0;raf=requestAnimationFrame(frame)}}
 function frame(now){raf=0;var dt=last?Math.min(128,now-last):16;last=now;clock+=dt;
  if(tr)frameTr();else if(playing&&!RM.matches){hold+=dt;if(hold>=holdOf(i)){go(i+1,{quiet:true});return}drawDots(1)}
  if(running())raf=requestAnimationFrame(frame)}
 /* toggle (cfg.toggle): a tap flips to the other state at once; scroll (below) re-syncs it at the next centre-line crossing */
 function userTap(k){go(k==null?i+1:k,{manual:true})}
 function touch(){if(step&&!touched){touched=true;playing=false;if(demoAsk)demoAsk()}}
 /* step mode: tap/click the media to advance, arrow keys when focused (swipes: the shared dbhSwipe below) */
 if(step){var sx=0,sy=0,down=false;
  box.addEventListener('pointerdown',function(ev){if(ev.target.closest('.ss-ctrl'))return;down=true;sx=ev.clientX;sy=ev.clientY});
  box.addEventListener('pointerup',function(ev){if(!down)return;down=false;var dx=ev.clientX-sx,dy=ev.clientY-sy;touch();
   if(Math.abs(dx)<10&&Math.abs(dy)<10){
    var t=ev.target.closest&&ev.target.closest('[data-go]');
    if(t&&box.contains(t)){var k=+t.getAttribute('data-go');go(i===k&&t.hasAttribute('data-back')?+t.getAttribute('data-back'):k)}
    else if(cfg.tapAdvance!==false)go(i+1)}});
  box.addEventListener('pointercancel',function(){down=false})
  box.addEventListener('click',function(ev){if(ev.detail)return;var t=ev.target.closest&&ev.target.closest('[data-go]');if(!t||!box.contains(t))return;touch();var k=+t.getAttribute('data-go');go(i===k&&t.hasAttribute('data-back')?+t.getAttribute('data-back'):k)})}
 if(tog&&tog.tapFrame!==false){var tx=0,ty=0,tdn=false;box.classList.add('ss-tapf');
  box.addEventListener('pointerdown',function(ev){if(ev.target.closest('.ss-ctrl'))return;tdn=true;tx=ev.clientX;ty=ev.clientY});
  box.addEventListener('pointerup',function(ev){if(!tdn)return;tdn=false;if(Math.abs(ev.clientX-tx)<10&&Math.abs(ev.clientY-ty)<10)userTap()});
  box.addEventListener('pointercancel',function(){tdn=false})}
 /* swipe / drag / trackpad, every mode: the shared gesture (js/case.js window.dbhSwipe); a step = a dot tap (toggle: a pill tap),
    then the demo pool (js/demos.js) re-picks */
 if(!amb&&n>1&&window.dbhSwipe)dbhSwipe(box,function(d){if(tog)userTap(i+d);else{touch();go(i+d,{manual:true})}if(demoAsk)demoAsk()},{skip:'.ss-ctrl'});
 if(!amb)box.addEventListener('keydown',function(ev){if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){ev.preventDefault();if(tog){userTap();return}touch();go(i+(ev.key==='ArrowRight'?1:-1))}});
 /* start */
 fit();var EN=layout().enter||cfg.enter;i=RM.matches&&cfg.rm!=null&&!tog?cfg.rm:0;cur=vals(i,EN&&!RM.matches?EN.set:null);entering=!!(EN&&!RM.matches);
 fit();put();e[i]=1;drawDots(1);setCap();sync();
 if('ResizeObserver' in window)new ResizeObserver(fit).observe(box);else addEventListener('resize',fit);
 (cfg.layouts||[]).forEach(function(x){var q=matchMedia(x.mq);if(q.addEventListener)q.addEventListener('change',function(){fit();if(!tr){cur=vals(i);put()}})});
 function show(v){if(v&&!started&&cfg.autoOnce&&!RM.matches)setTimeout(function(){if(!touched&&i===0)go(cfg.autoOnce.to,{manual:true})},cfg.autoOnce.delay||0);vis=v;if(v&&!started){started=true;if(entering){from=clone(cur);to=vals(i);tr={t0:clock,d:EN.dur||1248,manual:true}}}kick()}
 var gated=function(){return document.documentElement.classList.contains('gated')},ratio=0;
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(x){ratio=x.intersectionRatio;if(!gated())show(ratio>=.35)})},{threshold:[0,.35,1]}).observe(box);else show(true);
 addEventListener('gate:unlocked',function(){show(ratio>=.35)});
 document.addEventListener('visibilitychange',kick);
 if(RM.addEventListener)RM.addEventListener('change',function(){if(RM.matches){tr=null;if(cfg.rm!=null&&!tog)i=cfg.rm;cur=vals(i);put();e=e.map(function(_,k){return k===i?1:0});drawDots(1);setCap()}kick()});
 /* before/after toggles: scroll position drives the state. Container centre at or above the window's centre line (innerHeight/2: the
    layout viewport, so iOS's dynamic toolbar moves the line with the visible window) = After, below it = Before, with a 4px dead band
    either side so a centre resting on the line can't flicker (layout position via offsetTop: the .fx reveal's translate can't nudge it). rAF-throttled on scroll/resize (+ visualViewport, ResizeObserver);
    the first check (load or reload already scrolled past) cuts straight to the right state with no transition */
 if(tog){var sq=0,first=true,HY=4;
  function sAt(){sq=0;var H=box.offsetHeight;if(!H)return;var y=0;for(var o=box;o;o=o.offsetParent)y+=o.offsetTop;var d=(y-(window.scrollY||pageYOffset)+H/2)-innerHeight/2,k=d<=-HY?1:d>HY?0:(first?(d<=0?1:0):i);
   if(first){first=false;if(k!==i){var th=tg&&tg[0].parentNode.firstChild;if(th)th.style.transition='none';go(k,{dur:0,quiet:true});if(th){th.offsetWidth;th.style.transition=''}}return}if(k!==i)go(k,{manual:true})}
  var sReq=function(){if(!sq)sq=requestAnimationFrame(sAt)};
  addEventListener('scroll',sReq,{passive:true});addEventListener('resize',sReq);if(window.visualViewport)visualViewport.addEventListener('resize',sReq);
  if('ResizeObserver' in window)new ResizeObserver(sReq).observe(box);addEventListener('load',sReq);addEventListener('pageshow',sReq);sAt()}
 box.__ss={go:go,state:function(){return{i:i,playing:playing,vis:vis,tr:!!tr,clock:clock,hold:hold}},tap:function(){userTap()}};
}
function init(){[].forEach.call(document.querySelectorAll('.media.sseq'),function(b){try{mount(b)}catch(err){if(window.console)console.error('state-seq',err)}})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
