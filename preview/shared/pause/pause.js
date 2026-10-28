/* FMSS shared tap-to-pause affordance: the quiet play glyph a reel shows while the viewer has paused it (moved out of
   Caption & Browse and Profile & Browse, now also VAC's prototype, so every reel pauses the same way).
   A 64pt circle, black at 28%, with a 30pt play glyph nudged 4pt right; hidden at opacity 0 and scale .9, in over 200ms (opacity + scale).
   The host owns where it sits (left/top/z-index on its own element) and when the reel is paused:
     const pz=FMSSPause.mount(el);   el = an empty absolutely placed element in the host's screen
     pz.set(on)                      show / hide (toggles .on) · pz.on (state) · pz.el */
(function(){
'use strict';
const CSS='.fmss-pz.fmss-pz{position:absolute;display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.28);opacity:0;transform:scale(.9);transition:opacity .2s ease,transform .2s ease;pointer-events:none}'+
  '.fmss-pz.fmss-pz.on{opacity:1;transform:none}'+
  '.fmss-pz.fmss-pz svg{width:30px;height:30px;margin-left:4px;opacity:.9}';
const GLYPH='<svg viewBox="0 0 24 24"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.8l11-7.2c.6-.4.6-1.2 0-1.6l-11-7.2C7.9 3.5 7 4 7 4.8z" fill="#fff"/></svg>';
function css(){if(document.getElementById('fmss-pz-css'))return;const s=document.createElement('style');s.id='fmss-pz-css';s.textContent=CSS;document.head.appendChild(s)}
function mount(el){
  css();el.classList.add('fmss-pz');el.setAttribute('aria-hidden','true');if(!el.querySelector('svg'))el.innerHTML=GLYPH;
  return {el,get on(){return el.classList.contains('on')},set(on){el.classList.toggle('on',!!on)}};
}
window.FMSSPause={mount};
})();
