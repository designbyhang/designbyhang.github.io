/* light/dark toggle (initial theme is set by the inline head script before first paint) */
(()=>{const de=document.documentElement;
const svg='<svg class="i-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z"/></svg><svg class="i-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.8"/><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M3.05 12.95l1.13-1.13M11.82 4.18l1.13-1.13"/></svg>';
const foot=document.querySelector('footer.bot');
const b=document.createElement('button');b.type='button';b.className='theme-btn';b.innerHTML=svg;
const lab=()=>b.setAttribute('aria-label',de.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');lab();if(foot){foot.prepend(b);}else{b.classList.add('theme-float');document.body.appendChild(b);} /* home: footer left corner; project pages: fixed bottom-left */
/* easter-egg sparks: fixed overlay (no layout shift, never clipped), skipped under reduced motion */
const spark=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2,n=4+Math.floor(Math.random()*4),dark=de.dataset.theme==='dark',col=dark?'#ffe9a8':'#e3a008';
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,len=2+Math.random()*3,dist=3+Math.random()*5,e=document.createElement('i');e.setAttribute('aria-hidden','true');
    e.style.cssText=`position:fixed;left:${cx+Math.cos(a)*R}px;top:${cy+Math.sin(a)*R}px;width:${len}px;height:${1+Math.round(Math.random())}px;background:${col};border-radius:1px;pointer-events:none;z-index:61;transform-origin:0 50%;box-shadow:0 0 2px ${col};transition:none!important`;
    document.body.appendChild(e);const rot=a*180/Math.PI;e.animate([{transform:`rotate(${rot}deg) translateX(0)`,opacity:1},{transform:`rotate(${rot}deg) translateX(${dist}px)`,opacity:0}],{duration:250+Math.random()*150,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>e.remove();}
  b.animate([{opacity:1},{opacity:.35,offset:.3},{opacity:1}],{duration:160});};
/* home project covers: the left text panel is baked into the cover image, so dark mode swaps to a -dark variant (panel #1a1a1a, text #f2f2f2; cover art untouched) */
const covers=()=>document.querySelectorAll('.proj img[src*="assets/cover-"]').forEach(im=>{const l=im.dataset.light||(im.dataset.light=im.getAttribute('src').replace('-dark.webp','.webp'));im.setAttribute('src',de.dataset.theme==='dark'?l.replace('.webp','-dark.webp'):l);});covers();
b.addEventListener('click',()=>{const t=de.dataset.theme==='dark'?'light':'dark';de.classList.add('theme-anim');de.dataset.theme=t;covers();try{localStorage.setItem('dbh-theme',t);}catch(e){}lab();
  {const k=window.dbhSfx?(window.dbhSfx.toggle?window.dbhSfx.toggle():(window.dbhSfx.tap(),'tap')):'none';window.__lastToggleSound=k;if(k==='zap')spark();}setTimeout(()=>de.classList.remove('theme-anim'),350);dispatchEvent(new Event('resize'));});
})();
