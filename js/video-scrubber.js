/* Video scrubber + timestamp: the live player controls of the FMSS ad demos (the split-screen B state: hero cover, preview/fmss-sol1,
   preview/fmss-sol2). One instance per playing <video>; it draws, in the host's design px (375-wide phone screen), the timestamp
   "m:ss / m:ss" (floor of the real position / real duration from the metadata) and the 4px pill track (16px radius) with its pill fill and 10px thumb, laid
   out exactly where the old decorative controls image had them; the icons (fullscreen / pause / volume) stay as an image crop.
   - sync: one shared requestAnimationFrame ticker reads video.currentTime every display frame, so the fill, thumb and time track
     the playing video and wrap to 0 when it loops
   - seek: pointer events (mouse, pen, touch) on the track's hit strip, pointer capture, live time while dragging, the video resumes
     on release if it was playing. Every event of the strip stops propagating (and its click does nothing), so it never reaches a
     card link, the home strip's drag or a full-screen opener; nothing outside the strip is touched
   - fade: after split screen is reached the controls hold at full opacity until 2080ms, then a 320ms ease-out to 0 (gone at 2400ms),
     then visibility hidden + no pointer events: only the close button is left. Each re-entry to split screen shows them again.
     The clock is the host's: sinceSplit() → ms since split screen was reached (negative while it is being entered, null when not in
     it), so a paused demo freezes the fade with it. VideoScrubber.loop() builds that from a looping WAAPI animation and its marks;
     hosts without a timeline can call enterSplit() / leaveSplit() instead
   - tap to pause (opt-in, off by default: tapToPause:true): a tap on the video area (tapArea, default the video's parent) while in
     split screen pauses the video if it is playing and resumes it if paused; the pause icon in the controls becomes a play icon
     (an SVG drawn in the icons' style over the glyph slot pauseSlot:[x,w] of the icon strip) and back. A tap brings the controls
     back, they stay up while paused, and the fade restarts from the tap that resumes. The tap's events stop at the tap area (no card
     link, full-screen opener or prototype gesture sees them); a press that moves (a drag) or is held is not a tap, and the track's
     own drags never reach it. Outside split screen the area is left alone. The host's loop keeps running: if split screen ends while
     paused, the next entry resumes the video with the controls reset
   - lock (opt-in, o.lock = {zero, park:[from, to], avoid:[from, to]}): the video's playhead is a function of the host's loop clock
     (sinceSplit from VideoScrubber.loop(), or o.lock.clock / o.lock.T), so the same video moment shows at the same loop moment: loop
     time `zero` (ms) shows video 0:00 and the video runs 1:1 with the loop. Over `park` (loop ms, where the host covers the video) it
     is paused on the frame due at park's end and played again from it there, so it leaves the park on that exact frame however far
     its decoder lagged (the loop's slack over the clip, T - duration, is absorbed there). Elsewhere drift is eased with the playback
     rate (±15%) and a start or stall more than 1s off seeks (at most every 1.5s). Render guard: while the frame on screen is inside
     `avoid` (s) the <video> is visibility:hidden and is seeked out of it. A scrub or tap pause frees it until the next park; it still
     skips avoid. Off under reduced motion (the hosts' stills keep their own frame). The clip has to cover both stretches it is shown
     for (zero -> park start, park end -> zero; a console warning names a clip that does not, it would wrap mid-loop there) */
