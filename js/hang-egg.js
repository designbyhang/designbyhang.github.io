/* HANG easter egg: click (or Enter/Space on) the homepage copyright line to open a full-viewport layer in the page colour with the
   HANG letter animation (js/hang-cube.js, loaded on the first open only, same ?v= as this file). Closes only on CLOSE (the Studio presentation's
   top-right "× CLOSE", same markup/classes; click/tap, Enter or Space) or Esc; clicks elsewhere on the layer do nothing; the animation loop and its observers are destroyed on close. Colours come from the site tokens
   (--page/--ink) and follow the light/dark toggle live. prefers-reduced-motion: no fades and a static, fully formed H. */
(()=>{const trg=document.querySelector('footer.bot>span');if(!trg)return;
const me=document.currentScript,q=me&&me.src.indexOf('?')>0?me.src.slice(me.src.indexOf('?')):'',src=new URL('hang-cube.js'+q,me?me.src:location.href).href;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
trg.classList.add('hegg-trg');trg.tabIndex=0;trg.setAttribute('role','button');trg.setAttribute('aria-haspopup','dialog');trg.setAttribute('aria-label',trg.textContent.trim()+': play the HANG animation');
let load=null,ov=null,cube=null,ret=null;
/* iOS Safari bars, as the Studio presentation (projects/studio-present.js lock/unlock + js/theme.js): while open the viewport gets
   viewport-fit=cover so the layer runs under the status bar / toolbar; theme.js already keeps theme-color + html/body = --page (= the
   layer colour) and follows the toggle; Safari re-reads its bar tint on scroll only, so re-sample (theme.js's 1px nudge) once the layer
   has faded in and again after it has gone. Restored on close. */
const vpm=document.querySelector('meta[name=viewport]'),vp0=vpm&&vpm.content,resample=()=>{if(window.__dbhResample)window.__dbhResample();};
const lock=()=>{if(vpm&&!/viewport-fit/.test(vp0))vpm.content=vp0+', viewport-fit=cover';},unlock=()=>{if(vpm)vpm.content=vp0;};
const lib=()=>window.HangCube?Promise.resolve():load||(load=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=()=>{load=null;no();};document.head.appendChild(s);}));
const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key==='Tab'){e.preventDefault();ov.querySelector('.hegg-x').focus();return;}
  if(e.key===' '&&e.target.closest&&e.target.closest('.hegg-x')){e.preventDefault();e.stopPropagation();close();return;} /* Space on CLOSE (a link: Enter clicks it natively) */
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(e.key)){e.preventDefault();e.stopPropagation();}}; /* page behind stays put */
function open(){if(ov)return;ret=document.activeElement;
  const o=ov=document.createElement('div');o.className='hegg';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','HANG');
  o.innerHTML='<div class="hegg-stage" role="img" aria-label="The letters H, A, N, G drawn and turning in a loop"></div><div class="bar hegg-bar"><nav class="bar-right" aria-label="HANG"><a class="ax hegg-x" href="#" role="button" aria-label="Close"><span class="arr arr-back" aria-hidden="true"><svg viewBox="0 0 20 16" fill="none"><path d="M2 0L18 16M18 0L2 16"/></svg></span><span class="t">CLOSE</span></a></nav></div>';
  o.querySelector('.hegg-x').addEventListener('click',e=>{e.preventDefault();close();});
  o.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
  document.body.appendChild(o);lock();
  document.addEventListener('keydown',keys,true);o.querySelector('.hegg-x').focus({preventScroll:true});
  if(reduce.matches){o.classList.add('on');requestAnimationFrame(resample);}else requestAnimationFrame(()=>requestAnimationFrame(()=>{o.classList.add('on');setTimeout(()=>{if(ov===o)resample();},320);}));
  lib().then(()=>{if(ov===o&&!cube)cube=window.HangCube.mount(o.querySelector('.hegg-stage'));},()=>{if(ov===o)close();});}
function close(){if(!ov)return;const o=ov,c=cube;ov=cube=null;document.removeEventListener('keydown',keys,true);
  const fin=()=>{if(c)c.destroy();o.remove();if(!ov){unlock();resample();}};o.classList.remove('on');if(reduce.matches)fin();else setTimeout(fin,300);
  if(ret&&ret.focus&&document.contains(ret))ret.focus({preventScroll:true});else trg.focus({preventScroll:true});}
trg.addEventListener('click',open);
trg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
window.dbhEgg={open,close,get cube(){return cube;}};
})();
