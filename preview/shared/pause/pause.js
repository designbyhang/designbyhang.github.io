/* FMSS shared tap-to-pause affordance: the quiet play glyph a reel shows while the viewer has paused it (moved out of
   Caption & Browse and Profile & Browse, now also VAC's prototype, so every reel pauses the same way).
   A 64pt circle, black at 28%, with a 30pt play glyph nudged 4pt right; hidden at opacity 0 and scale .9, in over 200ms (opacity + scale).
   The host owns where it sits (left/top/z-index on its own element) and when the reel is paused:
     const pz=FMSSPause.mount(el);   el = an empty absolutely placed element in the host's screen
     pz.set(on)                      show / hide (toggles .on) · pz.on (state) · pz.el
   The Reels video controls (every full-screen Reels player): a media tap pauses / resumes AND brings up the split screen's own scrubber
   (js/video-scrubber.js, VideoScrubber in its reel mode: the same track, fill, thumb and drag to seek) right above the reel's bottom bar
   (the comment bar, or the tab bar on a Video surface), and the reel's overlay rises to make room for it:
     const pz=FMSSPause.mount(el,{video,at,bar,scope|lift})
       video  the reel's <video>, or a function returning the one on screen now (null: none)
       at     an empty element the host places (its z-order: above the host's input layer, so the track takes its own presses); the
              controls are drawn in it, in the screen's 375×812 design px
       bar    the top of the bottom bar (design px): the 4px track ends 12px above it (track centre bar - 14) and runs 12px in from
              each side of the screen, the 10px thumb not counted
       scope  the element (or a function returning it) holding the reel's overlay: its pieces ([data-reel] rail / details / more / cta /
              pill, the shared caption's .c-stack, the shared UFI's .r-ufi) move up (by what puts the lowest CTA / pill / caption 20px over the
              track: measured per reel, see amount()), in step with the controls'
              opacity (in 240ms ease-out, out on the split screen's 320ms ease-out), so nothing overlaps; lift: a function returning
              the pieces instead, for an overlay that is not built from those; also: a function returning pieces outside the scope that
              belong to the overlay (a press highlight or a button laid over the CTA)
              Only live UI rises from a scope: a <video>, a poster, or a still that belongs to the media (the scrim, the gradient over
              the video: mark it data-media) is left out of a scope lift, and so is any piece holding one; the scrim stays where it is in every
              state, paused or playing. An explicit lift()/also() list is not media-filtered — the host may include a banner thumbnail that holds a video
     pz.set(on, tap)  on: glyph in, controls up and held while paused. Off with tap (the media tap that resumes): glyph out and the controls
                      fade straight away on the split screen's 320ms ease-out (no dwell: they are only up while paused). Off without
                      tap (a reset: another reel, leaving Reels, the IAB's close): both go at once
     pz.paused        the video the viewer paused (or null) · pz.lift: the overlay's lift now (px; for hit tests by position)
   A press on the track seeks and never reaches the host (VideoScrubber stops its events), so it does not toggle the video. */
