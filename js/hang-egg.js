/* HANG easter egg: click (or Enter/Space on) the homepage copyright line to open a full-viewport layer in the page colour with the
   HANG letter animation (js/hang-cube.js, loaded on the first open only, same ?v= as this file). Closes only on CLOSE (the Studio presentation's
   top-right "× CLOSE", same markup/classes; click/tap, Enter or Space) or Esc; clicks elsewhere on the layer do nothing; the animation loop and its observers are destroyed on close. Colours come from the site tokens
   (--page/--ink) and follow the light/dark toggle live. prefers-reduced-motion: no fades and a static, fully formed H. */
(()=>{const trg=document.querySelector('footer.bot>span');if(!trg)return;
const me=document.currentScript,q=me&&me.src.indexOf('?')>0?me.src.slice(me.src.indexOf('?')):'',src=new URL('hang-cube.js'+q,me?me.src:location.href).href;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
trg.classList.add('hegg-trg');trg.tabIndex=0;trg.setAttribute('role','button');trg.setAttribute('aria-haspopup','dialog');trg.setAttribute('aria-label',trg.textContent.trim()+': play the HANG animation');
let load=null,ov=null,cube=null,ret=null;
/* iOS Safari bars, as the Studio presentation (projects/studio-present.js lock/unlock/flow/adoptToggle + js/theme.js): viewport-fit=cover
   while open; once faded in, html.hegg-flow makes the layer the document (css/hang-egg.css) at scroll 0, restored on close; the theme
   toggle joins the layer; theme.js keeps theme-color + html/body = --page and re-samples on toggles (also on the next frame while
   html.hegg-flow is set); re-sample after entering the flow and after closing. */
const de=document.documentElement,vpm=document.querySelector('meta[name=viewport]'),vp0=vpm&&vpm.content,resample=()=>{if(window.__dbhResample)window.__dbhResample();};
let flowY=null;const flow=on=>{if(on){if(flowY!==null)return;flowY=scrollY;de.classList.add('hegg-flow');scrollTo({top:0,left:0,behavior:'instant'});resample();}
  else{if(flowY===null)return;const y=flowY;flowY=null;de.classList.remove('hegg-flow');scrollTo({top:y,left:0,behavior:'instant'});}};
let tb=null,tbHome=null,tbNext=null;
const adoptToggle=o=>{const b=document.querySelector('.theme-btn');if(!b)return;tb=b;tbHome=b.parentNode;tbNext=b.nextSibling;o.appendChild(b);},
 releaseToggle=()=>{if(!tb)return;const b=tb;tb=null;if(tbNext&&tbNext.parentNode===tbHome)tbHome.insertBefore(b,tbNext);else tbHome.appendChild(b);};
const lock=()=>{if(vpm&&!/viewport-fit/.test(vp0))vpm.content=vp0+', viewport-fit=cover';de.classList.add('hegg-open');},unlock=()=>{de.classList.remove('hegg-open');if(vpm)vpm.content=vp0;};
const lib=()=>window.HangCube?Promise.resolve():load||(load=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=()=>{load=null;no();};document.head.appendChild(s);}));
const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key==='Tab'){e.preventDefault();const f=[ov.querySelector('.hegg-x'),ov.querySelector('.theme-btn')].filter(e=>e&&e.getClientRects().length),i=f.indexOf(document.activeElement);f[(i+(e.shiftKey?f.length-1:1))%f.length].focus();return;}
  if(e.key===' '&&e.target.closest&&e.target.closest('.hegg-x')){e.preventDefault();e.stopPropagation();close();return;} /* Space on CLOSE (a link: Enter clicks it natively) */
  if(e.key===' '&&e.target.closest&&e.target.closest('.theme-btn'))return; /* Space on the toggle (it joins the layer) */
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(e.key)){e.preventDefault();e.stopPropagation();}}; /* page behind stays put */
function open(){if(ov)return;ret=document.activeElement;
  const o=ov=document.createElement('div');o.className='hegg';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','HANG');
  o.innerHTML='<i class="hegg-edge hegg-edge-t" aria-hidden="true"></i><i class="hegg-edge hegg-edge-b" aria-hidden="true"></i><div class="hegg-stage" role="img" aria-label="The letters H, A, N, G drawn and turning in a loop"></div><div class="bar hegg-bar"><nav class="bar-right" aria-label="HANG"><a class="ax hegg-x" href="#" role="button" aria-label="Close"><span class="arr arr-back" aria-hidden="true"><svg viewBox="0 0 20 16" fill="none"><path d="M2 0L18 16M18 0L2 16"/></svg></span><span class="t">CLOSE</span></a></nav></div>';
  o.querySelector('.hegg-x').addEventListener('click',e=>{e.preventDefault();close();});
  o.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
  document.body.appendChild(o);lock();adoptToggle(o);
  document.addEventListener('keydown',keys,true);o.querySelector('.hegg-x').focus({preventScroll:true});
  if(reduce.matches){o.classList.add('on');flow(true);}else requestAnimationFrame(()=>requestAnimationFrame(()=>{o.classList.add('on');setTimeout(()=>{if(ov===o)flow(true);},320);}));
  lib().then(()=>{if(ov===o&&!cube)cube=window.HangCube.mount(o.querySelector('.hegg-stage'));},()=>{if(ov===o)close();});}
function close(){if(!ov)return;const o=ov,c=cube;ov=cube=null;document.removeEventListener('keydown',keys,true);flow(false);
  const fin=()=>{if(c)c.destroy();if(!ov){releaseToggle();unlock();}o.remove();if(!ov)resample();};o.classList.remove('on');if(reduce.matches)fin();else setTimeout(fin,300);
  if(ret&&ret.focus&&document.contains(ret))ret.focus({preventScroll:true});else trg.focus({preventScroll:true});}
trg.addEventListener('click',open);
trg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
window.dbhEgg={open,close,get cube(){return cube;}};
})();
