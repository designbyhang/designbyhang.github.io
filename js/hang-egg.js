/* HANG easter egg: click (or Enter/Space on) the homepage copyright line to open a full-viewport layer in the page colour with the
   HANG letter animation (js/hang-cube.js, loaded on the first open only, same ?v= as this file). Closes on the close button, Esc or a
   click outside the 480px container; the animation loop and its observers are destroyed on close. Colours come from the site tokens
   (--page/--ink) and follow the light/dark toggle live. prefers-reduced-motion: no fades and a static, fully formed H. */
(()=>{const trg=document.querySelector('footer.bot>span');if(!trg)return;
const me=document.currentScript,q=me&&me.src.indexOf('?')>0?me.src.slice(me.src.indexOf('?')):'',src=new URL('hang-cube.js'+q,me?me.src:location.href).href;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
trg.classList.add('hegg-trg');trg.tabIndex=0;trg.setAttribute('role','button');trg.setAttribute('aria-haspopup','dialog');trg.setAttribute('aria-label',trg.textContent.trim()+': play the HANG animation');
let load=null,ov=null,cube=null,ret=null;
const lib=()=>window.HangCube?Promise.resolve():load||(load=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=()=>{load=null;no();};document.head.appendChild(s);}));
const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key==='Tab'){e.preventDefault();ov.querySelector('.hegg-x').focus();return;}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(e.key)&&!(e.key===' '&&e.target.closest&&e.target.closest('button'))){e.preventDefault();e.stopPropagation();}}; /* page behind stays put */
function open(){if(ov)return;ret=document.activeElement;
  const o=ov=document.createElement('div');o.className='hegg';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','HANG');
  o.innerHTML='<div class="hegg-stage" role="img" aria-label="The letters H, A, N, G drawn and turning in a loop"></div><button type="button" class="hegg-x" aria-label="Close"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg></button>';
  o.querySelector('.hegg-x').addEventListener('click',close);
  o.addEventListener('click',e=>{if(!e.target.closest('.hegg-stage'))close();});
  o.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
  document.body.appendChild(o);o.querySelector('.hegg-stage').appendChild(o.querySelector('.hegg-x'));
  document.addEventListener('keydown',keys,true);o.querySelector('.hegg-x').focus({preventScroll:true});
  if(reduce.matches)o.classList.add('on');else requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.add('on')));
  lib().then(()=>{if(ov===o&&!cube)cube=window.HangCube.mount(o.querySelector('.hegg-stage'));},()=>{if(ov===o)close();});}
function close(){if(!ov)return;const o=ov,c=cube;ov=cube=null;document.removeEventListener('keydown',keys,true);
  const fin=()=>{if(c)c.destroy();o.remove();};o.classList.remove('on');if(reduce.matches)fin();else setTimeout(fin,300);
  if(ret&&ret.focus&&document.contains(ret))ret.focus({preventScroll:true});else trg.focus({preventScroll:true});}
trg.addEventListener('click',open);
trg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
window.dbhEgg={open,close,get cube(){return cube;}};
})();