(function(){
'use strict';
if(window.FMSSPause)return;
const CSS='.fmss-pz.fmss-pz{position:absolute;display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.28);opacity:0;transform:scale(.9);transition:opacity .2s ease,transform .2s ease;pointer-events:none}'+
  '.fmss-pz.fmss-pz.on{opacity:1;transform:none}'+
  '.fmss-pz.fmss-pz svg{width:30px;height:30px;margin-left:4px;opacity:.9}'+
  '.fmss-rc.fmss-rc{position:absolute;left:0;top:0;width:375px;height:812px;margin:0;pointer-events:none}';
const GLYPH='<svg viewBox="0 0 24 24"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.8l11-7.2c.6-.4.6-1.2 0-1.6l-11-7.2C7.9 3.5 7 4 7 4.8z" fill="#fff"/></svg>';
const BELOW=12,TRACK=4,ABOVE=20,LIFT=20;   // the track (4px; its 10px thumb not counted): 12px above the bar, 12px in from each side
                                          // (VideoScrubber's x 12, w 351), and 20px under the lowest lifted CTA / pill / caption
const RAIL='.r-ufi,.ufi,[data-reel=rail]';   // the action rail sits beside the track's right end, not over the CTA: not measured
const MEDIA='video,[data-media]';   // never lifted (nor anything that holds one)
const SEL='[data-reel=rail],[data-reel=details],[data-reel=more],[data-reel=cta],[data-reel=pill],.c-stack,.r-ufi';
function css(){if(document.getElementById('fmss-pz-css'))return;const s=document.createElement('style');s.id='fmss-pz-css';s.textContent=CSS;document.head.appendChild(s)}
const fn=x=>typeof x==='function'?x:()=>x;
function mount(el,o){
  css();el.classList.add('fmss-pz');el.setAttribute('aria-hidden','true');if(!el.querySelector('svg'))el.innerHTML=GLYPH;
  o=o||{};const vf=o.video?fn(o.video):null,at=o.at||null,map=new Map();let cur=null,held=null,lifted=0;
  if(at)at.classList.add('fmss-rc');
  function pieces(){let a,listed=!!o.lift;
    if(o.lift)a=[...(fn(o.lift)()||[])];else{const s=o.scope?fn(o.scope)():null;a=s?[...s.querySelectorAll(SEL)]:[]}
    if(o.also)a=a.concat([...(fn(o.also)()||[])]);
    /* scope auto-discovery never lifts media; an explicit lift/also list is the host's call (In-Content: the banner
       thumbnail .mv rides with the lifting .uiu band — same translate — even though it holds a <video>) */
    if(!listed)a=a.filter(e=>e&&!e.matches(MEDIA)&&!e.querySelector(MEDIA));
    else a=a.filter(e=>!!e);
    return a.filter(e=>!a.some(p=>p!==e&&p.contains(e)))}   // a piece inside another moves with it
  /* how far this reel's overlay rises: so its lowest CTA / pill / caption (the rail aside) ends ABOVE px over the track's top edge,
     measured on the pieces at rest (a piece whose box is larger than what it draws, e.g. a full-screen baked image, says where its
     drawing ends: data-ui-bottom, design px from its top); never down, LIFT if there is nothing to measure */
  function amount(els){if(!at)return LIFT;const a=at.getBoundingClientRect(),k=a.width/375;if(!k)return LIFT;let lo=-1;
    els.forEach(e=>{if(e.matches(RAIL))return;const b=e.getBoundingClientRect();if(!b.height)return;
      const ub=e.dataset&&e.dataset.uiBottom,sh=parseFloat((e.style.translate||'').split(' ')[1])||0;
      const y=(ub!=null?(b.top-a.top)/k+parseFloat(ub):(b.bottom-a.top)/k)-sh;if(y>lo)lo=y});
    return lo<0?LIFT:Math.max(0,Math.round(lo-(o.bar-BELOW-TRACK-ABOVE)))}
  function lift(r,op){const y=r.lift*op;if(r===cur)lifted=y;r.els.forEach(e=>{e.style.translate=op>0?'0 '+(-y).toFixed(2)+'px':''})}
  function ctl(v){if(!v||!at||!window.VideoScrubber||o.bar==null)return null;let r=map.get(v);if(r)return r;
    r={v,els:[],lift:LIFT};r.s=VideoScrubber.create({video:v,reel:true,trackY:o.bar-BELOW-TRACK/2,height:812,document:el.ownerDocument,onOpacity:op=>lift(r,op)});
    at.appendChild(r.s.el);map.set(v,r);return r}
  function show(r){if(cur&&cur!==r){const c=cur;cur=null;c.s.hide();lift(c,0)}if(cur!==r){cur=r;r.els=pieces();r.lift=amount(r.els)}}
  function drop(){if(!cur)return;const c=cur;c.s.hide();lift(c,0);cur=null;lifted=0}
  return {el,get on(){return el.classList.contains('on')},get paused(){return held},get lift(){return lifted},
    set(on,tap){on=!!on;el.classList.toggle('on',on);if(!vf)return;
      const v=vf();
      if(on){held=v||null;const r=ctl(v);if(r){show(r);r.s.hold(true)}return}
      held=null;const r=tap&&cur?ctl(v):null;if(r&&r===cur){r.s.release()}else drop()}};
}
window.FMSSPause={mount};
})();