(function(){
'use strict';
if(window.VideoScrubber)return;
var RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var HOLD=2080,FADE=320,GONE=HOLD+FADE;   // controls gone 2400ms after split screen is reached (the 320ms ease-out fade itself unchanged)
// CSS ease-out = cubic-bezier(0,0,.58,1), solved for x
function easeOut(x){if(x<=0)return 0;if(x>=1)return 1;var t=x;for(var i=0;i<8;i++){var cx=3*.58*t*t*(1-t)+t*t*t-x,d=6*.58*t*(1-t)-3*.58*t*t+3*t*t;if(Math.abs(cx)<1e-6||!d)break;t-=cx/d;t=Math.min(1,Math.max(0,t))}return 3*t*t*(1-t)+t*t*t}
function fmt(s){s=Math.max(0,Math.floor(s||0));var m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r}
var css='.vs{position:absolute;left:0;top:0;width:375px;pointer-events:none}'+
 '.vs-f{position:absolute;inset:0}'+
 '.vs-i{position:absolute;width:125px;height:24px;background:no-repeat 0 0/125px 24px}'+
 '.vs-t{position:absolute;margin:0;white-space:nowrap;color:#fff;font:400 16px/16px -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Helvetica Neue",Arial,sans-serif;'+
   'letter-spacing:0;text-shadow:0 0 1px rgba(0,0,0,.16);-webkit-font-smoothing:antialiased}'+
 '.vs-h{position:absolute;height:24px;pointer-events:auto;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}'+
 '.vs-r,.vs-l{position:absolute;left:0;top:10px;width:100%;height:4px;border-radius:16px}'+
 '.vs-r{background:rgba(255,255,255,.2);box-shadow:0 0 1px rgba(0,0,0,.12)}'+
 // fill: a track-sized pill that clips a full-width white pill slid in from the left (translateX only), so both of its ends stay true
 // semicircles at any position (a scaleX fill squashes its rounded ends into square, uneven ones)
 '.vs-l{overflow:hidden;isolation:isolate}.vs-l>i{position:absolute;left:0;top:0;width:100%;height:100%;border-radius:16px;background:#fff;transform:translateX(-100%)}'+
 '.vs-b{position:absolute;left:-5px;top:7px;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 1px rgba(0,0,0,.16)}'+
 '.vs.vs-off .vs-f{visibility:hidden}.vs.vs-off .vs-h{pointer-events:none}'+
 '.vs-s{position:absolute;top:0;height:24px;background-repeat:no-repeat}.vs-s svg{display:none;position:absolute;left:50%;top:0;margin-left:-12px;width:24px;height:24px;filter:drop-shadow(0 0 .5px rgba(0,0,0,.24))}'+
 '.vs.vs-p .vs-s.vs-g{background-image:none!important}.vs.vs-p .vs-s svg{display:block}'+
 '.vs-tap{pointer-events:auto!important;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
 // no focus ring, outline or tap highlight on any part of the player, keyboard focus included (the FMSS demos' audience never uses a keyboard)
 '.vs,.vs *,.vs-tap{-webkit-tap-highlight-color:transparent}'+
 ':is(.vs,.vs *,.vs-tap):is(:focus,:focus-visible,:active){outline:none!important;-webkit-tap-highlight-color:transparent}';
// play glyph matching the strip's pause (two 5.5×17 rounded bars, 14 wide): a 14×17 white triangle with rounded corners, same optical size
var PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 4.6c0-1 1.1-1.6 1.9-1.1l10.4 7.4c.7.5.7 1.6 0 2.1L9.4 20.4c-.8.6-1.9 0-1.9-1z" fill="#fff"/></svg>';
function style(doc){if(doc.getElementById('vs-css'))return;var s=doc.createElement('style');s.id='vs-css';s.textContent=css;(doc.head||doc.documentElement).appendChild(s)}
var list=[],raf=0;
function tick(){raf=0;for(var i=0;i<list.length;i++)list[i]._tick();if(list.length)raf=requestAnimationFrame(tick)}
function run(){if(!raf&&list.length)raf=requestAnimationFrame(tick)}
var STOP=['pointerdown','pointermove','pointerup','pointercancel','mousedown','mouseup','click','dblclick','touchstart','touchmove','touchend','touchcancel','contextmenu'];
/* o: {video, icons:url, iconsX:240, iconsY:344, x:12, w:351, trackY:392 (centre), timeY:362 (baseline), height, sinceSplit:fn, className} */
function create(o){
  var v=o.video,doc=(o.document||document);style(doc);
  var x=o.x==null?12:o.x,w=o.w==null?351:o.w,ty=o.trackY==null?392:o.trackY,tb=o.timeY==null?ty-30:o.timeY;
  var root=doc.createElement('div');root.className='vs'+(o.className?' '+o.className:'');if(o.height)root.style.height=o.height+'px';
  var tap=!!o.tapToPause,ix=o.iconsX==null?240:o.iconsX,iy=o.iconsY==null?ty-48:o.iconsY,sl=o.pauseSlot||[44,36];
  // icons: one crop; with tap to pause it is cut in three around the pause glyph's slot, so that slot alone can show the play icon
  function slice(a,b,g){return '<i class="vs-i vs-s'+(g?' vs-g':'')+'" style="left:'+(ix+a)+'px;top:'+iy+'px;width:'+(b-a)+'px;background-image:url(\''+o.icons+'\');background-position:'+(-a)+'px 0">'+(g?PLAY:'')+'</i>'}
  root.innerHTML='<div class="vs-f">'+(o.icons?(tap?slice(0,sl[0])+slice(sl[0],sl[0]+sl[1],1)+slice(sl[0]+sl[1],125):'<i class="vs-i" style="left:'+ix+'px;top:'+iy+'px;background-image:url(\''+o.icons+'\')"></i>'):'')+
    // baseline: the 16px line box puts it 13.75px under its top (SF Pro / Inter ascent ~.95-.97em, centred half-leading)
    '<p class="vs-t" style="left:'+x+'px;top:'+(tb-13.75)+'px"></p>'+
    '<div class="vs-h" role="slider" aria-label="Seek" aria-valuemin="0" style="left:'+x+'px;top:'+(ty-12)+'px;width:'+w+'px"><i class="vs-r"></i><i class="vs-l"><i></i></i><i class="vs-b"></i></div></div>';
  var f=root.firstChild,tx=f.querySelector('.vs-t'),hit=f.querySelector('.vs-h'),fill=f.querySelector('.vs-l>i'),knob=f.querySelector('.vs-b');
  var last={fr:-1,txt:'',op:-1,off:null},drag=null,t0=null,pend=null,up=false,base=0,prev=null,area=null;
  var api={el:root,video:v,dragging:function(){return !!drag},
    since:o.sinceSplit||function(){return t0==null?null:performance.now()-t0},
    enterSplit:function(){t0=performance.now()},leaveSplit:function(){t0=null},
    fraction:function(){return last.fr},opacity:function(){return last.op},
    paused:function(){return up},togglePause:function(){toggle()},
    destroy:function(){var i=list.indexOf(api);if(i>=0)list.splice(i,1);root.remove()}};
  function D(){var d=v.duration;return isFinite(d)&&d>0?d:0}
  function paint(t){var d=D(),fr=d?Math.min(1,Math.max(0,t/d)):0;
    if(fr!==last.fr){last.fr=fr;fill.style.transform='translateX('+((fr-1)*w).toFixed(2)+'px)';knob.style.transform='translateX('+(fr*w)+'px)'}
    var s=d?fmt(Math.min(t,d))+' / '+fmt(d):'';if(s!==last.txt){last.txt=s;tx.textContent=s;hit.setAttribute('aria-valuemax',Math.floor(d));hit.setAttribute('aria-valuenow',Math.floor(t))}}
  function fade(){var ms=api.since();if(tap)ms=tapClock(ms);if(drag||up)ms=null;var op=ms==null||ms<HOLD?1:ms>=GONE?0:1-easeOut((ms-HOLD)/FADE),off=op===0;
    if(op!==last.op){last.op=op;f.style.opacity=op===1?'':String(+op.toFixed(4))}
    if(off!==last.off){last.off=off;root.classList.toggle('vs-off',off)}}
  // hit strip: 24 design px round the track, taller where the phone is drawn small (at least 12 CSS px, at most 48 design px)
  var n=0,hh=24;function hitSize(){var r=hit.getBoundingClientRect(),k=r.width/w;if(!k)return;var h=Math.round(Math.min(48,Math.max(24,12/k)));
    if(h!==hh){hh=h;hit.style.top=(ty-h/2)+'px';hit.style.height=h+'px';f.querySelector('.vs-r').style.top=f.querySelector('.vs-l').style.top=(h/2-2)+'px';knob.style.top=(h/2-5)+'px'}}
  var lk=o.lock,ss=o.sinceSplit,clk=lk&&(lk.clock||(ss&&ss.time)),LT=lk&&(lk.T||(ss&&ss.T)),free=false,pL=null,ls=-1e9,parked=false,inP=false,shown=0,hid=false,chk=0;
  function md(x,m){return ((x%m)+m)%m}
  function parkAt(L){var p=lk.park;return !!p&&md(L-p[0],LT)<md(p[1]-p[0],LT)}
  // the host (or demo clock) may call play() while parked: the video stays parked until the park ends
  if(lk)v.addEventListener('play',function(){if(!clk||!LT||free||RM.matches)return;var L=clk();if(L!=null&&parkAt(L)){parked=true;v.pause()}});
  function lock(){if(!clk||!LT||RM.matches)return;var d=D(),L=clk(),av=lk.avoid;
    // render guard: a frame inside avoid is never drawn, whatever put it there (the frame on screen during a seek is the old one)
    if(!v.seeking)shown=v.currentTime;var bad=!!av&&shown>=av[0]&&shown<av[1];if(bad!==hid){hid=bad;v.style.visibility=bad?'hidden':''}
    if(!d||v.readyState<1||L==null||!isFinite(L))return;
    if(chk!==d&&lk.park){chk=d;var sp=Math.max(md(lk.park[0]-lk.zero,LT),LT-md(lk.park[1]-lk.zero,LT));
      if(d*1000+1<sp&&window.console)console.warn('VideoScrubber lock: '+(v.currentSrc||v.src)+' ('+d+'s) is shorter than the '+sp+'ms it is shown for')}
    var u=md(L-lk.zero,LT),moving=pL!=null&&L!==pL,P=parkAt(L),enter=P&&!inP;inP=P;pL=L;
    if(drag||up)free=true;else if(free&&enter)free=false;
    if(free){if(parked){parked=false}if(v.playbackRate!==1)v.playbackRate=1;if(av&&!drag&&!v.seeking&&bad)seek(av[1]);return}
    // park: from park[0] to park[1] (where the video is covered) the video is paused on the frame due at park[1], so it leaves the
    // park on that frame whatever its decoder's lag; the clip's slack over the loop (T - duration) goes here too
    var pe=lk.park?md(lk.park[1]-lk.zero,LT):-1,X=pe>=0?md((pe-(LT-d*1000))/1000,d):0;
    if(P){if(!v.paused){parked=true;v.pause()}if(v.playbackRate!==1)v.playbackRate=1;if(!v.seeking&&Math.abs(v.currentTime-X)>.02)seek(X);return}
    if(parked){parked=false;if(moving){var q=v.play();q&&q.catch(function(){})}}
    if(v.seeking)return;var t=v.currentTime;
    var want=md((u-(pe>=0&&u>=pe?LT-d*1000:0))/1000,d),df=md(t-want+d/2,d)-d/2,now=performance.now(),ad=Math.abs(df),r=1;
    // a start or a stall (>1s off) seeks, at most every 1.5s; smaller drift is eased out with the playback rate (±15%)
    if((bad&&!(want>=av[0]&&want<av[1]))||(ad>1&&now-ls>1500)){ls=now;seek(want)}else if(ad>.03&&!v.paused)r=Math.min(1.15,Math.max(.85,1-df));
    if(Math.abs(v.playbackRate-r)>.01)try{v.playbackRate=r}catch(_){}}
  api._tick=function(){fade();if(lk)lock();if(!drag){if(!(n++%32)&&!last.off)hitSize();paint(v.currentTime)}};
  v.addEventListener('seeked',function(){if(pend!=null){var p=pend;pend=null;seek(p)}});
  ['loadedmetadata','durationchange','emptied'].forEach(function(e){v.addEventListener(e,function(){last.fr=-1;if(!drag)paint(v.currentTime)})});
  function seek(t){if(v.seeking){pend=t;return}try{v.currentTime=t}catch(_){}}
  function frAt(e){var r=hit.getBoundingClientRect();return r.width?Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)):0}
  function move(e){var d=D();if(!d)return;var t=frAt(e)*d,av=lk&&lk.avoid;drag.t=t;paint(t);seek(av&&t>=av[0]&&t<av[1]?av[1]:t)}
  STOP.forEach(function(n){hit.addEventListener(n,function(e){e.stopPropagation();if(n==='click'||n==='dblclick'||n==='contextmenu'||n==='mousedown')e.preventDefault()},{passive:false})});
  hit.addEventListener('pointerdown',function(e){if(e.button>0||!D())return;e.preventDefault();drag={id:e.pointerId,play:!v.paused,t:0};
    try{hit.setPointerCapture(e.pointerId)}catch(_){}if(!v.paused)v.pause();move(e)});
  hit.addEventListener('pointermove',function(e){if(drag&&e.pointerId===drag.id)move(e)});
  function end(e){if(!drag||e.pointerId!==drag.id)return;var p=drag.play;drag=null;try{hit.releasePointerCapture(e.pointerId)}catch(_){}
    if(p){var q=v.play();q&&q.catch(function(){})}}
  hit.addEventListener('pointerup',end);hit.addEventListener('pointercancel',end);hit.addEventListener('lostpointercapture',end);
  // tap to pause: split-screen clock seen through the last tap (base), new entries (clock back to null or jumping back) reset it
  function tapClock(ms){var entry=ms!=null&&(prev==null||ms<prev-200);prev=ms;
    if(entry){base=0;if(up){up=false;root.classList.remove('vs-p');var q=v.play();q&&q.catch(function(){})}}
    if(area)area.classList.toggle('vs-tap',ms!=null&&ms>=0);
    return ms==null?null:ms-base}
  function toggle(){var ms=api.since();if(ms==null||ms<0)return;
    if(!up&&!v.paused){up=true;v.pause()}else{up=false;var q=v.play();q&&q.catch(function(){});base=ms}
    root.classList.toggle('vs-p',up);fade()}
  if(tap){area=o.tapArea||v.parentElement;var press=null;
    var on=function(){return area.classList.contains('vs-tap')},
      TS=['pointerdown','pointermove','pointerup','pointercancel','mousedown','mouseup','click','dblclick','touchstart','touchmove','touchend','touchcancel','contextmenu'];
    TS.forEach(function(n){area.addEventListener(n,function(e){if(!on()&&!(press&&n!=='pointerdown'))return;e.stopPropagation();
      if(n==='click'||n==='dblclick'||n==='contextmenu'||n==='mousedown'||(n==='touchend'&&e.cancelable))e.preventDefault()},{passive:false})});
    area.addEventListener('pointerdown',function(e){if(!on()||e.button>0)return;press={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),moved:false}});
    area.addEventListener('pointermove',function(e){if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)press.moved=true});
    area.addEventListener('pointercancel',function(){press=null});
    area.addEventListener('pointerup',function(e){var p=press;press=null;if(!p||e.pointerId!==p.id||p.moved||performance.now()-p.t>600||!on())return;toggle()})}
  paint(v.currentTime);list.push(api);run();
  return api;
}
/* sinceSplit for a looping WAAPI timeline: anim (any Animation on the loop), T its duration, splits = [[start, reached, end], …] in ms:
   from `start` (the transition into split screen begins) to `end` the controls are in split screen, counted from `reached` */
function loop(anim,T,splits){function time(){var a=typeof anim==='function'?anim():anim;if(!a)return null;var t=+a.currentTime;return isFinite(t)?((t%T)+T)%T:null}
  var f=function(){var t=time();if(t==null)return null;
  for(var i=0;i<splits.length;i++){var s=splits[i];if(t>=s[0]&&t<s[2])return t-s[1]}return null};f.time=time;f.T=T;return f}   // f.time(): loop ms (for lock)
window.VideoScrubber={create:create,loop:loop,format:fmt,HOLD:HOLD,GONE:GONE,all:list};
})();
