/* light/dark toggle (initial theme is set by the inline head script before first paint) */
(()=>{const de=document.documentElement;
const svg='<svg class="i-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M14.4 10.2A6.7 6.7 0 0 1 5.8 1.6 6.7 6.7 0 1 0 14.4 10.2z"/></svg><svg class="i-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.5"/><rect x="7.15" y="0.6" width="1.7" height="2.6" rx="0.85" transform="rotate(0 8 8)"/><rect x="7.15" y="0.6" width="1.7" height="2.6" rx="0.85" transform="rotate(60 8 8)"/><rect x="7.15" y="0.6" width="1.7" height="2.6" rx="0.85" transform="rotate(120 8 8)"/><rect x="7.15" y="0.6" width="1.7" height="2.6" rx="0.85" transform="rotate(180 8 8)"/><rect x="7.15" y="0.6" width="1.7" height="2.6" rx="0.85" transform="rotate(240 8 8)"/><rect x="7.15" y="0.6" width="1.7" height="2.6" rx="0.85" transform="rotate(300 8 8)"/></svg>';
const foot=document.querySelector('footer.bot');
const b=document.createElement('button');b.type='button';b.className='theme-btn';b.innerHTML=svg;
const lab=()=>b.setAttribute('aria-label',de.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');lab();const port=matchMedia('(max-width:640px),(orientation:portrait) and (max-width:1024px)');
const place=()=>{const f=!foot||port.matches;b.classList.toggle('theme-float',f);if(f){if(b.parentNode!==document.body)document.body.appendChild(b);}else foot.prepend(b);};place();port.addEventListener('change',place); /* home desktop/landscape: footer left corner; project pages + home portrait: fixed bottom-left float */
/* easter-egg sparks: fixed overlay (no layout shift, never clipped), skipped under reduced motion */
const spark=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2,n=4+Math.floor(Math.random()*4),dark=de.dataset.theme==='dark',col=dark?'#ffe9a8':'#e3a008';
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,len=2+Math.random()*3,dist=3+Math.random()*5,e=document.createElement('i');e.setAttribute('aria-hidden','true');
    e.style.cssText=`position:fixed;left:${cx+Math.cos(a)*R}px;top:${cy+Math.sin(a)*R}px;width:${len}px;height:${1+Math.round(Math.random())}px;background:${col};border-radius:1px;pointer-events:none;z-index:61;transform-origin:0 50%;box-shadow:0 0 2px ${col};transition:none!important`;
    document.body.appendChild(e);const rot=a*180/Math.PI;e.animate([{transform:`rotate(${rot}deg) translateX(0)`,opacity:1},{transform:`rotate(${rot}deg) translateX(${dist}px)`,opacity:0}],{duration:250+Math.random()*150,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>e.remove();}
  b.animate([{opacity:1},{opacity:.35,offset:.3},{opacity:1}],{duration:160});};
/* home project covers: the left text panel is baked into the cover image, so dark mode swaps to a -dark variant (panel #1a1a1a, text #f2f2f2; cover art untouched) */
const covers=()=>document.querySelectorAll('.proj img[src*="assets/cover-"],.hero-slot img[src*="assets/cover-"]').forEach(im=>{const l=im.dataset.light||(im.dataset.light=im.getAttribute('src').replace('-dark.webp','.webp'));im.setAttribute('src',de.dataset.theme==='dark'?l.replace('.webp','-dark.webp'):l);});covers();
b.addEventListener('click',()=>{const t=de.dataset.theme==='dark'?'light':'dark';de.classList.add('theme-anim');de.dataset.theme=t;covers();try{localStorage.setItem('dbh-theme',t);}catch(e){}lab();
  {const k=window.dbhSfx?(window.dbhSfx.toggle?window.dbhSfx.toggle():(window.dbhSfx.tap(),'tap')):'none';window.__lastToggleSound=k;if(k==='zap')spark();}setTimeout(()=>de.classList.remove('theme-anim'),350);dispatchEvent(new Event('resize'));});
})();

/* On touch devices, open LinkedIn in the same tab so iOS/Android hand off to the app. Desktop keeps the new-tab web link. */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="linkedin.com"]');if(a&&matchMedia('(pointer:coarse)').matches)a.removeAttribute('target');},true);
(()=>{const d=document.documentElement;let last='';const s=()=>{const dk=d.dataset.theme==='dark',fs=d.classList.contains('deck-lock'),c=fs?(dk?'#222222':'#f4f4f4'):(dk?'#111111':'#ededed');if(c+fs===last)return;last=c+fs;
  document.querySelectorAll('meta[name="theme-color"]').forEach(x=>x.remove());const m=document.createElement('meta');m.name='theme-color';m.content=c;document.head.appendChild(m);d.style.backgroundColor=c;if(document.body)document.body.style.backgroundColor=fs?c:'';clearTimeout(s.t);s.t=setTimeout(re,420);};
  /* toggle cross-fades backgrounds for .3s: swap the meta again once settled so browsers that sample page colours re-read the final ones */
  const re=()=>{const m=document.querySelector('meta[name="theme-color"]');if(!m)return;const n=m.cloneNode();m.replaceWith(n);};
  s();new MutationObserver(s).observe(d,{attributes:true,attributeFilter:['data-theme','class']});})(); /* html.deck-lock = Studio presentation fullscreen: bars + html/body take the stage colour (#f4f4f4 / #222222), restored on close */ /* Safari top bar: replace the meta (iOS ignores content edits) and set html bg directly so it switches with the toggle */
