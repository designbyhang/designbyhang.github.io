/* light/dark toggle (initial theme is set by the inline head script before first paint) */
(()=>{const de=document.documentElement;
const svg='<svg class="i-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M14.2 10.1A6.6 6.6 0 0 1 5.9 1.8 6.6 6.6 0 1 0 14.2 10.1z"/></svg><svg class="i-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.3"/><line x1="8.00" y1="2.40" x2="8.00" y2="1.30"/><line x1="12.85" y1="5.20" x2="13.80" y2="4.65"/><line x1="12.85" y1="10.80" x2="13.80" y2="11.35"/><line x1="8.00" y1="13.60" x2="8.00" y2="14.70"/><line x1="3.15" y1="10.80" x2="2.20" y2="11.35"/><line x1="3.15" y1="5.20" x2="2.20" y2="4.65"/></svg>';
const foot=document.querySelector('footer.bot');
const b=document.createElement('button');b.type='button';b.className='theme-btn';b.innerHTML=svg;
const lab=()=>b.setAttribute('aria-label',de.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');lab();if(foot){foot.prepend(b);}else{b.classList.add('theme-float');document.body.appendChild(b);} /* home: footer left corner; project pages: fixed bottom-left */
/* easter-egg sparks: fixed overlay (no layout shift, never clipped), skipped under reduced motion */
const spark=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2,n=4+Math.floor(Math.random()*4),dark=de.dataset.theme==='dark',col=dark?'#ffe9a8':'#e3a008';
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,len=2+Math.random()*3,dist=3+Math.random()*5,e=document.createElement('i');e.setAttribute('aria-hidden','true');
    e.style.cssText=`position:fixed;left:${cx+Math.cos(a)*R}px;top:${cy+Math.sin(a)*R}px;width:${len}px;height:${1+Math.round(Math.random())}px;background:${col};border-radius:1px;pointer-events:none;z-index:61;transform-origin:0 50%;box-shadow:0 0 2px ${col};transition:none!important`;
    document.body.appendChild(e);const rot=a*180/Math.PI;e.animate([{transform:`rotate(${rot}deg) translateX(0)`,opacity:1},{transform:`rotate(${rot}deg) translateX(${dist}px)`,opacity:0}],{duration:250+Math.random()*150,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>e.remove();}
  b.animate([{opacity:1},{opacity:.35,offset:.3},{opacity:1}],{duration:160});};
b.addEventListener('click',()=>{const t=de.dataset.theme==='dark'?'light':'dark';de.classList.add('theme-anim');de.dataset.theme=t;try{localStorage.setItem('dbh-theme',t);}catch(e){}lab();
  {const k=window.dbhSfx?(window.dbhSfx.toggle?window.dbhSfx.toggle():(window.dbhSfx.tap(),'tap')):'none';window.__lastToggleSound=k;if(k==='zap')spark();}setTimeout(()=>de.classList.remove('theme-anim'),350);dispatchEvent(new Event('resize'));});
})();
